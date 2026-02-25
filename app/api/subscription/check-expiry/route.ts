import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/email';
import { 
  subscriptionExpiringTemplate, 
  subscriptionDowngradedTemplate,
  outstandingPaymentTemplate 
} from '@/lib/emailTemplates';

export async function GET(req: NextRequest) {
  try {
    // Verify cron secret for security
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const results = {
      expiringWarningsSent: 0,
      downgraded: 0,
      outstandingReminders: 0,
      errors: [] as string[],
    };

    // 1. Check for expiring subscriptions (7, 3, and 1 day warnings)
    const expiringUsers = await prisma.user.findMany({
      where: {
        subscriptionExpiresAt: {
          gte: now,
          lte: sevenDaysFromNow,
        },
        subscriptionStatus: 'active',
        planId: { not: null },
      },
      include: {
        plan: true,
      },
    });

    for (const user of expiringUsers) {
      try {
        if (!user.subscriptionExpiresAt || !user.plan) continue;

        const daysRemaining = Math.ceil(
          (user.subscriptionExpiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );

        // Only send email on specific days: 7, 3, 1
        if ([7, 3, 1].includes(daysRemaining)) {
          await sendEmail({
            to: user.email,
            subject: `⏰ Langganan ${user.plan.name} akan berakhir dalam ${daysRemaining} hari`,
            html: subscriptionExpiringTemplate({
              userName: user.name || 'User',
              planName: user.plan.name,
              expiryDate: user.subscriptionExpiresAt.toLocaleDateString('id-ID', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              }),
              daysRemaining,
              renewalLink: `${process.env.BASE_URL}/subscription`,
            }),
          });

          results.expiringWarningsSent++;
        }
      } catch (error) {
        console.error(`Failed to send expiry warning to ${user.email}:`, error);
        results.errors.push(`Expiry warning for ${user.email}: ${error}`);
      }
    }

    // 2. Check for expired subscriptions and downgrade to free plan
    const expiredUsers = await prisma.user.findMany({
      where: {
        subscriptionExpiresAt: {
          lt: now,
        },
        subscriptionStatus: {
          in: ['active', 'expiring'],
        },
        planId: { not: null },
      },
      include: {
        plan: true,
      },
    });

    // Get free plan ID
    const freePlan = await prisma.plan.findFirst({
      where: { slug: 'free' },
    });

    if (!freePlan) {
      console.error('Free plan not found in database!');
      results.errors.push('Free plan not found');
    } else {
      for (const user of expiredUsers) {
        try {
          if (!user.plan) continue;

          const previousPlanName = user.plan.name;

          // Update user to free plan
          await prisma.user.update({
            where: { id: user.id },
            data: {
              planId: freePlan.id,
              subscriptionStatus: 'suspended',
              subscriptionExpiresAt: null,
              nextBillingDate: null,
            },
          });

          // Send notification email
          await sendEmail({
            to: user.email,
            subject: '📋 Akun Anda telah diturunkan ke Free Plan',
            html: subscriptionDowngradedTemplate({
              userName: user.name || 'User',
              previousPlan: previousPlanName,
              dashboardLink: `${process.env.BASE_URL}/subscription`,
            }),
          });

          results.downgraded++;
        } catch (error) {
          console.error(`Failed to downgrade user ${user.email}:`, error);
          results.errors.push(`Downgrade for ${user.email}: ${error}`);
        }
      }
    }

    // 3. Check for outstanding/unpaid invoices past due date
    const overdueInvoices = await prisma.invoice.findMany({
      where: {
        status: 'unpaid',
        dueDate: {
          lt: now,
        },
      },
      include: {
        user: true,
        plan: true,
      },
    });

    for (const invoice of overdueInvoices) {
      try {
        if (!invoice.user || !invoice.plan) continue;

        await sendEmail({
          to: invoice.user.email,
          subject: `⚠️ Reminder: Tagihan ${invoice.invoiceNumber} belum dibayar`,
          html: outstandingPaymentTemplate({
            userName: invoice.user.name || 'User',
            planName: invoice.plan.name,
            amountDue: new Intl.NumberFormat('id-ID', {
              style: 'currency',
              currency: 'IDR',
            }).format(invoice.amountCents / 100),
            dueDate: invoice.dueDate.toLocaleDateString('id-ID', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            }),
            invoiceNumber: invoice.invoiceNumber,
            paymentLink: `${process.env.BASE_URL}/subscription/payments`,
          }),
        });

        results.outstandingReminders++;
      } catch (error) {
        console.error(`Failed to send outstanding invoice email to ${invoice.user?.email}:`, error);
        results.errors.push(`Outstanding invoice for ${invoice.user?.email}: ${error}`);
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: now.toISOString(),
      results,
    });
  } catch (error) {
    console.error('Cron job failed:', error);
    return NextResponse.json(
      { error: 'Cron job failed', details: error },
      { status: 500 }
    );
  }
}
