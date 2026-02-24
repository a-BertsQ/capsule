"use client";

import Link from "next/link";
import { useState } from "react";
import { useActionState } from "react";
import { signUpAction } from "./actions";

const initial = { message: "" };

function passwordStrength(pw: string) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score;
}

export function SignUpForm() {
  const [state, action, pending] = useActionState(signUpAction, initial);
  const [clientError, setClientError] = useState("");
  const [strength, setStrength] = useState(0);

  return (
    <form
      action={action}
      className="section-card"
      onSubmit={(e) => {
        const form = e.currentTarget;
        const pw = (form.elements.namedItem("password") as HTMLInputElement).value;
        const confirm = (form.elements.namedItem("confirm_password") as HTMLInputElement).value;

        if (pw !== confirm) {
          e.preventDefault();
          setClientError("Password dan konfirmasi tidak cocok.");
        } else {
          setClientError("");
        }
      }}
    >
      <label className="field-label" htmlFor="name">Name</label>
      <input id="name" name="name" className="field-input" />

      <label className="field-label mt-4" htmlFor="email">Email</label>
      <input id="email" name="email" type="email" required className="field-input" />

      <label className="field-label mt-4" htmlFor="password">Password</label>
      <input
        id="password"
        name="password"
        type="password"
        required
        className="field-input"
        onChange={(e) => setStrength(passwordStrength(e.target.value))}
      />

      <label className="field-label mt-4" htmlFor="confirm_password">Confirm Password</label>
      <input
        id="confirm_password"
        name="confirm_password"
        type="password"
        required
        className="field-input"
      />

      <div className="mt-2 text-sm">
        <div>
          Strength: {['Very weak','Weak','Fair','Good','Strong'][Math.min(4,strength)]}
        </div>
      </div>

      <button type="submit" disabled={pending} className="btn btn-primary mt-5 w-full">
        {pending ? "Membuat akun..." : "Sign up"}
      </button>

      {(state.message || clientError) && (
        <p className="mt-3 text-sm text-danger">
          {clientError || state.message}
        </p>
      )}

      <Link href="/signin" className="mt-4 inline-block text-sm underline">
        Already have an account?
      </Link>
    </form>
  );
}