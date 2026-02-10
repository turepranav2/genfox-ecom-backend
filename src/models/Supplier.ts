import mongoose, { Schema } from "mongoose";

const SupplierSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Business name is required"],
      trim: true
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6
    },
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING"
    },
    phone: {
      type: String,
      default: ""
    },
    gstin: {
      type: String,
      default: ""
    },
    address: {
      type: String,
      default: ""
    },
    bankDetails: {
      accountHolderName: { type: String, default: "" },
      accountNumber: { type: String, default: "" },
      ifscCode: { type: String, default: "" },
      bankName: { type: String, default: "" }
    },
    commissionRate: {
      type: Number,
      default: 10,
      min: 0,
      max: 100
    }
  },
  { timestamps: true }
);

SupplierSchema.index({ status: 1 });

SupplierSchema.set("toJSON", {
  virtuals: true,
  transform: (_doc: any, ret: any) => {
    ret.id = ret._id.toString();
    delete ret.__v;
    delete ret.password;
    return ret;
  }
});

export default mongoose.models.Supplier ||
  mongoose.model("Supplier", SupplierSchema);