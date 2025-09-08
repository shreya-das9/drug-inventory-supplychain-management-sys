
import nodemailer from "nodemailer";

let transporter = null;

// Initialize email service (call this after dotenv.config())
export const initializeEmailService = () => {
  console.log('=== INITIALIZING EMAIL SERVICE ===');
  console.log('EMAIL_USER:', process.env.EMAIL_USER);
  console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? `${process.env.EMAIL_PASS.length} chars` : 'undefined');
  console.log('SMTP_HOST:', process.env.SMTP_HOST);
  console.log('SMTP_PORT:', process.env.SMTP_PORT);
  console.log('EMAIL_FROM:', process.env.EMAIL_FROM);
  console.log('==================================');

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    debug: true, // Enable debug output
  });

  // Test email configuration
  transporter.verify((error, success) => {
    if (error) {
      console.log("❌ Email configuration error:", error);
      console.log("Check your .env file for correct EMAIL_USER and EMAIL_PASS values");
    } else {
      console.log("✅ Email server is ready to send messages");
    }
  });
};

// Get the transporter (use this in routes)
export const getEmailTransporter = () => {
  if (!transporter) {
    throw new Error('Email service not initialized. Call initializeEmailService() first.');
  }
  return transporter;
};
