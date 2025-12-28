import Order from "../models/order.js";

const createOrder = async (req, res) => {
  try {
    const { userId, cartItems, deliveryDate, address } = req.params;
    const order = await Order.create({
      user: userId,
      address,
      deliveryDate,
      items: cartItems,
      status: "Order placed",
    });

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create order",
      error: error.message,
    });
  }
};

const getOrdersByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const orders = await Order.find({ user: userId }).sort({ createdAt: -1 });
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

export { createOrder, getOrdersByUserId };
