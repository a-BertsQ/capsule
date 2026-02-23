"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signInAction } from "./actions";

const initialState = { message: "" };

export function SignInForm() {
  const [state, action, pending] = useActionState(signInAction, initialState);

  return (
    <form action={action} className="section-card">
      <label className="field-label" htmlFor="email">
        Email
      </label>
      <input
        id="email"
        name="email"
        type="email"
        required
        autoComplete="email"
        className="field-input"
      />

      <label className="field-label mt-4" htmlFor="password">
        Password
      </label>
      <input
        id="password"
        name="password"
        type="password"
        required
        autoComplete="current-password"
        className="field-input"
      />

      <button
        type="submit"
        disabled={pending}
        className="btn btn-primary mt-5 w-full"
      >
        {pending ? "Memproses..." : "Sign in"}
      </button>

      {state.message && <p className="mt-3 text-sm text-danger">{state.message}</p>}

      <Link href="https://open.spotify.com" className="mt-4 inline-block text-sm underline">
        Preview konten audio
      </Link>
    </form>
  );
}