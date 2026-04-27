/**
 * Notification Service
 * Handles multi-channel notifications (email, SMS, push notifications)
 * Currently implements email notifications through email.service.js
 */

import { getEmailTransporter, sendBleAlertEmail } from "./email.service.js";

// ============================================
// EMAIL NOTIFICATIONS
// ============================================

/**
 * Send low stock alert notification
 * @param {Object} options - Notification options
 * @param {string} options.recipientEmail - Recipient email address
 * @param {string} options.drugName - Name of the drug
 * @param {number} options.currentStock - Current stock level
 * @param {number} options.threshold - Stock threshold
 */
export const sendLowStockAlert = async ({ recipientEmail, drugName, currentStock, threshold }) => {
  try {
    const mailer = getEmailTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: recipientEmail,
      subject: `⚠️ Low Stock Alert: ${drugName}`,
      html: `
        <h2>Low Stock Alert</h2>
        <p><strong>Drug:</strong> ${drugName}</p>
        <p><strong>Current Stock:</strong> ${currentStock} units</p>
        <p><strong>Threshold:</strong> ${threshold} units</p>
        <p>Please replenish stock as soon as possible.</p>
      `
    };

    await mailer.sendMail(mailOptions);
    console.log(`✅ Low stock alert sent to ${recipientEmail}`);
  } catch (error) {
    console.error("❌ Failed to send low stock alert:", error);
    throw error;
  }
};

/**
 * Send expiry alert notification
 * @param {Object} options - Notification options
 * @param {string} options.recipientEmail - Recipient email address
 * @param {string} options.drugName - Name of the drug
 * @param {string} options.batchNumber - Batch number
 * @param {Date} options.expiryDate - Expiry date
 * @param {number} options.daysUntilExpiry - Days remaining until expiry
 */
export const sendExpiryAlert = async ({ recipientEmail, drugName, batchNumber, expiryDate, daysUntilExpiry }) => {
  try {
    const mailer = getEmailTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: recipientEmail,
      subject: `🔔 Expiry Alert: ${drugName} - Batch ${batchNumber}`,
      html: `
        <h2>Product Expiry Alert</h2>
        <p><strong>Drug:</strong> ${drugName}</p>
        <p><strong>Batch:</strong> ${batchNumber}</p>
        <p><strong>Expiry Date:</strong> ${new Date(expiryDate).toLocaleDateString()}</p>
        <p><strong>Days Until Expiry:</strong> ${daysUntilExpiry}</p>
        <p>Please take appropriate action to prevent expired inventory.</p>
      `
    };

    await mailer.sendMail(mailOptions);
    console.log(`✅ Expiry alert sent to ${recipientEmail}`);
  } catch (error) {
    console.error("❌ Failed to send expiry alert:", error);
    throw error;
  }
};

/**
 * Send order confirmation notification
 * @param {Object} options - Notification options
 * @param {string} options.recipientEmail - Recipient email address
 * @param {string} options.orderNumber - Order number
 * @param {number} options.totalAmount - Total order amount
 * @param {Date} options.expectedDelivery - Expected delivery date
 */
export const sendOrderConfirmation = async ({ recipientEmail, orderNumber, totalAmount, expectedDelivery }) => {
  try {
    const mailer = getEmailTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: recipientEmail,
      subject: `✅ Order Confirmed: ${orderNumber}`,
      html: `
        <h2>Order Confirmation</h2>
        <p><strong>Order Number:</strong> ${orderNumber}</p>
        <p><strong>Total Amount:</strong> ₹${totalAmount.toFixed(2)}</p>
        <p><strong>Expected Delivery:</strong> ${new Date(expectedDelivery).toLocaleDateString()}</p>
        <p>Your order has been confirmed and is being processed.</p>
      `
    };

    await mailer.sendMail(mailOptions);
    console.log(`✅ Order confirmation sent to ${recipientEmail}`);
  } catch (error) {
    console.error("❌ Failed to send order confirmation:", error);
    throw error;
  }
};

/**
 * Send shipment status update notification
 * @param {Object} options - Notification options
 * @param {string} options.recipientEmail - Recipient email address
 * @param {string} options.shipmentId - Shipment ID
 * @param {string} options.status - Current shipment status
 * @param {string} options.location - Current location
 */
export const sendShipmentUpdate = async ({ recipientEmail, shipmentId, status, location }) => {
  try {
    const mailer = getEmailTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: recipientEmail,
      subject: `📦 Shipment Update: ${shipmentId}`,
      html: `
        <h2>Shipment Status Update</h2>
        <p><strong>Shipment ID:</strong> ${shipmentId}</p>
        <p><strong>Status:</strong> ${status}</p>
        <p><strong>Location:</strong> ${location}</p>
        <p>We'll keep you updated on your shipment's progress.</p>
      `
    };

    await mailer.sendMail(mailOptions);
    console.log(`✅ Shipment update sent to ${recipientEmail}`);
  } catch (error) {
    console.error("❌ Failed to send shipment update:", error);
    throw error;
  }
};

// ============================================
// BLE ALERTS (via email)
// ============================================

/**
 * Send BLE security alert (wrapper for email service)
 */
export const sendBleSecurityAlert = async (options) => {
  try {
    return await sendBleAlertEmail(options);
  } catch (error) {
    console.error("❌ Failed to send BLE security alert:", error);
    throw error;
  }
};

// ============================================
// PUSH NOTIFICATION STUB (for future implementation)
// ============================================

/**
 * Send push notification (Not yet implemented)
 * @todo Implement with a service like Firebase Cloud Messaging
 */
export const sendPushNotification = async ({ userId, title, message, data }) => {
  console.warn("⚠️ Push notifications not yet implemented");
  // Future implementation with FCM or similar service
};

// ============================================
// SMS NOTIFICATION STUB (for future implementation)
// ============================================

/**
 * Send SMS notification (Not yet implemented)
 * @todo Implement with a service like Twilio
 */
export const sendSmsNotification = async ({ phoneNumber, message }) => {
  console.warn("⚠️ SMS notifications not yet implemented");
  // Future implementation with Twilio or similar service
};

export default {
  sendLowStockAlert,
  sendExpiryAlert,
  sendOrderConfirmation,
  sendShipmentUpdate,
  sendBleSecurityAlert,
  sendPushNotification,
  sendSmsNotification
};
