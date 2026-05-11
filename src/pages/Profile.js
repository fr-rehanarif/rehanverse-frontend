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

  const safeTheme = {
    bg: theme?.bg || '#050816',
    text: theme?.text || '#ffffff',
    textSecondary: theme?.textSecondary || '#cbd5e1',
    muted: theme?.muted || '#94a3b8',
    card: theme?.card || 'rgba(15,23,42,0.82)',
    border: theme?.border || 'rgba(148,163,184,0.22)',
    shadow: theme?.shadow || '0 18px 50px rgba(0,0,0,0.35)',
    shadowHover: theme?.shadowHover || '0 22px 70px rgba(0,0,0,0.45)',
    glass: theme?.glass || 'blur(18px)',
    radius: theme?.radius || '26px',
    primary: theme?.primary || '#8b5cf6',
    accent: theme?.accent || '#3b82f6',
    buttonText: theme?.buttonText || '#ffffff',
    success: theme?.success || '#22c55e',
    danger: theme?.danger || '#ef4444',
    isDark: theme?.isDark !== false,
  };

  const [profile, setProfile] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [msg, setMsg] = useState('');
  const [uploading, setUploading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [copying, setCopying] = useState(false);

  const [form, setForm] = useState({
    name: '',
    phone: '',
    bio: '',
    photo: '',
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

      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.setItem(
        'user',
        JSON.stringify({
          ...currentUser,
          ...(res.data.user || {}),
          name: form.name,
          photo: form.photo,
        })
      );

      fetchProfile();
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      setMsg('❌ ' + (err.response?.data?.message || 'Profile update failed!'));
    }
  };

  const copyReferralCode = async () => {
    try {
      if (!profile?.referralCode) {
        setMsg('❌ Referral code not found. Refresh profile once.');
        return;
      }

      setCopying(true);

      await navigator.clipboard.writeText(profile.referralCode);

      setMsg('✅ Referral code copied!');
      setTimeout(() => setMsg(''), 2500);
    } catch (err) {
      setMsg('❌ Copy failed. Manually copy the code.');
    } finally {
      setCopying(false);
    }
  };

  const copyInviteMessage = async () => {
    try {
      const code = profile?.referralCode || '';
      const message = `Join REHANVERSE and start learning with me 🚀\nUse my referral code: ${code}`;

      await navigator.clipboard.writeText(message);

      setMsg('✅ Invite message copied!');
      setTimeout(() => setMsg(''), 2500);
    } catch (err) {
      setMsg('❌ Invite copy failed.');
    }
  };

  const openCertificateVerify = (certificateId) => {
    if (!certificateId) return;
    navigate(`/certificate/${certificateId}`);
  };

  const getJoinedDate = () => {
    if (!profile?.createdAt && !profile?.accountCreatedAt) return 'New';

    return new Date(profile.createdAt || profile.accountCreatedAt).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatDate = (date) => {
    if (!date) return 'Not available';

    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const enrolledCount =
    profile?.stats?.totalEnrolledCourses || profile?.enrolledCourses?.length || 0;

  const completedCount =
    profile?.stats?.totalCompletedCourses || profile?.completedCourses?.length || 0;

  const certificateCount =
    profile?.stats?.totalCertificates || profile?.certificates?.length || 0;

  const referralCount =
    profile?.stats?.totalReferrals || profile?.referralCount || 0;

  const rewardCoupons = profile?.rewardCoupons || [];
  const referralRewards = profile?.referralRewards || [];

  const inputStyle = {
    width: '100%',
    padding: isMobile ? '13px 14px' : '14px 15px',
    marginBottom: '16px',
    borderRadius: '14px',
    fontSize: '16px',
    outline: 'none',
    background: safeTheme.isDark ? 'rgba(15, 23, 42, 0.72)' : 'rgba(255,255,255,0.82)',
    color: safeTheme.text,
    border: `1px solid ${safeTheme.border}`,
    boxSizing: 'border-box',
    fontWeight: '700',
  };

  const labelStyle = {
    color: safeTheme.textSecondary,
    fontSize: '13px',
    fontWeight: '900',
    display: 'block',
    marginBottom: '8px',
  };

  const tabButton = (tabName) => ({
    padding: isMobile ? '11px 12px' : '11px 16px',
    borderRadius: '15px',
    border: `1px solid ${activeTab === tabName ? safeTheme.primary : safeTheme.border}`,
    cursor: 'pointer',
    fontWeight: '900',
    background:
      activeTab === tabName
        ? safeTheme.primary
        : safeTheme.isDark
        ? 'rgba(255,255,255,0.035)'
        : 'rgba(255,255,255,0.72)',
    color: activeTab === tabName ? safeTheme.buttonText : safeTheme.text,
    boxShadow: activeTab === tabName ? `0 0 18px ${safeTheme.primary}35` : 'none',
    flex: isMobile ? '1 1 100%' : '0 0 auto',
    width: isMobile ? '100%' : 'auto',
  });

  if (!profile) {
    return (
      <div
        style={{
          background: safeTheme.bg,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: safeTheme.text,
        }}
      >
        <p style={{ color: safeTheme.muted, fontWeight: 900 }}>⏳ Loading profile...</p>
      </div>
    );
  }

  return (
    <div
      style={{
        background: safeTheme.bg,
        minHeight: '100vh',
        color: safeTheme.text,
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
            background: safeTheme.card,
            border: `1px solid ${safeTheme.border}`,
            boxShadow: safeTheme.shadow,
            backdropFilter: safeTheme.glass,
            WebkitBackdropFilter: safeTheme.glass,
            borderRadius: safeTheme.radius,
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
                    border: `3px solid ${safeTheme.primary}`,
                    boxShadow: `0 0 26px ${safeTheme.primary}45`,
                  }}
                />
              ) : (
                <div
                  style={{
                    ...styles.avatarFallback(isMobile),
                    background: safeTheme.primary,
                    color: safeTheme.buttonText,
                    boxShadow: `0 0 26px ${safeTheme.primary}45`,
                  }}
                >
                  {profile.name?.charAt(0).toUpperCase() || 'U'}
                </div>
              )}

              <div style={styles.onlineDot(isMobile)} />
            </div>

            <div style={styles.profileInfo(isMobile)}>
              <p style={{ ...styles.kicker, color: safeTheme.primary }}>👤 STUDENT PROFILE</p>

              <h1 style={{ ...styles.name(isMobile), color: safeTheme.text }}>
                {profile.name || 'User'}
              </h1>

              <p style={{ ...styles.email(isMobile), color: safeTheme.muted }}>
                {profile.email}
              </p>

              <div style={styles.badgeRow(isMobile)}>
                <span
                  style={{
                    ...styles.smallBadge,
                    background: safeTheme.isDark ? 'rgba(34,197,94,0.12)' : '#dcfce7',
                    color: safeTheme.isDark ? '#86efac' : '#166534',
                    border: safeTheme.isDark
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
                      background: safeTheme.isDark ? 'rgba(139,92,246,0.12)' : 'rgba(237,233,254,0.85)',
                      color: safeTheme.primary,
                      border: `1px solid ${safeTheme.border}`,
                    }}
                  >
                    {profile.role === 'admin' ? '⚙️ Admin' : '🎓 Student'}
                  </span>
                )}

                <span
                  style={{
                    ...styles.smallBadge,
                    background: safeTheme.isDark ? 'rgba(59,130,246,0.12)' : '#dbeafe',
                    color: safeTheme.isDark ? '#93c5fd' : '#1d4ed8',
                    border: safeTheme.isDark
                      ? '1px solid rgba(59,130,246,0.25)'
                      : '1px solid #bfdbfe',
                  }}
                >
                  📅 Joined {getJoinedDate()}
                </span>
              </div>
            </div>
          </div>

          {profile.bio && (
            <p
              style={{
                ...styles.bioText(isMobile),
                color: safeTheme.textSecondary,
                background: safeTheme.isDark ? 'rgba(255,255,255,0.035)' : 'rgba(255,255,255,0.72)',
                border: `1px solid ${safeTheme.border}`,
              }}
            >
              “{profile.bio}”
            </p>
          )}

          <div style={styles.statsGrid(isMobile)}>
            {[
              { icon: '📚', label: 'Enrolled', value: enrolledCount },
              { icon: '✅', label: 'Completed', value: completedCount },
              { icon: '🎓', label: 'Certificates', value: certificateCount },
              { icon: '🎁', label: 'Referrals', value: referralCount },
              { icon: '📱', label: 'Phone', value: profile.phone || 'Not added' },
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  ...styles.statCard(isMobile),
                  background: safeTheme.isDark ? 'rgba(255,255,255,0.035)' : 'rgba(255,255,255,0.72)',
                  border: `1px solid ${safeTheme.border}`,
                }}
              >
                <span style={styles.statIcon(isMobile)}>{item.icon}</span>
                <div style={{ minWidth: 0 }}>
                  <p style={{ ...styles.statLabel, color: safeTheme.muted }}>{item.label}</p>
                  <h3 style={{ ...styles.statValue(isMobile), color: safeTheme.text }}>{item.value}</h3>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <div style={styles.tabs(isMobile)}>
          {[
            ['profile', '✏️ Edit Profile'],
            ['courses', '📚 My Courses'],
            ['certificates', '🎓 Certificates'],
            ['referrals', '🎁 Referrals'],
          ].map(([key, label]) => (
            <motion.button
              key={key}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.985 }}
              transition={{ duration: 0.16 }}
              onClick={() => setActiveTab(key)}
              style={tabButton(key)}
            >
              {label}
            </motion.button>
          ))}
        </div>

        {msg && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              ...styles.msgBox(isMobile),
              background: msg.includes('✅')
                ? safeTheme.isDark
                  ? 'rgba(34, 197, 94, 0.15)'
                  : '#d1fae5'
                : msg.includes('⏳')
                ? safeTheme.isDark
                  ? 'rgba(59, 130, 246, 0.15)'
                  : '#eff6ff'
                : safeTheme.isDark
                ? 'rgba(239, 68, 68, 0.15)'
                : '#fee2e2',
              color: msg.includes('✅')
                ? safeTheme.isDark
                  ? '#86efac'
                  : '#065f46'
                : msg.includes('⏳')
                ? safeTheme.isDark
                  ? '#93c5fd'
                  : '#1d4ed8'
                : safeTheme.isDark
                ? '#fca5a5'
                : '#991b1b',
              border: `1px solid ${
                msg.includes('✅')
                  ? safeTheme.isDark
                    ? 'rgba(34, 197, 94, 0.25)'
                    : '#a7f3d0'
                  : msg.includes('⏳')
                  ? safeTheme.isDark
                    ? 'rgba(59, 130, 246, 0.25)'
                    : '#bfdbfe'
                  : safeTheme.isDark
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
              background: safeTheme.card,
              border: `1px solid ${safeTheme.border}`,
              boxShadow: safeTheme.shadow,
              backdropFilter: safeTheme.glass,
              WebkitBackdropFilter: safeTheme.glass,
            }}
          >
            <div style={styles.panelHead(isMobile)}>
              <div>
                <h3 style={{ color: safeTheme.text, margin: 0 }}>✏️ Edit Profile</h3>
                <p style={{ color: safeTheme.muted, margin: '6px 0 0', fontSize: isMobile ? '13px' : '14px' }}>
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
              placeholder="Phone Number"
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
                    border: `2px solid ${safeTheme.primary}`,
                  }}
                />
              ) : (
                <div
                  style={{
                    ...styles.previewFallback(isMobile),
                    background: safeTheme.primary,
                    color: safeTheme.buttonText,
                  }}
                >
                  {profile.name?.charAt(0).toUpperCase() || 'U'}
                </div>
              )}

              <label style={{ flex: 1, minWidth: isMobile ? '100%' : '220px', cursor: uploading ? 'not-allowed' : 'pointer' }}>
                <div
                  style={{
                    ...styles.uploadBox(isMobile),
                    background: safeTheme.isDark ? 'rgba(15, 23, 42, 0.72)' : 'rgba(255,255,255,0.82)',
                    border: `2px dashed ${safeTheme.border}`,
                    color: safeTheme.muted,
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
                background: uploading ? safeTheme.muted : safeTheme.primary,
                color: safeTheme.buttonText,
                boxShadow: `0 0 20px ${safeTheme.primary}35`,
                cursor: uploading ? 'not-allowed' : 'pointer',
                opacity: uploading ? 0.75 : 1,
              }}
            >
              💾 Save Changes
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
              <EmptyBox
                isMobile={isMobile}
                safeTheme={safeTheme}
                icon="📭"
                title="Koi course enroll nahi!"
                text="Start with free courses or preview premium courses."
                buttonText="Browse Courses 🚀"
                onClick={() => navigate('/courses')}
              />
            ) : (
              <div style={styles.courseGrid(isMobile)}>
                {profile.enrolledCourses?.map((course) => {
                  const isCompleted = profile.completedCourses?.some(
                    (c) => String(c._id || c) === String(course._id)
                  );

                  return (
                    <motion.div
                      key={course._id}
                      whileHover={{ y: -4 }}
                      transition={{ duration: 0.18, ease: 'easeOut' }}
                      style={{
                        ...styles.courseCard(isMobile),
                        background: safeTheme.card,
                        border: `1px solid ${safeTheme.border}`,
                        boxShadow: safeTheme.shadow,
                        backdropFilter: safeTheme.glass,
                        WebkitBackdropFilter: safeTheme.glass,
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
                            background: `linear-gradient(135deg, ${safeTheme.primary}, ${safeTheme.accent})`,
                          }}
                        >
                          🎓
                        </div>
                      )}

                      <div style={styles.courseBody(isMobile)}>
                        <div style={styles.badgeLine}>
                          <div style={styles.enrolledBadge}>✅ Enrolled</div>
                          {isCompleted && <div style={styles.completedBadge}>🎓 Completed</div>}
                        </div>

                        <h4 style={{ ...styles.courseTitleText(isMobile), color: safeTheme.text }}>
                          {course.title}
                        </h4>

                        <p style={{ ...styles.courseMeta, color: safeTheme.muted }}>
                          {course.category || 'General'} {course.level ? `• ${course.level}` : ''}
                        </p>

                        <motion.button
                          whileHover={{ scale: 1.018, y: -1 }}
                          whileTap={{ scale: 0.985 }}
                          transition={{ duration: 0.16 }}
                          onClick={() => navigate(`/course/${course._id}`)}
                          style={{
                            ...styles.continueBtn(isMobile),
                            background: safeTheme.primary,
                            color: safeTheme.buttonText,
                            boxShadow: `0 0 18px ${safeTheme.primary}35`,
                          }}
                        >
                          ▶️ Continue Learning
                        </motion.button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'certificates' && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
          >
            {profile.certificates?.length === 0 ? (
              <EmptyBox
                isMobile={isMobile}
                safeTheme={safeTheme}
                icon="🎓"
                title="Abhi koi certificate nahi"
                text="Course complete karoge to certificate yahin show hoga."
                buttonText="Go to My Courses 📚"
                onClick={() => setActiveTab('courses')}
              />
            ) : (
              <div style={styles.certificateGrid(isMobile)}>
                {profile.certificates?.map((cert) => (
                  <motion.div
                    key={cert.certificateId}
                    whileHover={{ y: -4 }}
                    transition={{ duration: 0.18, ease: 'easeOut' }}
                    style={{
                      ...styles.certificateCard(isMobile),
                      background: `linear-gradient(135deg, ${
                        safeTheme.isDark ? 'rgba(15,23,42,0.94)' : 'rgba(255,255,255,0.96)'
                      }, ${safeTheme.isDark ? 'rgba(88,28,135,0.38)' : 'rgba(245,243,255,0.95)'})`,
                      border: `1px solid ${safeTheme.border}`,
                      boxShadow: safeTheme.shadow,
                    }}
                  >
                    <div style={styles.certificateTop}>
                      <div>
                        <p style={{ ...styles.kicker, color: safeTheme.primary }}>REHANVERSE CERTIFICATE</p>
                        <h3 style={{ ...styles.certTitle(isMobile), color: safeTheme.text }}>
                          {cert.courseTitle || cert.course?.title || 'Course Certificate'}
                        </h3>
                      </div>
                      <div style={styles.certSeal}>🎓</div>
                    </div>

                    <div
                      style={{
                        ...styles.certInfoBox,
                        background: safeTheme.isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.78)',
                        border: `1px solid ${safeTheme.border}`,
                      }}
                    >
                      <p style={{ color: safeTheme.muted, margin: '0 0 6px', fontWeight: 850 }}>
                        Awarded to
                      </p>
                      <h4 style={{ color: safeTheme.text, margin: 0, fontSize: isMobile ? '19px' : '22px' }}>
                        {profile.name}
                      </h4>
                    </div>

                    <div style={styles.certDetails}>
                      <div>
                        <span style={{ color: safeTheme.muted }}>Certificate ID</span>
                        <strong style={{ color: safeTheme.text }}>{cert.certificateId}</strong>
                      </div>

                      <div>
                        <span style={{ color: safeTheme.muted }}>Issued On</span>
                        <strong style={{ color: safeTheme.text }}>{formatDate(cert.issuedAt)}</strong>
                      </div>
                    </div>

                    <div style={styles.certActions(isMobile)}>
                      <motion.button
                        whileHover={{ scale: 1.018, y: -1 }}
                        whileTap={{ scale: 0.985 }}
                        onClick={() => openCertificateVerify(cert.certificateId)}
                        style={{
                          ...styles.smallActionBtn(isMobile),
                          background: safeTheme.primary,
                          color: safeTheme.buttonText,
                          border: 'none',
                        }}
                      >
                        Verify Certificate 🔍
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.018, y: -1 }}
                        whileTap={{ scale: 0.985 }}
                        onClick={() => {
                          navigator.clipboard.writeText(
                            `${window.location.origin}/certificate/${cert.certificateId}`
                          );
                          setMsg('✅ Certificate verify link copied!');
                          setTimeout(() => setMsg(''), 2500);
                        }}
                        style={{
                          ...styles.smallActionBtn(isMobile),
                          background: 'transparent',
                          color: safeTheme.primary,
                          border: `1px solid ${safeTheme.border}`,
                        }}
                      >
                        Copy Link 🔗
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'referrals' && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
            style={{
              ...styles.panel(isMobile),
              background: safeTheme.card,
              border: `1px solid ${safeTheme.border}`,
              boxShadow: safeTheme.shadow,
              backdropFilter: safeTheme.glass,
              WebkitBackdropFilter: safeTheme.glass,
            }}
          >
            <div style={styles.panelHead(isMobile)}>
              <div>
                <h3 style={{ color: safeTheme.text, margin: 0 }}>🎁 Referral & Invite</h3>
                <p style={{ color: safeTheme.muted, margin: '6px 0 0', fontSize: isMobile ? '13px' : '14px' }}>
                  Apna code share karo. Friend signup karega to referral reward milega.
                </p>
              </div>
            </div>

            <div
              style={{
                ...styles.referralBox(isMobile),
                background: safeTheme.isDark ? 'rgba(139,92,246,0.10)' : '#f5f3ff',
                border: `1px solid ${safeTheme.border}`,
              }}
            >
              <p style={{ color: safeTheme.muted, margin: '0 0 8px', fontWeight: 900 }}>
                Your Referral Code
              </p>

              <div style={styles.referralCodeRow(isMobile)}>
                <h2 style={{ ...styles.referralCode(isMobile), color: safeTheme.primary }}>
                  {profile.referralCode || 'Loading...'}
                </h2>

                <motion.button
                  whileHover={{ scale: 1.018, y: -1 }}
                  whileTap={{ scale: 0.985 }}
                  onClick={copyReferralCode}
                  disabled={copying}
                  style={{
                    ...styles.copyBtn(isMobile),
                    background: safeTheme.primary,
                    color: safeTheme.buttonText,
                    opacity: copying ? 0.7 : 1,
                  }}
                >
                  {copying ? 'Copying...' : 'Copy Code'}
                </motion.button>
              </div>

              <motion.button
                whileHover={{ scale: 1.018, y: -1 }}
                whileTap={{ scale: 0.985 }}
                onClick={copyInviteMessage}
                style={{
                  ...styles.primaryBtn(isMobile),
                  marginTop: '14px',
                  background: safeTheme.success,
                  color: safeTheme.buttonText,
                  boxShadow: '0 0 20px rgba(34,197,94,0.30)',
                }}
              >
                Copy Invite Message 🚀
              </motion.button>
            </div>

            <div style={styles.referralStatsGrid(isMobile)}>
              {[
                { icon: '👥', label: 'Successful Referrals', value: referralCount },
                { icon: '🎟️', label: 'Reward Coupons', value: rewardCoupons.length },
                { icon: '🏆', label: 'Reward Entries', value: referralRewards.length },
              ].map((item) => (
                <div
                  key={item.label}
                  style={{
                    ...styles.statCard(isMobile),
                    background: safeTheme.isDark ? 'rgba(255,255,255,0.035)' : 'rgba(255,255,255,0.72)',
                    border: `1px solid ${safeTheme.border}`,
                  }}
                >
                  <span style={styles.statIcon(isMobile)}>{item.icon}</span>
                  <div>
                    <p style={{ ...styles.statLabel, color: safeTheme.muted }}>{item.label}</p>
                    <h3 style={{ ...styles.statValue(isMobile), color: safeTheme.text }}>{item.value}</h3>
                  </div>
                </div>
              ))}
            </div>

            <h4 style={{ color: safeTheme.text, margin: '22px 0 12px' }}>🎟️ Reward Coupons</h4>

            {rewardCoupons.length === 0 ? (
              <div
                style={{
                  ...styles.miniEmpty,
                  color: safeTheme.muted,
                  background: safeTheme.isDark ? 'rgba(255,255,255,0.035)' : 'rgba(255,255,255,0.72)',
                  border: `1px solid ${safeTheme.border}`,
                }}
              >
                No referral reward coupons yet.
              </div>
            ) : (
              <div style={styles.rewardList}>
                {rewardCoupons.map((coupon) => (
                  <div
                    key={coupon._id || coupon.code}
                    style={{
                      ...styles.rewardItem(isMobile),
                      background: safeTheme.isDark ? 'rgba(255,255,255,0.035)' : 'rgba(255,255,255,0.72)',
                      border: `1px solid ${safeTheme.border}`,
                    }}
                  >
                    <div>
                      <h4 style={{ color: safeTheme.primary, margin: '0 0 6px' }}>
                        {coupon.code}
                      </h4>
                      <p style={{ color: safeTheme.muted, margin: 0, fontSize: '13px', fontWeight: 800 }}>
                        {coupon.discountValue}% off • Used {coupon.usedCount || 0}/{coupon.usageLimit || 1}
                      </p>
                    </div>

                    <span
                      style={{
                        ...styles.statusPill,
                        background: coupon.isActive
                          ? 'rgba(34,197,94,0.14)'
                          : 'rgba(239,68,68,0.14)',
                        color: coupon.isActive ? '#86efac' : '#fca5a5',
                      }}
                    >
                      {coupon.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </main>
    </div>
  );
}

function EmptyBox({ isMobile, safeTheme, icon, title, text, buttonText, onClick }) {
  return (
    <div
      style={{
        ...styles.emptyBox(isMobile),
        background: safeTheme.card,
        border: `1px solid ${safeTheme.border}`,
        boxShadow: safeTheme.shadow,
        color: safeTheme.muted,
      }}
    >
      <p style={{ fontSize: isMobile ? '42px' : '54px', margin: '0 0 12px' }}>{icon}</p>
      <h3 style={{ color: safeTheme.text, margin: '0 0 8px', fontSize: isMobile ? '21px' : '24px' }}>
        {title}
      </h3>
      <p style={{ margin: '0 0 22px', lineHeight: 1.7, fontSize: isMobile ? '13px' : '14px' }}>
        {text}
      </p>

      <motion.button
        whileHover={{ scale: 1.018, y: -1 }}
        whileTap={{ scale: 0.985 }}
        transition={{ duration: 0.16 }}
        onClick={onClick}
        style={{
          ...styles.secondaryActionBtn(isMobile),
          background: safeTheme.primary,
          color: safeTheme.buttonText,
          border: 'none',
        }}
      >
        {buttonText}
      </motion.button>
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
    maxWidth: '980px',
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
    gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(165px, 1fr))',
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
    cursor: 'pointer',
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

  badgeLine: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
    marginBottom: '12px',
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
  },

  completedBadge: {
    width: 'fit-content',
    padding: '7px 10px',
    borderRadius: '999px',
    background: 'rgba(139,92,246,0.14)',
    color: '#c4b5fd',
    border: '1px solid rgba(139,92,246,0.25)',
    fontSize: '12px',
    fontWeight: 950,
  },

  courseTitleText: (isMobile) => ({
    margin: '0 0 8px',
    fontSize: isMobile ? '15px' : '16px',
    lineHeight: 1.35,
    fontWeight: 950,
    minHeight: isMobile ? 'auto' : '44px',
    wordBreak: 'normal',
    overflowWrap: 'break-word',
  }),

  courseMeta: {
    margin: '0 0 14px',
    fontSize: '12.5px',
    fontWeight: 800,
  },

  continueBtn: (isMobile) => ({
    width: '100%',
    padding: isMobile ? '12px' : '12px',
    border: 'none',
    borderRadius: '14px',
    cursor: 'pointer',
    fontSize: isMobile ? '13.5px' : '14px',
    fontWeight: 950,
  }),

  certificateGrid: (isMobile) => ({
    display: 'grid',
    gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(310px, 1fr))',
    gap: '18px',
  }),

  certificateCard: (isMobile) => ({
    borderRadius: isMobile ? '22px' : '26px',
    padding: isMobile ? '18px' : '22px',
    overflow: 'hidden',
    position: 'relative',
  }),

  certificateTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '14px',
    marginBottom: '18px',
  },

  certSeal: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    display: 'grid',
    placeItems: 'center',
    background: 'rgba(139,92,246,0.16)',
    fontSize: '24px',
    flex: '0 0 auto',
  },

  certTitle: (isMobile) => ({
    margin: 0,
    fontSize: isMobile ? '19px' : '22px',
    lineHeight: 1.25,
    fontWeight: 950,
  }),

  certInfoBox: {
    borderRadius: '18px',
    padding: '16px',
    marginBottom: '16px',
  },

  certDetails: {
    display: 'grid',
    gap: '12px',
    marginBottom: '16px',
  },

  certActions: (isMobile) => ({
    display: 'flex',
    gap: '10px',
    flexDirection: isMobile ? 'column' : 'row',
  }),

  smallActionBtn: (isMobile) => ({
    flex: 1,
    padding: isMobile ? '12px' : '11px 12px',
    borderRadius: '14px',
    fontWeight: 950,
    cursor: 'pointer',
  }),

  referralBox: (isMobile) => ({
    padding: isMobile ? '18px' : '22px',
    borderRadius: '22px',
    marginBottom: '18px',
  }),

  referralCodeRow: (isMobile) => ({
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
    flexDirection: isMobile ? 'column' : 'row',
  }),

  referralCode: (isMobile) => ({
    margin: 0,
    fontSize: isMobile ? '28px' : '34px',
    letterSpacing: '1px',
    fontWeight: 950,
    wordBreak: 'break-word',
    flex: 1,
  }),

  copyBtn: (isMobile) => ({
    border: 'none',
    borderRadius: '14px',
    padding: isMobile ? '12px 16px' : '12px 18px',
    fontWeight: 950,
    cursor: 'pointer',
    width: isMobile ? '100%' : 'auto',
  }),

  referralStatsGrid: (isMobile) => ({
    display: 'grid',
    gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
    gap: '14px',
  }),

  miniEmpty: {
    padding: '16px',
    borderRadius: '16px',
    fontWeight: 850,
  },

  rewardList: {
    display: 'grid',
    gap: '12px',
  },

  rewardItem: (isMobile) => ({
    padding: '14px',
    borderRadius: '16px',
    display: 'flex',
    alignItems: isMobile ? 'flex-start' : 'center',
    justifyContent: 'space-between',
    gap: '12px',
    flexDirection: isMobile ? 'column' : 'row',
  }),

  statusPill: {
    padding: '7px 10px',
    borderRadius: '999px',
    fontSize: '12px',
    fontWeight: 950,
  },
};

export default Profile;