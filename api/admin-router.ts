import { z } from "zod";
import { createRouter, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { products, orders, users, newsletter, settings } from "@db/schema";
import { eq, desc, sql, like, and } from "drizzle-orm";

export const adminRouter = createRouter({
  getDashboard: adminQuery.query(async () => {
    const db = getDb();
    const totalProducts = await db.select({ count: sql<number>`count(*)` }).from(products);
    const totalOrders = await db.select({ count: sql<number>`count(*)` }).from(orders);
    const totalRevenue = await db.select({ sum: sql<string>`coalesce(sum(total), 0)` }).from(orders);
    const totalUsers = await db.select({ count: sql<number>`count(*)` }).from(users);
    const totalSubscribers = await db.select({ count: sql<number>`count(*)` }).from(newsletter);

    return {
      totalProducts: totalProducts[0]?.count ?? 0,
      totalOrders: totalOrders[0]?.count ?? 0,
      totalRevenue: Number(totalRevenue[0]?.sum ?? 0),
      totalUsers: totalUsers[0]?.count ?? 0,
      totalSubscribers: totalSubscribers[0]?.count ?? 0,
    };
  }),

  getProducts: adminQuery
    .input(z.object({ page: z.number().default(1), limit: z.number().default(20), search: z.string().optional() }))
    .query(async ({ input }) => {
      const db = getDb();
      const conditions = [];
      if (input.search) conditions.push(like(products.name, `%${input.search}%`));
      const offset = (input.page - 1) * input.limit;
      const items = await db.query.products.findMany({
        where: conditions.length > 0 ? and(...conditions) : undefined,
        orderBy: desc(products.createdAt),
        limit: input.limit,
        offset,
        with: { category: true },
      });
      const countResult = await db.select({ count: sql<number>`count(*)` }).from(products).where(conditions.length > 0 ? and(...conditions) : undefined);
      return { items, total: countResult[0]?.count ?? 0, page: input.page, limit: input.limit };
    }),

  createProduct: adminQuery
    .input(z.object({
      name: z.string(),
      slug: z.string(),
      description: z.string(),
      shortDescription: z.string(),
      price: z.string(),
      originalPrice: z.string(),
      categoryId: z.number(),
      stock: z.number().default(100),
      badge: z.enum(["none", "new", "bestseller", "sale"]).default("none"),
      image: z.string().optional(),
      image2: z.string().optional(),
      image3: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(products).values(input).returning({ id: products.id });
      return { id: result[0].id, ...input };
    }),

  updateProduct: adminQuery
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      slug: z.string().optional(),
      description: z.string().optional(),
      shortDescription: z.string().optional(),
      price: z.string().optional(),
      originalPrice: z.string().optional(),
      categoryId: z.number().optional(),
      stock: z.number().optional(),
      isActive: z.boolean().optional(),
      badge: z.enum(["none", "new", "bestseller", "sale"]).optional(),
      image: z.string().optional(),
      image2: z.string().optional(),
      image3: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      await db.update(products).set(data).where(eq(products.id, id));
      return { success: true };
    }),

  deleteProduct: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(products).where(eq(products.id, input.id));
      return { success: true };
    }),

  getOrders: adminQuery
    .input(z.object({ page: z.number().default(1), limit: z.number().default(20), status: z.string().optional() }))
    .query(async ({ input }) => {
      const db = getDb();
      const conditions = [];
      if (input.status) conditions.push(eq(orders.status, input.status as any));
      const offset = (input.page - 1) * input.limit;
      const items = await db.query.orders.findMany({
        where: conditions.length > 0 ? and(...conditions) : undefined,
        orderBy: desc(orders.createdAt),
        limit: input.limit,
        offset,
        with: { items: true },
      });
      const countResult = await db.select({ count: sql<number>`count(*)` }).from(orders).where(conditions.length > 0 ? and(...conditions) : undefined);
      return { items, total: countResult[0]?.count ?? 0, page: input.page, limit: input.limit };
    }),

  getCustomers: adminQuery
    .input(z.object({ page: z.number().default(1), limit: z.number().default(20) }))
    .query(async ({ input }) => {
      const db = getDb();
      const offset = (input.page - 1) * input.limit;
      const items = await db.query.users.findMany({
        orderBy: desc(users.createdAt),
        limit: input.limit,
        offset,
      });
      const countResult = await db.select({ count: sql<number>`count(*)` }).from(users);
      return { items, total: countResult[0]?.count ?? 0, page: input.page, limit: input.limit };
    }),

  getSettings: adminQuery.query(async () => {
    const db = getDb();
    return db.query.settings.findMany({});
  }),

  updateSetting: adminQuery
    .input(z.object({ key: z.string(), value: z.string() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.update(settings).set({ value: input.value }).where(eq(settings.key, input.key));
      return { success: true };
    }),
});
