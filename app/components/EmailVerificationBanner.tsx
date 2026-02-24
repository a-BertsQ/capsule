"use client";

import { useState } from "react";
import Link from "next/link";

export default function EmailVerificationBanner() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (isCollapsed) return null;

  return (
    <div className="email-verification-banner">
      <div className="banner-content">
        <div className="banner-icon">⚠️</div>
        <div className="banner-text">
          <h3 className="banner-title">Email Belum Diverifikasi</h3>
          <p className="banner-message">
            Silakan verifikasi email kamu untuk mengakses semua fitur Capsule.{" "}
            <Link href="/resend-verification" className="banner-link">
              Kirim Ulang Email
            </Link>
          </p>
        </div>
        <button
          onClick={() => setIsCollapsed(true)}
          className="banner-close"
          aria-label="Close banner"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
