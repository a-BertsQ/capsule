import { NextResponse } from "next/server";

export async function GET() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const baseUrl = process.env.BASE_URL || "http://localhost:3000";
  if (!clientId) return NextResponse.json({ error: "Google client id not configured" }, { status: 500 });

  const redirectUri = `${baseUrl}/api/auth/google/callback`;
  const scope = encodeURIComponent("openid email profile");
  const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&response_type=code&scope=${scope}&prompt=select_account&access_type=offline`;

  return NextResponse.redirect(url);
}
