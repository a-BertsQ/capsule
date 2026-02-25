import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import CheckoutForm from "./CheckoutForm";

export const dynamic = "force-dynamic";

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/signin");

  const { slug } = await params;

  const plan = await prisma.plan.findUnique({
    where: { slug },
  });

  if (!plan) {
    redirect("/subscription");
  }

  const userWithPlan = await prisma.user.findUnique({
    where: { id: user.id },
    include: { plan: true },
  });

  const currentPlan = userWithPlan?.plan;

  // Don't allow checkout for same plan
  if (currentPlan?.id === plan.id) {
    redirect("/subscription");
  }

  return (
    <div className="checkout-page">
      <div className="page-wrap py-10">
        <div className="checkout-container">
          {/* Left Side - Plan Summary */}
          <div className="checkout-summary">
            <div className="summary-header">
              <h2 className="summary-title">Ringkasan Pembelian</h2>
            </div>

            <div className="plan-summary-card">
              <div className="plan-summary-header">
                <h3 className="plan-summary-name">{plan.name}</h3>
                {plan.slug === "premium" && (
                  <span className="popular-tag">Populer</span>
                )}
              </div>
              <p className="plan-summary-desc">{plan.description}</p>

              {plan.features && (
                <ul className="summary-features">
                  {(JSON.parse(plan.features as string) as string[]).map((feature, idx) => (
                    <li key={idx} className="summary-feature-item">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M13.5 4L6 11.5L2.5 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              )}

              <div className="summary-divider"></div>

              <div className="summary-pricing">
                <div className="pricing-row">
                  <span className="pricing-label">Harga Paket</span>
                  <span className="pricing-value">
                    Rp {(plan.priceCents / 100).toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="pricing-row">
                  <span className="pricing-label">Periode</span>
                  <span className="pricing-value">{plan.interval}</span>
                </div>
                {currentPlan && (
                  <div className="pricing-row upgrade-note">
                    <span className="pricing-label-small">
                      Upgrade dari {currentPlan.name}
                    </span>
                  </div>
                )}
              </div>

              <div className="summary-total">
                <span className="total-label">Total</span>
                <span className="total-amount">
                  Rp {(plan.priceCents / 100).toLocaleString("id-ID")}
                </span>
              </div>
            </div>

            <div className="security-notice">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 1L13 3V7.5C13 10.5 11 13 8 15C5 13 3 10.5 3 7.5V3L8 1Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>Pembayaran aman dan terenkripsi</span>
            </div>
          </div>

          {/* Right Side - Payment Form */}
          <CheckoutForm plan={plan} user={user} />
        </div>
      </div>
    </div>
  );
}
