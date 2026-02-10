import mongoose, { Schema, Types } from "mongoose";

export interface IProduct {
  name: string;
  slug?: string;
  description?: string;
  price: number;
  mrp?: number;
  stock: number;
  category: string;
  images?: string[];
  supplierId: Types.ObjectId;
  isActive?: boolean;
  ratings?: {
    average: number;
    count: number;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      maxlength: 200
    },
    slug: {
      type: String,
      unique: true,
      sparse: true
    },
    description: {
      type: String,
      default: "",
      maxlength: 5000
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: 0
    },
    mrp: {
      type: Number,
      default: 0,
      min: 0
    },
    stock: {
      type: Number,
      required: true,
      default: 0,
      min: 0
    },
    category: {
      type: String,
      required: [true, "Category is required"]
    },
    images: [
      {
        type: String,
        validate: {
          validator: (v: string) =>
            v.startsWith("http://") || v.startsWith("https://"),
          message: "Image URL must be an absolute URL"
        }
      }
    ],
    supplierId: {
      type: Schema.Types.ObjectId,
      ref: "Supplier",
      required: true
    },
    isActive: {
      type: Boolean,
      default: true
    },
    ratings: {
      average: { type: Number, default: 0, min: 0, max: 5 },
      count: { type: Number, default: 0 }
    }
  },
  { timestamps: true }
);

// Auto-generate slug from name before saving
ProductSchema.pre("save", function () {
  if (!this.slug || this.isModified("name")) {
    const base = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    this.slug = base + "-" + Date.now();
  }
});

ProductSchema.index({ supplierId: 1 });
ProductSchema.index({ category: 1 });
ProductSchema.index({ name: "text", description: "text" });

ProductSchema.set("toJSON", {
  virtuals: true,
  transform: (_doc: any, ret: any) => {
    ret.id = ret._id.toString();
    delete ret.__v;
    return ret;
  }
});

export default mongoose.models.Product ||
  mongoose.model<IProduct>("Product", ProductSchema);