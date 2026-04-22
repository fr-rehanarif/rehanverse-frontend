import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';
import API from '../api';

const IMGBB_KEY = 'be84806d0aaa75b350df6e02185b1f8f';

function Profile() {
  const theme = useTheme();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const [profile, setProfile] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [msg, setMsg] = useState('');
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    bio: '',
    photo: '',
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await axios.get(`${API}/api/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setProfile(res.data);
      setForm({
        name: res.data.name || '',
        phone: res.data.phone || '',
        bio: res.data.bio || '',
        photo: res.data.photo || '',
      });
    } catch (err) {
      navigate('/login');
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setMsg('⏳ Photo upload ho rahi hai...');

    try {
      const formData = new FormData();
      formData.append('image', file);

      const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_KEY}`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        setForm((prev) => ({ ...prev, photo: data.data.url }));
        setMsg('✅ Photo upload ho gayi!');
      } else {
        setMsg('❌ Photo upload failed!');
      }
    } catch (err) {
      setMsg('❌ Upload error!');
    }

    setUploading(false);
    setTimeout(() => setMsg(''), 3000);
  };

  const handleUpdate = async () => {
    try {
      const res = await axios.put(`${API}/api/users/me`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMsg('✅ Profile updated!');

      const currentUser = JSON.parse(localStorage.getItem('user'));
      localStorage.setItem('user', JSON.stringify({ ...currentUser, ...res.data.user }));

      fetchProfile();
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      setMsg('❌ ' + (err.response?.data?.message || 'Error!'));
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
      await axios.put(
        `${API}/api/users/me`,
        {
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setMsg('✅ Password changed!');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      setMsg('❌ ' + (err.response?.data?.message || 'Error!'));
    }
  };

  if (!profile) {
    return (
      <div
        style={{
          background: theme.bg,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <p style={{ color: theme.muted }}>⏳ Loading...</p>
      </div>
    );
  }

  const inputStyle = {
    width: '100%',
    padding: '12px',
    marginBottom: '16px',
    borderRadius: '12px',
    fontSize: '14px',
    outline: 'none',
    background: theme.bgSecondary,
    color: theme.text,
    border: `1px solid ${theme.border}`,
    boxSizing: 'border-box',
  };

  const tabButton = (tabName, label) => ({
    padding: '10px 24px',
    borderRadius: '10px',
    border: `1px solid ${activeTab === tabName ? theme.primary : theme.border}`,
    cursor: 'pointer',
    fontWeight: '600',
    background: activeTab === tabName ? theme.primary : theme.card,
    color: activeTab === tabName ? theme.buttonText : theme.text,
    boxShadow: activeTab === tabName ? theme.shadow : 'none',
  });

  return (
    <div
      style={{
        background: theme.bg,
        minHeight: '100vh',
        padding: '40px 20px',
        transition: 'all 0.3s ease',
      }}
    >
      <div style={{ maxWidth: '760px', margin: '0 auto' }}>
        <div
          style={{
            background: theme.card,
            border: `1px solid ${theme.border}`,
            borderRadius: '20px',
            padding: '32px',
            marginBottom: '24px',
            textAlign: 'center',
            boxShadow: theme.shadow,
            backdropFilter: theme.glass,
          }}
        >
          <div style={{ marginBottom: '16px' }}>
            {profile.photo ? (
              <img
                src={profile.photo}
                alt="profile"
                style={{
                  width: '100px',
                  height: '100px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: `3px solid ${theme.primary}`,
                }}
              />
            ) : (
              <div
                style={{
                  width: '100px',
                  height: '100px',
                  borderRadius: '50%',
                  background: theme.primary,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto',
                  fontSize: '40px',
                  color: theme.buttonText,
                }}
              >
                {profile.name?.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          <h2 style={{ color: theme.text, marginBottom: '4px' }}>{profile.name}</h2>
          <p style={{ color: theme.muted, fontSize: '14px', marginBottom: '8px' }}>
            {profile.email}
          </p>
          {profile.phone && (
            <p style={{ color: theme.muted, fontSize: '13px' }}>📱 {profile.phone}</p>
          )}
          {profile.bio && (
            <p
              style={{
                color: theme.muted,
                fontSize: '13px',
                marginTop: '8px',
                fontStyle: 'italic',
              }}
            >
              "{profile.bio}"
            </p>
          )}

          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '24px',
              marginTop: '16px',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <p
                style={{
                  color: theme.primary,
                  fontWeight: '700',
                  fontSize: '20px',
                  margin: 0,
                }}
              >
                {profile.enrolledCourses?.length || 0}
              </p>
              <p style={{ color: theme.muted, fontSize: '12px' }}>Courses</p>
            </div>

            <div style={{ textAlign: 'center' }}>
              <p
                style={{
                  color: theme.primary,
                  fontWeight: '700',
                  fontSize: '20px',
                  margin: 0,
                }}
              >
                {new Date(profile.createdAt).toLocaleDateString('en-IN', {
                  month: 'short',
                  year: 'numeric',
                })}
              </p>
              <p style={{ color: theme.muted, fontSize: '12px' }}>Joined</p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <button onClick={() => setActiveTab('profile')} style={tabButton('profile')}>
            ✏️ Edit Profile
          </button>
          <button onClick={() => setActiveTab('password')} style={tabButton('password')}>
            🔐 Password
          </button>
          <button onClick={() => setActiveTab('courses')} style={tabButton('courses')}>
            📚 My Courses
          </button>
        </div>

        {msg && (
          <div
            style={{
              padding: '12px 20px',
              borderRadius: '12px',
              marginBottom: '20px',
              background: msg.includes('✅')
                ? theme.mode === 'dark'
                  ? 'rgba(34, 197, 94, 0.15)'
                  : '#d1fae5'
                : msg.includes('⏳')
                ? theme.mode === 'dark'
                  ? 'rgba(59, 130, 246, 0.15)'
                  : '#eff6ff'
                : theme.mode === 'dark'
                ? 'rgba(239, 68, 68, 0.15)'
                : '#fee2e2',
              color: msg.includes('✅')
                ? theme.mode === 'dark'
                  ? '#86efac'
                  : '#065f46'
                : msg.includes('⏳')
                ? theme.mode === 'dark'
                  ? '#93c5fd'
                  : '#1d4ed8'
                : theme.mode === 'dark'
                ? '#fca5a5'
                : '#991b1b',
              border: `1px solid ${
                msg.includes('✅')
                  ? theme.mode === 'dark'
                    ? 'rgba(34, 197, 94, 0.25)'
                    : '#a7f3d0'
                  : msg.includes('⏳')
                  ? theme.mode === 'dark'
                    ? 'rgba(59, 130, 246, 0.25)'
                    : '#bfdbfe'
                  : theme.mode === 'dark'
                  ? 'rgba(239, 68, 68, 0.25)'
                  : '#fecaca'
              }`,
            }}
          >
            {msg}
          </div>
        )}

        {activeTab === 'profile' && (
          <div
            style={{
              background: theme.card,
              border: `1px solid ${theme.border}`,
              borderRadius: '16px',
              padding: '32px',
              boxShadow: theme.shadow,
              backdropFilter: theme.glass,
            }}
          >
            <h3 style={{ color: theme.text, marginBottom: '20px' }}>✏️ Profile Edit Karo</h3>

            <label style={{ color: theme.muted, fontSize: '13px' }}>Full Name</label>
            <input
              style={inputStyle}
              placeholder="Full Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />

            <label style={{ color: theme.muted, fontSize: '13px' }}>Phone Number</label>
            <input
              style={inputStyle}
              placeholder="Phone Number (e.g. +91 9876543210)"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />

            <label style={{ color: theme.muted, fontSize: '13px' }}>Bio</label>
            <textarea
              style={{ ...inputStyle, height: '80px', resize: 'vertical' }}
              placeholder="Apne baare mein kuch likho..."
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
            />

            <label style={{ color: theme.muted, fontSize: '13px' }}>Profile Photo</label>
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                {form.photo ? (
                  <img
                    src={form.photo}
                    alt="preview"
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: `2px solid ${theme.primary}`,
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '50%',
                      background: theme.primary,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: theme.buttonText,
                      fontSize: '24px',
                    }}
                  >
                    {profile.name?.charAt(0).toUpperCase()}
                  </div>
                )}

                <label style={{ cursor: 'pointer', flex: 1, minWidth: '220px' }}>
                  <div
                    style={{
                      padding: '12px 16px',
                      background: theme.bgSecondary,
                      border: `2px dashed ${theme.border}`,
                      borderRadius: '12px',
                      textAlign: 'center',
                      color: theme.muted,
                      fontSize: '13px',
                    }}
                  >
                    {uploading ? '⏳ Uploading...' : '📷 Device se photo choose karo'}
                  </div>

                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    style={{ display: 'none' }}
                    disabled={uploading}
                  />
                </label>
              </div>
            </div>

            <button
              onClick={handleUpdate}
              disabled={uploading}
              style={{
                width: '100%',
                padding: '14px',
                background: theme.primary,
                color: theme.buttonText,
                border: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                cursor: 'pointer',
                fontWeight: '600',
                opacity: uploading ? 0.7 : 1,
                boxShadow: theme.shadow,
              }}
            >
              💾 Save Changes
            </button>
          </div>
        )}

        {activeTab === 'password' && (
          <div
            style={{
              background: theme.card,
              border: `1px solid ${theme.border}`,
              borderRadius: '16px',
              padding: '32px',
              boxShadow: theme.shadow,
              backdropFilter: theme.glass,
            }}
          >
            <h3 style={{ color: theme.text, marginBottom: '20px' }}>🔐 Password Change Karo</h3>

            <label style={{ color: theme.muted, fontSize: '13px' }}>Current Password</label>
            <input
              style={inputStyle}
              type="password"
              placeholder="Current Password"
              value={passwordForm.currentPassword}
              onChange={(e) =>
                setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
              }
            />

            <label style={{ color: theme.muted, fontSize: '13px' }}>New Password</label>
            <input
              style={inputStyle}
              type="password"
              placeholder="New Password"
              value={passwordForm.newPassword}
              onChange={(e) =>
                setPasswordForm({ ...passwordForm, newPassword: e.target.value })
              }
            />

            <label style={{ color: theme.muted, fontSize: '13px' }}>Confirm New Password</label>
            <input
              style={inputStyle}
              type="password"
              placeholder="Confirm New Password"
              value={passwordForm.confirmPassword}
              onChange={(e) =>
                setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
              }
            />

            <button
              onClick={handlePasswordChange}
              style={{
                width: '100%',
                padding: '14px',
                background: theme.success,
                color: theme.buttonText,
                border: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                cursor: 'pointer',
                fontWeight: '600',
                boxShadow: theme.shadow,
              }}
            >
              🔐 Password Change Karo
            </button>
          </div>
        )}

        {activeTab === 'courses' && (
          <div>
            {profile.enrolledCourses?.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 0' }}>
                <p style={{ fontSize: '48px' }}>📭</p>
                <p style={{ color: theme.muted, fontSize: '18px' }}>Koi course enroll nahi!</p>
                <button
                  onClick={() => navigate('/courses')}
                  style={{
                    marginTop: '16px',
                    padding: '12px 28px',
                    background: theme.primary,
                    color: theme.buttonText,
                    border: 'none',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    boxShadow: theme.shadow,
                  }}
                >
                  Courses Dekho
                </button>
              </div>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                  gap: '16px',
                }}
              >
                {profile.enrolledCourses?.map((course) => (
                  <div
                    key={course._id}
                    style={{
                      background: theme.card,
                      border: `1px solid ${theme.border}`,
                      borderRadius: '16px',
                      overflow: 'hidden',
                      boxShadow: theme.shadow,
                      backdropFilter: theme.glass,
                    }}
                  >
                    {course.thumbnail ? (
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        style={{ width: '100%', height: '140px', objectFit: 'cover' }}
                      />
                    ) : (
                      <div
                        style={{
                          width: '100%',
                          height: '140px',
                          background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent})`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <span style={{ fontSize: '36px' }}>🎓</span>
                      </div>
                    )}

                    <div style={{ padding: '16px' }}>
                      <h4
                        style={{
                          color: theme.text,
                          marginBottom: '12px',
                          fontSize: '15px',
                          marginTop: 0,
                        }}
                      >
                        {course.title}
                      </h4>

                      <button
                        onClick={() => navigate(`/course/${course._id}`)}
                        style={{
                          width: '100%',
                          padding: '10px',
                          background: theme.primary,
                          color: theme.buttonText,
                          border: 'none',
                          borderRadius: '12px',
                          cursor: 'pointer',
                          fontSize: '13px',
                          fontWeight: '600',
                          boxShadow: theme.shadow,
                        }}
                      >
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