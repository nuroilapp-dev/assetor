# TRakio Asset Management System - Quick Reference

## 🚀 Running the Application

### Start Everything (Recommended)
```bash
npm run dev
```
This starts both the backend server and frontend web app concurrently.

### Start Components Separately
```bash
# Backend only
cd server
npm run dev

# Frontend only
cd apps/web
npm run web
```

---

## 🌐 Access URLs

- **Frontend Web App**: http://localhost:19006
- **Backend API**: http://localhost:5023/api
- **API Health Check**: http://localhost:5023

---

## 🔑 Default Login Credentials

- **Email**: `vishnu@nurac.com`
- **Password**: `admin123`
- **Role**: SUPER_ADMIN

---

## 📊 Database Configuration

- **Host**: localhost
- **User**: root
- **Password**: (empty)
- **Database**: software_db
- **Port**: 3306 (default MySQL)

---

## ⚙️ Environment Variables

### Backend (.env in /server)
```
PORT=5023
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=software_db
JWT_SECRET=trakio_super_secret_key_2026
NODE_ENV=development
```

### Frontend (.env in /apps/web)
```
EXPO_PUBLIC_API_URL=http://localhost:5023/api
```

---

## 🔧 Troubleshooting

### Port Conflicts
If you see port conflicts, the app will automatically suggest alternative ports.

### Login Issues
1. Click the **Logout** button in the sidebar
2. Or clear browser storage:
   ```javascript
   localStorage.clear();
   sessionStorage.clear();
   location.reload();
   ```

### Vector Icons Warning
The warning about `@react-native-vector-icons` is harmless and can be ignored. Icons will still work correctly on web.

### Database Connection Issues
1. Ensure MySQL is running
2. Verify database `software_db` exists
3. Check credentials in `/server/.env`

---

## 📁 Project Structure

```
Asset Web/
├── server/              # Backend (Node.js + Express)
│   ├── config/         # Database & config
│   ├── controllers/    # Business logic
│   ├── routes/         # API routes
│   ├── middleware/     # Auth & validation
│   └── scripts/        # Utility scripts
├── apps/web/           # Frontend (React Native Web + Expo)
│   └── src/
│       ├── screens/    # UI screens
│       ├── components/ # Reusable components
│       ├── store/      # State management (Zustand)
│       └── api/        # API client
└── db/                 # Database schemas

```

---

## 🛠️ Useful Scripts

### Check Users in Database
```bash
cd server
node scripts/check_users.js
```

### Check Specific User
```bash
cd server
node scripts/check_vishnu.js
```

---

## 📝 Notes

- The app uses **JWT authentication** with 24-hour token expiration
- **Multi-tenant** architecture with company isolation
- **Role-based access control** (SUPER_ADMIN, ADMIN, EMPLOYEE)
- Web app runs on **Expo** with React Native Web for cross-platform compatibility

---

**Last Updated**: 2026-01-23
**Version**: 1.0.0
