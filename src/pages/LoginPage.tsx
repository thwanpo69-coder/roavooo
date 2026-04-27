import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Link, useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

export function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const cleanIdentifier = identifier.trim().toLowerCase();

    let loginEmail = cleanIdentifier;

    if (!cleanIdentifier.includes("@")) {
      const { data: emailFromUsername, error: usernameError } =
        await supabase.rpc("get_email_by_username", {
          input_username: cleanIdentifier,
        });

      if (usernameError) {
        console.error(usernameError);
        toast({
          variant: "destructive",
          title: "Login failed",
          description: "Could not check username. Please try again.",
        });
        setLoading(false);
        return;
      }

      if (!emailFromUsername) {
        toast({
          variant: "destructive",
          title: "Username not found",
          description: "Check your username or log in with your email.",
        });
        setLoading(false);
        return;
      }

      loginEmail = emailFromUsername;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password,
    });

    setLoading(false);

    if (error) {
      toast({
        variant: "destructive",
        title: "Login failed",
        description: "Invalid username/email or password.",
      });
      return;
    }

    toast({
      title: "Welcome back",
      description: "You are logged in successfully.",
    });

    const redirectAfterLogin = localStorage.getItem("redirectAfterLogin");

    if (redirectAfterLogin) {
      localStorage.removeItem("redirectAfterLogin");
      setLocation(redirectAfterLogin);
      return;
    }

    setLocation("/");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-xl space-y-4"
      >
        <h1 className="text-3xl font-serif font-bold text-foreground">
          Log in
        </h1>

        <p className="text-sm text-muted-foreground">
          Access your favorites and start building your travel plans.
        </p>

        <input
          type="text"
          placeholder="Username or email"
          className="w-full p-3 rounded-lg bg-muted border border-border outline-none"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 rounded-lg bg-muted border border-border outline-none"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-white p-3 rounded-lg font-semibold disabled:opacity-60"
        >
          {loading ? "Logging in..." : "Log in"}
        </button>

        <p className="text-sm text-muted-foreground text-center">
          Don’t have an account?{" "}
          <Link href="/signup" className="text-primary font-semibold">
            Sign up
          </Link>
        </p>
      </form>
    </div>
  );
}