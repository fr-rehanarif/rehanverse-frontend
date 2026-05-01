import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useTheme } from '../context/ThemeContext';
import API from '../api';
import SecurityLogsPanel from '../components/SecurityLogsPanel';
import AdminNotificationSender from '../components/AdminNotificationSender';
import AdminDashboardStats from '../components/AdminDashboardStats';

function AdminPanel() {
  const theme = useTheme();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');

  const [payments, setPayments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('courses');
  const [enrolledUsers, setEnrolledUsers] = useState({});
  const [expandedCourse, setExpandedCourse] = useState(null);
  const [msg, setMsg] = useState('');
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    title: '',
    description: '',
    price: 39,
    isFree: false,
    thumbnail: '',
    videoTitle: '',
    videoUrl: '',
    pdfTitle: '',
    pdfUrl: '',
  });

  const [videos, setVideos] = useState([]);
  const [pdfs, setPdfs] = useState([]);
  const [pdfFile, setPdfFile] = useState(null);
  const [liveClasses, setLiveClasses] = useState([]);
  const [coupons, setCoupons] = useState([]);

  const [couponForm, setCouponForm] = useState({
    code: '',
    discountType: 'free',
    discountValue: '',
    course: '',
    usageLimit: '',
    expiresAt: '',
    isActive: true,
  });

  const [liveForm, setLiveForm] = useState({
    course: '',
    title: '',
    description: '',
    liveUrl: '',
    scheduledAt: '',
    durationMinutes: 60,
  });

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }

    fetchCourses();
    fetchUsers();
    fetchPayments();
    fetchCoupons();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const showConfirmToast = ({ title, message, confirmText = 'Yes, Delete', onConfirm }) => {
    const toastId = toast(
      <div>
        <div style={{ fontWeight: 900, fontSize: '16px', marginBottom: '6px' }}>
          {title}
        </div>

        <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '14px', lineHeight: '1.4' }}>
          {message}
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={async () => {
              toast.dismiss(toastId);
              await onConfirm();
            }}
            style={{
              background: 'linear-gradient(135deg, #ef4444, #991b1b)',
              color: '#fff',
              border: 'none',
              padding: '8px 14px',
              borderRadius: '10px',
              fontWeight: '800',
              cursor: 'pointer',
            }}
          >
            {confirmText}
          </button>

          <button
            onClick={() => toast.dismiss(toastId)}
            style={{
              background: 'linear-gradient(135deg, #334155, #0f172a)',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.18)',
              padding: '8px 14px',
              borderRadius: '10px',
              fontWeight: '800',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
        </div>
      </div>,
      {
        type: 'warning',
        autoClose: false,
        closeOnClick: false,
        draggable: true,
        position: 'top-right',
      }
    );
  };

  const fetchCourses = async () => {
    try {
      const res = await axios.get(`${API}/api/courses`);
      setCourses(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API}/api/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchPayments = async () => {
    try {
      const res = await axios.get(`${API}/api/payment/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPayments(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchCoupons = async () => {
    try {
      const res = await axios.get(`${API}/api/coupon/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setCoupons(res.data);
    } catch (err) {
      console.log('COUPON FETCH ERROR:', err);
    }
  };

  const createCoupon = async () => {
    try {
      if (!couponForm.code || !couponForm.discountType) {
        setMsg('❌ Coupon code aur discount type zaroori hai!');
        setTimeout(() => setMsg(''), 3000);
        return;
      }

      if (
        couponForm.discountType !== 'free' &&
        (!couponForm.discountValue || Number(couponForm.discountValue) <= 0)
      ) {
        setMsg('❌ Discount value valid hona chahiye!');
        setTimeout(() => setMsg(''), 3000);
        return;
      }

      const payload = {
        code: couponForm.code.trim().toUpperCase(),
        discountType: couponForm.discountType,
        discountValue:
          couponForm.discountType === 'free'
            ? 0
            : Number(couponForm.discountValue),
        course: couponForm.course || '',
        usageLimit: Number(couponForm.usageLimit || 0),
        expiresAt: couponForm.expiresAt || '',
        isActive: couponForm.isActive,
      };

      const res = await axios.post(`${API}/api/coupon/create`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMsg('✅ ' + (res.data.message || 'Coupon created!'));

      setCouponForm({
        code: '',
        discountType: 'free',
        discountValue: '',
        course: '',
        usageLimit: '',
        expiresAt: '',
        isActive: true,
      });

      fetchCoupons();
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      console.log('CREATE COUPON ERROR:', err);
      setMsg('❌ ' + (err.response?.data?.message || 'Coupon create failed'));
      setTimeout(() => setMsg(''), 3000);
    }
  };

  const deleteCoupon = async (id, code) => {
    showConfirmToast({
      title: 'Delete Coupon?',
      message: `Coupon "${code}" permanently delete karna hai?`,
      confirmText: 'Delete Coupon',
      onConfirm: async () => {
        try {
          const res = await axios.delete(`${API}/api/coupon/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          setMsg('✅ ' + (res.data.message || 'Coupon deleted!'));
          toast.success('✅ Coupon deleted!');
          fetchCoupons();
          setTimeout(() => setMsg(''), 3000);
        } catch (err) {
          console.log('DELETE COUPON ERROR:', err);
          const errorMsg = err.response?.data?.message || 'Coupon delete failed';
          setMsg('❌ ' + errorMsg);
          toast.error('❌ ' + errorMsg);
          setTimeout(() => setMsg(''), 3000);
        }
      },
    });
  };

  const toggleCouponStatus = async (coupon) => {
    try {
      const res = await axios.put(
        `${API}/api/coupon/${coupon._id}`,
        { isActive: !coupon.isActive },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMsg('✅ ' + (res.data.message || 'Coupon updated!'));
      fetchCoupons();
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      console.log('TOGGLE COUPON ERROR:', err);
      setMsg('❌ ' + (err.response?.data?.message || 'Coupon update failed'));
      setTimeout(() => setMsg(''), 3000);
    }
  };

  const approvePayment = async (id) => {
    try {
      const res = await axios.put(
        `${API}/api/payment/approve/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMsg('✅ ' + res.data.message);
      fetchPayments();
      fetchUsers();
      fetchCoupons();
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      setMsg('❌ ' + (err.response?.data?.message || 'Approve failed'));
      setTimeout(() => setMsg(''), 3000);
    }
  };

  const rejectPayment = async (id) => {
    try {
      const res = await axios.put(
        `${API}/api/payment/reject/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMsg('⚠️ ' + res.data.message);
      fetchPayments();
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      setMsg('❌ ' + (err.response?.data?.message || 'Reject failed'));
      setTimeout(() => setMsg(''), 3000);
    }
  };

  const deleteUser = async (id, name) => {
    showConfirmToast({
      title: 'Delete User?',
      message: `${name} ko permanently delete karna hai?`,
      confirmText: 'Delete User',
      onConfirm: async () => {
        try {
          await axios.delete(`${API}/api/users/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          toast.success(`✅ ${name} deleted successfully!`);
          fetchUsers();
        } catch (err) {
          toast.error(err.response?.data?.message || '❌ Error!');
        }
      },
    });
  };

  const fetchEnrolledUsers = async (courseId) => {
    if (expandedCourse === courseId) {
      setExpandedCourse(null);
      return;
    }

    try {
      const res = await axios.get(`${API}/api/courses/${courseId}/enrolled-users`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setEnrolledUsers({ ...enrolledUsers, [courseId]: res.data });
      setExpandedCourse(courseId);
    } catch (err) {
      console.log(err);
    }
  };

  const startEdit = (course) => {
    setEditingId(course._id);

    setForm({
      title: course.title,
      description: course.description,
      price: course.price,
      isFree: course.isFree,
      thumbnail: course.thumbnail || '',
      videoTitle: '',
      videoUrl: '',
      pdfTitle: '',
      pdfUrl: '',
    });

    setVideos(course.videos || []);
    setPdfs(course.pdfs || []);
    setPdfFile(null);
    setActiveTab('courses');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);

    setForm({
      title: '',
      description: '',
      price: 39,
      isFree: false,
      thumbnail: '',
      videoTitle: '',
      videoUrl: '',
      pdfTitle: '',
      pdfUrl: '',
    });

    setVideos([]);
    setPdfs([]);
    setPdfFile(null);
  };

  const addVideo = () => {
    if (!form.videoTitle || !form.videoUrl) return;

    setVideos([...videos, { title: form.videoTitle, url: form.videoUrl }]);
    setForm({ ...form, videoTitle: '', videoUrl: '' });
  };

  const addPdf = async () => {
    if (!form.pdfTitle || !pdfFile) {
      setMsg('❌ PDF title aur PDF file dono zaroori hain!');
      setTimeout(() => setMsg(''), 3000);
      return;
    }

    try {
      setMsg('⏳ Uploading + watermarking PDF...');

      const data = new FormData();
      data.append('pdf', pdfFile);

      const res = await axios.post(`${API}/api/upload/pdf`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      setPdfs([
        ...pdfs,
        {
          title: form.pdfTitle,
          url: res.data.url,
          filename: res.data.filename,
        },
      ]);

      setForm({ ...form, pdfTitle: '', pdfUrl: '' });
      setPdfFile(null);

      const fileInput = document.getElementById('pdfFileInput');
      if (fileInput) fileInput.value = '';

      setMsg('✅ PDF uploaded with watermark to Supabase!');
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      console.log('PDF UPLOAD ERROR:', err);
      setMsg('❌ PDF upload failed: ' + (err.response?.data?.message || err.message));
      setTimeout(() => setMsg(''), 3000);
    }
  };

  const handleSubmit = async () => {
    if (!form.title || !form.description) {
      setMsg('❌ Title aur Description zaroori hai!');
      setTimeout(() => setMsg(''), 3000);
      return;
    }

    try {
      if (editingId) {
        await axios.put(
          `${API}/api/courses/${editingId}`,
          { ...form, videos, pdfs },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setMsg('✅ Course updated!');
      } else {
        await axios.post(
          `${API}/api/courses`,
          { ...form, videos, pdfs },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setMsg('✅ Course created!');
      }

      cancelEdit();
      fetchCourses();
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      setMsg('❌ Error: ' + (err.response?.data?.message || 'Something went wrong'));
      setTimeout(() => setMsg(''), 3000);
    }
  };

  const deleteCourse = async (id) => {
    showConfirmToast({
      title: 'Delete Course?',
      message: 'Ye course permanently delete karna hai?',
      confirmText: 'Delete Course',
      onConfirm: async () => {
        try {
          await axios.delete(`${API}/api/courses/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (editingId === id) cancelEdit();

          toast.success('✅ Course deleted!');
          fetchCourses();
        } catch (err) {
          const errorMsg = err.response?.data?.message || 'Delete failed';
          setMsg('❌ ' + errorMsg);
          toast.error('❌ ' + errorMsg);
          setTimeout(() => setMsg(''), 3000);
        }
      },
    });
  };

  const fetchLiveClasses = async (courseId) => {
    if (!courseId) {
      setLiveClasses([]);
      return;
    }

    try {
      const res = await axios.get(`${API}/api/live-classes/course/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setLiveClasses(res.data);
    } catch (err) {
      console.log('LIVE CLASSES FETCH ERROR:', err);
      setMsg('❌ Live classes load nahi hui');
      setTimeout(() => setMsg(''), 3000);
    }
  };

  const createLiveClass = async () => {
    if (!liveForm.course || !liveForm.title || !liveForm.liveUrl || !liveForm.scheduledAt) {
      setMsg('❌ Course, title, live link aur date/time zaroori hai!');
      setTimeout(() => setMsg(''), 3000);
      return;
    }

    try {
      const payload = {
        course: liveForm.course,
        title: liveForm.title,
        description: liveForm.description,
        liveUrl: liveForm.liveUrl,
        scheduledAt: new Date(liveForm.scheduledAt).toISOString(),
        durationMinutes: Number(liveForm.durationMinutes) || 60,
      };

      const res = await axios.post(`${API}/api/live-classes`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMsg('✅ ' + (res.data.message || 'Live class created!'));

      setLiveForm({
        ...liveForm,
        title: '',
        description: '',
        liveUrl: '',
        scheduledAt: '',
        durationMinutes: 60,
      });

      fetchLiveClasses(liveForm.course);
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      console.log('CREATE LIVE CLASS ERROR:', err);
      setMsg('❌ ' + (err.response?.data?.message || 'Live class create failed'));
      setTimeout(() => setMsg(''), 3000);
    }
  };

  const deleteLiveClass = async (id) => {
    showConfirmToast({
      title: 'Delete Live Class?',
      message: 'Ye live class permanently delete karni hai?',
      confirmText: 'Delete Live Class',
      onConfirm: async () => {
        try {
          await axios.delete(`${API}/api/live-classes/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          setMsg('✅ Live class deleted!');
          toast.success('✅ Live class deleted!');
          fetchLiveClasses(liveForm.course);
          setTimeout(() => setMsg(''), 3000);
        } catch (err) {
          console.log('DELETE LIVE CLASS ERROR:', err);
          const errorMsg = err.response?.data?.message || 'Live class delete failed';
          setMsg('❌ ' + errorMsg);
          toast.error('❌ ' + errorMsg);
          setTimeout(() => setMsg(''), 3000);
        }
      },
    });
  };

  const getLiveStatus = (scheduledAt, durationMinutes) => {
    const now = new Date();
    const start = new Date(scheduledAt);
    const end = new Date(start.getTime() + (durationMinutes || 60) * 60000);

    if (now < start) return 'Upcoming';
    if (now >= start && now <= end) return 'Live Now';
    return 'Ended';
  };

  const getPaymentScreenshot = (payment) => {
    const proof =
      payment.screenshot ||
      payment.screenshotUrl ||
      payment.paymentScreenshot ||
      payment.proof ||
      payment.proofImage ||
      payment.proofUrl ||
      payment.image ||
      payment.imageUrl;

    if (!proof) return '';

    if (proof.startsWith('http')) return proof;

    return `${API}${proof.startsWith('/') ? proof : `/${proof}`}`;
  };

  const inputStyle = {
    width: '100%',
    padding: '11px',
    marginBottom: '14px',
    borderRadius: '12px',
    fontSize: '14px',
    outline: 'none',
    background: theme.bgSecondary,
    color: theme.text,
    border: `1px solid ${theme.border}`,
    boxSizing: 'border-box',
  };

  const tabStyle = (tabName) => ({
    padding: '10px 24px',
    borderRadius: '12px',
    border: `1px solid ${activeTab === tabName ? theme.primary : theme.border}`,
    cursor: 'pointer',
    fontWeight: '600',
    background: activeTab === tabName ? theme.primary : theme.card,
    color: activeTab === tabName ? theme.buttonText : theme.text,
    boxShadow: activeTab === tabName ? theme.shadow : 'none',
  });

  const renderCouponSection = () => (
    <div>
      <div
        style={{
          background: theme.card,
          border: `1px solid ${theme.border}`,
          borderRadius: theme.radius,
          padding: '32px',
          marginBottom: '32px',
          boxShadow: theme.shadow,
          backdropFilter: theme.glass,
        }}
      >
        <h3 style={{ color: theme.text, marginTop: 0, marginBottom: '8px' }}>
          🎟️ Create Coupon Code
        </h3>

        <p style={{ color: theme.muted, marginTop: 0, marginBottom: '22px' }}>
          Free access, percentage discount ya fixed discount coupon banao.
        </p>

        <input
          style={inputStyle}
          placeholder="Coupon Code *  Example: REHAN100"
          value={couponForm.code}
          onChange={(e) =>
            setCouponForm({
              ...couponForm,
              code: e.target.value.toUpperCase(),
            })
          }
        />

        <select
          style={inputStyle}
          value={couponForm.discountType}
          onChange={(e) =>
            setCouponForm({
              ...couponForm,
              discountType: e.target.value,
              discountValue:
                e.target.value === 'free' ? '' : couponForm.discountValue,
            })
          }
        >
          <option value="free">Free Course Access</option>
          <option value="percentage">Percentage Discount</option>
          <option value="fixed">Fixed Amount Discount</option>
        </select>

        {couponForm.discountType !== 'free' && (
          <input
            style={inputStyle}
            type="number"
            placeholder={
              couponForm.discountType === 'percentage'
                ? 'Discount Percentage Example: 50'
                : 'Fixed Discount Amount Example: 20'
            }
            value={couponForm.discountValue}
            onChange={(e) =>
              setCouponForm({
                ...couponForm,
                discountValue: e.target.value,
              })
            }
          />
        )}

        <select
          style={inputStyle}
          value={couponForm.course}
          onChange={(e) =>
            setCouponForm({
              ...couponForm,
              course: e.target.value,
            })
          }
        >
          <option value="">All Courses</option>
          {courses.map((course) => (
            <option key={course._id} value={course._id}>
              {course.title} — {course.isFree ? 'Free' : `₹${course.price}`}
            </option>
          ))}
        </select>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '12px',
          }}
        >
          <input
            style={inputStyle}
            type="number"
            placeholder="Usage Limit — 0 means unlimited"
            value={couponForm.usageLimit}
            onChange={(e) =>
              setCouponForm({
                ...couponForm,
                usageLimit: e.target.value,
              })
            }
          />

          <input
            style={inputStyle}
            type="date"
            value={couponForm.expiresAt}
            onChange={(e) =>
              setCouponForm({
                ...couponForm,
                expiresAt: e.target.value,
              })
            }
          />
        </div>

        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: theme.text,
            marginBottom: '18px',
            cursor: 'pointer',
          }}
        >
          <input
            type="checkbox"
            checked={couponForm.isActive}
            onChange={(e) =>
              setCouponForm({
                ...couponForm,
                isActive: e.target.checked,
              })
            }
          />
          Active Coupon
        </label>

        <button
          onClick={createCoupon}
          style={{
            width: '100%',
            padding: '14px',
            background: 'linear-gradient(135deg, #22c55e, #15803d)',
            color: '#fff',
            border: 'none',
            borderRadius: '12px',
            fontSize: '16px',
            cursor: 'pointer',
            fontWeight: '800',
            boxShadow: theme.shadow,
          }}
        >
          🎟️ Create Coupon
        </button>
      </div>

      <div>
        <h3 style={{ color: theme.text, marginBottom: '16px' }}>
          🎫 Existing Coupons ({coupons.length})
        </h3>

        {coupons.length === 0 ? (
          <div
            style={{
              padding: '18px',
              background: theme.card,
              border: `1px solid ${theme.border}`,
              borderRadius: '14px',
              color: theme.muted,
            }}
          >
            Abhi koi coupon nahi bana.
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '14px' }}>
            {coupons.map((coupon) => {
              const expired =
                coupon.expiresAt && new Date(coupon.expiresAt) < new Date();

              return (
                <div
                  key={coupon._id}
                  style={{
                    background: theme.card,
                    border: `1px solid ${theme.border}`,
                    borderRadius: '16px',
                    padding: '20px',
                    boxShadow: theme.shadow,
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: '16px',
                    flexWrap: 'wrap',
                  }}
                >
                  <div style={{ flex: 1, minWidth: '260px' }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        flexWrap: 'wrap',
                        marginBottom: '10px',
                      }}
                    >
                      <h4 style={{ color: theme.text, margin: 0 }}>
                        🎟️ {coupon.code}
                      </h4>

                      <span
                        style={{
                          padding: '5px 10px',
                          borderRadius: '999px',
                          fontSize: '12px',
                          fontWeight: '800',
                          background: coupon.isActive
                            ? 'rgba(34,197,94,0.15)'
                            : 'rgba(239,68,68,0.15)',
                          color: coupon.isActive ? '#86efac' : '#fca5a5',
                          border: `1px solid ${theme.border}`,
                        }}
                      >
                        {coupon.isActive ? 'Active' : 'Inactive'}
                      </span>

                      {expired && (
                        <span
                          style={{
                            padding: '5px 10px',
                            borderRadius: '999px',
                            fontSize: '12px',
                            fontWeight: '800',
                            background: 'rgba(239,68,68,0.15)',
                            color: '#fca5a5',
                            border: `1px solid ${theme.border}`,
                          }}
                        >
                          Expired
                        </span>
                      )}
                    </div>

                    <p style={{ color: theme.muted, fontSize: '13px', margin: '4px 0' }}>
                      Type:{' '}
                      <strong style={{ color: theme.text }}>
                        {coupon.discountType === 'free'
                          ? 'Free Course Access'
                          : coupon.discountType === 'percentage'
                          ? `${coupon.discountValue}% Off`
                          : `₹${coupon.discountValue} Off`}
                      </strong>
                    </p>

                    <p style={{ color: theme.muted, fontSize: '13px', margin: '4px 0' }}>
                      Course:{' '}
                      <strong style={{ color: theme.text }}>
                        {coupon.course?.title || 'All Courses'}
                      </strong>
                    </p>

                    <p style={{ color: theme.muted, fontSize: '13px', margin: '4px 0' }}>
                      Used:{' '}
                      <strong style={{ color: theme.text }}>
                        {coupon.usedCount || 0} /{' '}
                        {coupon.usageLimit === 0 ? 'Unlimited' : coupon.usageLimit}
                      </strong>
                    </p>

                    <p style={{ color: theme.muted, fontSize: '13px', margin: '4px 0' }}>
                      Expiry:{' '}
                      <strong style={{ color: theme.text }}>
                        {coupon.expiresAt
                          ? new Date(coupon.expiresAt).toLocaleDateString('en-IN')
                          : 'No expiry'}
                      </strong>
                    </p>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      gap: '8px',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                    }}
                  >
                    <button
                      onClick={() => toggleCouponStatus(coupon)}
                      style={{
                        padding: '9px 14px',
                        background: coupon.isActive ? theme.warning : theme.success,
                        color: theme.buttonText,
                        border: 'none',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        fontWeight: '700',
                      }}
                    >
                      {coupon.isActive ? 'Disable' : 'Enable'}
                    </button>

                    <button
                      onClick={() => deleteCoupon(coupon._id, coupon.code)}
                      style={{
                        padding: '9px 14px',
                        background: theme.danger,
                        color: theme.buttonText,
                        border: 'none',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        fontWeight: '700',
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div
      style={{
        background: theme.bg,
        minHeight: '100vh',
        padding: '40px 20px',
        transition: 'all 0.3s ease',
      }}
    >
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <h2 style={{ color: theme.primary, marginBottom: '4px' }}>⚙️ Admin Panel</h2>
        <p style={{ color: theme.muted, marginBottom: '24px' }}>Welcome, {user?.name}!</p>

        {msg && (
          <div
            style={{
              padding: '12px 16px',
              borderRadius: '12px',
              marginBottom: '20px',
              background: msg.includes('✅')
                ? theme.mode === 'dark'
                  ? 'rgba(34, 197, 94, 0.12)'
                  : '#d1fae5'
                : msg.includes('⚠️')
                ? theme.mode === 'dark'
                  ? 'rgba(245, 158, 11, 0.12)'
                  : '#fef3c7'
                : theme.mode === 'dark'
                ? 'rgba(239, 68, 68, 0.12)'
                : '#fee2e2',
              color: msg.includes('✅')
                ? theme.success
                : msg.includes('⚠️')
                ? theme.warning
                : theme.danger,
              border: `1px solid ${theme.border}`,
            }}
          >
            {msg}
          </div>
        )}

        <AdminDashboardStats
          theme={theme}
          users={users}
          courses={courses}
          payments={payments}
        />

        <div style={{ display: 'flex', gap: '10px', marginBottom: '32px', flexWrap: 'wrap' }}>
          <button onClick={() => setActiveTab('courses')} style={tabStyle('courses')}>
            📚 Courses ({courses.length})
          </button>

          <button onClick={() => setActiveTab('users')} style={tabStyle('users')}>
            👥 Users ({users.length})
          </button>

          <button onClick={() => setActiveTab('payments')} style={tabStyle('payments')}>
            💸 Payments ({payments.filter((p) => p.status === 'pending').length})
          </button>

          <button onClick={() => setActiveTab('coupons')} style={tabStyle('coupons')}>
            🎟️ Coupons ({coupons.length})
          </button>

          <button onClick={() => setActiveTab('live')} style={tabStyle('live')}>
            🔴 Live Classes
          </button>

          <button onClick={() => setActiveTab('notifications')} style={tabStyle('notifications')}>
            🔔 Notifications
          </button>

          <button onClick={() => setActiveTab('activity')} style={tabStyle('activity')}>
            🕶️ Activity Logs
          </button>
        </div>

        {activeTab === 'courses' && (
          <div>
            <div
              style={{
                background: theme.card,
                border: `1px solid ${theme.border}`,
                borderRadius: theme.radius,
                padding: '32px',
                marginBottom: '40px',
                boxShadow: theme.shadow,
                backdropFilter: theme.glass,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '20px',
                  gap: '12px',
                  flexWrap: 'wrap',
                }}
              >
                <h3 style={{ color: theme.text, margin: 0 }}>
                  {editingId ? '✏️ Course Edit Karo' : '➕ Naya Course Banao'}
                </h3>

                {editingId && (
                  <button
                    onClick={cancelEdit}
                    style={{
                      padding: '8px 16px',
                      background: 'transparent',
                      color: theme.muted,
                      border: `1px solid ${theme.border}`,
                      borderRadius: '10px',
                      cursor: 'pointer',
                    }}
                  >
                    ✕ Cancel
                  </button>
                )}
              </div>

              {editingId && (
                <div
                  style={{
                    padding: '12px 14px',
                    background:
                      theme.mode === 'dark' ? 'rgba(245, 158, 11, 0.15)' : '#fef3c7',
                    border: `1px solid ${
                      theme.mode === 'dark' ? 'rgba(245, 158, 11, 0.35)' : '#fcd34d'
                    }`,
                    borderRadius: '12px',
                    marginBottom: '16px',
                    fontSize: '13px',
                    color: theme.mode === 'dark' ? '#fcd34d' : '#92400e',
                  }}
                >
                  ✏️ Tum <strong>"{form.title}"</strong> ko edit kar rahe ho
                </div>
              )}

              <input
                style={inputStyle}
                placeholder="Course Title *"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />

              <textarea
                style={{ ...inputStyle, height: '90px', resize: 'vertical' }}
                placeholder="Course Description *"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />

              <input
                style={inputStyle}
                placeholder="Thumbnail Image URL (optional)"
                value={form.thumbnail}
                onChange={(e) => setForm({ ...form, thumbnail: e.target.value })}
              />

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '14px',
                  flexWrap: 'wrap',
                }}
              >
                <label style={{ color: theme.text }}>
                  <input
                    type="checkbox"
                    checked={form.isFree}
                    onChange={(e) =>
                      setForm({ ...form, isFree: e.target.checked, price: 0 })
                    }
                    style={{ marginRight: '6px' }}
                  />
                  Free Course
                </label>

                {!form.isFree && (
                  <input
                    style={{ ...inputStyle, width: '200px', marginBottom: 0 }}
                    type="number"
                    placeholder="Price (₹)"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                  />
                )}
              </div>

              <div
                style={{
                  background: theme.bgSecondary,
                  borderRadius: '14px',
                  padding: '16px',
                  marginBottom: '14px',
                  border: `1px solid ${theme.border}`,
                }}
              >
                <p style={{ color: theme.text, fontWeight: '600', marginBottom: '10px' }}>
                  📹 Videos
                </p>

                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                  <input
                    style={{ ...inputStyle, marginBottom: 0, flex: 1, minWidth: '200px' }}
                    placeholder="Video Title"
                    value={form.videoTitle}
                    onChange={(e) => setForm({ ...form, videoTitle: e.target.value })}
                  />

                  <input
                    style={{ ...inputStyle, marginBottom: 0, flex: 1, minWidth: '220px' }}
                    placeholder="YouTube / Drive URL"
                    value={form.videoUrl}
                    onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
                  />

                  <button
                    onClick={addVideo}
                    style={{
                      padding: '0 16px',
                      background: theme.primary,
                      color: theme.buttonText,
                      border: 'none',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      minHeight: '44px',
                    }}
                  >
                    + Add
                  </button>
                </div>

                {videos.map((v, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '10px 12px',
                      background: theme.cardSolid,
                      borderRadius: '10px',
                      marginBottom: '6px',
                      border: `1px solid ${theme.border}`,
                    }}
                  >
                    <span style={{ color: theme.text, fontSize: '13px' }}>📹 {v.title}</span>
                    <button
                      onClick={() => setVideos(videos.filter((_, idx) => idx !== i))}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: theme.danger,
                        cursor: 'pointer',
                        fontSize: '16px',
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ))}

                {videos.length === 0 && (
                  <p style={{ color: theme.muted, fontSize: '12px' }}>Abhi koi video nahi</p>
                )}
              </div>

              <div
                style={{
                  background: theme.bgSecondary,
                  borderRadius: '14px',
                  padding: '16px',
                  marginBottom: '20px',
                  border: `1px solid ${theme.border}`,
                }}
              >
                <p style={{ color: theme.text, fontWeight: '600', marginBottom: '10px' }}>
                  📄 PDFs / Notes
                </p>

                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                  <input
                    style={{ ...inputStyle, marginBottom: 0, flex: 1, minWidth: '200px' }}
                    placeholder="PDF Title"
                    value={form.pdfTitle}
                    onChange={(e) => setForm({ ...form, pdfTitle: e.target.value })}
                  />

                  <input
                    id="pdfFileInput"
                    style={{ ...inputStyle, marginBottom: 0, flex: 1, minWidth: '220px' }}
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => setPdfFile(e.target.files[0])}
                  />

                  <button
                    onClick={addPdf}
                    style={{
                      padding: '0 16px',
                      background: theme.primary,
                      color: theme.buttonText,
                      border: 'none',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      minHeight: '44px',
                    }}
                  >
                    Upload PDF
                  </button>
                </div>

                {pdfs.map((p, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '10px 12px',
                      background: theme.cardSolid,
                      borderRadius: '10px',
                      marginBottom: '6px',
                      border: `1px solid ${theme.border}`,
                    }}
                  >
                    <span style={{ color: theme.text, fontSize: '13px' }}>
                      📄 {p.title} {p.filename ? '✅' : '⚠️ old link'}
                    </span>
                    <button
                      onClick={() => setPdfs(pdfs.filter((_, idx) => idx !== i))}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: theme.danger,
                        cursor: 'pointer',
                        fontSize: '16px',
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ))}

                {pdfs.length === 0 && (
                  <p style={{ color: theme.muted, fontSize: '12px' }}>Abhi koi PDF nahi</p>
                )}
              </div>

              <button
                onClick={handleSubmit}
                style={{
                  width: '100%',
                  padding: '14px',
                  background: editingId ? theme.success : theme.primary,
                  color: theme.buttonText,
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '16px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  boxShadow: theme.shadow,
                }}
              >
                {editingId ? '💾 Changes Save Karo' : '🚀 Course Publish Karo'}
              </button>
            </div>

            <h3 style={{ color: theme.text, marginBottom: '16px' }}>
              📚 Mere Courses ({courses.length})
            </h3>

            {courses.length === 0 ? (
              <p style={{ color: theme.muted }}>Abhi koi course nahi!</p>
            ) : (
              courses.map((course) => (
                <div key={course._id} style={{ marginBottom: '12px' }}>
                  <div
                    style={{
                      background:
                        editingId === course._id
                          ? theme.mode === 'dark'
                            ? 'rgba(34, 197, 94, 0.12)'
                            : '#f0fdf4'
                          : theme.card,
                      border: `1px solid ${
                        editingId === course._id ? theme.success : theme.border
                      }`,
                      borderRadius: '16px',
                      padding: '20px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '16px',
                      flexWrap: 'wrap',
                      boxShadow: theme.shadow,
                      backdropFilter: theme.glass,
                    }}
                  >
                    <div>
                      <h4 style={{ color: theme.text, marginBottom: '4px', marginTop: 0 }}>
                        {course.title}
                      </h4>
                      <p style={{ color: theme.muted, fontSize: '13px', margin: 0 }}>
                        {course.isFree ? '🆓 Free' : `💰 ₹${course.price}`} &nbsp;|&nbsp;
                        📹 {course.videos?.length || 0} videos &nbsp;|&nbsp;
                        📄 {course.pdfs?.length || 0} PDFs
                      </p>
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        gap: '8px',
                        flexWrap: 'wrap',
                        justifyContent: 'flex-end',
                      }}
                    >
                      <button
                        onClick={() => fetchEnrolledUsers(course._id)}
                        style={{
                          padding: '8px 16px',
                          background: theme.accent,
                          color: theme.buttonText,
                          border: 'none',
                          borderRadius: '10px',
                          cursor: 'pointer',
                          fontWeight: '500',
                        }}
                      >
                        👥 {expandedCourse === course._id ? 'Hide' : 'Students'}
                      </button>

                      <button
                        onClick={() => startEdit(course)}
                        style={{
                          padding: '8px 16px',
                          background: theme.warning,
                          color: theme.buttonText,
                          border: 'none',
                          borderRadius: '10px',
                          cursor: 'pointer',
                          fontWeight: '500',
                        }}
                      >
                        ✏️ Edit
                      </button>

                      <button
                        onClick={() => deleteCourse(course._id)}
                        style={{
                          padding: '8px 16px',
                          background: theme.danger,
                          color: theme.buttonText,
                          border: 'none',
                          borderRadius: '10px',
                          cursor: 'pointer',
                        }}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>

                  {expandedCourse === course._id && (
                    <div
                      style={{
                        background: theme.bgSecondary,
                        border: `1px solid ${theme.border}`,
                        borderRadius: '0 0 14px 14px',
                        padding: '16px',
                        marginTop: '-4px',
                      }}
                    >
                      <p
                        style={{
                          color: theme.text,
                          fontWeight: '600',
                          marginBottom: '12px',
                          fontSize: '14px',
                        }}
                      >
                        👥 Enrolled Students ({enrolledUsers[course._id]?.length || 0})
                      </p>

                      {enrolledUsers[course._id]?.length === 0 ? (
                        <p style={{ color: theme.muted, fontSize: '13px' }}>
                          Abhi koi student enroll nahi!
                        </p>
                      ) : (
                        enrolledUsers[course._id]?.map((u, i) => (
                          <div
                            key={i}
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              padding: '8px 12px',
                              background: theme.card,
                              borderRadius: '10px',
                              marginBottom: '6px',
                              border: `1px solid ${theme.border}`,
                              gap: '12px',
                              flexWrap: 'wrap',
                            }}
                          >
                            <span style={{ color: theme.text, fontSize: '13px' }}>
                              👤 {u.name}
                            </span>
                            <span style={{ color: theme.muted, fontSize: '13px' }}>
                              {u.email}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'users' && (
          <div>
            <h3 style={{ color: theme.text, marginBottom: '20px' }}>
              👥 Registered Users ({users.length})
            </h3>

            {users.length === 0 ? (
              <p style={{ color: theme.muted }}>Abhi koi user nahi!</p>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                  gap: '16px',
                }}
              >
                {users.map((u, i) => (
                  <div
                    key={u._id}
                    style={{
                      background: theme.card,
                      border: `1px solid ${u.role === 'admin' ? theme.primary : theme.border}`,
                      borderRadius: theme.radius,
                      padding: '20px',
                      position: 'relative',
                      boxShadow: theme.shadow,
                      backdropFilter: theme.glass,
                    }}
                  >
                    <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
                      <span
                        style={{
                          padding: '4px 10px',
                          borderRadius: '20px',
                          fontSize: '11px',
                          fontWeight: '700',
                          background:
                            u.role === 'admin'
                              ? theme.mode === 'dark'
                                ? 'rgba(245, 158, 11, 0.18)'
                                : '#fef3c7'
                              : theme.mode === 'dark'
                              ? 'rgba(34, 197, 94, 0.18)'
                              : '#d1fae5',
                          color:
                            u.role === 'admin'
                              ? theme.mode === 'dark'
                                ? '#fcd34d'
                                : '#92400e'
                              : theme.mode === 'dark'
                              ? '#86efac'
                              : '#065f46',
                        }}
                      >
                        {u.role === 'admin' ? '👑 Admin' : '🎓 Student'}
                      </span>
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        marginBottom: '14px',
                        paddingRight: '85px',
                      }}
                    >
                      {u.photo ? (
                        <img
                          src={u.photo}
                          alt={u.name}
                          style={{
                            width: '58px',
                            height: '58px',
                            borderRadius: '50%',
                            objectFit: 'cover',
                            border: `2px solid ${theme.primary}`,
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: '58px',
                            height: '58px',
                            borderRadius: '50%',
                            background: theme.primary,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: theme.buttonText,
                            fontWeight: '700',
                            fontSize: '22px',
                            flexShrink: 0,
                          }}
                        >
                          {u.name?.charAt(0).toUpperCase()}
                        </div>
                      )}

                      <div>
                        <h4
                          style={{
                            color: theme.text,
                            margin: 0,
                            fontSize: '16px',
                            fontWeight: '800',
                          }}
                        >
                          {u.name}
                        </h4>
                        <p style={{ color: theme.muted, margin: 0, fontSize: '12px' }}>
                          #{i + 1}
                        </p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <p style={{ color: theme.muted, fontSize: '13px', margin: 0 }}>
                        📧 {u.email}
                      </p>

                      {u.bio && (
                        <p style={{ color: theme.muted, fontSize: '13px', margin: 0 }}>
                          📝 {u.bio}
                        </p>
                      )}

                      <p style={{ color: theme.muted, fontSize: '13px', margin: 0 }}>
                        🗓️ Joined:{' '}
                        {u.createdAt
                          ? new Date(u.createdAt).toLocaleDateString('en-IN')
                          : 'Not available'}
                      </p>

                      <div>
                        <p
                          style={{
                            color: theme.text,
                            fontSize: '13px',
                            fontWeight: '700',
                            margin: '8px 0 8px 0',
                          }}
                        >
                          📚 Enrolled:
                        </p>

                        {u.enrolledCourses?.length > 0 ? (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                            {u.enrolledCourses.map((c, idx) => (
                              <span
                                key={idx}
                                style={{
                                  padding: '5px 10px',
                                  background:
                                    theme.mode === 'dark'
                                      ? `${theme.primary}33`
                                      : `${theme.primary}1A`,
                                  color: theme.primary,
                                  borderRadius: '8px',
                                  fontSize: '12px',
                                  fontWeight: '600',
                                }}
                              >
                                {c.title || c}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p style={{ color: theme.muted, fontSize: '12px', margin: 0 }}>
                            No course enrolled
                          </p>
                        )}
                      </div>
                    </div>

                    {u.role !== 'admin' && (
                      <button
                        onClick={() => deleteUser(u._id, u.name)}
                        style={{
                          width: '100%',
                          padding: '10px',
                          background: theme.danger,
                          color: theme.buttonText,
                          border: 'none',
                          borderRadius: '10px',
                          cursor: 'pointer',
                          fontSize: '13px',
                          fontWeight: '600',
                          marginTop: '16px',
                        }}
                      >
                        🗑️ Delete User
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'payments' && (
          <div>
            <h3 style={{ color: theme.text, marginBottom: '20px' }}>
              💸 Payment Requests ({payments.length})
            </h3>

            {payments.length === 0 ? (
              <p style={{ color: theme.muted }}>Abhi koi payment request nahi aayi!</p>
            ) : (
              <div style={{ display: 'grid', gap: '16px' }}>
                {payments.map((payment) => {
                  const screenshotUrl = getPaymentScreenshot(payment);

                  return (
                    <div
                      key={payment._id}
                      style={{
                        background: theme.card,
                        border: `1px solid ${theme.border}`,
                        borderRadius: theme.radius,
                        padding: '20px',
                        boxShadow: theme.shadow,
                        backdropFilter: theme.glass,
                      }}
                    >
                      <h4 style={{ color: theme.text, marginTop: 0 }}>
                        {payment.course?.title || 'Course deleted'}
                      </h4>

                      <p style={{ color: theme.muted }}>
                        <strong style={{ color: theme.text }}>User:</strong>{' '}
                        {payment.user?.name || 'Unknown'}
                      </p>

                      <p style={{ color: theme.muted }}>
                        <strong style={{ color: theme.text }}>Email:</strong>{' '}
                        {payment.user?.email || 'No email'}
                      </p>

                      <p style={{ color: theme.muted }}>
                        <strong style={{ color: theme.text }}>Status:</strong>{' '}
                        <span
                          style={{
                            color:
                              payment.status === 'approved'
                                ? theme.success
                                : payment.status === 'rejected'
                                ? theme.danger
                                : theme.warning,
                            fontWeight: '800',
                            textTransform: 'uppercase',
                          }}
                        >
                          {payment.status}
                        </span>
                      </p>

                      {(payment.couponCode ||
                        payment.discountAmount > 0 ||
                        payment.finalPrice ||
                        payment.originalPrice) && (
                        <div
                          style={{
                            marginTop: '12px',
                            padding: '12px',
                            background: theme.bgSecondary,
                            border: `1px solid ${theme.border}`,
                            borderRadius: '12px',
                          }}
                        >
                          <p
                            style={{
                              color: theme.text,
                              fontWeight: '800',
                              margin: '0 0 8px',
                            }}
                          >
                            🎟️ Coupon / Amount Details
                          </p>

                          <p style={{ color: theme.muted, margin: '4px 0', fontSize: '13px' }}>
                            Code:{' '}
                            <strong style={{ color: theme.text }}>
                              {payment.couponCode || 'No coupon'}
                            </strong>
                          </p>

                          <p style={{ color: theme.muted, margin: '4px 0', fontSize: '13px' }}>
                            Original Price:{' '}
                            <strong style={{ color: theme.text }}>
                              ₹{payment.originalPrice || payment.course?.price || payment.amount}
                            </strong>
                          </p>

                          <p style={{ color: theme.muted, margin: '4px 0', fontSize: '13px' }}>
                            Discount:{' '}
                            <strong style={{ color: theme.success }}>
                              ₹{payment.discountAmount || 0}
                            </strong>
                          </p>

                          <p style={{ color: theme.muted, margin: '4px 0', fontSize: '13px' }}>
                            Final Paid:{' '}
                            <strong style={{ color: theme.text }}>
                              ₹{payment.finalPrice || payment.amount}
                            </strong>
                          </p>
                        </div>
                      )}

                      <div
                        style={{
                          marginTop: '16px',
                          padding: '14px',
                          background: theme.bgSecondary,
                          border: `1px solid ${theme.border}`,
                          borderRadius: '14px',
                        }}
                      >
                        <p
                          style={{
                            color: theme.text,
                            fontWeight: '800',
                            marginTop: 0,
                            marginBottom: '10px',
                          }}
                        >
                          🧾 Payment Screenshot
                        </p>

                        {screenshotUrl ? (
                          <div>
                            <a href={screenshotUrl} target="_blank" rel="noreferrer">
                              <img
                                src={screenshotUrl}
                                alt="Payment Screenshot"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                  const next = e.currentTarget.nextSibling;
                                  if (next) next.style.display = 'block';
                                }}
                                style={{
                                  width: '260px',
                                  maxWidth: '100%',
                                  maxHeight: '360px',
                                  objectFit: 'cover',
                                  borderRadius: '14px',
                                  border: `1px solid ${theme.primary}`,
                                  boxShadow: theme.shadow,
                                  cursor: 'pointer',
                                  display: 'block',
                                }}
                              />

                              <p
                                style={{
                                  display: 'none',
                                  color: theme.danger,
                                  fontSize: '13px',
                                  fontWeight: '700',
                                  marginTop: '8px',
                                }}
                              >
                                ❌ Image load nahi hui. Backend static uploads ya URL issue hai.
                              </p>
                            </a>

                            <button
                              onClick={() => window.open(screenshotUrl, '_blank')}
                              style={{
                                marginTop: '12px',
                                padding: '9px 14px',
                                background: theme.primary,
                                color: theme.buttonText,
                                border: 'none',
                                borderRadius: '10px',
                                cursor: 'pointer',
                                fontWeight: '700',
                              }}
                            >
                              🔍 Open Screenshot
                            </button>

                            <p
                              style={{
                                color: theme.muted,
                                fontSize: '12px',
                                marginTop: '8px',
                                wordBreak: 'break-all',
                              }}
                            >
                              URL: {screenshotUrl}
                            </p>
                          </div>
                        ) : (
                          <div>
                            <p
                              style={{
                                color: theme.danger,
                                fontWeight: '800',
                                marginBottom: '8px',
                              }}
                            >
                              ❌ Screenshot path backend se nahi aa raha
                            </p>

                            <p
                              style={{
                                color: theme.muted,
                                fontSize: '13px',
                                margin: 0,
                              }}
                            >
                              Iska matlab paymentRoutes.js ya Payment model me screenshot ka path save nahi ho raha.
                            </p>
                          </div>
                        )}
                      </div>

                      {payment.status === 'pending' && (
                        <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                          <button
                            onClick={() => approvePayment(payment._id)}
                            style={{
                              padding: '10px 18px',
                              background: theme.success,
                              color: theme.buttonText,
                              border: 'none',
                              borderRadius: '10px',
                              cursor: 'pointer',
                              fontWeight: '600',
                            }}
                          >
                            ✅ Approve
                          </button>

                          <button
                            onClick={() => rejectPayment(payment._id)}
                            style={{
                              padding: '10px 18px',
                              background: theme.danger,
                              color: theme.buttonText,
                              border: 'none',
                              borderRadius: '10px',
                              cursor: 'pointer',
                              fontWeight: '600',
                            }}
                          >
                            ❌ Reject
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'coupons' && renderCouponSection()}

        {activeTab === 'live' && (
          <div>
            <div
              style={{
                background: theme.card,
                border: `1px solid ${theme.border}`,
                borderRadius: theme.radius,
                padding: '32px',
                marginBottom: '32px',
                boxShadow: theme.shadow,
                backdropFilter: theme.glass,
              }}
            >
              <h3 style={{ color: theme.text, marginTop: 0, marginBottom: '8px' }}>
                🔴 Add Live Class
              </h3>

              <p style={{ color: theme.muted, marginTop: 0, marginBottom: '22px' }}>
                Course select karo, Google Meet / Zoom / YouTube Live link add karo, aur students ko class dikh jayegi.
              </p>

              <select
                style={inputStyle}
                value={liveForm.course}
                onChange={(e) => {
                  setLiveForm({ ...liveForm, course: e.target.value });
                  fetchLiveClasses(e.target.value);
                }}
              >
                <option value="">Select Course *</option>
                {courses.map((course) => (
                  <option key={course._id} value={course._id}>
                    {course.title}
                  </option>
                ))}
              </select>

              <input
                style={inputStyle}
                placeholder="Live Class Title *"
                value={liveForm.title}
                onChange={(e) => setLiveForm({ ...liveForm, title: e.target.value })}
              />

              <textarea
                style={{ ...inputStyle, height: '85px', resize: 'vertical' }}
                placeholder="Description optional"
                value={liveForm.description}
                onChange={(e) => setLiveForm({ ...liveForm, description: e.target.value })}
              />

              <input
                style={inputStyle}
                placeholder="Live Class Link *  Example: https://meet.google.com/..."
                value={liveForm.liveUrl}
                onChange={(e) => setLiveForm({ ...liveForm, liveUrl: e.target.value })}
              />

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '12px',
                }}
              >
                <input
                  style={inputStyle}
                  type="datetime-local"
                  value={liveForm.scheduledAt}
                  onChange={(e) => setLiveForm({ ...liveForm, scheduledAt: e.target.value })}
                />

                <input
                  style={inputStyle}
                  type="number"
                  placeholder="Duration in minutes"
                  value={liveForm.durationMinutes}
                  onChange={(e) => setLiveForm({ ...liveForm, durationMinutes: e.target.value })}
                />
              </div>

              <button
                onClick={createLiveClass}
                style={{
                  width: '100%',
                  padding: '14px',
                  background: 'linear-gradient(135deg, #ef4444, #7f1d1d)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '16px',
                  cursor: 'pointer',
                  fontWeight: '800',
                  boxShadow: theme.shadow,
                }}
              >
                🔴 Create Live Class
              </button>
            </div>

            <div>
              <h3 style={{ color: theme.text, marginBottom: '16px' }}>
                📡 Live Classes {liveForm.course ? `(${liveClasses.length})` : ''}
              </h3>

              {!liveForm.course ? (
                <p style={{ color: theme.muted }}>Pehle course select karo live classes dekhne ke liye.</p>
              ) : liveClasses.length === 0 ? (
                <div
                  style={{
                    padding: '18px',
                    background: theme.card,
                    border: `1px solid ${theme.border}`,
                    borderRadius: '14px',
                    color: theme.muted,
                  }}
                >
                  Abhi is course mein koi live class nahi hai.
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '14px' }}>
                  {liveClasses.map((live) => {
                    const status = getLiveStatus(live.scheduledAt, live.durationMinutes);

                    return (
                      <div
                        key={live._id}
                        style={{
                          background: theme.card,
                          border: `1px solid ${theme.border}`,
                          borderRadius: '16px',
                          padding: '20px',
                          boxShadow: theme.shadow,
                          display: 'flex',
                          justifyContent: 'space-between',
                          gap: '16px',
                          flexWrap: 'wrap',
                        }}
                      >
                        <div style={{ flex: 1, minWidth: '260px' }}>
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '10px',
                              flexWrap: 'wrap',
                              marginBottom: '8px',
                            }}
                          >
                            <h4 style={{ color: theme.text, margin: 0 }}>{live.title}</h4>

                            <span
                              style={{
                                padding: '5px 10px',
                                borderRadius: '999px',
                                fontSize: '12px',
                                fontWeight: '800',
                                background:
                                  status === 'Live Now'
                                    ? 'rgba(239,68,68,0.15)'
                                    : status === 'Upcoming'
                                    ? 'rgba(59,130,246,0.15)'
                                    : 'rgba(148,163,184,0.15)',
                                color:
                                  status === 'Live Now'
                                    ? '#fca5a5'
                                    : status === 'Upcoming'
                                    ? '#93c5fd'
                                    : theme.muted,
                                border: `1px solid ${theme.border}`,
                              }}
                            >
                              {status}
                            </span>
                          </div>

                          {live.description && (
                            <p style={{ color: theme.muted, fontSize: '13px', marginBottom: '8px' }}>
                              {live.description}
                            </p>
                          )}

                          <p style={{ color: theme.muted, fontSize: '13px', margin: '4px 0' }}>
                            📅{' '}
                            {new Date(live.scheduledAt).toLocaleString('en-IN', {
                              dateStyle: 'medium',
                              timeStyle: 'short',
                            })}
                          </p>

                          <p style={{ color: theme.muted, fontSize: '13px', margin: '4px 0' }}>
                            ⏱ Duration: {live.durationMinutes || 60} minutes
                          </p>

                          <p
                            style={{
                              color: theme.muted,
                              fontSize: '12px',
                              margin: '8px 0 0',
                              wordBreak: 'break-all',
                            }}
                          >
                            🔗 {live.liveUrl}
                          </p>
                        </div>

                        <div
                          style={{
                            display: 'flex',
                            gap: '8px',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                          }}
                        >
                          <button
                            onClick={() => window.open(live.liveUrl, '_blank')}
                            style={{
                              padding: '9px 14px',
                              background: theme.primary,
                              color: theme.buttonText,
                              border: 'none',
                              borderRadius: '10px',
                              cursor: 'pointer',
                              fontWeight: '700',
                            }}
                          >
                            Open
                          </button>

                          <button
                            onClick={() => deleteLiveClass(live._id)}
                            style={{
                              padding: '9px 14px',
                              background: theme.danger,
                              color: theme.buttonText,
                              border: 'none',
                              borderRadius: '10px',
                              cursor: 'pointer',
                              fontWeight: '700',
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'notifications' && <AdminNotificationSender theme={theme} />}

        {activeTab === 'activity' && <SecurityLogsPanel theme={theme} />}
      </div>
    </div>
  );
}

export default AdminPanel;