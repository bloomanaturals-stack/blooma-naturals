import { authRouter } from "./auth-router";
import { productRouter } from "./product-router";
import { categoryRouter } from "./category-router";
import { concernRouter } from "./concern-router";
import { cartRouter } from "./cart-router";
import { orderRouter } from "./order-router";
import { wishlistRouter } from "./wishlist-router";
import { addressRouter } from "./address-router";
import { newsletterRouter } from "./newsletter-router";
import { quizRouter } from "./quiz-router";
import { adminRouter } from "./admin-router";
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  product: productRouter,
  category: categoryRouter,
  concern: concernRouter,
  cart: cartRouter,
  order: orderRouter,
  wishlist: wishlistRouter,
  address: addressRouter,
  newsletter: newsletterRouter,
  quiz: quizRouter,
  admin: adminRouter,
});

export type AppRouter = typeof appRouter;
