import mongoose, { Schema } from "mongoose";

const ProductSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true
    },

    description: {
      type: String
    },

    brand: {
      type: String,
      index: true
    },

    price: {
      type: Number,
      required: true,
      index: true
    },

    stock: {
      type: Number,
      required: true,
      default: 0
    },

    images: [
      {
        type: String
      }
    ],

    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      index: true
    },

    supplier: {
      type: Schema.Types.ObjectId,
      ref: "Supplier",
      required: true,
      index: true
    },

    /**
     * Dynamic attributes for filtering
     * Example:
     * { color: "Black", size: "M", material: "Cotton" }
     */
    attributes: {
      type: Map,
      of: String
    },

    /**
     * Tags for cross-category discovery
     * Example: ["running", "sports", "men"]
     */
    tags: [
      {
        type: String,
        lowercase: true,
        index: true
      }
    ],

    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

/**
 * TEXT SEARCH INDEX
 * Used for search bar queries
 */
ProductSchema.index({
  name: "text",
  description: "text",
  brand: "text",
  tags: "text"
});

export default mongoose.models.Product ||
  mongoose.model("Product", ProductSchema);
