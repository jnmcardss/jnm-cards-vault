"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useCards, type CardRow } from "@/lib/cards-store";
import { supabase } from "@/lib/supabase-browser";
import { uploadCardImage } from "@/lib/uploadCardImage";

/* ---------------- STATUS SEGMENT ---------------- */

type Status = CardRow["status"];

function StatusSegment({
  value,
  onChange,
}: {
  value: Status;
  onChange: (v: Status) => void;
}) {
  const options: { value: Status; label: string; icon: string }[] = [
    { value: "In Collection", label: "Collection", icon: "📦" },
    { value: "For Sale", label: "For Sale", icon: "💷" },
    { value: "Sold", label: "Sold", icon: "✅" },
  ];

  return (
    <div>
      <div className="mb-2 text-sm font-semibold text-slate-800">Status</div>

      <div className="flex w-full rounded-xl border border-slate-200 bg-slate-50 p-1">
        {options.map((opt) => {
          const active = value === opt.value;

          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={[
                "flex h-12 flex-1 flex-col items-center justify-center gap-0.5 rounded-lg text-xs font-semibold transition",
                active
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-700 hover:bg-white",
              ].join(" ")}
            >
              <span className="text-base">{opt.icon}</span>
              <span>{opt.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------- MAIN SHEET ---------------- */

export function AddCardSheet() {
  const { addCard } = useCards();
  const [open, setOpen] = useState(false);

  const [player, setPlayer] = useState("");
  const [team, setTeam] = useState("");
  const [year, setYear] = useState(2024);
  const [brand, setBrand] = useState("");
  const [setName, setSetName] = useState("");
  const [variant, setVariant] = useState("");
  const [rarity] = useState<CardRow["rarity"]>("Common");
  const [condition] = useState("Near Mint");

  const [status, setStatus] = useState<CardRow["status"]>("In Collection");
  const [paid, setPaid] = useState(0);
  const [value, setValue] = useState(0);
  const [askingPrice, setAskingPrice] = useState(0);
  const [soldPrice, setSoldPrice] = useState(0);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function reset() {
    setPlayer("");
    setTeam("");
    setYear(2024);
    setBrand("");
    setSetName("");
    setVariant("");
    setStatus("In Collection");
    setPaid(0);
    setValue(0);
    setAskingPrice(0);
    setSoldPrice(0);
    setImageFile(null);
    setPreview(null);
  }

  async function save() {
    if (!player.trim()) return alert("Player name required");

    setSaving(true);

    try {
      const { data } = await supabase.auth.getSession();
      const user = data.session?.user;
      if (!user) return alert("Not signed in");

      let image_url: string | null = null;

      if (imageFile) {
        image_url = await uploadCardImage(imageFile, user.id);
      }

      await addCard({
        player,
        team,
        year,
        brand,
        set: setName,
        variant,
        rarity,
        condition,
        paid,
        value,
        status,
        asking_price: status === "For Sale" ? askingPrice : null,
        sold_price: status === "Sold" ? soldPrice : null,
        sold_at: status === "Sold" ? new Date().toISOString() : null,
        image_url,
      });

      reset();
      setOpen(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>Add Card</Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="p-0 sm:max-w-md">

          <SheetHeader className="border-b px-6 py-4">
            <SheetTitle>Add Card</SheetTitle>
          </SheetHeader>

          <div className="space-y-4 overflow-y-auto px-6 py-4">

            <Input placeholder="Player name" value={player} onChange={(e) => setPlayer(e.target.value)} />
            <Input placeholder="Team" value={team} onChange={(e) => setTeam(e.target.value)} />
            <Input type="number" value={year} onChange={(e) => setYear(+e.target.value)} />
            <Input placeholder="Brand" value={brand} onChange={(e) => setBrand(e.target.value)} />
            <Input placeholder="Set" value={setName} onChange={(e) => setSetName(e.target.value)} />
            <Input placeholder="Variant" value={variant} onChange={(e) => setVariant(e.target.value)} />

            <StatusSegment value={status} onChange={setStatus} />

            <Input type="number" placeholder="Paid (£)" value={paid} onChange={(e) => setPaid(+e.target.value)} />
            <Input type="number" placeholder="Current Value (£)" value={value} onChange={(e) => setValue(+e.target.value)} />

            {status === "For Sale" && (
              <Input type="number" placeholder="Asking Price (£)" value={askingPrice} onChange={(e) => setAskingPrice(+e.target.value)} />
            )}

            {status === "Sold" && (
              <Input type="number" placeholder="Sold Price (£)" value={soldPrice} onChange={(e) => setSoldPrice(+e.target.value)} />
            )}

            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const f = e.target.files?.[0] ?? null;
                setImageFile(f);
                if (f) setPreview(URL.createObjectURL(f));
              }}
            />

            {preview && (
              <img src={preview} className="h-40 w-full rounded object-contain" />
            )}
          </div>

          <div className="border-t p-4">
            <Button className="w-full" onClick={save} disabled={saving}>
              {saving ? "Saving…" : "Save Card"}
            </Button>
          </div>

        </SheetContent>
      </Sheet>
    </>
  );
}