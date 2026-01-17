import { Schema } from "mongoose";

const AddressSchema = new Schema({
  street: { type: String, required: true },
  landmark: { type: String },
  area: { type: String, required: true },
  city: { type: String, required: true },
  zipCode: { type: String, required: true },
});

export default AddressSchema;
