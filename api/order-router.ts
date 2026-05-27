import { z } from "zod";
import { createRouter, publicQuery, authedQuery, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { orders, orderItems } from "@db/schema";
import { eq, and, desc, sql } from "drizzle-orm";

function generateOrderNumber(): string {
  return "VD" + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 5).toUpperCase();
}

export const orderRouter = createRouter({
  create: publicQuery
    .input(
      z.object({
        items: z.array(z.object({
          productId: z.number(),
          productName: z.string(),
          size: z.string().optional(),
          price: z.number(),
          quantity: z.number(),
        })),
        shippingAddress: z.object({
          name: z.string(),
          phone: z.string(),
          addressLine1: z.string(),
          addressLine2: z.string().optional(),
          city: z.string(),
          state: z.string(),
          pincode: z.string(),
        }),
        paymentMethod: z.enum(["upi", "card", "netbanking", "wallet", "cod"]),
        couponCode: z.string().optional(),
        discount: z.number().default(0),
        shipping: z.number().default(0),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const userId = ctx.user?.id ?? 0;
      const subtotal = input.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
      const total = subtotal - input.discount + input.shipping;
      const orderNumber = generateOrderNumber();

      const order = await db.insert(orders).values({
        orderNumber,
        userId: userId || 1,
        status: "pending",
        paymentStatus: "pending",
        paymentMethod: input.paymentMethod,
        subtotal: subtotal.toString(),
        discount: input.discount.toString(),
        shipping: input.shipping.toString(),
        total: total.toString(),
        couponCode: input.couponCode,
        shippingAddress: input.shippingAddress,
        notes: "",
      }).returning({ id: orders.id });

      const orderId = order[0].id;

      for (const item of input.items) {
        await db.insert(orderItems).values({
          orderId,
          productId: item.productId,
          productName: item.productName,
          size: item.size,
          price: item.price.toString(),
          quantity: item.quantity,
          total: (item.price * item.quantity).toString(),
        });
      }

      return { orderId, orderNumber, total };
    }),

  list: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    return db.query.orders.findMany({
      where: eq(orders.userId, ctx.user.id),
      orderBy: desc(orders.createdAt),
      with: { items: true },
    });
  }),

  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      return db.query.orders.findFirst({
        where: eq(orders.id, input.id),
        with: { items: true },
      });
    }),

  getAll: adminQuery
    .input(
      z.object({
        page: z.number().default(1),
        limit: z.number().default(20),
        status: z.string().optional(),
      })
    )
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

  getStats: adminQuery.query(async () => {
    const db = getDb();
    const totalOrders = await db.select({ count: sql<number>`count(*)` }).from(orders);
    const totalRevenue = await db.select({ sum: sql<string>`coalesce(sum(total), 0)` }).from(orders);
    const pendingOrders = await db.select({ count: sql<number>`count(*)` }).from(orders).where(eq(orders.status, "pending"));
    const deliveredOrders = await db.select({ count: sql<number>`count(*)` }).from(orders).where(eq(orders.status, "delivered"));

    return {
      totalOrders: totalOrders[0]?.count ?? 0,
      totalRevenue: Number(totalRevenue[0]?.sum ?? 0),
      pendingOrders: pendingOrders[0]?.count ?? 0,
      deliveredOrders: deliveredOrders[0]?.count ?? 0,
    };
  }),

  updateStatus: adminQuery
    .input(z.object({ id: z.number(), status: z.enum(["pending", "processing", "shipped", "delivered", "cancelled"]) }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.update(orders).set({ status: input.status }).where(eq(orders.id, input.id));
      return { success: true };
    }),
});
