import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';
import Reveal from '../components/Reveal';
import Footer from '../components/Footer';
import API from '../api';

function Courses() {
  const [courses, setCourses] = useState([]);
  const [enrolledIds, setEnrolledIds] = useState([]);
  const [liveCounts, setLiveCounts] = useState({});
  const [msg, setMsg] = useState('');

  const [search, setSearch] = useState('');
  const [priceFilter, setPriceFilter] = useState('all');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sliderMax, setSliderMax] = useState(500);
  const [loading, setLoading] = useState(true);

  const theme = useTheme();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchCourses();
    if (token) fetchEnrolled();
    // eslint-disable-next-line
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);

      const res = await axios.get(`${API}/api/courses`);
      const courseData = Array.isArray(res.data) ? res.data : [];

      setCourses(courseData);

      const maxCoursePrice = Math.max(
        100,
        ...courseData.map((c) => Number(c.price || 0))
      );

      setSliderMax(maxCoursePrice);
      fetchLiveCounts(courseData);
    } catch (err) {
      console.log('COURSES FETCH ERROR:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLiveCounts = async (courseList) => {
    try {
      const token = localStorage.getItem('token');
      const counts = {};

      await Promise.all(
        courseList.map(async (course) => {
          try {
            const res = await axios.get(
              `${API}/api/live-classes/course/${course._id}`,
              {
                headers: token
                  ? {
                      Authorization: `Bearer ${token}`,
                    }
                  : {},
              }
            );

            counts[course._id] = res.data?.length || 0;
          } catch (err) {
            console.log(`LIVE COUNT ERROR FOR ${course.title}:`, err);
            counts[course._id] = 0;
          }
        })
      );

      setLiveCounts(counts);
    } catch (err) {
      console.log('LIVE COUNTS ERROR:', err);
    }
  };

  const fetchEnrolled = async () => {
    try {
      const res = await axios.get(`${API}/api/enroll/my/courses`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setEnrolledIds(res.data.map((c) => c._id));
    } catch (err) {
      console.log(err);
    }
  };

  const isEnrolled = (id) => enrolledIds.includes(id);

  const openCourseDetail = (course) => {
    if (!token) {
      navigate('/login');
      return;
    }

    navigate(`/courses/${course._id}`);
  };

  const handleEnroll = async (course) => {
    if (!token) {
      navigate('/login');
      return;
    }

    if (isEnrolled(course._id)) {
      navigate('/my-courses');
      return;
    }

    if (!course.isFree) {
      navigate(`/courses/${course._id}`);
      return;
    }

    try {
      const res = await axios.post(
        `${API}/api/enroll/${course._id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMsg('✅ ' + res.data.message);
      setEnrolledIds((prev) => [...prev, course._id]);
      navigate('/my-courses');
    } catch (err) {
      setMsg('⚠️ ' + (err.response?.data?.message || 'Something went wrong'));
      setTimeout(() => setMsg(''), 3000);
    }
  };

  const resetFilters = () => {
    setPriceFilter('all');
    setMinPrice('');
    setMaxPrice('');
    setSearch('');
  };

  const applyPriceFilter = (course) => {
    const price = Number(course.price || 0);

    if (priceFilter === 'free') {
      return course.isFree || price === 0;
    }

    if (priceFilter === 'paid') {
      return !course.isFree && price > 0;
    }

    if (priceFilter === 'custom') {
      const min = minPrice === '' ? 0 : Number(minPrice);
      const max = maxPrice === '' ? sliderMax : Number(maxPrice);

      return price >= min && price <= max;
    }

    return true;
  };

  const filteredCourses = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return courses.filter((course) => {
      const matchesPrice = applyPriceFilter(course);

      const matchesSearch =
        !searchValue ||
        course.title?.toLowerCase().includes(searchValue) ||
        course.description?.toLowerCase().includes(searchValue);

      return matchesPrice && matchesSearch;
    });
    // eslint-disable-next-line
  }, [courses, priceFilter, minPrice, maxPrice, search, sliderMax]);

  const enrolledCourses = filteredCourses.filter((course) =>
    isEnrolled(course._id)
  );

  const notOwnedCourses = filteredCourses.filter(
    (course) => !isEnrolled(course._id)
  );

  const totalVideos = courses.reduce((sum, c) => sum + (c.videos?.length || 0), 0);
  const totalPdfs = courses.reduce((sum, c) => sum + (c.pdfs?.length || 0), 0);

  const statCards = [
    { icon: '📚', label: 'Courses', value: courses.length },
    { icon: '🎥', label: 'Videos', value: totalVideos },
    { icon: '📄', label: 'PDFs', value: totalPdfs },
    { icon: '✅', label: 'Owned', value: enrolledIds.length },
  ];

  const CourseCard = ({ course, index }) => {
    const owned = isEnrolled(course._id);
    const liveCount = liveCounts[course._id] || 0;
    const isFreeCourse = course.isFree || Number(course.price || 0) === 0;

    return (
      <Reveal key={course._id} delay={index * 0.04}>
        <motion.div
          whileHover={{ y: -4 }}
          whileTap={{ scale: 0.995 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          onClick={() => openCourseDetail(course)}
          style={{
            ...styles.courseCard,
            background: theme.card,
            border: `1px solid ${theme.border}`,
            boxShadow: theme.shadow,
            backdropFilter: theme.glass,
            WebkitBackdropFilter: theme.glass,
          }}
        >
          <div style={styles.thumbnailWrap}>
            {course.thumbnail ? (
              <img
                src={course.thumbnail}
                alt={course.title}
                style={styles.thumbnail}
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

            <div style={styles.badgeRow}>
              <span
                style={{
                  ...styles.priceBadge,
                  background: isFreeCourse
                    ? 'rgba(34, 197, 94, 0.95)'
                    : 'rgba(249, 115, 22, 0.95)',
                }}
              >
                {isFreeCourse ? '🆓 Free' : `₹${course.price}`}
              </span>

              {owned && <span style={styles.ownedBadge}>✅ Owned</span>}
            </div>
          </div>

          <div style={styles.cardBody}>
            <div>
              <h3 style={{ ...styles.cardTitle, color: theme.text }}>
                {course.title}
              </h3>

              <p style={{ ...styles.cardDesc, color: theme.muted }}>
                {course.description
                  ? course.description.length > 95
                    ? `${course.description.slice(0, 95)}...`
                    : course.description
                  : 'No description available for this course yet.'}
              </p>
            </div>

            <div style={styles.metaGrid}>
              <div
                style={{
                  ...styles.metaPill,
                  background: theme.isDark ? 'rgba(255,255,255,0.035)' : 'rgba(255,255,255,0.72)',
                  border: `1px solid ${theme.border}`,
                  color: theme.muted,
                }}
              >
                🎥 {course.videos?.length || 0} Videos
              </div>

              <div
                style={{
                  ...styles.metaPill,
                  background: theme.isDark ? 'rgba(255,255,255,0.035)' : 'rgba(255,255,255,0.72)',
                  border: `1px solid ${theme.border}`,
                  color: theme.muted,
                }}
              >
                📄 {course.pdfs?.length || 0} PDFs
              </div>

              <div
                style={{
                  ...styles.metaPill,
                  background: liveCount > 0
                    ? 'rgba(239, 68, 68, 0.12)'
                    : theme.isDark
                    ? 'rgba(255,255,255,0.035)'
                    : 'rgba(255,255,255,0.72)',
                  border: `1px solid ${
                    liveCount > 0 ? 'rgba(248,113,113,0.35)' : theme.border
                  }`,
                  color: liveCount > 0 ? '#f87171' : theme.muted,
                  gridColumn: '1 / -1',
                }}
              >
                🔴 {liveCount} Live Classes
              </div>
            </div>

            <div style={styles.bottomRow}>
              <div>
                <p style={{ ...styles.priceLabel, color: theme.muted }}>
                  Course Price
                </p>
                <strong
                  style={{
                    color: isFreeCourse ? theme.success : '#f97316',
                    fontSize: '18px',
                  }}
                >
                  {isFreeCourse ? 'Free' : `₹${course.price}`}
                </strong>
              </div>

              <motion.button
                whileHover={{ scale: 1.018, y: -1 }}
                whileTap={{ scale: 0.985 }}
                transition={{ duration: 0.16, ease: 'easeOut' }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleEnroll(course);
                }}
                style={{
                  ...styles.actionBtn,
                  background: owned
                    ? theme.success
                    : isFreeCourse
                    ? 'linear-gradient(135deg, #22c55e, #16a34a)'
                    : 'linear-gradient(135deg, #f97316, #ea580c)',
                }}
              >
                {owned ? 'Go to Course' : isFreeCourse ? 'Enroll Free' : 'Preview'}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </Reveal>
    );
  };

  const CourseSection = ({ title, subtitle, data, emptyText }) => (
    <section style={styles.courseSection}>
      <div style={styles.sectionHeader}>
        <div>
          <h3 style={{ ...styles.sectionTitle, color: theme.text }}>
            {title}
          </h3>
          <p style={{ ...styles.sectionSubtitle, color: theme.muted }}>
            {subtitle}
          </p>
        </div>

        <span
          style={{
            ...styles.countBadge,
            color: theme.primary,
            background: theme.isDark
              ? 'rgba(139,92,246,0.12)'
              : 'rgba(139,92,246,0.10)',
            border: `1px solid ${theme.border}`,
          }}
        >
          {data.length} courses
        </span>
      </div>

      {data.length === 0 ? (
        <div
          style={{
            ...styles.emptyBox,
            background: theme.card,
            border: `1px solid ${theme.border}`,
            color: theme.muted,
          }}
        >
          <div style={styles.emptyIcon}>🔎</div>
          <p style={{ margin: 0 }}>{emptyText}</p>
        </div>
      ) : (
        <div style={styles.courseGrid}>
          {data.map((course, index) => (
            <CourseCard key={course._id} course={course} index={index} />
          ))}
        </div>
      )}
    </section>
  );

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
        <Reveal>
          <div
            style={{
              ...styles.hero,
              background: theme.card,
              border: `1px solid ${theme.border}`,
              boxShadow: theme.shadow,
              backdropFilter: theme.glass,
              WebkitBackdropFilter: theme.glass,
              borderRadius: theme.radius,
            }}
          >
            <div>
              <p style={{ ...styles.kicker, color: theme.primary }}>
                📚 COURSE LIBRARY
              </p>

              <h2 style={{ ...styles.heroTitle, color: theme.text }}>
                Learn smarter with organized courses.
              </h2>

              <p style={{ ...styles.heroText, color: theme.muted }}>
                Search, filter, preview, and continue your learning journey from one clean dashboard.
              </p>
            </div>

            <div style={styles.statGrid}>
              {statCards.map((item) => (
                <div
                  key={item.label}
                  style={{
                    ...styles.statCard,
                    background: theme.isDark
                      ? 'rgba(255,255,255,0.035)'
                      : 'rgba(255,255,255,0.72)',
                    border: `1px solid ${theme.border}`,
                  }}
                >
                  <span style={styles.statIcon}>{item.icon}</span>
                  <strong style={{ color: theme.primary }}>{item.value}</strong>
                  <span style={{ color: theme.muted }}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        <Reveal>
          <div
            style={{
              ...styles.filterBox,
              background: theme.card,
              border: `1px solid ${theme.border}`,
              boxShadow: theme.shadow,
              backdropFilter: theme.glass,
              WebkitBackdropFilter: theme.glass,
            }}
          >
            <div style={styles.filterTop}>
              <div>
                <h3 style={{ margin: 0, color: theme.text, fontSize: '18px' }}>
                  🎛️ Find your course
                </h3>
                <p style={{ margin: '5px 0 0', color: theme.muted, fontSize: '13px' }}>
                  Search aur price filter se quickly course find karo.
                </p>
              </div>

              <button
                onClick={resetFilters}
                style={{
                  ...styles.resetBtn,
                  border: `1px solid ${theme.border}`,
                  background: theme.isDark ? 'rgba(255,255,255,0.035)' : 'rgba(255,255,255,0.72)',
                  color: theme.text,
                }}
              >
                Reset
              </button>
            </div>

            <div style={styles.filterGrid}>
              <div style={styles.fieldLarge}>
                <label style={{ ...styles.label, color: theme.muted }}>
                  Search Course
                </label>

                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by title or description..."
                  style={{
                    ...styles.input,
                    background: theme.isDark ? 'rgba(15, 23, 42, 0.72)' : 'rgba(255,255,255,0.82)',
                    border: `1px solid ${theme.border}`,
                    color: theme.text,
                  }}
                />
              </div>

              <div>
                <label style={{ ...styles.label, color: theme.muted }}>
                  Course Type
                </label>

                <select
                  value={priceFilter}
                  onChange={(e) => setPriceFilter(e.target.value)}
                  style={{
                    ...styles.input,
                    background: theme.isDark ? 'rgba(15, 23, 42, 0.72)' : 'rgba(255,255,255,0.82)',
                    border: `1px solid ${theme.border}`,
                    color: theme.text,
                  }}
                >
                  <option value="all">All Courses</option>
                  <option value="free">Free Only</option>
                  <option value="paid">Paid Only</option>
                  <option value="custom">Custom Price Range</option>
                </select>
              </div>

              <div>
                <label style={{ ...styles.label, color: theme.muted }}>
                  Min Price
                </label>

                <input
                  type="number"
                  min="0"
                  value={minPrice}
                  disabled={priceFilter !== 'custom'}
                  onChange={(e) => setMinPrice(e.target.value)}
                  placeholder="0"
                  style={{
                    ...styles.input,
                    background:
                      priceFilter === 'custom'
                        ? theme.isDark
                          ? 'rgba(15, 23, 42, 0.72)'
                          : 'rgba(255,255,255,0.82)'
                        : 'rgba(148,163,184,0.12)',
                    border: `1px solid ${theme.border}`,
                    color: theme.text,
                    cursor: priceFilter === 'custom' ? 'text' : 'not-allowed',
                  }}
                />
              </div>

              <div>
                <label style={{ ...styles.label, color: theme.muted }}>
                  Max Price
                </label>

                <input
                  type="number"
                  min="0"
                  value={maxPrice}
                  disabled={priceFilter !== 'custom'}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  placeholder={String(sliderMax)}
                  style={{
                    ...styles.input,
                    background:
                      priceFilter === 'custom'
                        ? theme.isDark
                          ? 'rgba(15, 23, 42, 0.72)'
                          : 'rgba(255,255,255,0.82)'
                        : 'rgba(148,163,184,0.12)',
                    border: `1px solid ${theme.border}`,
                    color: theme.text,
                    cursor: priceFilter === 'custom' ? 'text' : 'not-allowed',
                  }}
                />
              </div>
            </div>

            <div style={styles.sliderRow}>
              <input
                type="range"
                min="0"
                max={sliderMax}
                value={maxPrice === '' ? sliderMax : Number(maxPrice)}
                disabled={priceFilter !== 'custom'}
                onChange={(e) => {
                  setPriceFilter('custom');
                  setMaxPrice(e.target.value);
                }}
                style={{
                  width: '100%',
                  cursor: priceFilter === 'custom' ? 'pointer' : 'not-allowed',
                }}
              />

              <span style={{ color: theme.muted, fontSize: '12px', fontWeight: 800 }}>
                ₹0 - ₹{maxPrice === '' ? sliderMax : maxPrice}
              </span>
            </div>
          </div>
        </Reveal>

        {msg && (
          <Reveal>
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.18 }}
              style={{
                ...styles.msgBox,
                background: msg.includes('✅')
                  ? theme.isDark
                    ? 'rgba(34, 197, 94, 0.15)'
                    : '#d1fae5'
                  : theme.isDark
                  ? 'rgba(239, 68, 68, 0.15)'
                  : '#fee2e2',
                color: msg.includes('✅')
                  ? theme.isDark
                    ? '#86efac'
                    : '#065f46'
                  : theme.isDark
                  ? '#fca5a5'
                  : '#991b1b',
                border: `1px solid ${
                  msg.includes('✅')
                    ? theme.isDark
                      ? 'rgba(34, 197, 94, 0.28)'
                      : '#a7f3d0'
                    : theme.isDark
                    ? 'rgba(239, 68, 68, 0.28)'
                    : '#fecaca'
                }`,
              }}
            >
              {msg}
            </motion.div>
          </Reveal>
        )}

        {loading ? (
          <div style={{ ...styles.emptyBox, color: theme.muted }}>
            Loading courses...
          </div>
        ) : courses.length === 0 ? (
          <Reveal>
            <div
              style={{
                ...styles.emptyBox,
                background: theme.card,
                border: `1px solid ${theme.border}`,
                color: theme.muted,
              }}
            >
              <div style={styles.emptyIcon}>🚀</div>
              <p style={{ margin: 0 }}>No courses available for now.</p>
            </div>
          </Reveal>
        ) : (
          <>
            <CourseSection
              title="🛒 Not Owned"
              subtitle="Ye courses abhi tumhare account me enrolled nahi hain."
              data={notOwnedCourses}
              emptyText="Is filter/search me koi not-owned course nahi mila."
            />

            <CourseSection
              title="✅ Already Enrolled"
              subtitle="Ye courses tumhare account me already owned/enrolled hain."
              data={enrolledCourses}
              emptyText="Is filter/search me koi enrolled course nahi mila."
            />
          </>
        )}
      </main>

      <Footer />
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
    top: '650px',
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
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '40px 20px',
    position: 'relative',
    zIndex: 1,
  },
  hero: {
    padding: '30px',
    marginBottom: '24px',
    display: 'grid',
    gridTemplateColumns: '1.25fr 0.75fr',
    gap: '24px',
    alignItems: 'center',
  },
  kicker: {
    margin: '0 0 8px',
    fontWeight: 950,
    letterSpacing: '0.5px',
    fontSize: '13px',
  },
  heroTitle: {
    fontSize: 'clamp(30px, 4vw, 48px)',
    lineHeight: 1.08,
    margin: '0 0 12px',
    fontWeight: 950,
    letterSpacing: '-0.8px',
  },
  heroText: {
    margin: 0,
    lineHeight: 1.7,
    fontSize: '15px',
    maxWidth: '700px',
  },
  statGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(120px, 1fr))',
    gap: '12px',
  },
  statCard: {
    padding: '14px',
    borderRadius: '18px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    minHeight: '86px',
  },
  statIcon: {
    fontSize: '20px',
  },
  filterBox: {
    borderRadius: '24px',
    padding: '20px',
    marginBottom: '34px',
  },
  filterTop: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '14px',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: '16px',
  },
  resetBtn: {
    padding: '10px 15px',
    borderRadius: '14px',
    cursor: 'pointer',
    fontWeight: 900,
  },
  filterGrid: {
    display: 'grid',
    gridTemplateColumns: '1.4fr repeat(3, 1fr)',
    gap: '14px',
    alignItems: 'end',
  },
  fieldLarge: {
    minWidth: 0,
  },
  label: {
    fontSize: '13px',
    display: 'block',
    marginBottom: '7px',
    fontWeight: 900,
  },
  input: {
    width: '100%',
    padding: '12px 13px',
    borderRadius: '14px',
    outline: 'none',
    fontWeight: 800,
    boxSizing: 'border-box',
    minHeight: '46px',
  },
  sliderRow: {
    marginTop: '16px',
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
  },
  msgBox: {
    padding: '13px 18px',
    borderRadius: '14px',
    marginBottom: '22px',
    fontWeight: 800,
  },
  courseSection: {
    marginBottom: '46px',
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: '14px',
    marginBottom: '18px',
    flexWrap: 'wrap',
  },
  sectionTitle: {
    margin: 0,
    fontSize: '24px',
    fontWeight: 950,
  },
  sectionSubtitle: {
    margin: '6px 0 0',
    fontSize: '14px',
  },
  countBadge: {
    fontWeight: 900,
    padding: '8px 13px',
    borderRadius: '999px',
    fontSize: '13px',
  },
  courseGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '24px',
  },
  courseCard: {
    borderRadius: '24px',
    overflow: 'hidden',
    cursor: 'pointer',
    minHeight: '515px',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
  },
  thumbnailWrap: {
    height: '220px',
    position: 'relative',
    overflow: 'hidden',
    background: '#111827',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
  },
  emptyThumb: {
    width: '100%',
    height: '100%',
    display: 'grid',
    placeItems: 'center',
    fontSize: '52px',
  },
  badgeRow: {
    position: 'absolute',
    top: '14px',
    left: '14px',
    right: '14px',
    display: 'flex',
    justifyContent: 'space-between',
    gap: '10px',
    alignItems: 'center',
  },
  priceBadge: {
    color: '#fff',
    padding: '7px 11px',
    borderRadius: '999px',
    fontSize: '12px',
    fontWeight: 950,
    boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
  },
  ownedBadge: {
    background: 'rgba(34,197,94,0.95)',
    color: '#fff',
    padding: '7px 11px',
    borderRadius: '999px',
    fontSize: '12px',
    fontWeight: 950,
    boxShadow: '0 8px 24px rgba(34,197,94,0.22)',
  },
  cardBody: {
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
  },
  cardTitle: {
    margin: '0 0 9px',
    fontSize: '18px',
    fontWeight: 950,
    lineHeight: 1.3,
  },
  cardDesc: {
    fontSize: '13px',
    margin: '0 0 16px',
    lineHeight: 1.65,
    minHeight: '64px',
  },
  metaGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px',
    marginBottom: '18px',
  },
  metaPill: {
    padding: '9px 10px',
    borderRadius: '13px',
    fontSize: '12px',
    fontWeight: 850,
  },
  bottomRow: {
    marginTop: 'auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px',
  },
  priceLabel: {
    margin: '0 0 3px',
    fontSize: '12px',
    fontWeight: 800,
  },
  actionBtn: {
    padding: '11px 16px',
    color: '#ffffff',
    border: 'none',
    borderRadius: '14px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 950,
    minWidth: '120px',
    boxShadow: '0 10px 24px rgba(0,0,0,0.16)',
  },
  emptyBox: {
    padding: '28px',
    borderRadius: '20px',
    textAlign: 'center',
    fontWeight: 800,
  },
  emptyIcon: {
    fontSize: '32px',
    marginBottom: '8px',
  },
};

export default Courses;