/**
 * Notification Service
 * Handles multi-channel notifications (email, SMS, push notifications)
 * Currently implements email notifications through email.service.js
 */

import { getEmailTransporter, sendBleAlertEmail } from "./email.service.js";
import UserModel from "../models/UserModel.js";

// ============================================
// EMAIL NOTIFICATIONS
// ============================================

const formatCurrency = (value) => `₹${Number(value || 0).toFixed(2)}`;

const workflowRoles = ["ADMIN", "WAREHOUSE", "WAREHOUSE_ADMIN"];

const getObjectIdString = (value) => {
  if (!value) return null;
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (typeof value === "object") {
    if (typeof value.toString === "function") {
      const stringValue = value.toString();
      if (stringValue && stringValue !== "[object Object]") {
        return stringValue;
      }
    }

    if (value._id && value._id !== value) {
      return getObjectIdString(value._id);
    }

    if (value.id && value.id !== value) {
      return getObjectIdString(value.id);
    }
  }

  return null;
};

const resolveRetailerUser = async ({ retailerUser, retailerUserId }) => {
  if (retailerUser && (retailerUser.email || retailerUser._id || retailerUser.id)) {
    return retailerUser;
  }

  if (!retailerUserId) {
    return null;
  }

  if (typeof retailerUserId === "object") {
    if (retailerUserId.email && (retailerUserId.name || retailerUserId.role || retailerUserId._id || retailerUserId.id)) {
      return retailerUserId;
    }

    const nestedUserId = retailerUserId.createdBy || retailerUserId.user || retailerUserId.retailerUserId || retailerUserId.owner || null;
    if (nestedUserId && nestedUserId !== retailerUserId) {
      return resolveRetailerUser({ retailerUser: null, retailerUserId: nestedUserId });
    }

    const objectId = retailerUserId._id || retailerUserId.id || null;
    if (objectId) {
      return UserModel.findById(objectId).select("email name role");
    }

    return null;
  }

  return UserModel.findById(retailerUserId).select("email name role");
};

const getNotificationRecipientPolicy = (eventType) => {
  switch (eventType) {
    case 'order_created':
      return { includeRetailer: false, includeWarehouse: true, includeAdmin: false };
    case 'order_approved':
    case 'order_confirmed':
    case 'order_rejected':
      return { includeRetailer: true, includeWarehouse: false, includeAdmin: false };
    case 'shipment_dispatched':
      return { includeRetailer: true, includeWarehouse: false, includeAdmin: false };
    case 'shipment_delayed':
      return { includeRetailer: true, includeWarehouse: false, includeAdmin: true };
    case 'shipment_delivered':
    case 'ble_security_alert':
    case 'delivery_verification_failed':
      return { includeRetailer: true, includeWarehouse: true, includeAdmin: true };
    case 'compliance_event':
      return { includeRetailer: false, includeWarehouse: false, includeAdmin: true };
    default:
      return { includeRetailer: true, includeWarehouse: true, includeAdmin: true };
  }
};

const getWorkflowSubject = ({ eventType, orderNumber, shipmentNumber }) => {
  switch (eventType) {
    case 'order_created':
      return `🆕 Order Created: ${orderNumber || 'Order'}`;
    case 'order_confirmed':
      return `✅ Order Confirmed: ${orderNumber || 'Order'}`;
    case 'order_approved':
      return `✅ Order Approved: ${orderNumber || 'Order'}`;
    case 'order_rejected':
      return `⚠️ Order Rejected: ${orderNumber || 'Order'}`;
    case 'shipment_dispatched':
      return `📦 Shipment Dispatched: ${shipmentNumber || orderNumber || 'Shipment'}`;
    case 'shipment_delayed':
      return `⏱️ Shipment Delayed: ${shipmentNumber || orderNumber || 'Shipment'}`;
    case 'shipment_delivered':
      return `✅ Shipment Delivered: ${shipmentNumber || orderNumber || 'Shipment'}`;
    case 'ble_security_alert':
      return `🔐 BLE Security Alert: ${orderNumber || shipmentNumber || 'Shipment'}`;
    case 'delivery_verification_failed':
      return `⚠️ Delivery Verification Failed: ${orderNumber || shipmentNumber || 'Shipment'}`;
    case 'compliance_event':
      return `🛡️ Compliance Event: ${orderNumber || shipmentNumber || 'Compliance'}`;
    default:
      return `📦 Workflow Update: ${orderNumber || shipmentNumber || 'Workflow'}`;
  }
};

