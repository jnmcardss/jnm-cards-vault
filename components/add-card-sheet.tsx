"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useCards, type CardRow } from "@/lib/cards-store";
import { supabase } from "@/lib/supabase-browser";
import { uploadCardImage } from "@/lib/uploadCardImage";

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

  // ✅ pricing + status
  const [status, setStatus] = useState<CardRow["status"]>("In Collection");
  const [paid, setPaid] = useState<number>(0);
  const [value, setValue] = useState<number>(0);
  const [askingPrice, setAskingPrice] = useState<number>(0);
  const [soldPrice, setSoldPrice] = useState<number>(0);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);

  function reset() {
    setPlayer("");
    setTeam("");
    setYear(2024);
    setBrand("");
    setSetName("");
    setVariant("");
    setRarity("Common");
    setCondition("Near Mint");

    setStatus("In Collection");
    setPaid(0);
    setValue(0);
    setAskingPrice(0);
    setSoldPrice(0);

    setImageFile(null);
    setImagePreview(null);
  }

  async function save() {
    if (!player.trim()) {
      alert("Player Name is required.");
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

        paid: Number(paid) || 0,
        value: Number(value) || 0,
        status,

        asking_price: status === "For Sale" ? Number(askingPrice) || 0 : null,
        sold_price: status === "Sold" ? Number(soldPrice) || 0 : null,
        sold_at: status === "Sold" ? new Date().toISOString() : null,

        image_url,
      });

      setOpen(false);
      reset();
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
          <SheetHeader className="shrink-0 border-b px-6 py-5">
            <SheetTitle className="text-xl font-semibold">Add Card</SheetTitle>
            <p className="text-sm text-slate-600">
              Enter the details below, then hit <span className="font-medium">Save Card</span>.
            </p>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-6 py-6">
            <div className="space-y-5">
              <div>
                <div className="mb-1 text-sm font-semibold text-slate-800">Player Name *</div>
                <Input
                  className="h-12 text-base"
                  placeholder="e.g. Jude Bellingham"
                  value={player}
                  onChange={(e) => setPlayer(e.target.value)}
                />
              </div>

              <div>
                <div className="mb-1 text-sm font-semibold text-slate-800">Team</div>
                <Input
                  className="h-12 text-base"
                  placeholder="e.g. Real Madrid"
                  value={team}
                  onChange={(e) => setTeam(e.target.value)}
                />
              </div>

              <div>
                <div className="mb-1 text-sm font-semibold text-slate-800">Year</div>
                <Input
                  className="h-12 text-base"
                  type="number"
                  value={String(year)}
                  onChange={(e) => setYear(Number(e.target.value || "0"))}
                />
              </div>

              <div>
                <div className="mb-1 text-sm font-semibold text-slate-800">Brand</div>
                <Input
                  className="h-12 text-base"
                  placeholder="Topps, Panini..."
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                />
              </div>

              <div>
                <div className="mb-1 text-sm font-semibold text-slate-800">Set Name</div>
                <Input
                  className="h-12 text-base"
                  placeholder="Prizm, Select..."
                  value={setName}
                  onChange={(e) => setSetName(e.target.value)}
                />
              </div>

              <div>
                <div className="mb-1 text-sm font-semibold text-slate-800">Variant / Parallel</div>
                <Input
                  className="h-12 text-base"
                  placeholder="Base, Silver Prizm, /25..."
                  value={variant}
                  onChange={(e) => setVariant(e.target.value)}
                />
              </div>

              {/* ✅ NEW: status + money fields */}
              <div>
                <div className="mb-1 text-sm font-semibold text-slate-800">Status</div>
                <select
                  className="h-12 w-full rounded-md border border-slate-200 bg-white px-3 text-base"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as CardRow["status"])}
                >
                  <option value="In Collection">In Collection</option>
                  <option value="For Sale">For Sale</option>
                  <option value="Sold">Sold</option>
                </select>
              </div>

              <div>
                <div className="mb-1 text-sm font-semibold text-slate-800">Paid (£)</div>
                <Input
                  className="h-12 text-base"
                  type="number"
                  inputMode="decimal"
                  placeholder="e.g. 25"
                  value={paid}
                  onChange={(e) => setPaid(Number(e.target.value || "0"))}
                />
              </div>

              <div>
                <div className="mb-1 text-sm font-semibold text-slate-800">Current Value (£)</div>
                <Input
                  className="h-12 text-base"
                  type="number"
                  inputMode="decimal"
                  placeholder="e.g. 40"
                  value={value}
                  onChange={(e) => setValue(Number(e.target.value || "0"))}
                />
              </div>

              {status === "For Sale" && (
                <div>
                  <div className="mb-1 text-sm font-semibold text-slate-800">Asking Price (£)</div>
                  <Input
                    className="h-12 text-base"
                    type="number"
                    inputMode="decimal"
                    placeholder="e.g. 60"
                    value={askingPrice}
                    onChange={(e) => setAskingPrice(Number(e.target.value || "0"))}
                  />
                </div>
              )}

              {status === "Sold" && (
                <div>
                  <div className="mb-1 text-sm font-semibold text-slate-800">Sold Price (£)</div>
                  <Input
                    className="h-12 text-base"
                    type="number"
                    inputMode="decimal"
                    placeholder="e.g. 75"
                    value={soldPrice}
                    onChange={(e) => setSoldPrice(Number(e.target.value || "0"))}
                  />
                </div>
              )}

              <div>
                <div className="mb-1 text-sm font-semibold text-slate-800">Card Image</div>

                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0] ?? null;
                    setImageFile(file);
                    if (file) setImagePreview(URL.createObjectURL(file));
                    else setImagePreview(null);
                  }}
                />

                {imagePreview && (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="mt-3 h-40 w-full rounded border object-contain"
                  />
                )}
              </div>

              <div className="h-2" />
            </div>
          </div>

          <div className="shrink-0 border-t bg-white px-6 py-5">
            <Button
              className="h-12 w-full text-base font-semibold"
              onClick={save}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Card"}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}