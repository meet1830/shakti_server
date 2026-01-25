import { formatOrderMessageHTML, sendTelegramMessage } from "../utils/index.js";

import { Logger } from "../utils/logger.js";
import Order from "../models/order.js";
import User from "../models/user.js";

const createOrder = async (req, res) => {
  const logger = {};
  try {
    const { cartItems } = req.body;
    logger.reqParams = req.body;

    let areCartItemsParamsValid = true;
    let orderPrice = 0;
    cartItems?.forEach?.((item) => {
      orderPrice += item?.price || 0;
      if (!item?._id || !item?.price || !item?.quantity) {
        areCartItemsParamsValid = false;
      }
    });

    logger.areCartItemsParamsValid = areCartItemsParamsValid;
    if (!cartItems?.length || !areCartItemsParamsValid) {
      return res.status(400).json({
        success: false,
        message: "Bad user input",
      });
    }

    const user = await User.findById(req.user.id);
    logger.user = user;

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const order = await Order.create({
      user: user._id,
      items: cartItems,
      orderItems: cartItems,
      address: user.address[0],
      phone: user.phone,
      status: "Order placed",
      orderPrice,
    });
    logger.order = order;

    const userAddress = user.address[0];
    const subtotal = cartItems.reduce((acc, item) => {
      return acc + (item?.price || 0) * (item?.quantity || 0);
    }, 0);
    const deliveryFee = (subtotal || 0) < 50000 ? 7000 : 0;

    logger.subtotal = subtotal;
    logger.deliveryFree = deliveryFee;

    sendTelegramMessage(
      formatOrderMessageHTML({
        orderId: order?._id,
        user: {
          name: user?.name,
          phone: user?.phone,
          address: `${userAddress?.street}, ${userAddress?.landmark}, ${userAddress?.area}, ${userAddress?.city} - ${userAddress?.zipCode}`,
        },
        subtotal: subtotal,
        deliveryFee: deliveryFee,
        total: subtotal + deliveryFee,
        items: cartItems,
      }),
    );

    res.status(200).json({
      success: true,
      order: order,
    });
  } catch (error) {
    logger.error = error;
    res.status(500).json({
      success: false,
      message: "Failed to create order",
      error: error.message,
    });
  } finally {
    Logger.debug("createOrder", logger);
  }
};

const getOrders = async (req, res) => {
  try {
    if (!req?.user?.id) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }

    const orders = await Order.find({ user: req.user.id }).sort({
      createdAt: -1,
    });
    if (!orders || !orders.length) {
      return res.status(404).json({
        success: false,
        message: "No orders found",
      });
    }

    res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve orders",
      error: error.message,
    });
  }
};

export { createOrder, getOrders };
