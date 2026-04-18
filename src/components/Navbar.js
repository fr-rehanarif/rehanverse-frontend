import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';

function Navbar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const { isDark, toggleTheme, colors } = useTheme();

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <nav style={{ 
      ...styles.nav, 
      background: colors.nav, 
      borderBottom: `1px solid ${colors.border}`,
    }}>
      
      {/* LOGO */}
      <motion.div whileHover={{ scale: 1.05 }}>
        <Link to="/" style={{ ...styles.logo, color: colors.primary }}>
          🎓 REHANVERSE
        </Link>
      </motion.div>

      <div style={styles.links}>
        
        {/* Courses */}
        <motion.div whileHover={{ y: -2 }}>
          <Link to="/courses" style={{ ...styles.link, color: colors.text }}>
            Courses
          </Link>
        </motion.div>

        {/* Admin */}
        {user && user.role === 'admin' && (
          <motion.div whileHover={{ y: -2 }}>
            <Link to="/admin" style={{ ...styles.link, color: colors.primary, fontWeight: '600' }}>
              ⚙️ Admin
            </Link>
          </motion.div>
        )}

        {/* Theme Toggle */}
        <motion.button 
          whileTap={{ scale: 0.9 }}
          onClick={toggleTheme} 
          style={{ ...styles.toggle, color: colors.text, borderColor: colors.border }}
        >
          {isDark ? '☀️ Light' : '🌙 Dark'}
        </motion.button> 

        {/* My Courses */}
        {user && (
          <motion.div whileHover={{ y: -2 }}>
            <Link to="/my-courses" style={{ ...styles.link, color: colors.text }}>
              🎒 My Courses
            </Link>
          </motion.div>
        )}
        
        {user ? (
          <>
            <span style={{ ...styles.name, color: colors.primary }}>
              👤 {user.name}
            </span>

            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.9 }}
              onClick={logout} 
              style={{ ...styles.btn, background: colors.primary }}
            >
              Logout
            </motion.button>
          </>
        ) : (
          <>
            <motion.div whileHover={{ y: -2 }}>
              <Link to="/login" style={{ ...styles.link, color: colors.text }}>
                Login
              </Link>
            </motion.div>

            <Link to="/signup">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.9 }}
                style={{ ...styles.btn, background: colors.primary }}
              >
                Sign Up
              </motion.button>
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

const styles = {
  nav: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: '16px 40px', 
    boxShadow: '0 8px 30px rgba(0,0,0,0.2)', // upgraded shadow
    position: 'sticky', 
    top: 0, 
    zIndex: 100,
    backdropFilter: 'blur(10px)', // 🔥 premium glass effect
  },

  logo: { 
    fontSize: '22px', 
    fontWeight: 'bold', 
    textDecoration: 'none',
    letterSpacing: '1px' // premium spacing
  },

  links: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '20px' 
  },

  link: { 
    textDecoration: 'none', 
    fontSize: '15px',
    fontWeight: '500'
  },

  name: { 
    fontWeight: '500' 
  },

  btn: { 
    padding: '8px 20px', 
    color: 'white', 
    border: 'none', 
    borderRadius: '10px', // smoother
    cursor: 'pointer', 
    fontSize: '14px',
  },

  toggle: { 
    padding: '8px 16px', 
    borderRadius: '20px', 
    border: '1px solid', 
    background: 'transparent', 
    cursor: 'pointer', 
    fontSize: '13px', 
    fontWeight: '500' 
  }
};

export default Navbar;