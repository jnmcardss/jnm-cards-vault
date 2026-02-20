"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCards, type CardRow } from "@/lib/cards-store";

export function AddCardSheet() {
  const { addCard } = useCards();
  const [open, setOpen] = useState(false);

  const [player, setPlayer] = useState("");
  const [team, setTeam] = useState("");
  const [year, setYear] = useState<number>(2024);
  const [brand, setBrand] = useState("");
  const [setName, setSetName] = useState("");
  const [variant, setVariant] = useState("");
  const [rarity, setRarity] = useState<CardRow["rarity"]>("Common");
  const [condition, setCondition] = useState("Near Mint");
  const [paid, setPaid] = useState<number>(0);
  const [value, setValue] = useState<number>(0);
  const [status, setStatus] = useState<CardRow["status"]>("In Collection");

  function reset() {
    setPlayer("");
    setTeam("");
    setYear(2024);
    setBrand("");
    setSetName("");
    setVariant("");
    setRarity("Common");
    setCondition("Near Mint");
    setPaid(0);
    setValue(0);
    setStatus("In Collection");
  }

  function save() {
    if (!player.trim()) return;

    addCard({
      player: player.trim(),
      team: team.trim() || "—",
      year: Number(year) || 0,
      brand: brand.trim() || "—",
      set: setName.trim() || "—",
      variant: variant.trim() || "—",
      rarity,
      condition,
      paid: Number(paid) || 0,
      value: Number(value) || 0,
      status,
    });

    setOpen(false);
    reset();
  }

  return (
    <>
      <Button className="h-11 rounded-xl" onClick={() => setOpen(true)}>
        Add Card
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="right"
          className="z-50 flex h-full w-full flex-col bg-white p-0 text-slate-900 sm:max-w-md"
        >
          {/* Header (fixed) */}
          <SheetHeader className="shrink-0 border-b px-6 py-5">
            <SheetTitle className="text-xl font-semibold">Add Card</SheetTitle>
            <p className="text-sm text-slate-600">
              Enter the details below, then hit{" "}
              <span className="font-medium">Save Card</span>.
            </p>
          </SheetHeader>

          {/* Scrollable form area */}
          <div className="flex-1 overflow-y-auto px-6 py-6">
            <div className="space-y-5">
              <div>
                <div className="mb-1 text-sm font-semibold text-slate-800">
                  Player Name *
                </div>
                <Input
                  className="h-12 text-base"
                  placeholder="e.g. Jude Bellingham"
                  value={player}
                  onChange={(e) => setPlayer(e.target.value)}
                />
              </div>

              <div>
                <div className="mb-1 text-sm font-semibold text-slate-800">
                  Team
                </div>
                <Input
                  className="h-12 text-base"
                  placeholder="e.g. Real Madrid"
                  value={team}
                  onChange={(e) => setTeam(e.target.value)}
                />
              </div>

              <div>
                <div className="mb-1 text-sm font-semibold text-slate-800">
                  Year
                </div>
                <Input
                  className="h-12 text-base"
                  placeholder="2024"
                  value={String(year)}
                  onChange={(e) => setYear(Number(e.target.value || "0"))}
                />
              </div>

              <div>
                <div className="mb-1 text-sm font-semibold text-slate-800">
                  Brand
                </div>
                <Input
                  className="h-12 text-base"
                  placeholder="Topps, Panini..."
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                />
              </div>

              <div>
                <div className="mb-1 text-sm font-semibold text-slate-800">
                  Set Name
                </div>
                <Input
                  className="h-12 text-base"
                  placeholder="Prizm, Select, Museum Collection..."
                  value={setName}
                  onChange={(e) => setSetName(e.target.value)}
                />
              </div>

              <div>
                <div className="mb-1 text-sm font-semibold text-slate-800">
                  Variant / Parallel
                </div>
                <Input
                  className="h-12 text-base"
                  placeholder="Base, Silver Prizm, /25..."
                  value={variant}
                  onChange={(e) => setVariant(e.target.value)}
                />
              </div>

              <div>
                <div className="mb-1 text-sm font-semibold text-slate-800">
                  Rarity
                </div>
                <Select value={rarity} onValueChange={(v) => setRarity(v as any)}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Rarity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Common">Common</SelectItem>
                    <SelectItem value="Rare">Rare</SelectItem>
                    <SelectItem value="Ultra Rare">Ultra Rare</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <div className="mb-1 text-sm font-semibold text-slate-800">
                  Condition
                </div>
                <Select value={condition} onValueChange={setCondition}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Condition" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mint">Mint</SelectItem>
                    <SelectItem value="Near Mint">Near Mint</SelectItem>
                    <SelectItem value="Excellent">Excellent</SelectItem>
                    <SelectItem value="PSA 10">PSA 10</SelectItem>
                    <SelectItem value="BGS 9.5">BGS 9.5</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="mb-1 text-sm font-semibold text-slate-800">
                    Paid (£)
                  </div>
                  <Input
                    className="h-12 text-base"
                    value={String(paid)}
                    onChange={(e) => setPaid(Number(e.target.value || "0"))}
                  />
                </div>

                <div>
                  <div className="mb-1 text-sm font-semibold text-slate-800">
                    Value (£)
                  </div>
                  <Input
                    className="h-12 text-base"
                    value={String(value)}
                    onChange={(e) => setValue(Number(e.target.value || "0"))}
                  />
                </div>
              </div>

              <div>
                <div className="mb-1 text-sm font-semibold text-slate-800">
                  Status
                </div>
                <Select value={status} onValueChange={(v) => setStatus(v as any)}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="In Collection">In Collection</SelectItem>
                    <SelectItem value="For Sale">For Sale</SelectItem>
                    <SelectItem value="Sold">Sold</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* little spacer so last field isn't tight to the sticky footer */}
              <div className="h-2" />
            </div>
          </div>

          {/* Footer (fixed / sticky) */}
          <div className="shrink-0 border-t bg-white px-6 py-5">
            <Button className="h-12 w-full text-base font-semibold" onClick={save}>
              Save Card
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
