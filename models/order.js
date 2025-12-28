import mongoose, { Schema } from "mongoose";

const ItemSchema = new Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  quantity: { type: Number, required: true },
});

const OrderSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  deliveryDate: { type: Date, required: true },
  address: { type: String },
  items: { type: [ItemSchema], required: true },
  status: {
    type: String,
    enum: [
      "Order placed",
      "Shipping",
      "Out for delivery",
      "Delivered",
      "Cancelled",
    ],
    default: "Order placed",
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Order = mongoose.model("Order", OrderSchema);

export default Order;
