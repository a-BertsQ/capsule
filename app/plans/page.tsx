import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";

export default async function PublicPlansPage({
  searchParams,
}: {
  searchParams: Promise<{ selected?: string }>;
}) {
  const authenticated = await isAuthenticated();
  if (authenticated) {
    redirect("/dashboard");
  }

  const params = await searchParams;
  const selectedSlug = params.selected;

  const plans = await prisma.plan.findMany({
    where: { isActive: true },
    orderBy: { priceCents: "asc" },
  });

  return (
    <main className="page-shell">
      <div className="page-wrap py-12">
        <section className="text-center mb-12">
          <p className="badge badge-primary inline-block mb-4">PILIH PAKET</p>
          <h1 className="text-4xl font-bold mb-4">Pilih Paket yang Sesuai</h1>
          <p className="text-lg text-muted max-w-2xl mx-auto">
            Mulai belajar farmasi dengan paket yang sesuai kebutuhan kamu. Upgrade kapan saja.
          </p>
        </section>

        <div className="plans-grid">
          {plans.map((plan: typeof plans[number]) => {
            const features = plan.features
              ? (JSON.parse(plan.features as string) as string[])
              : [];
            const isSelected = selectedSlug === plan.slug;
            const isFree = plan.priceCents === 0;

            return (
              <div
                key={plan.id}
                className={`plan-card ${isSelected ? "plan-selected" : ""} ${
                  plan.slug === "premium" ? "plan-featured" : ""
                }`}
              >
                {plan.slug === "premium" && (
                  <div className="plan-badge">Paling Populer</div>
                )}

                <div className="plan-header">
                  <h3 className="plan-name">{plan.name}</h3>
                  <p className="plan-description">{plan.description}</p>
                  <div className="plan-price">
                    {isFree ? (
                      <span className="price-free">Gratis</span>
                    ) : (
                      <>
                        <span className="price-amount">
                          Rp {(plan.priceCents / 100).toLocaleString("id-ID")}
                        </span>
                        <span className="price-period">/{plan.interval}</span>
                      </>
                    )}
                  </div>
                </div>

                <ul className="plan-features">
                  {features.map((feature: string, idx: number) => (
                    <li key={idx} className="plan-feature">
                      <span className="feature-icon">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>

                <Link
                  href={`/signup?plan=${plan.slug}`}
                  className={`btn ${
                    plan.slug === "premium" ? "btn-primary" : "btn-outline"
                  } w-full mt-auto`}
                >
                  {isFree ? "Mulai Gratis" : "Pilih Paket Ini"}
                </Link>
              </div>
            );
          })}
        </div>

        <div className="text-center mt-12">
          <p className="text-muted">
            Sudah punya akun?{" "}
            <Link href="/signin" className="text-primary font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
