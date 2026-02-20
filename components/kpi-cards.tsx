"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Layers, ShoppingCart, DollarSign, Package } from "lucide-react";
import { useCards } from "@/lib/cards-store";

function money(n: number) {
  const num = Number(n) || 0;
  return `£${num.toFixed(2)}`;
}

function Kpi({ title, value, sub, icon: Icon }: any) {
  return (
    <Card className="rounded-2xl">
      <CardContent className="flex items-center justify-between p-6">
        <div>
          <div className="text-xs font-semibold tracking-wide text-slate-500">{title}</div>
          <div className="mt-2 text-3xl font-semibold">{value}</div>
          {sub && <div className="mt-1 text-sm text-slate-500">{sub}</div>}
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
          <Icon className="h-6 w-6 text-slate-700" />
        </div>
      </CardContent>
    </Card>
  );
}

export function KpiCards() {
  const { totals } = useCards();

  return (
    <div className="grid gap-6 md:grid-cols-4">
      <Kpi
        title="TOTAL CARDS"
        value={String(totals.totalCards)}
        sub={`${totals.uniquePlayers} unique`}
        icon={Layers}
      />
      <Kpi title="TOTAL INVESTED" value={money(totals.totalInvested)} icon={ShoppingCart} />
      <Kpi title="COLLECTION VALUE" value={money(totals.collectionValue)} icon={DollarSign} />
      <Kpi
        title="FOR SALE"
        value={String(totals.forSaleCount)}
        sub={`${money(totals.soldValue)} sold`}
        icon={Package}
      />
    </div>
  );
}
