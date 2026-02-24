import Link from "next/link";
import { MobileMenu } from "./menu-mobile";

export default function HeaderGuest() {
  return (
    <header className="site-header">
      <div className="page-wrap header-inner">
        <div className="brand">
          <Link href="/" className="brand-link">Capsule</Link>
        </div>

        <div className="header-right">
          <nav className="site-nav desktop-nav">
            <Link href="/signin" className="nav-link">Sign In</Link>
            <Link href="/signup" className="nav-link">Sign Up</Link>
          </nav>

          <div className="site-user" />

          <MobileMenu authenticated={false} />
        </div>
      </div>
    </header>
  );
}
