import 'dotenv/config';
import dotenv from 'dotenv';
dotenv.config({ override: true });
import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import Database from 'better-sqlite3';

// Initialize SQLite Database
let db: any;

function initDB() {
  try {
    let dbPath = path.join(process.cwd(), 'database.sqlite');
    
    if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
      const tmpPath = '/tmp/database.sqlite';
      dbPath = tmpPath;
    }

    console.log('Initializing SQLite Database at:', dbPath);
    db = new Database(dbPath);
    
    // Create tables if they don't exist
    db.exec(`
      CREATE TABLE IF NOT EXISTS leads (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        address TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        service TEXT NOT NULL,
        message TEXT,
        status TEXT NOT NULL,
        date TEXT NOT NULL
      );
    `);
    console.log('SQLite Database successfully initialized');
  } catch (e) {
    console.error('Failed to initialize SQLite:', e);
  }
}

const app = express();
app.use(cors());
app.use(express.json());

// Health check route
app.get('/health', (req, res) => res.status(200).send('OK'));

// API Ping for Admin Dashboard
app.get('/api/ping', (req, res) => {
  try {
    if (db) {
      db.prepare('SELECT 1').get();
      res.json({ status: 'ok', database: 'connected', timestamp: new Date().toISOString() });
    } else {
      res.status(503).json({ status: 'error', database: 'not_initialized', timestamp: new Date().toISOString() });
    }
  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      database: 'error', 
      message: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString() 
    });
  }
} );

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Admin Auth Middleware (Simplified)
const adminAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers['x-admin-auth'];
  if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });
  
  const auth = String(authHeader).toLowerCase();
  if (auth === 'pascual:pascual') {
    next();
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
};

// API Routes
app.get('/api/config', (req, res) => {
  const key = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || '';
  res.json({ apiKey: key });
});

app.get('/api/admin/leads', adminAuth, (req, res) => {
  try {
    const leads = db.prepare('SELECT * FROM leads ORDER BY date DESC').all();
    res.json(leads);
  } catch (error) {
    console.error('Error fetching leads:', error);
    res.status(500).json({ error: 'Failed to fetch leads' });
  }
});

app.delete('/api/admin/leads', adminAuth, (req, res) => {
  try {
    db.prepare('DELETE FROM leads').run();
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting leads:', error);
    res.status(500).json({ error: 'Failed to delete leads' });
  }
});

app.delete('/api/admin/leads/:id', adminAuth, (req, res) => {
  try {
    db.prepare('DELETE FROM leads WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting lead:', error);
    res.status(500).json({ error: 'Failed to delete lead' });
  }
});

app.patch('/api/admin/leads/:id', adminAuth, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    db.prepare('UPDATE leads SET status = ? WHERE id = ?').run(status, id);
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating lead:', error);
    res.status(500).json({ error: 'Failed to update lead' });
  }
});

app.post('/api/leads', async (req, res) => {
  console.log('Received lead submission:', req.body);
  const id = Math.random().toString(36).substring(2, 15);
  const date = new Date().toISOString();
  const status = 'new';
  const { name, address, email, phone, service, message } = req.body;

  if (!name || !address || !service) {
    return res.status(400).json({ error: 'Name, address, and service are required' });
  }

  try {
    db.prepare(`
      INSERT INTO leads (id, name, address, email, phone, service, message, status, date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, name, address, email, phone, service, message, status, date);

    res.json({ id, name, address, email, phone, service, message, status, date });
  } catch (error) {
    console.error('Failed to process lead:', error);
    res.status(500).json({ error: 'Failed to process lead', details: error instanceof Error ? error.message : String(error) });
  }
});

app.all('/api/*', (req, res) => {
  res.status(404).json({ error: `API route not found: ${req.method} ${req.url}` });
});

// Initialize DB
initDB();

// Serve static files
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else if (!process.env.VERCEL) {
  const distPath = path.join(process.cwd(), 'dist');
  if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api')) return next();
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }
}

export default app;

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}
