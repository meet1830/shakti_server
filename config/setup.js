import * as AdminJSMongoose from "@adminjs/mongoose";

import { dark, light, noSidebar } from "@adminjs/themes";

import AdminJS from "adminjs";
import AdminJSExpress from "@adminjs/express";
import Category from "../models/category.js";
import ConnectMongoDBSession from "connect-mongodb-session";
import Order from "../models/order.js";
import Product from "../models/product.js";
import User from "../models/user.js";
import session from "express-session";

AdminJS.registerAdapter(AdminJSMongoose);

const DEFAULT_ADMIN = {
  email: "admin_shakti@admin.com",
  password: "1234",
};

const authenticate = async (email, password) => {
  if (email === DEFAULT_ADMIN.email && password === DEFAULT_ADMIN.password) {
    return Promise.resolve(DEFAULT_ADMIN);
  }
  return null;
};

export const buildAdminJS = async (app) => {
  const admin = new AdminJS({
    resources: [
      {
        resource: User,
      },
      {
        resource: Category,
      },
      {
        resource: Product,
      },
      {
        resource: Order,
      },
    ],
    branding: {
      companyName: "shakti",
      withMadeWithLove: false,
      // favicon: "https://i.posting.cc/ZRCCXLgg/temp-Imagef-Coi-ZY.avif",
      // logo: "https://i.posting.cc/ZRCCXLgg/temp-Imagef-Coi-ZY.avif",
    },
    defaultTheme: dark.id,
    availableThemes: [dark, light, noSidebar],
    rootPath: "/admin",
  });

  const MongoDBStore = ConnectMongoDBSession(session);
  const sessionStore = new MongoDBStore({
    uri: process.env.MONGO_URI,
    collection: "sessions",
  });

  const adminRouter = AdminJSExpress.buildAuthenticatedRouter(
    admin,
    {
      authenticate,
      cookieName: "adminjs",
      cookiePassword: process.env.COOKIE_PASSWORD,
    },
    null,
    {
      store: sessionStore,
      resave: true,
      saveUninitialized: true,
      secret: process.env.COOKIE_PASSWORD,
      cookie: {
        httpOnly: process.env.NODE_ENV === "production",
        secure: process.env.NODE_ENV === "production",
      },
      name: "adminjs",
    }
  );

  app.use(admin.options.rootPath, adminRouter);
};
