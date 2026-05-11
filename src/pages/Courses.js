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

  const [isMobile, setIsMobile] = useState(false);

  const theme = useTheme();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  // ✅ SUPER SAFE ARRAY NORMALIZER
  // Backend kabhi direct array bhejta hai:
  // [...]
  //
  // Kabhi object:
  // { courses: [...] }
  // { data: [...] }
  // { data: { courses: [...] } }
  // { success: true, courses: [...] }
  //
  // Is function se app crash bhi nahi hoga aur nested data bhi pick ho jayega.
  const normalizeArray = (value, possibleKeys = []) => {
    if (Array.isArray(value)) return value;

    if (!value || typeof value !== 'object') return [];

    // ✅ Direct possible keys
    for (const key of possibleKeys) {
      if (Array.isArray(value?.[key])) return value[key];
    }

    // ✅ Common direct keys
    if (Array.isArray(value?.data)) return value.data;
    if (Array.isArray(value?.result)) return value.result;
    if (Array.isArray(value?.items)) return value.items;
    if (Array.isArray(value?.results)) return value.results;
    if (Array.isArray(value?.docs)) return value.docs;
    if (Array.isArray(value?.list)) return value.list;

    // ✅ Nested: { data: { courses: [] } }
    if (value?.data && typeof value.data === 'object') {
      for (const key of possibleKeys) {
        if (Array.isArray(value.data?.[key])) return value.data[key];
      }

      if (Array.isArray(value.data?.data)) return value.data.data;
      if (Array.isArray(value.data?.result)) return value.data.result;
      if (Array.isArray(value.data?.items)) return value.data.items;
      if (Array.isArray(value.data?.results)) return value.data.results;
      if (Array.isArray(value.data?.docs)) return value.data.docs;
      if (Array.isArray(value.data?.list)) return value.data.list;
    }

    // ✅ Extra deep fallback: object ke andar pehla array mil jaye to use karlo
    // Example: { success: true, payload: { courses: [...] } }
    const values = Object.values(value);

    for (const item of values) {
      if (Array.isArray(item)) return item;

      if (item && typeof item === 'object') {
        for (const key of possibleKeys) {
          if (Array.isArray(item?.[key])) return item[key];
        }

        if (Array.isArray(item?.data)) return item.data;
        if (Array.isArray(item?.items)) return item.items;
        if (Array.isArray(item?.results)) return item.results;
        if (Array.isArray(item?.docs)) return item.docs;
      }
    }

    return [];
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 900);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    fetchCourses();

    if (token) {
      fetchEnrolled();
    } else {
      setEnrolledIds([]);
    }

    // eslint-disable-next-line
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setMsg('');

      const res = await axios.get(`${API}/api/courses`);

      console.log('✅ API BASE:', API);
      console.log('✅ COURSES RAW RESPONSE:', res.data);
      console.log('✅ COURSES RESPONSE TYPE:', typeof res.data);
      console.log('✅ IS RESPONSE ARRAY:', Array.isArray(res.data));

      const courseData = normalizeArray(res.data, [
        'courses',
        'allCourses',
        'courseData',
        'courseList',
        'docs',
        'items',
        'results',
      ]);

      console.log('✅ NORMALIZED COURSES:', courseData);
      console.log('✅ NORMALIZED COURSES LENGTH:', courseData.length);

      setCourses(courseData);

      const maxCoursePrice =
        courseData.length > 0
          ? Math.max(100, ...courseData.map((c) => Number(c?.price || 0)))
          : 500;

      setSliderMax(maxCoursePrice);

      if (courseData.length > 0) {
        fetchLiveCounts(courseData);
      } else {
        setLiveCounts({});
        setMsg('⚠️ Courses API connected, but backend se courses array nahi aa raha.');
        setTimeout(() => setMsg(''), 6000);
      }
    } catch (err) {
      console.log('❌ COURSES FETCH ERROR:', err);
      console.log('❌ COURSES ERROR RESPONSE:', err.response?.data);
      console.log('❌ COURSES ERROR STATUS:', err.response?.status);

      setCourses([]);
      setLiveCounts({});

      setMsg(
        '⚠️ Courses load failed: ' +
          (err.response?.data?.message || err.message || 'Unknown error')
      );

      setTimeout(() => setMsg(''), 7000);
    } finally {
      setLoading(false);
    }
  };

  const fetchLiveCounts = async (courseList = []) => {
    try {
      const freshToken = localStorage.getItem('token');
      const counts = {};
      const safeCourseList = Array.isArray(courseList) ? courseList : [];

      await Promise.all(
        safeCourseList.map(async (course) => {
          if (!course?._id) return;

          try {
            const res = await axios.get(
              `${API}/api/live-classes/course/${course._id}`,
              {
                headers: freshToken
                  ? {
                      Authorization: `Bearer ${freshToken}`,
                    }
                  : {},
              }
            );

            const liveData = normalizeArray(res.data, [
              'liveClasses',
              'classes',
              'data',
              'items',
              'results',
            ]);

            counts[course._id] = liveData.length;
          } catch (err) {
            console.log(`LIVE COUNT ERROR FOR ${course?.title || course?._id}:`, err);
            counts[course._id] = 0;
          }
        })
      );

      setLiveCounts(counts);
    } catch (err) {
      console.log('LIVE COUNTS ERROR:', err);
      setLiveCounts({});
    }
  };

  const fetchEnrolled = async () => {
    try {
      const freshToken = localStorage.getItem('token');

      if (!freshToken) {
        setEnrolledIds([]);
        return;
      }

      const res = await axios.get(`${API}/api/enroll/my/courses`, {
        headers: { Authorization: `Bearer ${freshToken}` },
      });

      console.log('✅ ENROLLED RAW RESPONSE:', res.data);

      const enrolledData = normalizeArray(res.data, [
        'courses',
        'enrolledCourses',
        'myCourses',
        'ownedCourses',
        'data',
        'items',
        'results',
      ]);

      console.log('✅ NORMALIZED ENROLLED:', enrolledData);

      setEnrolledIds(enrolledData.map((c) => c?._id).filter(Boolean));
    } catch (err) {
      console.log('ENROLLED FETCH ERROR:', err);
      console.log('ENROLLED ERROR RESPONSE:', err.response?.data);
      setEnrolledIds([]);
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

    if (!course.isFree && Number(course.price || 0) > 0) {
      navigate(`/courses/${course._id}`);
      return;
    }

    try {
      const res = await axios.post(
        `${API}/api/enroll/${course._id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMsg('✅ ' + (res.data?.message || 'Course enrolled successfully'));

      setEnrolledIds((prev) =>
        prev.includes(course._id) ? prev : [...prev, course._id]
      );

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
    const price = Number(course?.price || 0);

    if (priceFilter === 'free') {
      return course?.isFree || price === 0;
    }

    if (priceFilter === 'paid') {
      return !course?.isFree && price > 0;
    }

    if (priceFilter === 'custom') {
      const min = minPrice === '' ? 0 : Number(minPrice);
      const max = maxPrice === '' ? sliderMax : Number(maxPrice);

      return price >= min && price <= max;
    }

    return true;
  };

  const safeCourses = Array.isArray(courses) ? courses : [];
  const safeEnrolledIds = Array.isArray(enrolledIds) ? enrolledIds : [];

  const filteredCourses = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return safeCourses.filter((course) => {
      const matchesPrice = applyPriceFilter(course);

      const title = course?.title || '';
      const description = course?.description || '';

      const matchesSearch =
        !searchValue ||
        title.toLowerCase().includes(searchValue) ||
        description.toLowerCase().includes(searchValue);

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

  const totalVideos = safeCourses.reduce(
    (sum, c) => sum + (Array.isArray(c?.videos) ? c.videos.length : 0),
    0
  );

  const totalPdfs = safeCourses.reduce(
    (sum, c) => sum + (Array.isArray(c?.pdfs) ? c.pdfs.length : 0),
    0
  );

  const statCards = [
    { icon: '📚', label: 'Courses', value: safeCourses.length },
    { icon: '🎥', label: 'Videos', value: totalVideos },
    { icon: '📄', label: 'PDFs', value: totalPdfs },
    { icon: '✅', label: 'Owned', value: safeEnrolledIds.length },
  ];

  const CourseCard = ({ course, index }) => {
    const owned = isEnrolled(course._id);
    const liveCount = liveCounts?.[course._id] || 0;
    const isFreeCourse = course.isFree || Number(course.price || 0) === 0;

    return (
      <Reveal key={course._id || index} delay={index * 0.04}>
        <motion.div
          whileHover={{ y: -4 }}
          whileTap={{ scale: 0.995 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          onClick={() => openCourseDetail(course)}
          style={{
            ...styles.courseCard(isMobile),
            background: theme.card,
            border: `1px solid ${theme.border}`,
            boxShadow: theme.shadow,
            backdropFilter: theme.glass,
            WebkitBackdropFilter: theme.glass,
          }}
        >
          <div
            style={{
              ...styles.thumbnailWrap(isMobile),
              borderBottom: `1px solid ${theme.border}`,
              background: theme.isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc',
            }}
          >
            {course.thumbnail ? (
              <img
                src={course.thumbnail}
                alt={course.title || 'Course thumbnail'}
                style={styles.thumbnail}
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
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

            <div style={styles.badgeRow(isMobile)}>
              <span
                style={{
                  ...styles.priceBadge(isMobile),
                  background: isFreeCourse
                    ? 'rgba(34, 197, 94, 0.95)'
                    : 'rgba(249, 115, 22, 0.95)',
                }}
              >
                {isFreeCourse ? '🆓 Free' : `₹${course.price}`}
              </span>

              {owned && <span style={styles.ownedBadge(isMobile)}>✅ Owned</span>}
            </div>
          </div>

          <div style={styles.cardBody(isMobile)}>
            <div style={styles.titleDescBlock(isMobile)}>
              <h3 style={{ ...styles.cardTitle(isMobile), color: theme.text }}>
                {course.title || 'Untitled Course'}
              </h3>

              <p style={{ ...styles.cardDesc(isMobile), color: theme.muted }}>
                {course.description || 'No description available for this course yet.'}
              </p>
            </div>

            <div style={styles.metaBlock(isMobile)}>
              <div style={styles.metaGrid(isMobile)}>
                <div
                  style={{
                    ...styles.metaPill(isMobile),
                    background: theme.isDark
                      ? 'rgba(255,255,255,0.035)'
                      : 'rgba(255,255,255,0.72)',
                    border: `1px solid ${theme.border}`,
                    color: theme.text,
                  }}
                >
                  🎥 {Array.isArray(course.videos) ? course.videos.length : 0} Videos
                </div>

                <div
                  style={{
                    ...styles.metaPill(isMobile),
                    background: theme.isDark
                      ? 'rgba(255,255,255,0.035)'
                      : 'rgba(255,255,255,0.72)',
                    border: `1px solid ${theme.border}`,
                    color: theme.text,
                  }}
                >
                  📄 {Array.isArray(course.pdfs) ? course.pdfs.length : 0} PDFs
                </div>
              </div>

              <div
                style={{
                  ...styles.livePill(isMobile),
                  background:
                    liveCount > 0
                      ? 'rgba(239, 68, 68, 0.12)'
                      : theme.isDark
                      ? 'rgba(255,255,255,0.035)'
                      : 'rgba(255,255,255,0.72)',
                  border: `1px solid ${
                    liveCount > 0 ? 'rgba(248,113,113,0.35)' : theme.border
                  }`,
                  color: liveCount > 0 ? '#f87171' : theme.text,
                }}
              >
                🔴 {liveCount} Live Classes
              </div>
            </div>

            <div style={styles.bottomRow(isMobile)}>
              <div>
                <p style={{ ...styles.priceLabel(isMobile), color: theme.muted }}>
                  Course Price
                </p>
                <strong
                  style={{
                    color: isFreeCourse ? theme.success : '#f97316',
                    fontSize: isMobile ? '20px' : '22px',
                    fontWeight: 950,
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
                  ...styles.actionBtn(isMobile),
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

  const CourseSection = ({ title, subtitle, data, emptyText }) => {
    const safeData = Array.isArray(data) ? data : [];

    return (
      <section style={styles.courseSection(isMobile)}>
        <div style={styles.sectionHeader(isMobile)}>
          <div>
            <h3 style={{ ...styles.sectionTitle(isMobile), color: theme.text }}>
              {title}
            </h3>
            <p style={{ ...styles.sectionSubtitle(isMobile), color: theme.muted }}>
              {subtitle}
            </p>
          </div>

          <span
            style={{
              ...styles.countBadge(isMobile),
              color: theme.primary,
              background: theme.isDark
                ? 'rgba(139,92,246,0.12)'
                : 'rgba(139,92,246,0.10)',
              border: `1px solid ${theme.border}`,
            }}
          >
            {safeData.length} courses
          </span>
        </div>

        {safeData.length === 0 ? (
          <div
            style={{
              ...styles.emptyBox(isMobile),
              background: theme.card,
              border: `1px solid ${theme.border}`,
              color: theme.muted,
            }}
          >
            <div style={styles.emptyIcon}>🔎</div>
            <p style={{ margin: 0 }}>{emptyText}</p>
          </div>
        ) : (
          <div style={styles.courseGrid(isMobile)}>
            {safeData.map((course, index) => (
              <CourseCard key={course._id || index} course={course} index={index} />
            ))}
          </div>
        )}
      </section>
    );
  };

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
        <Reveal>
          <div
            style={{
              ...styles.hero(isMobile),
              background: theme.card,
              border: `1px solid ${theme.border}`,
              boxShadow: theme.shadow,
              backdropFilter: theme.glass,
              WebkitBackdropFilter: theme.glass,
              borderRadius: theme.radius,
            }}
          >
            <div style={{ minWidth: 0 }}>
              <p style={{ ...styles.kicker(isMobile), color: theme.primary }}>
                📚 COURSE LIBRARY
              </p>

              <h2 style={{ ...styles.heroTitle(isMobile), color: theme.text }}>
                Learn smarter with organized courses.
              </h2>

              <p style={{ ...styles.heroText(isMobile), color: theme.muted }}>
                Search, filter, preview, and continue your learning journey from one clean dashboard.
              </p>
            </div>

            <div style={styles.statGrid(isMobile)}>
              {statCards.map((item) => (
                <div
                  key={item.label}
                  style={{
                    ...styles.statCard(isMobile),
                    background: theme.isDark
                      ? 'rgba(255,255,255,0.035)'
                      : 'rgba(255,255,255,0.72)',
                    border: `1px solid ${theme.border}`,
                  }}
                >
                  <span style={styles.statIcon(isMobile)}>{item.icon}</span>
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
              ...styles.filterBox(isMobile),
              background: theme.card,
              border: `1px solid ${theme.border}`,
              boxShadow: theme.shadow,
              backdropFilter: theme.glass,
              WebkitBackdropFilter: theme.glass,
            }}
          >
            <div style={styles.filterTop(isMobile)}>
              <div style={{ minWidth: 0 }}>
                <h3
                  style={{
                    margin: 0,
                    color: theme.text,
                    fontSize: isMobile ? '16px' : '18px',
                  }}
                >
                  🎛️ Find your course
                </h3>
                <p
                  style={{
                    margin: '5px 0 0',
                    color: theme.muted,
                    fontSize: '13px',
                    lineHeight: 1.5,
                  }}
                >
                  Search and filter courses to quickly find the perfect match for your learning goals.
                </p>
              </div>

              <button
                onClick={resetFilters}
                style={{
                  ...styles.resetBtn(isMobile),
                  border: `1px solid ${theme.border}`,
                  background: theme.isDark
                    ? 'rgba(255,255,255,0.035)'
                    : 'rgba(255,255,255,0.72)',
                  color: theme.text,
                }}
              >
                Reset
              </button>
            </div>

            <div style={styles.filterGrid(isMobile)}>
              <div style={styles.fieldLarge}>
                <label style={{ ...styles.label, color: theme.muted }}>
                  Search Course
                </label>

                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by title or description..."
                  style={{
                    ...styles.input(isMobile),
                    background: theme.isDark
                      ? 'rgba(15, 23, 42, 0.72)'
                      : 'rgba(255,255,255,0.82)',
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
                    ...styles.input(isMobile),
                    background: theme.isDark
                      ? 'rgba(15, 23, 42, 0.72)'
                      : 'rgba(255,255,255,0.82)',
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
                    ...styles.input(isMobile),
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
                    ...styles.input(isMobile),
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

            <div style={styles.sliderRow(isMobile)}>
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

              <span
                style={{
                  color: theme.muted,
                  fontSize: '12px',
                  fontWeight: 800,
                }}
              >
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
                ...styles.msgBox(isMobile),
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
          <div style={{ ...styles.emptyBox(isMobile), color: theme.muted }}>
            Loading courses...
          </div>
        ) : safeCourses.length === 0 ? (
          <Reveal>
            <div
              style={{
                ...styles.emptyBox(isMobile),
                background: theme.card,
                border: `1px solid ${theme.border}`,
                color: theme.muted,
              }}
            >
              <div style={styles.emptyIcon}>🚀</div>
              <p style={{ margin: 0 }}>No courses available for now.</p>
              <p
                style={{
                  margin: '8px 0 0',
                  fontSize: isMobile ? '12px' : '13px',
                  opacity: 0.8,
                  lineHeight: 1.5,
                }}
              >
                Console mein <b>✅ COURSES RAW RESPONSE</b> check kar. Agar response mein courses hain, frontend pick kar lega.
              </p>
            </div>
          </Reveal>
        ) : (
          <>
            <CourseSection
              title="🛒 Not Owned"
              subtitle="These courses are not yet owned by you."
              data={notOwnedCourses}
              emptyText="No courses found matching your criteria."
            />

            <CourseSection
              title="✅ Already Enrolled"
              subtitle="These courses are already owned/enrolled by you."
              data={enrolledCourses}
              emptyText="No enrolled courses found."
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

  page: (isMobile) => ({
    maxWidth: '1200px',
    margin: '0 auto',
    padding: isMobile ? '24px 14px' : '40px 20px',
    position: 'relative',
    zIndex: 1,
    width: '100%',
  }),

  hero: (isMobile) => ({
    padding: isMobile ? '24px 18px' : '30px',
    marginBottom: isMobile ? '18px' : '24px',
    display: 'grid',
    gridTemplateColumns: isMobile ? '1fr' : '1.25fr 0.75fr',
    gap: isMobile ? '20px' : '24px',
    alignItems: 'center',
    width: '100%',
    overflow: 'hidden',
  }),

  kicker: (isMobile) => ({
    margin: '0 0 8px',
    fontWeight: 950,
    letterSpacing: '0.5px',
    fontSize: isMobile ? '12px' : '13px',
    lineHeight: 1.4,
  }),

  heroTitle: (isMobile) => ({
    fontSize: isMobile ? 'clamp(30px, 10vw, 42px)' : 'clamp(30px, 4vw, 48px)',
    lineHeight: 1.08,
    margin: '0 0 12px',
    fontWeight: 950,
    letterSpacing: '-0.8px',
    wordBreak: 'normal',
  }),

  heroText: (isMobile) => ({
    margin: 0,
    lineHeight: 1.7,
    fontSize: isMobile ? '14px' : '15px',
    maxWidth: '700px',
  }),

  statGrid: (isMobile) => ({
    display: 'grid',
    gridTemplateColumns: isMobile
      ? 'repeat(2, minmax(0, 1fr))'
      : 'repeat(2, minmax(120px, 1fr))',
    gap: isMobile ? '10px' : '12px',
    width: '100%',
    minWidth: 0,
  }),

  statCard: (isMobile) => ({
    padding: isMobile ? '13px 12px' : '14px',
    borderRadius: '18px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    minHeight: isMobile ? '82px' : '86px',
    minWidth: 0,
    fontSize: isMobile ? '13px' : '14px',
  }),

  statIcon: (isMobile) => ({
    fontSize: isMobile ? '19px' : '20px',
  }),

  filterBox: (isMobile) => ({
    borderRadius: isMobile ? '20px' : '24px',
    padding: isMobile ? '16px' : '20px',
    marginBottom: isMobile ? '26px' : '34px',
    width: '100%',
    overflow: 'hidden',
  }),

  filterTop: (isMobile) => ({
    display: 'flex',
    justifyContent: 'space-between',
    gap: '14px',
    alignItems: isMobile ? 'flex-start' : 'center',
    flexWrap: 'wrap',
    marginBottom: '16px',
  }),

  resetBtn: (isMobile) => ({
    padding: isMobile ? '9px 13px' : '10px 15px',
    borderRadius: '14px',
    cursor: 'pointer',
    fontWeight: 900,
    width: isMobile ? '100%' : 'auto',
  }),

  filterGrid: (isMobile) => ({
    display: 'grid',
    gridTemplateColumns: isMobile ? '1fr' : '1.4fr repeat(3, 1fr)',
    gap: isMobile ? '12px' : '14px',
    alignItems: 'end',
    width: '100%',
  }),

  fieldLarge: {
    minWidth: 0,
  },

  label: {
    fontSize: '13px',
    display: 'block',
    marginBottom: '7px',
    fontWeight: 900,
  },

  input: (isMobile) => ({
    width: '100%',
    padding: isMobile ? '12px 12px' : '12px 13px',
    borderRadius: '14px',
    outline: 'none',
    fontWeight: 800,
    boxSizing: 'border-box',
    minHeight: '46px',
    fontSize: isMobile ? '16px' : '14px',
  }),

  sliderRow: (isMobile) => ({
    marginTop: '16px',
    display: 'flex',
    flexDirection: isMobile ? 'column' : 'row',
    gap: isMobile ? '8px' : '12px',
    alignItems: isMobile ? 'stretch' : 'center',
    width: '100%',
  }),

  msgBox: (isMobile) => ({
    padding: isMobile ? '12px 14px' : '13px 18px',
    borderRadius: '14px',
    marginBottom: '22px',
    fontWeight: 800,
    fontSize: isMobile ? '13px' : '14px',
  }),

  courseSection: (isMobile) => ({
    marginBottom: isMobile ? '34px' : '46px',
    width: '100%',
  }),

  sectionHeader: (isMobile) => ({
    display: 'flex',
    alignItems: isMobile ? 'flex-start' : 'flex-end',
    justifyContent: 'space-between',
    gap: '14px',
    marginBottom: '18px',
    flexWrap: 'wrap',
  }),

  sectionTitle: (isMobile) => ({
    margin: 0,
    fontSize: isMobile ? '21px' : '24px',
    fontWeight: 950,
    lineHeight: 1.25,
  }),

  sectionSubtitle: (isMobile) => ({
    margin: '6px 0 0',
    fontSize: isMobile ? '13px' : '14px',
    lineHeight: 1.5,
  }),

  countBadge: (isMobile) => ({
    fontWeight: 900,
    padding: '8px 13px',
    borderRadius: '999px',
    fontSize: isMobile ? '12px' : '13px',
  }),

  courseGrid: (isMobile) => ({
    display: 'grid',
    gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: isMobile ? '18px' : '24px',
    alignItems: 'stretch',
    width: '100%',
  }),

  courseCard: (isMobile) => ({
    borderRadius: isMobile ? '20px' : '24px',
    overflow: 'hidden',
    cursor: 'pointer',
    minHeight: isMobile ? 'auto' : '630px',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    width: '100%',
  }),

  thumbnailWrap: (isMobile) => ({
    height: isMobile ? '195px' : '255px',
    minHeight: isMobile ? '195px' : '255px',
    maxHeight: isMobile ? '195px' : '255px',
    position: 'relative',
    overflow: 'hidden',
  }),

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

  badgeRow: (isMobile) => ({
    position: 'absolute',
    top: isMobile ? '12px' : '14px',
    left: isMobile ? '12px' : '14px',
    right: isMobile ? '12px' : '14px',
    display: 'flex',
    justifyContent: 'space-between',
    gap: '8px',
    alignItems: 'center',
    flexWrap: 'wrap',
  }),

  priceBadge: (isMobile) => ({
    color: '#fff',
    padding: isMobile ? '6px 10px' : '7px 11px',
    borderRadius: '999px',
    fontSize: isMobile ? '11px' : '12px',
    fontWeight: 950,
    boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
  }),

  ownedBadge: (isMobile) => ({
    background: 'rgba(34,197,94,0.95)',
    color: '#fff',
    padding: isMobile ? '6px 10px' : '7px 11px',
    borderRadius: '999px',
    fontSize: isMobile ? '11px' : '12px',
    fontWeight: 950,
    boxShadow: '0 8px 24px rgba(34,197,94,0.22)',
  }),

  cardBody: (isMobile) => ({
    padding: isMobile ? '16px' : '20px',
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
  }),

  titleDescBlock: (isMobile) => ({
    minHeight: isMobile ? 'auto' : '138px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
  }),

  cardTitle: (isMobile) => ({
    margin: 0,
    fontSize: isMobile ? '18px' : '20px',
    fontWeight: 950,
    lineHeight: 1.25,
    minHeight: isMobile ? 'auto' : '56px',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  }),

  cardDesc: (isMobile) => ({
    fontSize: isMobile ? '13px' : '14px',
    marginTop: '10px',
    marginBottom: 0,
    lineHeight: 1.65,
    minHeight: isMobile ? 'auto' : '70px',
    display: '-webkit-box',
    WebkitLineClamp: isMobile ? 2 : 3,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  }),

  metaBlock: (isMobile) => ({
    marginTop: isMobile ? '14px' : '18px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    minHeight: isMobile ? 'auto' : '118px',
  }),

  metaGrid: (isMobile) => ({
    display: 'grid',
    gridTemplateColumns: isMobile ? '1fr 1fr' : '1fr 1fr',
    gap: isMobile ? '8px' : '12px',
  }),

  metaPill: (isMobile) => ({
    padding: isMobile ? '10px 9px' : '12px 14px',
    borderRadius: '16px',
    fontSize: isMobile ? '12px' : '14px',
    fontWeight: 850,
    textAlign: 'center',
    minWidth: 0,
  }),

  livePill: (isMobile) => ({
    padding: isMobile ? '10px 12px' : '12px 14px',
    borderRadius: '16px',
    fontSize: isMobile ? '12px' : '14px',
    fontWeight: 850,
    textAlign: 'center',
  }),

  bottomRow: (isMobile) => ({
    marginTop: 'auto',
    paddingTop: isMobile ? '16px' : '18px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: isMobile ? '12px' : '14px',
    flexWrap: isMobile ? 'wrap' : 'nowrap',
  }),

  priceLabel: (isMobile) => ({
    margin: '0 0 6px',
    fontSize: isMobile ? '12px' : '13px',
    fontWeight: 800,
  }),

  actionBtn: (isMobile) => ({
    minWidth: isMobile ? '130px' : '142px',
    flex: isMobile ? '1 1 130px' : '0 0 auto',
    padding: isMobile ? '13px 14px' : '14px 18px',
    color: '#ffffff',
    border: 'none',
    borderRadius: '16px',
    cursor: 'pointer',
    fontSize: isMobile ? '14px' : '15px',
    fontWeight: 950,
    boxShadow: '0 10px 24px rgba(0,0,0,0.16)',
  }),

  emptyBox: (isMobile) => ({
    padding: isMobile ? '22px 16px' : '28px',
    borderRadius: '20px',
    textAlign: 'center',
    fontWeight: 800,
    fontSize: isMobile ? '13px' : '14px',
  }),

  emptyIcon: {
    fontSize: '32px',
    marginBottom: '8px',
  },
};

export default Courses;