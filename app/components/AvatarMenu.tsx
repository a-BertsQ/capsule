"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function AvatarMenu({ user }: { user: { name?: string | null; email?: string | null; avatar?: string } }) {
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  async function handleSignOut() {
    setSigningOut(true);
    await fetch('/api/signout', { method: 'POST' });
    // Add small delay to show loading screen
    await new Promise(resolve => setTimeout(resolve, 1500));
    window.location.href = '/signin';
  }

  if (signingOut) {
    return (
      <div className="signout-overlay">
        <div className="loading-stack">
          <Image
            src="/mascot/mascot capsule.webp"
            alt="Capsule mascot"
            width={140}
            height={140}
            className="loading-mascot"
            priority
          />
          <div className="loading-text">Keluar dari Capsule...</div>
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
    <div className="avatar-menu-root" ref={ref}>
      <button className="avatar-button" onClick={() => setOpen(v => !v)} aria-label="Account">
        {user.avatar ? (
          <Image src={user.avatar} width={32} height={32} alt="avatar" className="user-avatar" />
        ) : (
          <div className="user-avatar-placeholder" />
        )}
      </button>

      {open && (
        <div className="avatar-menu">
          <div className="menu-header">
            <div className="menu-name">{user.name ?? user.email}</div>
            <div className="menu-email">{user.email}</div>
          </div>
          <hr />
          <Link href="/profile" className="menu-item">
            Profil
          </Link>
          <button className="menu-item" onClick={handleSignOut}>
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
