import mongoose, { Schema, Types } from "mongoose";

export interface IOrderItem {
  productId: Types.ObjectId;
  name: string;
  price: number;
  quantity: number;
  supplierId: Types.ObjectId;
  image?: string;
}

export interface IOrder {
  userId: Types.ObjectId;
  items: IOrderItem[];
  total: number;
  commission: number;
  status: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  paymentMethod: "COD" | "ONLINE" | "UPI";
  paymentStatus: "PENDING" | "PAID" | "REFUNDED";
  address: string;
  trackingId?: string;
  deliveryConfirmation: {
    supplierConfirmed: boolean;
    userConfirmed: boolean;
    cashCollected: number;
    deliveredAt: Date | null;
    userConfirmedAt: Date | null;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true
    },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    supplierId: {
      type: Schema.Types.ObjectId,
      ref: "Supplier",
      required: true
    },
    image: { type: String, default: "" }
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    items: { type: [OrderItemSchema], required: true },
    total: { type: Number, required: true, min: 0 },
    commission: { type: Number, default: 0, min: 0 },
    status: {
      type: String,
      enum: ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"],
      default: "PENDING"
    },
    paymentMethod: {
      type: String,
      enum: ["COD", "ONLINE", "UPI"],
      default: "COD"
    },
    paymentStatus: {
      type: String,
      enum: ["PENDING", "PAID", "REFUNDED"],
      default: "PENDING"
    },
    address: {
      type: String,
      required: [true, "Delivery address is required"]
    },
    trackingId: { type: String, default: "" },
    deliveryConfirmation: {
      supplierConfirmed: { type: Boolean, default: false },
      userConfirmed: { type: Boolean, default: false },
      cashCollected: { type: Number, default: 0 },
      deliveredAt: { type: Date, default: null },
      userConfirmedAt: { type: Date, default: null }
    }
  },
  { timestamps: true }
);

OrderSchema.index({ userId: 1, createdAt: -1 });
OrderSchema.index({ "items.supplierId": 1 });
OrderSchema.index({ status: 1 });

OrderSchema.set("toJSON", {
  virtuals: true,
  transform: (_doc: any, ret: any) => {
    ret.id = ret._id.toString();
    delete ret.__v;
    return ret;
  }
});

export default mongoose.model<IOrder>("Order", OrderSchema);