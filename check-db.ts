import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'database.sqlite');
const db = new Database(dbPath);

try {
  const recipients = db.prepare('SELECT * FROM recipients').all();
  console.log('Recipients:', recipients);
  
  const leads = db.prepare('SELECT * FROM leads').all();
  console.log('Leads count:', leads.length);
} catch (e) {
  console.error('DB Check failed:', e);
}
