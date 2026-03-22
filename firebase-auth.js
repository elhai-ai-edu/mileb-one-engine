// ─── MilEd.One — Firebase Auth Utility (v7.0) ───
// Requires (loaded before this file):
//   https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js
//   https://www.gstatic.com/firebasejs/10.7.1/firebase-auth-compat.js
//   /firebase-init.js  →  window.MILED_FIREBASE_CONFIG
//
// Exposes: window.MiledAuth
//   .signInWithGoogle()   → Google popup → fetch role → store session
//   .signOut()            → Firebase signOut + clear session + redirect to /
//   .getUser()            → { uid, email, displayName, photoURL, role } | null
//   .hasRole(required)    → boolean — uses role hierarchy
//   .guard(required)      → redirect to / if not authorized; returns bool
//   .renderUserBadge(id)  → inject avatar + name + role chip + logout into element

window.MiledAuth = (() => {
  const SESSION_KEY = "miled_auth";
  const LEVEL = { student: 0, faculty: 1, institution: 2, superadmin: 3 };

  // ─── Session helpers ───
  function setSession(user) {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
    // Legacy compatibility — existing pages check these flags
    if ((LEVEL[user.role] || 0) >= LEVEL.faculty) {
      sessionStorage.setItem("faculty_auth", "true");
      sessionStorage.setItem("facultyId",    user.uid);
      sessionStorage.setItem("facultyName",  user.displayName || user.email);
      sessionStorage.setItem("facultyRole",  user.role);
    }
    if (user.role === "superadmin") {
      sessionStorage.setItem("institutionRole", "admin");
      // cockpit.html and admin_cockpit.html check cockpit_token; synthesise one from uid
      sessionStorage.setItem("cockpit_token", "gauth_" + user.uid);
      sessionStorage.setItem("cockpit_user", JSON.stringify({
        id:   user.uid,
        name: user.displayName || user.email,
        role: user.role
      }));
    }
  }

  function getUser() {
    try { return JSON.parse(sessionStorage.getItem(SESSION_KEY) || "null"); }
    catch { return null; }
  }

  function clearSession() {
    [SESSION_KEY, "faculty_auth", "facultyId", "facultyName", "facultyRole",
     "institutionRole", "cockpit_token", "cockpit_user", "inst_auth"
    ].forEach(k => sessionStorage.removeItem(k));
  }

  // ─── Firebase init (idempotent) ───
  function init() {
    if (!window.MILED_FIREBASE_CONFIG) {
      console.warn("MiledAuth: firebase-init.js not loaded or config not set.");
      return null;
    }
    if (!window.firebase) {
      console.warn("MiledAuth: Firebase SDK not loaded.");
      return null;
    }
    if (!firebase.apps.length) firebase.initializeApp(window.MILED_FIREBASE_CONFIG);
    return firebase.app();
  }

  // ─── Role fetch from server ───
  async function fetchRole(idToken) {
    const res  = await fetch("/api/firebase-auth", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ idToken })
    });
    const data = await res.json();
    if (!data.ok) throw new Error(data.error || "Role fetch failed");
    return { role: data.role, uid: data.uid, email: data.email };
  }

  // ─── Google SVG icon ───
  const GOOGLE_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 48 48" style="vertical-align:middle;">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
  </svg>`;

  return {
    GOOGLE_ICON,

    init,

    async signInWithGoogle() {
      if (!init()) throw new Error("Firebase not configured — fill in firebase-init.js");
      const provider = new firebase.auth.GoogleAuthProvider();
      const result   = await firebase.auth().signInWithPopup(provider);
      const fbUser   = result.user;
      const idToken  = await fbUser.getIdToken();
      const { role, uid, email } = await fetchRole(idToken);
      const user = {
        uid, email,
        displayName: fbUser.displayName,
        photoURL:    fbUser.photoURL,
        role
      };
      setSession(user);
      return user;
    },

    async signOut() {
      init();
      if (window.firebase && firebase.apps.length) {
        await firebase.auth().signOut().catch(() => {});
      }
      clearSession();
      window.location.href = "/";
    },

    getUser,

    hasRole(required) {
      const user = getUser();
      if (!user) return false;
      return (LEVEL[user.role] ?? -1) >= (LEVEL[required] ?? 99);
    },

    // Synchronous guard — checks sessionStorage directly (no SDK needed)
    guard(required) {
      const user   = getUser();
      const newOk  = user && (LEVEL[user.role] ?? -1) >= (LEVEL[required] ?? 99);
      const legacyOk = sessionStorage.getItem("faculty_auth") === "true";
      if (!newOk && !legacyOk) {
        document.documentElement.style.visibility = "hidden";
        window.location.replace("/");
        return false;
      }
      return true;
    },

    renderUserBadge(containerId) {
      const el = document.getElementById(containerId);
      if (!el) return;
      const user = getUser();

      if (!user) {
        // Legacy fallback: show name from old auth + logout
        const name = sessionStorage.getItem("facultyName");
        if (!name) return;
        el.innerHTML = `<span style="display:inline-flex;align-items:center;gap:8px;font-size:13px;">
          <span style="opacity:.8;">${name}</span>
          <button onclick="MiledAuth.signOut()" style="background:none;border:1px solid rgba(255,255,255,.4);border-radius:6px;color:inherit;font-size:11px;padding:3px 9px;cursor:pointer;font-family:inherit;">יציאה</button>
        </span>`;
        return;
      }

      const avatar = user.photoURL
        ? `<img src="${user.photoURL}" referrerpolicy="no-referrer"
               style="width:26px;height:26px;border-radius:50%;border:2px solid rgba(255,255,255,.5);vertical-align:middle;">`
        : `<span style="display:inline-flex;align-items:center;justify-content:center;width:26px;height:26px;
               border-radius:50%;background:#6c5ce7;color:#fff;font-size:11px;font-weight:700;vertical-align:middle;">
             ${(user.displayName || user.email || "?")[0].toUpperCase()}
           </span>`;

      const roleLabel = { student:"סטודנט", faculty:"סגל", institution:"הנהלה", superadmin:"מנהל מערכת" };

      el.innerHTML = `<span style="display:inline-flex;align-items:center;gap:7px;font-size:13px;">
        ${avatar}
        <span style="max-width:140px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${user.displayName || user.email}</span>
        <span style="font-size:10px;padding:2px 7px;border-radius:10px;background:rgba(255,255,255,.18);font-weight:600;">${roleLabel[user.role] || user.role}</span>
        <button onclick="MiledAuth.signOut()" style="background:none;border:1px solid rgba(255,255,255,.35);border-radius:6px;color:inherit;font-size:11px;padding:3px 9px;cursor:pointer;font-family:inherit;">יציאה</button>
      </span>`;
    }
  };
})();
