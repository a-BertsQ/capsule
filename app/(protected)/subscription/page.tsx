import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const revalidate = 0;
export const dynamic = "force-dynamic";

export default async function ProtectedPlansPage() {
  const user = await getSessionUser();
  if (!user) redirect("/signin");

  const userWithPlan = await prisma.user.findUnique({
    where: { id: user.id },
    include: { plan: true },
  });

  const allPlans = await prisma.plan.findMany({
    where: { isActive: true },
    orderBy: { priceCents: "asc" },
  });

  const currentPlan = userWithPlan?.plan;

  return (
    <div className="subscription-page">
      <div className="page-wrap py-10">
        {/* Header Section */}
        <section className="subscription-header">
          <div className="header-badge">
            <span className="badge-dot"></span>
            <span>LANGGANAN</span>
          </div>
          <h1 className="subscription-title">Kelola Paket & Billing</h1>
          <p className="subscription-subtitle">
            Upgrade untuk akses unlimited ke semua fitur. Batalkan kapan saja.
          </p>
        </section>

        {/* Current Plan Card */}
        {currentPlan && (
          <div className="current-plan-banner">
            <div className="current-plan-content">
              <div className="plan-info">
                <div className="plan-badge-active">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M13.5 4L6 11.5L2.5 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Paket Aktif
                </div>
                <h3 className="current-plan-name">{currentPlan.name}</h3>
                <p className="current-plan-desc">{currentPlan.description}</p>
              </div>
              <div className="plan-pricing">
                {currentPlan.priceCents > 0 ? (
                  <>
                    <div className="price-display">
                      <span className="price-currency">Rp</span>
                      <span className="price-value">
                        {(currentPlan.priceCents / 100).toLocaleString("id-ID")}
                      </span>
                    </div>
                    <div className="price-interval">per {currentPlan.interval}</div>
                  </>
                ) : (
                  <div className="price-free-badge">Gratis</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Plans Grid */}
        <section className="plans-section">
          <h2 className="section-heading">Pilih Paket yang Sesuai</h2>
          <p className="section-description">
            Semua paket include akses forum komunitas dan materi dasar
          </p>
          
          <div className="modern-plans-grid">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {allPlans.map((plan: any) => {
              const features = plan.features
                ? (JSON.parse(plan.features as string) as string[])
                : [];
              const isCurrent = currentPlan?.id === plan.id;
              const isFree = plan.priceCents === 0;
              const isPremium = plan.slug === "premium";

              return (
                <div
                  key={plan.id}
                  className={`modern-plan-card ${isCurrent ? "is-current" : ""} ${
                    isPremium ? "is-featured" : ""
                  }`}
                >
                  {isPremium && (
                    <div className="featured-badge">
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M6 1L7.5 4.5L11 5L8.5 7.5L9 11L6 9L3 11L3.5 7.5L1 5L4.5 4.5L6 1Z" fill="currentColor"/>
                      </svg>
                      Paling Populer
                    </div>
                  )}

                  <div className="plan-card-header">
                    <h3 className="plan-card-name">{plan.name}</h3>
                    <p className="plan-card-description">{plan.description}</p>
                  </div>

                  <div className="plan-card-pricing">
                    {isFree ? (
                      <div className="pricing-free">
                        <span className="free-label">Gratis</span>
                      </div>
                    ) : (
                      <div className="pricing-paid">
                        <div className="price-main">
                          <span className="currency-symbol">Rp</span>
                          <span className="amount-large">
                            {(plan.priceCents / 100).toLocaleString("id-ID")}
                          </span>
                        </div>
                        <span className="billing-period">/{plan.interval}</span>
                      </div>
                    )}
                  </div>

                  <ul className="feature-list">
                    {features.map((feature: string, idx: number) => (
                      <li key={idx} className="feature-item">
                        <svg className="feature-check" width="20" height="20" viewBox="0 0 20 20" fill="none">
                          <circle cx="10" cy="10" r="10" fill="currentColor" fillOpacity="0.1"/>
                          <path d="M14 7L8.5 12.5L6 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="plan-card-action">
                    {isCurrent ? (
                      <button disabled className="btn-plan current-plan-btn">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <path d="M13.5 4L6 11.5L2.5 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Paket Saat Ini
                      </button>
                    ) : (
                      <Link
                        href={`/subscription/checkout/${plan.slug}`}
                        className={`btn-plan ${isPremium ? "btn-featured" : "btn-default"}`}
                      >
                        {isFree ? "Switch ke Free" : "Upgrade Sekarang"}
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* FAQ or Additional Info */}
        <section className="subscription-footer">
          <div className="footer-cta">
            <p className="footer-text">Ada pertanyaan tentang paket langganan?</p>
            <div className="footer-links">
              <Link href="/subscription/payments" className="footer-link">
                📝 Riwayat Pembayaran
              </Link>
              <Link href="/dashboard" className="footer-link">
                ← Kembali ke Dashboard
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}