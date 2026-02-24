import Link from "next/link";
import Image from "next/image";
import { MobileMenu } from "./menu-mobile";
import AvatarMenu from "./AvatarMenu";
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

        <div className="header-right">
          <nav className="site-nav desktop-nav">
            <Link href="/dashboard" className="nav-link">Dashboard</Link>
            <Link href="/learn" className="nav-link">Learn</Link>
            <Link href="/plans" className="nav-link">Plans</Link>
            <Link href="/tutor" className="nav-link">Tutor</Link>
          </nav>

          <div className="site-user">
            <AvatarMenu user={{ name: user.name ?? undefined, email: user.email ?? undefined, avatar: gravatarUrl(user.email, 40) }} />
          </div>

          <MobileMenu authenticated={true} />
        </div>
      </div>
    </header>
  );
}
