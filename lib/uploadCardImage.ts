import { supabase } from "./supabase/client";

export async function uploadCardImage(file: File, userId: string) {
  if (!file.type.startsWith("image/")) {
    throw new Error("Please upload an image file.");
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
  const filePath = `${userId}/${Date.now()}_${safeName}`;

  const { error: uploadError } = await supabase.storage
    .from("card-images")
    .upload(filePath, file, { upsert: false });

  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from("card-images").getPublicUrl(filePath);

  return data.publicUrl;
}