import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { randomUUID } from "crypto";

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { planId, paymentMethod } = body;

    if (!planId || !paymentMethod) {
      return NextResponse.json(
        { message: "Plan ID dan payment method wajib diisi" },
        { status: 400 }
      );
    }

    // Get plan
    const plan = await prisma.plan.findUnique({
      where: { id: parseInt(planId) },
    });

    if (!plan) {
      return NextResponse.json({ message: "Plan tidak ditemukan" }, { status: 404 });
    }

    // Check if user already has this plan
    const userWithPlan = await prisma.user.findUnique({
      where: { id: user.id },
      select: { planId: true },
    });

    if (userWithPlan?.planId === plan.id) {
      return NextResponse.json(
        { message: "Anda sudah berlangganan plan ini" },
        { status: 400 }
      );
    }

    // For free plan, just update user plan directly
    if (plan.priceCents === 0) {
      await prisma.user.update({
        where: { id: user.id },
        data: { planId: plan.id },
      });

      // Create a completed payment record
      const payment = await prisma.payment.create({
        data: {
          userId: user.id,
          planId: plan.id,
          amountCents: 0,
          status: "completed",
          paymentMethod: "free",
          paymentGateway: "manual",
          paidAt: new Date(),
        },
      });

      // Create invoice
      const invoiceNumber = `INV-${Date.now()}-${randomUUID().slice(0, 8).toUpperCase()}`;
      await prisma.invoice.create({
        data: {
          invoiceNumber,
          userId: user.id,
          paymentId: payment.id,
          planId: plan.id,
          amountCents: 0,
          status: "paid",
          dueDate: new Date(),
          paidAt: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        paymentId: payment.id,
        message: "Berhasil switch ke free plan",
      });
    }

    // For paid plans, create pending payment
    const externalId = `PAY-${Date.now()}-${randomUUID().slice(0, 8).toUpperCase()}`;
    const expiredAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Simulate payment gateway URL creation
    // In production, integrate with real payment gateway (Midtrans/Xendit)
    const baseUrl = process.env.BASE_URL || "http://localhost:3000";
    const simulatedPaymentUrl = `${baseUrl}/subscription/payment/pending?paymentId=${externalId}`;

    const payment = await prisma.payment.create({
      data: {
        userId: user.id,
        planId: plan.id,
        amountCents: plan.priceCents,
        status: "pending",
        paymentMethod,
        paymentGateway: "manual", // Change to 'midtrans' or 'xendit' in production
        externalId,
        externalUrl: simulatedPaymentUrl,
        expiredAt,
      },
    });

    // Create invoice
    const invoiceNumber = `INV-${Date.now()}-${randomUUID().slice(0, 8).toUpperCase()}`;
    await prisma.invoice.create({
      data: {
        invoiceNumber,
        userId: user.id,
        paymentId: payment.id,
        planId: plan.id,
        amountCents: plan.priceCents,
        status: "unpaid",
        dueDate: expiredAt,
      },
    });

    return NextResponse.json({
      success: true,
      paymentId: payment.id,
      externalId,
      paymentUrl: simulatedPaymentUrl,
      expiresAt: expiredAt,
    });
  } catch (error) {
    console.error("Create payment error:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan saat membuat pembayaran" },
      { status: 500 }
    );
  }
}
