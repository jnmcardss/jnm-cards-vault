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

  paid: number; // cost
  value: number; // current value / estimate
  status: "In Collection" | "For Sale" | "Sold";

  // images
  image_url?: string | null;

  // ✅ new pricing + timestamps (you added these columns in Supabase)
  created_at?: string;
  asking_price?: number | null;
  sold_price?: number | null;
  sold_at?: string | null;
};

type NewCard = Omit<CardRow, "id" | "user_id">;

type Totals = {
  totalCards: number;
  uniquePlayers: number;
  totalInvested: number;
  collectionValue: number;

  forSaleCount: number;
  forSaleAskTotal: number;
  profitPotential: number;

  soldCount: number;
  soldRevenue: number;
  realisedProfit: number;
};

type Ctx = {
  cards: CardRow[];
  addCard: (c: NewCard) => Promise<void>;
  deleteCard: (id: string) => Promise<void>;
  refreshCards: () => Promise<void>;
  totals: Totals;
};

const CardsContext = createContext<Ctx | null>(null);

export function CardsProvider({ children }: { children: React.ReactNode }) {
  const [cards, setCards] = useState<CardRow[]>([]);

  // Track auth + load cards on login
  useEffect(() => {
    let ignore = false;

    async function init() {
      const { data } = await supabase.auth.getSession();
      const uid = data.session?.user.id ?? null;

      if (!uid) {
        if (!ignore) setCards([]);
        return;
      }

      await refreshCards();
    }

    init();

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const uid = session?.user.id ?? null;
      if (!uid) setCards([]);
      else await refreshCards();
    });

    return () => {
      ignore = true;
      sub.subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refreshCards = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setCards([]);
      return;
    }

    // ✅ order by created_at so "Recently added" works properly
    const { data, error } = await supabase
      .from("cards")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("refreshCards error:", error.message);
      return;
    }

    setCards((data ?? []) as CardRow[]);
  };

  const addCard = async (c: NewCard) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

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

      paid: Number(c.paid) || 0,
      value: Number(c.value) || 0,
      status: c.status,

      image_url: c.image_url ?? null,

      // ✅ new fields
      asking_price: c.asking_price ?? null,
      sold_price: c.sold_price ?? null,
      sold_at: c.sold_at ?? null,
      // created_at has a DB default (now()), so we don't need to send it
    };

    const { data, error } = await supabase
      .from("cards")
      .insert(payload as any)
      .select("*")
      .single();

    if (error) {
      console.error("addCard error:", error.message);
      alert(error.message);
      return;
    }

    // Update UI immediately (newest first)
    setCards((prev) => [data as CardRow, ...prev]);
  };

  const deleteCard = async (id: string) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("You must be signed in.");
      return;
    }

    const { error } = await supabase.from("cards").delete().eq("id", id).eq("user_id", user.id);

    if (error) {
      console.error("deleteCard error:", error.message);
      alert(error.message);
      return;
    }

    setCards((prev) => prev.filter((c) => c.id !== id));
  };

  const totals: Totals = useMemo(() => {
    const totalCards = cards.length;

    const uniquePlayers = new Set(
      cards.map((c) => (c.player ?? "").trim().toLowerCase()).filter(Boolean)
    ).size;

    const totalInvested = cards.reduce((s, c) => s + (Number(c.paid) || 0), 0);
    const collectionValue = cards.reduce((s, c) => s + (Number(c.value) || 0), 0);

    // For sale summary
    const forSale = cards.filter((c) => c.status === "For Sale");
    const forSaleCount = forSale.length;
    const forSaleAskTotal = forSale.reduce((s, c) => s + (Number(c.asking_price) || 0), 0);
    const forSaleCostTotal = forSale.reduce((s, c) => s + (Number(c.paid) || 0), 0);
    const profitPotential = forSaleAskTotal - forSaleCostTotal;

    // Sold summary
    const sold = cards.filter((c) => c.status === "Sold");
    const soldCount = sold.length;
    const soldRevenue = sold.reduce((s, c) => s + (Number(c.sold_price) || 0), 0);
    const soldCost = sold.reduce((s, c) => s + (Number(c.paid) || 0), 0);
    const realisedProfit = soldRevenue - soldCost;

    return {
      totalCards,
      uniquePlayers,
      totalInvested,
      collectionValue,
      forSaleCount,
      forSaleAskTotal,
      profitPotential,
      soldCount,
      soldRevenue,
      realisedProfit,
    };
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