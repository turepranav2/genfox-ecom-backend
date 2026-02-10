/**
 * DATABASE MIGRATION SCRIPT
 * ─────────────────────────
 * Safely migrates existing MongoDB documents to match the updated schemas.
 * This script is IDEMPOTENT — safe to run multiple times.
 *
 * What it does:
 *   1. Renames fields (user → userId, product → productId, supplier → supplierId, etc.)
 *   2. Adds default values for new fields
 *   3. Updates order statuses (PLACED → PENDING, CONFIRMED → PROCESSING)
 *   4. Generates slugs for products without one
 *   5. Cleans up old indexes that may conflict
 *
 * Run:  npm run migrate
 */

import mongoose from "mongoose";
import { env } from "./config/env";

const migrate = async () => {
  console.log("🔄 Starting database migration...\n");

  await mongoose.connect(env.MONGO_URI);
  console.log("✅ Connected to MongoDB\n");

  const db = mongoose.connection.db!;

  // ─────────────────────────────────────────────────
  // 1. PRODUCTS: rename 'supplier' → 'supplierId'
  // ─────────────────────────────────────────────────
  console.log("📦 Migrating products...");

  const prodRename = await db.collection("products").updateMany(
    { supplier: { $exists: true }, supplierId: { $exists: false } },
    { $rename: { supplier: "supplierId" } }
  );
  console.log(`  ✅ Renamed supplier → supplierId (${prodRename.modifiedCount} docs)`);

  // Add missing fields with defaults
  await db.collection("products").updateMany(
    { isActive: { $exists: false } },
    { $set: { isActive: true } }
  );
  await db.collection("products").updateMany(
    { description: { $exists: false } },
    { $set: { description: "" } }
  );
  await db.collection("products").updateMany(
    { mrp: { $exists: false } },
    { $set: { mrp: 0 } }
  );
  await db.collection("products").updateMany(
    { ratings: { $exists: false } },
    { $set: { ratings: { average: 0, count: 0 } } }
  );

  // Generate slugs for products that don't have one
  const productsCursor = db.collection("products").find({
    $or: [{ slug: { $exists: false } }, { slug: null }, { slug: "" }]
  });

  let slugCount = 0;
  for await (const product of productsCursor) {
    const base = (product.name || "product")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    const slug = `${base}-${Date.now()}-${slugCount}`;
    await db.collection("products").updateOne(
      { _id: product._id },
      { $set: { slug } }
    );
    slugCount++;
  }
  console.log(`  ✅ Default fields added, ${slugCount} slugs generated`);

  // Drop old slug index that may have null conflicts
  try {
    await db.collection("products").dropIndex("slug_1");
    console.log("  ✅ Dropped old slug_1 index (will be recreated by Mongoose)");
  } catch (e: any) {
    if (e.codeName !== "IndexNotFound") {
      console.log("  ⚠️  Could not drop slug_1 index:", e.message);
    }
  }

  // ─────────────────────────────────────────────────
  // 2. ORDERS: rename fields + update statuses
  // ─────────────────────────────────────────────────
  console.log("\n📦 Migrating orders...");

  // Drop old indexes that reference renamed fields
  for (const idx of ["user_1_createdAt_-1", "items.supplier_1"]) {
    try {
      await db.collection("orders").dropIndex(idx);
      console.log(`  ✅ Dropped old index ${idx}`);
    } catch (e: any) {
      // IndexNotFound is fine
    }
  }

  // Rename user → userId
  const orderUserRename = await db.collection("orders").updateMany(
    { user: { $exists: true }, userId: { $exists: false } },
    { $rename: { user: "userId" } }
  );
  console.log(`  ✅ Renamed user → userId (${orderUserRename.modifiedCount} docs)`);

  // Rename totalAmount → total
  const orderTotalRename = await db.collection("orders").updateMany(
    { totalAmount: { $exists: true }, total: { $exists: false } },
    { $rename: { totalAmount: "total" } }
  );
  console.log(`  ✅ Renamed totalAmount → total (${orderTotalRename.modifiedCount} docs)`);

  // Rename commissionAmount → commission
  const orderCommRename = await db.collection("orders").updateMany(
    { commissionAmount: { $exists: true }, commission: { $exists: false } },
    { $rename: { commissionAmount: "commission" } }
  );
  console.log(`  ✅ Renamed commissionAmount → commission (${orderCommRename.modifiedCount} docs)`);

  // Rename items subdocument fields (product → productId, supplier → supplierId)
  // $rename doesn't work on array elements, so we iterate
  const ordersCursor = db.collection("orders").find({
    "items.product": { $exists: true }
  });

  let orderItemCount = 0;
  for await (const order of ordersCursor) {
    const updatedItems = order.items.map((item: any) => ({
      productId: item.product || item.productId,
      supplierId: item.supplier || item.supplierId,
      name: item.name || "",
      price: item.price || 0,
      quantity: item.quantity || 1,
      image: item.image || ""
    }));

    await db.collection("orders").updateOne(
      { _id: order._id },
      { $set: { items: updatedItems } }
    );
    orderItemCount++;
  }
  console.log(`  ✅ Order items migrated (${orderItemCount} orders updated)`);

  // Update order statuses
  const statusPlaced = await db.collection("orders").updateMany(
    { status: "PLACED" },
    { $set: { status: "PENDING" } }
  );
  console.log(`  ✅ Status PLACED → PENDING (${statusPlaced.modifiedCount} updated)`);

  const statusConfirmed = await db.collection("orders").updateMany(
    { status: "CONFIRMED" },
    { $set: { status: "PROCESSING" } }
  );
  console.log(`  ✅ Status CONFIRMED → PROCESSING (${statusConfirmed.modifiedCount} updated)`);

  // Add default values for new fields
  await db.collection("orders").updateMany(
    { paymentStatus: { $exists: false } },
    { $set: { paymentStatus: "PENDING" } }
  );
  await db.collection("orders").updateMany(
    { paymentMethod: { $exists: false } },
    { $set: { paymentMethod: "COD" } }
  );
  await db.collection("orders").updateMany(
    { deliveryConfirmation: { $exists: false } },
    {
      $set: {
        deliveryConfirmation: {
          supplierConfirmed: false,
          userConfirmed: false,
          cashCollected: 0,
          deliveredAt: null,
          userConfirmedAt: null
        }
      }
    }
  );
  await db.collection("orders").updateMany(
    { trackingId: { $exists: false } },
    { $set: { trackingId: "" } }
  );
  // For DELIVERED orders, set paymentStatus to PAID
  await db.collection("orders").updateMany(
    { status: "DELIVERED", paymentStatus: "PENDING" },
    { $set: { paymentStatus: "PAID" } }
  );
  console.log("  ✅ Default fields added");

  // ─────────────────────────────────────────────────
  // 3. CARTS: rename user → userId, items.product → items.productId
  // ─────────────────────────────────────────────────
  console.log("\n📦 Migrating carts...");

  // Drop old user_1 unique index before renaming (it would conflict)
  try {
    await db.collection("carts").dropIndex("user_1");
    console.log("  ✅ Dropped old user_1 index");
  } catch (e: any) {
    if (e.codeName !== "IndexNotFound") {
      console.log("  ⚠️  Could not drop user_1 index:", e.message);
    }
  }

  const cartUserRename = await db.collection("carts").updateMany(
    { user: { $exists: true }, userId: { $exists: false } },
    { $rename: { user: "userId" } }
  );
  console.log(`  ✅ Renamed user → userId (${cartUserRename.modifiedCount} docs)`);

  const cartsCursor = db.collection("carts").find({
    "items.product": { $exists: true }
  });

  let cartCount = 0;
  for await (const cart of cartsCursor) {
    const updatedItems = cart.items.map((item: any) => ({
      productId: item.product || item.productId,
      quantity: item.quantity || 1
    }));

    await db.collection("carts").updateOne(
      { _id: cart._id },
      { $set: { items: updatedItems } }
    );
    cartCount++;
  }
  console.log(`  ✅ Cart items migrated (${cartCount} carts updated)`);

  // ─────────────────────────────────────────────────
  // 4. REVIEWS: rename user → userId, product → productId
  // ─────────────────────────────────────────────────
  console.log("\n📦 Migrating reviews...");

  // Drop old indexes before renaming
  try {
    await db.collection("reviews").dropIndex("user_1_product_1");
    console.log("  ✅ Dropped old user_1_product_1 index");
  } catch (e: any) {
    if (e.codeName !== "IndexNotFound") {
      console.log("  ⚠️  Could not drop user_1_product_1 index:", e.message);
    }
  }

  const reviewUserRename = await db.collection("reviews").updateMany(
    { user: { $exists: true }, userId: { $exists: false } },
    { $rename: { user: "userId" } }
  );
  console.log(`  ✅ Renamed user → userId (${reviewUserRename.modifiedCount} docs)`);

  const reviewProductRename = await db.collection("reviews").updateMany(
    { product: { $exists: true }, productId: { $exists: false } },
    { $rename: { product: "productId" } }
  );
  console.log(`  ✅ Renamed product → productId (${reviewProductRename.modifiedCount} docs)`);

  // ─────────────────────────────────────────────────
  // 5. USERS: add default fields
  // ─────────────────────────────────────────────────
  console.log("\n📦 Migrating users...");

  await db.collection("users").updateMany(
    { role: { $exists: false } },
    { $set: { role: "USER" } }
  );
  await db.collection("users").updateMany(
    { phone: { $exists: false } },
    { $set: { phone: "" } }
  );
  await db.collection("users").updateMany(
    { addresses: { $exists: false } },
    { $set: { addresses: [] } }
  );
  console.log("  ✅ Default fields added (role, phone, addresses)");

  // ─────────────────────────────────────────────────
  // 6. SUPPLIERS: add default fields
  // ─────────────────────────────────────────────────
  console.log("\n📦 Migrating suppliers...");

  await db.collection("suppliers").updateMany(
    { gstin: { $exists: false } },
    { $set: { gstin: "" } }
  );
  await db.collection("suppliers").updateMany(
    { address: { $exists: false } },
    { $set: { address: "" } }
  );
  await db.collection("suppliers").updateMany(
    { bankDetails: { $exists: false } },
    {
      $set: {
        bankDetails: {
          accountHolderName: "",
          accountNumber: "",
          ifscCode: "",
          bankName: ""
        }
      }
    }
  );
  await db.collection("suppliers").updateMany(
    { commissionRate: { $exists: false } },
    { $set: { commissionRate: 10 } }
  );
  await db.collection("suppliers").updateMany(
    { phone: { $exists: false } },
    { $set: { phone: "" } }
  );
  console.log("  ✅ Default fields added (gstin, address, bankDetails, commissionRate)");

  // ─────────────────────────────────────────────────
  // 7. PAYMENTS: rename order → orderId (if applicable)
  // ─────────────────────────────────────────────────
  console.log("\n📦 Migrating payments...");

  const paymentRename = await db.collection("payments").updateMany(
    { order: { $exists: true }, orderId: { $exists: false } },
    { $rename: { order: "orderId" } }
  );
  console.log(`  ✅ Renamed order → orderId (${paymentRename.modifiedCount} docs)`);

  // ─────────────────────────────────────────────────
  // DONE
  // ─────────────────────────────────────────────────
  console.log("\n🎉 Migration completed successfully!");
  console.log("   All existing data has been preserved.");
  console.log("   You can now start the server with: npm run dev\n");

  await mongoose.disconnect();
  process.exit(0);
};

migrate().catch((err) => {
  console.error("❌ Migration failed:", err);
  process.exit(1);
});
