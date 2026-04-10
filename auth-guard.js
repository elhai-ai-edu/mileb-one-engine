window.MiledAccess = (() => {
  const SESSION_KEY = "miled_auth";
  const PREVIEW_ROLE_KEY = "miled_preview_role";

  function getStoredSession() {
    try {
      return JSON.parse(sessionStorage.getItem(SESSION_KEY) || "null");
    } catch {
      return null;
    }
  }

  function clearStoredSession() {
    [SESSION_KEY, "faculty_auth", "facultyId", "facultyName", "facultyRole",
     "institutionRole", "cockpit_token", "cockpit_user", "inst_auth", PREVIEW_ROLE_KEY
    ].forEach((key) => sessionStorage.removeItem(key));
  }

  function getPreviewRole() {
    return String(sessionStorage.getItem(PREVIEW_ROLE_KEY) || "").trim().toLowerCase();
  }

  function setPreviewRole(role) {
    const value = String(role || "").trim().toLowerCase();
    if (!value) {
      sessionStorage.removeItem(PREVIEW_ROLE_KEY);
      return;
    }
    sessionStorage.setItem(PREVIEW_ROLE_KEY, value);
  }

  function clearPreviewRole() {
    sessionStorage.removeItem(PREVIEW_ROLE_KEY);
  }

  async function signOutAndRedirect(redirectTo = "/index.html") {
    try {
      if (window.firebase?.auth) {
        if (!firebase.apps.length && window.MILED_FIREBASE_CONFIG) {
          firebase.initializeApp(window.MILED_FIREBASE_CONFIG);
        }
        if (window.firebase?.apps?.length) {
          await firebase.auth().signOut().catch(() => {});
        }
      }
    } catch {}

    clearStoredSession();
    window.location.replace(redirectTo);
  }

  function normalizeRole(rawRole) {
    const role = String(rawRole || "").trim().toLowerCase();
    if (role === "student") return "student";
    if (["faculty", "lecturer"].includes(role)) return "lecturer";
    if (["institution", "institution_admin"].includes(role)) return "institution_admin";
    if (["superadmin", "system_admin"].includes(role)) return "system_admin";
    return "";
  }

  function toLegacyRole(canonicalRole) {
    if (canonicalRole === "lecturer") return "faculty";
    if (canonicalRole === "institution_admin") return "institution";
    if (canonicalRole === "system_admin") return "superadmin";
    return "student";
  }

  function emailToKey(email) {
    return String(email || "").toLowerCase().replace(/\./g, "_").replace(/@/g, "_at_");
  }

  function domainFromEmail(email) {
    const value = String(email || "").toLowerCase();
    const parts = value.split("@");
    return parts.length > 1 ? parts[1] : "";
  }

  function dbUrl() {
    return window.MILED_FIREBASE_CONFIG?.databaseURL || "";
  }

  async function readDb(path, idToken) {
    const root = dbUrl();
    if (!root || !idToken) return null;
    const trimmedPath = String(path || "").replace(/^\/+/, "").replace(/\.json$/, "");
    const sep = root.includes("?") ? "&" : "?";
    const url = `${root}/${trimmedPath}.json${sep}auth=${encodeURIComponent(idToken)}`;
    const response = await fetch(url);
    if (!response.ok) return null;
    return response.json();
  }

  function isEmailListed(node, email) {
    if (!node || !email) return false;
    const target = String(email || "").toLowerCase();

    if (Array.isArray(node)) {
      return node.some((item) => {
        if (!item) return false;
        if (typeof item === "string") return item.toLowerCase() === target;
        return String(item.email || "").toLowerCase() === target;
      });
    }

    if (typeof node !== "object") return false;

    if (node[emailToKey(target)] === true) return true;
    if (typeof node[emailToKey(target)] === "object") return true;

    return Object.values(node).some((entry) => {
      if (!entry) return false;
      if (typeof entry === "string") return entry.toLowerCase() === target;
      if (entry === true) return false;
      return String(entry.email || "").toLowerCase() === target;
    });
  }

  function isDomainAuthorized(institutionsNode, emailDomain) {
    if (!institutionsNode || !emailDomain || typeof institutionsNode !== "object") return false;
    const target = String(emailDomain || "").toLowerCase();
    return Object.entries(institutionsNode).some(([key, value]) => {
      const domainFromKey = String(key || "").replace(/_/g, ".").toLowerCase();
      const domainFromValue = String(value?.domain || "").toLowerCase();
      return domainFromKey === target || domainFromValue === target;
    });
  }

  function getCurrentFirebaseUser() {
    try {
      return window.firebase?.apps?.length ? firebase.auth().currentUser : null;
    } catch {
      return null;
    }
  }

  function getSessionUser() {
    const sessionUser = getStoredSession();
    if (!sessionUser) return null;
    const canonicalRole = normalizeRole(sessionUser.canonicalRole || sessionUser.role);
    if (!canonicalRole) return null;
    return {
      ...sessionUser,
      role: sessionUser.role || toLegacyRole(canonicalRole),
      canonicalRole
    };
  }

  function buildSessionUser(authUser, canonicalRole, institutionId) {
    if (!authUser || !canonicalRole) return null;
    return {
      uid: authUser.uid,
      email: authUser.email || "",
      displayName: authUser.displayName || authUser.email || "",
      photoURL: authUser.photoURL || "",
      role: toLegacyRole(canonicalRole),
      canonicalRole,
      institutionId: institutionId || null
    };
  }

  function buildStoredSessionContext() {
    const sessionUser = getSessionUser();
    const canonicalRole = sessionUser?.canonicalRole || "";
    if (!sessionUser || !canonicalRole) return null;

    return {
      authenticated: true,
      authorized: true,
      canonicalRole,
      email: String(sessionUser.email || "").toLowerCase(),
      authUser: null,
      institutionId: sessionUser.institutionId || null,
      reason: "session_fallback"
    };
  }

  function isPrivilegedRole(canonicalRole) {
    return ["lecturer", "institution_admin", "system_admin"].includes(String(canonicalRole || ""));
  }

  function isStudentPreviewEnabled(canonicalRole) {
    return getPreviewRole() === "student" && isPrivilegedRole(canonicalRole);
  }

  function getRoleHome(canonicalRole) {
    if (canonicalRole === "lecturer") return "/lecturer_hub.html";
    if (canonicalRole === "institution_admin") return "/institution_dashboard.html";
    if (canonicalRole === "system_admin") return "/admin_cockpit.html";
    return "/index.html";
  }

  async function waitForFirebaseUser(timeoutMs = 1800) {
    const current = getCurrentFirebaseUser();
    if (current) return current;

    if (!window.firebase?.apps?.length || !firebase.auth) return null;

    return new Promise((resolve) => {
      let finished = false;
      const timer = setTimeout(() => {
        if (finished) return;
        finished = true;
        try { unsubscribe(); } catch {}
        resolve(getCurrentFirebaseUser());
      }, timeoutMs);

      const unsubscribe = firebase.auth().onAuthStateChanged((user) => {
        if (finished) return;
        finished = true;
        clearTimeout(timer);
        try { unsubscribe(); } catch {}
        resolve(user || null);
      });
    });
  }

  function persistSession(authUser, canonicalRole, institutionId) {
    if (!authUser || !canonicalRole) return;

    const sessionUser = buildSessionUser(authUser, canonicalRole, institutionId);
    if (!sessionUser) return;

    sessionStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));

    if (["lecturer", "institution_admin", "system_admin"].includes(canonicalRole)) {
      sessionStorage.setItem("faculty_auth", "true");
      sessionStorage.setItem("facultyId", authUser.uid);
      sessionStorage.setItem("facultyName", sessionUser.displayName);
      sessionStorage.setItem("facultyRole", sessionUser.role);
    } else {
      ["faculty_auth", "facultyId", "facultyName", "facultyRole"].forEach((k) => sessionStorage.removeItem(k));
    }

    if (canonicalRole === "system_admin") {
      sessionStorage.setItem("institutionRole", "admin");
      sessionStorage.setItem("cockpit_token", "gauth_" + authUser.uid);
      sessionStorage.setItem("cockpit_user", JSON.stringify({
        id: authUser.uid,
        name: sessionUser.displayName,
        role: "superadmin"
      }));
    }
  }

  async function resolveAccess() {
    const storedContext = buildStoredSessionContext();
    if (storedContext) return storedContext;

    if (!window.MILED_FIREBASE_CONFIG || !window.firebase) {
      return {
        authenticated: false,
        authorized: false,
        canonicalRole: "",
        reason: "firebase_not_ready"
      };
    }

    if (!firebase.apps.length) {
      firebase.initializeApp(window.MILED_FIREBASE_CONFIG);
    }

    const authUser = await waitForFirebaseUser();
    if (!authUser) {
      return {
        authenticated: false,
        authorized: false,
        canonicalRole: "",
        reason: "no_auth_user"
      };
    }

    const email = String(authUser.email || "").toLowerCase();
    const emailKey = emailToKey(email);
    const emailDomain = domainFromEmail(email);

    let idToken = "";
    try {
      idToken = await authUser.getIdToken();
    } catch {
      return {
        authenticated: true,
        authorized: false,
        canonicalRole: "",
        email,
        authUser,
        reason: "token_unavailable"
      };
    }

    const [
      institutions,
      studentWhitelist,
      lecturerWhitelist,
      userRoleFromUsersNode,
      authorizedUserNode
    ] = await Promise.all([
      readDb("institutions", idToken),
      readDb("whitelists/students", idToken),
      readDb("whitelists/lecturers", idToken),
      readDb(`users/${authUser.uid}/role`, idToken),
      readDb(`authorized_users/${emailKey}`, idToken)
    ]);

    const inStudentWhitelist = isEmailListed(studentWhitelist, email);
    const inLecturerWhitelist = isEmailListed(lecturerWhitelist, email);
    const domainAuthorized = isDomainAuthorized(institutions, emailDomain);

    const usersNodeRole = normalizeRole(
      typeof userRoleFromUsersNode === "string"
        ? userRoleFromUsersNode
        : userRoleFromUsersNode?.role
    );
    const authorizedUserRole = normalizeRole(authorizedUserNode?.role);

    const canonicalRole =
      usersNodeRole ||
      authorizedUserRole ||
      (inLecturerWhitelist ? "lecturer" : "") ||
      ((inStudentWhitelist || domainAuthorized) ? "student" : "");

    const authorized = Boolean(canonicalRole);

    return {
      authenticated: true,
      authorized,
      canonicalRole,
      email,
      authUser,
      inStudentWhitelist,
      inLecturerWhitelist,
      domainAuthorized,
      institutionId: authorizedUserNode?.institutionId || null,
      reason: authorized ? "ok" : "blocked"
    };
  }

  function hasRequiredRole(canonicalRole, requiredRoles) {
    if (!Array.isArray(requiredRoles) || !requiredRoles.length) return true;
    if (requiredRoles.includes("student") && isStudentPreviewEnabled(canonicalRole)) return true;
    return requiredRoles.includes(canonicalRole);
  }

  async function enforcePageAccess(requiredRoles, redirectTo = "/index.html") {
    document.documentElement.style.visibility = "hidden";
    const context = await resolveAccess();

    if (!context.authenticated || !context.authorized) {
      window.location.replace(redirectTo);
      return { ok: false, ...context };
    }

    if (!hasRequiredRole(context.canonicalRole, requiredRoles || [])) {
      window.location.replace(redirectTo);
      return { ok: false, ...context, reason: "role_mismatch" };
    }

    if (context.authUser) {
      persistSession(context.authUser, context.canonicalRole, context.institutionId);
    }
    document.documentElement.style.visibility = "";
    return { ok: true, ...context };
  }

  return {
    getSessionUser,
    buildSessionUser,
    clearSession: clearStoredSession,
    signOutAndRedirect,
    normalizeRole,
    resolveAccess,
    enforcePageAccess,
    persistSession,
    getRoleHome,
    getPreviewRole,
    setPreviewRole,
    clearPreviewRole,
    isStudentPreviewEnabled
  };
})();
