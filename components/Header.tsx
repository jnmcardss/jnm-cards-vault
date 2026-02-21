"use client";

import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase-browser";
import { useRouter } from "next/navigation";

export default function Header() {
  const router = useRouter();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <div className="w-full border-b p-4 flex justify-between items-center">
      <h1 className="font-bold text-xl">JNM Cards Vault</h1>

      <Button onClick={handleLogout}>
        Logout
      </Button>
    </div>
  );
}