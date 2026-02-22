"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { supabase } from "@/lib/supabase-browser";

export type CardStatus = "In Collection" | "For Sale" | "Sold";
export type CardRarity = "Common" | "Rare" | "Ultra Rare";

export type CardRow = {
  id: string;
  user_id: string;

  player: string;
  team: string;
  year: number;
  brand: string;
  set: string;
  variant: string;

  rarity: CardRarity;
  condition: string;

  paid: number;
  value: number;

  status: CardStatus;

  image_url?: string | null;

  // Optional DB columns if you added them later:
  created_at?: string | null;
  asking_price?: number | null;
  sold_price?: number | null;
  sold_at?: string | null;
};

export type NewCard = Omit<CardRow, "id" | "user_id">;

export type Totals = {
  totalCards: number;
  uniquePlayers: number;
  totalInvested: number;
  collectionValue: number;
  forSaleCount: number;
  soldValue: number; // ✅ this is what your KPI uses
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

  // Load on startup + react to auth changes
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      const { data } = await supabase.auth.getSession();
      const uid = data.session?.user?.id ?? null;

      if (!mounted) return;

      if (uid) {
        await refreshCards();
      } else {
        setCards([]);
      }
    };

    init();

    const { data } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return;

      const uid = session?.user?.id ?? null;
      if (uid) await refreshCards();
      else setCards([]);
    });

    return () => {
      mounted = false;
      data?.subscription?.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refreshCards = async () => {
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;

    if (!user) {
      setCards([]);
      return;
    }

    // Prefer created_at if you have it, fallback to id
    const query = supabase
      .from("cards")
      .select("*")
      .eq("user_id", user.id);

    // Try created_at ordering first (won't break if column exists)
    const { data, error } = await query.order("created_at", { ascending: false });

    if (error) {
      // Fallback if created_at doesn't exist in DB yet
      const fallback = await supabase
        .from("cards")
        .select("*")
        .eq("user_id", user.id)
        .order("id", { ascending: false });

      if (fallback.error) {
        console.error("refreshCards error:", fallback.error.message);
        return;
      }

      setCards((fallback.data ?? []) as CardRow[]);
      return;
    }

    setCards((data ?? []) as CardRow[]);
  };

  const addCard = async (c: NewCard) => {
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;

    if (!user) {
      alert("You must be signed in.");
      return;
    }

    const payload = {
      user_id: user.id,

      player: c.player,
      team: c.team,
      year: Number(c.year) || 0,
      brand: c.brand,
      set: c.set,
      variant: c.variant,

      rarity: c.rarity,
      condition: c.condition,

      paid: Number(c.paid) || 0,
      value: Number(c.value) || 0,

      status: c.status,

      image_url: c.image_url ?? null,

      // optional fields if present
      asking_price: c.asking_price ?? null,
      sold_price: c.sold_price ?? null,
      sold_at: c.sold_at ?? null,
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

    setCards((prev) => [data as CardRow, ...prev]);
  };

  const deleteCard = async (id: string) => {
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;

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

  const totals: Totals = useMemo(() => {
    const totalCards = cards.length;

    const uniquePlayers = new Set(
      cards
        .map((c) => (c.player || "").trim().toLowerCase())
        .filter(Boolean)
    ).size;

    const totalInvested = cards.reduce(
      (sum, c) => sum + (Number(c.paid) || 0),
      0
    );

    const collectionValue = cards.reduce(
      (sum, c) => sum + (Number(c.value) || 0),
      0
    );

    const forSaleCount = cards.filter((c) => c.status === "For Sale").length;

    const soldValue = cards
      .filter((c) => c.status === "Sold")
      .reduce((sum, c) => sum + (Number(c.value) || 0), 0);

    return {
      totalCards,
      uniquePlayers,
      totalInvested,
      collectionValue,
      forSaleCount,
      soldValue,
    };
  }, [cards]);

  return (
    <CardsContext.Provider
      value={{ cards, addCard, deleteCard, refreshCards, totals }}
    >
      {children}
    </CardsContext.Provider>
  );
}

export function useCards() {
  const ctx = useContext(CardsContext);
  if (!ctx) throw new Error("useCards must be used inside <CardsProvider>");
  return ctx;
}