import API from '../api';
import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

function Signup() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [msg, setMsg] = useState('');
  const navigate = useNavigate();
  const { colors } = useTheme();

  const handleSubmit = async () => {
    try {
      const res = await axios.post('${API}/api/auth/signup', form);
      setMsg(res.data.message);
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setMsg(err.response?.data?.message || 'Error!');
    }
  };

  return (
    <div style={{ ...styles.container, background: colors.bg, minHeight: '100vh' }}>
      <div style={{ ...styles.card, background: colors.card, border: `1px solid ${colors.border}` }}>
        <h2 style={{ ...styles.title, color: colors.primary }}>Create Account 🚀</h2>
        <input style={{ ...styles.input, background: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}
          placeholder="Full Name"
          onChange={e => setForm({ ...form, name: e.target.value })} />
        <input style={{ ...styles.input, background: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}
          placeholder="Email" type="email"
          onChange={e => setForm({ ...form, email: e.target.value })} />
        <input style={{ ...styles.input, background: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}
          placeholder="Password" type="password"
          onChange={e => setForm({ ...form, password: e.target.value })} />
        <button style={{ ...styles.btn, background: colors.primary }} onClick={handleSubmit}>Sign Up</button>
        {msg && <p style={{ ...styles.msg, color: 'green' }}>{msg}</p>}
        <p style={{ textAlign: 'center', marginTop: '10px', color: colors.subtext }}>
          Already have account? <Link to="/login" style={{ color: colors.primary }}>Login</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' },
  card: { padding: '40px', borderRadius: '16px', boxShadow: '0 4px 24px rgba(0,0,0,0.1)', width: '400px' },
  title: { textAlign: 'center', marginBottom: '24px' },
  input: { width: '100%', padding: '12px', marginBottom: '16px', borderRadius: '8px', fontSize: '15px', outline: 'none' },
  btn: { width: '100%', padding: '13px', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', cursor: 'pointer' },
  msg: { textAlign: 'center', marginTop: '12px' }
};

export default Signup;