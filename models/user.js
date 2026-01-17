import mongoose, { Schema } from "mongoose";

import AddressSchema from "./userAddress.js";

const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  refreshToken: { type: String, required: true },
  phone: { type: String },
  address: {
    type: [AddressSchema],
  },
  appleId: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const User = mongoose.model("User", UserSchema);

export default User;
