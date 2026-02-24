"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

export default function AvatarMenu({ user }: { user: { name?: string | null; email?: string | null; avatar?: string } }) {
  const [open, setOpen] = useState(false);
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
    await fetch('/api/signout', { method: 'POST' });
    window.location.href = '/signin';
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
          <button className="menu-item" onClick={handleSignOut}>Sign out</button>
        </div>
      )}
    </div>
  );
}
