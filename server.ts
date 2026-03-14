import express from 'express';
import { createServer as createViteServer } from 'vite';
import nodemailer from 'nodemailer';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, updateDoc, doc, getDocs, query, orderBy, deleteDoc, writeBatch } from 'firebase/firestore';
import firebaseConfig from './firebase-applet-config.json';

const app = express();
app.use(express.json());

const PORT = 3000;

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId);

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
app.get('/api/admin/recipients', superAdminAuth, async (req, res) => {
  try {
    const snapshot = await getDocs(collection(db, 'recipients'));
    const recipients = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(recipients);
  } catch (error) {
    console.error('Error fetching recipients:', error);
    res.status(500).json({ error: 'Failed to fetch recipients' });
  }
});

app.post('/api/admin/recipients', superAdminAuth, async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });
    
    const docRef = await addDoc(collection(db, 'recipients'), {
      email,
      addedAt: new Date().toISOString()
    });
    res.json({ id: docRef.id, email });
  } catch (error) {
    console.error('Error adding recipient:', error);
    res.status(500).json({ error: error instanceof Error ? `Database Error: ${error.message}` : 'Failed to add recipient' });
  }
});

app.delete('/api/admin/recipients/:id', superAdminAuth, async (req, res) => {
  try {
    await deleteDoc(doc(db, 'recipients', req.params.id));
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting recipient:', error);
    res.status(500).json({ error: error instanceof Error ? `Database Error: ${error.message}` : 'Failed to delete recipient' });
  }
});

app.get('/api/admin/leads', adminAuth, async (req, res) => {
  try {
    const q = query(collection(db, 'leads'), orderBy('date', 'desc'));
    const snapshot = await getDocs(q);
    const leads = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(leads);
  } catch (error) {
    console.error('Error fetching leads:', error);
    res.status(500).json({ error: 'Failed to fetch leads' });
  }
});

app.delete('/api/admin/leads', adminAuth, async (req, res) => {
  try {
    const snapshot = await getDocs(collection(db, 'leads'));
    const batch = writeBatch(db);
    snapshot.docs.forEach((d) => {
      batch.delete(doc(db, 'leads', d.id));
    });
    await batch.commit();
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting leads:', error);
    res.status(500).json({ error: 'Failed to delete leads' });
  }
});

app.delete('/api/admin/leads/:id', adminAuth, async (req, res) => {
  try {
    await deleteDoc(doc(db, 'leads', req.params.id));
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting lead:', error);
    res.status(500).json({ error: 'Failed to delete lead' });
  }
});

app.patch('/api/admin/leads/:id', adminAuth, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    await updateDoc(doc(db, 'leads', id), { status });
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating lead:', error);
    res.status(500).json({ error: 'Failed to update lead' });
  }
});

app.post('/api/leads', async (req, res) => {
  const newLead = {
    ...req.body,
    status: 'new',
    date: new Date().toISOString()
  };

  try {
    const docRef = await addDoc(collection(db, 'leads'), newLead);
    const leadWithId = { ...newLead, id: docRef.id };

    // Fetch all recipients
    const recipientsSnapshot = await getDocs(collection(db, 'recipients'));
    let recipientEmails = recipientsSnapshot.docs.map(doc => doc.data().email);
    
    // Fallback to default if list is empty
    if (recipientEmails.length === 0) {
      recipientEmails = ['cpascual1311@gmail.com'];
    }

    // Send email notification to all recipients
    await transporter.sendMail({
      from: `"IronFlow Plumbing Website" <${process.env.EMAIL_USER || 'cpascual1311@gmail.com'}>`,
      to: recipientEmails.join(', '), 
      subject: `New Service Request from ${newLead.name}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0F172A; border-bottom: 2px solid #00E5FF; padding-bottom: 10px;">New Service Request</h2>
          <p>You have received a new service request from the website.</p>
          <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <tr><td style="padding: 8px 0; border-bottom: 1px solid #E2E8F0;"><strong>Name:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #E2E8F0;">${newLead.name}</td></tr>
            <tr><td style="padding: 8px 0; border-bottom: 1px solid #E2E8F0;"><strong>Address:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #E2E8F0;">${newLead.address}</td></tr>
            <tr><td style="padding: 8px 0; border-bottom: 1px solid #E2E8F0;"><strong>Email:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #E2E8F0;">${newLead.email || 'N/A'}</td></tr>
            <tr><td style="padding: 8px 0; border-bottom: 1px solid #E2E8F0;"><strong>Phone:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #E2E8F0;">${newLead.phone || 'N/A'}</td></tr>
            <tr><td style="padding: 8px 0; border-bottom: 1px solid #E2E8F0;"><strong>Service Needed:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #E2E8F0;">${newLead.service}</td></tr>
            <tr><td style="padding: 8px 0; border-bottom: 1px solid #E2E8F0;"><strong>Message:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #E2E8F0;">${newLead.message || 'N/A'}</td></tr>
          </table>
        </div>
      `
    });
    console.log('Email sent successfully for lead:', docRef.id);
    res.json(leadWithId);
  } catch (error) {
    console.error('Failed to process lead:', error);
    res.status(500).json({ error: 'Failed to process lead' });
  }
});

app.patch('/api/leads/:id', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    await updateDoc(doc(db, 'leads', id), { status });
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to update lead:', error);
    res.status(500).json({ error: 'Failed to update lead' });
  }
});

// Vite Middleware for SPA fallback
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
  }

  if (!process.env.VERCEL) {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }
}

startServer();

export default app;
