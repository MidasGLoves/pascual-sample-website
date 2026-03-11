import express from 'express';
import { createServer as createViteServer } from 'vite';
import nodemailer from 'nodemailer';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, updateDoc, doc } from 'firebase/firestore';
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

// API Routes
app.post('/api/leads', async (req, res) => {
  const newLead = {
    ...req.body,
    status: 'new',
    date: new Date().toISOString()
  };

  try {
    const docRef = await addDoc(collection(db, 'leads'), newLead);
    const leadWithId = { ...newLead, id: docRef.id };

    // Send email notification
    await transporter.sendMail({
      from: `"IronFlow Plumbing Website" <${process.env.EMAIL_USER || 'cpascual1311@gmail.com'}>`,
      to: process.env.BUSINESS_EMAIL || 'jeitherjjoyd@gmail.com', // Send to the business owner
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
