import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { SignUpForm } from "./signup-form";
import { prisma } from "@/lib/prisma";

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string }>;
}) {
  const auth = await isAuthenticated();
  if (auth) redirect("/dashboard");

  const params = await searchParams;
  const planSlug = params.plan || "free";

  // Get plan info
  const plan = await prisma.plan.findUnique({
    where: { slug: planSlug },
  });

  return (
    <main className="page-shell">
      <div className="page-wrap flex min-h-screen items-center justify-center py-6 md:py-10">
        <div className="app-grid-2 w-full">
          <section className="page-hero">
            <p className="badge badge-primary">CAPSULE</p>
            <h1 className="section-title mt-4">Create your account</h1>
            <p className="section-subtitle">Join Capsule to access courses and tutoring.</p>
            
            {plan && (
              <div className="section-card mt-6 text-sm">
                <p className="font-semibold">Paket Terpilih: {plan.name}</p>
                {plan.priceCents > 0 ? (
                  <p className="mt-1">
                    Rp {(plan.priceCents / 100).toLocaleString("id-ID")}/{plan.interval}
                  </p>
                ) : (
                  <p className="mt-1">Gratis - Akses dasar</p>
                )}
              </div>
            )}
          </section>

          <SignUpForm selectedPlan={planSlug} />
        </div>
      </div>
    </main>
  );
}
