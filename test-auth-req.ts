import { createClient } from "@supabase/supabase-js";
import "dotenv/config";

const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "";
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || "";
const supabase = createClient(url, serviceKey);

async function main() {
  // We can't easily mint a JWT without a user, but we can sign up a dummy user
  const { data, error } = await supabase.auth.signUp({
    email: "test_auth_req@example.com",
    password: "Password123!",
  });
  if (error) {
    console.error("Sign up error:", error);
    // Might already exist, try sign in
    const res = await supabase.auth.signInWithPassword({
      email: "test_auth_req@example.com",
      password: "Password123!",
    });
    if (res.data.session) {
      console.log("Token:", res.data.session.access_token);
      await fetchMe(res.data.session.access_token);
    }
  } else if (data.session) {
    console.log("Token:", data.session.access_token);
    await fetchMe(data.session.access_token);
  }
}

async function fetchMe(token: string) {
  const res = await fetch("http://localhost:3000/api/trpc/auth.me", {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });
  const text = await res.text();
  console.log("auth.me response:", text);
}

main();
