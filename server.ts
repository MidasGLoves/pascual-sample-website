import express from 'express';
import { createServer as createViteServer } from 'vite';
import nodemailer from 'nodemailer';

const app = express();
app.use(express.json());

const PORT = 3000;

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'cpascual1311@gmail.com',
    pass: process.env.EMAIL_PASS || 'uiie ohzv gvdw ncth'
  }
});

// In-memory database for prototype
let leads = [
  {
    id: '1',
    name: 'Sarah Thompson',
    address: '456 Oak Ln, Austin, TX 78704',
    email: 'sarah.t@example.com',
    phone: '(512) 555-0123',
    service: 'Water Heater Service',
    message: 'My tankless water heater is making a strange noise.',
    status: 'new',
    date: new Date(Date.now() - 1000 * 60 * 30).toISOString() // 30 mins ago
  },
  {
    id: '2',
    name: 'David Rodriguez',
    address: '789 Pine Rd, Round Rock, TX 78664',
    email: 'david.r@example.com',
    phone: '',
    service: 'Leak Detection',
    message: 'I think I have a slab leak. Water bill is very high.',
    status: 'contacted',
    date: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() // 2 hours ago
  }
];

let subscribers = [
  {
    id: '1',
    email: 'sarah.t@example.com',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() // 1 day ago
  }
];

// API Routes
const clients: express.Response[] = [];

app.get('/api/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  clients.push(res);

  req.on('close', () => {
    const index = clients.indexOf(res);
    if (index !== -1) {
      clients.splice(index, 1);
    }
  });
});

function notifyClients() {
  clients.forEach(client => client.write(`data: update\n\n`));
}

app.get('/api/leads', (req, res) => {
  res.json(leads);
});

app.post('/api/leads', async (req, res) => {
  const newLead = {
    ...req.body,
    id: Date.now().toString(),
    status: 'new',
    date: new Date().toISOString()
  };
  leads.unshift(newLead); // Add to beginning
  notifyClients();

  // Send email notification
  try {
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
    console.log('Email sent successfully for lead:', newLead.id);
  } catch (error) {
    console.error('Failed to send email:', error);
  }

  res.json(newLead);
});

app.patch('/api/leads/:id', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  leads = leads.map(lead => lead.id === id ? { ...lead, status } : lead);
  notifyClients();
  res.json({ success: true });
});

app.get('/api/subscribers', (req, res) => {
  res.json(subscribers);
});

app.post('/api/subscribe', async (req, res) => {
  const newSub = {
    ...req.body,
    id: Date.now().toString(),
    date: new Date().toISOString()
  };
  subscribers.unshift(newSub);
  notifyClients();

  // Send email notification for new subscriber
  try {
    await transporter.sendMail({
      from: `"IronFlow Plumbing Website" <${process.env.EMAIL_USER || 'cpascual1311@gmail.com'}>`,
      to: process.env.BUSINESS_EMAIL || 'jeitherjjoyd@gmail.com',
      subject: `New Newsletter Subscriber: ${newSub.email}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0F172A; border-bottom: 2px solid #00E5FF; padding-bottom: 10px;">New Subscriber</h2>
          <p>You have a new subscriber to your newsletter.</p>
          <p><strong>Email:</strong> ${newSub.email}</p>
        </div>
      `
    });
    console.log('Email sent successfully for subscriber:', newSub.email);
  } catch (error) {
    console.error('Failed to send email:', error);
  }

  res.json(newSub);
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

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
