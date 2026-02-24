"use client";

import { useActionState } from "react";
import { updateProfileAction, type UpdateProfileState } from "./actions";
const initialState: UpdateProfileState = { message: "" };

export default function UpdateProfileForm({ currentName }: { currentName: string | null }) {
  const [state, formAction, isPending] = useActionState(
    updateProfileAction,
    initialState
  );

  return (
    <form action={formAction} className="profile-form" suppressHydrationWarning>
      <h3 className="form-section-title">Update Profil</h3>

      <div className="form-group">
        <label htmlFor="name" className="form-label">
          Nama Lengkap
        </label>
        <input
          type="text"
          id="name"
          name="name"
          className="form-input"
          defaultValue={currentName || ""}
          placeholder="Nama kamu"
          required
          disabled={isPending}
          minLength={2}
          suppressHydrationWarning
        />
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
            Menyimpan...
          </>
        ) : (
          "Simpan Perubahan"
        )}
      </button>
    </form>
  );
}
