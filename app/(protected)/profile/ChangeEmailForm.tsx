"use client";

import { useActionState } from "react";
import { changeEmailAction, type UpdateProfileState } from "./actions";

const initialState: UpdateProfileState = { message: "" };

export default function ChangeEmailForm({ currentEmail }: { currentEmail: string }) {
  const [state, formAction, isPending] = useActionState(
    changeEmailAction,
    initialState
  );

  if (state.success) {
    return (
      <div className="profile-section">
        <h3 className="form-section-title">Ganti Email</h3>
        <div className="form-success" style={{ marginTop: "1rem" }}>
          <p style={{ marginBottom: "0.5rem" }}>✓ {state.message}</p>
          <p style={{ fontSize: "0.9rem", marginBottom: "0" }}>
            Silakan klik link yang kami kirim ke email kamu untuk menyelesaikan verifikasi.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form action={formAction} className="profile-form" suppressHydrationWarning>
      <h3 className="form-section-title">Ganti Email</h3>

      <div className="form-group">
        <label className="form-label">Email Saat Ini</label>
        <input
          type="email"
          className="form-input"
          value={currentEmail}
          disabled
          style={{ opacity: 0.6, cursor: "not-allowed" }}
          suppressHydrationWarning
        />
      </div>

      <div className="form-group">
        <label htmlFor="email" className="form-label">
          Email Baru
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
          suppressHydrationWarning
        />
      </div>

      {state.message && !state.success && (
        <div className="form-error">{state.message}</div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="btn-submit"
      >
        {isPending ? (
          <>
            <span className="submit-spinner"></span>
            Mengirim...
          </>
        ) : (
          "Ganti Email"
        )}
      </button>
    </form>
  );
}
