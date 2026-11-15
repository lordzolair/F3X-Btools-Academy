const levels = [
  ["The Initiation","F3X fundamentals and safe tool handling",100],
  ["The Apprentice","Basic structures and object manipulation",150],
  ["The Craftsman","Plan and construct complete buildings",200],
  ["The Architect","Advanced layouts, scale and detailing",300],
  ["The Sith Artificer","Create immersive Sith environments",400],
  ["The Master Architect","Design and present a complete campaign location",500]
];
const tools = [
  ["↖","Selection","Select individual parts or groups before editing. Keep selections deliberate and check what is highlighted."],
  ["↔","Move","Position parts carefully and use consistent alignment when building walls, floors and props."],
  ["⤢","Resize","Adjust dimensions while preserving sensible proportions and clean joins."],
  ["⟳","Rotate","Turn objects to match the intended layout and orientation."],
  ["◉","Colour","Use a planned palette so rooms and structures feel consistent."],
  ["▧","Material","Choose materials that support the visual purpose of each surface."],
  ["⚓","Anchor","Understand which parts should remain fixed in the environment."],
  ["＋","New Part","Add a basic part as the starting point for a structure."],
  ["▣","Clone","Duplicate a suitable object to create consistent repeated details."],
  ["×","Delete","Remove only the intended selection; check before confirming."]
];
let completed = JSON.parse(localStorage.getItem("dh-completed") || "[]");
const $ = s => document.querySelector(s);
const xpTotal = () => completed.reduce((n,i)=>n+levels[i][2],0);
const rankName = () => xpTotal()>=1150?"Master Architect":xpTotal()>=750?"Sith Artificer":xpTotal()>=450?"Architect":xpTotal()>=250?"Craftsman":xpTotal()>=100?"Apprentice":"Initiate";
function refresh(){
  $("#xp").textContent=xpTotal(); $("#rank").textContent=rankName(); $("#cleared").textContent=`${completed.length} / 6`;
  $("#dashboard-levels").innerHTML=levels.slice(0,3).map((l,i)=>`<div class="level-tile"><div class="level-number">0${i+1}</div><div><h4>${l[0]}</h4><p>${l[1]}</p></div></div>`).join("");
  $("#all-levels").innerHTML=levels.map((l,i)=>`<article class="level-card"><div class="level-number">0${i+1}</div><div><h3>${l[0]}</h3><p>${l[1]}</p></div><div class="xp">${l[2]} XP</div><button data-level="${i}">${completed.includes(i)?"COMPLETED ✓":"VIEW LEVEL"}</button></article>`).join("");
  $("#all-levels").querySelectorAll("[data-level]").forEach(b=>b.addEventListener("click",()=>showLevel(+b.dataset.level)));
}
function showLevel(i){
  const l=levels[i];
  const done=completed.includes(i);
  $("#all-levels").innerHTML=`<article class="level-card"><div class="level-number">0${i+1}</div><div><h3>${l[0]}</h3><p>${l[1]}</p><p style="margin-top:12px">Mission: Complete the lesson, practise the skill in your Roblox training place, then ask an instructor to review your work. This demo button only records local sample progress; it does not verify a Roblox assessment.</p></div><div class="xp">${l[2]} XP</div><button id="back-levels">← BACK</button></article><div class="notice">Instructor verification and secure Roblox progress sync are planned for the next development stage.</div>${done?"":`<button class="primary-btn" id="demo-complete">RECORD DEMO COMPLETION</button>`}`;
  $("#back-levels").onclick=refresh;
  const c=$("#demo-complete"); if(c)c.onclick=()=>{completed.push(i);localStorage.setItem("dh-completed",JSON.stringify(completed));refresh();showLevel(i)};
}
function showView(name){
  document.querySelectorAll(".view").forEach(v=>v.classList.toggle("active",v.id===name));
  document.querySelectorAll(".nav-link").forEach(b=>b.classList.toggle("active",b.dataset.view===name));
  window.scrollTo({top:0,behavior:"smooth"});
}
document.querySelectorAll("[data-view]").forEach(b=>b.addEventListener("click",()=>showView(b.dataset.view)));
document.querySelectorAll("[data-go]").forEach(b=>b.addEventListener("click",()=>showView(b.dataset.go)));
$("#tool-grid").innerHTML=tools.map(t=>`<article class="tool-card"><div class="tool-symbol">${t[0]}</div><h3>${t[1]}</h3><p>${t[2]}</p></article>`).join("");
const questions=[
  ["What should you do before moving a group of parts?",["Check that the intended parts are selected","Delete nearby objects","Change every part's material"],0],
  ["Why is a consistent colour palette useful?",["It makes every part identical","It helps the environment feel visually coherent","It automatically anchors parts"],1],
  ["What is the safest approach when deleting objects?",["Delete a large area to save time","Check the selection and remove only the intended objects","Delete anything that looks unfamiliar"],1]
];
$("#start-quiz").onclick=()=>{
  $("#quiz-area").innerHTML=questions.map((q,i)=>`<div class="quiz-question"><p><strong>${i+1}. ${q[0]}</strong></p>${q[1].map((a,j)=>`<button data-q="${i}" data-a="${j}">${a}</button>`).join("")}</div>`).join("")+`<button class="primary-btn" id="submit-quiz">CHECK ANSWERS</button><div id="quiz-result"></div>`;
  const answers={};
  $("#quiz-area").querySelectorAll("[data-q]").forEach(b=>b.onclick=()=>{answers[b.dataset.q]=+b.dataset.a;b.parentElement.querySelectorAll("button").forEach(x=>x.style.borderColor="#453139");b.style.borderColor="#c8a45c"});
  $("#submit-quiz").onclick=()=>{if(Object.keys(answers).length!==questions.length){$("#quiz-result").innerHTML='<p class="quiz-result">Please answer all three questions first.</p>';return}const score=questions.reduce((n,q,i)=>n+(answers[i]===q[2]?1:0),0);$("#quiz-result").innerHTML=`<p class="quiz-result">You scored ${score} / ${questions.length}. ${score===3?"Excellent foundation knowledge.":"Review the library and try again."} This is a practice check, not a qualification.</p>`};
};

