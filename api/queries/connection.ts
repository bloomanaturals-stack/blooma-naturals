import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "../lib/env";
import * as schema from "@db/schema";
import * as relations from "@db/relations";

const fullSchema = { ...schema, ...relations };

let instance: ReturnType<typeof drizzle<typeof fullSchema>> | undefined;
let client: ReturnType<typeof postgres> | undefined;

export function getDb() {
  if (!instance) {
    client = postgres(env.databaseUrl, {
      prepare: false,
    });
    instance = drizzle(client, {
      schema: fullSchema,
    });
  }
  return instance;
}

export async function closeDb() {
  if (client) {
    await client.end();
    instance = undefined;
    client = undefined;
  }
}
