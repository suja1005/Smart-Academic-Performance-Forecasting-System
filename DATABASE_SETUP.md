# 📊 Database Setup Guide - Smart Academic Performance Forecasting System

## ✅ Database Integration Complete!

Your application now has **full database support** for storing and retrieving student predictions!

---

## 🗂️ **What's New?**

### **Backend Files Created:**
- **[server.ts](../server.ts)** - Express backend server with SQLite database
- **[services/databaseService.ts](../services/databaseService.ts)** - API client for database operations

### **Database Schema:**
```sql
predictions (
  id INT PRIMARY KEY,
  studentId TEXT,
  studentName TEXT,
  studentEmail TEXT,
  department TEXT,
  attendance REAL,
  internalMarks REAL,
  assignmentScores REAL,
  studyHours REAL,
  previousGPA REAL,
  riskLevel TEXT,
  predictionScore INTEGER,
  suggestions TEXT (JSON),
  modelUsed TEXT,
  createdAt DATETIME,
  updatedAt DATETIME
)
```

### **Updated Views:**
- **[StudentDashboard.tsx](../views/StudentDashboard.tsx)** - Now saves predictions to database
- **[FacultyDashboard.tsx](../views/FacultyDashboard.tsx)** - View all student predictions
- **[SuperAdminDashboard.tsx](../views/SuperAdminDashboard.tsx)** - Real-time analytics and statistics

---

## 🚀 **How to Run (2 Options)**

### **Option 1: Run Both Frontend + Backend (RECOMMENDED)**
```bash
npm run dev:full
```
This starts both the server and frontend automatically
- Backend: `http://localhost:3001`
- Frontend: `http://localhost:5173`

### **Option 2: Run Separately**

**Terminal 1 - Start Backend:**
```bash
npm run server
```
Backend will be available at `http://localhost:3001`

**Terminal 2 - Start Frontend:**
```bash
npm run dev
```
Frontend will be available at `http://localhost:5173`

---

## 📝 **Workflow**

### **Student Dashboard:**
1. Login as STUDENT
2. Adjust performance indicators (attendance, marks, etc.)
3. Click "Run Random Forest Forecast"
4. ✅ Prediction is saved to database automatically
5. See confirmation message

### **Faculty Dashboard:**
1. Login as FACULTY
2. View all student predictions in real-time
3. Filter by risk level or search by student name
4. See statistics: Low Risk, Medium Risk, High Risk counts
5. View charts: Risk Distribution & Score Distribution
6. Delete records if needed

### **Super Admin Dashboard:**
1. Login as SUPER_ADMIN
2. See real-time analytics:
   - Total predictions
   - Average performance score
   - Low/Medium/High risk breakdown
   - Department-wise performance
3. See charts: Risk Distribution, Departmental Performance
4. Monitor system health

---

## 🔌 **API Endpoints**

The backend provides these REST API endpoints:

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/predictions` | Store a new prediction |
| GET | `/api/predictions` | Get all predictions (Faculty/Admin view) |
| GET | `/api/predictions/student/:studentId` | Get predictions for specific student |
| GET | `/api/analytics` | Get system analytics (Admin) |
| DELETE | `/api/predictions/:id` | Delete a prediction record |
| GET | `/api/health` | Check server health |

---

## 📊 **Test Logins**

```
STUDENT:
- Username: student
- Password: 123456

FACULTY:
- Username: faculty
- Password: 123456

SUPER_ADMIN:
- Username: admin
- Password: 123456
```

---

## 💾 **Database File Location**

SQLite database is created at:
```
c:\Users\sujak\Downloads\smart-academic-performance-forecasting-system\predictions.db
```

To reset database, simply delete this file and restart the server.

---

## 🛠️ **Troubleshooting**

### **"Server is not running" error in Student Dashboard:**
- Make sure you ran `npm run dev:full` or `npm run server` first
- Backend must be running on port 3001

### **"Port 3001 already in use":**
```bash
# Find and kill process on port 3001
netstat -ano | findstr :3001
taskkill /PID <PID> /F
```

### **Database not saving:**
- Check if backend is running
- Look at backend console for errors
- Ensure `predictions.db` file can be created in the project directory

### **Slow loading:**
- First time load might be slow (creating database)
- Refresh the page to see updates from database

---

## 📦 **Installed Packages**

**Frontend:**
- react, react-dom, react-router-dom
- @google/genai (for AI suggestions)
- recharts (for charts)

**Backend:**
- express (REST API server)
- better-sqlite3 (SQLite database)
- cors (Cross-origin support)
- tsx (TypeScript execution)

**Dev Tools:**
- typescript
- vite
- concurrently (run multiple commands)

---

## 🎯 **Feature Summary**

✅ **Real-time Database Storage** - Predictions saved automatically  
✅ **Faculty Monitoring** - View all student predictions and statistics  
✅ **Admin Analytics** - System-wide insights and metrics  
✅ **Risk Assessment** - Auto-calculate and categorize student risk levels  
✅ **AI Suggestions** - Personalized advice using Google Gemini API  
✅ **Charts & Visualization** - Interactive dashboards with recharts  
✅ **Search & Filter** - Find predictions by student, department, risk level  
✅ **Data Management** - Delete/manage prediction records  

---

## 🚨 **Important Notes**

1. **API Key Required:** Set your Gemini API key in `.env` file before first use
2. **Backend First:** Always start backend before frontend
3. **Database Single-threaded:** SQLite is file-based, suitable for small-medium scale
4. **For Production:** Consider migrating to PostgreSQL or MySQL

---

## 📞 **Support**

If you encounter any issues:
1. Check backend console for errors
2. Verify port 3001 is available
3. Ensure all dependencies are installed: `npm install`
4. Clear npm cache: `npm cache clean --force`
5. Reinstall: `rm node_modules && npm install`

---

**Happy forecasting! 🎓📈**
