"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { verifyPasswordResetToken, markTokenAsUsed } from "@/lib/tokens";
import bcrypt from "bcryptjs";

export type ResetPasswordState = {
  message: string;
  success?: boolean;
};

const MIN_LOADING_TIME = 2000; // 2 seconds minimum

export async function resetPasswordAction(
  _prev: ResetPasswordState,
  formData: FormData
): Promise<ResetPasswordState> {
  const startTime = Date.now();

  const token = String(formData.get("token") ?? "");
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!token) {
    return { message: "Token tidak valid." };
  }

  if (!password || !confirmPassword) {
    return { message: "Password dan konfirmasi password wajib diisi." };
  }

  if (password !== confirmPassword) {
    return { message: "Password dan konfirmasi password tidak sama." };
  }

  // Validate password strength
  if (password.length < 8) {
    return { message: "Password harus minimal 8 karakter." };
  }

  // Check for password complexity
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  if (!hasUpperCase || !hasLowerCase || !hasNumber) {
    return {
      message:
        "Password harus mengandung huruf besar, huruf kecil, dan angka.",
    };
  }

  // Verify token
  const verification = await verifyPasswordResetToken(token);

  if (!verification.success || !verification.userId || !verification.tokenId) {
    return {
      message: verification.error || "Token tidak valid atau sudah kedaluwarsa.",
    };
  }

  // Hash new password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Update user password
  await prisma.user.update({
    where: { id: verification.userId },
    data: { password: hashedPassword },
  });

  // Mark token as used
  await markTokenAsUsed(verification.tokenId);

  // Ensure minimum loading time
  const elapsed = Date.now() - startTime;
  if (elapsed < MIN_LOADING_TIME) {
    await new Promise((resolve) =>
      setTimeout(resolve, MIN_LOADING_TIME - elapsed)
    );
  }

  // Redirect to signin with success message
  redirect("/signin?reset=success");
}
