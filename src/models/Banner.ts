import mongoose, { Schema } from "mongoose";

export interface IBanner {
  imageUrl: string;
  link: string;
  title: string;
  isActive: boolean;
  order: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const BannerSchema = new Schema<IBanner>(
  {
    imageUrl: {
      type: String,
      required: [true, "Banner image URL is required"],
      validate: {
        validator: (v: string) =>
          v.startsWith("http://") || v.startsWith("https://"),
        message: "Image URL must be an absolute URL"
      }
    },
    link: {
      type: String,
      required: [true, "Banner link is required"],
      trim: true
    },
    title: {
      type: String,
      default: "",
      trim: true
    },
    isActive: {
      type: Boolean,
      default: true
    },
    order: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

BannerSchema.index({ isActive: 1, order: 1 });

BannerSchema.set("toJSON", {
  virtuals: true,
  transform: (_doc: any, ret: any) => {
    ret.id = ret._id.toString();
    delete ret.__v;
    return ret;
  }
});

export default mongoose.models.Banner ||
  mongoose.model<IBanner>("Banner", BannerSchema);
