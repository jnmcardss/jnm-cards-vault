"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutGrid, List } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase-browser";

const items = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutGrid },
  { href: "/collection", label: "Collection", icon: List },
];

function initialsFromEmail(email: string) {
  const name = email.split("@")[0] || "";
  const parts = name.split(/[.\-_]+/).filter(Boolean);
  const first = (parts[0]?.[0] || name[0] || "?").toUpperCase();
  const second = (parts[1]?.[0] || name[1] || "").toUpperCase();
  return (first + second).slice(0, 2);
}

export function TopNav() {
  const pathname = usePathname();
  const router = useRouter();

  const [email, setEmail] = useState<string | null>(null);
  const isAuthed = !!email;

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setEmail(data.session?.user?.email ?? null);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user?.email ?? null);
    });

    return () => {
      sub.subscription.unsubscribe();
    };
  }, []);

  const avatarText = useMemo(() => {
    if (!email) return "?";
    return initialsFromEmail(email);
  }, [email]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-50 border-b bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-4 sm:px-6 py-3 sm:py-4">
        {/* Logo + Brand */}
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/jnm-logo.png"
            alt="JNM Cardss Logo"
            width={40}
            height={40}
            className="rounded-lg"
          />
          <div>
            <div className="text-lg font-bold tracking-tight">JNM Cardss Vault</div>
            <div className="text-xs text-slate-500">Trading Card Collection Manager</div>
          </div>
        </Link>

        {/* Right side */}
        <div className="flex w-full sm:w-auto items-center justify-between sm:justify-end gap-3">
          {/* Nav (only when logged in) */}
          {isAuthed && (
            <nav className="flex flex-wrap gap-2">
              {items.map(({ href, label, icon: Icon }) => {
                const active = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`px-3 sm:px-4 py-2 rounded-full flex items-center gap-2 text-sm font-medium transition ${
                      active
                        ? "bg-slate-900 text-white"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </Link>
                );
              })}
            </nav>
          )}

          {/* Account area */}
          {isAuthed ? (
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Email (hide on small screens) */}
              <span className="hidden md:block text-sm text-slate-600">{email}</span>

              {/* Avatar */}
              <div
                className="h-9 w-9 rounded-full bg-slate-900 text-white flex items-center justify-center text-sm font-semibold"
                title={email ?? ""}
              >
                {avatarText}
              </div>

              <Button variant="outline" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          ) : (
            <Button asChild>
              <Link href="/login">Login</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}