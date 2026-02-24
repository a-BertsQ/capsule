"use client";

import Link from "next/link";
import Image from "next/image";
import { useActionState } from "react";
import { signInAction } from "./actions";

const initialState = { message: "" };

export function SignInForm() {
  const [state, action, pending] = useActionState(signInAction, initialState);

  if (pending) {
    return (
      <div className="section-card" style={{ minHeight: "400px", display: "grid", placeItems: "center" }}>
        <div className="loading-stack">
          <Image
            src="/mascot/mascot capsule.webp"
            alt="Capsule mascot"
            width={120}
            height={120}
            className="loading-mascot"
            priority
            placeholder="blur"
            blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
          />
          <div className="loading-text">Masuk ke Capsule...</div>
          <div className="loading-dots" aria-hidden="true">
            <span className="loading-dot" />
            <span className="loading-dot" />
            <span className="loading-dot" />
          </div>
        </div>
      </div>
    );
  }

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

      <div className="mt-2 text-right">
        <Link href="/forgot-password" className="text-sm text-burgundy-medium hover:underline">
          Lupa password?
        </Link>
      </div>

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