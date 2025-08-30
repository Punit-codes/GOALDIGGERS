// script.js — logic for budget, charts, CSV, AI demo, auth

// global state
let budget = Number(localStorage.getItem('fb_budget') || 0);
let expenses = JSON.parse(localStorage.getItem('fb_expenses') || '[]'); // {date,name,cat,amt}
let dateChart = null;
let catChart = null;

// utility
function escapeHtml(s){ return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

document.addEventListener('DOMContentLoaded', () => {
  // initialize AOS (already loaded in index)
  if(window.AOS) AOS.init({ once:true, duration:800 });

  // render initial
  const bi = document.getElementById('budgetInput');
  if(budget && bi) bi.value = budget;
  renderExpenses();
  drawCharts();
  updateStatus();

  // wire Enter key for chat
  const chatInput = document.getElementById('chatInput');
  if(chatInput) chatInput.addEventListener('keydown', (e)=> { if(e.key === 'Enter') sendMsg(); });
});

// ====== AUTH (local demo) ======
function openAuth(){ document.getElementById('authModal').style.display = 'flex'; }
function closeAuth(){ document.getElementById('authModal').style.display = 'none'; }
function signup(){
  localStorage.setItem('fb_user', document.getElementById('user').value || '');
  localStorage.setItem('fb_pass', document.getElementById('pass').value || '');
  document.getElementById('authMsg').textContent = 'Signup saved locally ✅';
  setTimeout(closeAuth, 900);
}
function login(){
  const u=document.getElementById('user').value, p=document.getElementById('pass').value;
  if(localStorage.getItem('fb_user') === u && localStorage.getItem('fb_pass') === p){
    document.getElementById('authMsg').textContent = 'Logged in 🎉';
    setTimeout(closeAuth, 700);
  } else { document.getElementById('authMsg').textContent = 'Invalid credentials ❌'; }
}

// ====== Budget logic ======
function setBudget(){
  const v = Number(document.getElementById('budgetInput').value || 0);
  budget = v;
  localStorage.setItem('fb_budget', String(budget));
  updateStatus();
}

function addExpense(){
  const date = document.getElementById('expDate').value;
  const name = (document.getElementById('expName').value || '').trim();
  const amt = Number(document.getElementById('expAmt').value || 0);
  const cat = document.getElementById('expCat').value || 'Other';
  if(!date || !name || !amt || isNaN(amt)) { alert('Please fill Date, Name and valid Amount'); return; }
  expenses.push({ date, name, cat, amt });
  expenses.sort((a,b)=> new Date(a.date) - new Date(b.date));
  localStorage.setItem('fb_expenses', JSON.stringify(expenses));
  renderExpenses(); drawCharts(); updateStatus();
  document.getElementById('expName').value=''; document.getElementById('expAmt').value='';
}

function delExpense(idx){
  if(!confirm('Remove this expense?')) return;
  expenses.splice(idx,1);
  localStorage.setItem('fb_expenses', JSON.stringify(expenses));
  renderExpenses(); drawCharts(); updateStatus();
}

function renderExpenses(){
  const list = document.getElementById('expenseList');
  list.innerHTML = '';
  if(!expenses.length){ list.innerHTML = '<div class="muted small">No expenses yet — add one to start tracking.</div>'; return; }
  expenses.forEach((e,i)=>{
    const div = document.createElement('div');
    div.className = 'item';
    div.innerHTML = `<div style="flex:1">
        <strong>${escapeHtml(e.name)}</strong><div class="muted small">${e.date} • ${escapeHtml(e.cat)}</div>
      </div>
      <div style="text-align:right;min-width:110px">
        <div style="font-weight:700">₹${Number(e.amt).toLocaleString()}</div>
        <div style="margin-top:6px"><button class="btn" onclick="delExpense(${i})">Remove</button></div>
      </div>`;
    list.appendChild(div);
  });
}

// ====== Grouping helpers ======
function groupByDate(){
  const m = {};
  expenses.forEach(e => m[e.date] = (m[e.date] || 0) + Number(e.amt));
  const labels = Object.keys(m).sort((a,b)=> new Date(a)- new Date(b));
  const data = labels.map(l=>m[l]);
  return { labels, data };
}
function groupByCat(){
  const m = {};
  expenses.forEach(e => m[e.cat] = (m[e.cat]||0) + Number(e.amt));
  const labels = Object.keys(m);
  const data = labels.map(l=>m[l]);
  return { labels, data };
}

// ====== Charts ======

function drawCharts() {
  const { labels: dl, data: dd } = groupByDate();
  const { labels: cl, data: cd } = groupByCat();

  const dateCtx = document.getElementById("dateChart").getContext("2d");
  const catCtx = document.getElementById("catChart").getContext("2d");

  // --- Date Chart (Bar) ---
  if (dateChart) {
    dateChart.data.labels = dl;
    dateChart.data.datasets[0].data = dd;
    dateChart.update();
  } else {
    dateChart = new Chart(dateCtx, {
      type: "bar",
      data: {
        labels: dl,
        datasets: [
          {
            label: "₹",
            data: dd,
            backgroundColor: dd.map(() => "rgba(112, 199, 237, 0.65)"),
            borderRadius: 8,
          },
        ],
      },
      options: {
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false }, ticks: { color: "#555" } },
          y: { ticks: { color: "#555" } },
        },
      },
    });
  }

  // --- Category Chart (Pie) ---
  if (catChart) {
    catChart.data.labels = cl;
    catChart.data.datasets[0].data = cd;
    catChart.update();
  } else {
    catChart = new Chart(catCtx, {
      type: "pie",
      data: {
        labels: cl,
        datasets: [
          {
            data: cd,
            backgroundColor: [
              "#00C9A7",
              "#FFB347",
              "#FF6B6B",
              "#4D96FF",
              "#6BCB77",
              "#FFD93D",
            ],
          },
        ],
      },
      options: {
        plugins: {
          legend: { labels: { color: "#444" } },
        },
      },
    });
  }
}


