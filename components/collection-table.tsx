"use client";

import { useMemo, useState } from "react";
import { useCards, type CardRow } from "@/lib/cards-store";
import { AddCardSheet } from "@/components/add-card-sheet";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Trash2, ExternalLink } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function money(n: number) {
  const num = Number(n) || 0;
  return `£${num.toFixed(2)}`;
}

function buildCompQuery(c: CardRow) {
  return [c.player, c.brand, c.set, c.variant]
    .map((x) => (x || "").trim())
    .filter(Boolean)
    .join(" ");
}

function ebaySoldUrl(query: string) {
  const q = encodeURIComponent(query);
  return `https://www.ebay.co.uk/sch/i.html?_nkw=${q}&LH_Complete=1&LH_Sold=1`;
}

function point130Url(query: string) {
  const q = encodeURIComponent(query);
  return `https://130point.com/sales?q=${q}`;
}

function openComps(url: string) {
  window.open(url, "_blank", "noopener,noreferrer");
}

export function CollectionTable() {
  const { cards, deleteCard } = useCards();
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const qq = q.toLowerCase().trim();
    if (!qq) return cards;
    return cards.filter((c) =>
      `${c.player} ${c.team} ${c.brand} ${c.set} ${c.variant}`
        .toLowerCase()
        .includes(qq)
    );
  }, [cards, q]);

  return (
    <div className="rounded-2xl border bg-white p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <Input
          className="h-11 md:w-[420px]"
          placeholder="Search player, team, set..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <AddCardSheet />
      </div>

      <div className="mt-6 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[92px]">IMAGE</TableHead>
              <TableHead className="w-[260px]">PLAYER</TableHead>
              <TableHead>SET</TableHead>
              <TableHead className="text-right">PAID</TableHead>
              <TableHead className="text-right">VALUE</TableHead>
              <TableHead>STATUS</TableHead>
              <TableHead className="text-right">ACTIONS</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-slate-500">
                  No cards match your search.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((c) => {
                const query = buildCompQuery(c);

                return (
                  <TableRow key={c.id}>
                    {/* IMAGE */}
                    <TableCell>
                      {c.image_url ? (
                        <img
                          src={c.image_url}
                          alt={c.player || "Card image"}
                          className="h-16 w-16 rounded border object-contain bg-white"
                          loading="lazy"
                        />
                      ) : (
                        <div className="h-16 w-16 rounded border flex items-center justify-center text-[10px] text-slate-400">
                          No image
                        </div>
                      )}
                    </TableCell>

                    <TableCell>
                      <div className="font-semibold">{c.player || "—"}</div>
                      <div className="text-sm text-slate-500">
                        {(c.team || "—")} · {c.year || "—"}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="font-medium">{c.brand || "—"}</div>
                      <div className="text-sm text-slate-500">{c.set || "—"}</div>
                    </TableCell>

                    <TableCell className="text-right">{money(c.paid)}</TableCell>

                    <TableCell className="text-right">
                      <div>{money(c.value)}</div>
                      <div className="text-sm text-slate-500">
                        {c.value - c.paid >= 0
                          ? `+ ${money(c.value - c.paid)}`
                          : `- ${money(Math.abs(c.value - c.paid))}`}
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge variant="outline" className="rounded-full">
                        {c.status}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openComps(ebaySoldUrl(query))}>
                              View eBay Sold
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openComps(point130Url(query))}>
                              View 130Point
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteCard(c.id)}
                          title="Delete card"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}