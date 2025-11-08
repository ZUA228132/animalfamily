import Link from 'next/link';
import { useRouter } from 'next/router';

/**
 * Footer navigation component. Shows three navigation links at the bottom of the
 * screen. Highlights the active page. This is intended for use in a Telegram
 * mini‑app, where screen real estate is limited.
 */
export default function FooterNav() {
  const router = useRouter();
  const currentPath = router.pathname;

  return (
    <nav className="footer-nav">
      <Link href="/" className={currentPath === '/' ? 'active' : ''}>
        Home
      </Link>
      <Link
        href="/announcements"
        className={currentPath === '/announcements' ? 'active' : ''}
      >
        Announcements
      </Link>
      <Link href="/admin" className={currentPath === '/admin' ? 'active' : ''}>
        Admin
      </Link>
    </nav>
  );
}