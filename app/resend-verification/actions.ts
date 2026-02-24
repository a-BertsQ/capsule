"use server";

import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { emailVerificationTemplate } from "@/lib/emailTemplates";
import { createVerificationToken } from "@/lib/tokens";
import { isBlocked, recordFailure, recordSuccess } from "@/lib/rateLimiter";

export type ResendVerificationState = {
  message: string;
  success?: boolean;
};

const MIN_LOADING_TIME = 2000; // 2 seconds

export async function resendVerificationAction(
  _prev: ResendVerificationState,
  formData: FormData
): Promise<ResendVerificationState> {
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

  const key = `resend-verification:${email}`;

  // Rate limiting - max 3 requests per 15 minutes
  const blocked = isBlocked(key, 3, 15 * 60 * 1000);
  if (blocked.blocked) {
    const mins = Math.ceil(((blocked.until as number) - Date.now()) / 60000);
    return {
      message: `Terlalu banyak permintaan. Coba lagi dalam ${mins} menit.`,
    };
  }

  // Find user
  const user = await prisma.user.findUnique({ where: { email } });

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
        "Jika email terdaftar, kami telah mengirim email verifikasi.",
      success: true,
    };
  }

  // Check if already verified
  if (user.emailVerified) {
    return {
      message: "Email kamu sudah diverifikasi. Silakan login.",
    };
  }

  // Generate new verification token
  const token = await createVerificationToken(user.id);

  // Send verification email
  const baseUrl = process.env.BASE_URL || "http://localhost:3000";
  const verificationLink = `${baseUrl}/verify-email?token=${token}`;

  try {
    await sendEmail({
      to: email,
      subject: "Verifikasi Email Anda - Capsule",
      html: emailVerificationTemplate({
        userName: user.name || "Pengguna",
        verificationLink,
      }),
    });

    recordSuccess(key);
  } catch (error) {
    console.error("Failed to send verification email:", error);
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
    message: "Email verifikasi telah dikirim. Silakan cek inbox kamu.",
    success: true,
  };
}
