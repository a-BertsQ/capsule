import Link from "next/link";
import Image from "next/image";
import { MobileMenu } from "./menu-mobile";
import { signOutAction } from "@/app/signin/actions";
import crypto from "crypto";

function gravatarUrl(email?: string, size = 40) {
  if (!email) return `https://www.gravatar.com/avatar/?d=identicon&s=${size}`;
  const hash = crypto.createHash("md5").update(email.trim().toLowerCase()).digest("hex");
  return `https://www.gravatar.com/avatar/${hash}?d=identicon&s=${size}`;
}

export default function HeaderAuth({ user }: { user: { name?: string | null; email?: string | null } }) {
  return (
    <header className="site-header">
      <div className="page-wrap header-inner">
        <div className="brand">
          <Link href="/" className="brand-link">Capsule</Link>
        </div>

        <nav className="site-nav desktop-nav">
          <Link href="/dashboard" className="nav-link">Dashboard</Link>
          <Link href="/learn" className="nav-link">Learn</Link>
          <Link href="/plans" className="nav-link">Plans</Link>
          <Link href="/tutor" className="nav-link">Tutor</Link>
        </nav>

        <div className="site-user">
          <div className="user-row">
            <div className="user-info">
              <Image src={gravatarUrl(user.email, 40)} width={36} height={36} alt="avatar" className="user-avatar" />
              <span className="user-name">Hi, {user.name ?? user.email}</span>
            </div>

            <form action={signOutAction} className="ml-3 signout-form">
              <button type="submit" className="btn btn-secondary">Sign out</button>
            </form>
          </div>
        </div>

        <MobileMenu authenticated={true} />
      </div>
    </header>
  );
}
