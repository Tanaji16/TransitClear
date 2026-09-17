# TransitClear — Project Setup Guide

## Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- A Firebase project ([Firebase Console](https://console.firebase.google.com/))

## Quick Start

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd TransportAndLogistics
```

### 2. Set up Firebase credentials

**Frontend (Browser):**
```bash
cp Frontend/env.example.js Frontend/env.js
```
Edit `Frontend/env.js` and add your Firebase config values.
Get these from: Firebase Console → Settings → General → Your apps

**Backend (Server — future):**
```bash
cp .env.example .env
```
Edit `.env` and add your API keys.

### 3. Start the dev server
```bash
npm run dev
```
Open http://localhost:3000/pages/Authentication/login.html

## Firebase Setup

### Enable Authentication
1. Firebase Console → Authentication → Sign-in method
2. Enable **Email/Password**
3. Enable **Google**

### Create Firestore Database
1. Firebase Console → Firestore Database → Create database
2. Location: `asia-south1 (Mumbai)`
3. Mode: Production

### Deploy Security Rules
1. Firestore → Rules tab
2. Paste contents of `firestore.rules`
3. Click Publish

## Project Structure
```
TransportAndLogistics/
├── Frontend/                    # Client-side web app
│   ├── pages/
│   │   ├── Authentication/      # Login, Signup, Forgot Password
│   │   ├── User/                # Driver dashboard pages
│   │   └── Admin/               # Authority/Admin dashboard pages
│   ├── firebase-config.js       # Firebase SDK init & auth functions
│   ├── auth-guard.js            # Route protection & role checking
│   ├── app.js                   # Shared UI logic
│   ├── mockData.js              # Demo data for development
│   ├── styles.css               # Global styles
│   ├── env.js                   # 🔒 Firebase config (gitignored)
│   ├── env.example.js           # Template for env.js
│   └── index.html               # Landing page
├── Backend/                     # Server-side (future)
├── docs/                        # Documentation
│   ├── database-schema.md       # Firestore collections & fields
│   └── setup-guide.md           # This file
├── firestore.rules              # Firestore security rules
├── firebase.json                # Firebase hosting & deploy config
├── .firebaserc                  # Firebase project link
├── package.json                 # Project metadata & scripts
├── .env                         # 🔒 Backend API keys (gitignored)
├── .env.example                 # Template for .env
└── .gitignore                   # Files excluded from Git
```

## Auth Flow
```
Driver Signup → Creates Firebase Auth user + Firestore profile → Driver Home
Driver Login  → Authenticates → Routes by role → Driver Home
Google Sign-In → New user: Complete profile modal → Driver Home
               → Existing user: Routes by role → Driver Home
Already logged in → Auto-redirects to Driver Home
```
