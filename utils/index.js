import { Logger } from "./logger.js";
import { getConfig } from "../config/config.js";

const TELEGRAM_API_URL = `https://api.telegram.org/${getConfig.BOT_TOKEN}/sendMessage`;

export function formatCurrency(paise) {
  if (paise % 10 === 0) {
    return "₹" + paise / 100;
  }
  return "₹" + (paise / 100).toFixed(2);
}

export async function sendTelegramMessage(messageText) {
  const logger = {};
  try {
    logger.messageText = messageText;
    const response = await fetch(TELEGRAM_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: getConfig.CHAT_ID,
        text: messageText,
        parse_mode: "HTML",
      }),
    });
    logger.response = response;

    const data = await response.json();
    logger.data = data;
  } catch (error) {
    logger.error = error;
    console.error("Error sending message to Telegram:", error);
  } finally {
    Logger.debug("sendTelegramMessage", logger);
  }
}

export function formatOrderMessageHTML(orderData) {
  const { orderId, user, items, subtotal, deliveryFee, total } = orderData;

  let message = `<b>🛍️ ORDER PLACED</b>\n\n`;
  message += `<b>Order ID:</b> <code>${orderId || "undefined"}</code>\n\n`;

  message += `<b>👤 Customer Details</b>\n`;
  message += `<b>   • Name:</b> ${user?.name}\n`;
  message += `<b>   • Phone:</b> ${user?.phone}\n`;
  message += `<b>   • Address:</b> ${user?.address}\n\n`;

  message += `<b>📦 Items</b>\n`;
  items?.forEach?.((item, index) => {
    message += `\n${index + 1}. <b>${item?.name}</b>\n`;
    message += `   • Quantity: ${item?.quantity}\n`;
    message += `   • Weight: ${item?.weight}\n`;
    message += `   • Price: ${formatCurrency(item?.price)}\n`;
  });

  message += `\n━━━━━━━━━━━━━━━━\n`;
  message += `<b>Subtotal:</b> ${formatCurrency(subtotal)}\n`;
  message += `<b>Delivery Fee:</b> ${
    deliveryFee > 0 ? formatCurrency(deliveryFee) : "FREE"
  }\n`;
  message += `<b>Total Amount: ${formatCurrency(total)}</b>\n`;

  return message;
}
