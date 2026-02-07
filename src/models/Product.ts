import mongoose, { Schema, Types } from "mongoose";

export interface IProduct {
  name: string;
  price: number;
  stock: number;
  category: string;
  images?: string[];
  supplier: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    stock: { type: Number, required: true },
    category: { type: String, required: true },
    images: [{ type: String }],
    supplier: {
      type: Schema.Types.ObjectId,
      ref: "Supplier",
      required: true
    }
  },
  { timestamps: true }
);

export default mongoose.models.Product ||
  mongoose.model<IProduct>("Product", ProductSchema);