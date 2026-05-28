import { createRouter, publicQuery } from "./middleware";

import { TRPCError } from "@trpc/server";

export const authRouter = createRouter({
  me: publicQuery.query((opts) => {
    if (opts.ctx.authError) {
      throw new TRPCError({ code: "UNAUTHORIZED", message: opts.ctx.authError });
    }
    return opts.ctx.user ?? null;
  }),
  logout: publicQuery.mutation(async () => {
    return { success: true };
  }),
});
