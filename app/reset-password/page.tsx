import { Suspense } from "react";
import ResetPasswordForm from "./reset-password-form";
import Link from "next/link";
import Image from "next/image";

export default function ResetPasswordPage() {
  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-logo-section">
          <Link href="/" className="auth-logo-link">
            <Image
              src="/logo/logo capsule.png"
              alt="Capsule Logo"
              width={110}
              height={110}
              className="auth-logo-image"
              priority
            />
          </Link>
        </div>

        <Suspense fallback={
          <div className="auth-loading">
            <div className="loading-spinner"></div>
            <p>Memuat...</p>
          </div>
        }>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
