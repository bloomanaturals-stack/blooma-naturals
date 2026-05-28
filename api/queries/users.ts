import { eq } from "drizzle-orm";
import * as schema from "@db/schema";
import type { InsertUser } from "@db/schema";
import { getDb } from "./connection";
import { env } from "../lib/env";

export async function findUserByUnionId(unionId: string) {
  const rows = await getDb()
    .select()
    .from(schema.users)
    .where(eq(schema.users.unionId, unionId))
    .limit(1);
  return rows.at(0);
}

export async function upsertUser(data: InsertUser) {
  const values = { ...data };
  const updateSet: Partial<InsertUser> = {
    lastSignInAt: new Date(),
    ...data,
  };

  if (
    values.role === undefined &&
    values.unionId &&
    values.unionId === env.ownerUnionId
  ) {
    values.role = "admin";
    updateSet.role = "admin";
  }

  const db = getDb();

  // First, check if the user already exists with this exact unionId
  const existingByUnion = await db.query.users.findFirst({
    where: eq(schema.users.unionId, data.unionId),
  });

  if (existingByUnion) {
    // Just update the existing authenticated user
    await db.update(schema.users).set(updateSet).where(eq(schema.users.id, existingByUnion.id));
    return;
  }

  // If not found by unionId, try to find an unlinked account by email (e.g. from guest checkout)
  if (data.email) {
    const existingByEmail = await db.query.users.findFirst({
      where: eq(schema.users.email, data.email),
    });
    
    if (existingByEmail) {
      // Link the existing guest account to this Supabase unionId
      await db.update(schema.users).set({
        unionId: data.unionId,
        lastSignInAt: new Date(),
        avatar: data.avatar || existingByEmail.avatar,
        name: data.name || existingByEmail.name,
      }).where(eq(schema.users.id, existingByEmail.id));
      return;
    }
  }

  // If completely new, insert
  await db.insert(schema.users).values(values);
}
