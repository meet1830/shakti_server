import { BOT_TOKEN, CHAT_ID } from "../config/config.js";

const TELEGRAM_API_URL = `https://api.telegram.org/${BOT_TOKEN}/sendMessage`;

export function formatCurrency(paise) {
  if (paise % 10 === 0) {
    return "₹" + paise / 100;
  }
  return "₹" + (paise / 100).toFixed(2);
}

export async function sendTelegramMessage(messageText) {
  try {
    const response = await fetch(TELEGRAM_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: messageText,
        parse_mode: "HTML",
      }),
    });

    const data = await response.json();

    if (data.ok) {
      console.log("Message sent successfully:", data.result.message_id);
    } else {
      console.error("Failed to send message:", data.description);
    }
  } catch (error) {
    console.error("Error sending message to Telegram:", error);
  }
}

export function formatOrderMessageHTML(orderData) {
  const { orderId, user, items, subtotal, deliveryFee, total } = orderData;

  let message = `<b>🛍️ ORDER PLACED</b>\n\n`;
  message += `<b>Order ID:</b> <code>${orderId}</code>\n\n`;

  message += `<b>👤 Customer Details</b>\n`;
  message += `<b>   • Name:</b> ${user.name}\n`;
  message += `<b>   • Phone:</b> ${user.phone}\n`;
  message += `<b>   • Address:</b> ${user.address}\n\n`;

  message += `<b>📦 Items</b>\n`;
  items.forEach((item, index) => {
    message += `\n${index + 1}. <b>${item.name}</b>\n`;
    message += `   • Quantity: ${item.quantity}\n`;
    message += `   • Weight: ${item.weight}\n`;
    message += `   • Price: ${formatCurrency(item.price)}\n`;
  });

  message += `\n━━━━━━━━━━━━━━━━\n`;
  message += `<b>Subtotal:</b> ${formatCurrency(subtotal)}\n`;
  message += `<b>Delivery Fee:</b> ${
    deliveryFee > 0 ? formatCurrency(deliveryFee) : "FREE"
  }\n`;
  message += `<b>Total Amount: ${formatCurrency(total)}</b>\n`;

  return message;
}
