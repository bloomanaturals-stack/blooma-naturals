import { getDb } from "./api/queries/connection";
import { users } from "./db/schema";
import { eq } from "drizzle-orm";
async function main() {
  const db = getDb();
  const res = await db.select().from(users).where(eq(users.email, "safarikarthik@gmail.com"));
  console.log(JSON.stringify(res, null, 2));
  process.exit(0);
}
main();
