import { randomBytes, createHash } from "crypto";
import { prisma } from "./prisma";

// Generate a secure random token
export function generateToken(): string {
  return randomBytes(32).toString("hex");
}

// Hash a token for storage (extra security layer)
export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

// Create email verification token
export async function createVerificationToken(userId: string, newEmail?: string): Promise<string> {
  const token = generateToken();
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  // Determine token type
  const type = newEmail ? "email_change" : "email_verification";

  // Delete any existing verification tokens for this user
  await prisma.verificationToken.deleteMany({
    where: {
      userId,
      type,
    },
  });

  // Create new token
  await prisma.verificationToken.create({
    data: {
      token: hashToken(token),
      userId,
      type,
      newEmail: newEmail || null,
      expires,
    },
  });

  return token; // Return unhashed token for URL
}

// Verify email token (handles both signup verification and email change)
export async function verifyEmailToken(token: string): Promise<{
  success: boolean;
  userId?: string;
  type?: string;
  error?: string;
}> {
  const hashedToken = hashToken(token);

  const verificationToken = await prisma.verificationToken.findFirst({
    where: {
      token: hashedToken,
      type: {
        in: ["email_verification", "email_change"],
      },
      expires: {
        gt: new Date(),
      },
    },
  });

  if (!verificationToken) {
    return {
      success: false,
      error: "Token tidak valid atau sudah kedaluwarsa",
    };
  }

  // Handle email change verification
  if (verificationToken.type === "email_change" && verificationToken.newEmail) {
    // Update user with new email
    await prisma.user.update({
      where: { id: verificationToken.userId },
      data: {
        email: verificationToken.newEmail,
        emailVerified: new Date(),
      },
    });
  } else {
    // Handle signup/regular email verification
    await prisma.user.update({
      where: { id: verificationToken.userId },
      data: {
        emailVerified: new Date(),
      },
    });
  }

  // Delete used token
  await prisma.verificationToken.delete({
    where: { id: verificationToken.id },
  });

  return {
    success: true,
    userId: verificationToken.userId,
    type: verificationToken.type,
  };
}

// Create password reset token
export async function createPasswordResetToken(
  userId: string
): Promise<string> {
  const token = generateToken();
  const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  // Delete any existing reset tokens for this user
  await prisma.passwordResetToken.deleteMany({
    where: {
      userId,
    },
  });

  // Create new token
  await prisma.passwordResetToken.create({
    data: {
      token: hashToken(token),
      userId,
      expires,
    },
  });

  return token; // Return unhashed token for URL
}

// Verify password reset token
export async function verifyPasswordResetToken(token: string): Promise<{
  success: boolean;
  userId?: string;
  tokenId?: string;
  error?: string;
}> {
  const hashedToken = hashToken(token);

  const resetToken = await prisma.passwordResetToken.findFirst({
    where: {
      token: hashedToken,
      used: false,
      expires: {
        gt: new Date(),
      },
    },
  });

  if (!resetToken) {
    return {
      success: false,
      error: "Token tidak valid atau sudah kedaluwarsa",
    };
  }

  return {
    success: true,
    userId: resetToken.userId,
    tokenId: resetToken.id,
  };
}

// Mark password reset token as used
export async function markTokenAsUsed(tokenId: string): Promise<void> {
  await prisma.passwordResetToken.update({
    where: { id: tokenId },
    data: { used: true },
  });
}
