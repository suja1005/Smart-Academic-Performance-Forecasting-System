import express, { Request, Response } from 'express';
import Database from 'better-sqlite3';
import path from 'path';
import cors from 'cors';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Database
const dbPath = path.join(__dirname, 'predictions.db');
const db = new Database(dbPath);

// Create tables if they don't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS predictions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    studentId TEXT NOT NULL,
    studentName TEXT NOT NULL,
    studentEmail TEXT NOT NULL,
    department TEXT,
    attendance REAL,
    internalMarks REAL,
    assignmentScores REAL,
    projectMarks REAL,
    previousGPA REAL,
    riskLevel TEXT,
    predictionScore INTEGER,
    suggestions TEXT,
    modelUsed TEXT,
    status TEXT DEFAULT 'pending',
    isRead INTEGER DEFAULT 0,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role TEXT NOT NULL,
    department TEXT,
    rollNumber TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Try to add the 'status' column in case the db was created without it previously
try {
  db.exec(`ALTER TABLE predictions ADD COLUMN status TEXT DEFAULT 'pending'`);
} catch (e: any) {}

// Try to add 'isRead' column
try {
  db.exec(`ALTER TABLE predictions ADD COLUMN isRead INTEGER DEFAULT 0`);
} catch (e: any) {}

// Try to add the 'password' column in case the db was created without it previously
try {
  db.exec(`ALTER TABLE users ADD COLUMN password TEXT`);
} catch (e: any) {}

// Routes

// 1. Store Prediction
app.post('/api/predictions', (req: Request, res: Response) => {
  try {
    const { student, academicDetails, prediction } = req.body;

    // Validate required fields
    if (!student || !academicDetails || !prediction) {
      console.error('Missing required fields:', { student: !!student, academicDetails: !!academicDetails, prediction: !!prediction });
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    console.log('📥 Storing prediction:', { student: student.name, score: prediction.score });

    const stmt = db.prepare(`
      INSERT INTO predictions (
        studentId, studentName, studentEmail, department,
        attendance, internalMarks, assignmentScores, projectMarks, previousGPA,
        riskLevel, predictionScore, suggestions, modelUsed
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      student.id,
      student.name,
      student.email,
      student.department,
      academicDetails.attendance,
      academicDetails.internalMarks,
      academicDetails.assignmentScores,
      academicDetails.projectMarks,
      academicDetails.previousGPA,
      prediction.level,
      prediction.score,
      JSON.stringify(prediction.suggestions),
      prediction.modelUsed
    );

    console.log('✅ Prediction saved with ID:', result.lastInsertRowid);
    res.json({
      success: true,
      message: 'Prediction stored successfully',
      id: result.lastInsertRowid
    });
  } catch (error: any) {
    console.error('❌ Error storing prediction:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 2. Get All Predictions (Faculty/Admin View)
app.get('/api/predictions', (req: Request, res: Response) => {
  try {
    const role = req.query.role as string;
    
    let query = 'SELECT * FROM predictions ORDER BY createdAt DESC';
    
    const stmt = db.prepare(query);
    const predictions = stmt.all();

    res.json({
      success: true,
      data: predictions,
      total: predictions.length
    });
  } catch (error: any) {
    console.error('Error fetching predictions:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 3. Get Predictions for Specific Student
app.get('/api/predictions/student/:studentId', (req: Request, res: Response) => {
  try {
    const { studentId } = req.params;
    
    const stmt = db.prepare('SELECT * FROM predictions WHERE studentId = ? ORDER BY createdAt DESC');
    const predictions = stmt.all(studentId);

    res.json({
      success: true,
      data: predictions,
      total: predictions.length
    });
  } catch (error: any) {
    console.error('Error fetching student predictions:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 4. Get Analytics (Admin Dashboard)
app.get('/api/analytics', (req: Request, res: Response) => {
  try {
    const statsStmt = db.prepare(`
      SELECT 
        COUNT(*) as totalPredictions,
        AVG(predictionScore) as avgScore,
        COUNT(CASE WHEN riskLevel = 'Low Risk' THEN 1 END) as lowRiskCount,
        COUNT(CASE WHEN riskLevel = 'Medium Risk' THEN 1 END) as mediumRiskCount,
        COUNT(CASE WHEN riskLevel = 'High Risk' THEN 1 END) as highRiskCount
      FROM predictions
    `);

    const stats = statsStmt.get();

    const department = db.prepare(`
      SELECT department, COUNT(*) as count, AVG(predictionScore) as avgScore
      FROM predictions
      GROUP BY department
    `).all();

    res.json({
      success: true,
      stats,
      departmentBreakdown: department
    });
  } catch (error: any) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 5. Verify Prediction (Faculty only)
app.put('/api/predictions/:id/verify', (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const stmt = db.prepare(`UPDATE predictions SET status = 'verified', updatedAt = CURRENT_TIMESTAMP WHERE id = ?`);
    const result = stmt.run(id);

    if (result.changes === 0) {
      return res.status(404).json({ success: false, error: 'Prediction not found' });
    }

    res.json({
      success: true,
      message: 'Prediction verified successfully',
      changes: result.changes
    });
  } catch (error: any) {
    console.error('Error verifying prediction:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 5.b Mark as Read
app.put('/api/predictions/:id/read', (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const stmt = db.prepare(`UPDATE predictions SET isRead = 1 WHERE id = ?`);
    const result = stmt.run(id);

    if (result.changes === 0) {
      return res.status(404).json({ success: false, error: 'Prediction not found' });
    }

    res.json({
      success: true,
      message: 'Notification marked as read',
      changes: result.changes
    });
  } catch (error: any) {
    console.error('Error marking as read:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 5. Delete Prediction (Admin only)
app.delete('/api/predictions/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const stmt = db.prepare('DELETE FROM predictions WHERE id = ?');
    const result = stmt.run(id);

    res.json({
      success: true,
      message: 'Prediction deleted successfully',
      changes: result.changes
    });
  } catch (error: any) {
    console.error('Error deleting prediction:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 6. Register User
app.post('/api/register', (req: Request, res: Response) => {
  try {
    const { id, name, email, password, role, department, rollNumber } = req.body;
    
    // Check if email exists
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) {
      return res.status(400).json({ success: false, error: 'Email already registered' });
    }

    const stmt = db.prepare(`
      INSERT INTO users (id, name, email, password, role, department, rollNumber) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(id, name, email, password, role, department, rollNumber);
    
    res.json({ success: true, message: 'User registered successfully' });
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 7. Login User
app.post('/api/login', (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    
    const user: any = db.prepare('SELECT * FROM users WHERE email = ? OR name = ?').get(email, email);
    
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    if (user.password !== password) {
      return res.status(401).json({ success: false, error: 'Invalid password' });
    }

    // Don't send password back
    delete user.password;

    res.json({ success: true, user });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📁 Database: ${dbPath}`);
});
