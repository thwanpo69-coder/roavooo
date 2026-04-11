import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Link, useLocation } from "wouter";

export function Login() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    setLocation("/favorites");
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

        <input
          type="email"
          placeholder="Email"
          className="w-full p-3 rounded-lg bg-muted"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 rounded-lg bg-muted"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-white p-3 rounded-lg font-semibold"
        >
          {loading ? "Loading..." : "Log in"}
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