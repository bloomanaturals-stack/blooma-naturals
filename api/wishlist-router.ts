import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { wishlists } from "@db/schema";
import { eq, and } from "drizzle-orm";

export const wishlistRouter = createRouter({
  list: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const items = await db.query.wishlists.findMany({
      where: eq(wishlists.userId, ctx.user.id),
      with: { product: { with: { category: true, sizes: true } } },
    });
    return items.map((w) => w.product).filter(Boolean);
  }),

  toggle: authedQuery
    .input(z.object({ productId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const existing = await db.query.wishlists.findFirst({
        where: and(eq(wishlists.userId, ctx.user.id), eq(wishlists.productId, input.productId)),
      });

      if (existing) {
        await db.delete(wishlists).where(eq(wishlists.id, existing.id));
        return { added: false };
      }

      await db.insert(wishlists).values({
        userId: ctx.user.id,
        productId: input.productId,
      });
      return { added: true };
    }),

  check: authedQuery
    .input(z.object({ productId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const existing = await db.query.wishlists.findFirst({
        where: and(eq(wishlists.userId, ctx.user.id), eq(wishlists.productId, input.productId)),
      });
      return { isWishlisted: !!existing };
    }),
});
