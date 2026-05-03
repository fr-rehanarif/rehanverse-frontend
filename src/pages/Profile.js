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
  const [isMobile, setIsMobile] = useState(false);

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
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 900);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
    padding: isMobile ? '13px 14px' : '14px 15px',
    marginBottom: '16px',
    borderRadius: '14px',
    fontSize: '16px',
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

  const tabButton = (tabName) => ({
    padding: isMobile ? '11px 12px' : '11px 18px',
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
    flex: isMobile ? '1 1 100%' : '0 0 auto',
    width: isMobile ? '100%' : 'auto',
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

      <main style={styles.page(isMobile)}>
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          style={{
            ...styles.heroCard(isMobile),
            background: theme.card,
            border: `1px solid ${theme.border}`,
            boxShadow: theme.shadow,
            backdropFilter: theme.glass,
            WebkitBackdropFilter: theme.glass,
            borderRadius: theme.radius,
          }}
        >
          <div style={styles.profileTop(isMobile)}>
            <div style={styles.avatarWrap(isMobile)}>
              {profile.photo ? (
                <img
                  src={profile.photo}
                  alt="profile"
                  style={{
                    ...styles.avatar(isMobile),
                    border: `3px solid ${theme.primary}`,
                    boxShadow: `0 0 26px ${theme.primary}45`,
                  }}
                />
              ) : (
                <div
                  style={{
                    ...styles.avatarFallback(isMobile),
                    background: theme.primary,
                    color: theme.buttonText,
                    boxShadow: `0 0 26px ${theme.primary}45`,
                  }}
                >
                  {profile.name?.charAt(0).toUpperCase() || 'U'}
                </div>
              )}

              <div style={styles.onlineDot(isMobile)} />
            </div>

            <div style={styles.profileInfo(isMobile)}>
              <p style={{ ...styles.kicker, color: theme.primary }}>👤 USER PROFILE</p>

              <h1 style={{ ...styles.name(isMobile), color: theme.text }}>
                {profile.name || 'User'}
              </h1>

              <p style={{ ...styles.email(isMobile), color: theme.muted }}>
                {profile.email}
              </p>

              <div style={styles.badgeRow(isMobile)}>
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
                ...styles.bioText(isMobile),
                color: theme.textSecondary,
                background: theme.isDark ? 'rgba(255,255,255,0.035)' : 'rgba(255,255,255,0.72)',
                border: `1px solid ${theme.border}`,
              }}
            >
              “{profile.bio}”
            </p>
          )}

          <div style={styles.statsGrid(isMobile)}>
            {[
              { icon: '📚', label: 'Courses', value: enrolledCount },
              { icon: '📅', label: 'Joined', value: getJoinedDate() },
              { icon: '📱', label: 'Phone', value: profile.phone || 'Not added' },
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  ...styles.statCard(isMobile),
                  background: theme.isDark ? 'rgba(255,255,255,0.035)' : 'rgba(255,255,255,0.72)',
                  border: `1px solid ${theme.border}`,
                }}
              >
                <span style={styles.statIcon(isMobile)}>{item.icon}</span>
                <div style={{ minWidth: 0 }}>
                  <p style={{ ...styles.statLabel, color: theme.muted }}>{item.label}</p>
                  <h3 style={{ ...styles.statValue(isMobile), color: theme.text }}>{item.value}</h3>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <div style={styles.tabs(isMobile)}>
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
              ...styles.msgBox(isMobile),
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
              ...styles.panel(isMobile),
              background: theme.card,
              border: `1px solid ${theme.border}`,
              boxShadow: theme.shadow,
              backdropFilter: theme.glass,
              WebkitBackdropFilter: theme.glass,
            }}
          >
            <div style={styles.panelHead(isMobile)}>
              <div>
                <h3 style={{ color: theme.text, margin: 0 }}>✏️ Edit Profile</h3>
                <p style={{ color: theme.muted, margin: '6px 0 0', fontSize: isMobile ? '13px' : '14px' }}>
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
            <div style={styles.photoUploadRow(isMobile)}>
              {form.photo ? (
                <img
                  src={form.photo}
                  alt="preview"
                  style={{
                    ...styles.previewAvatar(isMobile),
                    border: `2px solid ${theme.primary}`,
                  }}
                />
              ) : (
                <div
                  style={{
                    ...styles.previewFallback(isMobile),
                    background: theme.primary,
                    color: theme.buttonText,
                  }}
                >
                  {profile.name?.charAt(0).toUpperCase() || 'U'}
                </div>
              )}

              <label style={{ flex: 1, minWidth: isMobile ? '100%' : '220px', cursor: uploading ? 'not-allowed' : 'pointer' }}>
                <div
                  style={{
                    ...styles.uploadBox(isMobile),
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
                ...styles.primaryBtn(isMobile),
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
              ...styles.panel(isMobile),
              background: theme.card,
              border: `1px solid ${theme.border}`,
              boxShadow: theme.shadow,
              backdropFilter: theme.glass,
              WebkitBackdropFilter: theme.glass,
            }}
          >
            <div style={styles.panelHead(isMobile)}>
              <div>
                <h3 style={{ color: theme.text, margin: 0 }}>🔐 Change Password</h3>
                <p style={{ color: theme.muted, margin: '6px 0 0', fontSize: isMobile ? '13px' : '14px' }}>
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
                ...styles.securityNote(isMobile),
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
                ...styles.primaryBtn(isMobile),
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
                  ...styles.emptyBox(isMobile),
                  background: theme.card,
                  border: `1px solid ${theme.border}`,
                  boxShadow: theme.shadow,
                  color: theme.muted,
                }}
              >
                <p style={{ fontSize: isMobile ? '42px' : '54px', margin: '0 0 12px' }}>📭</p>
                <h3 style={{ color: theme.text, margin: '0 0 8px', fontSize: isMobile ? '21px' : '24px' }}>
                  Koi course enroll nahi!
                </h3>
                <p style={{ margin: '0 0 22px', lineHeight: 1.7, fontSize: isMobile ? '13px' : '14px' }}>
                  Start with free courses or preview premium courses.
                </p>

                <motion.button
                  whileHover={{ scale: 1.018, y: -1 }}
                  whileTap={{ scale: 0.985 }}
                  transition={{ duration: 0.16 }}
                  onClick={() => navigate('/courses')}
                  style={{
                    ...styles.secondaryActionBtn(isMobile),
                    background: theme.primary,
                    color: theme.buttonText,
                    border: 'none',
                  }}
                >
                  Browse Courses 🚀
                </motion.button>
              </div>
            ) : (
              <div style={styles.courseGrid(isMobile)}>
                {profile.enrolledCourses?.map((course) => (
                  <motion.div
                    key={course._id}
                    whileHover={{ y: -4 }}
                    transition={{ duration: 0.18, ease: 'easeOut' }}
                    style={{
                      ...styles.courseCard(isMobile),
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
                        style={styles.courseThumb(isMobile)}
                      />
                    ) : (
                      <div
                        style={{
                          ...styles.emptyThumb(isMobile),
                          background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent})`,
                        }}
                      >
                        🎓
                      </div>
                    )}

                    <div style={styles.courseBody(isMobile)}>
                      <div style={styles.enrolledBadge}>✅ Enrolled</div>

                      <h4 style={{ ...styles.courseTitleText(isMobile), color: theme.text }}>
                        {course.title}
                      </h4>

                      <motion.button
                        whileHover={{ scale: 1.018, y: -1 }}
                        whileTap={{ scale: 0.985 }}
                        transition={{ duration: 0.16 }}
                        onClick={() => navigate(`/course/${course._id}`)}
                        style={{
                          ...styles.continueBtn(isMobile),
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

  page: (isMobile) => ({
    maxWidth: '920px',
    margin: '0 auto',
    padding: isMobile ? '24px 14px 36px' : '40px 20px',
    position: 'relative',
    zIndex: 1,
    width: '100%',
  }),

  heroCard: (isMobile) => ({
    padding: isMobile ? '22px 16px' : '30px',
    marginBottom: '20px',
    width: '100%',
    overflow: 'hidden',
  }),

  profileTop: (isMobile) => ({
    display: 'flex',
    gap: isMobile ? '16px' : '22px',
    alignItems: isMobile ? 'flex-start' : 'center',
    flexWrap: 'wrap',
    flexDirection: isMobile ? 'column' : 'row',
    textAlign: isMobile ? 'center' : 'left',
  }),

  avatarWrap: (isMobile) => ({
    position: 'relative',
    width: isMobile ? '92px' : '112px',
    height: isMobile ? '92px' : '112px',
    flex: '0 0 auto',
    margin: isMobile ? '0 auto' : 0,
  }),

  avatar: (isMobile) => ({
    width: isMobile ? '92px' : '112px',
    height: isMobile ? '92px' : '112px',
    borderRadius: '50%',
    objectFit: 'cover',
  }),

  avatarFallback: (isMobile) => ({
    width: isMobile ? '92px' : '112px',
    height: isMobile ? '92px' : '112px',
    borderRadius: '50%',
    display: 'grid',
    placeItems: 'center',
    fontSize: isMobile ? '36px' : '44px',
    fontWeight: 950,
  }),

  onlineDot: (isMobile) => ({
    position: 'absolute',
    right: isMobile ? '5px' : '8px',
    bottom: isMobile ? '5px' : '8px',
    width: isMobile ? '16px' : '18px',
    height: isMobile ? '16px' : '18px',
    borderRadius: '50%',
    background: '#22c55e',
    border: '3px solid #0f172a',
  }),

  profileInfo: (isMobile) => ({
    flex: 1,
    minWidth: 0,
    width: isMobile ? '100%' : 'auto',
  }),

  kicker: {
    margin: '0 0 6px',
    fontWeight: 950,
    fontSize: '13px',
    letterSpacing: '0.5px',
  },

  name: (isMobile) => ({
    margin: '0 0 6px',
    fontSize: isMobile ? '28px' : 'clamp(28px, 4vw, 42px)',
    lineHeight: 1.1,
    fontWeight: 950,
    letterSpacing: '-0.8px',
    wordBreak: 'break-word',
  }),

  email: (isMobile) => ({
    margin: 0,
    fontWeight: 750,
    fontSize: isMobile ? '13px' : '15px',
    overflowWrap: 'anywhere',
  }),

  badgeRow: (isMobile) => ({
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
    marginTop: '14px',
    justifyContent: isMobile ? 'center' : 'flex-start',
  }),

  smallBadge: {
    padding: '8px 12px',
    borderRadius: '999px',
    fontSize: '12px',
    fontWeight: 950,
  },

  bioText: (isMobile) => ({
    padding: isMobile ? '13px 14px' : '14px 16px',
    borderRadius: '18px',
    margin: '20px 0 0',
    lineHeight: 1.7,
    fontWeight: 750,
    fontStyle: 'italic',
    fontSize: isMobile ? '13px' : '14px',
  }),

  statsGrid: (isMobile) => ({
    display: 'grid',
    gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(190px, 1fr))',
    gap: '14px',
    marginTop: '22px',
    width: '100%',
  }),

  statCard: (isMobile) => ({
    padding: isMobile ? '14px' : '16px',
    borderRadius: '18px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    width: '100%',
    overflow: 'hidden',
  }),

  statIcon: (isMobile) => ({
    width: isMobile ? '40px' : '44px',
    height: isMobile ? '40px' : '44px',
    borderRadius: '15px',
    display: 'grid',
    placeItems: 'center',
    background: 'rgba(167, 139, 250, 0.12)',
    fontSize: isMobile ? '20px' : '22px',
    flex: '0 0 auto',
  }),

  statLabel: {
    margin: '0 0 4px',
    fontSize: '12px',
    fontWeight: 900,
  },

  statValue: (isMobile) => ({
    margin: 0,
    fontSize: isMobile ? '15px' : '17px',
    fontWeight: 950,
    wordBreak: 'break-word',
    overflowWrap: 'anywhere',
    lineHeight: 1.25,
  }),

  tabs: (isMobile) => ({
    display: 'flex',
    gap: '10px',
    marginBottom: '20px',
    flexWrap: 'wrap',
    width: '100%',
  }),

  msgBox: (isMobile) => ({
    padding: isMobile ? '12px 14px' : '13px 16px',
    borderRadius: '16px',
    marginBottom: '20px',
    fontWeight: 900,
    fontSize: isMobile ? '13px' : '14px',
    lineHeight: 1.45,
  }),

  panel: (isMobile) => ({
    borderRadius: isMobile ? '20px' : '24px',
    padding: isMobile ? '20px 16px' : '30px',
    width: '100%',
    overflow: 'hidden',
  }),

  panelHead: (isMobile) => ({
    marginBottom: isMobile ? '18px' : '22px',
  }),

  photoUploadRow: (isMobile) => ({
    marginBottom: '18px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    flexWrap: 'wrap',
    flexDirection: isMobile ? 'column' : 'row',
  }),

  previewAvatar: (isMobile) => ({
    width: isMobile ? '64px' : '70px',
    height: isMobile ? '64px' : '70px',
    borderRadius: '50%',
    objectFit: 'cover',
  }),

  previewFallback: (isMobile) => ({
    width: isMobile ? '64px' : '70px',
    height: isMobile ? '64px' : '70px',
    borderRadius: '50%',
    display: 'grid',
    placeItems: 'center',
    fontSize: isMobile ? '24px' : '26px',
    fontWeight: 950,
  }),

  uploadBox: (isMobile) => ({
    padding: '14px 16px',
    borderRadius: '16px',
    textAlign: 'center',
    fontSize: isMobile ? '12.5px' : '13px',
    fontWeight: 900,
    width: '100%',
  }),

  primaryBtn: (isMobile) => ({
    width: '100%',
    padding: isMobile ? '13px' : '14px',
    border: 'none',
    borderRadius: '15px',
    fontSize: isMobile ? '15px' : '16px',
    fontWeight: 950,
  }),

  securityNote: (isMobile) => ({
    padding: '12px 14px',
    borderRadius: '16px',
    marginBottom: '18px',
    fontSize: isMobile ? '12.5px' : '13px',
    fontWeight: 800,
    lineHeight: 1.5,
  }),

  emptyBox: (isMobile) => ({
    padding: isMobile ? '30px 18px' : '44px 24px',
    borderRadius: isMobile ? '20px' : '24px',
    textAlign: 'center',
    fontWeight: 800,
  }),

  secondaryActionBtn: (isMobile) => ({
    width: isMobile ? '100%' : 'auto',
    padding: isMobile ? '13px 18px' : '13px 24px',
    borderRadius: '15px',
    cursor: 'pointer',
    fontWeight: 950,
    fontSize: isMobile ? '14px' : '15px',
  }),

  courseGrid: (isMobile) => ({
    display: 'grid',
    gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: isMobile ? '16px' : '18px',
    width: '100%',
  }),

  courseCard: (isMobile) => ({
    borderRadius: isMobile ? '20px' : '24px',
    overflow: 'hidden',
    width: '100%',
  }),

  courseThumb: (isMobile) => ({
    width: '100%',
    height: isMobile ? '170px' : '150px',
    objectFit: 'cover',
    display: 'block',
  }),

  emptyThumb: (isMobile) => ({
    width: '100%',
    height: isMobile ? '170px' : '150px',
    display: 'grid',
    placeItems: 'center',
    fontSize: isMobile ? '38px' : '42px',
  }),

  courseBody: (isMobile) => ({
    padding: isMobile ? '16px' : '18px',
  }),

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

  courseTitleText: (isMobile) => ({
    margin: '0 0 14px',
    fontSize: isMobile ? '15px' : '16px',
    lineHeight: 1.35,
    fontWeight: 950,
    minHeight: isMobile ? 'auto' : '44px',
    wordBreak: 'normal',
    overflowWrap: 'break-word',
  }),

  continueBtn: (isMobile) => ({
    width: '100%',
    padding: isMobile ? '12px' : '12px',
    border: 'none',
    borderRadius: '14px',
    cursor: 'pointer',
    fontSize: isMobile ? '13.5px' : '14px',
    fontWeight: 950,
  }),
};

export default Profile;