import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Link, useLocation } from "wouter";

export function Signup() {
  const [, setLocation] = useLocation();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const cleanUsername = username.trim().toLowerCase();
    const cleanEmail = email.trim().toLowerCase();

    if (cleanUsername.length < 3) {
      alert("Username must be at least 3 characters.");
      setLoading(false);
      return;
    }

    if (!/^[a-z0-9_]+$/.test(cleanUsername)) {
      alert("Username can only contain letters, numbers, and underscores.");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      alert("Password must be at least 6 characters.");
      setLoading(false);
      return;
    }

    const { data: existingEmail, error: usernameCheckError } =
      await supabase.rpc("get_email_by_username", {
        input_username: cleanUsername,
      });

    if (usernameCheckError) {
      console.error(usernameCheckError);
      alert("Could not check username. Please try again.");
      setLoading(false);
      return;
    }

    if (existingEmail) {
      alert("Username already used. Choose another one.");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        data: {
          username: cleanUsername,
        },
      },
    });

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      const { error: profileError } = await supabase.from("profiles").upsert({
        id: data.user.id,
        username: cleanUsername,
        email: cleanEmail,
      });

      if (profileError) {
        console.error(profileError);

        if (
          profileError.message.toLowerCase().includes("duplicate") ||
          profileError.message.toLowerCase().includes("unique")
        ) {
          alert("Username already used. Choose another one.");
          setLoading(false);
          return;
        }
      }
    }

    setLoading(false);

    if (data.session) {
      setLocation("/favorites");
      return;
    }

    alert("Account created. Please log in.");
    setLocation("/login");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <form
        onSubmit={handleSignup}
        className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-xl space-y-4"
      >
        <h1 className="text-3xl font-serif font-bold text-foreground">
          Sign up
        </h1>

        <p className="text-sm text-muted-foreground">
          Create an account to save favorites and plan your trips.
        </p>

        <input
          type="text"
          placeholder="Username"
          className="w-full p-3 rounded-lg bg-muted border border-border outline-none"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        <input
          type="email"
          placeholder="Email"
          className="w-full p-3 rounded-lg bg-muted border border-border outline-none"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
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
          {loading ? "Creating account..." : "Sign up"}
        </button>

        <p className="text-sm text-muted-foreground text-center">
          Already have an account?{" "}
          <Link href="/login" className="text-primary font-semibold">
            Log in
          </Link>
        </p>
      </form>
    </div>
  );
}