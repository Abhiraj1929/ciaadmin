import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../lib/supabaseAdmin";

export async function requireAccess(req, requiredScopes = []) {
  // Try Bearer header
  const auth = req.headers.get("authorization") || "";
  const bearer = auth.toLowerCase().startsWith("bearer ")
    ? auth.slice(7).trim()
    : null;

  // Try query string
  const url = new URL(req.url);
  const qsToken = url.searchParams.get("token");

  const token = bearer || qsToken;
  if (!token) {
    return {
      error: NextResponse.json(
        { error: "Missing access token" },
        { status: 401 }
      ),
    };
  }

  const { data, error } = await supabaseAdmin
    .from("access_passes")
    .select("token, scopes, expires_at, is_active")
    .eq("token", token)
    .maybeSingle();

  if (error || !data)
    return {
      error: NextResponse.json(
        { error: "Invalid access token" },
        { status: 401 }
      ),
    };
  if (!data.is_active)
    return {
      error: NextResponse.json({ error: "Access disabled" }, { status: 403 }),
    };
  if (data.expires_at && new Date(data.expires_at) < new Date()) {
    return {
      error: NextResponse.json({ error: "Access expired" }, { status: 403 }),
    };
  }

  const have = new Set((data.scopes || []).map((s) => s.toLowerCase()));
  const ok = requiredScopes.every((s) => have.has(s.toLowerCase()));
  if (!ok)
    return {
      error: NextResponse.json(
        { error: "Insufficient scope" },
        { status: 403 }
      ),
    };

  return { tokenData: data };
}
