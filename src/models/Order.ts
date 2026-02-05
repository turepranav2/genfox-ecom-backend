import mongoose, { Schema } from "mongoose";

const OrderSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    supplier: { type: Schema.Types.ObjectId, ref: "Supplier", required: true },
    address: { type: Schema.Types.ObjectId, ref: "Address", required: true },

    items: [
      {
        product: { type: Schema.Types.ObjectId, ref: "Product" },
        quantity: Number,
        price: Number
      }
    ],

    totalAmount: Number,
    commissionAmount: Number,
    supplierEarning: Number,

    paymentMethod: {
      type: String,
      enum: ["COD", "ONLINE"],
      required: true
    },

    orderStatus: {
      type: String,
      enum: ["PLACED", "PAID", "SHIPPED", "DELIVERED", "CANCELLED"],
      default: "PLACED"
    }
  },
  { timestamps: true }
);

export default mongoose.models.Order ||
  mongoose.model("Order", OrderSchema);