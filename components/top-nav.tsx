"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, List } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutGrid },
  { href: "/collection", label: "Collection", icon: List },
];

export function TopNav() {
  const pathname = usePathname();

  return (
  <div className="border-b bg-white">
    <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

      {/* Logo + Brand */}
      <div className="flex items-center gap-3">
        <Image
          src="/jnm-logo.png"
          alt="JNM Cardss Logo"
          width={40}
          height={40}
          className="rounded-lg"
        />

        <div>
          <div className="text-lg font-bold tracking-tight">
            JNM Cardss Vault
          </div>
          <div className="text-xs text-slate-500">
            Trading Card Collection Manager
          </div>
        </div>
      </div>


        <nav className="flex gap-2">
          {items.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`px-4 py-2 rounded-full flex items-center gap-2 text-sm font-medium transition ${
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
      </div>
    </div>
  );
}
