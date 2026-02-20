import { supabase } from "./supabaseClient";

export async function uploadCardImage(file: File, userId: string) {
  if (!file.type.startsWith("image/")) {
    throw new Error("Please upload an image file.");
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
  const filePath = `${userId}/${Date.now()}_${safeName}`;

  const { error } = await supabase.storage
    .from("card-images")
    .upload(filePath, file);

  if (error) throw error;

  const { data } = supabase.storage
    .from("card-images")
    .getPublicUrl(filePath);

  return data.publicUrl;
}