import express from 'express';
import { createServer as createViteServer } from 'vite';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { exec } from 'child_process';

const app = express();
const PORT = 3000;

// Entries directory for .md files
const entriesDir = path.join(process.cwd(), 'entries');
if (!fs.existsSync(entriesDir)) fs.mkdirSync(entriesDir);

// --- YAML frontmatter helpers ---

function parseEntry(content: string): any | null {
  const match = content.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) return null;
  const entry: any = { journal: match[2].trim() };
  for (const line of match[1].split('\n')) {
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) continue;
    const key = line.slice(0, colonIdx).trim();
    const val = line.slice(colonIdx + 1).trim();
    if (key === 'activities') {
      try { entry[key] = JSON.parse(val); } catch { entry[key] = []; }
    } else if (key === 'mood' || key === 'id') {
      entry[key] = Number(val);
    } else {
      entry[key] = val === '' ? null : val;
    }
  }
  return entry;
}

function serializeEntry(entry: any): string {
  return `---
id: ${entry.id}
date: ${entry.date}
mood: ${entry.mood}
activities: ${JSON.stringify(entry.activities || [])}
gratitude1: ${entry.gratitude1 || ''}
gratitude2: ${entry.gratitude2 || ''}
gratitude3: ${entry.gratitude3 || ''}
imagePath: ${entry.imagePath || ''}
---
${entry.journal || ''}`;
}

function getAllEntries(): any[] {
  return fs.readdirSync(entriesDir)
    .filter(f => f.endsWith('.md'))
    .map(f => parseEntry(fs.readFileSync(path.join(entriesDir, f), 'utf-8')))
    .filter(Boolean)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

function findFilename(id: number): string | null {
  return fs.readdirSync(entriesDir).find(f => f.endsWith(`-${id}.md`)) ?? null;
}

// --- Uploads ---
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});
const upload = multer({ storage });

app.use(express.json());
app.use('/uploads', express.static(uploadDir));

// --- API Routes ---

app.get('/api/insights', (req, res) => {
  exec('python3 ingest_clue.py --json', (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return res.status(500).json({ error: 'Failed to get insights' });
    }
    try {
      const data = JSON.parse(stdout);
      res.json(data);
    } catch (e) {
      console.error(`parse error: ${e}`);
      res.status(500).json({ error: 'Failed to parse insights data' });
    }
  });
});

app.get('/api/entries', (req, res) => {
  res.json(getAllEntries());
});

app.post('/api/entries', upload.single('image'), (req, res) => {
  const { date, mood, activities, gratitude1, gratitude2, gratitude3, journal } = req.body;
  const id = Date.now();
  const imagePath = req.file ? `/uploads/${req.file.filename}` : (req.body.imagePath || '');
  const dateStr = date ? new Date(date).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10);
  const entry = {
    id, date, mood: Number(mood),
    activities: JSON.parse(activities || '[]'),
    gratitude1: gratitude1 || '', gratitude2: gratitude2 || '',
    gratitude3: gratitude3 || '', journal: journal || '', imagePath,
  };
  fs.writeFileSync(path.join(entriesDir, `${dateStr}-${id}.md`), serializeEntry(entry));
  res.json({ id });
});

app.put('/api/entries/:id', upload.single('image'), (req, res) => {
  const id = Number(req.params.id);
  const { date, mood, activities, gratitude1, gratitude2, gratitude3, journal } = req.body;
  const imagePath = req.file ? `/uploads/${req.file.filename}` : (req.body.imagePath || '');
  const dateStr = date ? new Date(date).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10);
  const newFilename = `${dateStr}-${id}.md`;
  const oldFilename = findFilename(id);
  if (oldFilename && oldFilename !== newFilename) {
    fs.unlinkSync(path.join(entriesDir, oldFilename));
  }
  const entry = {
    id, date, mood: Number(mood),
    activities: JSON.parse(activities || '[]'),
    gratitude1: gratitude1 || '', gratitude2: gratitude2 || '',
    gratitude3: gratitude3 || '', journal: journal || '', imagePath,
  };
  fs.writeFileSync(path.join(entriesDir, newFilename), serializeEntry(entry));
  res.json({ success: true });
});

app.delete('/api/entries/:id', (req, res) => {
  const filename = findFilename(Number(req.params.id));
  if (filename) fs.unlinkSync(path.join(entriesDir, filename));
  res.json({ success: true });
});

// --- Vite dev middleware ---
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: 'spa' });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
    app.get('*', (req, res) => res.sendFile(path.resolve('dist/index.html')));
  }
  app.listen(PORT, '0.0.0.0', () => console.log(`Server running on http://localhost:${PORT}`));
}

startServer();
