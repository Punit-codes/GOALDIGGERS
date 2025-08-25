# 💎 FinBuddy Luxe — Premium Finance Hub  

FinBuddy is a **modern, cinematic finance hub UI** built with pure **HTML, CSS, and JavaScript**.  
It combines elegant design with practical finance tools — **budget planner, SIP calculator, tax estimator, bank CSV demo, and AI assistant** — all running locally in your browser.  

---

## 🚀 Features  

### 🔑 Authentication (Local Demo)  
- Login / Signup stored in `localStorage`.  
- Simulated "Sign In" modal with username + password.  
- Session stored locally (no backend).  

### 📊 Budget Planner  
- Set your monthly budget.  
- Add expenses date-wise with categories.  
- Automatic charts:  
  - **Bar chart** → Spending by Date.  
  - **Doughnut chart** → Spending by Category.  
- Data persists locally using `localStorage`.  

### 💹 Investment Guidance  
- **SIP Calculator** — project future wealth using monthly SIP, years, and expected return.  
- Smart investing tips (long-term, index funds, emergency fund, etc.).  

### 🧾 Tax Estimator  
- Quick slab-based tax calculation (demo only).  
- Educational purpose, **not for actual filing**.  

### 🏦 Bank Connect (Demo)  
- Upload CSV file with transactions.  
- Parses & displays rows inside the app.  
- Data stays **in-browser** for privacy.  

### 🤖 AI Assistant (Demo)  
- Chatbox UI with simple rule-based responses.  
- Example queries: *budget*, *invest*, *tax*.  
- For production: connect any LLM API (e.g. OpenAI) via a secure backend.  

---

## 🛠️ Tech Stack  

- **Frontend:** HTML5, CSS3, JavaScript (Vanilla)  
- **Charts:** [Chart.js](https://www.chartjs.org/)  
- **Animations:** [AOS (Animate on Scroll)](https://michalsnik.github.io/aos/)  
- **Fonts & Icons:** Google Fonts, RemixIcon  
- **Storage:** LocalStorage (for demo persistence)  

---
