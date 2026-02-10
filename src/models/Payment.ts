import mongoose, { Schema } from "mongoose";

const PaymentSchema = new Schema(
  {
    orderId: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: true
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    supplierId: {
      type: Schema.Types.ObjectId,
      ref: "Supplier",
      default: null
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    method: {
      type: String,
      enum: ["COD", "ONLINE", "UPI"],
      default: "COD"
    },
    status: {
      type: String,
      enum: ["PENDING", "COMPLETED", "FAILED", "REFUNDED"],
      default: "PENDING"
    },
    transactionId: {
      type: String,
      default: ""
    }
  },
  { timestamps: true }
);

PaymentSchema.index({ orderId: 1 });
PaymentSchema.index({ userId: 1 });
PaymentSchema.index({ supplierId: 1 });

PaymentSchema.set("toJSON", {
  virtuals: true,
  transform: (_doc: any, ret: any) => {
    ret.id = ret._id.toString();
    delete ret.__v;
    return ret;
  }
});

export default mongoose.models.Payment ||
  mongoose.model("Payment", PaymentSchema);