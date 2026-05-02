import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';
import Reveal from './Reveal';

function Footer() {
  const theme = useTheme();

  const footerLinks = [
    { label: 'Courses', path: '/courses', icon: '📚' },
    { label: 'My Courses', path: '/my-courses', icon: '🎒' },
    { label: 'Profile', path: '/profile', icon: '👤' },
  ];

  const trustItems = [
    'Protected PDFs',
    'Secure Access',
    'Student First',
  ];

  return (
    <Reveal>
      <footer
        style={{
          ...styles.footer,
          background: theme.card,
          borderTop: `1px solid ${theme.border}`,
          boxShadow: theme.shadow,
          backdropFilter: theme.glass,
          WebkitBackdropFilter: theme.glass,
        }}
      >
        <div style={styles.glowOne} />
        <div style={styles.glowTwo} />

        <div style={styles.inner}>
          {/* BRAND */}
          <div style={styles.brandCol}>
            <div style={styles.logoRow}>
              <div
                style={{
                  ...styles.logoIcon,
                  background: theme.primary,
                  color: theme.buttonText,
                  boxShadow: `0 0 20px ${theme.primary}40`,
                }}
              >
                🎓
              </div>

              <h2 style={{ ...styles.brandName, color: theme.primary }}>
                REHANVERSE
              </h2>
            </div>

            <p style={{ ...styles.brandText, color: theme.muted }}>
              Learn anything, anytime — clean, simple and powerful learning experience for focused students.
            </p>

            <div style={styles.trustRow}>
              {trustItems.map((item) => (
                <span
                  key={item}
                  style={{
                    ...styles.trustBadge,
                    color: theme.primary,
                    background: theme.isDark
                      ? 'rgba(167,139,250,0.10)'
                      : 'rgba(124,58,237,0.08)',
                    border: `1px solid ${theme.border}`,
                  }}
                >
                  ✅ {item}
                </span>
              ))}
            </div>
          </div>

          {/* QUICK LINKS */}
          <div>
            <h4 style={{ ...styles.heading, color: theme.text }}>Quick Links</h4>

            {footerLinks.map((item) => (
              <Link key={item.path} to={item.path} style={styles.link(theme)}>
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </div>

          {/* SUPPORT */}
          <div>
            <h4 style={{ ...styles.heading, color: theme.text }}>Support</h4>

            <a href="mailto:rehanverse.app@gmail.com" style={styles.link(theme)}>
              <span>📧</span>
              <span>rehanverse.app@gmail.com</span>
            </a>

            <a
              href="https://chat.whatsapp.com/HNuaMVaLxx062jr8QfdcJi"
              target="_blank"
              rel="noreferrer"
              style={styles.link(theme)}
            >
              <span>📱</span>
              <span>WhatsApp Community</span>
            </a>

            <div
              style={{
                ...styles.noticeMini,
                background: theme.isDark
                  ? 'rgba(255,255,255,0.035)'
                  : 'rgba(255,255,255,0.72)',
                border: `1px solid ${theme.border}`,
                color: theme.muted,
              }}
            >
              🔐 Course material sharing is strictly prohibited.
            </div>
          </div>

          {/* CONNECT + CREDITS */}
          <div>
            <h4 style={{ ...styles.heading, color: theme.text }}>Connect</h4>

            <a
              href="https://www.instagram.com/fr._rehanarif/"
              target="_blank"
              rel="noreferrer"
              style={styles.link(theme)}
            >
              <span>📸</span>
              <span>Instagram</span>
            </a>

            <a
              href="https://chat.whatsapp.com/HNuaMVaLxx062jr8QfdcJi"
              target="_blank"
              rel="noreferrer"
              style={styles.link(theme)}
            >
              <span>💬</span>
              <span>WhatsApp</span>
            </a>

            <div
              style={{
                ...styles.creditBox,
                background: theme.isDark
                  ? 'rgba(255,255,255,0.035)'
                  : 'rgba(255,255,255,0.72)',
                border: `1px solid ${theme.border}`,
              }}
            >
              <p style={{ color: theme.muted, margin: 0 }}>
                Built by{' '}
                <span style={{ color: theme.primary, fontWeight: 950 }}>
                  Mohammad Rehan Arif
                </span>
              </p>

              <p style={{ color: theme.muted, margin: '6px 0 0' }}>
                Trusted by{' '}
                <span style={{ color: theme.primary, fontWeight: 950 }}>
                  VERSE GANG
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* BOTTOM */}
        <div
          style={{
            ...styles.bottom,
            borderTop: `1px solid ${theme.border}`,
            color: theme.muted,
          }}
        >
          <span>© 2026 REHANVERSE. All rights reserved.</span>

          <motion.span
            whileHover={{ y: -1 }}
            transition={{ duration: 0.16 }}
            style={{ color: theme.primary, fontWeight: 900 }}
          >
            Made with focus 🚀
          </motion.span>
        </div>
      </footer>
    </Reveal>
  );
}

const styles = {
  footer: {
    marginTop: '60px',
    position: 'relative',
    overflow: 'hidden',
  },
  glowOne: {
    position: 'absolute',
    top: '-80px',
    left: '8%',
    width: '230px',
    height: '230px',
    borderRadius: '50%',
    background: 'rgba(124, 58, 237, 0.13)',
    filter: 'blur(90px)',
    pointerEvents: 'none',
  },
  glowTwo: {
    position: 'absolute',
    bottom: '-120px',
    right: '8%',
    width: '260px',
    height: '260px',
    borderRadius: '50%',
    background: 'rgba(59, 130, 246, 0.10)',
    filter: 'blur(95px)',
    pointerEvents: 'none',
  },
  inner: {
    maxWidth: '1180px',
    margin: '0 auto',
    padding: '44px 20px',
    display: 'grid',
    gridTemplateColumns: '1.35fr repeat(3, 1fr)',
    gap: '30px',
    position: 'relative',
    zIndex: 1,
  },
  brandCol: {
    minWidth: 0,
  },
  logoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '14px',
  },
  logoIcon: {
    width: '46px',
    height: '46px',
    borderRadius: '16px',
    display: 'grid',
    placeItems: 'center',
    fontSize: '24px',
    flex: '0 0 auto',
  },
  brandName: {
    margin: 0,
    fontSize: '24px',
    fontWeight: 950,
    letterSpacing: '1px',
  },
  brandText: {
    lineHeight: 1.75,
    margin: '0 0 18px',
    maxWidth: '390px',
    fontWeight: 700,
  },
  trustRow: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
  trustBadge: {
    padding: '7px 10px',
    borderRadius: '999px',
    fontSize: '12px',
    fontWeight: 900,
  },
  heading: {
    marginTop: 0,
    marginBottom: '14px',
    fontSize: '16px',
    fontWeight: 950,
  },
  link: (theme) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '9px',
    color: theme.muted,
    textDecoration: 'none',
    margin: '10px 0',
    transition: '0.16s ease',
    fontWeight: 800,
    lineHeight: 1.5,
    wordBreak: 'break-word',
  }),
  noticeMini: {
    marginTop: '14px',
    padding: '12px 13px',
    borderRadius: '16px',
    fontSize: '13px',
    fontWeight: 800,
    lineHeight: 1.55,
  },
  creditBox: {
    marginTop: '14px',
    padding: '13px 14px',
    borderRadius: '16px',
    fontSize: '13px',
    lineHeight: 1.5,
  },
  bottom: {
    padding: '15px 20px',
    display: 'flex',
    justifyContent: 'center',
    gap: '14px',
    alignItems: 'center',
    flexWrap: 'wrap',
    textAlign: 'center',
    fontSize: '14px',
    fontWeight: 800,
    position: 'relative',
    zIndex: 1,
  },
};

export default Footer;