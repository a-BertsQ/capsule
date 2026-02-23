import Link from "next/link";
import { isAuthenticated } from "@/lib/auth";
import { MobileMenu } from "./menu-mobile";

export default async function Header() {
  const authenticated = await isAuthenticated();

  return (
    <header className="site-header">
      
      <div className="page-wrap header-inner">
        <div className="brand">
          <Link href="/" className="brand-link">
            Capsule
          </Link>
        </div>

        {/* Desktop nav */}
        <nav className="site-nav desktop-nav">
          {authenticated ? (
            <>
              <Link href="/dashboard" className="nav-link">Dashboard</Link>
              <Link href="/learn" className="nav-link">Learn</Link>
              <Link href="/plans" className="nav-link">Plans</Link>
              <Link href="/tutor" className="nav-link">Tutor</Link>
            </>
          ) : (
            <>
              <Link href="/signin" className="nav-link">Sign In</Link>
              <Link href="/signup" className="nav-link">Sign Up</Link>
            </>
          )}
        </nav>

        {/* Hamburger button ONLY */}
        <MobileMenu authenticated={authenticated} />
      </div>

    </header>
  );
}