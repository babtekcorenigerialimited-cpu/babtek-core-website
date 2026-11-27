import Link from "next/link";

const links = [
  { label: "About", href: "/about" },
  { label: "Divisions", href: "/divisions" },
  { label: "Services", href: "/services" },
  { label: "Capabilities", href: "/capabilities" },
  { label: "Projects", href: "/projects" },
  { label: "Technology", href: "/technology" },
  { label: "Insights", href: "/insights" },
];

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link className="brand" href="/" aria-label="BABTEK Core Nigeria Limited home">
          <span className="brand-mark">B</span>
          <span className="brand-copy">
            <strong>BABTEK CORE</strong>
            <small>NIGERIA LIMITED</small>
          </span>
        </Link>
        <nav className="desktop-nav" aria-label="Main navigation">
          {links.map((link) => (
            <Link key={link.label} href={link.href}>{link.label}</Link>
          ))}
          <Link className="button button-small" href="/contact">Start a project <span aria-hidden="true">↗</span></Link>
        </nav>
        <Link className="mobile-contact" href="/divisions">Explore BABTEK ↗</Link>
      </div>
    </header>
  );
}
