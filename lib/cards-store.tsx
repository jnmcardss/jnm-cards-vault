"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";


export type CardRow = {
  id: string;
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
};

const seed: CardRow[] = [];

 

type Ctx = {
  cards: CardRow[];
  addCard: (c: Omit<CardRow, "id">) => void;
  deleteCard: (id: string) => void;
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
  const STORAGE_KEY = "cardvault.cards";

const [cards, setCards] = useState<CardRow[]>(() => {
  if (typeof window === "undefined") return seed;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CardRow[]) : seed;
  } catch {
    return seed;
  }
});


  const addCard = (c: Omit<CardRow, "id">) => {
    setCards((prev) => [{ ...c, id: crypto.randomUUID() }, ...prev]);
  };

  const deleteCard = (id: string) => {
  setCards((prev) => prev.filter((c) => c.id !== id));
};
useEffect(() => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
  } catch {
    // ignore
  }
}, [cards]);



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
    <CardsContext.Provider value={{ cards, addCard, deleteCard, totals }}>
      {children}
    </CardsContext.Provider>
  );
}

export function useCards() {
  const ctx = useContext(CardsContext);
  if (!ctx) throw new Error("useCards must be used inside <CardsProvider>");
  return ctx;
}
