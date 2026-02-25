import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { paymentSuccessTemplate } from "@/lib/emailTemplates";

// Webhook endpoint untuk menerima notifikasi dari payment gateway
// Pastikan endpoint ini di-whitelist di payment gateway dashboard
export async function POST(req: Request) {
  try {
    // Verify webhook signature (implement based on payment gateway docs)
    // const signature = req.headers.get("x-webhook-signature");
    // if (!verifySignature(body, signature)) {
    //   return NextResponse.json({ message: "Invalid signature" }, { status: 401 });
    // }

    // Handle both JSON and form data
    const contentType = req.headers.get("content-type");
    let body: {
      external_id: string;
      status: string;
      payment_method?: string;
      paid_at?: string;
    };

    if (contentType?.includes("application/json")) {
      body = await req.json();
    } else if (contentType?.includes("application/x-www-form-urlencoded")) {
      const formData = await req.formData();
      body = {
        external_id: formData.get("external_id") as string,
        status: formData.get("status") as string,
        payment_method: formData.get("payment_method") as string | undefined,
        paid_at: formData.get("paid_at") as string | undefined,
      };
    } else {
      // Try parsing as JSON by default
      body = await req.json();
    }
    
    // Parse webhook payload (adjust based on your payment gateway)
    const { external_id, status, payment_method, paid_at } = body;

    if (!external_id) {
      return NextResponse.json(
        { message: "External ID tidak ditemukan" },
        { status: 400 }
      );
    }

    // Find payment by external_id
    const payment = await prisma.payment.findUnique({
      where: { externalId: external_id },
      include: { user: true, plan: true, invoices: true },
    });

    if (!payment) {
      return NextResponse.json(
        { message: "Payment tidak ditemukan" },
        { status: 404 }
      );
    }

    // Already processed
    if (payment.status === "completed") {
      // Redirect to success page if it's a form submission
      if (contentType?.includes("form-urlencoded")) {
        return NextResponse.redirect(
          new URL(`/subscription/payment/success?paymentId=${payment.id}`, req.url)
        );
      }
      return NextResponse.json({ message: "Payment already processed" });
    }

    // Update payment status based on webhook notification
    let newStatus = "pending";
    if (status === "PAID" || status === "success" || status === "completed") {
      newStatus = "completed";
    } else if (status === "FAILED" || status === "failed") {
      newStatus = "failed";
    } else if (status === "EXPIRED" || status === "expired") {
      newStatus = "expired";
    }

    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: newStatus,
        paymentMethod: payment_method || payment.paymentMethod,
        paidAt: newStatus === "completed" ? new Date(paid_at || Date.now()) : null,
      },
    });

    // If payment successful, update user plan and invoice
    if (newStatus === "completed") {
      // Calculate subscription dates based on plan interval
      const now = new Date();
      let nextBillingDate: Date | null = null;
      let expiresAt: Date | null = null;

      if (payment.plan.interval === 'monthly') {
        nextBillingDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      } else if (payment.plan.interval === 'yearly') {
        nextBillingDate = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
        expiresAt = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
      }

      // Update user plan and subscription fields
      await prisma.user.update({
        where: { id: payment.userId },
        data: { 
          planId: payment.planId,
          subscriptionStatus: 'active',
          subscriptionStartedAt: now,
          subscriptionExpiresAt: expiresAt,
          lastBillingDate: now,
          nextBillingDate: nextBillingDate,
        },
      });

      // Update invoice
      if (payment.invoices.length > 0) {
        await prisma.invoice.update({
          where: { id: payment.invoices[0].id },
          data: {
            status: "paid",
            paidAt: new Date(paid_at || Date.now()),
          },
        });
      }

      console.log(`✅ Payment ${payment.id} completed for user ${payment.user.email}`);

      // Send payment success email
      try {
        await sendEmail({
          to: payment.user.email,
          subject: `✅ Pembayaran Berhasil - Upgrade ke ${payment.plan.name}`,
          html: paymentSuccessTemplate({
            userName: payment.user.name || 'User',
            planName: payment.plan.name,
            amountPaid: new Intl.NumberFormat('id-ID', {
              style: 'currency',
              currency: 'IDR',
            }).format(payment.amountCents / 100),
            invoiceNumber: payment.invoices[0]?.invoiceNumber || `INV-${payment.id}`,
            nextBillingDate: nextBillingDate 
              ? nextBillingDate.toLocaleDateString('id-ID', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })
              : 'N/A',
            dashboardLink: `${process.env.BASE_URL}/dashboard`,
          }),
        });
        console.log(`📧 Payment success email sent to ${payment.user.email}`);
      } catch (emailError) {
        console.error('Failed to send payment success email:', emailError);
        // Don't fail the webhook if email fails
      }

      // Redirect to success page if it's a form submission
      if (contentType?.includes("form-urlencoded")) {
        return NextResponse.redirect(
          new URL(`/subscription/payment/success?paymentId=${payment.id}`, req.url)
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: "Webhook processed",
    });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan saat memproses webhook" },
      { status: 500 }
    );
  }
}

// GET endpoint for manual payment verification (for testing)
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const externalId = url.searchParams.get("externalId");

    if (!externalId) {
      return NextResponse.json(
        { message: "External ID required" },
        { status: 400 }
      );
    }

    const payment = await prisma.payment.findUnique({
      where: { externalId },
      include: { plan: true, user: { select: { email: true, name: true } } },
    });

    if (!payment) {
      return NextResponse.json(
        { message: "Payment not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      payment: {
        id: payment.id,
        status: payment.status,
        amount: payment.amountCents,
        plan: payment.plan.name,
        user: payment.user.email,
        createdAt: payment.createdAt,
        paidAt: payment.paidAt,
      },
    });
  } catch (error) {
    console.error("Verify error:", error);
    return NextResponse.json(
      { message: "Error verifying payment" },
      { status: 500 }
    );
  }
}
