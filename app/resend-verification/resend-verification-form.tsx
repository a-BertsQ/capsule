"use client";

import { useActionState } from "react";
import { resendVerificationAction, type ResendVerificationState } from "./actions";
import Link from "next/link";

const initialState: ResendVerificationState = { message: "" };

export default function ResendVerificationForm() {
  const [state, formAction, isPending] = useActionState(
    resendVerificationAction,
    initialState
  );

  if (state.success) {
    return (
      <div className="resend-verification-success">
        <div className="success-icon-large">📧</div>
        <h2 className="success-title">Email Terkirim</h2>
        <p className="success-message">{state.message}</p>
        <p className="success-instructions">
          Silakan cek inbox atau folder spam email kamu. 
          Link verifikasi akan kedaluwarsa dalam 24 jam.
        </p>
        <div className="resend-actions">
          <Link href="/signin" className="btn-primary">
            Kembali ke Sign In
          </Link>
          <Link href="/" className="btn-secondary">
            Kembali ke Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="resend-verification-form-wrapper">
      <h1 className="resend-verification-title">Kirim Ulang Email Verifikasi</h1>
      <p className="resend-verification-subtitle">
        Masukkan email kamu dan kami akan mengirim link verifikasi sekali lagi.
      </p>

      <form action={formAction} className="resend-verification-form">
        <div className="form-group">
          <label htmlFor="email" className="form-label">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            className="form-input"
            placeholder="email@example.com"
            required
            disabled={isPending}
            autoComplete="email"
          />
        </div>

        {state.message && !state.success && (
          <div className="form-error">{state.message}</div>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="btn-submit resend-verification-submit"
        >
          {isPending ? (
            <>
              <span className="submit-spinner"></span>
              Mengirim...
            </>
          ) : (
            "Kirim Email Verifikasi"
          )}
        </button>
      </form>

      <div className="resend-verification-footer">
        <p className="footer-text">
          Sudah dapat email?{" "}
          <Link href="/signin" className="footer-link">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