// SUPABASE CONNECTION
const SUPABASE_URL = "https://boyhsucjizuaiybmuhkf.supabase.co";
const SUPABASE_KEY = "sb_publishable_XQV_LfS09j-ECpyfzufsXA_LvsMBz54";
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
console.log("Dread Host Academy: Supabase client initialised");
// CHECK FOR PASSWORD RECOVERY
supabaseClient.auth.onAuthStateChange((event) => {
  if (event === "PASSWORD_RECOVERY") {
    showView("reset-password");
  }
});
// TRAINEE REGISTRATION
const authMessage = $("#auth-message");

$("#signup-btn").addEventListener("click", async () => {
  const displayName = $("#display-name").value.trim();
  const email = $("#auth-email").value.trim();
  const password = $("#auth-password").value;

  if (!displayName || !email || !password) {
    authMessage.textContent = "Please complete all fields.";
    return;
  }

  const { data, error } = await supabaseClient.auth.signUp({
    email,
    password,
    options: {
     data: { display_name: displayName },
emailRedirectTo: "https://lordzolair.github.io/F3X-Btools-Academy/"
    }
  });

  if (error) {
    authMessage.textContent = error.message;
    return;
  }

  if (data.session) {
    authMessage.textContent = "Account created. You are signed in.";
    showView("dashboard");
  } else {
    authMessage.textContent =
      "Account created. Check your email to confirm your account before signing in.";
  }
});

// TRAINEE SIGN IN
$("#login-btn").addEventListener("click", async () => {
  const email = $("#auth-email").value.trim();
  const password = $("#auth-password").value;

  if (!email || !password) {
    authMessage.textContent = "Enter your email and password.";
    return;
  }

  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    authMessage.textContent = error.message;
    return;
  }

  authMessage.textContent = "Signed in successfully.";
  showView("dashboard");
});
// PASSWORD RESET
$("#forgot-password-btn").addEventListener("click", async () => {
  const email = $("#auth-email").value.trim();

  if (!email) {
    authMessage.textContent = "Enter your email address first.";
    return;
  }

  const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
    redirectTo: "https://lordzolair.github.io/F3X-Btools-Academy/"
  });

  if (error) {
    authMessage.textContent = error.message;
    return;
  }

  authMessage.textContent = "Password reset email sent. Check your inbox.";
});
// SAVE NEW PASSWORD
$("#save-password-btn").addEventListener("click", async () => {
  const password = $("#new-password").value;
  const confirmPassword = $("#confirm-password").value;
  const resetMessage = $("#reset-message");

  if (password.length < 8) {
    resetMessage.textContent = "Password must be at least 8 characters.";
    return;
  }

  if (password !== confirmPassword) {
    resetMessage.textContent = "Passwords do not match.";
    return;
  }

  const { error } = await supabaseClient.auth.updateUser({
    password: password
  });

  if (error) {
    resetMessage.textContent = error.message;
    return;
  }

  resetMessage.textContent = "Password updated successfully. You can now sign in.";
});

refresh();
