import mongoose, { Schema } from "mongoose";

const SupplierSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING"
    }
  },
  { timestamps: true }
);

const Supplier =
  mongoose.models.Supplier || mongoose.model("Supplier", SupplierSchema);

export default Supplier;