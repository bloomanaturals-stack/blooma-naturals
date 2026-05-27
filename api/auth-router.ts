import { createRouter, publicQuery } from "./middleware";

export const authRouter = createRouter({
  me: publicQuery.query((opts) => opts.ctx.user ?? null),
  logout: publicQuery.mutation(async () => {
    return { success: true };
  }),
});
