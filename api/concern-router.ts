import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";

export const concernRouter = createRouter({
  list: publicQuery.query(async () => {
    const db = getDb();
    return db.query.concerns.findMany({});
  }),
});
