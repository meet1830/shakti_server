import mongoose, { Schema } from "mongoose";

import AddressSchema from "./userAddress.js";

const OrderItemSchema = new Schema({
  name: { type: String, required: true },
  image_uris: [{ type: String }],
  price: { type: Number, required: true },
  original_price: { type: Number },
  weight: { type: String, required: true },
  description: { type: String },
  category: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category" }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  quantity: { type: Number, required: true },
});

const OrderSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  items: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  ],
  orderItems: { type: [OrderItemSchema], required: true },
  address: { type: AddressSchema, required: true },
  phone: { type: String, required: true },
  status: {
    type: String,
    enum: ["Order placed", "Delivered", "Cancelled"],
    default: "Order placed",
    required: true,
  },
  orderPrice: {type: Number, required: true},
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Order = mongoose.model("Order", OrderSchema);

export default Order;
