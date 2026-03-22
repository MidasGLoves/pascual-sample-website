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
let db: any;

function initDB() {
  try {
    // In Vercel/serverless, the root directory is often read-only.
    // We try to use /tmp if we detect a serverless environment or if the default path fails.
    let dbPath = path.join(process.cwd(), 'database.sqlite');
    
    if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
      // On Vercel, /tmp is the only writable directory
      const tmpPath = '/tmp/database.sqlite';
      // If the local db exists, we could try to copy it to /tmp, but for now let's just use /tmp
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

      CREATE TABLE IF NOT EXISTS recipients (
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL,
        addedAt TEXT NOT NULL
      );
    `);
    console.log('SQLite Database successfully initialized');
  } catch (e) {
    console.error('Failed to initialize SQLite:', e);
    // Don't exit process, allow server to start but API calls will fail gracefully
  }
}

const app = express();
app.use(cors());
app.use(express.json());

// Health check route - very top
app.get('/health', (req, res) => res.status(200).send('OK'));

// API Ping for Admin Dashboard
app.get('/api/ping', (req, res) => {
  try {
    // Check if DB is initialized and working
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
});

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

const PORT = 3000;

// Email configuration
let transporter: nodemailer.Transporter;

function initEmail() {
  const user = process.env.EMAIL_USER || 'cpascual1311@gmail.com';
  const pass = process.env.EMAIL_PASS || 'uiie ohzv gvdw ncth';
  
  console.log('Initializing email with user:', user);
  
  if (!pass || pass.length < 4) {
    console.error('CRITICAL: EMAIL_PASS is missing or too short!');
  }

  transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // use SSL
    auth: {
      user: user,
      pass: pass
    },
    tls: {
      // do not fail on invalid certs
      rejectUnauthorized: false
    }
  });

  // Verify connection configuration
  transporter.verify((error, success) => {
    if (error) {
      console.error('Email transporter verification failed:', error);
      // Try fallback to port 587 if 465 fails
      if (error.message.includes('ETIMEDOUT') || error.message.includes('ECONNREFUSED')) {
        console.log('Attempting fallback to port 587...');
        transporter = nodemailer.createTransport({
          host: 'smtp.gmail.com',
          port: 587,
          secure: false, // upgrade later with STARTTLS
          auth: {
            user: user,
            pass: pass
          },
          tls: {
            rejectUnauthorized: false
          }
        });
      }
    } else {
      console.log('Email transporter is ready to send messages');
    }
  });
}

// Admin Auth Middleware
const adminAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers['x-admin-auth'];
  if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });
  
  const auth = String(authHeader).toLowerCase();
  if (auth === 'pascual:pascual' || auth === 'sword:roses') {
    next();
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
};

const superAdminAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers['x-admin-auth'];
  if (!authHeader) return res.status(403).json({ error: 'Forbidden' });
  
  const auth = String(authHeader).toLowerCase();
  if (auth === 'sword:roses') {
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
  const key = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || '';
  console.log('GET /api/config hit. Key length:', key.length, 'Key starts with:', key.substring(0, 7));
  res.json({ apiKey: key });
});

// Test Email Route (Admin only)
app.get('/api/admin/test-email', superAdminAuth, async (req, res) => {
  try {
    if (!transporter) {
      return res.status(500).json({ error: 'Transporter not initialized' });
    }
    
    // Fetch all recipients from DB
    const recipients = db.prepare('SELECT email FROM recipients').all() as { email: string }[];
    let recipientEmails = recipients.map(r => r.email);
    
    const defaultEmail = process.env.EMAIL_USER || 'cpascual1311@gmail.com';
    
    // If no recipients in DB, use the default email
    if (recipientEmails.length === 0) {
      recipientEmails = [defaultEmail];
    }
    
    console.log('Verifying transporter...');
    await transporter.verify();
    
    console.log('Sending test email FROM:', defaultEmail, 'TO:', recipientEmails.join(', '));
    
    const info = await transporter.sendMail({
      from: `"IronFlow Test" <${defaultEmail}>`,
      to: recipientEmails.join(', '),
      subject: 'Test Email - IronFlow Plumbing',
      text: `If you see this, email sending is working! 
      
This test was triggered from the admin dashboard.
It was sent from: ${defaultEmail}
It was sent to: ${recipientEmails.join(', ')}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
          <h2 style="color: #0f172a;">IronFlow Email Test</h2>
          <p>If you see this, email sending is working correctly!</p>
          <p><strong>Sent From:</strong> ${defaultEmail}</p>
          <p><strong>Sent To:</strong> ${recipientEmails.join(', ')}</p>
          <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #666;">This test was triggered from the IronFlow Admin Dashboard.</p>
        </div>
      `
    });
    
    console.log('Test email sent successfully:', info.messageId);
    res.json({ 
      success: true, 
      message: `Test email sent successfully to: ${recipientEmails.join(', ')}`, 
      messageId: info.messageId 
    });
  } catch (error) {
    console.error('Test email failed:', error);
    res.status(500).json({ 
      error: 'Test email failed', 
      details: error instanceof Error ? error.message : String(error)
    });
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
    
    const defaultEmail = process.env.EMAIL_USER || 'cpascual1311@gmail.com';
    
    // Fallback to default if list is empty
    if (recipientEmails.length === 0) {
      console.log('No recipients found in DB, using fallback');
      recipientEmails = [defaultEmail];
    }

    console.log('Sending email FROM:', defaultEmail, 'TO:', recipientEmails.join(', '));
    
    // Send email notification - handle errors but don't crash the response if possible
    // We await it here to ensure we know if it failed, but we could also do it in the background
    try {
      if (!transporter) {
        throw new Error('Email transporter not initialized');
      }
      
      await transporter.sendMail({
        from: `"IronFlow Plumbing Website" <${defaultEmail}>`,
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

// Initialize DB and Email
initDB();
initEmail();

// Serve static files (for local development)
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else if (!process.env.VERCEL) {
  // Local production mode
  const distPath = path.join(process.cwd(), 'dist');
  if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api')) return next();
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }
}

// For Vercel/Serverless: Export the app
export default app;

// For local development: Start the server if not running as a module
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}
