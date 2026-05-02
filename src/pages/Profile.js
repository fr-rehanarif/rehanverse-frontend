import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';
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
    // eslint-disable-next-line
  }, [token, navigate]);

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
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setMsg('❌ Please fill all password fields.');
      return;
    }

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

  const getJoinedDate = () => {
    if (!profile?.createdAt) return 'New';
    return new Date(profile.createdAt).toLocaleDateString('en-IN', {
      month: 'short',
      year: 'numeric',
    });
  };

  const enrolledCount = profile?.enrolledCourses?.length || 0;

  const inputStyle = {
    width: '100%',
    padding: '14px 15px',
    marginBottom: '16px',
    borderRadius: '14px',
    fontSize: '15px',
    outline: 'none',
    background: theme.isDark ? 'rgba(15, 23, 42, 0.72)' : 'rgba(255,255,255,0.82)',
    color: theme.text,
    border: `1px solid ${theme.border}`,
    boxSizing: 'border-box',
    fontWeight: '700',
  };

  const labelStyle = {
    color: theme.textSecondary,
    fontSize: '13px',
    fontWeight: '900',
    display: 'block',
    marginBottom: '8px',
  };

  const tabButton = (tabName, label) => ({
    padding: '11px 18px',
    borderRadius: '15px',
    border: `1px solid ${activeTab === tabName ? theme.primary : theme.border}`,
    cursor: 'pointer',
    fontWeight: '900',
    background:
      activeTab === tabName
        ? theme.primary
        : theme.isDark
        ? 'rgba(255,255,255,0.035)'
        : 'rgba(255,255,255,0.72)',
    color: activeTab === tabName ? theme.buttonText : theme.text,
    boxShadow: activeTab === tabName ? `0 0 18px ${theme.primary}35` : 'none',
  });

  if (!profile) {
    return (
      <div
        style={{
          background: theme.bg,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: theme.text,
        }}
      >
        <p style={{ color: theme.muted, fontWeight: 900 }}>⏳ Loading profile...</p>
      </div>
    );
  }

  return (
    <div
      style={{
        background: theme.bg,
        minHeight: '100vh',
        color: theme.text,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={styles.bgGrid} />
      <div style={styles.glowOne} />
      <div style={styles.glowTwo} />

      <main style={styles.page}>
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          style={{
            ...styles.heroCard,
            background: theme.card,
            border: `1px solid ${theme.border}`,
            boxShadow: theme.shadow,
            backdropFilter: theme.glass,
            WebkitBackdropFilter: theme.glass,
            borderRadius: theme.radius,
          }}
        >
          <div style={styles.profileTop}>
            <div style={styles.avatarWrap}>
              {profile.photo ? (
                <img
                  src={profile.photo}
                  alt="profile"
                  style={{
                    ...styles.avatar,
                    border: `3px solid ${theme.primary}`,
                    boxShadow: `0 0 26px ${theme.primary}45`,
                  }}
                />
              ) : (
                <div
                  style={{
                    ...styles.avatarFallback,
                    background: theme.primary,
                    color: theme.buttonText,
                    boxShadow: `0 0 26px ${theme.primary}45`,
                  }}
                >
                  {profile.name?.charAt(0).toUpperCase() || 'U'}
                </div>
              )}

              <div style={styles.onlineDot} />
            </div>

            <div style={styles.profileInfo}>
              <p style={{ ...styles.kicker, color: theme.primary }}>👤 USER PROFILE</p>

              <h1 style={{ ...styles.name, color: theme.text }}>
                {profile.name || 'User'}
              </h1>

              <p style={{ ...styles.email, color: theme.muted }}>
                {profile.email}
              </p>

              <div style={styles.badgeRow}>
                <span
                  style={{
                    ...styles.smallBadge,
                    background: theme.isDark ? 'rgba(34,197,94,0.12)' : '#dcfce7',
                    color: theme.isDark ? '#86efac' : '#166534',
                    border: theme.isDark
                      ? '1px solid rgba(34,197,94,0.25)'
                      : '1px solid #bbf7d0',
                  }}
                >
                  ✅ Active Learner
                </span>

                {profile.role && (
                  <span
                    style={{
                      ...styles.smallBadge,
                      background: theme.isDark ? 'rgba(139,92,246,0.12)' : 'rgba(237,233,254,0.85)',
                      color: theme.primary,
                      border: `1px solid ${theme.border}`,
                    }}
                  >
                    {profile.role === 'admin' ? '⚙️ Admin' : '🎓 Student'}
                  </span>
                )}
              </div>
            </div>
          </div>

          {profile.bio && (
            <p
              style={{
                ...styles.bioText,
                color: theme.textSecondary,
                background: theme.isDark ? 'rgba(255,255,255,0.035)' : 'rgba(255,255,255,0.72)',
                border: `1px solid ${theme.border}`,
              }}
            >
              “{profile.bio}”
            </p>
          )}

          <div style={styles.statsGrid}>
            {[
              { icon: '📚', label: 'Courses', value: enrolledCount },
              { icon: '📅', label: 'Joined', value: getJoinedDate() },
              { icon: '📱', label: 'Phone', value: profile.phone || 'Not added' },
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  ...styles.statCard,
                  background: theme.isDark ? 'rgba(255,255,255,0.035)' : 'rgba(255,255,255,0.72)',
                  border: `1px solid ${theme.border}`,
                }}
              >
                <span style={styles.statIcon}>{item.icon}</span>
                <div>
                  <p style={{ ...styles.statLabel, color: theme.muted }}>{item.label}</p>
                  <h3 style={{ ...styles.statValue, color: theme.text }}>{item.value}</h3>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <div style={styles.tabs}>
          <motion.button
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.985 }}
            transition={{ duration: 0.16 }}
            onClick={() => setActiveTab('profile')}
            style={tabButton('profile')}
          >
            ✏️ Edit Profile
          </motion.button>

          <motion.button
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.985 }}
            transition={{ duration: 0.16 }}
            onClick={() => setActiveTab('password')}
            style={tabButton('password')}
          >
            🔐 Password
          </motion.button>

          <motion.button
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.985 }}
            transition={{ duration: 0.16 }}
            onClick={() => setActiveTab('courses')}
            style={tabButton('courses')}
          >
            📚 My Courses
          </motion.button>
        </div>

        {msg && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              ...styles.msgBox,
              background: msg.includes('✅')
                ? theme.isDark
                  ? 'rgba(34, 197, 94, 0.15)'
                  : '#d1fae5'
                : msg.includes('⏳')
                ? theme.isDark
                  ? 'rgba(59, 130, 246, 0.15)'
                  : '#eff6ff'
                : theme.isDark
                ? 'rgba(239, 68, 68, 0.15)'
                : '#fee2e2',
              color: msg.includes('✅')
                ? theme.isDark
                  ? '#86efac'
                  : '#065f46'
                : msg.includes('⏳')
                ? theme.isDark
                  ? '#93c5fd'
                  : '#1d4ed8'
                : theme.isDark
                ? '#fca5a5'
                : '#991b1b',
              border: `1px solid ${
                msg.includes('✅')
                  ? theme.isDark
                    ? 'rgba(34, 197, 94, 0.25)'
                    : '#a7f3d0'
                  : msg.includes('⏳')
                  ? theme.isDark
                    ? 'rgba(59, 130, 246, 0.25)'
                    : '#bfdbfe'
                  : theme.isDark
                  ? 'rgba(239, 68, 68, 0.25)'
                  : '#fecaca'
              }`,
            }}
          >
            {msg}
          </motion.div>
        )}

        {activeTab === 'profile' && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
            style={{
              ...styles.panel,
              background: theme.card,
              border: `1px solid ${theme.border}`,
              boxShadow: theme.shadow,
              backdropFilter: theme.glass,
              WebkitBackdropFilter: theme.glass,
            }}
          >
            <div style={styles.panelHead}>
              <div>
                <h3 style={{ color: theme.text, margin: 0 }}>✏️ Edit Profile</h3>
                <p style={{ color: theme.muted, margin: '6px 0 0', fontSize: '14px' }}>
                  Apni profile details update karo.
                </p>
              </div>
            </div>

            <label style={labelStyle}>Full Name</label>
            <input
              style={inputStyle}
              placeholder="Full Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />

            <label style={labelStyle}>Phone Number</label>
            <input
              style={inputStyle}
              placeholder="Phone Number (e.g. +91 9876543210)"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />

            <label style={labelStyle}>Bio</label>
            <textarea
              style={{ ...inputStyle, height: '96px', resize: 'vertical' }}
              placeholder="Apne baare mein kuch likho..."
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
            />

            <label style={labelStyle}>Profile Photo</label>
            <div style={styles.photoUploadRow}>
              {form.photo ? (
                <img
                  src={form.photo}
                  alt="preview"
                  style={{
                    ...styles.previewAvatar,
                    border: `2px solid ${theme.primary}`,
                  }}
                />
              ) : (
                <div
                  style={{
                    ...styles.previewFallback,
                    background: theme.primary,
                    color: theme.buttonText,
                  }}
                >
                  {profile.name?.charAt(0).toUpperCase() || 'U'}
                </div>
              )}

              <label style={{ flex: 1, minWidth: '220px', cursor: uploading ? 'not-allowed' : 'pointer' }}>
                <div
                  style={{
                    ...styles.uploadBox,
                    background: theme.isDark ? 'rgba(15, 23, 42, 0.72)' : 'rgba(255,255,255,0.82)',
                    border: `2px dashed ${theme.border}`,
                    color: theme.muted,
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

            <motion.button
              whileHover={{ scale: 1.018, y: -1 }}
              whileTap={{ scale: 0.985 }}
              transition={{ duration: 0.16 }}
              onClick={handleUpdate}
              disabled={uploading}
              style={{
                ...styles.primaryBtn,
                background: uploading ? theme.muted : theme.primary,
                color: theme.buttonText,
                boxShadow: `0 0 20px ${theme.primary}35`,
                cursor: uploading ? 'not-allowed' : 'pointer',
                opacity: uploading ? 0.75 : 1,
              }}
            >
              💾 Save Changes
            </motion.button>
          </motion.div>
        )}

        {activeTab === 'password' && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
            style={{
              ...styles.panel,
              background: theme.card,
              border: `1px solid ${theme.border}`,
              boxShadow: theme.shadow,
              backdropFilter: theme.glass,
              WebkitBackdropFilter: theme.glass,
            }}
          >
            <div style={styles.panelHead}>
              <div>
                <h3 style={{ color: theme.text, margin: 0 }}>🔐 Change Password</h3>
                <p style={{ color: theme.muted, margin: '6px 0 0', fontSize: '14px' }}>
                  Strong password rakho, account safe rahega.
                </p>
              </div>
            </div>

            <label style={labelStyle}>Current Password</label>
            <input
              style={inputStyle}
              type="password"
              placeholder="Current Password"
              value={passwordForm.currentPassword}
              onChange={(e) =>
                setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
              }
            />

            <label style={labelStyle}>New Password</label>
            <input
              style={inputStyle}
              type="password"
              placeholder="New Password"
              value={passwordForm.newPassword}
              onChange={(e) =>
                setPasswordForm({ ...passwordForm, newPassword: e.target.value })
              }
            />

            <label style={labelStyle}>Confirm New Password</label>
            <input
              style={inputStyle}
              type="password"
              placeholder="Confirm New Password"
              value={passwordForm.confirmPassword}
              onChange={(e) =>
                setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
              }
            />

            <div
              style={{
                ...styles.securityNote,
                background: theme.isDark ? 'rgba(255,255,255,0.035)' : 'rgba(255,255,255,0.72)',
                border: `1px solid ${theme.border}`,
                color: theme.muted,
              }}
            >
              🛡️ Password minimum 6 characters ka hona chahiye.
            </div>

            <motion.button
              whileHover={{ scale: 1.018, y: -1 }}
              whileTap={{ scale: 0.985 }}
              transition={{ duration: 0.16 }}
              onClick={handlePasswordChange}
              style={{
                ...styles.primaryBtn,
                background: theme.success,
                color: theme.buttonText,
                boxShadow: '0 0 20px rgba(34,197,94,0.30)',
              }}
            >
              🔐 Change Password
            </motion.button>
          </motion.div>
        )}

        {activeTab === 'courses' && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
          >
            {profile.enrolledCourses?.length === 0 ? (
              <div
                style={{
                  ...styles.emptyBox,
                  background: theme.card,
                  border: `1px solid ${theme.border}`,
                  boxShadow: theme.shadow,
                  color: theme.muted,
                }}
              >
                <p style={{ fontSize: '54px', margin: '0 0 12px' }}>📭</p>
                <h3 style={{ color: theme.text, margin: '0 0 8px', fontSize: '24px' }}>
                  Koi course enroll nahi!
                </h3>
                <p style={{ margin: '0 0 22px', lineHeight: 1.7 }}>
                  Start with free courses or preview premium courses.
                </p>

                <motion.button
                  whileHover={{ scale: 1.018, y: -1 }}
                  whileTap={{ scale: 0.985 }}
                  transition={{ duration: 0.16 }}
                  onClick={() => navigate('/courses')}
                  style={{
                    ...styles.secondaryActionBtn,
                    background: theme.primary,
                    color: theme.buttonText,
                    border: 'none',
                  }}
                >
                  Browse Courses 🚀
                </motion.button>
              </div>
            ) : (
              <div style={styles.courseGrid}>
                {profile.enrolledCourses?.map((course) => (
                  <motion.div
                    key={course._id}
                    whileHover={{ y: -4 }}
                    transition={{ duration: 0.18, ease: 'easeOut' }}
                    style={{
                      ...styles.courseCard,
                      background: theme.card,
                      border: `1px solid ${theme.border}`,
                      boxShadow: theme.shadow,
                      backdropFilter: theme.glass,
                      WebkitBackdropFilter: theme.glass,
                    }}
                  >
                    {course.thumbnail ? (
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        style={styles.courseThumb}
                      />
                    ) : (
                      <div
                        style={{
                          ...styles.emptyThumb,
                          background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent})`,
                        }}
                      >
                        🎓
                      </div>
                    )}

                    <div style={styles.courseBody}>
                      <div style={styles.enrolledBadge}>✅ Enrolled</div>

                      <h4 style={{ ...styles.courseTitleText, color: theme.text }}>
                        {course.title}
                      </h4>

                      <motion.button
                        whileHover={{ scale: 1.018, y: -1 }}
                        whileTap={{ scale: 0.985 }}
                        transition={{ duration: 0.16 }}
                        onClick={() => navigate(`/course/${course._id}`)}
                        style={{
                          ...styles.continueBtn,
                          background: theme.primary,
                          color: theme.buttonText,
                          boxShadow: `0 0 18px ${theme.primary}35`,
                        }}
                      >
                        ▶️ Continue Learning
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </main>
    </div>
  );
}

const styles = {
  bgGrid: {
    position: 'absolute',
    inset: 0,
    backgroundImage:
      'linear-gradient(rgba(167,139,250,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(167,139,250,0.035) 1px, transparent 1px)',
    backgroundSize: '44px 44px',
    maskImage: 'linear-gradient(to bottom, black, transparent 88%)',
    pointerEvents: 'none',
    zIndex: 0,
  },
  glowOne: {
    position: 'absolute',
    top: '90px',
    left: '-130px',
    width: '300px',
    height: '300px',
    borderRadius: '50%',
    background: 'rgba(124, 58, 237, 0.18)',
    filter: 'blur(95px)',
    zIndex: 0,
    pointerEvents: 'none',
  },
  glowTwo: {
    position: 'absolute',
    top: '620px',
    right: '-140px',
    width: '340px',
    height: '340px',
    borderRadius: '50%',
    background: 'rgba(59, 130, 246, 0.14)',
    filter: 'blur(100px)',
    zIndex: 0,
    pointerEvents: 'none',
  },
  page: {
    maxWidth: '920px',
    margin: '0 auto',
    padding: '40px 20px',
    position: 'relative',
    zIndex: 1,
  },
  heroCard: {
    padding: '30px',
    marginBottom: '20px',
  },
  profileTop: {
    display: 'flex',
    gap: '22px',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  avatarWrap: {
    position: 'relative',
    width: '112px',
    height: '112px',
    flex: '0 0 auto',
  },
  avatar: {
    width: '112px',
    height: '112px',
    borderRadius: '50%',
    objectFit: 'cover',
  },
  avatarFallback: {
    width: '112px',
    height: '112px',
    borderRadius: '50%',
    display: 'grid',
    placeItems: 'center',
    fontSize: '44px',
    fontWeight: 950,
  },
  onlineDot: {
    position: 'absolute',
    right: '8px',
    bottom: '8px',
    width: '18px',
    height: '18px',
    borderRadius: '50%',
    background: '#22c55e',
    border: '3px solid #0f172a',
  },
  profileInfo: {
    flex: 1,
    minWidth: '220px',
  },
  kicker: {
    margin: '0 0 6px',
    fontWeight: 950,
    fontSize: '13px',
    letterSpacing: '0.5px',
  },
  name: {
    margin: '0 0 6px',
    fontSize: 'clamp(28px, 4vw, 42px)',
    lineHeight: 1.1,
    fontWeight: 950,
    letterSpacing: '-0.8px',
  },
  email: {
    margin: 0,
    fontWeight: 750,
  },
  badgeRow: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
    marginTop: '14px',
  },
  smallBadge: {
    padding: '8px 12px',
    borderRadius: '999px',
    fontSize: '12px',
    fontWeight: 950,
  },
  bioText: {
    padding: '14px 16px',
    borderRadius: '18px',
    margin: '20px 0 0',
    lineHeight: 1.7,
    fontWeight: 750,
    fontStyle: 'italic',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
    gap: '14px',
    marginTop: '22px',
  },
  statCard: {
    padding: '16px',
    borderRadius: '18px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  statIcon: {
    width: '44px',
    height: '44px',
    borderRadius: '15px',
    display: 'grid',
    placeItems: 'center',
    background: 'rgba(167, 139, 250, 0.12)',
    fontSize: '22px',
    flex: '0 0 auto',
  },
  statLabel: {
    margin: '0 0 4px',
    fontSize: '12px',
    fontWeight: 900,
  },
  statValue: {
    margin: 0,
    fontSize: '17px',
    fontWeight: 950,
    wordBreak: 'break-word',
  },
  tabs: {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px',
    flexWrap: 'wrap',
  },
  msgBox: {
    padding: '13px 16px',
    borderRadius: '16px',
    marginBottom: '20px',
    fontWeight: 900,
  },
  panel: {
    borderRadius: '24px',
    padding: '30px',
  },
  panelHead: {
    marginBottom: '22px',
  },
  photoUploadRow: {
    marginBottom: '18px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    flexWrap: 'wrap',
  },
  previewAvatar: {
    width: '70px',
    height: '70px',
    borderRadius: '50%',
    objectFit: 'cover',
  },
  previewFallback: {
    width: '70px',
    height: '70px',
    borderRadius: '50%',
    display: 'grid',
    placeItems: 'center',
    fontSize: '26px',
    fontWeight: 950,
  },
  uploadBox: {
    padding: '14px 16px',
    borderRadius: '16px',
    textAlign: 'center',
    fontSize: '13px',
    fontWeight: 900,
  },
  primaryBtn: {
    width: '100%',
    padding: '14px',
    border: 'none',
    borderRadius: '15px',
    fontSize: '16px',
    fontWeight: 950,
  },
  securityNote: {
    padding: '12px 14px',
    borderRadius: '16px',
    marginBottom: '18px',
    fontSize: '13px',
    fontWeight: 800,
  },
  emptyBox: {
    padding: '44px 24px',
    borderRadius: '24px',
    textAlign: 'center',
    fontWeight: 800,
  },
  secondaryActionBtn: {
    padding: '13px 24px',
    borderRadius: '15px',
    cursor: 'pointer',
    fontWeight: 950,
    fontSize: '15px',
  },
  courseGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '18px',
  },
  courseCard: {
    borderRadius: '24px',
    overflow: 'hidden',
  },
  courseThumb: {
    width: '100%',
    height: '150px',
    objectFit: 'cover',
    display: 'block',
  },
  emptyThumb: {
    width: '100%',
    height: '150px',
    display: 'grid',
    placeItems: 'center',
    fontSize: '42px',
  },
  courseBody: {
    padding: '18px',
  },
  enrolledBadge: {
    width: 'fit-content',
    padding: '7px 10px',
    borderRadius: '999px',
    background: 'rgba(34,197,94,0.14)',
    color: '#86efac',
    border: '1px solid rgba(34,197,94,0.25)',
    fontSize: '12px',
    fontWeight: 950,
    marginBottom: '12px',
  },
  courseTitleText: {
    margin: '0 0 14px',
    fontSize: '16px',
    lineHeight: 1.35,
    fontWeight: 950,
    minHeight: '44px',
  },
  continueBtn: {
    width: '100%',
    padding: '12px',
    border: 'none',
    borderRadius: '14px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 950,
  },
};

export default Profile;