#!/usr/bin/env node
/**
 * scripts/deploy_form.js — MilEd.One Tally Form Provisioner
 * MilEd.One | System version: 4.8
 *
 * Creates the full MILED Bot Architect questionnaire on Tally via the Tally API.
 * Configures the webhook (→ /api/architect/intake) and redirect URL automatically.
 *
 * USAGE:
 *   node scripts/deploy_form.js <TALLY_API_KEY>
 *   TALLY_API_KEY=your_key node scripts/deploy_form.js
 *
 * OUTPUTS (to scripts/output/):
 *   form_result.json     — full API response (contains form ID, embed URL)
 *   webhook_result.json  — webhook API response
 *   embed_snippet.html   — drop-in iframe embed code for architect_studio.html
 *   setup_summary.txt    — next steps: copy TALLY_URL into architect_studio.html
 *
 * WHAT HAPPENS:
 *   1. GET /forms — verifies API key
 *   2. POST /forms — creates 9-cluster form (40 fields, section headers, hidden session_id)
 *   3. POST /webhooks — attaches webhook → https://miled.one/api/architect/intake
 *   4. Writes all outputs to scripts/output/
 *
 * TALLY API REFERENCE:
 *   https://developers.tally.so/api-reference/introduction
 *   Auth: Bearer token | Base: https://api.tally.so | Rate: 100 req/min
 */

import crypto from "crypto";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ─── Config ───────────────────────────────────────────────────────────────────

const TALLY_API_BASE  = "https://api.tally.so";
const SITE_URL        = "https://miled.one";
const WEBHOOK_URL     = `${SITE_URL}/api/architect/intake`;
const REDIRECT_URL    = `${SITE_URL}/architect_studio.html?sessionId={{submission_id}}`;
const FORM_TITLE      = "MILED Bot Architect — שאלון בונה הבוטים";
const OUTPUT_DIR      = path.join(__dirname, "output");

// ─── Terminal colors ──────────────────────────────────────────────────────────

const C = {
  reset:  "\x1b[0m",  bold:   "\x1b[1m",
  green:  "\x1b[32m", yellow: "\x1b[33m",
  blue:   "\x1b[34m", cyan:   "\x1b[36m",
  red:    "\x1b[31m", dim:    "\x1b[2m",
  gray:   "\x1b[90m",
};
const log   = (col, ...a) => console.log(col + a.join(" ") + C.reset);
const step  = (n, t)      => console.log(`\n${C.bold}${C.blue}[${n}]${C.reset} ${C.bold}${t}${C.reset}`);
const ok    = (...a)      => log(C.green,  "  ✓", ...a);
const warn  = (...a)      => log(C.yellow, "  ⚠", ...a);
const err   = (...a)      => log(C.red,    "  ✗", ...a);
const info  = (...a)      => log(C.cyan,   "  →", ...a);
const dim   = (...a)      => log(C.gray,   "   ", ...a);

// ─── UUID helpers ─────────────────────────────────────────────────────────────

/** Deterministic UUID v4-shaped hash from a seed string */
function seedUUID(seed) {
  const h = crypto.createHash("md5").update(seed).digest("hex");
  return `${h.slice(0,8)}-${h.slice(8,12)}-4${h.slice(13,16)}-${h.slice(16,20)}-${h.slice(20,32)}`;
}

/** Random UUID */
const uid = () => crypto.randomUUID();

// ─── Tally API client ─────────────────────────────────────────────────────────

