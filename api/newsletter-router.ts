import { z } from "zod";
import { createRouter, publicQuery, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { newsletter } from "@db/schema";
import { eq, desc, sql } from "drizzle-orm";

export const newsletterRouter = createRouter({
  subscribe: publicQuery
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const existing = await db.query.newsletter.findFirst({
        where: eq(newsletter.email, input.email),
      });
      if (existing) return { success: true, message: "Already subscribed!" };

      await db.insert(newsletter).values({ email: input.email });
      return { success: true, message: "Subscribed successfully!" };
    }),

  list: adminQuery.query(async () => {
    const db = getDb();
    const items = await db.query.newsletter.findMany({
      orderBy: desc(newsletter.createdAt),
    });
    const countResult = await db.select({ count: sql<number>`count(*)` }).from(newsletter);
    return { items, total: countResult[0]?.count ?? 0 };
  }),
});