export const resolveWorkflowRecipientEmails = async ({ retailerUserId, retailerUser, includeRetailer, includeWarehouse, includeAdmin, eventType }) => {
  console.info('[NOTIFICATION_EVENT]', { eventName: eventType });
  const recipientEmails = new Set();
  const policy = getNotificationRecipientPolicy(eventType);

  const effectiveIncludeRetailer = includeRetailer ?? policy.includeRetailer;
  const effectiveIncludeWarehouse = includeWarehouse ?? policy.includeWarehouse;
  const effectiveIncludeAdmin = includeAdmin ?? policy.includeAdmin;

  const retailer = await resolveRetailerUser({ retailerUser, retailerUserId });
  const resolvedRetailerId = retailer?._id || retailer?.id || null;
  const resolvedRetailerEmail = retailer?.email || null;

  console.info("[notifications] resolve", {
    eventName: eventType,
    resolvedRecipientIds: [getObjectIdString(resolvedRetailerId)].filter(Boolean),
    resolvedEmailAddresses: resolvedRetailerEmail ? [resolvedRetailerEmail] : [],
    includeRetailer: effectiveIncludeRetailer,
    includeWarehouse: effectiveIncludeWarehouse,
    includeAdmin: effectiveIncludeAdmin,
    retailerUserId: getObjectIdString(retailerUserId),
    retailerUserEmail: retailerUser?.email || null,
  });

  if (effectiveIncludeRetailer && retailer?.email) {
    recipientEmails.add(retailer.email);
  }

  const workflowRecipientDocs = [];
  if (effectiveIncludeWarehouse || effectiveIncludeAdmin) {
    const workflowUsers = await UserModel.find({ role: { $in: effectiveIncludeAdmin && !effectiveIncludeWarehouse ? ["ADMIN"] : workflowRoles } }).select("email role name");
    workflowUsers.forEach((userDoc) => {
      if (userDoc?.email) {
        const shouldInclude = effectiveIncludeWarehouse && ["WAREHOUSE", "WAREHOUSE_ADMIN"].includes(userDoc.role)
          ? true
          : effectiveIncludeAdmin && userDoc.role === "ADMIN"
            ? true
            : false;
        if (shouldInclude) {
          recipientEmails.add(userDoc.email);
          workflowRecipientDocs.push(userDoc);
        }
      }
    });
  }

  const resolvedEmailAddresses = Array.from(recipientEmails);
  const resolvedRecipientIds = [getObjectIdString(resolvedRetailerId), ...workflowRecipientDocs.map((doc) => getObjectIdString(doc._id || doc.id))].filter(Boolean);

  if (resolvedEmailAddresses.length) {
    console.info('[RECIPIENT_RESOLUTION]', {
      eventName: eventType,
      resolvedRecipientIds,
      resolvedEmailAddresses,
    });
  } else {
    console.warn("[notifications] skipped", {
      eventName: eventType,
      resolvedRecipientIds,
      resolvedEmailAddresses,
      reason: "no-recipient-emails",
    });
  }

  return resolvedEmailAddresses;
};

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
    if (!mailer) {
      console.warn(`Email service not initialized; skipping low stock alert to ${recipientEmail}`);
      return null;
    }
    
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
    if (!mailer) {
      console.warn(`Email service not initialized; skipping expiry alert to ${recipientEmail}`);
      return null;
    }
    
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
    if (!mailer) {
      console.warn(`Email service not initialized; skipping order confirmation to ${recipientEmail}`);
      return null;
    }
    
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
    if (!mailer) {
      console.warn(`Email service not initialized; skipping shipment update to ${recipientEmail}`);
      return null;
    }
    
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

/**
 * Send a generic workflow event notification.
 */
export const sendWorkflowEventNotification = async ({ recipientEmail, eventType = 'order_workflow', orderNumber, shipmentNumber, medicine, quantity, totalAmount, status, nextStep, details }) => {
  try {
    const mailer = getEmailTransporter();
    if (!recipientEmail) {
      console.warn("[notifications] skipped", { eventName: eventType, recipientEmail: null, reason: "missing-recipient-email" });
      return null;
    }

    if (!mailer) {
      console.warn("[notifications] skipped", { eventName: eventType, recipientEmail, reason: "email-service-not-initialized" });
      return null;
    }

    console.info('[EMAIL_SEND]', { eventName: eventType, recipientEmail, service: 'sendWorkflowEventNotification' });

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: recipientEmail,
      subject: getWorkflowSubject({ eventType, orderNumber, shipmentNumber }),
      html: `
        <h2>Workflow Update</h2>
        <p><strong>Reference:</strong> ${orderNumber || shipmentNumber || 'Workflow'}</p>
        <p><strong>Medicine:</strong> ${medicine || 'N/A'}</p>
        <p><strong>Quantity:</strong> ${quantity || 0}</p>
        <p><strong>Total Amount:</strong> ${formatCurrency(totalAmount)}</p>
        <p><strong>Status:</strong> ${status || 'UPDATE'}</p>
        <p><strong>Next Step:</strong> ${nextStep || details || 'Please review the latest workflow update.'}</p>
      `
    };

    console.info('[SENDMAIL_START]', { recipientEmail, eventType, subject: mailOptions.subject });
    const result = await mailer.sendMail(mailOptions);
    console.info('[SENDMAIL_SUCCESS]', { recipientEmail, messageId: result.messageId, response: result.response });
    return result;
  } catch (error) {
    console.error("❌ Failed to send workflow notification:", error);
    throw error;
  }
};

/**
 * Send workflow notifications to multiple recipients.
 */
export const sendWorkflowEventNotifications = async ({ recipientEmails, ...payload }) => {
  const recipients = (recipientEmails || []).filter(Boolean);
  if (!recipients.length) {
    console.warn("[notifications] skipped", {
      eventName: payload.eventType,
      resolvedRecipientIds: [],
      resolvedEmailAddresses: [],
      reason: "no-recipient-emails",
    });
    return [];
  }

  console.info("[notifications] batch", { eventName: payload.eventType, recipientEmails: recipients, service: "sendWorkflowEventNotifications" });

  const tasks = recipients.map((recipientEmail) => sendWorkflowEventNotification({ ...payload, recipientEmail }));
  return Promise.allSettled(tasks);
};

/**
 * Send a retailer order workflow notification.
 * Used to notify warehouse/admin users about a new retailer order or stock shortage.
 */
export const sendOrderWorkflowNotification = async (options) => {
  return sendWorkflowEventNotification({
    ...options,
    eventType: options.eventType || 'order_workflow'
  });
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
  sendWorkflowEventNotification,
  sendWorkflowEventNotifications,
  sendOrderWorkflowNotification,
  sendPushNotification,
  sendSmsNotification
};
