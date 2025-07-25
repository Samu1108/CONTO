#💰 Bank App (Personal Finance Tracker)
This is a simple web-based personal banking app built with HTML, CSS, JavaScript, and Firebase. It allows users to:

➕ Add income and expenses
📄 View transaction history
📊 Analyze spending and balance over time
☁️ Automatically store data in Firestore (Firebase)
🚀 Features
Firestore database for storing transactions
Real-time balance calculation
Paged transaction list with filters
Statistics with charts (using Chart.js)
Mobile-first responsive design
Backup download feature
🛠 Setup Instructions
1. Clone the Repository
git clone https://github.com/yourusername/bank-app.git
cd bank-app
2. Create Firebase Project
Go to Firebase Console

Create a new project

Create a Firestore database (in test mode)

Go to Project Settings > Web and copy your config

3. Configure Firebase
Replace the placeholder in your JavaScript file (app.js or inlined code) with your Firebase config:

js
Copia
Modifica
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT",
  ...
};
📂 File Structure
bash
Copia
Modifica
/bank-app
│
├── index.html         # Insert new transaction
├── conto.html         # View transaction list & balance
├── stats.html         # View stats/charts
├── login.html         # Login page
├── app.js             # Firebase logic & core features
├── style.css          # Styling
├── README.md          # This file
✅ Usage
Open index.html and sign in with your Firebase account.

You’ll be redirected to index.html, where you can:

Enter a description, amount, type (income/expense), and date

Click "Add" to save the transaction

Use the navigation bar to:

See balance and past transactions on conto.html

View statistics and chart on stats.html

📦 Deployment
You can host the app on any static site host (e.g., Firebase Hosting, GitHub Pages, Netlify):

Firebase Hosting (optional):
bash
Copia
Modifica
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
📱 Mobile Support
Fully responsive on phones and tablets

Uses system date formatting

Recommended to open in browser (e.g., Chrome) and "Add to Home Screen"

🔐 Notes
All data is saved per user in Firestore

Make sure Firebase authentication rules are secure for production

Do not share your Firebase API key with write access publicly

🧑‍💻 Author
Created by Samuele Sartori
Email: samuele.sartori1108@gmail.com
