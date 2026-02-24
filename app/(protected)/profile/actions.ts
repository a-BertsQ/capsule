"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { AUTH_COOKIE } from "@/lib/auth";
import { sendEmail } from "@/lib/email";
import { emailVerificationTemplate } from "@/lib/emailTemplates";
import { createVerificationToken } from "@/lib/tokens";
import bcrypt from "bcryptjs";

export type UpdateProfileState = {
  message: string;
  success?: boolean;
  fieldError?: string;
};

// Get current user
export async function getCurrentUser() {
  const store = await cookies();
  const token = store.get(AUTH_COOKIE)?.value;

  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { sessionToken: token },
    include: { user: true },
  });

  return session?.user || null;
}

// Update user profile (name only, email requires verification)
export async function updateProfileAction(
  prev: UpdateProfileState,
  formData: FormData
): Promise<UpdateProfileState> {
  const user = await getCurrentUser();
  if (!user) {
    return { message: "Silakan login terlebih dahulu." };
  }

  const name = String(formData.get("name") ?? "").trim();

  if (!name) {
    return { message: "Nama wajib diisi.", fieldError: "name" };
  }

  if (name.length < 2) {
    return { message: "Nama harus minimal 2 karakter.", fieldError: "name" };
  }

  try {
    await prisma.user.update({
      where: { id: user.id },
      data: { name },
    });

    return {
      message: "Nama berhasil diperbarui.",
      success: true,
    };
  } catch (error) {
    console.error("Failed to update profile:", error);
    return { message: "Gagal memperbarui profil. Silakan coba lagi." };
  }
}

// Request to change email (sends verification email to new email)
export async function changeEmailAction(
  prev: UpdateProfileState,
  formData: FormData
): Promise<UpdateProfileState> {
  const user = await getCurrentUser();
  if (!user) {
    return { message: "Silakan login terlebih dahulu." };
  }

  const newEmail = String(formData.get("email") ?? "").trim().toLowerCase();

  if (!newEmail) {
    return { message: "Email baru wajib diisi.", fieldError: "email" };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(newEmail)) {
    return { message: "Format email tidak valid.", fieldError: "email" };
  }

  if (newEmail === user.email) {
    return {
      message: "Email baru harus berbeda dari email saat ini.",
      fieldError: "email",
    };
  }

  // Check if email already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: newEmail },
  });

  if (existingUser) {
    return {
      message: "Email sudah digunakan oleh akun lain.",
      fieldError: "email",
    };
  }

  try {
    // Generate verification token for new email with newEmail parameter
    const token = await createVerificationToken(user.id, newEmail);

    // Send verification email to new address
    const baseUrl = process.env.BASE_URL || "http://localhost:3000";
    const verificationLink = `${baseUrl}/verify-email?token=${token}`;

    await sendEmail({
      to: newEmail,
      subject: "Verifikasi Email Baru - Capsule",
      html: emailVerificationTemplate({
        userName: user.name || "Pengguna",
        verificationLink,
      }),
    });

    // Store pending email change (optional: could add pendingEmail field to User)
    return {
      message: `Link verifikasi telah dikirim ke ${newEmail}. Silakan cek email kamu.`,
      success: true,
    };
  } catch (error) {
    console.error("Failed to send verification email:", error);
    return {
      message: "Gagal mengirim email verifikasi. Silakan coba lagi.",
    };
  }
}

