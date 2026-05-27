import { Errors } from "@contracts/errors";
import { getSupabaseServerClient } from "./supabase";
import { findUserByUnionId, upsertUser } from "../queries/users";

export async function authenticateRequest(headers: Headers) {
  const authHeader = headers.get("authorization");
  const bearerToken = authHeader?.match(/^Bearer\s+(.+)$/i)?.[1];
  
  if (bearerToken) {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase.auth.getUser(bearerToken);
    
    if (error || !data.user) {
      throw Errors.forbidden("Invalid Supabase authentication token.");
    }

    const authUser = data.user;
    const metadata = authUser.user_metadata ?? {};
    const unionId = `supabase:${authUser.id}`;
    
    await upsertUser({
      unionId,
      name: metadata.full_name ?? metadata.name ?? authUser.email ?? null,
      email: authUser.email ?? null,
      avatar: metadata.avatar_url ?? metadata.picture ?? null,
      lastSignInAt: new Date(),
    });

    const user = await findUserByUnionId(unionId);
    if (!user) {
      throw Errors.forbidden("User not found. Please re-login.");
    }
    
    return user;
  }

  throw Errors.forbidden("Invalid authentication token.");
}
