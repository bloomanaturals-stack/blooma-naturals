import { env } from "./api/lib/env";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(env.supabaseUrl, env.supabaseAnonKey);
async function main() {
  const { data, error } = await supabase.auth.signUp({
    email: "test_auth_2@example.com",
    password: "Password123!",
  });
  
  if (data?.session) {
    console.log("Got session!");
    const res = await fetch("http://localhost:3000/api/trpc/auth.me", {
      headers: {
        "Authorization": `Bearer ${data.session.access_token}`
      }
    });
    console.log("auth.me status:", res.status);
    console.log("auth.me response:", await res.text());
  } else if (error) {
    const res2 = await supabase.auth.signInWithPassword({
      email: "test_auth_2@example.com",
      password: "Password123!",
    });
    if (res2.data.session) {
      console.log("Got session via sign in!");
      const res = await fetch("http://localhost:3000/api/trpc/auth.me", {
        headers: {
          "Authorization": `Bearer ${res2.data.session.access_token}`
        }
      });
      console.log("auth.me status:", res.status);
      console.log("auth.me response:", await res.text());
    } else {
      console.error(res2.error);
    }
  }
}
main();
