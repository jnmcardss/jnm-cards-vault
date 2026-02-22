"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useCards, type CardRow } from "@/lib/cards-store";
import { supabase } from "@/lib/supabase-browser";
import { uploadCardImage } from "@/lib/uploadCardImage";

type Status = CardRow["status"];

function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="space-y-1.5">
      <div className="text-sm font-semibold text-slate-800">{label}</div>
      {children}
      {hint ? <div className="text-xs text-slate-500">{hint}</div> : null}
    </div>
  );
}

function moneyNum(v: string) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

/** Slim, mobile-friendly segmented control with 📦 / 💷 / ✅ */
function StatusSegment({
  value,
  onChange,
}: {
  value: Status;
  onChange: (v: Status) => void;
}) {
  const opts: { value: Status; label: string; icon: string }[] = [
    { value: "In Collection", label: "Collection", icon: "📦" },
    { value: "For Sale", label: "For Sale", icon: "💷" },
    { value: "Sold", label: "Sold", icon: "✅" },
  ];

  return (
    <div className="space-y-1.5">
      <div className="text-sm font-semibold text-slate-800">Status</div>

      <div className="grid grid-cols-3 rounded-xl border border-slate-200 bg-slate-50 p-1">
        {opts.map((o) => {
          const active = value === o.value;

          return (
            <button
              key={o.value}
              type="button"
              onClick={() => onChange(o.value)}
              className={[
                "flex items-center justify-center gap-2 rounded-lg px-2 py-2 text-sm font-semibold transition",
                "focus:outline-none focus:ring-2 focus:ring-slate-300",
                active
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-700 hover:bg-white",
              ].join(" ")}
              aria-pressed={active}
            >
              <span className="text-base leading-none">{o.icon}</span>
              <span className="leading-none">{o.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function AddCardSheet() {
  const { addCard } = useCards();
  const [open, setOpen] = useState(false);

  const [player, setPlayer] = useState("");
  const [team, setTeam] = useState("");
  const [year, setYear] = useState<number>(2024);
  const [brand, setBrand] = useState("");
  const [setName, setSetName] = useState("");
  const [variant, setVariant] = useState("");

  const [rarity] = useState<CardRow["rarity"]>("Common");
  const [condition] = useState("Near Mint");

  const [status, setStatus] = useState<Status>("In Collection");

  // store inputs as strings for nicer typing (e.g. blank)
  const [paid, setPaid] = useState<string>("0");
  const [value, setValue] = useState<string>("0");
  const [askingPrice, setAskingPrice] = useState<string>("0");
  const [soldPrice, setSoldPrice] = useState<string>("0");

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);

  const showAsking = status === "For Sale";
  const showSold = status === "Sold";

  const canSave = useMemo(() => player.trim().length > 0 && !saving, [player, saving]);

  function reset() {
    setPlayer("");
    setTeam("");
    setYear(2024);
    setBrand("");
    setSetName("");
    setVariant("");
    setStatus("In Collection");
    setPaid("0");
    setValue("0");
    setAskingPrice("0");
    setSoldPrice("0");
    setImageFile(null);
    setPreview(null);
  }

  async function save() {
    if (!player.trim()) {
      alert("Player name is required.");
      return;
    }

    setSaving(true);

    try {
      const { data } = await supabase.auth.getSession();
      const user = data.session?.user;

      if (!user) {
        alert("You must be signed in.");
        return;
      }

      let image_url: string | null = null;
      if (imageFile) {
        image_url = await uploadCardImage(imageFile, user.id);
      }

      await addCard({
        player: player.trim(),
        team: team.trim() || "—",
        year: Number(year) || 0,
        brand: brand.trim() || "—",
        set: setName.trim() || "—",
        variant: variant.trim() || "—",
        rarity,
        condition,
        paid: moneyNum(paid),
        value: moneyNum(value),
        status,
        asking_price: showAsking ? moneyNum(askingPrice) : null,
        sold_price: showSold ? moneyNum(soldPrice) : null,
        sold_at: showSold ? new Date().toISOString() : null,
        image_url,
      });

      reset();
      setOpen(false);
    } catch (err: any) {
      console.error("[SAVE] failed:", err);
      alert(err?.message ?? "Save failed");
    } finally {
      setSaving(false);
    }
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
          {/* Header */}
          <SheetHeader className="shrink-0 border-b px-6 py-5">
            <SheetTitle className="text-xl font-semibold">Add Card</SheetTitle>
            <p className="text-sm text-slate-600">Fill in details, then tap Save Card.</p>
          </SheetHeader>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-6 py-6">
            <div className="space-y-6">
              {/* Core details */}
              <div className="space-y-5">
                <Field label="Player Name *">
                  <Input
                    className="h-11"
                    placeholder="e.g. Jude Bellingham"
                    value={player}
                    onChange={(e) => setPlayer(e.target.value)}
                  />
                </Field>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Team">
                    <Input
                      className="h-11"
                      placeholder="e.g. Real Madrid"
                      value={team}
                      onChange={(e) => setTeam(e.target.value)}
                    />
                  </Field>

                  <Field label="Year">
                    <Input
                      className="h-11"
                      type="number"
                      inputMode="numeric"
                      value={String(year)}
                      onChange={(e) => setYear(Number(e.target.value || "0"))}
                    />
                  </Field>
                </div>

                <Field label="Brand">
                  <Input
                    className="h-11"
                    placeholder="Topps, Panini…"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                  />
                </Field>

                <Field label="Set Name">
                  <Input
                    className="h-11"
                    placeholder="Prizm, Select…"
                    value={setName}
                    onChange={(e) => setSetName(e.target.value)}
                  />
                </Field>

                <Field label="Variant / Parallel">
                  <Input
                    className="h-11"
                    placeholder="Base, /25, Auto…"
                    value={variant}
                    onChange={(e) => setVariant(e.target.value)}
                  />
                </Field>
              </div>

              {/* Status + pricing */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
                <div className="space-y-4">
                  <StatusSegment value={status} onChange={setStatus} />

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label="Paid (£)" hint="What you paid for the card">
                      <Input
                        className="h-11"
                        type="number"
                        inputMode="decimal"
                        value={paid}
                        onChange={(e) => setPaid(e.target.value)}
                      />
                    </Field>

                    <Field label="Current Value (£)" hint="What it’s worth now">
                      <Input
                        className="h-11"
                        type="number"
                        inputMode="decimal"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                      />
                    </Field>

                    {showAsking && (
                      <Field label="Asking Price (£)" hint="Your listing price">
                        <Input
                          className="h-11"
                          type="number"
                          inputMode="decimal"
                          value={askingPrice}
                          onChange={(e) => setAskingPrice(e.target.value)}
                        />
                      </Field>
                    )}

                    {showSold && (
                      <Field label="Sold Price (£)" hint="Your final sale price">
                        <Input
                          className="h-11"
                          type="number"
                          inputMode="decimal"
                          value={soldPrice}
                          onChange={(e) => setSoldPrice(e.target.value)}
                        />
                      </Field>
                    )}
                  </div>
                </div>
              </div>

              {/* Image */}
              <div className="space-y-2">
                <div className="text-sm font-semibold text-slate-800">Card Image</div>

                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const f = e.target.files?.[0] ?? null;
                      setImageFile(f);
                      if (f) setPreview(URL.createObjectURL(f));
                      else setPreview(null);
                    }}
                  />
                  <div className="mt-2 text-xs text-slate-500">
                    Tip: a clear, centered shot works best.
                  </div>

                  {preview && (
                    <img
                      src={preview}
                      alt="Preview"
                      className="mt-3 h-44 w-full rounded-lg border bg-white object-contain"
                    />
                  )}
                </div>
              </div>

              <div className="h-2" />
            </div>
          </div>

          {/* Sticky footer */}
          <div className="shrink-0 border-t bg-white px-6 py-5">
            <Button
              className="h-12 w-full text-base font-semibold"
              onClick={save}
              disabled={!canSave}
            >
              {saving ? "Saving..." : "Save Card"}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}