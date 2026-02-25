import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { AUTH_COOKIE } from "@/lib/auth";

async function exchangeCodeForToken(code: string, redirectUri: string) {
  const params = new URLSearchParams();
  params.set("code", code);
  params.set("client_id", process.env.GOOGLE_CLIENT_ID || "");
  params.set("client_secret", process.env.GOOGLE_CLIENT_SECRET || "");
  params.set("redirect_uri", redirectUri);
  params.set("grant_type", "authorization_code");

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });
  return res.json();
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const baseUrl = process.env.BASE_URL || "http://localhost:3000";
  const redirectUri = `${baseUrl}/api/auth/google/callback`;

  if (!code) return NextResponse.redirect(new URL("/signin", baseUrl));

  const tokenResp = await exchangeCodeForToken(code, redirectUri);
  const accessToken = tokenResp.access_token;
  if (!accessToken) return NextResponse.redirect(new URL("/signin", baseUrl));

  // fetch userinfo
  const profileRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const profile = await profileRes.json();

  const googleId = profile.sub as string | undefined;
  const email = (profile.email || "") as string;
  const name = (profile.name || "") as string;

  if (!email) {
    return NextResponse.redirect(new URL("/signin?error=google_no_email", baseUrl));
  }

  // find user by googleId first
  let user = googleId ? await prisma.user.findUnique({ where: { googleId } }) : null;

  if (!user) {
    // find by email
    user = await prisma.user.findUnique({ where: { email } });
  }

  if (user) {
    // if user exists but doesn't have googleId, link it
    if (googleId && !user.googleId) {
      await prisma.user.update({ where: { id: user.id }, data: { googleId, isEmailVerified: true, emailVerified: new Date() } });
    }
  } else {
    // create a new user linked to Google
    user = await prisma.user.create({
      data: {
        email,
        name,
        googleId,
        isEmailVerified: true,
        emailVerified: new Date(),
      },
    });
  }

  // create session
  const token = randomUUID();
  const expires = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7);
  const headers = req.headers;
  const userAgent = headers.get("user-agent") || "";

  await prisma.session.create({
    data: {
      sessionToken: token,
      userId: user.id,
      expires,
      userAgent,
    },
  });

  const store = cookies();
  (await store).set(AUTH_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
    path: "/",
    expires,
  });

  return NextResponse.redirect(new URL("/dashboard", baseUrl));
}
