"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { verifyEmailTokenAction } from "./actions";

export default function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");
  const [verificationType, setVerificationType] = useState<"email_verification" | "email_change" | null>(null);
  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      return;
    }

    // Verify the token
    let isMounted = true;
    
    verifyEmailTokenAction(token)
      .then((result) => {
        if (!isMounted) return;
        
        if (result.success) {
          setStatus("success");
          setVerificationType((result.type as "email_verification" | "email_change") ?? "email_verification");
          
          // Determine message and redirect based on verification type
          if (result.type === "email_change") {
            setMessage("Email berhasil diubah! Avatar Anda akan diperbarui secara otomatis.");
            // Redirect to profile after 3 seconds (keep user logged in)
            setTimeout(() => {
              if (isMounted) {
                router.push("/profile");
              }
            }, 3000);
          } else {
            setMessage("Email berhasil diverifikasi! Kamu sekarang bisa login.");
            // Redirect to signin after 3 seconds
            setTimeout(() => {
              if (isMounted) {
                router.push("/signin");
              }
            }, 3000);
          }
        } else {
          setStatus("error");
          setMessage(result.error || "Verifikasi gagal.");
        }
      })
      .catch((error) => {
        if (!isMounted) return;
        console.error("Verification error:", error);
        setStatus("error");
        setMessage("Terjadi kesalahan saat verifikasi email.");
      });
    
    return () => {
      isMounted = false;
    };
  }, [token, router]);

  if (!token) {
    return (
      <div className="verify-email-result-container">
        <div className="verify-email-result-card">
          <div className="verify-email-header">
            <Image
              src="/mascot/mascot capsule.webp"
              alt="Capsule Mascot"
              width={180}
              height={180}
              className="verify-mascot"
              priority
            />
          </div>
          <div className="verify-error">
            <div className="error-icon">✗</div>
            <h2 className="verify-subtitle error">Verifikasi Gagal</h2>
            <p className="verify-text">Token verifikasi tidak ditemukan.</p>
            <div className="verify-actions">
              <Link href="/signin" className="btn-verify-signin">
                Kembali ke Sign In
              </Link>
              <Link href="/" className="btn-verify-home">
                Kembali ke Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="verify-email-result-container">
      <div className="verify-email-result-card">
        <div className="verify-email-header">
          <Image
            src="/mascot/mascot capsule.webp"
            alt="Capsule Mascot"
            width={180}
            height={180}
            className="verify-mascot"
            priority
          />
        </div>

        {status === "loading" && (
          <div className="verify-loading">
            <div className="loading-spinner"></div>
            <h2 className="verify-subtitle">Memverifikasi email...</h2>
            <p className="verify-text">Mohon tunggu sebentar</p>
          </div>
        )}

        {status === "success" && (
          <div className="verify-success">
            <div className="success-icon">✓</div>
            <h2 className="verify-subtitle success">Verifikasi Berhasil!</h2>
            <p className="verify-text">{message}</p>
            <p className="verify-redirect-text">
              {verificationType === "email_change" 
                ? "Mengalihkan ke profil Anda..." 
                : "Mengalihkan ke halaman sign in..."}
            </p>
          </div>
        )}

        {status === "error" && (
          <div className="verify-error">
            <div className="error-icon">✗</div>
            <h2 className="verify-subtitle error">Verifikasi Gagal</h2>
            <p className="verify-text">{message}</p>
            <div className="verify-actions">
              <Link href="/signin" className="btn-verify-signin">
                Kembali ke Sign In
              </Link>
              <Link href="/" className="btn-verify-home">
                Kembali ke Home
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
