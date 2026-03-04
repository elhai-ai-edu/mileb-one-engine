// ─────────────────────────────────────────────────────────────
// thinking-stream.js — MilEd.One
// Captures student ↔ AI dialogue during classroom sessions
// and streams it to the server for live teacher insight.
// No modification to chat.js required.
// ─────────────────────────────────────────────────────────────

(function(){

// ─────────────────────────────────────────
// GET SESSION
// ─────────────────────────────────────────

const params = new URLSearchParams(location.search);
const sessionId = params.get("sessionId");

if(!sessionId) return;


// ─────────────────────────────────────────
// STUDENT ID
// ─────────────────────────────────────────

let studentId = sessionStorage.getItem("studentId");

if(!studentId){

  studentId =
    "s_" + Math.random().toString(36).slice(2,8);

  sessionStorage.setItem("studentId",studentId);

}


// ─────────────────────────────────────────
// SEND EVENT
// ─────────────────────────────────────────

function sendThinking(role,text){

  if(!text) return;

  fetch("/.netlify/functions/thinking",{

    method:"POST",

    headers:{
      "Content-Type":"application/json"
    },

    body:JSON.stringify({

      sessionId,
      studentId,
      role,
      text: text.slice(0,200), // limit payload
      timestamp: Date.now()

    })

  }).catch(()=>{});

}


// ─────────────────────────────────────────
// OBSERVE CHAT DOM
// ─────────────────────────────────────────

const observer = new MutationObserver(mutations=>{

  mutations.forEach(m=>{

    m.addedNodes.forEach(node=>{

      if(!(node instanceof HTMLElement)) return;

      // ── user message detection
      if(node.matches(
        ".user-msg, .message.user, [data-role='user'], .chat-user"
      )){

        const text = node.innerText.trim();
        sendThinking("user",text);

      }

      // ── assistant message detection
      if(node.matches(
        ".assistant-msg, .bot-message, [data-role='assistant'], .message.bot"
      )){

        const text = node.innerText.trim();
        sendThinking("assistant",text);

      }

    });

  });

});

observer.observe(document.body,{
  childList:true,
  subtree:true
});

})();
