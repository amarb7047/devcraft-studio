# ⚡ DevCraft Studio — Premium Agency Platform & Admin Console

[![Vite](https://img.shields.io/badge/Vite-8.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-19.x-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind--CSS-3.x-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Firebase-12.x-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Cloudinary](https://img.shields.io/badge/Cloudinary-CDN-F05032?style=for-the-badge&logo=cloudinary&logoColor=white)](https://cloudinary.com/)

**DevCraft Studio** is a professional, high-performance web agency platform engineered for solo developers and small digital agencies to showcase services, onboard clients, coordinate project builds, and manage billing. 

The platform features a **Public Client Portal** (service builder, project request configurator, live support chat, offline UPI billing log, invoice downloader) and a comprehensive **Admin Control Panel** (metrics overview, SQLite/Firestore sync tables, real-time message inbox, Cloudinary portfolio manager, general system settings editor).

---

## ✨ Features Checklist

### 💻 Client-Facing App
- **Bespoke Request Builder:** Clean pricing calculators with flexible budget parameters and target milestones.
- **Manual UPI Payment Portal:** Offline payment loop where clients scan the admin's UPI QRs, transfer funds, and submit transaction UTR codes.
- **Dynamic invoice Compiler:** One-click Vector PDF generator (compiled client-side using `jsPDF`) with transaction verification stamps.
- **Real-time Support Chat:** Secure chat coordinates syncing directly with the admin console.

### 🛡️ Admin Control Panel (`/admin`)
- **Income Dashboard:** Recharts analytical line charts tracking lifetime agency collections.
- **Order Queue Panel:** Coordinate client order states (Pending $\rightarrow$ Quoted $\rightarrow$ Approved $\rightarrow$ Invoice Sent $\rightarrow$ Active).
- **Settings Console:** Real-time updates for UPI billing IDs, support phones, email addresses, and social profile links across the whole system.
- **Portfolio CRUD Manager:** Upload screenshots directly to Cloudinary CDN storage with automated scaling presets.

---

## 🛠️ Architecture & Tech Stack

- **Frontend:** React.js SPA (configured via Vite).
- **Styling:** Vanilla Tailwind CSS with custom premium indigo-blue palette (`#1A56DB`) and glassmorphic card overlays.
- **Database:** Serverless Firestore Database (Real Firebase Node) with local SQLite coordination schemas.
- **Media Asset Pipe:** Direct browser-to-Cloudinary upload presets (eliminates server hosting storage overhead).
- **Authentication:** Firebase Auth handles security guards.

---

## 📂 Project Structure

```text
├── public/
│   ├── favicon.svg             # Custom transparent SVG logo
│   └── logo.svg                # Master transparent SVG asset
├── src/
│   ├── assets/                 # Image assets (home hero, mock mockups)
│   ├── components/
│   │   ├── ChatWidget.jsx      # Client floating chat coordinate
│   │   └── RouteGuards.jsx     # Route guarding logic
│   ├── context/
│   │   └── AuthContext.jsx     # Auth state & offline mock engine fallback
│   ├── layouts/
│   │   ├── PublicLayout.jsx    # Client shell layout
│   │   └── AdminLayout.jsx     # Sidebar admin panel shell
│   ├── pages/
│   │   ├── Home.jsx            # Dynamic Hero grid, case studies, FAQ accordions
│   │   ├── Services.jsx        # Inline SVG tech showcase
│   │   ├── Order.jsx           # Quote request builder
│   │   ├── Profile.jsx         # Client billing logs & UTR submissions
│   │   └── admin/              # Admin control views (Chat, Invoices, Settings)
│   └── services/
│       ├── cloudinary.js       # Unsigned direct asset uploader helper
│       └── invoiceGenerator.js # Clientside jsPDF document renderer
├── firestore.rules             # Security definitions for firestore auth
├── tailwind.config.js          # Tailwind custom palette configuration
└── package.json
```

---

## 🚀 Setup & Installation

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/yourusername/devcraft-studio.git
cd devcraft-studio
npm install
```

### 2. Configure Environment variables
Create a `.env` file in the root directory using the template inside `.env.example`:
```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Cloudinary Presets
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_unsigned_preset

# Admin Identity
VITE_ADMIN_EMAIL=amar@devcraft.studio
```
> [!TIP]
> **No Firebase keys yet?** No problem! The application features an **Offline Mock Engine**. If keys are missing or invalid, it automatically falls back to standard local browser mock data, allowing you to test the complete order workflow, chat responses, UPI UTR checks, and PDF invoice generation offline without setting up database connections!

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🔒 Firestore Security Rules

To secure client records and prevent cross-user coordinate inspection, deploy the following Firestore rules (located in `firestore.rules`):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper check for admin privileges
    function isAdmin() {
      return request.auth != null && request.auth.token.email == 'amar@devcraft.studio';
    }
    
    // User profile access rules
    match /users/{userId} {
      allow read, write: if request.auth != null && (request.auth.uid == userId || isAdmin());
    }
    
    // Order specifications rules
    match /orders/{orderId} {
      allow read, write: if request.auth != null && (resource.data.userId == request.auth.uid || request.resource.data.userId == request.auth.uid || isAdmin());
    }
    
    // Chat logs rules
    match /chats/{chatId} {
      allow read, write: if request.auth != null && (resource.data.userId == request.auth.uid || request.resource.data.userId == request.auth.uid || isAdmin());
    }
  }
}
```

---

## 📦 Deployment

### Production Compilation
Bundle the production static build files directly to the `dist` directory:
```bash
npm run build
```

### Deploy to Firebase Hosting
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

---

## 📄 License
This project is proprietary and owned by **Amar Biswas (DevCraft Studio)**. All rights reserved.
