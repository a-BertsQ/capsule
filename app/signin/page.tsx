import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { SignInForm } from "./signin-form";

export default async function SignInPage() {
  const authenticated = await isAuthenticated();
  if (authenticated) {
    redirect("/dashboard");
  }

  return (
    <main className="page-shell">
      <div className="page-wrap flex min-h-screen items-center justify-center py-6 md:py-10">
        <div className="app-grid-2 w-full">
          <section className="page-hero">
            <p className="badge badge-primary">CAPSULE</p>
            <h1 className="section-title mt-4">Sign in ke platform belajar farmasi</h1>
            <p className="section-subtitle">
              Insight yang ringkas, jelas, dan siap dipakai untuk bantu adaptasi kuliah.
            </p>
            <div className="section-card mt-6 text-sm">
              <p className="font-semibold">Demo credential</p>
              <p className="mt-1">Email: student@capsule.id</p>
              <p>Password: Capsule123!</p>
            </div>
          </section>

          <SignInForm />
        </div>
      </div>
    </main>
  );
}