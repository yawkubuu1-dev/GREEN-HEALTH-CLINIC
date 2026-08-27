/**
 * WhatsApp Helper Functions for Prolyn Wear Delivery
 * 
 * Functions to send delivery information to drivers via WhatsApp
 */

/**
 * Format order details for WhatsApp message
 * @param {Object} order - Order object with all details
 * @param {Object} deliveryInfo - Delivery address and coordinates
 * @returns {string} Formatted WhatsApp message
 */
export const formatDeliveryMessage = (order, deliveryInfo) => {
  const {
    id: orderId,
    customer_name,
    customer_phone,
    customer_email,
    total,
    payment_method = 'Cash on Delivery',
    order_items = [],
  } = order;

  const {
    address,
    latitude,
    longitude,
    distance,
    estimatedTime,
  } = deliveryInfo;

  // Format order items
  const itemsList = order_items
    .map((item) => `• ${item.product_name || 'Product'} x${item.quantity}`)
    .join('\n');

  // Create Google Maps link (use coordinates if available, else text search)
  const mapsLink = (latitude && longitude)
    ? `https://maps.google.com/?q=${latitude},${longitude}`
    : `https://maps.google.com/search?q=${encodeURIComponent(address)}`;

  // Build message
  const message = `🚚 *NEW DELIVERY - Prolyn Wear*

📦 *Order:* #${String(orderId).slice(0, 8).toUpperCase()}
👤 *Customer:* ${customer_name}
📱 *Phone:* ${customer_phone}

📍 *DELIVERY ADDRESS:*
${address}

🗺️ *OPEN IN GOOGLE MAPS:*
${mapsLink}

📦 *ORDER DETAILS:*
${itemsList || '• Items listed in order'}

💰 *Total:* GH₵ ${parseFloat(total).toFixed(2)}
💵 *Payment:* ${payment_method}

⏱️ *Distance:* ${distance ? `${distance} km` : 'Calculating...'}
⏱️ *Est. Time:* ${estimatedTime ? `${estimatedTime} min` : 'Calculating...'}

🏪 *Pickup from:*
Prolyn Wear Store
Osu, Accra

_Please confirm receipt by replying "Received"_`;

  return message;
};

/**
 * Create WhatsApp Web link with pre-filled message
 * @param {string} phoneNumber - Driver's WhatsApp number (with country code)
 * @param {string} message - Message to send
 * @returns {string} WhatsApp Web URL
 */
export const createWhatsAppLink = (phoneNumber, message) => {
  // Clean phone number (remove spaces, dashes, etc.)
  const cleanPhone = phoneNumber.replace(/[^\d+]/g, '');
  
  // Encode message for URL
  const encodedMessage = encodeURIComponent(message);
  
  // Create WhatsApp link
  return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
};

/**
 * Create WhatsApp Web link for browser (wa.me for mobile)
 * @param {string} phoneNumber - Driver's WhatsApp number
 * @param {string} message - Message to send
 * @returns {string} WhatsApp Web URL
 */
export const createWhatsAppWebLink = (phoneNumber, message) => {
  const cleanPhone = phoneNumber.replace(/[^\d+]/g, '');
  const encodedMessage = encodeURIComponent(message);
  
  // Use web.whatsapp.com for desktop browsers
  return `https://web.whatsapp.com/send?phone=${cleanPhone}&text=${encodedMessage}`;
};

/**
 * Open WhatsApp with delivery message
 * @param {string} driverPhone - Driver's phone number
 * @param {Object} order - Order object
 * @param {Object} deliveryInfo - Delivery information
 */
export const sendToDriver = (driverPhone, order, deliveryInfo) => {
  const message = formatDeliveryMessage(order, deliveryInfo);
  const whatsappLink = createWhatsAppLink(driverPhone, message);
  
  // Open in new window/tab
  if (typeof window !== 'undefined') {
    window.open(whatsappLink, '_blank');
  }
  
  return whatsappLink;
};

/**
 * Format simple delivery notification
 * @param {string} customerName - Customer name
 * @param {string} address - Delivery address
 * @param {number} latitude - GPS latitude
 * @param {number} longitude - GPS longitude
 * @returns {string} Simple WhatsApp message
 */
