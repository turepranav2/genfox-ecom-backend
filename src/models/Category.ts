import mongoose, { Schema } from "mongoose";

const CategorySchema = new Schema(
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

    parentCategory: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      default: null
    },

    level: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },

    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

/**
 * Indexing for fast hierarchy queries
 */
CategorySchema.index({ parentCategory: 1 });
CategorySchema.index({ level: 1 });

export default mongoose.models.Category ||
  mongoose.model("Category", CategorySchema);