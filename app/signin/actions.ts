"use server";

import { randomUUID } from "node:crypto";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { AUTH_COOKIE, getAllowedCredentials } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { isBlocked, recordFailure, recordSuccess, getAttempts } from "@/lib/rateLimiter";

export type SignInState = {
  message: string;
};

const MIN_LOADING_TIME = 3500; // 3,5 detik minimum loading

export async function signInAction(
  _previousState: SignInState,
  formData: FormData
): Promise<SignInState> {
  const startTime = Date.now();
  
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { message: "Email dan password wajib diisi." };
  }

  const key = `signin:${email}`;

  // check rate limit
  const blocked = isBlocked(key);
  if (blocked.blocked) {
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
    
    // Ensure minimum loading time before redirect
    const elapsed = Date.now() - startTime;
    if (elapsed < MIN_LOADING_TIME) {
      await new Promise(resolve => setTimeout(resolve, MIN_LOADING_TIME - elapsed));
    }
    
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

  // User can login if:
  // 1. Email is verified (emailVerified has a value)
  // 2. Email is not verified but allow login to self-serve verification
  // This allows old users to login and self-serve email verification

  // Get user agent for device tracking
  const headersList = await headers();
  const userAgent = headersList.get("user-agent") || "";

  // create session in DB and set cookie
  const token = randomUUID();
  const expires = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7); // 7 days

  await prisma.session.create({
    data: {
      sessionToken: token,
      userId: user.id,
      expires,
      userAgent,
    },
  });

  // Device limiting: keep only 2 active sessions per user
  const activeSessions = await prisma.session.findMany({
    where: {
      userId: user.id,
      expires: { gt: new Date() },
    },
    orderBy: { createdAt: "asc" },
    select: { id: true, createdAt: true },
  });

  // If user has more than 2 active sessions, delete the oldest one
  if (activeSessions.length > 2) {
    const oldestSession = activeSessions[0];
    await prisma.session.delete({
      where: { id: oldestSession.id },
    });
  }

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

  // Ensure minimum loading time before redirect
  const elapsed = Date.now() - startTime;
  if (elapsed < MIN_LOADING_TIME) {
    await new Promise(resolve => setTimeout(resolve, MIN_LOADING_TIME - elapsed));
  }

  redirect("/dashboard");
}

export async function signOutAction() {
  const startTime = Date.now();
  
  const store = await cookies();
  const token = store.get(AUTH_COOKIE)?.value;
  
  if (token) {
    try {
      // Find the user from this session
      const session = await prisma.session.findUnique({
        where: { sessionToken: token },
        select: { userId: true },
      });

      if (session) {
        // Delete ALL sessions for this user (logout everywhere)
        await prisma.session.deleteMany({
          where: { userId: session.userId },
        });
      }
    } catch {
      // ignore
    }
  }
  
  store.delete(AUTH_COOKIE);
  
  // Ensure minimum loading time before redirect
  const elapsed = Date.now() - startTime;
  if (elapsed < MIN_LOADING_TIME) {
    await new Promise(resolve => setTimeout(resolve, MIN_LOADING_TIME - elapsed));
  }
  
  redirect("/signin");
}