// Change password
export async function changePasswordAction(
  _prev: UpdateProfileState,
  formData: FormData
): Promise<UpdateProfileState> {
  const user = await getCurrentUser();
  if (!user) {
    return { message: "Silakan login terlebih dahulu." };
  }

  const oldPassword = String(formData.get("oldPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!oldPassword || !newPassword || !confirmPassword) {
    return { message: "Semua field password wajib diisi." };
  }

  // Verify old password
  if (!user.password) {
    return {
      message: "Akun kamu tidak memiliki password yang tersimpan.",
    };
  }

  const oldPasswordMatch = await bcrypt.compare(oldPassword, user.password);
  if (!oldPasswordMatch) {
    return { message: "Password lama tidak sesuai.", fieldError: "oldPassword" };
  }

  // Validate new password
  if (newPassword.length < 8) {
    return {
      message: "Password harus minimal 8 karakter.",
      fieldError: "newPassword",
    };
  }

  if (newPassword !== confirmPassword) {
    return {
      message: "Password dan konfirmasi password tidak sama.",
      fieldError: "confirmPassword",
    };
  }

  const hasUpperCase = /[A-Z]/.test(newPassword);
  const hasLowerCase = /[a-z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);

  if (!hasUpperCase || !hasLowerCase || !hasNumber) {
    return {
      message:
        "Password harus mengandung huruf besar, huruf kecil, dan angka.",
      fieldError: "newPassword",
    };
  }

  if (oldPassword === newPassword) {
    return {
      message: "Password baru harus berbeda dari password lama.",
      fieldError: "newPassword",
    };
  }

  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    return {
      message: "Password berhasil diubah.",
      success: true,
    };
  } catch (error) {
    console.error("Failed to change password:", error);
    return { message: "Gagal mengubah password. Silakan coba lagi." };
  }
}

// Delete account
export async function deleteAccountAction(
  _prev: UpdateProfileState
): Promise<UpdateProfileState> {
  const user = await getCurrentUser();
  if (!user) {
    return { message: "Silakan login terlebih dahulu." };
  }

  try {
    // Delete user (cascade will handle sessions, tokens, etc.)
    await prisma.user.delete({
      where: { id: user.id },
    });

    // Clear auth cookie
    const store = await cookies();
    store.delete(AUTH_COOKIE);

    return {
      message: "Akun berhasil dihapus.",
      success: true,
    };
  } catch (error) {
    console.error("Failed to delete account:", error);
    return { message: "Gagal menghapus akun. Silakan coba lagi." };
  }
}
// Get active sessions for current user
export async function getActiveSessions() {
  const user = await getCurrentUser();
  if (!user) {
    return [];
  }

  const store = await cookies();
  const currentToken = store.get(AUTH_COOKIE)?.value;

  const sessions = await prisma.session.findMany({
    where: {
      userId: user.id,
      expires: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      sessionToken: true,
      userAgent: true,
      createdAt: true,
      expires: true,
    },
  });

  return sessions.map((session) => ({
    ...session,
    isCurrent: session.sessionToken === currentToken,
  }));
}

// Logout from specific device
export async function logoutFromDeviceAction(sessionId: string): Promise<{ success: boolean; message?: string; isCurrentSession?: boolean }> {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, message: "Silakan login terlebih dahulu." };
  }

  const store = await cookies();
  const currentToken = store.get(AUTH_COOKIE)?.value;

  try {
    // Verify the session belongs to current user
    const session = await prisma.session.findFirst({
      where: {
        id: sessionId,
        userId: user.id,
      },
    });

    if (!session) {
      return { success: false, message: "Sesi tidak ditemukan." };
    }

    // Check if this is the current session
    const isCurrentSession = session.sessionToken === currentToken;

    // Delete the session
    await prisma.session.delete({
      where: { id: sessionId },
    });

    // If we just deleted the current session, clear the auth cookie
    if (isCurrentSession) {
      store.delete(AUTH_COOKIE);
      // Revalidate to clear any cached pages
      revalidatePath("/", "layout");
    } else {
      // Just revalidate the profile page
      revalidatePath("/profile");
    }

    return { 
      success: true, 
      message: "Sesi berhasil dihapus.",
      isCurrentSession,
    };
  } catch (error) {
    console.error("Failed to logout from device:", error);
    return { success: false, message: "Gagal logout dari perangkat." };
  }
}

// Logout from ALL devices
export async function logoutFromAllDevicesAction(): Promise<{ success: boolean; message?: string }> {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, message: "Silakan login terlebih dahulu." };
  }

  try {
    // Delete ALL sessions for this user
    await prisma.session.deleteMany({
      where: { userId: user.id },
    });

    const store = await cookies();
    store.delete(AUTH_COOKIE);
    
    // Revalidate entire layout
    revalidatePath("/", "layout");

    return { 
      success: true, 
      message: "Semua sesi berhasil dihapus. Anda telah logout dari semua perangkat.",
    };
  } catch (error) {
    console.error("Failed to logout from all devices:", error);
    return { success: false, message: "Gagal logout dari semua perangkat." };
  }
}