import {
  pgTable,
  pgEnum,
  serial,
  varchar,
  text,
  timestamp,
  integer,
  decimal,
  boolean,
  jsonb,
} from "drizzle-orm/pg-core";

export const userRole = pgEnum("user_role", ["user", "admin"]);
export const skinType = pgEnum("skin_type", ["all", "oily", "dry", "combination", "sensitive"]);
export const hairType = pgEnum("hair_type", ["all", "straight", "wavy", "curly", "coily"]);
export const productBadge = pgEnum("product_badge", ["none", "new", "bestseller", "sale"]);
export const couponType = pgEnum("coupon_type", ["percentage", "fixed"]);
export const orderStatus = pgEnum("order_status", ["pending", "processing", "shipped", "delivered", "cancelled"]);
export const paymentStatus = pgEnum("payment_status", ["pending", "paid", "failed", "refunded"]);
export const paymentMethod = pgEnum("payment_method", ["upi", "card", "netbanking", "wallet", "cod"]);
export const bannerPosition = pgEnum("banner_position", ["hero", "promo", "featured"]);
export const quizType = pgEnum("quiz_type", ["skincare", "haircare"]);

// ─── Users (Auth) ──────────────────────────────────────────
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  unionId: varchar("unionId", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  avatar: text("avatar"),
  role: userRole("role").default("user").notNull(),
  phone: varchar("phone", { length: 20 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull(),
});

// ─── Categories ────────────────────────────────────────────
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  description: text("description"),
  image: varchar("image", { length: 500 }),
  sortOrder: integer("sortOrder").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ─── Concerns ──────────────────────────────────────────────
export const concerns = pgTable("concerns", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  icon: varchar("icon", { length: 100 }),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ─── Products ──────────────────────────────────────────────
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description").notNull(),
  shortDescription: varchar("shortDescription", { length: 500 }).notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  originalPrice: decimal("originalPrice", { precision: 10, scale: 2 }).notNull(),
  categoryId: integer("categoryId").notNull(),
  concernId: integer("concernId"),
  skinType: skinType("skinType").default("all"),
  hairType: hairType("hairType").default("all"),
  ingredients: jsonb("ingredients").$type<string[]>(),
  howToUse: text("howToUse"),
  stock: integer("stock").default(100),
  rating: decimal("rating", { precision: 2, scale: 1 }).default("5.0"),
  reviewCount: integer("reviewCount").default(0),
  badge: productBadge("badge").default("none"),
  isActive: boolean("isActive").default(true),
  image: varchar("image", { length: 500 }),
  image2: varchar("image2", { length: 500 }),
  image3: varchar("image3", { length: 500 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

// ─── Product Sizes ─────────────────────────────────────────
export const productSizes = pgTable("product_sizes", {
  id: serial("id").primaryKey(),
  productId: integer("productId").notNull(),
  size: varchar("size", { length: 50 }).notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  originalPrice: decimal("originalPrice", { precision: 10, scale: 2 }).notNull(),
  stock: integer("stock").default(50),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ─── Reviews ───────────────────────────────────────────────
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  productId: integer("productId").notNull(),
  userId: integer("userId"),
  userName: varchar("userName", { length: 255 }).notNull(),
  rating: integer("rating").notNull(),
  title: varchar("title", { length: 255 }),
  comment: text("comment").notNull(),
  isVerified: boolean("isVerified").default(false),
  helpful: integer("helpful").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ─── Coupons ───────────────────────────────────────────────
export const coupons = pgTable("coupons", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  type: couponType("type").notNull(),
  value: decimal("value", { precision: 10, scale: 2 }).notNull(),
  minOrder: decimal("minOrder", { precision: 10, scale: 2 }).default("0"),
  maxDiscount: decimal("maxDiscount", { precision: 10, scale: 2 }),
  usageLimit: integer("usageLimit"),
  usageCount: integer("usageCount").default(0),
  startDate: timestamp("startDate").notNull(),
  endDate: timestamp("endDate").notNull(),
  isActive: boolean("isActive").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ─── Carts ─────────────────────────────────────────────────
export const carts = pgTable("carts", {
  id: serial("id").primaryKey(),
  userId: integer("userId"),
  sessionId: varchar("sessionId", { length: 255 }),
  productId: integer("productId").notNull(),
  sizeId: integer("sizeId"),
  quantity: integer("quantity").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

// ─── Orders ────────────────────────────────────────────────
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  orderNumber: varchar("orderNumber", { length: 50 }).notNull().unique(),
  userId: integer("userId").notNull(),
  status: orderStatus("status").default("pending"),
  paymentStatus: paymentStatus("paymentStatus").default("pending"),
  paymentMethod: paymentMethod("paymentMethod").notNull(),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  discount: decimal("discount", { precision: 10, scale: 2 }).default("0"),
  shipping: decimal("shipping", { precision: 10, scale: 2 }).default("0"),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  couponCode: varchar("couponCode", { length: 50 }),
  shippingAddress: jsonb("shippingAddress").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

// ─── Order Items ───────────────────────────────────────────
export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("orderId").notNull(),
  productId: integer("productId").notNull(),
  productName: varchar("productName", { length: 255 }).notNull(),
  size: varchar("size", { length: 50 }),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  quantity: integer("quantity").notNull(),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ─── Addresses ─────────────────────────────────────────────
export const addresses = pgTable("addresses", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  addressLine1: varchar("addressLine1", { length: 500 }).notNull(),
  addressLine2: varchar("addressLine2", { length: 500 }),
  city: varchar("city", { length: 100 }).notNull(),
  state: varchar("state", { length: 100 }).notNull(),
  pincode: varchar("pincode", { length: 10 }).notNull(),
  isDefault: boolean("isDefault").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ─── Wishlists ─────────────────────────────────────────────
export const wishlists = pgTable("wishlists", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  productId: integer("productId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ─── Newsletter ────────────────────────────────────────────
export const newsletter = pgTable("newsletter", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  isActive: boolean("isActive").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ─── Banners ───────────────────────────────────────────────
export const banners = pgTable("banners", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  subtitle: varchar("subtitle", { length: 500 }),
  image: varchar("image", { length: 500 }),
  link: varchar("link", { length: 500 }),
  position: bannerPosition("position").default("promo"),
  sortOrder: integer("sortOrder").default(0),
  isActive: boolean("isActive").default(true),
  startDate: timestamp("startDate"),
  endDate: timestamp("endDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ─── Quiz Responses ────────────────────────────────────────
export const quizResponses = pgTable("quiz_responses", {
  id: serial("id").primaryKey(),
  userId: integer("userId"),
  quizType: quizType("quizType").notNull(),
  answers: jsonb("answers").$type<Record<string, string>>(),
  recommendations: jsonb("recommendations").$type<number[]>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ─── Settings ──────────────────────────────────────────────
export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  key: varchar("key", { length: 100 }).notNull().unique(),
  value: text("value").notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Product = typeof products.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Concern = typeof concerns.$inferSelect;
export type Review = typeof reviews.$inferSelect;
export type Cart = typeof carts.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;
export type Address = typeof addresses.$inferSelect;
export type Coupon = typeof coupons.$inferSelect;
export type Banner = typeof banners.$inferSelect;
export type Wishlist = typeof wishlists.$inferSelect;
export type QuizResponse = typeof quizResponses.$inferSelect;
