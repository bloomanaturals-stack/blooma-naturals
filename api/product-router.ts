import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { products, categories, concerns, reviews } from "@db/schema";
import { eq, and, like, gte, lte, desc, asc, sql } from "drizzle-orm";

export const productRouter = createRouter({
  list: publicQuery
    .input(
      z.object({
        category: z.string().optional(),
        concern: z.string().optional(),
        skinType: z.string().optional(),
        hairType: z.string().optional(),
        minPrice: z.number().optional(),
        maxPrice: z.number().optional(),
        rating: z.number().optional(),
        sort: z.enum(["popular", "price-low", "price-high", "newest", "rating"]).optional(),
        search: z.string().optional(),
        badge: z.string().optional(),
        page: z.number().default(1),
        limit: z.number().default(20),
      })
    )
    .query(async ({ input }) => {
      const db = getDb();
      const conditions = [eq(products.isActive, true)];

      if (input.category) {
        const cat = await db.query.categories.findFirst({
          where: eq(categories.slug, input.category),
        });
        if (cat) conditions.push(eq(products.categoryId, cat.id));
      }
      if (input.concern) {
        const con = await db.query.concerns.findFirst({
          where: eq(concerns.slug, input.concern),
        });
        if (con) conditions.push(eq(products.concernId, con.id));
      }
      if (input.skinType) conditions.push(eq(products.skinType, input.skinType as any));
      if (input.hairType) conditions.push(eq(products.hairType, input.hairType as any));
      if (input.minPrice) conditions.push(gte(products.price, input.minPrice.toString()));
      if (input.maxPrice) conditions.push(lte(products.price, input.maxPrice.toString()));
      if (input.rating) conditions.push(gte(products.rating, input.rating.toString()));
      if (input.search) conditions.push(like(products.name, `%${input.search}%`));
      if (input.badge) conditions.push(eq(products.badge, input.badge as any));

      let orderBy;
      switch (input.sort) {
        case "price-low": orderBy = asc(products.price); break;
        case "price-high": orderBy = desc(products.price); break;
        case "newest": orderBy = desc(products.createdAt); break;
        case "rating": orderBy = desc(products.rating); break;
        default: orderBy = desc(products.reviewCount); break;
      }

      const offset = (input.page - 1) * input.limit;
      const items = await db.query.products.findMany({
        where: and(...conditions),
        orderBy,
        limit: input.limit,
        offset,
        with: { category: true, sizes: true },
      });

      const countResult = await db.select({ count: sql<number>`count(*)` })
        .from(products)
        .where(and(...conditions));
      const total = countResult[0]?.count ?? 0;

      return { items, total, page: input.page, limit: input.limit };
    }),

  getBySlug: publicQuery
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      const product = await db.query.products.findFirst({
        where: and(eq(products.slug, input.slug), eq(products.isActive, true)),
        with: { category: true, concern: true, sizes: true },
      });
      if (!product) return null;

      const productReviews = await db.query.reviews.findMany({
        where: eq(reviews.productId, product.id),
        orderBy: desc(reviews.createdAt),
        limit: 10,
      });

      const related = await db.query.products.findMany({
        where: and(eq(products.categoryId, product.categoryId), eq(products.isActive, true)),
        limit: 4,
        with: { category: true },
      });

      return { ...product, reviews: productReviews, related: related.filter(r => r.id !== product.id) };
    }),

  getFeatured: publicQuery.query(async () => {
    const db = getDb();
    return db.query.products.findMany({
      where: eq(products.badge, "bestseller"),
      limit: 8,
      with: { category: true, sizes: true },
    });
  }),

  getBestsellers: publicQuery.query(async () => {
    const db = getDb();
    return db.query.products.findMany({
      where: eq(products.badge, "bestseller"),
      limit: 8,
      orderBy: desc(products.reviewCount),
      with: { category: true, sizes: true },
    });
  }),

  getNewArrivals: publicQuery.query(async () => {
    const db = getDb();
    return db.query.products.findMany({
      where: eq(products.badge, "new"),
      limit: 8,
      orderBy: desc(products.createdAt),
      with: { category: true, sizes: true },
    });
  }),

  getByConcern: publicQuery
    .input(z.object({ concernSlug: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      const concern = await db.query.concerns.findFirst({
        where: eq(concerns.slug, input.concernSlug),
      });
      if (!concern) return [];
      return db.query.products.findMany({
        where: and(eq(products.concernId, concern.id), eq(products.isActive, true)),
        limit: 8,
        with: { category: true },
      });
    }),

  search: publicQuery
    .input(z.object({ q: z.string(), limit: z.number().default(10) }))
    .query(async ({ input }) => {
      const db = getDb();
      return db.query.products.findMany({
        where: and(like(products.name, `%${input.q}%`), eq(products.isActive, true)),
        limit: input.limit,
        with: { category: true },
      });
    }),

  getPublishedReviews: publicQuery.query(async () => {
    const db = getDb();
    return db.query.reviews.findMany({
      where: eq(reviews.isPublished, true),
      orderBy: desc(reviews.createdAt),
      limit: 10,
      with: { product: true },
    });
  }),
});
