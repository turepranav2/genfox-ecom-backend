import mongoose, { Schema } from "mongoose";

const EnquirySchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User" },
    message: String,
    status: {
      type: String,
      enum: ["OPEN", "RESPONDED"],
      default: "OPEN"
    }
  },
  { timestamps: true }
);

export default mongoose.models.Enquiry ||
  mongoose.model("Enquiry", EnquirySchema);