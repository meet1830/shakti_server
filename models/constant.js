import mongoose, { Schema } from "mongoose";

const constantSchema = new Schema({
  key: {
    type: String,
    required: true,
    unique: true,
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
});

const Constant = mongoose.model("Constant", constantSchema);

export default Constant;
