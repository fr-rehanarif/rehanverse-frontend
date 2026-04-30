import { useTheme } from '../context/ThemeContext';
import Reveal from './Reveal';

function Footer() {
  const theme = useTheme();

  return (
    <Reveal>
      <footer
        style={{
          marginTop: '60px',
          background: theme.card,
          borderTop: `1px solid ${theme.border}`,
          boxShadow: theme.shadow,
          backdropFilter: theme.glass,
        }}
      >
        <div
          style={{
            maxWidth: '1100px',
            margin: '0 auto',
            padding: '40px 20px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '30px',
          }}
        >
          {/* BRAND */}
          <div>
            <h2 style={{ color: theme.primary, marginTop: 0 }}>REHANVERSE</h2>
            <p style={{ color: theme.muted, lineHeight: '1.7' }}>
              Learn anything, anytime — clean, simple and powerful learning experience.
            </p>
          </div>

          {/* SUPPORT */}
          <div>
            <h4 style={{ color: theme.text }}>Support</h4>

            <p style={{ color: theme.muted, margin: '8px 0' }}>
              📧 rehanverse.app@gmail.com
            </p>

            <p style={{ color: theme.muted, margin: '8px 0' }}>
              📱 Join WhatsApp Channel
            </p>
          </div>

          {/* SOCIAL */}
          <div>
            <h4 style={{ color: theme.text }}>Connect</h4>

            <a
              href="https://www.instagram.com/fr._rehanarif/"
              target="_blank"
              rel="noreferrer"
              style={styles.link(theme)}
            >
              📸 Instagram
            </a>

            <a
              href="https://chat.whatsapp.com/HNuaMVaLxx062jr8QfdcJi"
              target="_blank"
              rel="noreferrer"
              style={styles.link(theme)}
            >
              💬 WhatsApp
            </a>
          </div>

          {/* CREDITS */}
          <div>
            <h4 style={{ color: theme.text }}>Credits</h4>

            <p style={{ color: theme.muted, margin: '8px 0' }}>
              Built by <span style={{ color: theme.primary }}>Mohammad Rehan Arif</span>
            </p>

            <p style={{ color: theme.muted, margin: '8px 0' }}>
              Trusted by <span style={{ color: theme.primary }}>VERSE GANG</span>
            </p>
          </div>
        </div>

        {/* BOTTOM */}
        <div
          style={{
            borderTop: `1px solid ${theme.border}`,
            padding: '14px 20px',
            textAlign: 'center',
            color: theme.muted,
            fontSize: '14px',
          }}
        >
          © 2026 REHANVERSE. All rights reserved.
        </div>
      </footer>
    </Reveal>
  );
}

const styles = {
  link: (theme) => ({
    display: 'block',
    color: theme.muted,
    textDecoration: 'none',
    margin: '8px 0',
    transition: '0.3s',
    fontWeight: '500',
  }),
};

export default Footer;