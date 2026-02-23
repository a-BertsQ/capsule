"use server";

import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AUTH_COOKIE, getAllowedCredentials } from "@/lib/auth";

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

  const allowed = getAllowedCredentials();
  if (email !== allowed.email.toLowerCase() || password !== allowed.password) {
    return { message: "Kredensial tidak valid." };
  }

  const store = await cookies();
  store.set(AUTH_COOKIE, randomUUID(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  redirect("/dashboard");
}

export async function signOutAction() {
  const store = await cookies();
  store.delete(AUTH_COOKIE);
  redirect("/signin");
}