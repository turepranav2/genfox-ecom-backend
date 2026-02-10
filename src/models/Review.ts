import mongoose, { Schema } from "mongoose";

const ReviewSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      default: "",
      maxlength: 1000
    }
  },
  { timestamps: true }
);

// One review per user per product
ReviewSchema.index({ userId: 1, productId: 1 }, { unique: true });
ReviewSchema.index({ productId: 1 });

ReviewSchema.set("toJSON", {
  virtuals: true,
  transform: (_doc: any, ret: any) => {
    ret.id = ret._id.toString();
    delete ret.__v;
    return ret;
  }
});

export default mongoose.models.Review ||
  mongoose.model("Review", ReviewSchema);