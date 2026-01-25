import dotenv from "dotenv";

dotenv.config();

/**
 * Internal function to send the payload to New Relic
 */
const sendLog = async (level, message, attributes) => {
  console.log(`[NR-${level}]`, message, attributes || "");

  const payload = {
    timestamp: Date.now(),
    message: message,
    logtype: level,
    service: "server",
    attributes: attributes,
  };

  try {
    await fetch("https://log-api.newrelic.com/log/v1", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-License-Key": process.env.NEW_RELIC_LICENSE_KEY || "",
      },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    console.error("Failed to send log to New Relic:", error);
  }
};

export const Logger = {
  info: (message, attributes) => sendLog("INFO", message, attributes),

  warn: (message, attributes) => sendLog("WARN", message, attributes),

  error: (message, attributes) => sendLog("ERROR", message, attributes),

  debug: (message, attributes) => sendLog("DEBUG", message, attributes),
};
