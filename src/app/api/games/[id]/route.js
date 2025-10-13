import { supabase, uploadGameImage, deleteGameImage } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function PUT(request, { params }) {
  try {
    const formData = await request.formData();

    const slug = formData.get("slug");
    const title = formData.get("title");
    const description = formData.get("description");
    const category = formData.get("category");
    const duration = formData.get("duration");
    const rules = formData.get("rules");
    const requirements = formData.get("requirements");
    const imageFile = formData.get("image");
    const currentImagePath = formData.get("currentImagePath");

    // Get current game data
    const { data: currentGame } = await supabase
      .from("games")
      .select("image_path")
      .eq("id", params.id)
      .single();

    let imagePath = currentGame?.image_path;

    // Handle image upload
    if (imageFile && imageFile.size > 0) {
      // Delete old image if exists
      if (currentGame?.image_path) {
        await deleteGameImage(currentGame.image_path);
      }

      // Upload new image
      const { filePath } = await uploadGameImage(imageFile, slug);
      imagePath = filePath;
    }

    const updateData = {
      slug,
      title,
      description,
      category,
      duration,
      rules,
      requirements: requirements ? JSON.parse(requirements) : {},
    };

    // Only update image_path if we have a new image
    if (imageFile && imageFile.size > 0) {
      updateData.image_path = imagePath;
    }

    const { data, error } = await supabase
      .from("games")
      .update(updateData)
      .eq("id", params.id)
      .select();

    if (error) throw error;

    return NextResponse.json(data[0]);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function DELETE(request, { params }) {
  try {
    // Get game data to delete associated image
    const { data: game } = await supabase
      .from("games")
      .select("image_path")
      .eq("id", params.id)
      .single();

    // Delete image if exists
    if (game?.image_path) {
      await deleteGameImage(game.image_path);
    }

    // Delete game record
    const { error } = await supabase.from("games").delete().eq("id", params.id);

    if (error) throw error;

    return NextResponse.json({ message: "Game deleted successfully" });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