export const formatSimpleMessage = (customerName, address, latitude, longitude) => {
  const mapsLink = `https://maps.google.com/?q=${latitude},${longitude}`;
  
  return `🚚 *Delivery for ${customerName}*

📍 ${address}

🗺️ Navigate: ${mapsLink}`;
};

/**
 * Create Google Maps navigation link
 * @param {number} latitude - Destination latitude
 * @param {number} longitude - Destination longitude
 * @param {string} storeLat - Store latitude (optional)
 * @param {string} storeLng - Store longitude (optional)
 * @returns {string} Google Maps directions URL
 */
export const createNavigationLink = (latitude, longitude, storeLat = null, storeLng = null) => {
  if (storeLat && storeLng) {
    // Directions from store to destination
    return `https://www.google.com/maps/dir/${storeLat},${storeLng}/${latitude},${longitude}`;
  }
  
  // Simple destination link
  return `https://maps.google.com/?q=${latitude},${longitude}`;
};

/**
 * Format delivery confirmation message (for driver to send back)
 * @param {string} orderId - Order ID
 * @returns {string} Confirmation message
 */
export const getConfirmationMessage = (orderId) => {
  return `✅ Delivered - Order #${String(orderId).slice(0, 8).toUpperCase()}`;
};

/**
 * Format status update message
 * @param {string} orderId - Order ID
 * @param {string} status - Current status
 * @returns {string} Status update message
 */
export const formatStatusUpdate = (orderId, status) => {
  const statusEmoji = {
    'accepted': '✅',
    'picked_up': '📦',
    'in_transit': '🚗',
    'nearby': '📍',
    'delivered': '✅',
  };

  const emoji = statusEmoji[status] || '📢';
  
  return `${emoji} Order #${String(orderId).slice(0, 8).toUpperCase()} - ${status.toUpperCase().replace('_', ' ')}`;
};

/**
 * Parse driver response to detect status
 * @param {string} message - Driver's message
 * @returns {string|null} Detected status or null
 */
export const parseDriverResponse = (message) => {
  const lowerMsg = message.toLowerCase();
  
  if (lowerMsg.includes('received') || lowerMsg.includes('ok')) {
    return 'accepted';
  }
  if (lowerMsg.includes('picked') || lowerMsg.includes('collected')) {
    return 'picked_up';
  }
  if (lowerMsg.includes('on the way') || lowerMsg.includes('coming')) {
    return 'in_transit';
  }
  if (lowerMsg.includes('nearby') || lowerMsg.includes('almost')) {
    return 'nearby';
  }
  if (lowerMsg.includes('delivered') || lowerMsg.includes('complete')) {
    return 'delivered';
  }
  
  return null;
};

/**
 * Validate phone number format
 * @param {string} phone - Phone number
 * @returns {boolean} Is valid
 */
export const isValidPhoneNumber = (phone) => {
  // Ghana phone number: +233 XX XXX XXXX or 0XX XXX XXXX
  const cleanPhone = phone.replace(/[^\d+]/g, '');
  
  // Check if it's a valid Ghana number
  return (
    (cleanPhone.startsWith('+233') && cleanPhone.length === 13) ||
    (cleanPhone.startsWith('0') && cleanPhone.length === 10)
  );
};

/**
 * Format phone number to WhatsApp format
 * @param {string} phone - Phone number
 * @returns {string} Formatted phone (with +233)
 */
export const formatPhoneNumber = (phone) => {
  let cleanPhone = phone.replace(/[^\d]/g, '');
  
  // If starts with 0, replace with +233
  if (cleanPhone.startsWith('0')) {
    cleanPhone = '+233' + cleanPhone.slice(1);
  }
  
  // If doesn't start with +, add +233
  if (!cleanPhone.startsWith('+')) {
    cleanPhone = '+233' + cleanPhone;
  }
  
  return cleanPhone;
};

// Export all functions
export default {
  formatDeliveryMessage,
  createWhatsAppLink,
  createWhatsAppWebLink,
  sendToDriver,
  formatSimpleMessage,
  createNavigationLink,
  getConfirmationMessage,
  formatStatusUpdate,
  parseDriverResponse,
  isValidPhoneNumber,
  formatPhoneNumber,
};
