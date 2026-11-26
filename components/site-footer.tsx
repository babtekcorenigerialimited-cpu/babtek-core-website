import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-main">
          <Link className="brand brand-light" href="/">
            <span className="brand-mark">B</span>
            <span className="brand-copy"><strong>BABTEK CORE</strong><small>NIGERIA LIMITED</small></span>
          </Link>
          <p>Building a Better Future.</p>
          <a href="mailto:babtekcorenigerialimited@gmail.com">babtekcorenigerialimited@gmail.com</a>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} BABTEK Core Nigeria Limited. All rights reserved.</span>
          <span>Building Ideas. Engineering Possibilities. Creating Value.</span>
        </div>
      </div>
    </footer>
  );
}
