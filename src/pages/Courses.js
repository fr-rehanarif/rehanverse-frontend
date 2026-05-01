import { useEffect, useState } from 'react';
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

  // ✅ Filter states
  const [priceFilter, setPriceFilter] = useState('all'); // all, free, paid, custom
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sliderMax, setSliderMax] = useState(500);

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
      const res = await axios.get(`${API}/api/courses`);
      setCourses(res.data);

      const maxCoursePrice = Math.max(
        100,
        ...res.data.map((c) => Number(c.price || 0))
      );

      setSliderMax(maxCoursePrice);

      fetchLiveCounts(res.data);
    } catch (err) {
      console.log('COURSES FETCH ERROR:', err);
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

  // ✅ Course detail preview page open
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

    // ✅ Already enrolled course direct My Courses
    if (isEnrolled(course._id)) {
      navigate('/my-courses');
      return;
    }

    // ✅ PAID COURSE: direct payment nahi, pehle preview CourseDetail page
    if (!course.isFree) {
      navigate(`/courses/${course._id}`);
      return;
    }

    // ✅ FREE COURSE: enroll + redirect
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

  const filteredCourses = courses.filter(applyPriceFilter);

  const enrolledCourses = filteredCourses.filter((course) =>
    isEnrolled(course._id)
  );

  const notOwnedCourses = filteredCourses.filter(
    (course) => !isEnrolled(course._id)
  );

  const CourseCard = ({ course, index }) => (
    <Reveal key={course._id} delay={index * 0.05}>
      <motion.div
        whileHover={{ y: -8, scale: 1.02 }}
        transition={{ type: 'spring', stiffness: 200 }}
        onClick={() => openCourseDetail(course)}
        style={{
          background: theme.card,
          border: `1px solid ${theme.border}`,
          borderRadius: '20px',
          overflow: 'hidden',
          boxShadow: theme.shadow,
          cursor: 'pointer',
          backdropFilter: theme.glass,
          minHeight: '500px',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
        }}
      >
        {isEnrolled(course._id) && (
          <div
            style={{
              position: 'absolute',
              top: '14px',
              right: '14px',
              zIndex: 5,
              background: 'rgba(34,197,94,0.95)',
              color: '#fff',
              padding: '6px 10px',
              borderRadius: '999px',
              fontSize: '12px',
              fontWeight: '800',
              boxShadow: '0 8px 25px rgba(34,197,94,0.25)',
            }}
          >
            ✅ Owned
          </div>
        )}

        {course.thumbnail ? (
          <img
            src={course.thumbnail}
            alt={course.title}
            style={{
              width: '100%',
              height: '220px',
              objectFit: 'cover',
              display: 'block',
            }}
          />
        ) : (
          <div
            style={{
              width: '100%',
              height: '220px',
              background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span style={{ fontSize: '48px' }}>🎓</span>
          </div>
        )}

        <div
          style={{
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            flexGrow: 1,
          }}
        >
          <h3
            style={{
              color: theme.text,
              marginBottom: '8px',
              fontSize: '17px',
              marginTop: 0,
            }}
          >
            {course.title}
          </h3>

          <p
            style={{
              color: theme.muted,
              fontSize: '13px',
              marginBottom: '12px',
              lineHeight: '1.6',
              minHeight: '64px',
            }}
          >
            {course.description?.slice(0, 80)}...
          </p>

          <div
            style={{
              display: 'flex',
              gap: '12px',
              marginBottom: '16px',
              flexWrap: 'wrap',
            }}
          >
            <span style={{ fontSize: '12px', color: theme.muted }}>
              📹 {course.videos?.length || 0} videos
            </span>

            <span style={{ fontSize: '12px', color: theme.muted }}>
              📄 {course.pdfs?.length || 0} PDFs
            </span>

            <span
              style={{
                fontSize: '12px',
                color:
                  (liveCounts[course._id] || 0) > 0 ? '#f87171' : theme.muted,
                fontWeight: (liveCounts[course._id] || 0) > 0 ? '700' : '400',
              }}
            >
              🔴 {liveCounts[course._id] || 0} Live Classes
            </span>
          </div>

          <div
            style={{
              marginTop: 'auto',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <span
              style={{
                fontWeight: '700',
                fontSize: '18px',
                color: theme.primary,
              }}
            >
              {course.isFree ? '🆓 Free' : `₹${course.price}`}
            </span>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                handleEnroll(course);
              }}
              style={{
                padding: '10px 20px',
                background: isEnrolled(course._id)
                  ? theme.success
                  : theme.primary,
                color: theme.buttonText,
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                boxShadow: theme.shadow,
                minWidth: '150px',
              }}
            >
              {isEnrolled(course._id)
                ? '✅ Enrolled'
                : course.isFree
                ? 'Enroll for Free'
                : 'Preview & Enroll'}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </Reveal>
  );

  const CourseSection = ({ title, subtitle, data, emptyText }) => (
    <div style={{ marginBottom: '42px' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: '14px',
          marginBottom: '18px',
          flexWrap: 'wrap',
        }}
      >
        <div>
          <h3
            style={{
              color: theme.text,
              margin: 0,
              fontSize: '22px',
            }}
          >
            {title}
          </h3>
          <p
            style={{
              color: theme.muted,
              margin: '6px 0 0',
              fontSize: '14px',
            }}
          >
            {subtitle}
          </p>
        </div>

        <span
          style={{
            color: theme.primary,
            fontWeight: '800',
            background:
              theme.mode === 'dark'
                ? 'rgba(139,92,246,0.12)'
                : 'rgba(139,92,246,0.10)',
            border: `1px solid ${theme.border}`,
            padding: '7px 12px',
            borderRadius: '999px',
            fontSize: '13px',
          }}
        >
          {data.length} courses
        </span>
      </div>

      {data.length === 0 ? (
        <div
          style={{
            padding: '18px',
            borderRadius: '16px',
            border: `1px solid ${theme.border}`,
            background: theme.card,
            color: theme.muted,
            textAlign: 'center',
          }}
        >
          {emptyText}
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '24px',
          }}
        >
          {data.map((course, index) => (
            <CourseCard key={course._id} course={course} index={index} />
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div
      style={{
        background: theme.bg,
        minHeight: '100vh',
        transition: 'all 0.3s ease',
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
        <Reveal>
          <div>
            <h2 style={{ color: theme.primary, marginBottom: '8px' }}>
              📚 All Courses
            </h2>

            <p style={{ color: theme.muted, marginBottom: '30px' }}>
              Start Today !! .... Tomorrow never comes..
            </p>
          </div>
        </Reveal>

        {/* ✅ Premium Filter Box */}
        <Reveal>
          <div
            style={{
              background: theme.card,
              border: `1px solid ${theme.border}`,
              borderRadius: '20px',
              padding: '18px',
              marginBottom: '28px',
              boxShadow: theme.shadow,
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: '14px',
                alignItems: 'center',
                flexWrap: 'wrap',
                marginBottom: '16px',
              }}
            >
              <div>
                <h3
                  style={{
                    margin: 0,
                    color: theme.text,
                    fontSize: '18px',
                  }}
                >
                  🎛️ Filter Courses
                </h3>
                <p
                  style={{
                    margin: '5px 0 0',
                    color: theme.muted,
                    fontSize: '13px',
                  }}
                >
                  Price ke hisaab se course quickly find karo.
                </p>
              </div>

              <button
                onClick={resetFilters}
                style={{
                  padding: '9px 14px',
                  borderRadius: '12px',
                  border: `1px solid ${theme.border}`,
                  background: theme.bg,
                  color: theme.text,
                  cursor: 'pointer',
                  fontWeight: '700',
                }}
              >
                Reset
              </button>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '14px',
                alignItems: 'end',
              }}
            >
              <div>
                <label
                  style={{
                    color: theme.muted,
                    fontSize: '13px',
                    display: 'block',
                    marginBottom: '7px',
                  }}
                >
                  Course Type
                </label>

                <select
                  value={priceFilter}
                  onChange={(e) => setPriceFilter(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '11px 12px',
                    borderRadius: '12px',
                    border: `1px solid ${theme.border}`,
                    background: theme.bg,
                    color: theme.text,
                    outline: 'none',
                    fontWeight: '700',
                  }}
                >
                  <option value="all">All Courses</option>
                  <option value="free">Free Only</option>
                  <option value="paid">Paid Only</option>
                  <option value="custom">Custom Price Range</option>
                </select>
              </div>

              <div>
                <label
                  style={{
                    color: theme.muted,
                    fontSize: '13px',
                    display: 'block',
                    marginBottom: '7px',
                  }}
                >
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
                    width: '100%',
                    padding: '11px 12px',
                    borderRadius: '12px',
                    border: `1px solid ${theme.border}`,
                    background:
                      priceFilter === 'custom'
                        ? theme.bg
                        : 'rgba(148,163,184,0.12)',
                    color: theme.text,
                    outline: 'none',
                    fontWeight: '700',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    color: theme.muted,
                    fontSize: '13px',
                    display: 'block',
                    marginBottom: '7px',
                  }}
                >
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
                    width: '100%',
                    padding: '11px 12px',
                    borderRadius: '12px',
                    border: `1px solid ${theme.border}`,
                    background:
                      priceFilter === 'custom'
                        ? theme.bg
                        : 'rgba(148,163,184,0.12)',
                    color: theme.text,
                    outline: 'none',
                    fontWeight: '700',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    color: theme.muted,
                    fontSize: '13px',
                    display: 'block',
                    marginBottom: '7px',
                  }}
                >
                  Price Slider
                </label>

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
                    cursor:
                      priceFilter === 'custom' ? 'pointer' : 'not-allowed',
                  }}
                />

                <div
                  style={{
                    color: theme.muted,
                    fontSize: '12px',
                    marginTop: '5px',
                  }}
                >
                  ₹0 - ₹{maxPrice === '' ? sliderMax : maxPrice}
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        {msg && (
          <Reveal>
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                padding: '12px 20px',
                borderRadius: '12px',
                marginBottom: '20px',
                background: msg.includes('✅')
                  ? theme.mode === 'dark'
                    ? 'rgba(34, 197, 94, 0.15)'
                    : '#d1fae5'
                  : theme.mode === 'dark'
                  ? 'rgba(239, 68, 68, 0.15)'
                  : '#fee2e2',
                color: msg.includes('✅')
                  ? theme.mode === 'dark'
                    ? '#86efac'
                    : '#065f46'
                  : theme.mode === 'dark'
                  ? '#fca5a5'
                  : '#991b1b',
                border: `1px solid ${
                  msg.includes('✅')
                    ? theme.mode === 'dark'
                      ? 'rgba(34, 197, 94, 0.28)'
                      : '#a7f3d0'
                    : theme.mode === 'dark'
                    ? 'rgba(239, 68, 68, 0.28)'
                    : '#fecaca'
                }`,
              }}
            >
              {msg}
            </motion.div>
          </Reveal>
        )}

        {courses.length === 0 ? (
          <Reveal>
            <p
              style={{
                color: theme.muted,
                textAlign: 'center',
                marginTop: '60px',
                fontSize: '18px',
              }}
            >
              No Courses available for now ..🚀
            </p>
          </Reveal>
        ) : (
          <>
            <CourseSection
              title="🛒 Not Owned"
              subtitle="Ye courses abhi tumhare account me enrolled nahi hain."
              data={notOwnedCourses}
              emptyText="Is filter me koi not-owned course nahi mila."
            />

            <CourseSection
              title="✅ Already Enrolled"
              subtitle="Ye courses tumhare account me already owned/enrolled hain."
              data={enrolledCourses}
              emptyText="Is filter me koi enrolled course nahi mila."
            />
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}

export default Courses;