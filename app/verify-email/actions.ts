"use server";

import { revalidatePath } from "next/cache";
import { verifyEmailToken } from "@/lib/tokens";
import { getSessionToken } from "@/lib/auth";

export async function verifyEmailTokenAction(token: string) {
  const result = await verifyEmailToken(token);
  
  if (result.success) {
    // Revalidate all paths to refresh session data and avatar
    revalidatePath("/", "layout");
    revalidatePath("/profile");
  }
  
  return result;
}
