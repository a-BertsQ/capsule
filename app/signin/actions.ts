"use server";

import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AUTH_COOKIE, getAllowedCredentials } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { isBlocked, recordFailure, recordSuccess, getAttempts } from "@/lib/rateLimiter";

export type SignInState = {
  message: string;
};

export async function signInAction(
  _previousState: SignInState,
  formData: FormData
): Promise<SignInState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { message: "Email dan password wajib diisi." };
  }

  const key = `signin:${email}`;

  // check rate limit
  const blocked = isBlocked(key);
  if (blocked.blocked) {
    const until = new Date(blocked.until as number);
    const mins = Math.ceil(((blocked.until as number) - Date.now()) / 60000);
    return { message: `Terlalu banyak percobaan. Coba lagi dalam ${mins} menit.` };
  }

  // Try to find the user in the database
  const user = await prisma.user.findUnique({ where: { email } });

  // Fallback to allowed credentials (admin) if no DB user
  if (!user) {
    const allowed = getAllowedCredentials();
    if (email !== allowed.email.toLowerCase() || password !== allowed.password) {
      recordFailure(key);
      return { message: "Kredensial tidak valid." };
    }

    // create a short-lived cookie for the admin fallback
    const store = await cookies();
    store.set(AUTH_COOKIE, randomUUID(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    recordSuccess(key);
    redirect("/dashboard");
  }

  // Validate password against the stored hash
  if (!user.password) {
    recordFailure(key);
    return { message: "Kredensial tidak valid." };
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    recordFailure(key);
    const attempts = getAttempts(key);
    const remaining = Math.max(0, (Number(process.env.SIGNIN_MAX_ATTEMPTS ?? 5) - attempts));
    return { message: `Kredensial tidak valid. Sisa percobaan: ${remaining}` };
  }

  // create session in DB and set cookie
  const token = randomUUID();
  const expires = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7); // 7 days

  await prisma.session.create({
    data: {
      sessionToken: token,
      userId: user.id,
      expires,
    },
  });

  const store = await cookies();
  // On success, clear rate limit counter for this key
  recordSuccess(key);

  store.set(AUTH_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
    path: "/",
    expires,
  });

  redirect("/dashboard");
}

export async function signOutAction() {
  const store = await cookies();
  const token = store.get(AUTH_COOKIE)?.value;
  if (token) {
    try {
      await prisma.session.deleteMany({ where: { sessionToken: token } });
    } catch (e) {
      // ignore
    }
  }
  store.delete(AUTH_COOKIE);
  redirect("/signin");
}