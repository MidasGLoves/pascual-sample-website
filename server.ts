import 'dotenv/config';
import dotenv from 'dotenv';
dotenv.config({ override: true });
import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import path from 'path';
import fs from 'fs';
import Database from 'better-sqlite3';

// Initialize SQLite Database
let db: Database.Database;

const app = express();
app.use(cors());
app.use(express.json());

// Health check route - very top
app.get('/health', (req, res) => res.status(200).send('OK'));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

const PORT = 3000;

// Email configuration
let transporter: nodemailer.Transporter;

function initEmail() {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER || 'cpascual1311@gmail.com',
      pass: process.env.EMAIL_PASS || 'uiie ohzv gvdw ncth'
    }
  });
}

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
  if (authHeader === 'sword:roses') {
    next();
  } else {
    res.status(403).json({ error: 'Forbidden: Super Admin only' });
  }
};

// API Routes
app.get('/api/ping', (req, res) => {
  res.json({ message: 'pong', timestamp: new Date().toISOString() });
});

app.get('/api/config', (req, res) => {
  const key = process.env.GEMINI_API_KEY || '';
  console.log('GET /api/config hit. Key length:', key.length, 'Key starts with:', key.substring(0, 7));
  res.json({ apiKey: key });
});

// Test Email Route (Admin only)
app.get('/api/admin/test-email', superAdminAuth, async (req, res) => {
  try {
    if (!transporter) {
      return res.status(500).json({ error: 'Transporter not initialized' });
    }
    await transporter.verify();
    await transporter.sendMail({
      from: `"IronFlow Test" <${process.env.EMAIL_USER || 'cpascual1311@gmail.com'}>`,
      to: 'cpascual1311@gmail.com',
      subject: 'Test Email',
      text: 'If you see this, email sending is working!'
    });
    res.json({ success: true, message: 'Test email sent successfully' });
  } catch (error) {
    console.error('Test email failed:', error);
    res.status(500).json({ error: 'Test email failed', details: error instanceof Error ? error.message : String(error) });
  }
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
  console.log('Received lead submission:', req.body);
  const id = Math.random().toString(36).substring(2, 15);
  const date = new Date().toISOString();
  const status = 'new';
  const { name, address, email, phone, service, message } = req.body;

  if (!name || !address || !service) {
    return res.status(400).json({ error: 'Name, address, and service are required' });
  }

  try {
    console.log('Saving lead to database...');
    db.prepare(`
      INSERT INTO leads (id, name, address, email, phone, service, message, status, date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, name, address, email, phone, service, message, status, date);

    const leadWithId = { id, name, address, email, phone, service, message, status, date };

    // Fetch all recipients
    console.log('Fetching recipients...');
    const recipients = db.prepare('SELECT email FROM recipients').all() as { email: string }[];
    let recipientEmails = recipients.map(r => r.email);
    
    // Fallback to default if list is empty
    if (recipientEmails.length === 0) {
      console.log('No recipients found in DB, using fallback');
      recipientEmails = ['cpascual1311@gmail.com'];
    }

    console.log('Sending email to:', recipientEmails.join(', '));
    
    // Send email notification - handle errors but don't crash the response if possible
    // We await it here to ensure we know if it failed, but we could also do it in the background
    try {
      if (!transporter) {
        throw new Error('Email transporter not initialized');
      }
      
      await transporter.sendMail({
        from: `"IronFlow Plumbing Website" <${process.env.EMAIL_USER || 'cpascual1311@gmail.com'}>`,
        to: recipientEmails.join(', '), 
        subject: `New Service Request from ${name}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #E2E8F0; border-radius: 8px; overflow: hidden;">
            <div style="background-color: #0F172A; color: #00E5FF; padding: 20px; text-align: center;">
              <h1 style="margin: 0; font-size: 24px;">New Service Request</h1>
            </div>
            <div style="padding: 30px; background-color: #FFFFFF;">
              <p style="font-size: 16px; color: #475569; margin-bottom: 24px;">You have received a new service request from the website.</p>
              <table style="width: 100%; border-collapse: collapse;">
                <tr><td style="padding: 12px 0; border-bottom: 1px solid #F1F5F9; color: #64748B; width: 140px;"><strong>Name:</strong></td><td style="padding: 12px 0; border-bottom: 1px solid #F1F5F9; color: #1E293B;">${name}</td></tr>
                <tr><td style="padding: 12px 0; border-bottom: 1px solid #F1F5F9; color: #64748B;"><strong>Address:</strong></td><td style="padding: 12px 0; border-bottom: 1px solid #F1F5F9; color: #1E293B;">${address}</td></tr>
                <tr><td style="padding: 12px 0; border-bottom: 1px solid #F1F5F9; color: #64748B;"><strong>Email:</strong></td><td style="padding: 12px 0; border-bottom: 1px solid #F1F5F9; color: #1E293B;">${email || 'N/A'}</td></tr>
                <tr><td style="padding: 12px 0; border-bottom: 1px solid #F1F5F9; color: #64748B;"><strong>Phone:</strong></td><td style="padding: 12px 0; border-bottom: 1px solid #F1F5F9; color: #1E293B;">${phone || 'N/A'}</td></tr>
                <tr><td style="padding: 12px 0; border-bottom: 1px solid #F1F5F9; color: #64748B;"><strong>Service Needed:</strong></td><td style="padding: 12px 0; border-bottom: 1px solid #F1F5F9; color: #1E293B;">${service}</td></tr>
                <tr><td style="padding: 12px 0; border-bottom: 1px solid #F1F5F9; color: #64748B;"><strong>Message:</strong></td><td style="padding: 12px 0; border-bottom: 1px solid #F1F5F9; color: #1E293B;">${message || 'N/A'}</td></tr>
              </table>
              <div style="margin-top: 30px; text-align: center;">
                <a href="${process.env.APP_URL || 'https://ais-dev-uulb7ebalcioziu56ahn3n-430307366333.asia-east1.run.app'}/admin" style="background-color: #00E5FF; color: #0F172A; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">View in Dashboard</a>
              </div>
            </div>
            <div style="background-color: #F8FAFC; padding: 15px; text-align: center; font-size: 12px; color: #94A3B8;">
              Sent from IronFlow Plumbing Website
            </div>
          </div>
        `
      });
      console.log('Email sent successfully');
    } catch (emailError) {
      console.error('Email sending failed but lead was saved:', emailError);
      // We still return 200 because the lead was saved in the DB
      return res.json({ ...leadWithId, emailError: 'Lead saved but notification email failed to send' });
    }
    
    res.json(leadWithId);
  } catch (error) {
    console.error('Failed to process lead:', error);
    res.status(500).json({ error: 'Failed to process lead', details: error instanceof Error ? error.message : String(error) });
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
  console.log('Starting server initialization...');
  
  try {
    const dbPath = path.join(process.cwd(), 'database.sqlite');
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

      CREATE TABLE IF NOT EXISTS recipients (
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL,
        addedAt TEXT NOT NULL
      );
    `);
    console.log('SQLite Database initialized at', dbPath);
  } catch (e) {
    console.error('Failed to initialize SQLite:', e);
    process.exit(1);
  }
  
  try {
    initEmail();
    console.log('Email transporter initialized');
    transporter.verify().then(() => {
      console.log('Email transporter verified and ready');
    }).catch(err => {
      console.error('Email transporter verification failed:', err);
    });
  } catch (e) {
    console.error('Failed to initialize email:', e);
  }

  // Serve static files
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    console.log('Checking for static files at:', distPath);
    if (fs.existsSync(distPath)) {
      console.log('Static files found, mounting express.static');
      app.use(express.static(distPath));
      // SPA fallback
      app.get('*', (req, res, next) => {
        if (req.path.startsWith('/api')) return next();
        res.sendFile(path.join(distPath, 'index.html'));
      });
    } else {
      console.warn('Static files NOT found at:', distPath);
    }
  }

  console.log('Attempting to start server on port', PORT);
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server successfully started and listening on http://0.0.0.0:${PORT}`);
  });

  server.on('error', (err: any) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`Port ${PORT} is already in use. This is expected if the dev server is restarting.`);
    } else {
      console.error('SERVER ERROR EVENT:', err);
    }
  });

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

// Global process error handlers
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

console.log('Executing startServer...');
startServer().catch(err => {
  console.error('CRITICAL: Failed to start server function:', err);
  process.exit(1);
});
