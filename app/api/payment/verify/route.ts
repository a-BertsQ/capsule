import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Cron job endpoint untuk verify dan expire pending payments
// Setup di vercel.json atau jalankan dengan scheduler
// Recommended: run setiap 1 jam
export async function GET(req: Request) {
  try {
    // Optional: Add auth token for cron job security
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();

    // Find all pending payments that have expired
    const expiredPayments = await prisma.payment.findMany({
      where: {
        status: "pending",
        expiredAt: {
          lt: now,
        },
      },
      include: {
        invoices: true,
      },
    });

    console.log(`Found ${expiredPayments.length} expired payments`);

    // Update expired payments
    for (const payment of expiredPayments) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: "expired" },
      });

      // Cancel unpaid invoices
      for (const invoice of payment.invoices) {
        if (invoice.status === "unpaid") {
          await prisma.invoice.update({
            where: { id: invoice.id },
            data: { status: "cancelled" },
          });
        }
      }

      console.log(`Expired payment ${payment.id}`);
    }

    return NextResponse.json({
      success: true,
      expiredCount: expiredPayments.length,
      message: `${expiredPayments.length} payments expired`,
    });
  } catch (error) {
    console.error("Verify cron error:", error);
    return NextResponse.json(
      { message: "Error verifying payments" },
      { status: 500 }
    );
  }
}
