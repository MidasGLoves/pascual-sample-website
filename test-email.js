import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'cpascual1311@gmail.com',
    pass: process.env.EMAIL_PASS || 'uiie ohzv gvdw ncth'
  }
});

async function test() {
  try {
    const info = await transporter.sendMail({
      from: `"IronFlow Plumbing Website" <cpascual1311@gmail.com>`,
      to: 'jeither@nascentartny.com',
      subject: `Test Email`,
      text: 'This is a test email.'
    });
    console.log('Success:', info);
  } catch (error) {
    console.error('Error:', error);
  }
}

test();
