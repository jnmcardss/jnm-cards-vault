"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase-browser";

export type CardRow = {
  id: string;
  user_id: string;
  player: string;
  team: string;
  year: number;
  brand: string;
  set: string;
  variant: string;
  rarity: "Common" | "Rare" | "Ultra Rare";
  condition: string;
  paid: number;
  value: number;
  status: "In Collection" | "For Sale" | "Sold";
  image_url?: string | null;
};

type NewCard = Omit<CardRow, "id" | "user_id">;

type Ctx = {
  cards: CardRow[];
  addCard: (c: NewCard) => Promise<void>;
  deleteCard: (id: string) => Promise<void>;
  refreshCards: () => Promise<void>;
  totals: {
    totalCards: number;
    uniquePlayers: number;
    totalInvested: number;
    collectionValue: number;
    forSaleCount: number;
    soldValue: number;
  };
};

const CardsContext = createContext<Ctx | null>(null);

export function CardsProvider({ children }: { children: React.ReactNode }) {
  const [cards, setCards] = useState<CardRow[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  // Track auth + load cards on login
  useEffect(() => {
    let ignore = false;

    async function init() {
      const { data } = await supabase.auth.getSession();
      const uid = data.session?.user.id ?? null;
      if (!ignore) setUserId(uid);
      if (uid) await refreshCards();
      else setCards([]);
    }

    init();

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const uid = session?.user.id ?? null;
      setUserId(uid);
      if (uid) await refreshCards();
      else setCards([]);
    });

    return () => {
      ignore = true;
      sub.subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refreshCards = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setCards([]);
      return;
    }

    const { data, error } = await supabase
      .from("cards")
      .select("*")
      .eq("user_id", user.id)
      .order("id", { ascending: false });

    if (error) {
      console.error("refreshCards error:", error.message);
      return;
    }

    setCards((data ?? []) as CardRow[]);
  };

  const addCard = async (c: NewCard) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert("You must be signed in.");
      return;
    }

    const payload = {
      user_id: user.id,
      player: c.player,
      team: c.team,
      year: c.year,
      brand: c.brand,
      set: c.set,
      variant: c.variant,
      rarity: c.rarity,
      condition: c.condition,
      paid: c.paid,
      value: c.value,
      status: c.status,
      image_url: c.image_url ?? null,
    };

    const { data, error } = await supabase
      .from("cards")
      .insert([payload])
      .select("*")
      .single();

    if (error) {
      console.error("addCard error:", error.message);
      alert(error.message);
      return;
    }

    // Update UI immediately
    setCards((prev) => [data as CardRow, ...prev]);
  };

  const deleteCard = async (id: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert("You must be signed in.");
      return;
    }

    const { error } = await supabase
      .from("cards")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error("deleteCard error:", error.message);
      alert(error.message);
      return;
    }

    setCards((prev) => prev.filter((c) => c.id !== id));
  };

  const totals = useMemo(() => {
    const totalCards = cards.length;
    const uniquePlayers = new Set(cards.map((c) => c.player.trim().toLowerCase())).size;
    const totalInvested = cards.reduce((s, c) => s + (Number(c.paid) || 0), 0);
    const collectionValue = cards.reduce((s, c) => s + (Number(c.value) || 0), 0);
    const forSaleCount = cards.filter((c) => c.status === "For Sale").length;
    const soldValue = cards
      .filter((c) => c.status === "Sold")
      .reduce((s, c) => s + (Number(c.value) || 0), 0);

    return { totalCards, uniquePlayers, totalInvested, collectionValue, forSaleCount, soldValue };
  }, [cards]);

  return (
    <CardsContext.Provider value={{ cards, addCard, deleteCard, refreshCards, totals }}>
      {children}
    </CardsContext.Provider>
  );
}

export function useCards() {
  const ctx = useContext(CardsContext);
  if (!ctx) throw new Error("useCards must be used inside <CardsProvider>");
  return ctx;
}