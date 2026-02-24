import ResendVerificationForm from "./resend-verification-form";
import Link from "next/link";
import Image from "next/image";

export default function ResendVerificationPage() {
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

        <ResendVerificationForm />
      </div>
    </div>
  );
}