// ====== Status update ======
function updateStatus(){
  const statusEl = document.getElementById('budgetStatus');
  const spent = expenses.reduce((s,e)=> s + Number(e.amt), 0);
  const remaining = budget - spent;
  statusEl.innerHTML = `Budget: <strong>₹${budget.toLocaleString()}</strong> &nbsp;|&nbsp; Spent: <strong>₹${spent.toLocaleString()}</strong> &nbsp;|&nbsp; Remaining: <strong style="color:${remaining<0? '#ef4444':'#16a34a'}">₹${remaining.toLocaleString()}</strong>`;
}

// ====== CSV parse demo ======
function parseCSV(){
  const f = document.getElementById('csvFile').files[0];
  if(!f){ alert('Please select a CSV file'); return; }
  const reader = new FileReader();
  reader.onload = e => {
    const rows = e.target.result.split(/\r?\n/).filter(Boolean);
    const bankList = document.getElementById('bankList');
    bankList.innerHTML = rows.slice(0,200).map(r => `<div style="padding:8px;border-bottom:1px solid #f3f4f6">${escapeHtml(r)}</div>`).join('');
  };
  reader.readAsText(f);
}

// ====== SIP & TAX ======
function calcSIP(){
  const P = Number(document.getElementById('sipAmt').value || 0);
  const annual = Number(document.getElementById('sipRate').value || 12);
  const years = Number(document.getElementById('sipYears').value || 0);
  if(!P || !years){ alert('Enter SIP amount and years'); return; }
  const r = annual/100/12, n = years*12;
  const fv = P * ((Math.pow(1+r,n)-1)/r) * (1+r);
  document.getElementById('sipResult').textContent = `Future value (approx): ₹${Math.round(fv).toLocaleString()}`;
}

function calcTax(){
  const income = Number(document.getElementById('income').value || 0);
  if(!income){ alert('Enter income'); return; }
  let tax = 0;
  if(income <= 250000) tax = 0;
  else if(income <= 500000) tax = (income-250000)*0.05;
  else if(income <= 1000000) tax = 12500 + (income-500000)*0.2;
  else tax = 112500 + (income-1000000)*0.3;
  document.getElementById('taxResult').textContent = `Estimated tax (demo): ₹${Math.round(tax).toLocaleString()}`;
}

