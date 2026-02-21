"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-browser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function setNewPassword() {
    setMsg(null);
    setLoading(true);

    try {
      // When the user arrives here from the email link, Supabase sets a recovery session in the browser.
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;

      setMsg("Password updated! Redirecting to login...");
      setTimeout(() => router.push("/login"), 800);
    } catch (e: any) {
      setMsg(e.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-6 py-16">
      <h1 className="text-3xl font-semibold">Set a new password</h1>
      <p className="mt-2 text-slate-600">Choose a strong password for your account.</p>

      <div className="mt-8 space-y-4">
        <Input
          className="h-12"
          placeholder="New password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <Button className="h-12 w-full text-base font-semibold" onClick={setNewPassword} disabled={loading}>
          {loading ? "Working..." : "Update password"}
        </Button>

        {msg && <div className="text-sm text-slate-700">{msg}</div>}
      </div>
    </div>
  );
}