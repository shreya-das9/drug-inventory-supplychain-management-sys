
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

export const sendBleAlertEmail = async ({ tracking, to } = {}) => {
  const mailer = getEmailTransporter();

  if (!tracking) {
    throw new Error("Missing tracking payload for BLE alert email");
  }

  const recipient = to || process.env.BLE_ALERT_EMAIL || process.env.EMAIL_USER;

  if (!recipient) {
    throw new Error("No recipient configured for BLE alert email");
  }

  const fromAddress = process.env.EMAIL_FROM || process.env.EMAIL_USER;
  const timestamp = new Date(tracking.timestamp || Date.now()).toLocaleString();

  const subject = `BLE ALERT: ${tracking.batchId} exceeded temperature threshold`;
  const text = [
    "BLE Alert Triggered",
    `Device ID: ${tracking.deviceId}`,
    `Batch ID: ${tracking.batchId}`,
    `Temperature: ${tracking.temperature}°C`,
    `Status: ${tracking.status}`,
    `Timestamp: ${timestamp}`
  ].join("\n");

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.5;">
      <h2 style="color:#dc2626;">BLE Alert Triggered</h2>
      <p>A BLE temperature alert was detected.</p>
      <ul>
        <li><strong>Device ID:</strong> ${tracking.deviceId}</li>
        <li><strong>Batch ID:</strong> ${tracking.batchId}</li>
        <li><strong>Temperature:</strong> ${tracking.temperature}°C</li>
        <li><strong>Status:</strong> ${tracking.status}</li>
        <li><strong>Timestamp:</strong> ${timestamp}</li>
      </ul>
    </div>
  `;

  return mailer.sendMail({
    from: fromAddress,
    to: recipient,
    subject,
    text,
    html
  });
};
