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
import { supabase } from "@/lib/supabaseClient";
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
  const [paid, setPaid] = useState<number>(0);
  const [value, setValue] = useState<number>(0);
  const [status, setStatus] = useState<CardRow["status"]>("In Collection");

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

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
    setImageFile(null);
    setImagePreview(null);
  }

  async function save() {
    if (!player.trim()) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert("You must be signed in.");
      return;
    }

    let image_url: string | null = null;

    if (imageFile) {
      try {
        image_url = await uploadCardImage(imageFile, user.id);
      } catch (err: any) {
        alert(err?.message ?? "Image upload failed");
        return;
      }
    }

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
      image_url,
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
          <SheetHeader className="shrink-0 border-b px-6 py-5">
            <SheetTitle className="text-xl font-semibold">Add Card</SheetTitle>
            <p className="text-sm text-slate-600">
              Enter the details below, then hit{" "}
              <span className="font-medium">Save Card</span>.
            </p>
          </SheetHeader>

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
                  placeholder="Prizm, Select..."
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

              {/* IMAGE UPLOAD */}
              <div>
                <div className="mb-1 text-sm font-semibold text-slate-800">
                  Card Image
                </div>

                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0] ?? null;
                    setImageFile(file);

                    if (file) {
                      setImagePreview(URL.createObjectURL(file));
                    } else {
                      setImagePreview(null);
                    }
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
            >
              Save Card
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}