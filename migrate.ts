/**
 * One-time migration: converts journal.db entries to .md files with YAML frontmatter.
 * Run with: npx tsx migrate.ts
 */
import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

const db = new Database('journal.db');
const entriesDir = path.join(process.cwd(), 'entries');

if (!fs.existsSync(entriesDir)) {
  fs.mkdirSync(entriesDir);
}

const entries = db.prepare('SELECT * FROM journal_entries ORDER BY date ASC').all() as any[];

let count = 0;
for (const e of entries) {
  const activities = JSON.parse(e.activities || '[]');
  const dateStr = e.date ? new Date(e.date).toISOString().slice(0, 10) : 'unknown';
  const id = e.id;

  const content = `---
id: ${id}
date: ${e.date || ''}
mood: ${e.mood ?? 3}
activities: ${JSON.stringify(activities)}
gratitude1: ${e.gratitude1 || ''}
gratitude2: ${e.gratitude2 || ''}
gratitude3: ${e.gratitude3 || ''}
imagePath: ${e.imagePath || ''}
---
${e.journal || ''}`;

  const filename = `${dateStr}-${id}.md`;
  fs.writeFileSync(path.join(entriesDir, filename), content);
  console.log(`  Migrated: ${filename}`);
  count++;
}

console.log(`\nDone. Migrated ${count} entries to entries/`);
db.close();
