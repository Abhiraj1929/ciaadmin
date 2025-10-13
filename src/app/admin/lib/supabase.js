import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

export const uploadGameImage = async (file, gameSlug) => {
  try {
    const fileExt = file.name.split(".").pop();
    const fileName = `${gameSlug}-${Date.now()}.${fileExt}`;
    const filePath = `games/${fileName}`;

    const { data, error } = await supabase.storage
      .from("game-images")
      .upload(filePath, file);

    if (error) throw error;

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("game-images").getPublicUrl(filePath);

    return { filePath, publicUrl };
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
};

// Helper function to delete image
export const deleteGameImage = async (imagePath) => {
  try {
    const { error } = await supabase.storage
      .from("game-images")
      .remove([imagePath]);

    if (error) throw error;
  } catch (error) {
    console.error("Error deleting image:", error);
    throw error;
  }
};

// Helper function to get public URL
export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;

  const {
    data: { publicUrl },
  } = supabase.storage.from("game-images").getPublicUrl(imagePath);

  return publicUrl;
};