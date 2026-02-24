"use client";

"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

export function MobileMenu({ authenticated }: { authenticated: boolean }) {
  const [open, setOpen] = useState(false);

  async function handleSignOut() {
    await fetch('/api/signout', { method: 'POST' });
    window.location.href = '/signin';
  }

  return (
    <>
      <div className="mobile-menu-wrapper">
        <button
          className="mobile-toggle"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="mobile-fullmenu">
          {authenticated ? (
            <>
              <Link href="/dashboard" onClick={() => setOpen(false)}>Dashboard</Link>
              <Link href="/learn" onClick={() => setOpen(false)}>Learn</Link>
              <Link href="/plans" onClick={() => setOpen(false)}>Plans</Link>
              <Link href="/tutor" onClick={() => setOpen(false)}>Tutor</Link>
              <button onClick={handleSignOut} className="btn btn-secondary" style={{marginTop: '0.5rem'}}>Sign out</button>
            </>
          ) : (
            <>
              <Link href="/signin" onClick={() => setOpen(false)}>Sign In</Link>
              <Link href="/signup" onClick={() => setOpen(false)}>Sign Up</Link>
            </>
          )}
        </div>
      )}
    </>
  );
}