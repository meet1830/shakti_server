import dotenv from "dotenv";

dotenv.config();

export const getConfig = {
  PORT: process.env.PORT || 3000,
  MONGO_URI: process.env.MONGO_URI,
  COOKIE_PASSWORD: process.env.COOKIE_PASSWORD,
  NODE_ENV: process.env.NODE_ENV,
  ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  APPLE_CLIENT_ID: process.env.APPLE_CLIENT_ID,
  BOT_TOKEN: process.env.BOT_TOKEN,
  CHAT_ID: process.env.CHAT_ID,
  NEW_RELIC_LICENSE_KEY: process.env.NEW_RELIC_LICENSE_KEY,
};
