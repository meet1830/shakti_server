import { formatOrderMessageHTML, sendTelegramMessage } from "../utils/index.js";

import Order from "../models/order.js";
import User from "../models/user.js";

const createOrder = async (req, res) => {
  try {
    const { cartItems } = req.body;

    let areCartItemsParamsValid = true;
    let orderPrice = 0;
    cartItems?.forEach?.((item) => {
      orderPrice += item?.price || 0;
      if (!item?._id || !item?.price || !item?.quantity) {
        areCartItemsParamsValid = false;
      }
    });

    if (!cartItems?.length || !areCartItemsParamsValid) {
      return res.status(400).json({
        success: false,
        message: "Bad user input",
      });
    }

    const user = await User.findById(req.user.id);

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

    const userAddress = user.address[0];
    const subtotal = cartItems.reduce((acc, item) => {
      return acc + ((item?.price || 0) * (item?.quantity || 0));
    }, 0);
    const deliveryFee = (subtotal || 0) < 50000 ? 7000 : 0;

    await sendTelegramMessage(
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
      })
    );

    res.status(200).json({
      success: true,
      order: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create order",
      error: error.message,
    });
  }
};

const getOrders = async (req, res) => {
  try {
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
