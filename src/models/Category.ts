import mongoose, { Schema, Types } from "mongoose";

export interface ISubcategory {
  _id?: Types.ObjectId;
  name: string;
  slug: string;
}

export interface ICategory {
  name: string;
  slug: string;
  image: string;
  subcategories: ISubcategory[];
  supplierId: Types.ObjectId | null;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const SubcategorySchema = new Schema<ISubcategory>(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    slug: {
      type: String,
      default: ""
    }
  }
);

const CategorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
      maxlength: 100
    },
    slug: {
      type: String,
      unique: true,
      sparse: true
    },
    image: {
      type: String,
      default: ""
    },
    subcategories: [SubcategorySchema],
    supplierId: {
      type: Schema.Types.ObjectId,
      ref: "Supplier",
      default: null
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

// Auto-generate slugs
CategorySchema.pre("save", function () {
  if (!this.slug || this.isModified("name")) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }
  this.subcategories.forEach((sub: any) => {
    if (!sub.slug) {
      sub.slug = sub.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
    }
  });
});

CategorySchema.index({ supplierId: 1 });

CategorySchema.set("toJSON", {
  virtuals: true,
  transform: (_doc: any, ret: any) => {
    ret.id = ret._id.toString();
    delete ret.__v;
    return ret;
  }
});

export default mongoose.models.Category ||
  mongoose.model<ICategory>("Category", CategorySchema);