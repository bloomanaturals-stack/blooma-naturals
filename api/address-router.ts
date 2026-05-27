import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { addresses } from "@db/schema";
import { eq } from "drizzle-orm";

export const addressRouter = createRouter({
  list: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    return db.query.addresses.findMany({
      where: eq(addresses.userId, ctx.user.id),
    });
  }),

  create: authedQuery
    .input(
      z.object({
        name: z.string(),
        phone: z.string(),
        addressLine1: z.string(),
        addressLine2: z.string().optional(),
        city: z.string(),
        state: z.string(),
        pincode: z.string(),
        isDefault: z.boolean().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const result = await db.insert(addresses).values({
        userId: ctx.user.id,
        ...input,
      }).returning({ id: addresses.id });
      return { id: result[0].id, ...input };
    }),

  update: authedQuery
    .input(
      z.object({
        id: z.number(),
        name: z.string().optional(),
        phone: z.string().optional(),
        addressLine1: z.string().optional(),
        addressLine2: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        pincode: z.string().optional(),
        isDefault: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      await db.update(addresses).set(data).where(eq(addresses.id, id));
      return { success: true };
    }),

  delete: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(addresses).where(eq(addresses.id, input.id));
      return { success: true };
    }),

  setDefault: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      await db.update(addresses).set({ isDefault: false }).where(eq(addresses.userId, ctx.user.id));
      await db.update(addresses).set({ isDefault: true }).where(eq(addresses.id, input.id));
      return { success: true };
    }),
});
