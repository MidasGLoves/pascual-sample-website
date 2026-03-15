import nodemailer from 'nodemailer';

async function testEmail() {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'cpascual1311@gmail.com',
      pass: 'uiie ohzv gvdw ncth'
    }
  });

  try {
    console.log('Verifying transporter...');
    await transporter.verify();
    console.log('Transporter verified successfully!');

    console.log('Sending test email...');
    const info = await transporter.sendMail({
      from: '"Test" <cpascual1311@gmail.com>',
      to: 'cpascual1311@gmail.com',
      subject: 'Test Email from IronFlow Plumbing',
      text: 'This is a test email to verify credentials.'
    });
    console.log('Email sent:', info.messageId);
  } catch (error) {
    console.error('Email test failed:', error);
  }
}

testEmail();
