import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

function Home() {
  const { colors } = useTheme();

  return (
    <div style={{ ...styles.container, background: colors.bg, minHeight: '100vh' }}>
      <h1 style={{ ...styles.title, color: colors.primary }}>🎓 REHANVERSE</h1>
      <p style={{ ...styles.subtitle, color: colors.subtext }}>Learn anything, anytime — by Rehan</p>
      <div style={styles.buttons}>
        <Link to="/courses">
          <button style={{ ...styles.btnPrimary, background: colors.primary }}>Browse Courses</button>
        </Link>
        <Link to="/signup">
          <button style={{ ...styles.btnSecondary, color: colors.primary, border: `2px solid ${colors.primary}`, background: colors.card }}>
            Join Free
          </button>
        </Link>
      </div>
    </div>
  );
}

const styles = {
  container: { textAlign: 'center', paddingTop: '120px', padding: '120px 20px 0' },
  title: { fontSize: '52px', fontWeight: '800', marginBottom: '16px' },
  subtitle: { fontSize: '20px', marginBottom: '40px' },
  buttons: { display: 'flex', gap: '20px', justifyContent: 'center' },
  btnPrimary: { padding: '14px 32px', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', cursor: 'pointer' },
  btnSecondary: { padding: '14px 32px', borderRadius: '8px', fontSize: '16px', cursor: 'pointer' },
};

export default Home;