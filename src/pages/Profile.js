import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';
import API from '../api';

function Profile() {
  const { colors } = useTheme();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const [profile, setProfile] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [msg, setMsg] = useState('');
  const [form, setForm] = useState({
    name: '', phone: '', bio: '', photo: ''
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '', newPassword: '', confirmPassword: ''
  });

  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await axios.get(`${API}/api/users/me`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProfile(res.data);
      setForm({
        name: res.data.name || '',
        phone: res.data.phone || '',
        bio: res.data.bio || '',
        photo: res.data.photo || ''
      });
    } catch (err) {
      navigate('/login');
    }
  };

  const handleUpdate = async () => {
    try {
      const res = await axios.put(`${API}/api/users/me`, form,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMsg('✅ Profile updated!');
      // localStorage update karo
      const currentUser = JSON.parse(localStorage.getItem('user'));
      localStorage.setItem('user', JSON.stringify({ ...currentUser, ...res.data.user }));
      fetchProfile();
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      setMsg('❌ ' + err.response?.data?.message);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMsg('❌ New passwords match nahi karte!');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setMsg('❌ Password kam se kam 6 characters ka hona chahiye!');
      return;
    }
    try {
      await axios.put(`${API}/api/users/me`,
        { currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMsg('✅ Password changed!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      setMsg('❌ ' + err.response?.data?.message);
    }
  };

  if (!profile) return (
    <div style={{ background: colors.bg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: colors.subtext }}>⏳ Loading...</p>
    </div>
  );

  const inputStyle = {
    width: '100%', padding: '12px', marginBottom: '16px',
    borderRadius: '8px', fontSize: '14px', outline: 'none',
    background: colors.bg, color: colors.text,
    border: `1px solid ${colors.border}`
  };

  return (
    <div style={{ background: colors.bg, minHeight: '100vh', padding: '40px 20px' }}>
      <div style={{ maxWidth: '700px', margin: '0 auto' }}>

        {/* Profile Header */}
        <div style={{ background: colors.card, border: `1px solid ${colors.border}`, borderRadius: '20px', padding: '32px', marginBottom: '24px', textAlign: 'center' }}>
          
          {/* Photo */}
          <div style={{ marginBottom: '16px' }}>
            {profile.photo ? (
              <img src={profile.photo} alt="profile"
                style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', border: `3px solid ${colors.primary}` }} />
            ) : (
              <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: colors.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', fontSize: '40px' }}>
                {profile.name?.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          <h2 style={{ color: colors.text, marginBottom: '4px' }}>{profile.name}</h2>
          <p style={{ color: colors.subtext, fontSize: '14px', marginBottom: '8px' }}>{profile.email}</p>
          {profile.phone && <p style={{ color: colors.subtext, fontSize: '13px' }}>📱 {profile.phone}</p>}
          {profile.bio && <p style={{ color: colors.subtext, fontSize: '13px', marginTop: '8px', fontStyle: 'italic' }}>"{profile.bio}"</p>}

          <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginTop: '16px' }}>
            <div style={{ textAlign: 'center' }}>
              <p style={{ color: colors.primary, fontWeight: '700', fontSize: '20px', margin: 0 }}>{profile.enrolledCourses?.length || 0}</p>
              <p style={{ color: colors.subtext, fontSize: '12px' }}>Courses</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ color: colors.primary, fontWeight: '700', fontSize: '20px', margin: 0 }}>
                {new Date(profile.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
              </p>
              <p style={{ color: colors.subtext, fontSize: '12px' }}>Joined</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
          <button onClick={() => setActiveTab('profile')}
            style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '600',
              background: activeTab === 'profile' ? colors.primary : colors.card,
              color: activeTab === 'profile' ? 'white' : colors.text }}>
            ✏️ Edit Profile
          </button>
          <button onClick={() => setActiveTab('password')}
            style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '600',
              background: activeTab === 'password' ? colors.primary : colors.card,
              color: activeTab === 'password' ? 'white' : colors.text }}>
            🔐 Password
          </button>
          <button onClick={() => setActiveTab('courses')}
            style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '600',
              background: activeTab === 'courses' ? colors.primary : colors.card,
              color: activeTab === 'courses' ? 'white' : colors.text }}>
            📚 My Courses
          </button>
        </div>

        {msg && (
          <div style={{ padding: '12px 20px', borderRadius: '10px', marginBottom: '20px',
            background: msg.includes('✅') ? '#d1fae5' : '#fee2e2',
            color: msg.includes('✅') ? '#065f46' : '#991b1b' }}>
            {msg}
          </div>
        )}

        {/* Edit Profile Tab */}
        {activeTab === 'profile' && (
          <div style={{ background: colors.card, border: `1px solid ${colors.border}`, borderRadius: '16px', padding: '32px' }}>
            <h3 style={{ color: colors.text, marginBottom: '20px' }}>✏️ Profile Edit Karo</h3>

            <label style={{ color: colors.subtext, fontSize: '13px' }}>Full Name</label>
            <input style={inputStyle} placeholder="Full Name"
              value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />

            <label style={{ color: colors.subtext, fontSize: '13px' }}>Phone Number</label>
            <input style={inputStyle} placeholder="Phone Number (e.g. +91 9876543210)"
              value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />

            <label style={{ color: colors.subtext, fontSize: '13px' }}>Bio</label>
            <textarea style={{ ...inputStyle, height: '80px', resize: 'vertical' }}
              placeholder="Apne baare mein kuch likho..."
              value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} />

            <label style={{ color: colors.subtext, fontSize: '13px' }}>Profile Photo URL</label>
            <input style={inputStyle} placeholder="Photo URL (ImgBB ya koi bhi image link)"
              value={form.photo} onChange={e => setForm({ ...form, photo: e.target.value })} />

            {form.photo && (
              <div style={{ marginBottom: '16px', textAlign: 'center' }}>
                <img src={form.photo} alt="preview"
                  style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: `2px solid ${colors.primary}` }} />
                <p style={{ color: colors.subtext, fontSize: '12px', marginTop: '4px' }}>Preview</p>
              </div>
            )}

            <button onClick={handleUpdate}
              style={{ width: '100%', padding: '14px', background: colors.primary, color: 'white', border: 'none', borderRadius: '10px', fontSize: '16px', cursor: 'pointer', fontWeight: '600' }}>
              💾 Save Changes
            </button>
          </div>
        )}

        {/* Password Tab */}
        {activeTab === 'password' && (
          <div style={{ background: colors.card, border: `1px solid ${colors.border}`, borderRadius: '16px', padding: '32px' }}>
            <h3 style={{ color: colors.text, marginBottom: '20px' }}>🔐 Password Change Karo</h3>

            <label style={{ color: colors.subtext, fontSize: '13px' }}>Current Password</label>
            <input style={inputStyle} type="password" placeholder="Current Password"
              value={passwordForm.currentPassword}
              onChange={e => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} />

            <label style={{ color: colors.subtext, fontSize: '13px' }}>New Password</label>
            <input style={inputStyle} type="password" placeholder="New Password"
              value={passwordForm.newPassword}
              onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} />

            <label style={{ color: colors.subtext, fontSize: '13px' }}>Confirm New Password</label>
            <input style={inputStyle} type="password" placeholder="Confirm New Password"
              value={passwordForm.confirmPassword}
              onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} />

            <button onClick={handlePasswordChange}
              style={{ width: '100%', padding: '14px', background: '#10b981', color: 'white', border: 'none', borderRadius: '10px', fontSize: '16px', cursor: 'pointer', fontWeight: '600' }}>
              🔐 Password Change Karo
            </button>
          </div>
        )}

        {/* My Courses Tab */}
        {activeTab === 'courses' && (
          <div>
            {profile.enrolledCourses?.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 0' }}>
                <p style={{ fontSize: '48px' }}>📭</p>
                <p style={{ color: colors.subtext, fontSize: '18px' }}>Koi course enroll nahi!</p>
                <button onClick={() => navigate('/courses')}
                  style={{ marginTop: '16px', padding: '12px 28px', background: colors.primary, color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                  Courses Dekho
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                {profile.enrolledCourses?.map(course => (
                  <div key={course._id} style={{ background: colors.card, border: `1px solid ${colors.border}`, borderRadius: '12px', overflow: 'hidden' }}>
                    {course.thumbnail ? (
                      <img src={course.thumbnail} alt={course.title} style={{ width: '100%', height: '140px', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '140px', background: `linear-gradient(135deg, ${colors.primary}, #818cf8)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontSize: '36px' }}>🎓</span>
                      </div>
                    )}
                    <div style={{ padding: '16px' }}>
                      <h4 style={{ color: colors.text, marginBottom: '12px', fontSize: '15px' }}>{course.title}</h4>
                      <button onClick={() => navigate(`/course/${course._id}`)}
                        style={{ width: '100%', padding: '9px', background: colors.primary, color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}>
                        ▶️ Continue Learning
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

export default Profile;