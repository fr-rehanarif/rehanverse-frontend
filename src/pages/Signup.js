import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';
import API from '../api';

function Signup() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [msg, setMsg] = useState('');
  const navigate = useNavigate();
  const theme = useTheme();

  const handleSubmit = async () => {
    try {
      const res = await axios.post(`${API}/api/auth/signup`, form);
      setMsg(res.data.message);
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setMsg(err.response?.data?.message || 'Error!');
    }
  };

  const isSuccess =
    msg &&
    (msg.toLowerCase().includes('success') ||
      msg.toLowerCase().includes('created') ||
      msg.includes('✅'));

  return (
    <div
      style={{
        ...styles.container,
        background: theme.bg,
        minHeight: '100vh',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        style={{
          ...styles.card,
          background: theme.card,
          border: `1px solid ${theme.border}`,
          boxShadow: theme.shadowHover,
          backdropFilter: theme.glass,
          borderRadius: theme.radius,
        }}
      >
        <h2 style={{ ...styles.title, color: theme.primary }}>Create Account 🚀</h2>

        <p style={{ ...styles.subtitle, color: theme.muted }}>
          Sign up and become a part of RREHANVERSE....
        </p>

        <input
          style={{
            ...styles.input,
            background: theme.bgSecondary,
            color: theme.text,
            border: `1px solid ${theme.border}`,
          }}
          placeholder="Full Name"
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <input
          style={{
            ...styles.input,
            background: theme.bgSecondary,
            color: theme.text,
            border: `1px solid ${theme.border}`,
          }}
          placeholder="Email"
          type="email"
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <input
          style={{
            ...styles.input,
            background: theme.bgSecondary,
            color: theme.text,
            border: `1px solid ${theme.border}`,
          }}
          placeholder="Password"
          type="password"
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          style={{
            ...styles.btn,
            background: theme.primary,
            color: theme.buttonText,
            boxShadow: theme.shadow,
          }}
          onClick={handleSubmit}
        >
          Sign Up
        </motion.button>

        {msg && (
          <p
            style={{
              ...styles.msg,
              color: isSuccess ? theme.success : theme.danger,
              background: isSuccess
                ? theme.mode === 'dark'
                  ? 'rgba(34, 197, 94, 0.12)'
                  : '#d1fae5'
                : theme.mode === 'dark'
                ? 'rgba(239, 68, 68, 0.12)'
                : '#fee2e2',
              border: `1px solid ${
                isSuccess
                  ? theme.mode === 'dark'
                    ? 'rgba(34, 197, 94, 0.22)'
                    : '#a7f3d0'
                  : theme.mode === 'dark'
                  ? 'rgba(239, 68, 68, 0.22)'
                  : '#fecaca'
              }`,
            }}
          >
            {msg}
          </p>
        )}

        <p style={{ textAlign: 'center', marginTop: '14px', color: theme.muted }}>
          Already have account?{' '}
          <Link to="/login" style={{ color: theme.primary, fontWeight: '600' }}>
            Login
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    padding: '20px',
  },
  card: {
    padding: '40px',
    width: '100%',
    maxWidth: '420px',
  },
  title: {
    textAlign: 'center',
    marginBottom: '10px',
    marginTop: 0,
    fontSize: '30px',
    fontWeight: '800',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: '24px',
    fontSize: '14px',
  },
  input: {
    width: '100%',
    padding: '13px 14px',
    marginBottom: '16px',
    borderRadius: '12px',
    fontSize: '15px',
    outline: 'none',
    boxSizing: 'border-box',
  },
  btn: {
    width: '100%',
    padding: '13px',
    border: 'none',
    borderRadius: '12px',
    fontSize: '16px',
    cursor: 'pointer',
    fontWeight: '600',
  },
  msg: {
    textAlign: 'center',
    marginTop: '14px',
    padding: '10px 12px',
    borderRadius: '10px',
    fontSize: '14px',
  },
};

export default Signup;