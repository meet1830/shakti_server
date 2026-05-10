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
    let orderSubtotal= 0;
    cartItems?.forEach?.((item) => {
      orderSubtotal += (item?.price || 0) * (item?.quantity || 1);
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
      orderPrice: orderSubtotal,
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

const getAdminOrdersSummary = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Today's orders to be delivered (any date with status "Order placed")
    // Using aggregation for better performance and following the instruction to use orderPrice field
    const summary = await Order.aggregate([
      { $match: { status: "Order placed" } },
      {
        $group: {
          _id: null,
          totalPrice: { $sum: "$orderPrice" },
          count: { $sum: 1 },
        },
      },
    ]);

    const pendingTotal = summary.length > 0 ? summary[0].totalPrice : 0;
    const pendingCount = summary.length > 0 ? summary[0].count : 0;

    res.status(200).json({
      success: true,
      pendingTotal,
      pendingCount,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve order summary",
      error: error.message,
    });
  }
};

const getAdminCurrentOrdersItemsSummary = async (req, res) => {
  try {
    const orders = await Order.find({ status: "Order placed" });
    const itemsMap = {};

    orders.forEach((order) => {
      order.orderItems.forEach((item) => {
        // Group by name and weight to ensure uniqueness for aggregation
        const key = `${item.name}-${item.weight}`;
        if (!itemsMap[key]) {
          itemsMap[key] = {
            ...item.toObject(),
            totalQuantity: 0,
            totalPrice: 0,
          };
        }
        itemsMap[key].totalQuantity += item.quantity;
        itemsMap[key].totalPrice += item.price * item.quantity;
      });
    });

    const summary = Object.values(itemsMap);
    res.status(200).json({
      success: true,
      summary,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve order items summary",
      error: error.message,
    });
  }
};

const getAdminOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 0;
    const limit = parseInt(req.query.limit) || 10;
    const skip = page * limit;

    const { status } = req.query;
    const query = {};
    if (status) {
      query.status = status;
    }

    const orders = await Order.find(query)
      .populate("user", "name email phone address")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalCount = await Order.countDocuments(query);

    res.status(200).json({
      success: true,
      orders,
      totalCount,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve orders",
      error: error.message,
    });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;

    if (!orderId || !status) {
      return res.status(400).json({
        success: false,
        message: "Order ID and status are required",
      });
    }

    const validStatuses = ["Order placed", "Delivered", "Cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value",
      });
    }

    const order = await Order.findByIdAndUpdate(
      orderId,
      { status, updatedAt: new Date() },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update order status",
      error: error.message,
    });
  }
};

export {
  createOrder,
  getOrders,
  getAdminOrdersSummary,
  getAdminCurrentOrdersItemsSummary,
  getAdminOrders,
  updateOrderStatus,
};
