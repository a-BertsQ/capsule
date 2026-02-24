"use client";

import { useActionState } from "react";
import { forgotPasswordAction, type ForgotPasswordState } from "./actions";
import Link from "next/link";

const initialState: ForgotPasswordState = { message: "" };

export default function ForgotPasswordForm() {
  const [state, formAction, isPending] = useActionState(
    forgotPasswordAction,
    initialState
  );

  if (state.success) {
    return (
      <div className="forgot-password-success">
        <div className="success-icon-large">✓</div>
        <h2 className="success-title">Cek Email Kamu</h2>
        <p className="success-message">{state.message}</p>
        <p className="success-instructions">
          Silakan cek inbox atau folder spam email kamu untuk link reset password.
          Link akan kedaluwarsa dalam 1 jam.
        </p>
        <div className="forgot-password-actions">
          <Link href="/signin" className="btn-primary">
            Kembali ke Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="forgot-password-form-wrapper">
      <h1 className="forgot-password-title">Reset Password</h1>
      <p className="forgot-password-subtitle">
        Masukkan email kamu dan kami akan mengirimkan link untuk reset password.
      </p>

      <form action={formAction} className="forgot-password-form">
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
          className="btn-submit forgot-password-submit"
        >
          {isPending ? (
            <>
              <span className="submit-spinner"></span>
              Mengirim...
            </>
          ) : (
            "Kirim Link Reset"
          )}
        </button>
      </form>

      <div className="forgot-password-footer">
        <p className="footer-text">
          Ingat password kamu?{" "}
          <Link href="/signin" className="footer-link">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
