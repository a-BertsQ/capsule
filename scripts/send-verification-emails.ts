/**
 * Script to send verification emails to all existing users who haven't verified their email yet
 * Usage: npx ts-node scripts/send-verification-emails.ts
 *
 * This is useful for:
 * 1. Sending emails to all users after implementing email verification
 * 2. Re-sending to users who may have missed the email
 *
 * Be careful with rate limiting on your email provider!
 */

import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { emailVerificationTemplate } from "@/lib/emailTemplates";
import { createVerificationToken } from "@/lib/tokens";

const BATCH_SIZE = 10; // Send in batches to avoid overloading email provider
const DELAY_BETWEEN_BATCHES = 1000; // 1 second between batches

async function sendVerificationEmails() {
  try {
    console.log("🚀 Starting verification email sender...\n");

    // Get all users without verified emails
    const unverifiedUsers = await prisma.user.findMany({
      where: {
        emailVerified: null,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    console.log(`📧 Found ${unverifiedUsers.length} users to verify\n`);

    if (unverifiedUsers.length === 0) {
      console.log("✅ All users already verified!");
      return;
    }

    let sent = 0;
    let failed = 0;

    // Send in batches
    for (let i = 0; i < unverifiedUsers.length; i += BATCH_SIZE) {
      const batch = unverifiedUsers.slice(i, i + BATCH_SIZE);

      console.log(
        `📨 Sending batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(
          unverifiedUsers.length / BATCH_SIZE
        )}...`
      );

      for (const user of batch) {
        try {
          // Generate verification token
          const token = await createVerificationToken(user.id);

          // Send email
          const baseUrl = process.env.BASE_URL || "http://localhost:3000";
          const verificationLink = `${baseUrl}/verify-email?token=${token}`;

          await sendEmail({
            to: user.email,
            subject: "Verifikasi Email Anda - Capsule",
            html: emailVerificationTemplate({
              userName: user.name || "Pengguna",
              verificationLink,
            }),
          });

          console.log(`  ✅ ${user.email}`);
          sent++;
        } catch (error) {
          console.error(`  ❌ ${user.email}:`, error instanceof Error ? error.message : error);
          failed++;
        }
      }

      // Wait before next batch
      if (i + BATCH_SIZE < unverifiedUsers.length) {
        console.log(`⏳ Waiting before next batch...\n`);
        await new Promise((resolve) => setTimeout(resolve, DELAY_BETWEEN_BATCHES));
      }
    }

    console.log(`\n✨ Complete!`);
    console.log(`  Sent: ${sent}`);
    console.log(`  Failed: ${failed}`);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
sendVerificationEmails();
