"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-browser";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function run() {
      const { data, error } = await supabase.auth.getSession();

      const hasSession = !!data?.session && !error;

      if (!mounted) return;

      setAuthed(hasSession);
      setLoading(false);

      if (!hasSession) {
        router.replace("/login");
      }
    }

    run();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      const hasSession = !!session;
      setAuthed(hasSession);
      setLoading(false);
      if (!hasSession) router.replace("/login");
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [router]);

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-10 text-slate-600">
        Checking login…
      </div>
    );
  }

  if (!authed) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-10 text-slate-600">
        Redirecting to login…
      </div>
    );
  }

  return <>{children}</>;
}