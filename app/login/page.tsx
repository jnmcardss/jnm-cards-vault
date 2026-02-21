"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase-browser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const [mode, setMode] = useState<"signin" | "signup" | "forgot">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit() {
    setMsg(null);
    setLoading(true);

    try {
      if (mode === "forgot") {
        const origin =
          typeof window !== "undefined" ? window.location.origin : "https://www.jnmcardss.com";

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${origin}/reset-password`,
        });
        if (error) throw error;

        setMsg("Password reset email sent. Check your inbox (and junk).");
        return;
      }

      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMsg("Signup OK. Check your email to confirm your account.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        window.location.href = "/dashboard";
      }
    } catch (e: any) {
      setMsg(e.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-6 py-16">
      <h1 className="text-3xl font-semibold">
        {mode === "signin" ? "Sign in" : mode === "signup" ? "Create account" : "Reset password"}
      </h1>
      <p className="mt-2 text-slate-600">
        {mode === "signin"
          ? "Welcome back."
          : mode === "signup"
          ? "Get started with your vault."
          : "We’ll email you a reset link."}
      </p>

      <div className="mt-8 space-y-4">
        <Input
          className="h-12"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {/* Password only needed for sign in / sign up */}
        {mode !== "forgot" && (
          <Input
            className="h-12"
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        )}

        <Button className="h-12 w-full text-base font-semibold" onClick={submit} disabled={loading}>
          {loading
            ? "Working..."
            : mode === "signin"
            ? "Sign in"
            : mode === "signup"
            ? "Sign up"
            : "Send reset link"}
        </Button>

        {msg && <div className="text-sm text-slate-700">{msg}</div>}

        {/* Links under the form */}
        {mode === "signin" && (
          <button
            className="text-sm text-slate-600 hover:underline"
            onClick={() => setMode("forgot")}
            type="button"
          >
            Forgot password?
          </button>
        )}

        <button
          className="text-sm text-slate-600 hover:underline block"
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          type="button"
        >
          {mode === "signin" ? "Need an account? Sign up" : "Already have an account? Sign in"}
        </button>

        {mode === "forgot" && (
          <button
            className="text-sm text-slate-600 hover:underline block"
            onClick={() => setMode("signin")}
            type="button"
          >
            Back to sign in
          </button>
        )}
      </div>
    </div>
  );
}