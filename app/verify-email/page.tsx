import { Suspense } from "react";
import VerifyEmailContent from "./VerifyEmailContent";

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="verify-email-loading">
        <div className="loading-spinner"></div>
        <p>Memverifikasi email...</p>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
