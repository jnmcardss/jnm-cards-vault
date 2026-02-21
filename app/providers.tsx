"use client";

import React from "react";
import { ThemeProvider } from "@/components/theme-provider";
import { CardsProvider } from "@/lib/cards-store";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <CardsProvider>{children}</CardsProvider>
    </ThemeProvider>
  );
}