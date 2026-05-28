import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { Navigate, useLocation } from "react-router";
import { useState, useEffect } from "react";

export default function Login() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(location.pathname === "/register");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsSignUp(location.pathname === "/register");
  }, [location.pathname]);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSupabaseConfigured) {
      toast.error("Supabase Auth is not configured yet");
      return;
    }

    setIsLoading(true);
    let error;

    if (isSignUp) {
      const res = await supabase.auth.signUp({ email, password });
      error = res.error;
      if (!error && res.data.user?.identities?.length === 0) {
        toast.error("An account with this email already exists.");
        setIsLoading(false);
        return;
      }
      if (!error) {
        toast.success("Account created successfully!");
      }
    } else {
      const res = await supabase.auth.signInWithPassword({ email, password });
      error = res.error;
    }

    setIsLoading(false);

    if (error) {
      toast.error(error.message);
    }
  };

  const signInWithGoogle = async () => {
    if (!isSupabaseConfigured) {
      toast.error("Supabase Auth is not configured yet");
      return;
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/login`,
      },
    });

    if (error) {
      toast.error(error.message);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#EBE5D9]">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-[#455848] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (isAuthenticated && user) {
    if (user.role === "admin") {
      return <Navigate to="/admin" replace />;
    }
    return <Navigate to="/account" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#EBE5D9] section-padding py-12">
      <Card className="w-full max-w-sm border-[#E5E5E5] shadow-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold tracking-tight text-[#2D2D2D]">
            {isSignUp ? "Create an Account" : "Welcome Back"}
          </CardTitle>
          <CardDescription>
            {isSignUp ? "Sign up for a Blooma Naturals account." : "Sign in to your Blooma Naturals account to continue."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 mt-2">
          <form onSubmit={handleEmailAuth} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-11"
                minLength={6}
              />
            </div>
            <Button
              type="submit"
              className="w-full h-11 bg-[#455848] hover:bg-[#6D8A7C] text-white"
              disabled={isLoading || !isSupabaseConfigured}
            >
              {isLoading ? "Please wait..." : (isSignUp ? "Sign Up" : "Sign In")}
            </Button>
          </form>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-[#E5E5E5]" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-[#2D2D2D]/60 font-medium">Or continue with</span>
            </div>
          </div>

          <Button
            type="button"
            className="w-full flex items-center justify-center gap-2 bg-white text-[#2D2D2D] hover:bg-gray-50 border border-[#E5E5E5] shadow-sm transition-all h-11 text-base font-medium"
            onClick={signInWithGoogle}
            disabled={!isSupabaseConfigured || isLoading}
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Google
          </Button>
          {!isSupabaseConfigured && (
            <div className="bg-[#C75B4E]/10 border border-[#C75B4E]/20 rounded-md p-3">
              <p className="text-center text-xs text-[#C75B4E] leading-relaxed">
                <span className="font-semibold block mb-1">Configuration Missing</span>
                Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your environment variables.
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <div className="w-full text-center text-sm text-[#2D2D2D]/70">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="font-semibold text-[#455848] hover:underline"
            >
              {isSignUp ? "Sign In" : "Sign Up"}
            </button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