async function tallyFetch(apiKey, method, endpoint, body = null) {
  const res = await fetch(`${TALLY_API_BASE}${endpoint}`, {
    method,
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type":  "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { data = { raw: text }; }

  return { status: res.status, ok: res.ok, data };
}

// ─────────────────────────────────────────────────────────────────────────────
// FORM DEFINITION
// 9 clusters (A–I) + hidden session field
// Field refs map 1:1 to SLUG_TO_VARIABLE keys in functions/architect_api.js
// ─────────────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────
// TALLY BLOCK STRUCTURE (discovered from API validation errors):
//
//   Every question = QUESTION wrapper block  +  one or more input child blocks
//   All blocks in a question share the same groupUuid (= the QUESTION block's uuid)
//
//   QUESTION  { uuid: Q, groupUuid: Q, groupType: QUESTION, payload: { label, isMandatory } }
//     INPUT_TEXT  { uuid: F, groupUuid: Q, groupType: INPUT_TEXT, payload: { placeholder } }
//
//     DROPDOWN    { uuid: F, groupUuid: Q, groupType: DROPDOWN,   payload: {} }
//     DROPDOWN_OPTION { uuid: O, groupUuid: Q, groupType: DROPDOWN_OPTION, payload: { text } }
//     ...
//
//     CHECKBOXES  { uuid: F, groupUuid: Q, groupType: CHECKBOXES, payload: {} }
//     CHECKBOX    { uuid: O, groupUuid: Q, groupType: CHECKBOX,   payload: { text } }
//     ...
//
//   Section headers (HEADING_2) and FORM_TITLE are standalone (groupUuid = own uuid).
//   All builders return Array<block> — buildBlocks() uses .flat().
// ─────────────────────────────────────────────────────────────────────────────

/** HEADING_2 section header — returns [block] */
function sectionBlock(slug, hebrewTitle, subtitle = "") {
  const uuid = seedUUID(`section_${slug}`);
  return [{
    uuid,
    type: "HEADING_2",
    groupUuid: uuid,
    groupType: "HEADING_2",
    payload: {
      html: subtitle
        ? `<p><strong>${hebrewTitle}</strong></p><p>${subtitle}</p>`
        : `<p><strong>${hebrewTitle}</strong></p>`,
    },
  }];
}

/** QUESTION + INPUT_TEXT — returns [question, inputField] */
function textBlock(slug, label, placeholder = "", mandatory = false) {
  const qUUID = seedUUID(`q_${slug}`);
  const fUUID = seedUUID(`f_${slug}`);
  return [
    {
      uuid: qUUID, type: "QUESTION", groupUuid: qUUID, groupType: "QUESTION",
      payload: { label, isMandatory: mandatory },
    },
    {
      uuid: fUUID, type: "INPUT_TEXT", groupUuid: qUUID, groupType: "INPUT_TEXT",
      payload: { placeholder },
    },
  ];
}

/** QUESTION + TEXTAREA — returns [question, textareaField] */
function textareaBlock(slug, label, placeholder = "", mandatory = false) {
  const qUUID = seedUUID(`q_${slug}`);
  const fUUID = seedUUID(`f_${slug}`);
  return [
    {
      uuid: qUUID, type: "QUESTION", groupUuid: qUUID, groupType: "QUESTION",
      payload: { label, isMandatory: mandatory },
    },
    {
      uuid: fUUID, type: "TEXTAREA", groupUuid: qUUID, groupType: "TEXTAREA",
      payload: { placeholder },
    },
  ];
}

/** QUESTION + DROPDOWN + DROPDOWN_OPTION... — returns [question, dropdown, ...options] */
function dropdownBlock(slug, label, options, mandatory = false) {
  const qUUID = seedUUID(`q_${slug}`);
  const fUUID = seedUUID(`f_${slug}`);
  return [
    {
      uuid: qUUID, type: "QUESTION", groupUuid: qUUID, groupType: "QUESTION",
      payload: { label, isMandatory: mandatory },
    },
    {
      uuid: fUUID, type: "DROPDOWN", groupUuid: qUUID, groupType: "DROPDOWN",
      payload: {},
    },
    ...options.map(([text, value], i) => ({
      uuid: seedUUID(`opt_${slug}_${value}`),
      type: "DROPDOWN_OPTION", groupUuid: qUUID, groupType: "DROPDOWN",
      payload: { text, index: i, isFirst: i === 0, isLast: i === options.length - 1 },
    })),
  ];
}

/** QUESTION + CHECKBOXES + CHECKBOX... — returns [question, checkboxes, ...options] */
function checkboxBlock(slug, label, options, mandatory = false) {
  const qUUID = seedUUID(`q_${slug}`);
  const fUUID = seedUUID(`f_${slug}`);
  return [
    {
      uuid: qUUID, type: "QUESTION", groupUuid: qUUID, groupType: "QUESTION",
      payload: { label, isMandatory: mandatory },
    },
    {
      uuid: fUUID, type: "CHECKBOXES", groupUuid: qUUID, groupType: "CHECKBOXES",
      payload: {},
    },
    ...options.map(([text, value], i) => ({
      uuid: seedUUID(`opt_${slug}_${value}`),
      type: "CHECKBOX", groupUuid: qUUID, groupType: "CHECKBOXES",
      payload: { text, index: i, isFirst: i === 0, isLast: i === options.length - 1 },
    })),
  ];
}

/** HEADING_3 pedagogical tip — returns [block] */
function tipBlock(slug, text) {
  const uuid = seedUUID(`tip_${slug}`);
  return [{
    uuid,
    type: "HEADING_3",
    groupUuid: uuid,
    groupType: "HEADING_3",
    payload: { html: `<p><em>💡 ${text}</em></p>` },
  }];
}

/** PAGE_BREAK — returns [block] */
function pageBreakBlock(slug) {
  const uuid = seedUUID(`pb_${slug}`);
  return [{
    uuid,
    type: "PAGE_BREAK",
    groupUuid: uuid,
    groupType: "PAGE_BREAK",
    payload: {},
  }];
}

/** HIDDEN_FIELDS — returns [block] */
function hiddenBlock() {
  const bUUID = seedUUID("block_hidden_fields");
  const fUUID = seedUUID("field_session_id");
  return [{
    uuid: bUUID,
    type: "HIDDEN_FIELDS",
    groupUuid: bUUID,
    groupType: "HIDDEN_FIELDS",
    payload: {
      hiddenFields: [{ uuid: fUUID, name: "session_id" }],
    },
  }];
}

// ─────────────────────────────────────────────────────────────────────────────
// BLOCK DEFINITIONS — 9 Clusters + Hidden
// All refs match SLUG_TO_VARIABLE keys in functions/architect_api.js
// ─────────────────────────────────────────────────────────────────────────────

function buildBlocks() {
  return [  // ← each element is an array; final .flat() flattens them all

    // ── FORM TITLE ───────────────────────────────────────────────────────────
    (() => {
      const uuid = seedUUID("form_title_block");
      return [{
        uuid, type: "FORM_TITLE", groupUuid: uuid, groupType: "FORM_TITLE",
        payload: {
          html: `<p>${FORM_TITLE}</p>`,
          button: { label: "בואו נתחיל →" },
        },
      }];
    })(),

    // ── CLUSTER A — זהות הבוט ומשימה ────────────────────────────────────────
    sectionBlock("cluster_a",
      "א — זהות הבוט ומשימה",
      "מי הוא הבוט, מה הוא עושה, ולמי הוא נגיש?"
    ),
    tipBlock("cluster_a_tip",
      "כאן נגדיר את המשימה המרכזית של הבוט, את הפונקציה שלו במערכת ואת גבולות הגזרה הבסיסיים."
    ),
    textBlock(
      "cluster_a_name",
      "שם הבוט / פרסונה",
      "לדוגמה: נועם, עדי, מנחה הכתיבה",
      true
    ),
    dropdownBlock(
      "cluster_a_function",
      "מה תפקיד הבוט במערכת?",
      [
        ["למידה — בוט סטודנט", "learning"],
        ["הוראה — בוט סגל", "teaching"],
        ["מוסדי — בוט ניהולי/כללי", "institutional"],
      ],
      true
    ),
    dropdownBlock(
      "cluster_a_phase",
      "מהו שלב הלמידה שהבוט מיועד לו?",
      [
        ["אבחוני — מדידה ומיפוי", "diagnostic"],
        ["פיתוח — עבודה קוגניטיבית מאומצת", "development"],
        ["רפלקציה — שילוב ויצירת משמעות", "reflection"],
        ["עיצוב — בניית פרויקט / ידע", "design"],
        ["אנליטיקה — ניתוח תוצרים", "analytics"],
      ],
      true
    ),
    textareaBlock(
      "cluster_a_mission",
      "מה המשימה של הבוט? (משפט אחד, תמציתי)",
      "לדוגמה: ללוות סטודנטים בניסוח שאלת מחקר מדויקת",
      true
    ),
    dropdownBlock(
      "cluster_a_bot_scope",
      "לאיזה קהל הבוט נגיש?",
      [
        ["גלובלי — כל סטודנטי המוסד", "global"],
        ["מוסדי — לפי הרשמה", "institution"],
        ["פרטי לסגל — לא גלוי לסטודנטים", "faculty_private"],
        ["קורס ספציפי", "course_specific"],
      ],
      true
    ),
    textareaBlock(
      "cluster_a_scope_limits",
      "מה הבוט לא יכסה? (גבולות תחום — BIND)",
      "לדוגמה: הבוט לא יתייחס לשאלות שאינן קשורות לכתיבה אקדמית",
      true
    ),
    dropdownBlock(
      "cluster_a_enforcement",
      "מהי רמת האכיפה הפדגוגית?",
      [
        ["רכה — מנחה בלבד", "soft"],
        ["בינונית — מנחה + מעצורים בסיסיים", "medium"],
        ["קשיחה — No-Skip מלא, אין דילוג", "strict"],
      ],
      true
    ),

    pageBreakBlock("after_a"),

    // ── CLUSTER B — קהל יעד ─────────────────────────────────────────────────
    sectionBlock("cluster_b",
      "ב — קהל יעד והקשר",
      "מי הסטודנט שיעבוד עם הבוט?"
    ),
    tipBlock("cluster_b_tip",
      "הכירו את הלומד שלכם — שפה, רמה, ורקע. ככל שהפרופיל מדויק יותר, כך הבוט יוכל להתאים עצמו טוב יותר."
    ),
    dropdownBlock(
      "cluster_b_language_mode",
      "מהי רמת העברית של קהל היעד?",
      [
        ["עברית כשפת אם — רמה סטנדרטית", "he_standard"],
        ["עברית כשפה שנייה — עולים/ערבים (B1)", "he_b1_haredi"],
        ["ערבית כשפת אם — עברית בסיסית (A2)", "he_a2_arabic"],
        ["ערבית כשפת אם — עברית מינימלית (A1)", "he_a1_arabic"],
      ],
      true
    ),
    dropdownBlock(
      "cluster_b_audience",
      "מהי הרמה האקדמית של קהל היעד?",
      [
        ["שנה א", "first_year"],
        ["שנה ב", "second_year"],
        ["שנה ג", "third_year"],
        ["תואר שני / מחקר", "graduate"],
        ["מעורב", "mixed"],
      ],
      true
    ),
    checkboxBlock(
      "cluster_b_population",
      "אוכלוסיות מיוחדות הדורשות התאמה (בחר הכל שרלוונטי)",
      [
        ["עולים חדשים", "immigrants"],
        ["חרדים", "haredi"],
        ["ערבים", "arabic"],
        ["חילונים / כללי", "secular"],
        ["מגוון — ללא התאמה ספציפית", "mixed"],
      ]
    ),

    pageBreakBlock("after_b"),

    // ── CLUSTER C — אינטראקציה ───────────────────────────────────────────────
    sectionBlock("cluster_c",
      "ג — סגנון האינטראקציה",
      "כיצד הבוט מתנהל עם הסטודנט?"
    ),
    tipBlock("cluster_c_tip",
      "בחרו את סגנון השיח שמתאים ביותר לפדגוגיה שלכם — סוקרטי, פיגומים, אינפורמטיבי ועוד. זה יקבע את אופי כל שיחה."
    ),
    dropdownBlock(
      "cluster_c_interaction",
      "מהו סגנון האינטראקציה הבסיסי?",
      [
        ["סוקרטי — שאלות במקום תשובות", "socratic"],
        ["פיגומים — ליווי שלב אחר שלב", "scaffolding"],
        ["שוער — חסימה עד הוכחת מוכנות", "gated"],
        ["אינפורמטיבי — הסבר ומענה", "informational"],
        ["תמיכה רגשית", "emotional"],
        ["מנחה — הכוונה עם גמישות", "guided"],
        ["אדפטיבי — מסתגל לפי הלומד", "adaptive"],
      ],
      true
    ),
    dropdownBlock(
      "cluster_c_time_horizon",
      "האם הבוט עובד בסשן אחד או לאורך זמן?",
      [
        ["סשן יחיד — ללא זיכרון", "single_session"],
        ["מרובה סשנים — זיכרון בין מפגשים", "multi_session"],
        ["רציף לאורך הקורס", "ongoing"],
      ],
      true
    ),
    dropdownBlock(
      "cluster_c_data_tracking",
      "האם הבוט צריך לעקוב אחר התקדמות הסטודנט?",
      [
        ["ללא מעקב", "none"],
        ["בסיסי — שמירת שלב נוכחי", "basic"],
        ["מלא — היסטוריה, שלבים, ניסיונות", "full"],
      ]
    ),

    pageBreakBlock("after_c"),

    // ── CLUSTER D — פרסונה וקצב ─────────────────────────────────────────────
    sectionBlock("cluster_d",
      "ד — פרסונה, קצב ותגובה לתקיעות",
      "האופי של הבוט ואיך הוא מגיב לקשיים"
    ),
    tipBlock("cluster_d_tip",
      "הגדירו את האופי של הבוט וכיצד הוא מגיב כשסטודנט נתקע. זה קובע את חוויית הלמידה הרגשית."
    ),
    textBlock(
      "cluster_d_persona",
      "תאר את הפרסונה של הבוט",
      "לדוגמה: מדריך תומך וסבלני, מאמן מאתגר, חבר לומד שאינו שופט"
    ),
    textareaBlock(
      "cluster_d_identity",
      "כתוב את 'משפט הזהות' של הבוט (כיצד הוא מציג את עצמו)",
      "לדוגמה: אני נועם, מלווה פדגוגי של קורס כתיבה אקדמית. תפקידי: לסייע לך לבנות טיעון מגובה."
    ),
    dropdownBlock(
      "cluster_d_pacing",
      "מה הקצב הרצוי?",
      [
        ["מהיר — תגובות תמציתיות, מינימום חכות", "fast"],
        ["אדפטיבי — לפי המצב", "adaptive"],
        ["איטי ומעמיק — זמן לחשיבה", "slow"],
      ],
      true
    ),
    dropdownBlock(
      "cluster_d_stuck",
      "מה פרוטוקול הטיפול בתקיעות (סטודנט שנתקע)?",
      [
        ["רמז מיידי אחרי ניסיון אחד", "immediate_hint"],
        ["שלושה ניסיונות → רמז ישיר", "three_attempts_then_hint"],
        ["הפנייה למרצה אחרי תקיעה", "redirect_instructor"],
        ["הצעת פישוט השאלה", "simplify_question"],
      ]
    ),

    pageBreakBlock("after_d"),

    // ── CLUSTER E — גבולות ואתיקה ───────────────────────────────────────────
    sectionBlock("cluster_e",
      "ה — גבולות, אתיקה וסוכנות",
      "מה הבוט לעולם לא יעשה, ומי מוביל את הלמידה?"
    ),
    tipBlock("cluster_e_tip",
      "אלו הגבולות שהבוט לעולם לא יחצה — ה-DNA האתי שלו. שדות אלו הם BIND ואינם ניתנים לביטול על ידי הלומד."
    ),
    textareaBlock(
      "cluster_e_never_do",
      "רשימת Never-Do — מה הבוט לעולם לא יעשה? (BIND — לא ניתן לביטול)",
      "שורה לכל איסור. לדוגמה:\nלא יכתוב את העבודה במקום הסטודנט\nלא ייתן תשובה מלאה לשאלת בחינה\nלא יעסוק בנושאים פוליטיים",
      true
    ),
    dropdownBlock(
      "cluster_e_agency",
      "מי מוביל את תהליך הלמידה?",
      [
        ["הבוט מוביל — הלומד עוקב", "guided"],
        ["שניהם ביחד — שותפות", "shared"],
        ["הלומד מוביל — הבוט מגיב", "learner_led"],
      ],
      true
    ),
    dropdownBlock(
      "cluster_e_refusal",
      "כיצד הבוט מסרב לבקשה שחורגת מתחומו?",
      [
        ["הסבר הגבול + הפניה לחלופה", "explain_boundary"],
        ["הפניה מנומסת ללא הסבר", "polite_redirect"],
        ["הצעת חלופה קרובה יותר", "suggest_alternative"],
      ]
    ),
    dropdownBlock(
      "cluster_e_escalation",
      "מתי הבוט מפנה לגורם אנושי?",
      [
        ["רק במשבר (בטיחות/משפטי)", "crisis_only"],
        ["אחרי 3 תקיעות ברצף", "stuck_3x"],
        ["כשהסטודנט מבקש", "on_request"],
        ["יזום — מראש לפי שלב", "proactive"],
      ]
    ),

    pageBreakBlock("after_e"),

    // ── CLUSTER F — תהליך וזרימה ─────────────────────────────────────────────
    sectionBlock("cluster_f",
      "ו — תהליך וזרימה",
      "מבנה השלבים שהבוט מנהל"
    ),
    tipBlock("cluster_f_tip",
      "תכננו את מסע הלמידה שלב אחר שלב. אילו שלבים חובה לעבור? מה מאפשר קידום לשלב הבא?"
    ),
    dropdownBlock(
      "cluster_f_process_type",
      "מהו סוג התהליך שהבוט מנהל?",
      [
        ["סוקרטי — גילוי מונחה", "socratic"],
        ["פיגומים — מדורג ורציף", "scaffolding"],
        ["שוער — חסימה עם תנאי יציאה", "gated"],
        ["אינפורמטיבי — הסבר ומענה", "informational"],
        ["רגשי — תמיכה ועיבוד", "emotional"],
        ["מנחה — הכוונה גמישה", "guided"],
        ["אדפטיבי — לפי הסטודנט", "adaptive"],
      ],
      true
    ),
    textareaBlock(
      "cluster_f_stages",
      "תאר את שלבי התהליך — מספר, שם, ומטרת כל שלב",
      "שלב 1: ניסוח שאלת המחקר — הסטודנט מגיע עם נושא רחב ויוצא עם שאלה ממוקדת\nשלב 2: ...",
      true
    ),
    textareaBlock(
      "cluster_f_mandatory",
      "אלו שלבים הם חובה — לא ניתן לדלג עליהם? (BIND)",
      "לדוגמה: שלב 1 חובה — הבוט לא יתקדם לשלב 2 ללא אישור שאלת המחקר"
    ),
    textareaBlock(
      "cluster_f_readiness",
      "מה האותות שמעידים שהסטודנט מוכן להתקדם? (קריטריוני שחרור)",
      "לדוגמה:\n- מסביר את העיקרון במילים שלו\n- מצליח ליישם על דוגמה חדשה\n- מזהה את השגיאה ללא הנחיה"
    ),

    pageBreakBlock("after_f"),

    // ── CLUSTER G — ויסות אדפטיבי ───────────────────────────────────────────
    sectionBlock("cluster_g",
      "ז — ויסות אדפטיבי",
      "כיצד הבוט מסתגל לעומס הקוגניטיבי של הסטודנט"
    ),
    tipBlock("cluster_g_tip",
      "כיצד הבוט יזהה שסטודנט עמוס יתר על המידה — ומה יעשה? ויסות טוב הוא בלתי נראה ללומד."
    ),
    dropdownBlock(
      "cluster_g_regulation",
      "מהו מצב הוויסות האדפטיבי?",
      [
        ["קשיח — ללא הקלות", "strict"],
        ["אדפטיבי — מוריד רף לפי אותות עומס", "adaptive"],
        ["מינימלי — הבוט לא מווסת באופן אקטיבי", "minimal"],
      ]
    ),
    dropdownBlock(
      "cluster_g_overload",
      "כיצד הבוט מגיב לעומס קוגניטיבי גבוה?",
      [
        ["מאט ועובר לפישוט", "detect_and_slow"],
        ["מציע הפסקה", "detect_and_offer_break"],
        ["לא מזהה עומס", "no_detection"],
      ]
    ),
    dropdownBlock(
      "cluster_g_metacognitive",
      "מתי הבוט מפעיל טריגר מטאקוגניטיבי?",
      [
        ["אחרי כל שגיאה", "after_error"],
        ["בסוף כל שלב", "every_stage"],
        ["רק לפי בקשה", "on_request"],
        ["לא מפעיל", "never"],
      ]
    ),

    pageBreakBlock("after_g"),

    // ── CLUSTER H — ידע וסגירה ───────────────────────────────────────────────
    sectionBlock("cluster_h",
      "ח — ידע, קוד ידע, וסגירה",
      "מה הבוט יודע, מה הוא לא יודע, ואיך הוא סוגר שיחה"
    ),
    tipBlock("cluster_h_tip",
      "מה הבוט יודע, מה הוא לא יודע, ואיך הוא מסיים שיחה בצורה אחראית שמחזירה אחריות ללומד."
    ),
    textareaBlock(
      "cluster_h_kb_domains",
      "מהם תחומי הידע שהבוט מכסה?",
      "לדוגמה: מחקר איכותני, ניתוח שיח, ספרות סוציולוגית, כתיבה אקדמית",
      true
    ),
    textareaBlock(
      "cluster_h_forbidden",
      "מהו ידע/תוכן אסור לשיתוף? (BIND — גם אם הסטודנט מבקש)",
      "לדוגמה: פתרונות מלאים לתרגילים, ציונים, מידע על סטודנטים אחרים"
    ),
    dropdownBlock(
      "cluster_h_uncertainty",
      "כיצד הבוט מתמודד עם שאלות שאינו יודע לענות עליהן?",
      [
        ["שואל שאלות מבהירות לפני תשובה", "ask"],
        ["מפנה למרצה / מקור חיצוני", "refer"],
        ["עונה עם סייגים ברורים", "qualify"],
        ["מסרב לענות מחוץ לתחום", "decline"],
      ],
      true
    ),
    textareaBlock(
      "cluster_h_closure_goal",
      "מה מטרת הסגירה? (מה הסטודנט צריך לצאת איתו מהשיחה)",
      "לדוגמה: שאלת מחקר ממוקדת + ידע בצעד הבא"
    ),

    pageBreakBlock("after_h"),

    // ── CLUSTER I — הערכה ───────────────────────────────────────────────────
    sectionBlock("cluster_i",
      "ט — הערכה ומעקב",
      "האם הבוט מעריך? אם כן — לפי מה?"
    ),
    tipBlock("cluster_i_tip",
      "האם הבוט מעריך? אם כן — לפי אילו קריטריונים ועם אילו הגנות? הערכה בלי רובריקה מאושרת היא BIND-violation."
    ),
    dropdownBlock(
      "cluster_i_eval_policy",
      "מהי מדיניות ההערכה של הבוט?",
      [
        ["ללא הערכה", "none"],
        ["משוב בלבד — ללא ציון", "feedback-only"],
        ["הערכה לפי רובריקה מאושרת", "rubric-based"],
      ],
      true
    ),
    dropdownBlock(
      "cluster_i_rubric_status",
      "מה סטטוס הרובריקה? (חובה אם הערכה ≠ ללא)",
      [
        ["אין רובריקה עדיין", "none"],
        ["טיוטה — עוד לא אושרה", "draft"],
        ["מאושרת ומוכנה לשימוש", "approved"],
      ],
      true
    ),
    dropdownBlock(
      "cluster_i_academic_level",
      "מהי הרמה האקדמית לצורכי הערכה?",
      [
        ["סמסטר ראשון", "semester_1"],
        ["סמסטר שני", "semester_2"],
        ["שנה ב", "year_2"],
        ["שנה ג", "year_3"],
        ["תואר שני", "graduate"],
      ]
    ),
    dropdownBlock(
      "cluster_i_data_tracking",
      "מהי רמת מעקב הנתונים הנדרשת?",
      [
        ["ללא מעקב", "none"],
        ["בסיסי — שלב נוכחי בלבד", "basic"],
        ["מלא — היסטוריה מלאה", "full"],
        ["מחקרי — לצורך ניתוח מערכתי", "research"],
      ]
    ),

    // ── HIDDEN FIELDS ────────────────────────────────────────────────────────
    // session_id is pre-filled from URL param: ?session_id=VALUE
    // Value is the architect_studio.html sessionId passed when opening the form
    hiddenBlock(),

  ].flat(); // flatten — each builder returns an array, flat() merges them
}

// ─────────────────────────────────────────────────────────────────────────────
// FORM PAYLOAD
// ─────────────────────────────────────────────────────────────────────────────

function buildFormPayload() {
  return {
    name: FORM_TITLE,  // top-level name (accepted by Tally even if undocumented)
    status: "PUBLISHED",
    blocks: buildBlocks(),
    settings: {
      language: "he",
      redirectOnCompletion: REDIRECT_URL,
      hasProgressBar: true,
      hasSelfEmailNotifications: false,
      hasPartialSubmissions: false,
      saveForLater: false,
    },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// WEBHOOK PAYLOAD
// ─────────────────────────────────────────────────────────────────────────────

function buildWebhookPayload(formId) {
  return {
    formId,
    url: WEBHOOK_URL,
    eventTypes: ["FORM_RESPONSE"],
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// OUTPUT WRITERS
// ─────────────────────────────────────────────────────────────────────────────

function writeOutputs(formResult, webhookResult) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const formId  = formResult.id || "FORM_ID_UNKNOWN";
  const embedURL = `https://tally.so/r/${formId}`;

  fs.writeFileSync(
    path.join(OUTPUT_DIR, "form_result.json"),
    JSON.stringify(formResult, null, 2)
  );

  fs.writeFileSync(
    path.join(OUTPUT_DIR, "webhook_result.json"),
    JSON.stringify(webhookResult, null, 2)
  );

  const embedSnippet = `<!-- Tally Embed — MILED Bot Architect -->
<!-- Add ?session_id=SESSION_ID to URL to pre-fill hidden field -->
<iframe
  id="tally-iframe"
  src="${embedURL}?session_id=SESSION_ID_PLACEHOLDER&transparentBackground=1"
  width="100%"
  height="600"
  frameborder="0"
  marginheight="0"
  marginwidth="0"
  title="MILED Bot Architect Questionnaire">
</iframe>

<!-- Tally postMessage listener (detects form submission in iframe) -->
<script>
  window.addEventListener("message", function(e) {
    if (!e.data || typeof e.data !== "object") return;
    if (e.data.formId !== "${formId}") return;
    if (e.data.type === "tally-form-submitted") {
      const submissionId = e.data.data?.responseId || e.data.data?.submissionId;
      // submissionId is the sessionId to use for architect_api.js bootstrap
      window.dispatchEvent(new CustomEvent("tally-submitted", { detail: { submissionId } }));
    }
  });
</script>

<!-- TALLY_URL for architect_studio.html: -->
<!-- const TALLY_URL = "${embedURL}"; -->
`;

  fs.writeFileSync(path.join(OUTPUT_DIR, "embed_snippet.html"), embedSnippet);

  const checklist = `MILED Bot Architect — Tally Setup Checklist
============================================
Generated: ${new Date().toISOString()}

Form ID:    ${formId}
Form URL:   ${embedURL}
Webhook:    ${WEBHOOK_URL}
Redirect:   ${REDIRECT_URL}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 1 — Update architect_studio.html
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Find this line in architect_studio.html:
  const TALLY_URL = ""; // TODO: replace with live Tally form URL

Replace with:
  const TALLY_URL = "${embedURL}";

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 2 — Verify form at Tally
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Open: https://app.tally.so/forms/${formId}/edit
Check:
  [ ] All 9 cluster sections visible
  [ ] Field references set correctly (see scripts/output/form_result.json)
  [ ] Hidden field "session_id" present
  [ ] Redirect URL set to: ${REDIRECT_URL}
  [ ] Form language set to Hebrew

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 3 — Verify webhook at Tally
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Open: https://app.tally.so/forms/${formId}/settings
Go to: Integrations > Webhooks
Check:
  [ ] Webhook URL: ${WEBHOOK_URL}
  [ ] Event: FORM_RESPONSE
  [ ] Status: Active

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 4 — End-to-end test
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  1. Open architect_studio.html
  2. Click "פתח שאלון"
  3. Fill and submit the form
  4. Confirm webhook fires → Firebase shows architect_sessions/{submissionId}/parsedVariables
  5. Click "סיימתי את השאלון — המשך לבנייה"
  6. Confirm Bot Architect starts Stage 2 (Hebrew briefing summary)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FIELD SLUG REFERENCE (all refs in form)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Cluster A: cluster_a_name, cluster_a_function, cluster_a_phase, cluster_a_mission,
           cluster_a_bot_scope, cluster_a_scope_limits, cluster_a_enforcement
Cluster B: cluster_b_language_mode, cluster_b_audience, cluster_b_population
Cluster C: cluster_c_interaction, cluster_c_time_horizon, cluster_c_data_tracking
Cluster D: cluster_d_persona, cluster_d_identity, cluster_d_pacing, cluster_d_stuck
Cluster E: cluster_e_never_do, cluster_e_agency, cluster_e_refusal, cluster_e_escalation
Cluster F: cluster_f_process_type, cluster_f_stages, cluster_f_mandatory, cluster_f_readiness
Cluster G: cluster_g_regulation, cluster_g_overload, cluster_g_metacognitive
Cluster H: cluster_h_kb_domains, cluster_h_forbidden, cluster_h_uncertainty, cluster_h_closure_goal
Cluster I: cluster_i_eval_policy, cluster_i_rubric_status, cluster_i_academic_level, cluster_i_data_tracking
Hidden:    session_id (pre-filled from URL param ?session_id=VALUE)
`;

  fs.writeFileSync(path.join(OUTPUT_DIR, "setup_checklist.txt"), checklist);
  return { formId, embedURL, checklist };
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\n${C.bold}${C.blue}╔═══════════════════════════════════════╗${C.reset}`);
  console.log(`${C.bold}${C.blue}║  MILED Bot Architect — Tally Deploy   ║${C.reset}`);
  console.log(`${C.bold}${C.blue}╚═══════════════════════════════════════╝${C.reset}`);

  // ── API Key + optional formId (update mode) ──────────────────────────────
  const apiKey    = process.argv[2] || process.env.TALLY_API_KEY;
  const updateId  = process.argv[3] || null; // e.g. Ek07No → PATCH /forms/Ek07No
  if (!apiKey) {
    err("No API key provided.");
    info("Usage:  node scripts/deploy_form.js <TALLY_API_KEY> [formId]");
    info("  Create: node scripts/deploy_form.js <KEY>");
    info("  Update: node scripts/deploy_form.js <KEY> Ek07No");
    process.exit(1);
  }
  dim(`API key: ${apiKey.slice(0, 8)}...${apiKey.slice(-4)}`);
  if (updateId) dim(`Update mode: PATCH /forms/${updateId}`);

  // ── Step 1: Verify API key ───────────────────────────────────────────────
  step(1, "Verifying API key (GET /forms)");
  const verifyRes = await tallyFetch(apiKey, "GET", "/forms");
  if (!verifyRes.ok) {
    if (verifyRes.status === 401) {
      err("Invalid API key — Tally returned 401.");
      info("Get your API key at: https://app.tally.so/settings/api");
    } else {
      err(`Tally API error: HTTP ${verifyRes.status}`);
      console.log(verifyRes.data);
    }
    process.exit(1);
  }
  const existingCount = verifyRes.data?.forms?.length ?? verifyRes.data?.data?.length ?? "?";
  ok(`Key valid. You have ${existingCount} existing form(s).`);

  // ── Step 2: Create or Update form ───────────────────────────────────────
  const isUpdate = Boolean(updateId);
  step(2, isUpdate
    ? `Updating form ${updateId}: "${FORM_TITLE}"`
    : `Creating form: "${FORM_TITLE}"`
  );
  const formPayload = buildFormPayload();
  const formMethod  = isUpdate ? "PATCH" : "POST";
  const formEndpoint = isUpdate ? `/forms/${updateId}` : "/forms";
  info(`Sending ${formPayload.blocks.length} blocks to ${formMethod} ${formEndpoint}...`);

  const formRes = await tallyFetch(apiKey, formMethod, formEndpoint, formPayload);
  if (!formRes.ok) {
    err(`Form creation failed: HTTP ${formRes.status}`);
    console.log(JSON.stringify(formRes.data, null, 2));
    info("Saving form payload to scripts/output/form_payload_debug.json for inspection...");
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    fs.writeFileSync(
      path.join(OUTPUT_DIR, "form_payload_debug.json"),
      JSON.stringify(formPayload, null, 2)
    );
    process.exit(1);
  }

  const formId  = formRes.data?.id || formRes.data?.data?.id || updateId;
  const embedURL = `https://tally.so/r/${formId}`;
  ok(`Form ${isUpdate ? "updated" : "created"}! ID: ${C.bold}${formId}${C.reset}`);
  ok(`Embed URL: ${embedURL}`);

  // ── Step 3: Create webhook (skipped in update mode — already exists) ──────
  let webhookRes = { data: { skipped: true } };
  step(3, `Attaching webhook → ${WEBHOOK_URL}`);
  if (isUpdate) {
    ok("Update mode — webhook already attached, skipping.");
  } else {
    const webhookPayload = buildWebhookPayload(formId);
    webhookRes = await tallyFetch(apiKey, "POST", "/webhooks", webhookPayload);
    if (!webhookRes.ok) {
      warn(`Webhook creation failed: HTTP ${webhookRes.status} — ${JSON.stringify(webhookRes.data)}`);
      warn("You can add the webhook manually in Tally's UI (see setup_checklist.txt).");
    } else {
      const webhookId = webhookRes.data?.id || webhookRes.data?.data?.id;
      ok(`Webhook created! ID: ${webhookId}`);
      ok(`Fires on: FORM_RESPONSE → ${WEBHOOK_URL}`);
    }
  }

  // ── Step 4: Write outputs ────────────────────────────────────────────────
  step(4, "Writing output files → scripts/output/");
  const { checklist } = writeOutputs(
    formRes.data?.data || formRes.data,
    webhookRes.data?.data || webhookRes.data
  );
  ok("form_result.json    — full Tally API response");
  ok("webhook_result.json — webhook API response");
  ok("embed_snippet.html  — drop-in iframe code");
  ok("setup_checklist.txt — next steps");

  // ── Summary ──────────────────────────────────────────────────────────────
  console.log(`\n${C.bold}${C.green}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${C.reset}`);
  console.log(`${C.bold}${C.green}  DONE${C.reset}`);
  console.log(`${C.bold}${C.green}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${C.reset}`);
  console.log(`\n  Form ID:   ${C.bold}${formId}${C.reset}`);
  console.log(`  Form URL:  ${C.cyan}${embedURL}${C.reset}`);
  console.log(`  Webhook:   ${C.cyan}${WEBHOOK_URL}${C.reset}`);
  console.log(`\n  ${C.bold}Next step:${C.reset} Open scripts/output/setup_checklist.txt`);
  console.log(`  ${C.bold}Then:${C.reset} Set TALLY_URL = "${embedURL}" in architect_studio.html\n`);
}

main().catch(e => {
  err("Unexpected error:", e.message);
  console.error(e);
  process.exit(1);
});
