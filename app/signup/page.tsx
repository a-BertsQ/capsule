import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { SignUpForm } from "./signup-form";

export default async function SignUpPage() {
  const auth = await isAuthenticated();
  if (auth) redirect("/dashboard");

  return (
    <main className="page-shell">
      <div className="page-wrap flex min-h-screen items-center justify-center py-6 md:py-10">
        <div className="app-grid-2 w-full">
          <section className="page-hero">
            <p className="badge badge-primary">CAPSULE</p>
            <h1 className="section-title mt-4">Create your account</h1>
            <p className="section-subtitle">Join Capsule to access courses and tutoring.</p>
          </section>

          <SignUpForm />
        </div>
      </div>
    </main>
  );
}
