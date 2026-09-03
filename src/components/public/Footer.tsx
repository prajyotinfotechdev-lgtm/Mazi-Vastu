import Link from 'next/link';
import { getLanguage } from '@/lib/i18n/get-language';
import { t } from '@/lib/i18n/translate';

export default function Footer() {
  const lang = getLanguage();

  return (
    <footer style={{
      background: 'url(/images/footer-bg.svg) center bottom no-repeat var(--mv-bg-elevated)',
      backgroundSize: 'cover',
      borderTop: '1px solid var(--mv-border)',
      paddingTop: 'var(--mv-space-4xl)',
      paddingBottom: 'calc(var(--mv-space-2xl) + var(--mv-bottom-nav-height))',
      marginTop: 'auto',
    }}>
      <div className="mv-container">

        {/* Main Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 'var(--mv-space-3xl)',
          paddingBottom: 'var(--mv-space-3xl)',
          borderBottom: '1px solid var(--mv-border)',
          marginBottom: 'var(--mv-space-xl)',
        }}>

          {/* Brand */}
          <div>
            <Link href="/" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: 'var(--mv-space-base)',
              textDecoration: 'none',
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'var(--mv-accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--mv-text-on-accent)',
                fontWeight: 800,
                fontSize: '1.125rem',
                fontFamily: 'Outfit, sans-serif',
              }}>
                M
              </div>
              <span style={{
                fontSize: '1.25rem',
                fontWeight: 800,
                color: 'var(--mv-text)',
                fontFamily: 'Outfit, sans-serif',
              }}>
                Mazi<span style={{ color: 'var(--mv-accent)' }}>Vastu</span>
              </span>
            </Link>
            <p style={{
              lineHeight: 1.7,
              fontSize: '0.875rem',
              color: 'var(--mv-text-muted)',
              maxWidth: '280px',
            }}>
              {t('footer.brandDescription', lang)}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{
              color: 'var(--mv-text)',
              fontSize: '0.875rem',
              fontWeight: 700,
              marginBottom: 'var(--mv-space-base)',
              fontFamily: 'Outfit, sans-serif',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}>
              {t('footer.quickLinks', lang)}
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              {[
                { href: '/properties', label: t('footer.searchProperties', lang) },
                { href: '/services', label: t('footer.conciergeServices', lang) },
                { href: '/about', label: t('footer.aboutUs', lang) },
                { href: '/contact', label: t('footer.contactSupport', lang) },
              ].map(link => (
                <Link key={link.href} href={link.href} style={{
                  color: 'var(--mv-text-secondary)',
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  transition: 'color 200ms ease',
                }}>
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Legal */}
          <div>
            <h4 style={{
              color: 'var(--mv-text)',
              fontSize: '0.875rem',
              fontWeight: 700,
              marginBottom: 'var(--mv-space-base)',
              fontFamily: 'Outfit, sans-serif',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}>
              {t('footer.legal', lang)}
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              <Link href="/privacy" style={{ color: 'var(--mv-text-secondary)', textDecoration: 'none', fontSize: '0.875rem' }}>
                {t('footer.privacyPolicy', lang)}
              </Link>
              <Link href="/terms" style={{ color: 'var(--mv-text-secondary)', textDecoration: 'none', fontSize: '0.875rem' }}>
                {t('footer.termsOfService', lang)}
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Row */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.8125rem',
          color: 'var(--mv-text-muted)',
          flexWrap: 'wrap',
          gap: 'var(--mv-space-base)',
        }}>
          <p style={{ margin: 0 }}>&copy; {new Date().getFullYear()} {t('footer.copyright', lang)}</p>
          <div style={{ display: 'flex', gap: '1.25rem' }}>
            <a href="#" style={{ color: 'var(--mv-text-muted)', textDecoration: 'none', fontSize: '0.8125rem' }}>Facebook</a>
            <a href="#" style={{ color: 'var(--mv-text-muted)', textDecoration: 'none', fontSize: '0.8125rem' }}>Instagram</a>
            <a href="#" style={{ color: 'var(--mv-text-muted)', textDecoration: 'none', fontSize: '0.8125rem' }}>Twitter</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
