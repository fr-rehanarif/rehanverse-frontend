import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';
import Reveal from './Reveal';
import { useEffect, useState } from 'react';

function Footer() {
  const theme = useTheme();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const footerLinks = [
    { label: 'Courses', path: '/courses', icon: '📚' },
    { label: 'My Courses', path: '/my-courses', icon: '🎒' },
    { label: 'Profile', path: '/profile', icon: '👤' },
  ];

  const trustItems = ['Protected PDFs', 'Secure Access', 'Student First'];

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

        <div style={styles.inner(isMobile)}>
          {/* BRAND */}
          <div style={styles.brandCol}>
            <div style={styles.logoRow(isMobile)}>
              <div
                style={{
                  ...styles.logoIcon(isMobile),
                  background: theme.primary,
                  color: theme.buttonText,
                  boxShadow: `0 0 20px ${theme.primary}40`,
                }}
              >
                🎓
              </div>

              <h2 style={{ ...styles.brandName(isMobile), color: theme.primary }}>
                REHANVERSE
              </h2>
            </div>

            <p style={{ ...styles.brandText(isMobile), color: theme.muted }}>
              Learn anything, anytime — clean, simple and powerful learning experience for focused students.
            </p>

            <div style={styles.trustRow(isMobile)}>
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
          <div style={styles.col(isMobile)}>
            <h4 style={{ ...styles.heading(isMobile), color: theme.text }}>
              Quick Links
            </h4>

            {footerLinks.map((item) => (
              <Link key={item.path} to={item.path} style={styles.link(theme, isMobile)}>
                <span style={styles.linkIcon}>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </div>

          {/* SUPPORT */}
          <div style={styles.col(isMobile)}>
            <h4 style={{ ...styles.heading(isMobile), color: theme.text }}>
              Support
            </h4>

            <a href="mailto:rehanverse.app@gmail.com" style={styles.link(theme, isMobile)}>
              <span style={styles.linkIcon}>📧</span>
              <span style={styles.emailText}>rehanverse.app@gmail.com</span>
            </a>

            <a
              href="https://chat.whatsapp.com/HNuaMVaLxx062jr8QfdcJi"
              target="_blank"
              rel="noreferrer"
              style={styles.link(theme, isMobile)}
            >
              <span style={styles.linkIcon}>📱</span>
              <span>WhatsApp Community</span>
            </a>

            <div
              style={{
                ...styles.noticeMini(isMobile),
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
          <div style={styles.col(isMobile)}>
            <h4 style={{ ...styles.heading(isMobile), color: theme.text }}>
              Connect
            </h4>

            <a
              href="https://www.instagram.com/fr._rehanarif/"
              target="_blank"
              rel="noreferrer"
              style={styles.link(theme, isMobile)}
            >
              <span style={styles.linkIcon}>📸</span>
              <span>Instagram</span>
            </a>

            <a
              href="https://chat.whatsapp.com/HNuaMVaLxx062jr8QfdcJi"
              target="_blank"
              rel="noreferrer"
              style={styles.link(theme, isMobile)}
            >
              <span style={styles.linkIcon}>💬</span>
              <span>WhatsApp</span>
            </a>

            <div
              style={{
                ...styles.creditBox(isMobile),
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
            ...styles.bottom(isMobile),
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
    width: '100%',
    maxWidth: '100%',
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

  inner: (isMobile) => ({
    width: '100%',
    maxWidth: '1180px',
    margin: '0 auto',
    padding: isMobile ? '32px 16px 26px' : '44px 20px',
    display: 'grid',
    gridTemplateColumns: isMobile ? '1fr' : '1.35fr repeat(3, minmax(0, 1fr))',
    gap: isMobile ? '24px' : '30px',
    position: 'relative',
    zIndex: 1,
  }),

  col: (isMobile) => ({
    width: '100%',
    minWidth: 0,
    textAlign: isMobile ? 'left' : 'left',
  }),

  brandCol: {
    width: '100%',
    minWidth: 0,
  },

  logoRow: (isMobile) => ({
    display: 'flex',
    alignItems: 'center',
    gap: isMobile ? '10px' : '12px',
    marginBottom: '14px',
    flexWrap: 'nowrap',
    minWidth: 0,
  }),

  logoIcon: (isMobile) => ({
    width: isMobile ? '42px' : '46px',
    height: isMobile ? '42px' : '46px',
    borderRadius: '16px',
    display: 'grid',
    placeItems: 'center',
    fontSize: isMobile ? '22px' : '24px',
    flex: '0 0 auto',
  }),

  brandName: (isMobile) => ({
    margin: 0,
    fontSize: isMobile ? '21px' : '24px',
    fontWeight: 950,
    letterSpacing: isMobile ? '0.6px' : '1px',
    lineHeight: 1.15,
    wordBreak: 'normal',
    overflowWrap: 'normal',
  }),

  brandText: (isMobile) => ({
    lineHeight: 1.7,
    margin: '0 0 18px',
    maxWidth: isMobile ? '100%' : '390px',
    fontWeight: 700,
    fontSize: isMobile ? '13.5px' : '15px',
    wordBreak: 'normal',
    overflowWrap: 'break-word',
  }),

  trustRow: (isMobile) => ({
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
    width: '100%',
    alignItems: 'center',
  }),

  trustBadge: {
    padding: '7px 10px',
    borderRadius: '999px',
    fontSize: '12px',
    fontWeight: 900,
    whiteSpace: 'nowrap',
  },

  heading: (isMobile) => ({
    marginTop: 0,
    marginBottom: isMobile ? '10px' : '14px',
    fontSize: isMobile ? '15px' : '16px',
    fontWeight: 950,
    lineHeight: 1.25,
    wordBreak: 'normal',
  }),

  link: (theme, isMobile) => ({
    display: 'flex',
    alignItems: 'flex-start',
    gap: '9px',
    color: theme.muted,
    textDecoration: 'none',
    margin: isMobile ? '9px 0' : '10px 0',
    transition: '0.16s ease',
    fontWeight: 800,
    lineHeight: 1.5,
    fontSize: isMobile ? '13.5px' : '14px',
    width: '100%',
    minWidth: 0,
    wordBreak: 'normal',
    overflowWrap: 'anywhere',
  }),

  linkIcon: {
    flex: '0 0 auto',
    lineHeight: 1.5,
  },

  emailText: {
    minWidth: 0,
    overflowWrap: 'anywhere',
  },

  noticeMini: (isMobile) => ({
    marginTop: '14px',
    padding: isMobile ? '11px 12px' : '12px 13px',
    borderRadius: '16px',
    fontSize: isMobile ? '12.5px' : '13px',
    fontWeight: 800,
    lineHeight: 1.55,
    width: '100%',
    wordBreak: 'normal',
    overflowWrap: 'break-word',
  }),

  creditBox: (isMobile) => ({
    marginTop: '14px',
    padding: isMobile ? '12px 12px' : '13px 14px',
    borderRadius: '16px',
    fontSize: isMobile ? '12.5px' : '13px',
    lineHeight: 1.5,
    width: '100%',
  }),

  bottom: (isMobile) => ({
    padding: isMobile ? '15px 16px 88px' : '15px 20px',
    display: 'flex',
    justifyContent: 'center',
    gap: isMobile ? '8px' : '14px',
    alignItems: 'center',
    flexWrap: 'wrap',
    textAlign: 'center',
    fontSize: isMobile ? '12.5px' : '14px',
    fontWeight: 800,
    position: 'relative',
    zIndex: 1,
    lineHeight: 1.5,
    width: '100%',
  }),
};

export default Footer;