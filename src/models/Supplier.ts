import mongoose, { Schema } from "mongoose";

const SupplierSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    shopName: { type: String },
    phone: { type: String },

    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING"
    }
  },
  { timestamps: true }
);

export default mongoose.models.Supplier ||
  mongoose.model("Supplier", SupplierSchema);