// ====== AI demo chat ======
function sendMsg(){
  const input = document.getElementById('chatInput');
  const text = (input.value || '').trim();
  if(!text) return;
  addBubble(text,'me');
  input.value = '';
  const l = text.toLowerCase();
  let reply = "I'm FinanceAI — demo suggestions only.";
  if(l.includes('tax')) reply = "Use 80C/80D and keep records; consult a professional for filing.";
  else if(l.includes('invest') || l.includes('sip')) reply = "Consider regular SIPs in low-cost index funds.";
  else if(l.includes('budget')) reply = "Set monthly caps and review weekly.";
  setTimeout(()=> addBubble(reply,'bot'), 350);
}
function addBubble(text, who){
  const box = document.getElementById('chatBox');
  const div = document.createElement('div');
  div.className = 'bubble ' + (who==='me'?'me':'bot');
  div.textContent = text;
  box.appendChild(div);
  box.scrollTop = box.scrollHeight;
}

// ====== init persisted data ======
(function init(){
  if(localStorage.getItem('fb_budget')) budget = Number(localStorage.getItem('fb_budget'));
  expenses = JSON.parse(localStorage.getItem('fb_expenses') || '[]');
  // small delay to ensure DOM ready operations (if called before DOMContentLoaded)
  setTimeout(()=>{ renderExpenses(); drawCharts(); updateStatus(); }, 120);
})();

// expose some functions for onclick
window.setBudget = setBudget;
window.addExpense = addExpense;
window.delExpense = delExpense;
window.parseCSV = parseCSV;
window.calcSIP = calcSIP;
window.calcTax = calcTax;
window.openAuth = openAuth;
window.closeAuth = closeAuth;
window.signup = signup;
window.login = login;
window.sendMsg = sendMsg;

function resetBudget() {
  // Reset budget
  document.getElementById('budgetInput').value = '';
  document.getElementById('budgetStatus').textContent = 'No budget set yet.';

  // Clear expenses
  expenses = []; // assuming you have an array called expenses
  document.getElementById('expenseList').innerHTML = '';

  // Reset charts
  if (window.dateChart) {
    window.dateChart.data.labels = [];
    window.dateChart.data.datasets[0].data = [];
    window.dateChart.update();
  }
  if (window.catChart) {
    window.catChart.data.labels = [];
    window.catChart.data.datasets[0].data = [];
    window.catChart.update();
  }
}

// ====== Simple Demo AI Assistant ======
function sendMsg() {
  const input = document.getElementById('chatInput');
  const text = (input.value || '').trim();
  if (!text) return;

  addBubble(text, 'me');
  input.value = '';

  const typingBubble = addBubble("Typing...", 'bot', true);

  setTimeout(() => {
    typingBubble.remove();
    const reply = getDemoReply(text);
    typeText(reply);
  }, 700);
}

function addBubble(text, who, isTyping = false) {
  const box = document.getElementById('chatBox');
  const div = document.createElement('div');
  div.className = 'bubble ' + (who === 'me' ? 'me' : 'bot');
  div.textContent = text;
  if (isTyping) div.classList.add('typing');
  box.appendChild(div);
  box.scrollTop = box.scrollHeight;
  return div;
}

function typeText(text) {
  return new Promise((resolve) => {
    const box = document.getElementById('chatBox');
    const div = document.createElement('div');
    div.className = 'bubble bot';
    box.appendChild(div);
    box.scrollTop = box.scrollHeight;

    let i = 0;
    const interval = setInterval(() => {
      div.textContent += text[i];
      i++;
      box.scrollTop = box.scrollHeight;
      if (i >= text.length) {
        clearInterval(interval);
        resolve();
      }
    }, 20);
  });
}

function getDemoReply(text) {
  const msg = text.toLowerCase();

  if (msg.includes("sip")) {
    return "💡 SIP helps you invest regularly. Example: ₹5,000 monthly for 10 years at 12% may grow to ~₹11 lakh.";
  }
  if (msg.includes("tax")) {
    return "💡 Tax saving routes: 80C (PPF, ELSS), 80D (health insurance), HRA. Consult a CA before filing.";
  }
  if (msg.includes("budget")) {
    return "💡 Try the 50/30/20 rule: 50% needs, 30% wants, 20% savings/investments.";
  }
  if (msg.includes("invest")) {
    return "💡 Diversify: 60% equity (index funds), 20% debt, 20% emergency/short-term funds.";
  }
  if (msg.includes("loan")) {
    return "💡 Keep EMIs under 30–40% of income. Prepay high-interest loans early.";
  }
  if (msg.includes("hello") || msg.includes("hi")) {
    return "👋 Hello! I can answer about SIP, taxes, budgeting, investments, or loans.";
  }

  return "🤖 I'm a demo AI. Try asking about SIP, tax, budget, investments, or loans!";
}

