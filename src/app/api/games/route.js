import { supabase, uploadGameImage } from "../../admin/lib/supabase";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("games")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Return empty array if no data
    return NextResponse.json(data || []);
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
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

    let imagePath = null;

    // Upload image if provided
    if (imageFile && imageFile.size > 0) {
      const { filePath } = await uploadGameImage(imageFile, slug);
      imagePath = filePath;
    }

    const { data, error } = await supabase
      .from("games")
      .insert([
        {
          slug,
          title,
          description,
          category,
          duration,
          image_path: imagePath,
          rules,
          requirements: requirements ? JSON.parse(requirements) : {},
        },
      ])
      .select();

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data[0], { status: 201 });
  } catch (error) {
    console.error("POST error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}