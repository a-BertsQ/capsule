import { cookies } from "next/headers";

export const AUTH_COOKIE = "capsule_session";

export async function getSessionToken() {
  const store = await cookies();
  return store.get(AUTH_COOKIE)?.value;
}

export async function isAuthenticated() {
  const token = await getSessionToken();
  return Boolean(token);
}

export function getAllowedCredentials() {
  const email = process.env.CAPSULE_ADMIN_EMAIL ?? "student@capsule.id";
  const password = process.env.CAPSULE_ADMIN_PASSWORD ?? "Capsule123!";
  return { email, password };
}