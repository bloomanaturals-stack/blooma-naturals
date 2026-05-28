import { upsertUser } from "./api/queries/users";
import { closeDb } from "./api/queries/connection";

async function main() {
  try {
    await upsertUser({
      unionId: "supabase:simulated-id",
      email: "safarikarthik@gmail.com",
      name: "Karthik",
    });
    console.log("Upsert successful!");
  } catch (e) {
    console.error("Upsert failed:", e);
  } finally {
    await closeDb();
  }
}
main();
