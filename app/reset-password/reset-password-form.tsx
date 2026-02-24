"use client";

import { useActionState, useState } from "react";
import { resetPasswordAction, type ResetPasswordState } from "./actions";
import { useSearchParams } from "next/navigation";

const initialState: ResetPasswordState = { message: "" };

export default function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  
  const [state, formAction, isPending] = useActionState(
    resetPasswordAction,
    initialState
  );
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <div className="reset-password-form-wrapper">
      <h1 className="reset-password-title">Buat Password Baru</h1>
      <p className="reset-password-subtitle">
        Masukkan password baru kamu yang kuat dan aman.
      </p>

      <form action={formAction} className="reset-password-form">
        <input type="hidden" name="token" value={token} />

        <div className="form-group">
          <label htmlFor="password" className="form-label">
            Password Baru
          </label>
          <div className="password-input-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              className="form-input"
              placeholder="Minimal 8 karakter"
              required
              disabled={isPending}
              minLength={8}
              autoComplete="new-password"
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isPending}
            >
              {showPassword ? "👁️" : "👁️‍🗨️"}
            </button>
          </div>
          <p className="form-hint">
            Gunakan kombinasi huruf besar, huruf kecil, dan angka
          </p>
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword" className="form-label">
            Konfirmasi Password
          </label>
          <div className="password-input-wrapper">
            <input
              type={showConfirmPassword ? "text" : "password"}
              id="confirmPassword"
              name="confirmPassword"
              className="form-input"
              placeholder="Ketik ulang password"
              required
              disabled={isPending}
              minLength={8}
              autoComplete="new-password"
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              disabled={isPending}
            >
              {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
            </button>
          </div>
        </div>

        {state.message && (
          <div className={state.success ? "form-success" : "form-error"}>
            {state.message}
          </div>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="btn-submit reset-password-submit"
        >
          {isPending ? (
            <>
              <span className="submit-spinner"></span>
              Mereset Password...
            </>
          ) : (
            "Reset Password"
          )}
        </button>
      </form>
    </div>
  );
}
