# 🎓 HostelTalkies — Frontend Web App

> Modern, responsive, and secure client-side application for **HostelTalkies**, built with **React 19**, **TypeScript**, **Tailwind CSS**, and **Vite**.

[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4+-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-8.2+-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Vercel](https://img.shields.io/badge/Deployment-Vercel-black?style=for-the-badge&logo=vercel)](https://hosteltalkies.fun)

---

## 📖 Overview

HostelTalkies Frontend provides an intuitive, social-first web experience tailored for campus students and hostel residents. It delivers a fast, mobile-friendly interface for browsing campus listings, downloading study materials, coordinating room needs, reading verified official announcements, and engaging with hostel peers.

- **🌐 Live Production URL**: [https://hosteltalkies.fun](https://hosteltalkies.fun)
- **🔙 Backend REST API Repository**: [Hostel-Talkies-Backend](https://github.com/siddharth194thakur-gif/Hostel-Talkies-Backend)
- **Hosting Platform**: Vercel (Edge-optimized Single-Page App)

---

## 🛠️ Technology Stack

| Layer | Tools & Libraries |
| :--- | :--- |
| **Framework & Core** | React 19, TypeScript, Vite |
| **Styling & UI** | Tailwind CSS, Lucide React (Icons), Custom Brand Tokens |
| **Routing** | React Router v7 (Client-side routing with SPA rewrite rules) |
| **State & Context** | React Context API (`AuthContext`, `NotificationContext`) |
| **Networking** | Axios with automatic JWT token interceptors & 401 retry queue |
| **Build Tooling** | Vite, PostCSS, Autoprefixer |

---

## 🌟 Key Application Features

### 1. 📱 Responsive Multi-Device Design
- Adaptive desktop sidebar navigation with branding and quick-action access.
- Mobile/Tablet bottom navigation bar (`Home | Study | + Post | Explore Feed | Profile`).
- Smooth transitions and clean modal interfaces for mobile viewports.

### 2. 🔐 Resilient Authentication & Registration
- Interactive multi-step registration with dynamic cascading hostel selection.
- 4-state deterministic UI for hostel loading: `Loading`, `Success`, `Empty`, and `Error` with retry capabilities.
- Stale-token defense ensuring pre-registration endpoints never fail due to expired session artifacts.
- Silent access token refresh via Axios response interceptors preventing unexpected logouts.

### 3. 🛍️ Campus Marketplace & Borrow Tracker
- Buy, sell, exchange, or giveaway student items with condition badges.
- Item borrowing request workflow with owner approval and return-date reminders.
- Multi-category filtering (`Electronics`, `Cycles`, `Books`, `Furniture`, etc.).

### 4. 📚 Academic Study Repository
- Instant search and filtering of university notes, PYQs, and semester study guides.
- Course code, department, and resource type filtering.
- One-click downloads with real-time counters.

### 5. 📢 Verified Campus Notices & Event Boards
- Priority announcements (`Urgent`, `Important`, `Normal`) attributed to verified administration.
- Campus event discovery with RSVP tracking and date countdowns.

### 6. 💬 Direct & Group Student Messaging
- 1-on-1 private conversations without exposing phone numbers.
- Private hostel group chats with member management, attachments, and reaction badges.

---

## 🚀 Local Development Setup

### Prerequisites
- Node.js (v18.0 or higher)
- npm or yarn

### 1. Clone Repository
```bash
git clone https://github.com/siddharth194thakur-gif/Hostel-Talkies-Frontend.git
cd Hostel-Talkies-Frontend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the root directory:
```env
VITE_API_URL=http://localhost:8000
```
*(In production, set `VITE_API_URL` to your live backend endpoint, e.g. `https://hostel-talkies-backend-1.onrender.com`).*

### 4. Start Local Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📦 Production Build

To create an optimized production build:
```bash
npm run build
```
Build output is saved to the `dist/` directory, ready to be served by Vercel, Netlify, or any static hosting service.

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
