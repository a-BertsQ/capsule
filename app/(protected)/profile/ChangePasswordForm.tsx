"use client";

import { useActionState, useState } from "react";
import { changePasswordAction, type UpdateProfileState } from "./actions";

const initialState: UpdateProfileState = { message: "" };

export default function ChangePasswordForm() {
  const [state, formAction, isPending] = useActionState(
    changePasswordAction,
    initialState
  );
  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false,
  });

  return (
    <form action={formAction} className="profile-form" suppressHydrationWarning>
      <h3 className="form-section-title">Ganti Password</h3>

      <div className="form-group">
        <label htmlFor="oldPassword" className="form-label">
          Password Lama
        </label>
        <div className="password-input-wrapper">
          <input
            type={showPasswords.old ? "text" : "password"}
            id="oldPassword"
            name="oldPassword"
            className="form-input"
            required
            disabled={isPending}
            autoComplete="current-password"
            suppressHydrationWarning
          />
          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowPasswords({ ...showPasswords, old: !showPasswords.old })}
            disabled={isPending}
          >
            {showPasswords.old ? "👁️" : "👁️‍🗨️"}
          </button>
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="newPassword" className="form-label">
          Password Baru
        </label>
        <div className="password-input-wrapper">
          <input
            type={showPasswords.new ? "text" : "password"}
            id="newPassword"
            name="newPassword"
            className="form-input"
            placeholder="Minimal 8 karakter"
            required
            disabled={isPending}
            minLength={8}
            autoComplete="new-password"
            suppressHydrationWarning
          />
          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
            disabled={isPending}
          >
            {showPasswords.new ? "👁️" : "👁️‍🗨️"}
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
            type={showPasswords.confirm ? "text" : "password"}
            id="confirmPassword"
            name="confirmPassword"
            className="form-input"
            required
            disabled={isPending}
            minLength={8}
            autoComplete="new-password"
            suppressHydrationWarning
          />
          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
            disabled={isPending}
          >
            {showPasswords.confirm ? "👁️" : "👁️‍🗨️"}
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
        className="btn-submit"
      >
        {isPending ? (
          <>
            <span className="submit-spinner"></span>
            Mengubah...
          </>
        ) : (
          "Ubah Password"
        )}
      </button>
    </form>
  );
}
