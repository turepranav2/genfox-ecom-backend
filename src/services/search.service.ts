import Product from "../models/Product";
import Category from "../models/Category";

export const searchProducts = async (query: any) => {
  const {
    q,
    category,
    minPrice,
    maxPrice,
    brand,
    page = 1,
    limit = 10
  } = query;

  const filter: any = { isActive: true };

  if (category) {
    const categories = await Category.find({
      $or: [{ _id: category }, { parentCategory: category }]
    }).select("_id");

    filter.category = { $in: categories.map((c) => c._id) };
  }

  if (brand) filter.brand = brand;
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  if (q) {
    filter.$text = { $search: q };
  }

  const products = await Product.find(filter)
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .populate("category")
    .populate("supplier");

  return products;
};