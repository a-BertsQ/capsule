import Link from "next/link";

export default function Header() {
  return (
    <header className="site-header">
      <div className="page-wrap header-inner">
        <div className="brand">
          <Link href="/" className="brand-link">
            Capsule
          </Link>
        </div>
        <nav className="site-nav">
          <Link href="/dashboard" className="nav-link">Dashboard</Link>
          <Link href="/learn" className="nav-link">Learn</Link>
          <Link href="/plans" className="nav-link">Plans</Link>
          <Link href="/tutor" className="nav-link">Tutor</Link>
        </nav>
      </div>
    </header>
  );
}
