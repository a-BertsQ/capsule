import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export const AUTH_COOKIE = "capsule_session";

export async function getSessionToken() {
  const store = await cookies();
  return store.get(AUTH_COOKIE)?.value;
}

export async function isAuthenticated() {
  const token = await getSessionToken();
  if (!token) return false;

  const session = await prisma.session.findFirst({
    where: {
      sessionToken: token,
      expires: { gt: new Date() },
    },
  });

  return Boolean(session);
}

export function getAllowedCredentials() {
  const email = process.env.CAPSULE_ADMIN_EMAIL ?? "student@capsule.id";
  const password = process.env.CAPSULE_ADMIN_PASSWORD ?? "Capsule123!";
  return { email, password };
}

export async function getSessionUser() {
  const token = await getSessionToken();
  if (!token) return null;
  const session = await prisma.session.findUnique({
    where: { sessionToken: token },
    include: { user: true },
  });
  return session?.user ?? null;
}