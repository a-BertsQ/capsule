"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { emailVerificationTemplate } from "@/lib/emailTemplates";
import { createVerificationToken } from "@/lib/tokens";
import bcrypt from "bcryptjs";

export type SignUpState = { message: string };

const MIN_LOADING_TIME = 3500; // 3,5 detik minimum loading

export async function signUpAction(
  _prev: SignUpState,
  formData: FormData
): Promise<SignUpState> {
  const startTime = Date.now();
  
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const planSlug = String(formData.get("plan") ?? "free").trim();

  if (!email || !password) {
    return { message: "Email dan password wajib diisi." };
  }

  if (!name) {
    return { message: "Nama wajib diisi." };
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { message: "Format email tidak valid." };
  }

  // Validate password strength
  if (password.length < 8) {
    return { message: "Password harus minimal 8 karakter." };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { message: "Email sudah digunakan." };

  // Get plan by slug
  const plan = await prisma.plan.findUnique({ where: { slug: planSlug } });
  if (!plan) {
    return { message: "Paket tidak ditemukan." };
  }

  const hash = await bcrypt.hash(password, 10);
  
  // Create user with unverified email and assigned plan
  const user = await prisma.user.create({
    data: {
      email,
      password: hash,
      name,
      planId: plan.id,
    },
  });

  // Generate verification token
  const token = await createVerificationToken(user.id);

  // Send verification email
  const baseUrl = process.env.BASE_URL || "http://localhost:3000";
  const verificationLink = `${baseUrl}/verify-email?token=${token}`;

  try {
    await sendEmail({
      to: email,
      subject: "Verifikasi Email Anda - Capsule",
      html: emailVerificationTemplate({
        userName: name,
        verificationLink,
      }),
    });
  } catch (error) {
    console.error("Failed to send verification email:", error);
    // Don't fail the signup if email fails, user can request resend
  }

  // Ensure minimum loading time before redirect
  const elapsed = Date.now() - startTime;
  if (elapsed < MIN_LOADING_TIME) {
    await new Promise(resolve => setTimeout(resolve, MIN_LOADING_TIME - elapsed));
  }

  redirect("/verify-email-sent");
}
