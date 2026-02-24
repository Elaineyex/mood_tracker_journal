import express from 'express';
import { createServer as createViteServer } from 'vite';
import Database from 'better-sqlite3';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const app = express();
const PORT = 3000;

// Initialize SQLite Database
const db = new Database('journal.db');
db.exec(`
  CREATE TABLE IF NOT EXISTS journal_entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT,
    mood INTEGER,
    activities TEXT,
    gratitude1 TEXT,
    gratitude2 TEXT,
    gratitude3 TEXT,
    journal TEXT,
    imagePath TEXT
  )
`);

// Setup uploads directory
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

app.use(express.json());
app.use('/uploads', express.static(uploadDir));

// API Routes
app.get('/api/entries', (req, res) => {
  const entries = db.prepare('SELECT * FROM journal_entries ORDER BY date DESC').all();
  res.json(entries.map((e: any) => ({
    ...e,
    activities: JSON.parse(e.activities || '[]')
  })));
});

app.post('/api/entries', upload.single('image'), (req, res) => {
  const { date, mood, activities, gratitude1, gratitude2, gratitude3, journal, imagePath } = req.body;
  
  let finalImagePath = imagePath || null;
  if (req.file) {
    finalImagePath = `/uploads/${req.file.filename}`;
  }

  const stmt = db.prepare(`
    INSERT INTO journal_entries (date, mood, activities, gratitude1, gratitude2, gratitude3, journal, imagePath)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  const info = stmt.run(
    date,
    mood,
    activities, // stringified JSON
    gratitude1,
    gratitude2,
    gratitude3,
    journal,
    finalImagePath
  );
  
  res.json({ id: info.lastInsertRowid });
});

app.put('/api/entries/:id', upload.single('image'), (req, res) => {
  const { id } = req.params;
  const { date, mood, activities, gratitude1, gratitude2, gratitude3, journal, imagePath } = req.body;
  
  let finalImagePath = imagePath || null;
  if (req.file) {
    finalImagePath = `/uploads/${req.file.filename}`;
  }

  const stmt = db.prepare(`
    UPDATE journal_entries 
    SET date = ?, mood = ?, activities = ?, gratitude1 = ?, gratitude2 = ?, gratitude3 = ?, journal = ?, imagePath = ?
    WHERE id = ?
  `);
  
  stmt.run(
    date,
    mood,
    activities,
    gratitude1,
    gratitude2,
    gratitude3,
    journal,
    finalImagePath,
    id
  );
  
  res.json({ success: true });
});

app.delete('/api/entries/:id', (req, res) => {
  const { id } = req.params;
  db.prepare('DELETE FROM journal_entries WHERE id = ?').run(id);
  res.json({ success: true });
});

// Vite middleware for development
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve('dist/index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
