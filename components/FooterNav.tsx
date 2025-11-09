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
        Главная
      </Link>
      <Link
        href="/announcements"
        className={currentPath === '/announcements' ? 'active' : ''}
      >
        Объявления
      </Link>
      <Link
        href="/create"
        className={currentPath === '/create' ? 'active' : ''}
      >
        Создать
      </Link>

<Link
  href="/cabinet"
  className={currentPath === '/cabinet' ? 'active' : ''}
>
  Кабинет
</Link>
      {/* The Admin link is hidden by default.  To expose it in your
          deployment set NEXT_PUBLIC_SHOW_ADMIN_NAV to 'true'. */}
      {process.env.NEXT_PUBLIC_SHOW_ADMIN_NAV === 'true' && (
        <Link
          href="/admin"
          className={currentPath === '/admin' ? 'active' : ''}
        >
          Админ
        </Link>
      )}
    </nav>
  );
}