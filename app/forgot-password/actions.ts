"use server";

import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { passwordResetTemplate } from "@/lib/emailTemplates";
import { createPasswordResetToken } from "@/lib/tokens";
import { isBlocked, recordFailure, recordSuccess } from "@/lib/rateLimiter";

export type ForgotPasswordState = {
  message: string;
  success?: boolean;
};

const MIN_LOADING_TIME = 2000; // 2 seconds minimum loading

export async function forgotPasswordAction(
  _prev: ForgotPasswordState,
  formData: FormData
): Promise<ForgotPasswordState> {
  const startTime = Date.now();

  const email = String(formData.get("email") ?? "").trim().toLowerCase();

  if (!email) {
    return { message: "Email wajib diisi." };
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { message: "Format email tidak valid." };
  }

  const key = `forgot-password:${email}`;

  // Check rate limit - max 3 requests per 15 minutes
  const blocked = isBlocked(key, 3, 15 * 60 * 1000);
  if (blocked.blocked) {
    const mins = Math.ceil(((blocked.until as number) - Date.now()) / 60000);
    return {
      message: `Terlalu banyak permintaan. Coba lagi dalam ${mins} menit.`,
    };
  }

  // Find user
  const user = await prisma.user.findUnique({ where: { email } });

  // For security, always return success message even if user doesn't exist
  // This prevents user enumeration attacks
  if (!user) {
    recordFailure(key);
    
    // Still wait minimum time to prevent timing attacks
    const elapsed = Date.now() - startTime;
    if (elapsed < MIN_LOADING_TIME) {
      await new Promise((resolve) =>
        setTimeout(resolve, MIN_LOADING_TIME - elapsed)
      );
    }

    return {
      message:
        "Jika email terdaftar, kami telah mengirimkan link reset password.",
      success: true,
    };
  }

  // Check if email is verified
  if (!user.emailVerified) {
    return {
      message:
        "Email belum diverifikasi. Silakan verifikasi email terlebih dahulu.",
    };
  }

  // Generate reset token
  const token = await createPasswordResetToken(user.id);

  // Send reset email
  const baseUrl = process.env.BASE_URL || "http://localhost:3000";
  const resetLink = `${baseUrl}/reset-password?token=${token}`;

  try {
    await sendEmail({
      to: email,
      subject: "Reset Password - Capsule",
      html: passwordResetTemplate({
        userName: user.name || "Pengguna",
        resetLink,
      }),
    });

    recordSuccess(key);
  } catch (error) {
    console.error("Failed to send password reset email:", error);
    recordFailure(key);
    return {
      message: "Gagal mengirim email. Silakan coba lagi nanti.",
    };
  }

  // Ensure minimum loading time
  const elapsed = Date.now() - startTime;
  if (elapsed < MIN_LOADING_TIME) {
    await new Promise((resolve) =>
      setTimeout(resolve, MIN_LOADING_TIME - elapsed)
    );
  }

  return {
    message: "Link reset password telah dikirim ke email kamu.",
    success: true,
  };
}
