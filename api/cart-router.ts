import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { carts, coupons } from "@db/schema";
import { eq, and } from "drizzle-orm";
import { randomUUID } from "crypto";

function getSessionId(ctx: { req: Request; resHeaders: Headers }): string {
  const cookie = ctx.req.headers.get("cookie");
  if (cookie) {
    const match = cookie.match(/sessionId=([^;]+)/);
    if (match) return match[1];
  }
  const newId = randomUUID();
  ctx.resHeaders.append("Set-Cookie", `sessionId=${newId}; Path=/; HttpOnly; SameSite=Lax; Max-Age=31536000`);
  return newId;
}

export const cartRouter = createRouter({
  get: publicQuery.query(async ({ ctx }) => {
    const db = getDb();
    const sessionId = getSessionId(ctx);
    const userId = ctx.user?.id;

    const where = userId
      ? eq(carts.userId, userId)
      : eq(carts.sessionId, sessionId);

    const items = await db.query.carts.findMany({
      where,
      with: { product: { with: { category: true, sizes: true } } },
    });

    let subtotal = 0;
    const itemsWithTotal = items.map((item) => {
      const price = Number(item.product?.price ?? 0);
      const total = price * item.quantity;
      subtotal += total;
      return { ...item, price, total };
    });

    return {
      items: itemsWithTotal,
      subtotal,
      itemCount: items.reduce((sum, i) => sum + i.quantity, 0),
      sessionId,
    };
  }),

  add: publicQuery
    .input(
      z.object({
        productId: z.number(),
        sizeId: z.number().optional(),
        quantity: z.number().default(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const sessionId = getSessionId(ctx);
      const userId = ctx.user?.id;

      const existing = await db.query.carts.findFirst({
        where: and(
          eq(carts.productId, input.productId),
          userId ? eq(carts.userId, userId) : eq(carts.sessionId, sessionId),
        ),
      });

      if (existing) {
        if (input.sizeId && existing.sizeId !== input.sizeId) {
          // Different size, create new item
        } else {
          await db.update(carts).set({
            quantity: existing.quantity + input.quantity,
          }).where(eq(carts.id, existing.id));
          return { ...existing, quantity: existing.quantity + input.quantity };
        }
      }

      const result = await db.insert(carts).values({
        userId: userId ?? null,
        sessionId: userId ? null : sessionId,
        productId: input.productId,
        sizeId: input.sizeId ?? null,
        quantity: input.quantity,
      }).returning({ id: carts.id });

      return { id: result[0].id, ...input };
    }),

  update: publicQuery
    .input(z.object({ itemId: z.number(), quantity: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.update(carts).set({ quantity: input.quantity }).where(eq(carts.id, input.itemId));
      return { success: true };
    }),

  remove: publicQuery
    .input(z.object({ itemId: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(carts).where(eq(carts.id, input.itemId));
      return { success: true };
    }),

  clear: publicQuery.mutation(async ({ ctx }) => {
    const db = getDb();
    const sessionId = getSessionId(ctx);
    const userId = ctx.user?.id;
    const where = userId ? eq(carts.userId, userId) : eq(carts.sessionId, sessionId);
    await db.delete(carts).where(where);
    return { success: true };
  }),

  applyCoupon: publicQuery
    .input(z.object({ code: z.string(), subtotal: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const coupon = await db.query.coupons.findFirst({
        where: eq(coupons.code, input.code),
      });

      if (!coupon || !coupon.isActive) return { valid: false, message: "Invalid coupon code" };
      if (Number(coupon.minOrder) > input.subtotal) return { valid: false, message: `Minimum order ₹${coupon.minOrder} required` };
      if (coupon.usageLimit && (coupon.usageCount ?? 0) >= coupon.usageLimit) return { valid: false, message: "Coupon usage limit reached" };
      const now = new Date();
      if (coupon.startDate > now || coupon.endDate < now) return { valid: false, message: "Coupon expired" };

      let discount = 0;
      if (coupon.type === "percentage") {
        discount = (input.subtotal * Number(coupon.value)) / 100;
        if (coupon.maxDiscount && discount > Number(coupon.maxDiscount)) discount = Number(coupon.maxDiscount);
      } else {
        discount = Number(coupon.value);
      }

      return { valid: true, discount: Math.round(discount), coupon: { code: coupon.code, type: coupon.type, value: Number(coupon.value) } };
    }),
});
