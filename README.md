# 💰 Family Financial Management Dashboard

A full-stack financial management platform that helps users **track financial assets, manage expenses, and gain AI-powered insights**. It supports **role-based access** and integrates with APIs for real-time data and communication.

---

## 🚀 **Tech Stack**

### **Frontend**
- ⚛️ **React** – Component-based UI development  
- 🎨 **Tailwind CSS** – Styling and layout  
- ⚡ **Vite** – Fast build and dev server  

### **Backend**
- 🛠️ **Express.js** – Server-side framework  
- 🐘 **Neon Postgres** – Database for storing financial data  
- 🔐 **Plaid API** – Real-time financial data integration  
- 📞 **Twilio API** – SMS notifications and alerts  
- 🤖 **OpenAI API** – AI-powered financial insights  

---

## 🔥 **Features**
✅ **Financial Asset Tracking:**  
- Add, edit, and delete financial assets  
- View asset distribution with visual charts  

✅ **Expense Management:**  
- Categorize and track expenses  
- View monthly spending patterns  

✅ **AI-powered Insights:**  
- Analyze spending behavior  
- Provide financial suggestions  

✅ **Role-based Access:**  
- Admin and user roles  
- Secure data handling  

✅ **API Integration:**  
- **Plaid:** Real-time financial data sync  
- **Twilio:** SMS alerts and notifications  
- **Gemini AI:** AI-driven insights  

✅ **Secure Authentication:**  
- OTP-based login  
- End-to-end encryption  

---

## 🛠️ **Installation**

### 1. **Clone the Repository**
```bash
git clone https://github.com/PrathamS369/fin-dash.git
cd fin-dash
```

2. Install Dependencies
🛠️ Backend Dependencies
```bash
cd server
npm install express cors dotenv axios plaid twilio openai pg
```
⚛️ Frontend Dependencies
```bash
cd ../client
npm install react react-dom tailwindcss papaparse axios
npm install vite --save-dev
```
3. Environment Variables
Create a .env file in the server directory with the following keys:

```bash
PLAID_CLIENT_ID=your_plaid_client_id  
PLAID_SECRET=your_plaid_secret  
GEMINI_API_KEY=your_Gemini_API_key  
```
4. Run the Application
✅ Start the Backend:

```bash
cd server
npm run dev
```
✅ Start the Frontend:

```bash
cd ../client
npm run dev
```
🌟 Screenshots
📊 Dashboard Overview

💡 AI-Powered Insights

📈 Expense Breakdown

📚 Folder Structure
```bash
/fin-dash
 ├── /client               # Frontend (React + Vite)
 │    ├── /src
 │    │    ├── components  # Reusable components
 │    │    ├── pages       # Page components
 │    │    └── App.jsx     # Main App component
 │    ├── index.html
 │    ├── tailwind.config.js
 │    ├── vite.config.js
 │    └── package.json
 │
 ├── /server               # Backend (Express.js)
 │    ├── routes           # API routes
 │    ├── models           # Database models
 │    ├── server.js        # Main server file
 │    ├── .env             # Environment variables
 │    └── package.json
 │
 ├── README.md
 ├── .gitignore
 └── Screenshots          # Screenshots for README
```
