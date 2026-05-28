import { upsertUser } from "./api/queries/users";
import { closeDb } from "./api/queries/connection";

async function main() {
  try {
    await upsertUser({
      unionId: "supabase:test-id-1234",
      email: "test@example.com",
      name: "Test User",
    });
    console.log("Upsert successful!");
  } catch (e) {
    console.error("Upsert failed:", e);
  } finally {
    await closeDb();
  }
}
main();
