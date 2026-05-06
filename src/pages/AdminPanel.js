import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
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

  // ✅ AI Study Tools states
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiSelectedCourse, setAiSelectedCourse] = useState(null);
  const [aiSourceText, setAiSourceText] = useState('');
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiGenerationType, setAiGenerationType] = useState('important_questions'); // important_questions | quiz | summary | flashcards
  const [aiSelectedPdfIndexes, setAiSelectedPdfIndexes] = useState([]);
  const [aiCustomTitle, setAiCustomTitle] = useState(''); // ✅ NEW: Custom title state

  // ✅ AI Study Tools review states
  const [aiReviewModalOpen, setAiReviewModalOpen] = useState(false);
  const [aiReviewCourse, setAiReviewCourse] = useState(null);
  const [aiStudyTools, setAiStudyTools] = useState([]);
  const [aiToolsLoading, setAiToolsLoading] = useState(false);
  const [expandedStudyTool, setExpandedStudyTool] = useState(null);

  // ✅ Assistant Logs states
  const [assistantLogs, setAssistantLogs] = useState([]);
  const [assistantLoading, setAssistantLoading] = useState(false);
  const [assistantSearch, setAssistantSearch] = useState('');
  const [expandedAssistantLog, setExpandedAssistantLog] = useState(null);

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
    fetchAssistantLogs();
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

  // ✅ Fetch Assistant Logs
  const fetchAssistantLogs = async () => {
    try {
      setAssistantLoading(true);

      const res = await axios.get(`${API}/api/assistant/logs`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setAssistantLogs(res.data.logs || []);
    } catch (err) {
      console.log('ASSISTANT LOGS FETCH ERROR:', err);
      toast.error(err.response?.data?.message || '❌ Assistant logs load nahi hue');
    } finally {
      setAssistantLoading(false);
    }
  };

  // ✅ Delete Assistant Log
  const deleteAssistantLog = async (id) => {
    showConfirmToast({
      title: 'Delete Assistant Log?',
      message: 'Ye assistant chat log permanently delete karna hai?',
      confirmText: 'Delete Log',
      onConfirm: async () => {
        try {
          await axios.delete(`${API}/api/assistant/logs/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          toast.success('✅ Assistant log deleted!');
          fetchAssistantLogs();
        } catch (err) {
          console.log('DELETE ASSISTANT LOG ERROR:', err);
          toast.error(err.response?.data?.message || '❌ Assistant log delete failed');
        }
      },
    });
  };

  const formatAssistantDate = (date) => {
    if (!date) return 'Not available';

    return new Date(date).toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  const getShortDevice = (deviceInfo = '') => {
    if (!deviceInfo) return 'Unknown device';

    if (deviceInfo.includes('Edg')) return 'Microsoft Edge';
    if (deviceInfo.includes('Chrome')) return 'Chrome Browser';
    if (deviceInfo.includes('Firefox')) return 'Firefox Browser';
    if (deviceInfo.includes('Safari') && !deviceInfo.includes('Chrome')) return 'Safari Browser';
    if (deviceInfo.includes('Android')) return 'Android Device';
    if (deviceInfo.includes('iPhone')) return 'iPhone';
    if (deviceInfo.includes('Windows')) return 'Windows Device';

    return deviceInfo.slice(0, 60);
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

  // ✅ Open AI Study Tool Modal — reset aiCustomTitle on open
  const openStudyToolGeneratorModal = (course, type = 'important_questions') => {
    setAiSelectedCourse(course);
    setAiGenerationType(type);
    setAiSourceText('');
    setAiCustomTitle(''); // ✅ Reset custom title on open
    setAiSelectedPdfIndexes((course?.pdfs || []).map((_, index) => index));
    setAiModalOpen(true);
  };

  const openImportantQuestionsModal = (course) => {
    openStudyToolGeneratorModal(course, 'important_questions');
  };

  const getStudyToolMeta = (type) => {
    if (type === 'quiz') {
      return {
        name: 'Quiz Practice',
        shortName: 'Quiz',
        icon: '🧠',
        heading: 'Generate Quiz Practice',
        buttonText: '🧠 Generate Quiz',
        placeholder: 'Example: Unit 1 Quiz / Laser Quiz Practice',
        endpoint: '/api/study-tools/generate-quiz-from-pdf',
        gradient: 'linear-gradient(135deg, #06b6d4, #2563eb)',
      };
    }

    if (type === 'summary') {
      return {
        name: 'AI Summary',
        shortName: 'Summary',
        icon: '📝',
        heading: 'Generate AI Summary',
        buttonText: '📝 Generate Summary',
        placeholder: 'Example: Unit 1 Summary / Laser Quick Revision',
        endpoint: '/api/study-tools/generate-summary-from-pdf',
        gradient: 'linear-gradient(135deg, #22c55e, #0ea5e9)',
      };
    }

    if (type === 'flashcards') {
      return {
        name: 'Flashcards',
        shortName: 'Flashcards',
        icon: '🃏',
        heading: 'Generate Flashcards',
        buttonText: '🃏 Generate Flashcards',
        placeholder: 'Example: Unit 1 Flashcards / Laser Revision Cards',
        endpoint: '/api/study-tools/generate-flashcards-from-pdf',
        gradient: 'linear-gradient(135deg, #f97316, #ec4899)',
      };
    }

    return {
      name: 'Important Questions',
      shortName: 'Questions',
      icon: '✨',
      heading: 'Generate Important Questions',
      buttonText: '✨ Generate Questions',
      placeholder: 'Example: Unit 1 Important Questions / Laser Most Expected',
      endpoint: '/api/study-tools/generate-important-questions-from-pdf',
      gradient: 'linear-gradient(135deg, #8b5cf6, #4f46e5)',
    };
  };

  const getStudyToolStats = (tool) => {
    const content = tool?.content || {};

    if (tool?.type === 'quiz') {
      return content.quizQuestions?.length || content.questions?.length || content.mcqs?.length || 0;
    }

    if (tool?.type === 'summary') {
      return (
        (content.definitions?.length || 0) +
        (content.keyPoints?.length || 0) +
        (content.examAnswer?.length || 0) +
        (content.quickRevision?.length || 0) +
        (content.importantTerms?.length || 0) +
        (content.summary ? 1 : 0)
      );
    }

    if (tool?.type === 'flashcards') {
      return content.flashcards?.length || content.cards?.length || 0;
    }

    return (
      (content.shortQuestions?.length || 0) +
      (content.longQuestions?.length || 0) +
      (content.mcqs?.length || 0) +
      (content.mostExpectedQuestions?.length || 0)
    );
  };

  // ✅ Close AI Modal — reset aiCustomTitle on close
  const closeImportantQuestionsModal = () => {
    if (aiGenerating) return;
    setAiModalOpen(false);
    setAiSelectedCourse(null);
    setAiGenerationType('important_questions');
    setAiSourceText('');
    setAiCustomTitle(''); // ✅ Reset custom title on close
    setAiSelectedPdfIndexes([]);
  };

  // ✅ Toggle selected PDFs for AI generation
  const toggleAiPdfSelection = (index) => {
    setAiSelectedPdfIndexes((prev) =>
      prev.includes(index)
        ? prev.filter((item) => item !== index)
        : [...prev, index].sort((a, b) => a - b)
    );
  };

  // ✅ Select all PDFs for AI generation
  const selectAllAiPdfs = () => {
    setAiSelectedPdfIndexes((aiSelectedCourse?.pdfs || []).map((_, index) => index));
  };

  // ✅ Clear all selected PDFs for AI generation
  const clearAllAiPdfs = () => {
    setAiSelectedPdfIndexes([]);
  };

  // ✅ Generate AI study tool one-by-one for selected PDFs
  // ✅ Sends customTitle per PDF: if multiple PDFs selected, appends PDF title to avoid duplicates
  const generateStudyTool = async () => {
    if (!aiSelectedCourse?._id) {
      toast.error('❌ Course select nahi hua!');
      return;
    }

    if (!aiSelectedCourse?.pdfs || aiSelectedCourse.pdfs.length === 0) {
      toast.error('❌ Is course mein koi PDF uploaded nahi hai!');
      setMsg('❌ Pehle is course mein PDF upload karo, phir AI Study Tool generate hoga.');
      setTimeout(() => setMsg(''), 4000);
      return;
    }

    if (!aiSelectedPdfIndexes || aiSelectedPdfIndexes.length === 0) {
      toast.error('❌ Kam se kam ek PDF select karo!');
      setMsg('❌ AI generate karne ke liye kam se kam ek PDF select karni padegi.');
      setTimeout(() => setMsg(''), 4000);
      return;
    }

    const toolMeta = getStudyToolMeta(aiGenerationType);
    const toolName = toolMeta.name;
    const endpoint = toolMeta.endpoint;

    // ✅ Determine if multiple PDFs selected — for title appending logic
    const isMultiplePdfs = aiSelectedPdfIndexes.length > 1;
    const trimmedCustomTitle = aiCustomTitle.trim();

    try {
      setAiGenerating(true);

      const total = aiSelectedPdfIndexes.length;
      let successCount = 0;
      let failedCount = 0;
      const failedPdfs = [];

      toast.info(`⏳ ${total} PDF(s) ke liye ${toolName} drafts generate ho rahe hain...`);
      setMsg(`⏳ AI selected ${total} PDF(s) se ${toolName} one-by-one generate kar raha hai. Page close mat karna.`);

      for (let i = 0; i < aiSelectedPdfIndexes.length; i++) {
        const pdfIndex = aiSelectedPdfIndexes[i];
        const pdf = aiSelectedCourse.pdfs[pdfIndex];
        const pdfTitle = pdf?.title || pdf?.filename || `PDF ${pdfIndex + 1}`;

        // ✅ Custom title logic:
        // - Multiple PDFs: append PDF title to avoid duplicate titles → "Physics Quiz - UNIT 1"
        // - Single PDF: use exactly what user typed (blank = backend uses default)
        let customTitle = '';
        if (trimmedCustomTitle) {
          customTitle = isMultiplePdfs
            ? `${trimmedCustomTitle} - ${pdfTitle}`
            : trimmedCustomTitle;
        }

        try {
          setMsg(`⏳ Generating ${toolName} ${i + 1}/${total}: ${pdfTitle}`);

          await axios.post(
            `${API}${endpoint}`,
            {
              courseId: aiSelectedCourse._id,
              pdfIndexes: [pdfIndex],
              customTitle, // ✅ Send customTitle in POST body
            },
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          successCount += 1;
          toast.success(`✅ ${toolName} generated ${i + 1}/${total}: ${pdfTitle}`);
        } catch (singleErr) {
          failedCount += 1;

          const singleErrorMsg =
            singleErr.response?.data?.message ||
            singleErr.response?.data?.error ||
            singleErr.message ||
            'Generation failed';

          failedPdfs.push({ title: pdfTitle, error: singleErrorMsg });

          console.log('SINGLE PDF AI TOOL GENERATION ERROR:', {
            type: aiGenerationType,
            pdfIndex,
            pdf,
            error: singleErr,
          });

          toast.error(`❌ Failed ${i + 1}/${total}: ${pdfTitle}`);
        }
      }

      if (successCount > 0) {
        toast.success(`✅ ${successCount} ${toolName} draft(s) generated successfully!`);
        setMsg(
          `✅ Done! ${successCount} ${toolName} draft(s) generated${
            failedCount ? `, ${failedCount} failed.` : '.'
          } Review AI mein check karo.`
        );
      } else {
        toast.error(`❌ Koi bhi ${toolName} draft generate nahi hua.`);
        setMsg(`❌ Koi bhi ${toolName} draft generate nahi hua. Render logs check karo.`);
      }

      if (failedPdfs.length > 0) {
        console.log('FAILED AI TOOL PDFS:', failedPdfs);
      }

      setAiModalOpen(false);
      setAiSelectedCourse(null);
      setAiGenerationType('important_questions');
      setAiSourceText('');
      setAiCustomTitle(''); // ✅ Reset custom title after generation
      setAiSelectedPdfIndexes([]);

      setTimeout(() => setMsg(''), 7000);
    } catch (err) {
      console.log('AI STUDY TOOL BULK ERROR:', err);

      const errorMsg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'AI study tool generation failed';

      toast.error('❌ ' + errorMsg);
      setMsg('❌ ' + errorMsg);
      setTimeout(() => setMsg(''), 6000);
    } finally {
      setAiGenerating(false);
    }
  };

  // ✅ Old function kept for old button safety
  const generateImportantQuestions = generateStudyTool;

  // ✅ Fetch AI generated drafts/published study tools for review
  const fetchStudyToolsForCourse = async (course) => {
    if (!course?._id) return;

    try {
      setAiToolsLoading(true);

      const res = await axios.get(`${API}/api/study-tools/admin/course/${course._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setAiStudyTools(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.log('AI STUDY TOOLS FETCH ERROR:', err);
      toast.error(err.response?.data?.message || '❌ AI drafts load nahi hue');
      setAiStudyTools([]);
    } finally {
      setAiToolsLoading(false);
    }
  };

  // ✅ Open review modal for AI generated questions
  const openStudyToolsReviewModal = async (course) => {
    setAiReviewCourse(course);
    setExpandedStudyTool(null);
    setAiReviewModalOpen(true);
    await fetchStudyToolsForCourse(course);
  };

  // ✅ Close review modal
  const closeStudyToolsReviewModal = () => {
    setAiReviewModalOpen(false);
    setAiReviewCourse(null);
    setAiStudyTools([]);
    setExpandedStudyTool(null);
  };

  // ✅ Publish AI study tool
  const publishStudyTool = async (toolId) => {
    try {
      const res = await axios.patch(
        `${API}/api/study-tools/${toolId}/publish`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success(res.data?.message || '✅ Study tool published!');
      setMsg('✅ AI Study Tool published! Students ko ab dikhega.');
      await fetchStudyToolsForCourse(aiReviewCourse);
      setTimeout(() => setMsg(''), 3500);
    } catch (err) {
      console.log('PUBLISH STUDY TOOL ERROR:', err);
      toast.error(err.response?.data?.message || '❌ Publish failed');
    }
  };

  // ✅ Unpublish AI study tool
  const unpublishStudyTool = async (toolId) => {
    try {
      const res = await axios.patch(
        `${API}/api/study-tools/${toolId}/unpublish`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success(res.data?.message || '✅ Study tool moved to draft!');
      setMsg('✅ AI Study Tool draft mein move ho gaya.');
      await fetchStudyToolsForCourse(aiReviewCourse);
      setTimeout(() => setMsg(''), 3500);
    } catch (err) {
      console.log('UNPUBLISH STUDY TOOL ERROR:', err);
      toast.error(err.response?.data?.message || '❌ Unpublish failed');
    }
  };

  // ✅ Delete AI study tool
  const deleteStudyTool = async (toolId, title = 'AI Study Tool') => {
    showConfirmToast({
      title: 'Delete AI Draft?',
      message: `${title} permanently delete karna hai?`,
      confirmText: 'Delete Draft',
      onConfirm: async () => {
        try {
          const res = await axios.delete(`${API}/api/study-tools/${toolId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          toast.success(res.data?.message || '✅ Study tool deleted!');
          await fetchStudyToolsForCourse(aiReviewCourse);
        } catch (err) {
          console.log('DELETE STUDY TOOL ERROR:', err);
          toast.error(err.response?.data?.message || '❌ Delete failed');
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
    padding: '13px 14px',
    marginBottom: '14px',
    borderRadius: '14px',
    fontSize: '14px',
    outline: 'none',
    background: theme.isDark ? 'rgba(15, 23, 42, 0.72)' : 'rgba(255,255,255,0.82)',
    color: theme.text,
    border: `1px solid ${theme.border}`,
    boxSizing: 'border-box',
    fontWeight: '700',
  };

  const tabStyle = (tabName) => ({
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
    transition: '0.16s ease',
  });

  const panelStyle = {
    background: theme.card,
    border: `1px solid ${theme.border}`,
    borderRadius: theme.radius,
    padding: '32px',
    marginBottom: '32px',
    boxShadow: theme.shadow,
    backdropFilter: theme.glass,
    WebkitBackdropFilter: theme.glass,
  };

  const smallCardStyle = {
    background: theme.card,
    border: `1px solid ${theme.border}`,
    borderRadius: '18px',
    padding: '20px',
    boxShadow: theme.shadow,
    backdropFilter: theme.glass,
    WebkitBackdropFilter: theme.glass,
  };

    const renderQuestionList = (title, items, icon) => {
    const safeItems = Array.isArray(items) ? items : [];

    if (safeItems.length === 0) return null;

    return (
      <div
        style={{
          background: theme.isDark ? 'rgba(255,255,255,0.035)' : 'rgba(255,255,255,0.72)',
          border: `1px solid ${theme.border}`,
          borderRadius: '16px',
          padding: '14px',
          marginBottom: '12px',
        }}
      >
        <h4 style={{ color: theme.text, margin: '0 0 12px', fontWeight: 950 }}>
          {icon} {title} ({safeItems.length})
        </h4>

        <div style={{ display: 'grid', gap: '10px' }}>
          {safeItems.map((item, index) => (
            <div
              key={index}
              style={{
                border: `1px solid ${theme.border}`,
                borderRadius: '13px',
                padding: '12px',
                background: theme.isDark ? 'rgba(15,23,42,0.55)' : '#ffffff',
              }}
            >
              <p style={{ color: theme.text, margin: '0 0 8px', fontWeight: 900, lineHeight: 1.5 }}>
                {index + 1}. {item?.question || 'Question missing'}
              </p>

              {Array.isArray(item?.options) && item.options.length > 0 && (
                <div style={{ display: 'grid', gap: '5px', marginBottom: '8px' }}>
                  {item.options.map((opt, optIndex) => (
                    <p key={optIndex} style={{ color: theme.muted, margin: 0, fontSize: '13px', fontWeight: 750 }}>
                      {String.fromCharCode(65 + optIndex)}. {opt}
                    </p>
                  ))}
                </div>
              )}

              {item?.correctAnswer && (
                <p style={{ color: theme.success, margin: '6px 0', fontSize: '13px', fontWeight: 900 }}>
                  ✅ Correct: {item.correctAnswer}
                </p>
              )}

              {item?.answerHint && (
                <p style={{ color: theme.muted, margin: '6px 0 0', fontSize: '13px', lineHeight: 1.5 }}>
                  💡 Hint: {item.answerHint}
                </p>
              )}

              {item?.explanation && (
                <p style={{ color: theme.muted, margin: '6px 0 0', fontSize: '13px', lineHeight: 1.5 }}>
                  🧠 Explanation: {item.explanation}
                </p>
              )}

              {item?.reason && (
                <p style={{ color: theme.muted, margin: '6px 0 0', fontSize: '13px', lineHeight: 1.5 }}>
                  🎯 Reason: {item.reason}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderBulletSection = (title, items, icon) => {
    const safeItems = Array.isArray(items) ? items : [];

    if (safeItems.length === 0) return null;

    return (
      <div
        style={{
          background: theme.isDark ? 'rgba(255,255,255,0.035)' : 'rgba(255,255,255,0.72)',
          border: `1px solid ${theme.border}`,
          borderRadius: '16px',
          padding: '14px',
          marginBottom: '12px',
        }}
      >
        <h4 style={{ color: theme.text, margin: '0 0 12px', fontWeight: 950 }}>
          {icon} {title} ({safeItems.length})
        </h4>

        <div style={{ display: 'grid', gap: '9px' }}>
          {safeItems.map((item, index) => (
            <div
              key={index}
              style={{
                border: `1px solid ${theme.border}`,
                borderRadius: '13px',
                padding: '11px 12px',
                background: theme.isDark ? 'rgba(15,23,42,0.55)' : '#ffffff',
                color: theme.text,
                fontWeight: 800,
                lineHeight: 1.6,
              }}
            >
              <span style={{ color: theme.primary, fontWeight: 950 }}>{index + 1}.</span>{' '}
              {String(item || '')}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderFlashcardsList = (cards) => {
    const safeCards = Array.isArray(cards) ? cards : [];

    if (safeCards.length === 0) return null;

    return (
      <div
        style={{
          background: theme.isDark ? 'rgba(255,255,255,0.035)' : 'rgba(255,255,255,0.72)',
          border: `1px solid ${theme.border}`,
          borderRadius: '16px',
          padding: '14px',
          marginBottom: '12px',
        }}
      >
        <h4 style={{ color: theme.text, margin: '0 0 12px', fontWeight: 950 }}>
          🃏 Flashcards ({safeCards.length})
        </h4>

        <div style={{ display: 'grid', gap: '10px' }}>
          {safeCards.map((card, index) => (
            <div
              key={index}
              style={{
                border: `1px solid ${theme.border}`,
                borderRadius: '13px',
                padding: '12px',
                background: theme.isDark ? 'rgba(15,23,42,0.55)' : '#ffffff',
              }}
            >
              <p style={{ color: theme.text, margin: '0 0 8px', fontWeight: 950, lineHeight: 1.5 }}>
                {index + 1}. {card?.front || card?.question || 'Front missing'}
              </p>

              <p style={{ color: theme.muted, margin: '0 0 6px', fontSize: '13px', lineHeight: 1.5, fontWeight: 800 }}>
                ✅ {card?.back || card?.answer || 'Back missing'}
              </p>

              {card?.hint && (
                <p style={{ color: theme.muted, margin: '6px 0 0', fontSize: '13px', lineHeight: 1.5 }}>
                  💡 Hint: {card.hint}
                </p>
              )}

              {card?.tag && (
                <p style={{ color: theme.primary, margin: '6px 0 0', fontSize: '12px', fontWeight: 950 }}>
                  🏷️ {card.tag}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderStudyToolContent = (tool) => {
    const content = tool?.content || {};

    if (tool?.type === 'quiz') {
      return (
        <div style={{ marginTop: '14px' }}>
          {renderQuestionList('Quiz Questions', content.quizQuestions || content.questions || content.mcqs, '🧠')}
        </div>
      );
    }

    if (tool?.type === 'summary') {
      return (
        <div style={{ marginTop: '14px' }}>
          {content.summary && (
            <div
              style={{
                background: theme.isDark ? 'rgba(34,197,94,0.10)' : '#dcfce7',
                border: `1px solid ${theme.border}`,
                borderRadius: '16px',
                padding: '14px',
                marginBottom: '12px',
              }}
            >
              <h4 style={{ color: theme.text, margin: '0 0 10px', fontWeight: 950 }}>
                📝 Quick Summary
              </h4>

              <p style={{ color: theme.text, margin: 0, lineHeight: 1.6, fontWeight: 800 }}>
                {content.summary}
              </p>
            </div>
          )}

          {renderBulletSection('Definitions', content.definitions, '📌')}
          {renderBulletSection('Key Points', content.keyPoints, '⚡')}
          {renderBulletSection('Exam Answer Points', content.examAnswer, '📚')}
          {renderBulletSection('Quick Revision', content.quickRevision, '🚀')}
          {renderBulletSection('Important Terms', content.importantTerms, '🏷️')}
        </div>
      );
    }

    if (tool?.type === 'flashcards') {
      return (
        <div style={{ marginTop: '14px' }}>
          {renderFlashcardsList(content.flashcards || content.cards)}
        </div>
      );
    }

    return (
      <div style={{ marginTop: '14px' }}>
        {renderQuestionList('Short Questions', content.shortQuestions, '✍️')}
        {renderQuestionList('Long Questions', content.longQuestions, '📚')}
        {renderQuestionList('MCQs', content.mcqs, '✅')}
        {renderQuestionList('Most Expected Questions', content.mostExpectedQuestions, '🔥')}
      </div>
    );
  };

  const renderCouponSection = () => (
    <div>
      <div style={panelStyle}>
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
            fontWeight: 800,
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
            borderRadius: '14px',
            fontSize: '16px',
            cursor: 'pointer',
            fontWeight: '900',
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
              borderRadius: '16px',
              color: theme.muted,
              fontWeight: 800,
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
                    ...smallCardStyle,
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
                          fontWeight: '900',
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
                            fontWeight: '900',
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
                        borderRadius: '12px',
                        cursor: 'pointer',
                        fontWeight: '800',
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
                        borderRadius: '12px',
                        cursor: 'pointer',
                        fontWeight: '800',
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

  const renderAssistantLogsSection = () => {
    const filteredLogs = assistantLogs.filter((log) => {
      const q = assistantSearch.trim().toLowerCase();

      if (!q) return true;

      return (
        log.userName?.toLowerCase().includes(q) ||
        log.userEmail?.toLowerCase().includes(q) ||
        log.question?.toLowerCase().includes(q) ||
        log.answer?.toLowerCase().includes(q) ||
        log.status?.toLowerCase().includes(q)
      );
    });

    return (
      <div>
        <div style={panelStyle}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: '14px',
              flexWrap: 'wrap',
              alignItems: 'center',
              marginBottom: '18px',
            }}
          >
            <div>
              <h3 style={{ color: theme.text, marginTop: 0, marginBottom: '8px' }}>
                🤖 Assistant Chat Logs
              </h3>

              <p style={{ color: theme.muted, margin: 0, fontWeight: 750 }}>
                Yahan dikhega kis user ne assistant se kya pucha aur assistant ne kya reply diya.
              </p>
            </div>

            <button
              onClick={fetchAssistantLogs}
              style={{
                padding: '10px 16px',
                background: theme.primary,
                color: theme.buttonText,
                border: 'none',
                borderRadius: '13px',
                cursor: 'pointer',
                fontWeight: 900,
                boxShadow: theme.shadow,
              }}
            >
              🔄 Refresh
            </button>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '12px',
              marginBottom: '18px',
            }}
          >
            <div
              style={{
                background: theme.isDark ? 'rgba(255,255,255,0.035)' : 'rgba(255,255,255,0.72)',
                border: `1px solid ${theme.border}`,
                borderRadius: '16px',
                padding: '15px',
              }}
            >
              <p style={{ color: theme.muted, margin: '0 0 6px', fontSize: '12px', fontWeight: 900 }}>
                TOTAL CHATS
              </p>
              <h2 style={{ color: theme.text, margin: 0 }}>{assistantLogs.length}</h2>
            </div>

            <div
              style={{
                background: theme.isDark ? 'rgba(34,197,94,0.08)' : '#ecfdf5',
                border: `1px solid ${theme.border}`,
                borderRadius: '16px',
                padding: '15px',
              }}
            >
              <p style={{ color: theme.muted, margin: '0 0 6px', fontSize: '12px', fontWeight: 900 }}>
                ANSWERED
              </p>
              <h2 style={{ color: theme.success, margin: 0 }}>
                {assistantLogs.filter((l) => l.status === 'answered').length}
              </h2>
            </div>

            <div
              style={{
                background: theme.isDark ? 'rgba(239,68,68,0.08)' : '#fef2f2',
                border: `1px solid ${theme.border}`,
                borderRadius: '16px',
                padding: '15px',
              }}
            >
              <p style={{ color: theme.muted, margin: '0 0 6px', fontSize: '12px', fontWeight: 900 }}>
                FAILED
              </p>
              <h2 style={{ color: theme.danger, margin: 0 }}>
                {assistantLogs.filter((l) => l.status === 'failed').length}
              </h2>
            </div>
          </div>

          <input
            style={{ ...inputStyle, marginBottom: 0 }}
            placeholder="Search by user, email, question, answer..."
            value={assistantSearch}
            onChange={(e) => setAssistantSearch(e.target.value)}
          />
        </div>

        {assistantLoading ? (
          <div
            style={{
              ...smallCardStyle,
              color: theme.muted,
              fontWeight: 900,
              textAlign: 'center',
            }}
          >
            ⏳ Assistant logs loading...
          </div>
        ) : filteredLogs.length === 0 ? (
          <div
            style={{
              ...smallCardStyle,
              color: theme.muted,
              fontWeight: 900,
              textAlign: 'center',
            }}
          >
            Abhi assistant logs nahi mile.
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '16px' }}>
            {filteredLogs.map((log) => {
              const isExpanded = expandedAssistantLog === log._id;

              return (
                <div key={log._id} style={smallCardStyle}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: '14px',
                      flexWrap: 'wrap',
                      marginBottom: '14px',
                    }}
                  >
                    <div style={{ flex: 1, minWidth: '240px' }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          flexWrap: 'wrap',
                          marginBottom: '8px',
                        }}
                      >
                        <h4 style={{ color: theme.text, margin: 0 }}>
                          👤 {log.userName || log.user?.name || 'Unknown User'}
                        </h4>

                        <span
                          style={{
                            padding: '5px 10px',
                            borderRadius: '999px',
                            fontSize: '12px',
                            fontWeight: 900,
                            background:
                              log.status === 'answered'
                                ? 'rgba(34,197,94,0.14)'
                                : 'rgba(239,68,68,0.14)',
                            color: log.status === 'answered' ? theme.success : theme.danger,
                            border: `1px solid ${theme.border}`,
                          }}
                        >
                          {log.status === 'answered' ? 'Answered' : 'Failed'}
                        </span>
                      </div>

                      <p style={{ color: theme.muted, margin: '4px 0', fontSize: '13px' }}>
                        📧 {log.userEmail || log.user?.email || 'No email'}
                      </p>

                      <p style={{ color: theme.muted, margin: '4px 0', fontSize: '13px' }}>
                        🕒 {formatAssistantDate(log.createdAt)}
                      </p>

                      <p style={{ color: theme.muted, margin: '4px 0', fontSize: '13px' }}>
                        💻 {getShortDevice(log.deviceInfo)}
                      </p>
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        gap: '8px',
                        alignItems: 'flex-start',
                        flexWrap: 'wrap',
                      }}
                    >
                      <button
                        onClick={() => setExpandedAssistantLog(isExpanded ? null : log._id)}
                        style={adminStyles.blueBtn(theme)}
                      >
                        {isExpanded ? 'Hide' : 'View'}
                      </button>

                      <button
                        onClick={() => deleteAssistantLog(log._id)}
                        style={adminStyles.dangerBtn(theme)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  <div
                    style={{
                      background: theme.isDark ? 'rgba(255,255,255,0.035)' : 'rgba(255,255,255,0.75)',
                      border: `1px solid ${theme.border}`,
                      borderRadius: '15px',
                      padding: '14px',
                      marginBottom: isExpanded ? '12px' : 0,
                    }}
                  >
                    <p
                      style={{
                        color: theme.primary,
                        fontWeight: 950,
                        margin: '0 0 8px',
                        fontSize: '13px',
                      }}
                    >
                      USER QUESTION
                    </p>

                    <p
                      style={{
                        color: theme.text,
                        margin: 0,
                        fontWeight: 800,
                        lineHeight: 1.5,
                        whiteSpace: 'pre-wrap',
                      }}
                    >
                      {log.question || 'No question found'}
                    </p>
                  </div>

                  {isExpanded && (
                    <>
                      <div
                        style={{
                          background: theme.isDark ? 'rgba(124,58,237,0.08)' : '#f5f3ff',
                          border: `1px solid ${theme.border}`,
                          borderRadius: '15px',
                          padding: '14px',
                          marginBottom: '12px',
                        }}
                      >
                        <p
                          style={{
                            color: theme.primary,
                            fontWeight: 950,
                            margin: '0 0 8px',
                            fontSize: '13px',
                          }}
                        >
                          ASSISTANT RESPONSE
                        </p>

                        <p
                          style={{
                            color: theme.text,
                            margin: 0,
                            lineHeight: 1.6,
                            whiteSpace: 'pre-wrap',
                            fontWeight: 750,
                          }}
                        >
                          {log.answer || 'No answer found'}
                        </p>
                      </div>

                      <div
                        style={{
                          background: theme.isDark ? 'rgba(255,255,255,0.03)' : 'rgba(248,250,252,0.9)',
                          border: `1px solid ${theme.border}`,
                          borderRadius: '15px',
                          padding: '14px',
                        }}
                      >
                        <p
                          style={{
                            color: theme.muted,
                            fontWeight: 950,
                            margin: '0 0 8px',
                            fontSize: '13px',
                          }}
                        >
                          TECH DETAILS
                        </p>

                        <p style={{ color: theme.muted, margin: '4px 0', fontSize: '12px', wordBreak: 'break-all' }}>
                          IP: {log.ipAddress || 'Not available'}
                        </p>

                        <p style={{ color: theme.muted, margin: '4px 0', fontSize: '12px', wordBreak: 'break-all' }}>
                          Device: {log.deviceInfo || 'Not available'}
                        </p>

                        <p style={{ color: theme.muted, margin: '4px 0', fontSize: '12px', wordBreak: 'break-all' }}>
                          Log ID: {log._id}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
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
      <div style={adminStyles.bgGrid} />
      <div style={adminStyles.glowOne} />
      <div style={adminStyles.glowTwo} />

      {/* ✅ AI GENERATE MODAL */}
      {aiModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(2, 6, 23, 0.72)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '18px',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
          }}
          onClick={closeImportantQuestionsModal}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
            style={{
              width: 'min(720px, 100%)',
              maxHeight: '88vh',
              overflowY: 'auto',
              background: theme.card,
              border: `1px solid ${theme.border}`,
              borderRadius: '24px',
              padding: '24px',
              boxShadow: '0 30px 90px rgba(0,0,0,0.45)',
              backdropFilter: theme.glass,
              WebkitBackdropFilter: theme.glass,
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: '14px',
                alignItems: 'flex-start',
                marginBottom: '18px',
              }}
            >
              <div>
                <p
                  style={{
                    color: theme.primary,
                    margin: '0 0 7px',
                    fontSize: '12px',
                    fontWeight: 950,
                    letterSpacing: '0.5px',
                  }}
                >
                  ✨ AI STUDY TOOL
                </p>

                <h3
                  style={{
                    color: theme.text,
                    margin: 0,
                    fontSize: '24px',
                    fontWeight: 950,
                  }}
                >
                  {getStudyToolMeta(aiGenerationType).heading}
                </h3>

                <p
                  style={{
                    color: theme.muted,
                    margin: '8px 0 0',
                    fontWeight: 750,
                    lineHeight: 1.5,
                  }}
                >
                  Course:{' '}
                  <strong style={{ color: theme.text }}>
                    {aiSelectedCourse?.title || 'Selected Course'}
                  </strong>
                </p>
              </div>

              <button
                onClick={closeImportantQuestionsModal}
                disabled={aiGenerating}
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '12px',
                  border: `1px solid ${theme.border}`,
                  background: theme.isDark ? 'rgba(255,255,255,0.06)' : '#ffffff',
                  color: theme.text,
                  cursor: aiGenerating ? 'not-allowed' : 'pointer',
                  fontWeight: 950,
                  fontSize: '18px',
                }}
              >
                ×
              </button>
            </div>
                        {/* How to use info box */}
            <div
              style={{
                background: theme.isDark ? 'rgba(124,58,237,0.10)' : '#f5f3ff',
                border: `1px solid ${theme.border}`,
                borderRadius: '16px',
                padding: '14px',
                marginBottom: '16px',
              }}
            >
              <p
                style={{
                  color: theme.text,
                  margin: '0 0 6px',
                  fontWeight: 900,
                }}
              >
                Kaise use karna hai?
              </p>

              <p
                style={{
                  color: theme.muted,
                  margin: 0,
                  fontSize: '13px',
                  fontWeight: 750,
                  lineHeight: 1.5,
                }}
              >
                AI selected tool ke hisaab se draft banayega: important questions, quiz, summary ya flashcards. Draft pehle Review AI mein save hoga, publish karne ke baad students ko dikhega.
              </p>
            </div>

            {/* ✅ NEW: Tool Name / Title Input */}
            <div
              style={{
                background: theme.isDark ? 'rgba(255,255,255,0.035)' : 'rgba(255,255,255,0.72)',
                border: `1px solid ${theme.border}`,
                borderRadius: '16px',
                padding: '16px',
                marginBottom: '16px',
              }}
            >
              <p
                style={{
                  color: theme.text,
                  margin: '0 0 10px',
                  fontWeight: 950,
                }}
              >
                🏷️ Tool Name / Title
              </p>

              <input
                style={{
                  ...inputStyle,
                  marginBottom: 0,
                }}
                placeholder={getStudyToolMeta(aiGenerationType).placeholder}
                value={aiCustomTitle}
                disabled={aiGenerating}
                onChange={(e) => setAiCustomTitle(e.target.value)}
              />

              <p
                style={{
                  color: theme.muted,
                  margin: '8px 0 0',
                  fontSize: '12px',
                  fontWeight: 750,
                  lineHeight: 1.5,
                }}
              >
                {aiSelectedPdfIndexes.length > 1
                  ? '💡 Multiple PDFs selected: har draft mein PDF ka naam automatically append hoga. Example: "Physics Quiz - UNIT 1", "Physics Quiz - UNIT 2"'
                  : '💡 Blank chhodo toh backend default title use karega. Ek PDF ke liye exactly yahi title save hoga.'}
              </p>
            </div>

            {/* PDF Source Selection */}
            <div
              style={{
                background: theme.isDark ? 'rgba(255,255,255,0.035)' : 'rgba(255,255,255,0.72)',
                border: `1px solid ${theme.border}`,
                borderRadius: '16px',
                padding: '16px',
                marginBottom: '16px',
              }}
            >
              <p
                style={{
                  color: theme.text,
                  margin: '0 0 8px',
                  fontWeight: 950,
                }}
              >
                📄 PDF Source
              </p>

              {aiSelectedCourse?.pdfs?.length > 0 ? (
                <>
                  <p
                    style={{
                      color: theme.muted,
                      margin: '0 0 6px',
                      fontSize: '13px',
                      fontWeight: 800,
                      lineHeight: 1.5,
                    }}
                  >
                    Jo PDFs use karni hain woh select karo:
                  </p>

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: '10px',
                      flexWrap: 'wrap',
                      marginBottom: '12px',
                    }}
                  >
                    <button
                      type="button"
                      onClick={selectAllAiPdfs}
                      disabled={aiGenerating}
                      style={{
                        padding: '8px 12px',
                        borderRadius: '12px',
                        border: `1px solid ${theme.border}`,
                        background: theme.isDark ? 'rgba(255,255,255,0.06)' : '#ffffff',
                        color: theme.text,
                        cursor: aiGenerating ? 'not-allowed' : 'pointer',
                        fontWeight: 900,
                      }}
                    >
                      Select All
                    </button>

                    <button
                      type="button"
                      onClick={clearAllAiPdfs}
                      disabled={aiGenerating}
                      style={{
                        padding: '8px 12px',
                        borderRadius: '12px',
                        border: `1px solid ${theme.border}`,
                        background: 'transparent',
                        color: theme.muted,
                        cursor: aiGenerating ? 'not-allowed' : 'pointer',
                        fontWeight: 900,
                      }}
                    >
                      Clear
                    </button>
                  </div>

                  <div style={{ display: 'grid', gap: '8px' }}>
                    {aiSelectedCourse?.pdfs?.map((pdf, index) => {
                      const checked = aiSelectedPdfIndexes.includes(index);

                      return (
                        <label
                          key={index}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '10px 12px',
                            borderRadius: '13px',
                            border: `1px solid ${checked ? theme.primary : theme.border}`,
                            background: checked
                              ? theme.isDark
                                ? 'rgba(139,92,246,0.14)'
                                : '#f5f3ff'
                              : theme.isDark
                              ? 'rgba(255,255,255,0.03)'
                              : 'rgba(255,255,255,0.6)',
                            cursor: aiGenerating ? 'not-allowed' : 'pointer',
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            disabled={aiGenerating}
                            onChange={() => toggleAiPdfSelection(index)}
                            style={{ width: '16px', height: '16px', accentColor: theme.primary }}
                          />

                          <span
                            style={{
                              color: checked ? theme.primary : theme.text,
                              fontSize: '14px',
                              fontWeight: 950,
                              wordBreak: 'break-word',
                            }}
                          >
                            {index + 1}. {pdf.title || pdf.filename || 'Uploaded PDF'}
                          </span>
                        </label>
                      );
                    })}
                  </div>

                  <p
                    style={{
                      color: aiSelectedPdfIndexes.length === 0 ? theme.danger : theme.success,
                      margin: '12px 0 0',
                      fontSize: '13px',
                      fontWeight: 900,
                    }}
                  >
                    Selected PDFs: {aiSelectedPdfIndexes.length} / {aiSelectedCourse?.pdfs?.length || 0}
                  </p>
                </>
              ) : (
                <p
                  style={{
                    color: theme.danger,
                    margin: 0,
                    fontSize: '13px',
                    fontWeight: 900,
                    lineHeight: 1.5,
                  }}
                >
                  ❌ Is course mein abhi koi PDF nahi hai. Pehle PDF upload karo, phir AI generate hoga.
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '12px',
                flexWrap: 'wrap',
                alignItems: 'center',
              }}
            >
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button
                  onClick={closeImportantQuestionsModal}
                  disabled={aiGenerating}
                  style={{
                    padding: '11px 16px',
                    background: 'transparent',
                    color: theme.muted,
                    border: `1px solid ${theme.border}`,
                    borderRadius: '13px',
                    cursor: aiGenerating ? 'not-allowed' : 'pointer',
                    fontWeight: 900,
                  }}
                >
                  Cancel
                </button>

                <button
                  onClick={generateStudyTool}
                  disabled={aiGenerating}
                  style={{
                    padding: '11px 18px',
                    background: aiGenerating
                      ? 'linear-gradient(135deg, #64748b, #334155)'
                      : getStudyToolMeta(aiGenerationType).gradient,
                    color: '#fff',
                    border: 'none',
                    borderRadius: '13px',
                    cursor: aiGenerating ? 'not-allowed' : 'pointer',
                    fontWeight: 950,
                    boxShadow: theme.shadow,
                  }}
                >
                  {aiGenerating ? '⏳ Generating...' : getStudyToolMeta(aiGenerationType).buttonText}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* ✅ AI REVIEW MODAL */}
      {aiReviewModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(2, 6, 23, 0.78)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '18px',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
          }}
          onClick={closeStudyToolsReviewModal}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
            style={{
              width: 'min(980px, 100%)',
              maxHeight: '90vh',
              overflowY: 'auto',
              background: theme.card,
              border: `1px solid ${theme.border}`,
              borderRadius: '24px',
              padding: '24px',
              boxShadow: '0 30px 90px rgba(0,0,0,0.45)',
              backdropFilter: theme.glass,
              WebkitBackdropFilter: theme.glass,
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: '14px',
                alignItems: 'flex-start',
                marginBottom: '18px',
              }}
            >
              <div>
                <p
                  style={{
                    color: theme.primary,
                    margin: '0 0 7px',
                    fontSize: '12px',
                    fontWeight: 950,
                    letterSpacing: '0.5px',
                  }}
                >
                  🧾 AI REVIEW CENTER
                </p>

                <h3 style={{ color: theme.text, margin: 0, fontSize: '24px', fontWeight: 950 }}>
                  Review / Publish AI Study Tools
                </h3>

                <p style={{ color: theme.muted, margin: '8px 0 0', fontWeight: 750, lineHeight: 1.5 }}>
                  Course:{' '}
                  <strong style={{ color: theme.text }}>
                    {aiReviewCourse?.title || 'Selected Course'}
                  </strong>
                </p>
              </div>

              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => fetchStudyToolsForCourse(aiReviewCourse)}
                  disabled={aiToolsLoading}
                  style={{
                    padding: '9px 13px',
                    borderRadius: '12px',
                    border: `1px solid ${theme.border}`,
                    background: theme.primary,
                    color: theme.buttonText,
                    cursor: aiToolsLoading ? 'not-allowed' : 'pointer',
                    fontWeight: 900,
                  }}
                >
                  🔄 Refresh
                </button>

                <button
                  onClick={closeStudyToolsReviewModal}
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '12px',
                    border: `1px solid ${theme.border}`,
                    background: theme.isDark ? 'rgba(255,255,255,0.06)' : '#ffffff',
                    color: theme.text,
                    cursor: 'pointer',
                    fontWeight: 950,
                    fontSize: '18px',
                  }}
                >
                  ×
                </button>
              </div>
            </div>

            <div
              style={{
                background: theme.isDark ? 'rgba(34,197,94,0.08)' : '#ecfdf5',
                border: `1px solid ${theme.border}`,
                borderRadius: '16px',
                padding: '14px',
                marginBottom: '16px',
              }}
            >
              <p style={{ color: theme.text, margin: '0 0 6px', fontWeight: 900 }}>
                Publish kaise karna hai?
              </p>

              <p style={{ color: theme.muted, margin: 0, fontSize: '13px', fontWeight: 750, lineHeight: 1.5 }}>
                Pehle "Review" se generated study tool check karo. Sahi lage toh "Publish" dabao. Published tools students ko CourseDetail ke Study AI tabs mein dikhenge.
              </p>
            </div>

            {aiToolsLoading ? (
              <div
                style={{
                  padding: '18px',
                  borderRadius: '16px',
                  border: `1px solid ${theme.border}`,
                  color: theme.muted,
                  fontWeight: 900,
                  textAlign: 'center',
                }}
              >
                ⏳ Loading AI drafts...
              </div>
            ) : aiStudyTools.length === 0 ? (
              <div
                style={{
                  padding: '18px',
                  borderRadius: '16px',
                  border: `1px solid ${theme.border}`,
                  color: theme.muted,
                  fontWeight: 900,
                  textAlign: 'center',
                }}
              >
                Abhi is course ke liye koi AI draft nahi mila. Pehle AI tool generate karo: Questions, Quiz, Summary ya Flashcards.
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '14px' }}>
                {aiStudyTools.map((tool) => {
                  const isExpanded = expandedStudyTool === tool._id;
                  const content = tool.content || {};
                  const totalItems = getStudyToolStats(tool);
                  const toolMeta = getStudyToolMeta(tool.type);

                  return (
                    <div
                      key={tool._id}
                      style={{
                        background: theme.isDark ? 'rgba(255,255,255,0.035)' : 'rgba(255,255,255,0.72)',
                        border: `1px solid ${theme.border}`,
                        borderRadius: '18px',
                        padding: '16px',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          gap: '14px',
                          flexWrap: 'wrap',
                          alignItems: 'flex-start',
                        }}
                      >
                        <div style={{ flex: 1, minWidth: '240px' }}>
                          <h4 style={{ color: theme.text, margin: '0 0 8px', fontWeight: 950 }}>
                            {toolMeta.icon} {tool.title || toolMeta.name}
                          </h4>

                          <p style={{ color: theme.muted, margin: '0 0 6px', fontSize: '13px', fontWeight: 750 }}>
                            Items: <strong style={{ color: theme.text }}>{totalItems}</strong> | Type:{' '}
                            <strong style={{ color: theme.text }}>{toolMeta.name}</strong> | Source:{' '}
                            <strong style={{ color: theme.text }}>{tool.sourcePdf?.title || 'PDF'}</strong>
                          </p>

                          <span
                            style={{
                              display: 'inline-flex',
                              padding: '5px 10px',
                              borderRadius: '999px',
                              fontSize: '12px',
                              fontWeight: 950,
                              background:
                                tool.status === 'published'
                                  ? 'rgba(34,197,94,0.14)'
                                  : 'rgba(251,191,36,0.14)',
                              color:
                                tool.status === 'published'
                                  ? theme.success
                                  : theme.warning,
                              border: `1px solid ${theme.border}`,
                            }}
                          >
                            {tool.status === 'published' ? 'Published' : 'Draft'}
                          </span>
                        </div>

                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          <button
                            onClick={() => setExpandedStudyTool(isExpanded ? null : tool._id)}
                            style={adminStyles.blueBtn(theme)}
                          >
                            {isExpanded ? 'Hide' : 'Review'}
                          </button>

                          {tool.status === 'published' ? (
                            <button
                              onClick={() => unpublishStudyTool(tool._id)}
                              style={adminStyles.warningBtn(theme)}
                            >
                              Unpublish
                            </button>
                          ) : (
                            <button
                              onClick={() => publishStudyTool(tool._id)}
                              style={adminStyles.successBtn(theme)}
                            >
                              Publish
                            </button>
                          )}

                          <button
                            onClick={() => deleteStudyTool(tool._id, tool.title)}
                            style={adminStyles.dangerBtn(theme)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>

                      {isExpanded && renderStudyToolContent(tool)}
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </div>
      )}
            <div style={{ position: 'relative', zIndex: 2, maxWidth: '1320px', margin: '0 auto', padding: '28px 18px' }}>
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: 'easeOut' }}
          style={{
            ...panelStyle,
            padding: '26px',
            marginBottom: '22px',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: '16px',
              flexWrap: 'wrap',
              alignItems: 'center',
            }}
          >
            <div>
              <p style={{ color: theme.primary, margin: '0 0 8px', fontWeight: 950, fontSize: '13px' }}>
                ⚡ REHANVERSE ADMIN
              </p>

              <h1 style={{ color: theme.text, margin: 0, fontWeight: 950, fontSize: '34px' }}>
                Admin Panel
              </h1>

              <p style={{ color: theme.muted, margin: '8px 0 0', fontWeight: 750 }}>
                Courses, users, payments, live classes, coupons, notifications and AI study tools manage karo.
              </p>
            </div>

            <button
              onClick={() => navigate('/')}
              style={{
                padding: '11px 16px',
                background: theme.isDark ? 'rgba(255,255,255,0.06)' : '#fff',
                color: theme.text,
                border: `1px solid ${theme.border}`,
                borderRadius: '14px',
                cursor: 'pointer',
                fontWeight: 900,
              }}
            >
              🏠 Go Home
            </button>
          </div>

          {msg && (
            <div
              style={{
                marginTop: '18px',
                padding: '13px 14px',
                borderRadius: '14px',
                border: `1px solid ${theme.border}`,
                background: msg.includes('❌')
                  ? theme.isDark
                    ? 'rgba(239,68,68,0.12)'
                    : '#fee2e2'
                  : msg.includes('⏳')
                  ? theme.isDark
                    ? 'rgba(251,191,36,0.12)'
                    : '#fef3c7'
                  : theme.isDark
                  ? 'rgba(34,197,94,0.12)'
                  : '#dcfce7',
                color: msg.includes('❌') ? theme.danger : msg.includes('⏳') ? theme.warning : theme.success,
                fontWeight: 900,
              }}
            >
              {msg}
            </div>
          )}
        </motion.div>

        <div
          style={{
            display: 'flex',
            gap: '10px',
            flexWrap: 'wrap',
            marginBottom: '24px',
          }}
        >
          <button style={tabStyle('dashboard')} onClick={() => setActiveTab('dashboard')}>
            📊 Dashboard
          </button>

          <button style={tabStyle('courses')} onClick={() => setActiveTab('courses')}>
            📚 Courses
          </button>

          <button style={tabStyle('payments')} onClick={() => setActiveTab('payments')}>
            💳 Payments
          </button>

          <button style={tabStyle('users')} onClick={() => setActiveTab('users')}>
            👥 Users
          </button>

          <button style={tabStyle('coupons')} onClick={() => setActiveTab('coupons')}>
            🎟️ Coupons
          </button>

          <button style={tabStyle('live')} onClick={() => setActiveTab('live')}>
            🔴 Live Classes
          </button>

          <button style={tabStyle('notifications')} onClick={() => setActiveTab('notifications')}>
            🔔 Notifications
          </button>

          <button style={tabStyle('assistant')} onClick={() => setActiveTab('assistant')}>
            🤖 Assistant Logs
          </button>

          <button onClick={() => setActiveTab('security')} style={tabStyle('security')}>
            🛡️ Security
          </button>
        </div>
        {activeTab === 'dashboard' && (
          <div>
            <AdminDashboardStats
              theme={theme}
              users={users}
              courses={courses}
              payments={payments}
            />
          </div>
        )}

        {activeTab === 'courses' && (
          <div>
            <div style={panelStyle}>
              <h3 style={{ color: theme.text, marginTop: 0, marginBottom: '8px' }}>
                {editingId ? '✏️ Edit Course' : '➕ Create Course'}
              </h3>

              <p style={{ color: theme.muted, marginTop: 0, marginBottom: '22px' }}>
                Course details, videos, PDFs aur AI study tools ke source PDFs yahin manage honge.
              </p>

              <input
                style={inputStyle}
                placeholder="Course Title *"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />

              <textarea
                style={{ ...inputStyle, minHeight: '95px', resize: 'vertical' }}
                placeholder="Course Description *"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
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
                  type="number"
                  placeholder="Price"
                  value={form.price}
                  disabled={form.isFree}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                />

                <input
                  style={inputStyle}
                  placeholder="Thumbnail URL"
                  value={form.thumbnail}
                  onChange={(e) => setForm({ ...form, thumbnail: e.target.value })}
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
                  fontWeight: 850,
                }}
              >
                <input
                  type="checkbox"
                  checked={form.isFree}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      isFree: e.target.checked,
                      price: e.target.checked ? 0 : form.price || 39,
                    })
                  }
                />
                Free Course
              </label>

              <div
                style={{
                  background: theme.isDark ? 'rgba(255,255,255,0.035)' : 'rgba(255,255,255,0.72)',
                  border: `1px solid ${theme.border}`,
                  borderRadius: '18px',
                  padding: '16px',
                  marginBottom: '16px',
                }}
              >
                <h4 style={{ color: theme.text, marginTop: 0 }}>🎥 Add Video</h4>

                <input
                  style={inputStyle}
                  placeholder="Video Title"
                  value={form.videoTitle}
                  onChange={(e) => setForm({ ...form, videoTitle: e.target.value })}
                />

                <input
                  style={inputStyle}
                  placeholder="Video URL - YouTube / Drive / Direct"
                  value={form.videoUrl}
                  onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
                />

                <button
                  onClick={addVideo}
                  style={adminStyles.blueBtn(theme)}
                >
                  ➕ Add Video
                </button>

                {videos.length > 0 && (
                  <div style={{ marginTop: '14px', display: 'grid', gap: '8px' }}>
                    {videos.map((video, index) => (
                      <div
                        key={index}
                        style={{
                          padding: '10px 12px',
                          borderRadius: '13px',
                          border: `1px solid ${theme.border}`,
                          background: theme.isDark ? 'rgba(15,23,42,0.55)' : '#fff',
                          display: 'flex',
                          justifyContent: 'space-between',
                          gap: '10px',
                          flexWrap: 'wrap',
                        }}
                      >
                        <span style={{ color: theme.text, fontWeight: 850 }}>
                          {index + 1}. {video.title}
                        </span>

                        <button
                          onClick={() => setVideos(videos.filter((_, i) => i !== index))}
                          style={adminStyles.dangerBtn(theme)}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div
                style={{
                  background: theme.isDark ? 'rgba(255,255,255,0.035)' : 'rgba(255,255,255,0.72)',
                  border: `1px solid ${theme.border}`,
                  borderRadius: '18px',
                  padding: '16px',
                  marginBottom: '16px',
                }}
              >
                <h4 style={{ color: theme.text, marginTop: 0 }}>📄 Add PDF</h4>

                <input
                  style={inputStyle}
                  placeholder="PDF Title"
                  value={form.pdfTitle}
                  onChange={(e) => setForm({ ...form, pdfTitle: e.target.value })}
                />

                <input
                  id="pdfFileInput"
                  style={inputStyle}
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                />

                <button
                  onClick={addPdf}
                  style={adminStyles.successBtn(theme)}
                >
                  📤 Upload + Add PDF
                </button>

                {pdfs.length > 0 && (
                  <div style={{ marginTop: '14px', display: 'grid', gap: '8px' }}>
                    {pdfs.map((pdf, index) => (
                      <div
                        key={index}
                        style={{
                          padding: '10px 12px',
                          borderRadius: '13px',
                          border: `1px solid ${theme.border}`,
                          background: theme.isDark ? 'rgba(15,23,42,0.55)' : '#fff',
                          display: 'flex',
                          justifyContent: 'space-between',
                          gap: '10px',
                          flexWrap: 'wrap',
                        }}
                      >
                        <span style={{ color: theme.text, fontWeight: 850 }}>
                          {index + 1}. {pdf.title}
                        </span>

                        <button
                          onClick={() => setPdfs(pdfs.filter((_, i) => i !== index))}
                          style={adminStyles.dangerBtn(theme)}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button
                  onClick={handleSubmit}
                  style={{
                    padding: '13px 18px',
                    background: editingId
                      ? 'linear-gradient(135deg, #f59e0b, #d97706)'
                      : 'linear-gradient(135deg, #22c55e, #15803d)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '14px',
                    cursor: 'pointer',
                    fontWeight: 950,
                    boxShadow: theme.shadow,
                  }}
                >
                  {editingId ? '✅ Update Course' : '🚀 Create Course'}
                </button>

                {editingId && (
                  <button
                    onClick={cancelEdit}
                    style={{
                      padding: '13px 18px',
                      background: theme.isDark ? 'rgba(255,255,255,0.06)' : '#fff',
                      color: theme.text,
                      border: `1px solid ${theme.border}`,
                      borderRadius: '14px',
                      cursor: 'pointer',
                      fontWeight: 950,
                    }}
                  >
                    Cancel Edit
                  </button>
                )}
              </div>
            </div>

            <h3 style={{ color: theme.text, marginBottom: '16px' }}>
              📚 All Courses ({courses.length})
            </h3>

            {courses.length === 0 ? (
              <div style={{ ...smallCardStyle, color: theme.muted, fontWeight: 900 }}>
                Abhi koi course nahi hai.
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '16px' }}>
                {courses.map((course) => (
                  <div key={course._id}>
                    <div
                      style={{
                        ...smallCardStyle,
                        borderRadius: expandedCourse === course._id ? '18px 18px 0 0' : '18px',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          gap: '14px',
                          flexWrap: 'wrap',
                          alignItems: 'center',
                        }}
                      >
                        <div style={{ flex: 1, minWidth: '250px' }}>
                          <h3 style={{ color: theme.text, margin: '0 0 6px', fontWeight: 950 }}>
                            {course.title}
                          </h3>

                          <p style={{ color: theme.muted, fontSize: '13px', margin: '0 0 8px', lineHeight: 1.5 }}>
                            {course.description}
                          </p>

                          <p style={{ color: theme.muted, fontSize: '13px', margin: 0, fontWeight: 800 }}>
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
                            style={adminStyles.blueBtn(theme)}
                          >
                            👥 {expandedCourse === course._id ? 'Hide' : 'Students'}
                          </button>

                          <button
                            onClick={() => openStudyToolGeneratorModal(course, 'important_questions')}
                            style={{
                              padding: '9px 14px',
                              background: 'linear-gradient(135deg, #8b5cf6, #4f46e5)',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '12px',
                              cursor: 'pointer',
                              fontWeight: '900',
                              boxShadow: theme.shadow,
                            }}
                          >
                            ✨ AI Questions
                          </button>

                          <button
                            onClick={() => openStudyToolGeneratorModal(course, 'quiz')}
                            style={{
                              padding: '9px 14px',
                              background: 'linear-gradient(135deg, #06b6d4, #2563eb)',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '12px',
                              cursor: 'pointer',
                              fontWeight: '900',
                              boxShadow: theme.shadow,
                            }}
                          >
                            🧠 AI Quiz
                          </button>

                          <button
                            onClick={() => openStudyToolGeneratorModal(course, 'summary')}
                            style={{
                              padding: '9px 14px',
                              background: 'linear-gradient(135deg, #22c55e, #0ea5e9)',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '12px',
                              cursor: 'pointer',
                              fontWeight: '900',
                              boxShadow: theme.shadow,
                            }}
                          >
                            📝 AI Summary
                          </button>

                          <button
                            onClick={() => openStudyToolGeneratorModal(course, 'flashcards')}
                            style={{
                              padding: '9px 14px',
                              background: 'linear-gradient(135deg, #f97316, #ec4899)',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '12px',
                              cursor: 'pointer',
                              fontWeight: '900',
                              boxShadow: theme.shadow,
                            }}
                          >
                            🃏 Flashcards
                          </button>

                          <button
                            onClick={() => openStudyToolsReviewModal(course)}
                            style={{
                              padding: '9px 14px',
                              background: 'linear-gradient(135deg, #22c55e, #15803d)',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '12px',
                              cursor: 'pointer',
                              fontWeight: '900',
                              boxShadow: theme.shadow,
                            }}
                          >
                            🧾 Review AI
                          </button>

                          <button
                            onClick={() => startEdit(course)}
                            style={adminStyles.warningBtn(theme)}
                          >
                            ✏️ Edit
                          </button>

                          <button
                            onClick={() => deleteCourse(course._id)}
                            style={adminStyles.dangerBtn(theme)}
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </div>
                    </div>

                    {expandedCourse === course._id && (
                      <div
                        style={{
                          background: theme.isDark ? 'rgba(255,255,255,0.035)' : 'rgba(255,255,255,0.72)',
                          border: `1px solid ${theme.border}`,
                          borderRadius: '0 0 16px 16px',
                          padding: '16px',
                          marginTop: '-4px',
                        }}
                      >
                        <p
                          style={{
                            color: theme.text,
                            fontWeight: '900',
                            marginBottom: '12px',
                            fontSize: '14px',
                          }}
                        >
                          👥 Enrolled Students ({enrolledUsers[course._id]?.length || 0})
                        </p>

                        {enrolledUsers[course._id]?.length === 0 ? (
                          <p style={{ color: theme.muted, margin: 0 }}>
                            Abhi koi student enrolled nahi hai.
                          </p>
                        ) : (
                          <div style={{ display: 'grid', gap: '8px' }}>
                            {enrolledUsers[course._id]?.map((student) => (
                              <div
                                key={student._id}
                                style={{
                                  padding: '10px 12px',
                                  borderRadius: '12px',
                                  border: `1px solid ${theme.border}`,
                                  color: theme.text,
                                  background: theme.isDark ? 'rgba(15,23,42,0.52)' : '#fff',
                                  fontWeight: 800,
                                }}
                              >
                                👤 {student.name} — {student.email}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'payments' && (
          <div>
            <h3 style={{ color: theme.text, marginBottom: '16px' }}>
              💳 Payment Requests ({payments.length})
            </h3>

            {payments.length === 0 ? (
              <div style={{ ...smallCardStyle, color: theme.muted, fontWeight: 900 }}>
                Abhi koi payment request nahi hai.
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '16px' }}>
                {payments.map((payment) => {
                  const screenshot = getPaymentScreenshot(payment);

                  return (
                    <div key={payment._id} style={smallCardStyle}>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          gap: '16px',
                          flexWrap: 'wrap',
                        }}
                      >
                        <div style={{ flex: 1, minWidth: '250px' }}>
                          <h4 style={{ color: theme.text, margin: '0 0 8px' }}>
                            {payment.course?.title || 'Unknown Course'}
                          </h4>

                          <p style={{ color: theme.muted, margin: '4px 0', fontSize: '13px' }}>
                            👤 {payment.user?.name || 'Unknown User'} — {payment.user?.email || 'No Email'}
                          </p>

                          <p style={{ color: theme.muted, margin: '4px 0', fontSize: '13px' }}>
                            Amount: <strong style={{ color: theme.text }}>₹{payment.amount || payment.finalPrice || 0}</strong>
                          </p>

                          <p style={{ color: theme.muted, margin: '4px 0', fontSize: '13px' }}>
                            Status:{' '}
                            <strong
                              style={{
                                color:
                                  payment.status === 'approved'
                                    ? theme.success
                                    : payment.status === 'rejected'
                                    ? theme.danger
                                    : theme.warning,
                              }}
                            >
                              {payment.status}
                            </strong>
                          </p>

                          {payment.couponCode && (
                            <p style={{ color: theme.muted, margin: '4px 0', fontSize: '13px' }}>
                              Coupon: <strong style={{ color: theme.text }}>{payment.couponCode}</strong>
                            </p>
                          )}

                          {screenshot && (
                            <a
                              href={screenshot}
                              target="_blank"
                              rel="noreferrer"
                              style={{ color: theme.primary, fontWeight: 900, fontSize: '13px' }}
                            >
                              🧾 View Payment Screenshot
                            </a>
                          )}
                        </div>

                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
                          <button
                            onClick={() => approvePayment(payment._id)}
                            disabled={payment.status === 'approved'}
                            style={adminStyles.successBtn(theme)}
                          >
                            ✅ Approve
                          </button>

                          <button
                            onClick={() => rejectPayment(payment._id)}
                            disabled={payment.status === 'rejected'}
                            style={adminStyles.dangerBtn(theme)}
                          >
                            ❌ Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
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
              WebkitBackdropFilter: theme.glass,
            }}
          >
            <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
              <span
                style={{
                  padding: '4px 10px',
                  borderRadius: '20px',
                  fontSize: '11px',
                  fontWeight: '900',
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
                    fontWeight: '900',
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
                    fontWeight: '900',
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
                    fontWeight: '900',
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
                          fontWeight: '800',
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
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: '900',
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

        {activeTab === 'coupons' && renderCouponSection()}

        {activeTab === 'live' && (
          <div>
            <div style={panelStyle}>
              <h3 style={{ color: theme.text, marginTop: 0, marginBottom: '8px' }}>
                🔴 Create Live Class
              </h3>

              <p style={{ color: theme.muted, marginTop: 0, marginBottom: '22px' }}>
                Course select karo, live link aur schedule add karo.
              </p>

              <select
                style={inputStyle}
                value={liveForm.course}
                onChange={(e) => {
                  setLiveForm({ ...liveForm, course: e.target.value });
                  fetchLiveClasses(e.target.value);
                }}
              >
                <option value="">Select Course</option>
                {courses.map((course) => (
                  <option key={course._id} value={course._id}>
                    {course.title}
                  </option>
                ))}
              </select>

              <input
                style={inputStyle}
                placeholder="Live Class Title"
                value={liveForm.title}
                onChange={(e) => setLiveForm({ ...liveForm, title: e.target.value })}
              />

              <textarea
                style={{ ...inputStyle, minHeight: '85px', resize: 'vertical' }}
                placeholder="Description"
                value={liveForm.description}
                onChange={(e) => setLiveForm({ ...liveForm, description: e.target.value })}
              />

              <input
                style={inputStyle}
                placeholder="Live URL - YouTube/Meet/Zoom"
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
                  placeholder="Duration Minutes"
                  value={liveForm.durationMinutes}
                  onChange={(e) => setLiveForm({ ...liveForm, durationMinutes: e.target.value })}
                />
              </div>

              <button
                onClick={createLiveClass}
                style={{
                  padding: '13px 18px',
                  background: 'linear-gradient(135deg, #ef4444, #991b1b)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '14px',
                  cursor: 'pointer',
                  fontWeight: 950,
                  boxShadow: theme.shadow,
                }}
              >
                🔴 Create Live Class
              </button>
            </div>

            <h3 style={{ color: theme.text, marginBottom: '16px' }}>
              📡 Live Classes ({liveClasses.length})
            </h3>

            {liveClasses.length === 0 ? (
              <div style={{ ...smallCardStyle, color: theme.muted, fontWeight: 900 }}>
                Course select karo ya live class create karo.
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '14px' }}>
                {liveClasses.map((live) => (
                  <div key={live._id} style={smallCardStyle}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        gap: '14px',
                        flexWrap: 'wrap',
                      }}
                    >
                      <div>
                        <h4 style={{ color: theme.text, margin: '0 0 8px' }}>
                          🔴 {live.title}
                        </h4>

                        <p style={{ color: theme.muted, margin: '4px 0', fontSize: '13px' }}>
                          Status:{' '}
                          <strong style={{ color: theme.primary }}>
                            {getLiveStatus(live.scheduledAt, live.durationMinutes)}
                          </strong>
                        </p>

                        <p style={{ color: theme.muted, margin: '4px 0', fontSize: '13px' }}>
                          Schedule:{' '}
                          <strong style={{ color: theme.text }}>
                            {new Date(live.scheduledAt).toLocaleString('en-IN')}
                          </strong>
                        </p>

                        <a
                          href={live.liveUrl}
                          target="_blank"
                          rel="noreferrer"
                          style={{ color: theme.primary, fontWeight: 900, fontSize: '13px' }}
                        >
                          Open Live Link
                        </a>
                      </div>

                      <button
                        onClick={() => deleteLiveClass(live._id)}
                        style={adminStyles.dangerBtn(theme)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'notifications' && (
          <div style={panelStyle}>
            <AdminNotificationSender />
          </div>
        )}

        {activeTab === 'assistant' && renderAssistantLogsSection()}

        {(activeTab === 'security' || activeTab === 'activity') && (
          <div style={panelStyle}>
            <SecurityLogsPanel />
          </div>
        )}
      </div>
    </div>
  );
}

const adminStyles = {
  bgGrid: {
    position: 'fixed',
    inset: 0,
    backgroundImage:
      'linear-gradient(rgba(148,163,184,0.055) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.055) 1px, transparent 1px)',
    backgroundSize: '42px 42px',
    pointerEvents: 'none',
  },

  glowOne: {
    position: 'fixed',
    width: '360px',
    height: '360px',
    borderRadius: '999px',
    background: 'rgba(139,92,246,0.20)',
    filter: 'blur(90px)',
    top: '-80px',
    right: '-100px',
    pointerEvents: 'none',
  },

  glowTwo: {
    position: 'fixed',
    width: '360px',
    height: '360px',
    borderRadius: '999px',
    background: 'rgba(14,165,233,0.16)',
    filter: 'blur(90px)',
    bottom: '-100px',
    left: '-120px',
    pointerEvents: 'none',
  },

  blueBtn: (theme) => ({
    padding: '9px 14px',
    background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    fontWeight: '900',
    boxShadow: theme.shadow,
  }),

  successBtn: (theme) => ({
    padding: '9px 14px',
    background: 'linear-gradient(135deg, #22c55e, #15803d)',
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    fontWeight: '900',
    boxShadow: theme.shadow,
  }),

  warningBtn: (theme) => ({
    padding: '9px 14px',
    background: 'linear-gradient(135deg, #f59e0b, #d97706)',
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    fontWeight: '900',
    boxShadow: theme.shadow,
  }),

  dangerBtn: (theme) => ({
    padding: '9px 14px',
    background: 'linear-gradient(135deg, #ef4444, #991b1b)',
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    fontWeight: '900',
    boxShadow: theme.shadow,
  }),
};

export default AdminPanel;