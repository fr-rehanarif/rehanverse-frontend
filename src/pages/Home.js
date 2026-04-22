import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';

function Home() {
  const theme = useTheme();

  return (
    <div
      style={{
        ...styles.container,
        background: theme.bg,
        color: theme.text,
        minHeight: '100vh',
      }}
    >
      <div
        style={{
          ...styles.heroCard,
          background: theme.card,
          border: `1px solid ${theme.border}`,
          boxShadow: theme.shadowHover,
          backdropFilter: theme.glass,
          borderRadius: theme.radius,
        }}
      >
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          style={{ ...styles.title, color: theme.primary }}
        >
          🎓 REHANVERSE
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.05 }}
          style={{ ...styles.subtitle, color: theme.muted }}
        >
          Learn anything, anytime — by Rehan
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          style={{ ...styles.description, color: theme.textSecondary }}
        >
          Courses, notes, videos, and a clean learning experience — all in one place.
        </motion.p>

        <div style={styles.buttons}>
          <Link to="/courses" style={{ textDecoration: 'none' }}>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              style={{
                ...styles.btnPrimary,
                background: theme.primary,
                color: theme.buttonText,
                boxShadow: theme.shadow,
              }}
            >
              Browse Courses
            </motion.button>
          </Link>

          <Link to="/signup" style={{ textDecoration: 'none' }}>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              style={{
                ...styles.btnSecondary,
                color: theme.primary,
                border: `1.5px solid ${theme.primary}`,
                background: theme.cardSolid,
              }}
            >
              Join Free
            </motion.button>
          </Link>
        </div>

        <div style={styles.stats}>
          <div
            style={{
              ...styles.statCard,
              background: theme.bgSecondary,
              border: `1px solid ${theme.border}`,
            }}
          >
            <p style={{ ...styles.statNumber, color: theme.primary }}>📚</p>
            <p style={{ ...styles.statLabel, color: theme.muted }}>Smart Courses</p>
          </div>

          <div
            style={{
              ...styles.statCard,
              background: theme.bgSecondary,
              border: `1px solid ${theme.border}`,
            }}
          >
            <p style={{ ...styles.statNumber, color: theme.primary }}>🎥</p>
            <p style={{ ...styles.statLabel, color: theme.muted }}>Video Learning</p>
          </div>

          <div
            style={{
              ...styles.statCard,
              background: theme.bgSecondary,
              border: `1px solid ${theme.border}`,
            }}
          >
            <p style={{ ...styles.statNumber, color: theme.primary }}>📝</p>
            <p style={{ ...styles.statLabel, color: theme.muted }}>Notes & PDFs</p>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: '80px 20px 40px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroCard: {
    width: '100%',
    maxWidth: '980px',
    textAlign: 'center',
    padding: '56px 28px',
  },
  title: {
    fontSize: '52px',
    fontWeight: '800',
    marginBottom: '14px',
    marginTop: 0,
    letterSpacing: '0.5px',
  },
  subtitle: {
    fontSize: '21px',
    marginBottom: '14px',
    marginTop: 0,
    fontWeight: '600',
  },
  description: {
    maxWidth: '680px',
    margin: '0 auto 34px',
    fontSize: '16px',
    lineHeight: '1.7',
  },
  buttons: {
    display: 'flex',
    gap: '18px',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginBottom: '34px',
  },
  btnPrimary: {
    padding: '14px 32px',
    border: 'none',
    borderRadius: '12px',
    fontSize: '16px',
    cursor: 'pointer',
    fontWeight: '600',
  },
  btnSecondary: {
    padding: '14px 32px',
    borderRadius: '12px',
    fontSize: '16px',
    cursor: 'pointer',
    fontWeight: '600',
  },
  stats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '14px',
    marginTop: '10px',
  },
  statCard: {
    padding: '18px 14px',
    borderRadius: '16px',
  },
  statNumber: {
    fontSize: '26px',
    margin: '0 0 6px',
  },
  statLabel: {
    fontSize: '14px',
    margin: 0,
    fontWeight: '600',
  },
};

export default Home;