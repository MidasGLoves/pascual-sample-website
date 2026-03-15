import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'database.sqlite');
const db = new Database(dbPath);

try {
  const id = Math.random().toString(36).substring(2, 15);
  const email = 'cpascual1311@gmail.com';
  const addedAt = new Date().toISOString();
  db.prepare('INSERT INTO recipients (id, email, addedAt) VALUES (?, ?, ?)').run(id, email, addedAt);
  console.log('Added recipient:', email);
} catch (e) {
  console.error('Failed to add recipient:', e);
}
