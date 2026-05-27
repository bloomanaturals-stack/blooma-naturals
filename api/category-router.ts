import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { categories } from "@db/schema";
import { eq } from "drizzle-orm";

export const categoryRouter = createRouter({
  list: publicQuery.query(async () => {
    const db = getDb();
    return db.query.categories.findMany({
      orderBy: (categories, { asc }) => [asc(categories.sortOrder)],
    });
  }),

  getBySlug: publicQuery
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      return db.query.categories.findFirst({
        where: eq(categories.slug, input.slug),
        with: { products: { where: (p, { eq }) => eq(p.isActive, true) } },
      });
    }),
});
