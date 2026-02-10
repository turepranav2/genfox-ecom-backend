import mongoose, { Schema } from "mongoose";

const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: 2,
      maxlength: 100
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
    role: {
      type: String,
      enum: ["USER", "ADMIN"],
      default: "USER"
    },
    phone: {
      type: String,
      default: ""
    },
    addresses: [
      {
        label: { type: String, default: "Home" },
        street: { type: String, default: "" },
        city: { type: String, default: "" },
        state: { type: String, default: "" },
        pincode: { type: String, default: "" },
        isDefault: { type: Boolean, default: false }
      }
    ]
  },
  { timestamps: true }
);

UserSchema.set("toJSON", {
  virtuals: true,
  transform: (_doc: any, ret: any) => {
    ret.id = ret._id.toString();
    delete ret.__v;
    delete ret.password;
    return ret;
  }
});

export default mongoose.models.User ||
  mongoose.model("User", UserSchema);