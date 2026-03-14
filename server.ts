import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import path from 'path';
import fs from 'fs';
import Database from 'better-sqlite3';

// Initialize SQLite Database
const dbPath = path.join(process.cwd(), 'database.sqlite');
const db = new Database(dbPath);

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

  CREATE TABLE IF NOT EXISTS recipients (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL,
    addedAt TEXT NOT NULL
  );
`);

const app = express();
app.use(cors());
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

const PORT = 3000;

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'cpascual1311@gmail.com',
    pass: process.env.EMAIL_PASS || 'uiie ohzv gvdw ncth'
  }
});

// Admin Auth Middleware
const adminAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers['x-admin-auth'];
  if (authHeader === 'PASCUAL:PASCUAL' || authHeader === 'SWORD:ROSES') {
    next();
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
};

const superAdminAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers['x-admin-auth'];
  if (authHeader === 'SWORD:ROSES') {
    next();
  } else {
    res.status(403).json({ error: 'Forbidden: Super Admin only' });
  }
};

// API Routes
app.get('/api/ping', (req, res) => {
  res.json({ message: 'pong', timestamp: new Date().toISOString() });
});

app.get('/api/admin/recipients', superAdminAuth, (req, res) => {
  try {
    const recipients = db.prepare('SELECT * FROM recipients').all();
    res.json(recipients);
  } catch (error) {
    console.error('Error fetching recipients:', error);
    res.status(500).json({ error: 'Failed to fetch recipients' });
  }
});

app.post('/api/admin/recipients', superAdminAuth, (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    
    const id = Math.random().toString(36).substring(2, 15);
    const addedAt = new Date().toISOString();
    
    db.prepare('INSERT INTO recipients (id, email, addedAt) VALUES (?, ?, ?)').run(id, email, addedAt);
    
    res.json({ id, email });
  } catch (error) {
    console.error('Error adding recipient:', error);
    res.status(500).json({ error: 'Database Error' });
  }
});

app.delete('/api/admin/recipients/:id', superAdminAuth, (req, res) => {
  try {
    db.prepare('DELETE FROM recipients WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting recipient:', error);
    res.status(500).json({ error: 'Failed to delete recipient' });
  }
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
  const id = Math.random().toString(36).substring(2, 15);
  const date = new Date().toISOString();
  const status = 'new';
  const { name, address, email, phone, service, message } = req.body;

  try {
    db.prepare(`
      INSERT INTO leads (id, name, address, email, phone, service, message, status, date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, name, address, email, phone, service, message, status, date);

    const leadWithId = { id, name, address, email, phone, service, message, status, date };

    // Fetch all recipients
    const recipients = db.prepare('SELECT email FROM recipients').all() as { email: string }[];
    let recipientEmails = recipients.map(r => r.email);
    
    // Fallback to default if list is empty
    if (recipientEmails.length === 0) {
      recipientEmails = ['cpascual1311@gmail.com'];
    }

    // Send email notification
    await transporter.sendMail({
      from: `"IronFlow Plumbing Website" <${process.env.EMAIL_USER || 'cpascual1311@gmail.com'}>`,
      to: recipientEmails.join(', '), 
      subject: `New Service Request from ${name}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0F172A; border-bottom: 2px solid #00E5FF; padding-bottom: 10px;">New Service Request</h2>
          <p>You have received a new service request from the website.</p>
          <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <tr><td style="padding: 8px 0; border-bottom: 1px solid #E2E8F0;"><strong>Name:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #E2E8F0;">${name}</td></tr>
            <tr><td style="padding: 8px 0; border-bottom: 1px solid #E2E8F0;"><strong>Address:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #E2E8F0;">${address}</td></tr>
            <tr><td style="padding: 8px 0; border-bottom: 1px solid #E2E8F0;"><strong>Email:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #E2E8F0;">${email || 'N/A'}</td></tr>
            <tr><td style="padding: 8px 0; border-bottom: 1px solid #E2E8F0;"><strong>Phone:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #E2E8F0;">${phone || 'N/A'}</td></tr>
            <tr><td style="padding: 8px 0; border-bottom: 1px solid #E2E8F0;"><strong>Service Needed:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #E2E8F0;">${service}</td></tr>
            <tr><td style="padding: 8px 0; border-bottom: 1px solid #E2E8F0;"><strong>Message:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #E2E8F0;">${message || 'N/A'}</td></tr>
          </table>
        </div>
      `
    });
    
    res.json(leadWithId);
  } catch (error) {
    console.error('Failed to process lead:', error);
    res.status(500).json({ error: 'Failed to process lead' });
  }
});

app.get('/api/leads', adminAuth, (req, res) => {
  try {
    const leads = db.prepare('SELECT * FROM leads ORDER BY date DESC').all();
    res.json(leads);
  } catch (error) {
    console.error('Error fetching leads:', error);
    res.status(500).json({ error: 'Failed to fetch leads' });
  }
});

app.get('/api/leads/:id', adminAuth, (req, res) => {
  try {
    const lead = db.prepare('SELECT * FROM leads WHERE id = ?').get(req.params.id);
    if (lead) {
      res.json(lead);
    } else {
      res.status(404).json({ error: 'Lead not found' });
    }
  } catch (error) {
    console.error('Error fetching lead:', error);
    res.status(500).json({ error: 'Failed to fetch lead' });
  }
});

app.delete('/api/leads/:id', adminAuth, (req, res) => {
  try {
    db.prepare('DELETE FROM leads WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting lead:', error);
    res.status(500).json({ error: 'Failed to delete lead' });
  }
});

app.all('/api/*', (req, res) => {
  console.warn(`Unmatched API request: ${req.method} ${req.url}`);
  res.status(404).json({ error: `API route not found: ${req.method} ${req.url}` });
});

// Start Server
async function startServer() {
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server successfully started and listening on http://0.0.0.0:${PORT}`);
  });

  // Serve static files from dist
  const distPath = path.join(process.cwd(), 'dist');
  if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Global error handler
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('GLOBAL ERROR:', err);
    if (res.headersSent) {
      return next(err);
    }
    res.status(500).json({ 
      error: 'Internal Server Error', 
      message: err instanceof Error ? err.message : String(err)
    });
  });
}

startServer().catch(err => {
  console.error('CRITICAL: Failed to start server function:', err);
});
