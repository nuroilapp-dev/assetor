# TRakio Asset Management Platform - Project Summary

## 🚀 Overview
**TRakio** is a premium, enterprise-grade Asset Management Platform designed for companies to track assets, manage premises, and handle employee operations. The project has recently undergone a major transformation, migrating from a MySQL-based architecture to a high-performance **PostgreSQL** backend.

---

## 🏗️ Technical Stack
- **Frontend**: React Native (with Expo Web) using **Zustand** for state management and **Material Community Icons**.
- **Backend**: Node.js with Express.
- **Database**: PostgreSQL (migrated from MySQL).
- **Styling**: Premium UI with Glassmorphism effects, modern typography (Inter/Outfit), and a responsive sidebar-based layout.
- **Authentication**: JWT-based secure authentication with Bcrypt password hashing.

---

## 💎 Key Features
### 1. Dynamic Dashboard
- Real-time KPI cards for Total, Assigned, and Available Assets.
- **Asset Usage Trends**: Interactive area charts showing historical data.
- **Asset Health**: Donut charts for visualizing system-wide status.
- **Maintenance Schedule**: Integrated calendar for tracking upcoming service tasks.

### 2. Multi-Tenant Architecture
- Support for multiple companies via `company_id`.
- **Superadmin Role**: Platform-level control over all companies and settings.
- **Company Admin Role**: Managing specific organizational data, departments, and employees.

### 3. Module & Field Builder
- **Customizable Modules**: Admins can define custom sections and sub-modules.
- **Dynamic Forms**: Field builder for creating custom input types (text, dropdowns, files) for premises and assets.
- **Section Area Mapping**: Real-time filtering of fields based on country, premises type, and area.

### 4. Premises Management (Global Asset Display)
- Comprehensive tracking of **Owned** and **Rental** properties.
- **Premises Display**: A specialized screen for visualizing property locations and details.
- Document uploads for property-related files (PDFs/Images).

---

## 📂 Project Structure
```text
D:\Asset Web
├── apps/web           # React Native / Expo Frontend
│   ├── src/components # UI Components (Sidebar, Topbar, Charts)
│   ├── src/store      # Zustand State Management (Auth, UI)
│   └── src/screens    # Dashboard, Login, and Module screens
├── server             # Express Backend
│   ├── controllers    # Business logic (Auth, Assets, Offices)
│   ├── routes         # API Endpoint definitions
│   ├── scripts        # Maintenance & Migration utilities
│   └── config         # Database & Environment configuration
└── db                 # SQL Schema & Seed data
```

---

## 🔄 Recent Achievements
- **PostgreSQL Migration**: Successfully refactored the entire database layer for better scalability and relational integrity.
- **Cleanup**: Removed 100+ legacy migration scripts and temporary logs to streamline the codebase.
- **Branding**: Renamed base administrative roles to **"Superadmin"** for a more premium professional feel.
- **Optimization**: Modularized controller logic and improved SQL query performance.

---

## 🛠️ Getting Started
- **Backend**: `cd server` -> `node index.js` (Port 5032)
- **Frontend**: `cd apps/web` -> `npx expo start --web` (Port 8081)

---
*Created on 2026-02-04*
