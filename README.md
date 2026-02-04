# TRakio Asset Management System

Enterprise-grade multi-tenant Asset Management Software built with React Native Web, Node.js, and MySQL.

## Project Structure
- `apps/web`: React Native Web frontend (Expo)
- `server/`: Node.js + Express backend
- `db/`: Database schema and seed data

## Prerequisites
- Node.js 18+
- MySQL 8.0
- Expo CLI (`npm install -g expo-cli`)

## Setting Up the Database
1. Open your MySQL client (e.g., MySQL Workbench, phpMyAdmin).
2. Execute the schema script: `db/schema.sql`.
3. Execute the seed script: `db/seed.sql` to create test data.

## Backend Setup
1. Navigate to `server/`.
2. Install dependencies: `npm install`.
3. Create a `.env` file based on `.env.example`:
   ```
   PORT=5021
   DB_HOST=localhost
   DB_USER=your_user
   DB_PASSWORD=your_password
   DB_NAME=trakio_db
   JWT_SECRET=your_super_secret_key
   ```
4. Start the server: `npm start` (or `npm run dev` if configured).

## Frontend Setup
1. Navigate to `apps/web/`.
2. Install dependencies: `npm install`.
3. Start the web app: `npm run web`.

## Default Login
- **Super Admin**: `superadmin@trakio.com` / `password123`
- **Company Admin**: `admin@trakio.com` / `password123`
- **Employee**: `john@trakio.com` / `password123`

## Features
- **Multi-Tenancy**: Data isolation using `company_id`.
- **RBAC**: Super Admin, Company Admin, and Employee roles.
- **Dynamic Modules**: Enable/disable features per company.
- **Enterprise UI**: Modern, responsive dashboard with key metrics and asset tracking.
