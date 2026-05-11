import API from '../api';
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';
import Reviews from '../components/Reviews';
import CheckoutModal from '../components/CheckoutModal';
import Footer from '../components/Footer';
import { motion } from 'framer-motion';
import { createPortal } from 'react-dom';
import { Document, Page, pdfjs } from 'react-pdf';
import logActivity from '../utils/logActivity';
import LiveClassesBox from '../components/LiveClassesBox';

import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/legacy/build/pdf.worker.min.mjs`;

function SecurePDFViewer({ pdf, theme, courseTitle }) {
  const [numPages, setNumPages] = useState(null);
  const [pdfBlobUrl, setPdfBlobUrl] = useState(null);
  const [pdfError, setPdfError] = useState('');
  const [zoom, setZoom] = useState(1);
  const [isMobile, setIsMobile] = useState(false);
  const [viewerWidth, setViewerWidth] = useState(850);

  useEffect(() => {
    const updateSize = () => {
      const mobile = window.innerWidth <= 900;
      setIsMobile(mobile);

      // ✅ Real available PDF width
      if (mobile) {
        setViewerWidth(Math.max(260, window.innerWidth - 72));
      } else {
        setViewerWidth(Math.min(900, window.innerWidth - 160));
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);

    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const pageWidth = Math.round(viewerWidth * zoom);

  const zoomIn = () => {
    setZoom((prev) => {
      const next = Number((prev + 0.1).toFixed(1));
      return Math.min(next, 2.5);
    });
  };

  const zoomOut = () => {
    setZoom((prev) => {
      const next = Number((prev - 0.1).toFixed(1));
      return Math.max(next, 0.5);
    });
  };

  const resetZoom = () => {
    setZoom(1);
  };

  const fitWidth = () => {
    setZoom(1);
  };

  useEffect(() => {
    if (pdf?.title) {
      logActivity(
        `Opened PDF: ${pdf.title} | Course: ${courseTitle || 'Unknown Course'}`,
        'CourseDetail'
      );
    }
  }, [pdf?.title, courseTitle]);

  useEffect(() => {
    const loadPdf = async () => {
      try {
        setPdfError('');
        setPdfBlobUrl(null);
        setNumPages(null);
        setZoom(1);

        if (!pdf?.url) {
          setPdfError('PDF URL missing');
          return;
        }

        const res = await fetch(`${API}/api/pdf/view`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({ pdfUrl: pdf.url }),
        });

        if (!res.ok) {
          throw new Error(`PDF fetch failed: ${res.status}`);
        }

        const blob = await res.blob();
        const blobUrl = URL.createObjectURL(blob);
        setPdfBlobUrl(blobUrl);
      } catch (err) {
        console.log('PDF LOAD ERROR:', err);
        setPdfError('PDF load failed. URL/policy check karo.');
      }
    };

    loadPdf();

    return () => {
      setPdfBlobUrl((oldUrl) => {
        if (oldUrl) URL.revokeObjectURL(oldUrl);
        return null;
      });
    };
  }, [pdf?.url]);

  useEffect(() => {
    const blockKeys = (e) => {
      const key = e.key.toLowerCase();

      // ✅ Block save/print/source/copy + devtools
      if ((e.ctrlKey && ['s', 'p', 'u', 'c'].includes(key)) || key === 'f12') {
        e.preventDefault();

        logActivity(
          `Blocked shortcut attempt: CTRL + ${key.toUpperCase()} | PDF: ${
            pdf?.title || 'Unknown PDF'
          }`,
          'SecurePDFViewer'
        );
      }

      // ✅ Keyboard zoom support
      if (e.ctrlKey && (key === '+' || key === '=')) {
        e.preventDefault();
        zoomIn();
      }

      if (e.ctrlKey && key === '-') {
        e.preventDefault();
        zoomOut();
      }

      if (e.ctrlKey && key === '0') {
        e.preventDefault();
        resetZoom();
      }
    };

    window.addEventListener('keydown', blockKeys);
    return () => window.removeEventListener('keydown', blockKeys);
    // eslint-disable-next-line
  }, [pdf?.title]);

  const block = (e) => {
    e.preventDefault();

    logActivity(
      `Blocked right-click/copy attempt | PDF: ${pdf?.title || 'Unknown PDF'}`,
      'SecurePDFViewer'
    );
  };

  return (
    <div
      onContextMenu={block}
      onCopy={block}
      onCut={block}
      onDragStart={block}
      style={{
        position: 'relative',
        height: isMobile ? '540px' : '690px',
        overflowY: 'auto',
        overflowX: 'auto',
        borderRadius: isMobile ? '18px' : '22px',
        border: `1px solid ${theme.border}`,
        background: theme.isDark ? 'rgba(2,6,23,0.55)' : 'rgba(255,255,255,0.72)',
        padding: isMobile ? '10px' : '16px',
        userSelect: 'none',
        boxShadow: theme.shadow,
        width: '100%',
      }}
    >
      {/* ✅ Top Controls */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          background: theme.card,
          color: theme.text,
          padding: isMobile ? '10px' : '12px 14px',
          borderRadius: '16px',
          marginBottom: '14px',
          border: `1px solid ${theme.border}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: isMobile ? 'flex-start' : 'center',
          gap: '12px',
          flexWrap: 'wrap',
          backdropFilter: theme.glass,
          WebkitBackdropFilter: theme.glass,
        }}
      >
        <strong
          style={{
            fontSize: isMobile ? '13px' : '16px',
            lineHeight: 1.4,
            maxWidth: isMobile ? '100%' : '48%',
            overflowWrap: 'break-word',
          }}
        >
          📄 {pdf?.title || 'PDF'}
        </strong>

        <div style={styles.pdfControls}>
          <button
            type="button"
            onClick={zoomOut}
            disabled={zoom <= 0.5}
            style={{
              ...styles.pdfBtn,
              border: `1px solid ${theme.border}`,
              background: zoom <= 0.5 ? 'rgba(148,163,184,0.18)' : theme.bgSecondary,
              color: theme.text,
              cursor: zoom <= 0.5 ? 'not-allowed' : 'pointer',
            }}
          >
            −
          </button>

          <span style={{ ...styles.zoomText, color: theme.primary }}>
            {Math.round(zoom * 100)}%
          </span>

          <button
            type="button"
            onClick={zoomIn}
            disabled={zoom >= 2.5}
            style={{
              ...styles.pdfBtn,
              border: `1px solid ${theme.border}`,
              background: zoom >= 2.5 ? 'rgba(148,163,184,0.18)' : theme.bgSecondary,
              color: theme.text,
              cursor: zoom >= 2.5 ? 'not-allowed' : 'pointer',
            }}
          >
            +
          </button>

          <button
            type="button"
            onClick={fitWidth}
            style={{
              ...styles.fitBtn,
              background: theme.primary,
              color: theme.buttonText,
              cursor: 'pointer',
            }}
          >
            Fit Width
          </button>

          <span style={{ color: theme.muted, fontSize: '12px', fontWeight: 800 }}>
            View only • Protected
          </span>
        </div>
      </div>

      <div style={styles.pdfWatermark}>REHANVERSE • Protected Content</div>

      {pdfError ? (
        <p style={{ color: '#fca5a5', textAlign: 'center', fontWeight: 800 }}>
          {pdfError}
        </p>
      ) : !pdfBlobUrl ? (
        <p style={{ color: theme.muted, textAlign: 'center', fontWeight: 800 }}>
          Loading PDF...
        </p>
      ) : (
        <div
          style={{
            minWidth: `${pageWidth + 20}px`,
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <Document
            key={`${pdfBlobUrl}-${zoom}-${viewerWidth}`}
            file={pdfBlobUrl}
            onLoadSuccess={({ numPages }) => setNumPages(numPages)}
            loading={
              <p style={{ color: theme.muted, textAlign: 'center', fontWeight: 800 }}>
                Rendering PDF...
              </p>
            }
            error={
              <p style={{ color: '#fca5a5', textAlign: 'center', fontWeight: 800 }}>
                PDF render failed.
              </p>
            }
          >
            {Array.from(new Array(numPages || 0), (_, index) => (
              <div
                key={`${index}-${zoom}-${pageWidth}`}
                style={{
                  marginBottom: '18px',
                  display: 'flex',
                  justifyContent: 'center',
                  position: 'relative',
                  zIndex: 5,
                }}
              >
                <Page
                  pageNumber={index + 1}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                  width={pageWidth}
                  loading={
                    <p style={{ color: theme.muted, fontWeight: 800 }}>
                      Loading page {index + 1}...
                    </p>
                  }
                />
              </div>
            ))}
          </Document>
        </div>
      )}
    </div>
  );
}

function LockedCoursePreview({ course, theme, onUnlock, isMobile }) {
  const videosCount = course.videos?.length || 0;
  const pdfsCount = course.pdfs?.length || 0;

  const previewCards = [
    { icon: '🎥', count: videosCount, label: 'Video Lectures' },
    { icon: '📄', count: pdfsCount, label: 'Premium PDFs' },
    { icon: '🔴', count: 'Live', label: 'Class Access' },
    { icon: '✨', count: 'AI', label: 'Study Tools' },
  ];

  return (
    <div
      style={{
        padding: isMobile ? '16px' : '28px',
        borderRadius: isMobile ? '20px' : '24px',
        background: theme.isDark ? 'rgba(2,6,23,0.35)' : 'rgba(255,255,255,0.68)',
        border: `1px solid ${theme.border}`,
        width: '100%',
        overflow: 'hidden',
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: isMobile ? '22px' : '26px' }}>
        <div style={styles.lockedBadge}>🔥 Premium Locked Preview • Launch Access</div>

        <h2 style={{ ...styles.lockedTitle(isMobile), color: theme.text }}>
          🔒 Preview Locked — Full Course Waiting Inside
        </h2>

        <p style={{ ...styles.lockedText(isMobile), color: theme.muted }}>
          Tum abhi preview dekh rahe ho. Full access ke baad videos, premium PDFs,
          live classes, AI study tools aur complete unit-wise material unlock hoga — sab kuch ek jagah.
        </p>

        <div style={styles.lockedTags}>
          <span style={styles.greenTag}>✅ Saves Study Time</span>
          <span style={styles.blueTag}>📚 Organized Notes</span>
          <span style={styles.yellowTag}>⚡ Exam Focused</span>
        </div>
      </div>

      <div style={styles.previewGrid(isMobile)}>
        {previewCards.map((item, index) => (
          <motion.div
            key={index}
            whileHover={{ y: -3 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            style={{
              ...styles.previewCard(isMobile),
              background: theme.card,
              border: `1px solid ${theme.border}`,
              boxShadow: theme.shadow,
            }}
          >
            <div style={{ fontSize: isMobile ? '22px' : '26px', marginBottom: '8px' }}>{item.icon}</div>

            <h3 style={{ margin: 0, color: theme.primary, fontSize: isMobile ? '23px' : '28px' }}>
              {item.count}
            </h3>

            <p style={{ margin: '6px 0 0', color: theme.muted, fontWeight: 800, fontSize: '13px' }}>
              {item.label}
            </p>
          </motion.div>
        ))}
      </div>

      <div
        style={{
          ...styles.unlockBox(isMobile),
          background: theme.isDark
            ? 'linear-gradient(135deg, rgba(139,92,246,0.16), rgba(59,130,246,0.10))'
            : 'linear-gradient(135deg, rgba(237,233,254,0.85), rgba(219,234,254,0.85))',
          border: `1px solid ${theme.border}`,
        }}
      >
        <h3 style={{ marginTop: 0, color: theme.text }}>🚀 What You’ll Unlock</h3>

        <div style={{ ...styles.unlockGrid(isMobile), color: theme.textSecondary }}>
          <span>✅ Complete course content</span>
          <span>✅ Premium protected notes</span>
          <span>✅ Videos + PDFs in one place</span>
          <span>✅ Live class access</span>
          <span>✅ AI important questions</span>
          <span>✅ MCQ + expected questions</span>
          <span>✅ Structured unit-wise learning</span>
          <span>✅ Lifetime course access</span>
        </div>
      </div>

      <div
        style={{
          ...styles.aiLockedBox(isMobile),
          background: theme.isDark
            ? 'linear-gradient(135deg, rgba(139,92,246,0.18), rgba(14,165,233,0.10))'
            : 'linear-gradient(135deg, rgba(245,243,255,0.92), rgba(224,242,254,0.85))',
          border: `1px solid ${theme.border}`,
          boxShadow: theme.shadow,
        }}
      >
        <div>
          <p style={{ margin: '0 0 8px', color: theme.primary, fontWeight: 950, fontSize: '12px' }}>
            ✨ AI STUDY TOOLS LOCKED
          </p>
          <h3 style={{ margin: '0 0 8px', color: theme.text }}>
            AI Important Questions bhi course ke andar locked hain
          </h3>
          <p style={{ margin: 0, color: theme.muted, lineHeight: 1.65, fontWeight: 750 }}>
            Enrolled students ko notes/PDFs ke basis par AI-generated short questions,
            long questions, MCQs, AI summary aur flashcards milte hain — exam prep ke liye direct shortcut.
          </p>
        </div>

        <div style={styles.aiLockedPreviewGrid(isMobile)}>
          <span>🔒 Unit-wise Important Questions</span>
          <span>🔒 MCQ Practice Sets</span>
          <span>🔒 AI Summary</span>
          <span>🔒 Flashcards Revision</span>
        </div>
      </div>

      <div style={styles.compareGrid(isMobile)}>
        <div
          style={{
            ...styles.compareCard,
            background: theme.isDark ? 'rgba(239,68,68,0.10)' : 'rgba(254,226,226,0.8)',
            border: theme.isDark ? '1px solid rgba(239,68,68,0.25)' : '1px solid #fecaca',
          }}
        >
          <strong style={{ color: theme.text }}>❌ Without This Course</strong>
          <p style={{ ...styles.compareText, color: theme.muted }}>
            Random PDFs, incomplete topics, scattered YouTube videos, aur exam time confusion.
          </p>
        </div>

        <div
          style={{
            ...styles.compareCard,
            background: theme.isDark ? 'rgba(34,197,94,0.11)' : 'rgba(220,252,231,0.85)',
            border: theme.isDark ? '1px solid rgba(34,197,94,0.28)' : '1px solid #bbf7d0',
          }}
        >
          <strong style={{ color: theme.isDark ? '#86efac' : '#166534' }}>
            ✅ With REHANVERSE
          </strong>
          <p style={{ ...styles.compareText, color: theme.muted }}>
            Proper structure, premium PDFs, videos, live access, AI revision tools, aur clean dashboard me complete material.
          </p>
        </div>
      </div>

      <div style={styles.lockedListsGrid(isMobile)}>
        <LockedList title="🎥 Videos Preview" items={course.videos} type="video" theme={theme} />
        <LockedList title="📄 PDFs Preview" items={course.pdfs} type="pdf" theme={theme} />
      </div>

      <div style={styles.finalUnlock(isMobile)}>
        <div style={styles.launchBadge}>🔥 Launch Access • Limited Time</div>

        <h2 style={styles.finalUnlockTitle(isMobile)}>
          Stop searching random notes. Unlock everything in one place.
        </h2>

        <p style={styles.finalUnlockText(isMobile)}>
          Unit-wise PDFs, videos, live class access, AI important questions aur protected premium notes ek hi jagah
          milenge — clean, organized aur ready-to-study.
        </p>

        <div style={styles.lockedTags}>
          <span style={styles.greenTag}>✅ Less Confusion</span>
          <span style={styles.blueTag}>📚 Unit-wise Material</span>
          <span style={styles.yellowTag}>⚡ Start Prepared Today</span>
        </div>

        <motion.button
          whileHover={{ scale: 1.018, y: -1 }}
          whileTap={{ scale: 0.985 }}
          transition={{ duration: 0.16, ease: 'easeOut' }}
          onClick={onUnlock}
          style={styles.unlockBtn(isMobile)}
        >
          🚀 Unlock Full Course Now
        </motion.button>

        <div style={styles.unlockSmallText}>
          🔐 Videos, PDFs, AI study tools and live classes unlock only after enrollment/payment approval.
        </div>
      </div>
    </div>
  );
}

function LockedList({ title, items, type, theme }) {
  return (
    <div
      style={{
        ...styles.lockedList,
        background: theme.card,
        border: `1px solid ${theme.border}`,
      }}
    >
      <h3 style={{ marginTop: 0, color: theme.text }}>{title}</h3>

      {items?.length > 0 ? (
        items.map((item, i) => (
          <div
            key={i}
            style={{
              ...styles.lockedItem,
              background: theme.isDark ? 'rgba(255,255,255,0.035)' : 'rgba(255,255,255,0.72)',
              border: `1px solid ${theme.border}`,
              color: theme.text,
            }}
          >
            <span style={{ fontWeight: 800, minWidth: 0, overflowWrap: 'break-word' }}>
              🔒 {item.title || `${type === 'video' ? 'Video' : 'PDF'} ${i + 1}`}
            </span>

            <span style={styles.lockedSmall}>Locked</span>
          </div>
        ))
      ) : (
        <p style={{ color: theme.muted }}>No {type === 'video' ? 'videos' : 'PDFs'} listed.</p>
      )}
    </div>
  );
}

function StudyToolsBox({
  tools,
  loading,
  locked,
  theme,
  isMobile,
  onUnlock,
  toolType = 'important_questions',
}) {
  const [selectedTool, setSelectedTool] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [flippedCards, setFlippedCards] = useState({});
  const [activeFlashcardIndex, setActiveFlashcardIndex] = useState(0);

  const closeToolModal = () => {
    setSelectedTool(null);
    setQuizAnswers({});
    setFlippedCards({});
    setActiveFlashcardIndex(0);
  };

  const allTools = Array.isArray(tools) ? tools : [];

  const importantTools = allTools.filter((tool) => tool?.type === 'important_questions');
  const quizTools = allTools.filter((tool) => tool?.type === 'quiz');
  const summaryTools = allTools.filter((tool) => tool?.type === 'summary');
  const flashcardTools = allTools.filter((tool) => tool?.type === 'flashcards');

  const visibleTools =
    toolType === 'quiz'
      ? quizTools
      : toolType === 'summary'
      ? summaryTools
      : toolType === 'flashcards'
      ? flashcardTools
      : importantTools;

  const getToolTitle = (tool) => {
    const title = tool?.title || '';

    return (
      title
        .replace(/^Important Questions\s*-\s*/i, '')
        .replace(/^Quiz Practice\s*-\s*/i, '')
        .replace(/^AI Summary\s*-\s*/i, '')
        .replace(/^Flashcards\s*-\s*/i, '')
        .trim() || 'Study Tool'
    );
  };

  const getQuizQuestions = (tool) => {
    const content = tool?.content || {};
    return Array.isArray(content.quizQuestions)
      ? content.quizQuestions
      : Array.isArray(content.questions)
      ? content.questions
      : Array.isArray(content.mcqs)
      ? content.mcqs
      : [];
  };

  const getFlashcards = (tool) => {
    const content = tool?.content || {};
    return Array.isArray(content.flashcards)
      ? content.flashcards
      : Array.isArray(content.cards)
      ? content.cards
      : [];
  };

  const getTotalItems = (tool) => {
    const content = tool?.content || {};

    if (tool?.type === 'quiz') {
      return getQuizQuestions(tool).length;
    }

    if (tool?.type === 'summary') {
      return (
        (content.definitions?.length || 0) +
        (content.keyPoints?.length || 0) +
        (content.examAnswer?.length || 0) +
        (content.quickRevision?.length || 0) +
        (content.importantTerms?.length || 0)
      );
    }

    if (tool?.type === 'flashcards') {
      return getFlashcards(tool).length;
    }

    return (
      (content.shortQuestions?.length || 0) +
      (content.longQuestions?.length || 0) +
      (content.mcqs?.length || 0) +
      (content.mostExpectedQuestions?.length || 0)
    );
  };

  const getToolMeta = (type) => {
    if (type === 'quiz') {
      return {
        label: 'Quiz Practice',
        icon: '🧠',
        badge: '🧠 INTERACTIVE QUIZ • BONUS',
        heading: '🧠 Quiz Practice',
        desc: 'Practice interactive AI-generated quiz sets from uploaded course PDFs.',
        empty: 'Admin ne abhi quiz practice publish nahi kiya.',
        gradient: 'linear-gradient(135deg, #06b6d4, #2563eb)',
        shadow: '0 12px 28px rgba(6,182,212,0.25)',
      };
    }

    if (type === 'summary') {
      return {
        label: 'AI Summary',
        icon: '📝',
        badge: '📝 AI SUMMARY • BONUS',
        heading: '📝 AI Summary',
        desc: 'Read clean exam-focused summary, definitions, key points and last-minute revision from uploaded PDFs.',
        empty: 'Admin ne abhi AI summary publish nahi kiya.',
        gradient: 'linear-gradient(135deg, #22c55e, #0ea5e9)',
        shadow: '0 12px 28px rgba(34,197,94,0.22)',
      };
    }

    if (type === 'flashcards') {
      return {
        label: 'Flashcards',
        icon: '🃏',
        badge: '🃏 FLASHCARDS • BONUS',
        heading: '🃏 Flashcards',
        desc: 'Revise fast using flip-style AI flashcards generated from uploaded course PDFs.',
        empty: 'Admin ne abhi flashcards publish nahi kiye.',
        gradient: 'linear-gradient(135deg, #f97316, #ec4899)',
        shadow: '0 12px 28px rgba(249,115,22,0.25)',
      };
    }

    return {
      label: 'Important Questions',
      icon: '✨',
      badge: '✨ IMPORTANT QUESTIONS • BONUS',
      heading: '✨ Important Questions',
      desc: 'Revise using AI-generated important questions from uploaded course PDFs.',
      empty: 'Admin ne abhi important questions publish nahi kiye.',
      gradient: 'linear-gradient(135deg, #8b5cf6, #4f46e5)',
      shadow: '0 12px 28px rgba(139,92,246,0.28)',
    };
  };

  const getCorrectAnswerText = (item) => {
    const options = Array.isArray(item?.options) ? item.options : [];
    const raw = String(item?.correctAnswer || item?.answer || '').trim();

    if (!raw) return '';

    const letterMap = { A: 0, B: 1, C: 2, D: 3 };
    const possibleLetter = raw.replace('.', '').trim().toUpperCase();

    if (letterMap[possibleLetter] !== undefined && options[letterMap[possibleLetter]]) {
      return String(options[letterMap[possibleLetter]]).trim();
    }

    return raw;
  };

  const isSelectedCorrect = (item, selectedOption) => {
    const correct = getCorrectAnswerText(item).toLowerCase().trim();
    return String(selectedOption || '').toLowerCase().trim() === correct;
  };

  const resetQuiz = () => {
    setQuizAnswers({});
  };

  const renderQuestionList = (title, items, icon) => {
    const safeItems = Array.isArray(items) ? items : [];
    if (safeItems.length === 0) return null;

    return (
      <div
        style={{
          background: theme.isDark ? 'rgba(255,255,255,0.035)' : 'rgba(255,255,255,0.76)',
          border: `1px solid ${theme.border}`,
          borderRadius: '16px',
          padding: '14px',
          marginTop: '12px',
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
                background: theme.isDark ? 'rgba(15,23,42,0.52)' : '#ffffff',
              }}
            >
              <p style={{ color: theme.text, margin: '0 0 8px', fontWeight: 900, lineHeight: 1.55 }}>
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
          background: theme.isDark ? 'rgba(255,255,255,0.035)' : 'rgba(255,255,255,0.76)',
          border: `1px solid ${theme.border}`,
          borderRadius: '16px',
          padding: '14px',
          marginTop: '12px',
        }}
      >
        <h4 style={{ color: theme.text, margin: '0 0 12px', fontWeight: 950 }}>
          {icon} {title} ({safeItems.length})
        </h4>

        <div style={{ display: 'grid', gap: '9px' }}>
          {safeItems.map((text, index) => (
            <div
              key={index}
              style={{
                border: `1px solid ${theme.border}`,
                borderRadius: '13px',
                padding: '11px 12px',
                background: theme.isDark ? 'rgba(15,23,42,0.52)' : '#ffffff',
                color: theme.text,
                fontWeight: 800,
                lineHeight: 1.6,
              }}
            >
              <span style={{ color: theme.primary, fontWeight: 950 }}>{index + 1}.</span> {text}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderQuizContent = (tool) => {
    const questions = getQuizQuestions(tool);
    const answeredCount = Object.keys(quizAnswers).length;
    const score = questions.reduce((total, item, index) => {
      const selected = quizAnswers[index];
      return selected && isSelectedCorrect(item, selected) ? total + 1 : total;
    }, 0);

    if (questions.length === 0) {
      return (
        <div
          style={{
            marginTop: '14px',
            padding: '18px',
            borderRadius: '16px',
            border: `1px solid ${theme.border}`,
            background: theme.isDark ? 'rgba(251,191,36,0.10)' : '#fef3c7',
            color: theme.muted,
            fontWeight: 850,
            lineHeight: 1.6,
          }}
        >
          ⚠️ Is quiz draft mein questions nahi mile. AdminPanel se quiz dobara generate karo.
        </div>
      );
    }

    return (
      <div style={{ marginTop: '14px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            flexWrap: 'wrap',
            padding: '12px 14px',
            borderRadius: '16px',
            border: `1px solid ${theme.border}`,
            background: theme.isDark ? 'rgba(6,182,212,0.10)' : '#e0f2fe',
            marginBottom: '14px',
          }}
        >
          <div>
            <h4 style={{ color: theme.text, margin: 0, fontWeight: 950 }}>
              🧠 Interactive Quiz ({questions.length})
            </h4>
            <p style={{ color: theme.muted, margin: '6px 0 0', fontWeight: 800, fontSize: '13px' }}>
              Score: {score}/{questions.length} • Answered: {answeredCount}/{questions.length}
            </p>
          </div>

          <button
            onClick={resetQuiz}
            style={{
              padding: '10px 13px',
              borderRadius: '12px',
              border: `1px solid ${theme.border}`,
              background: theme.isDark ? 'rgba(255,255,255,0.06)' : '#fff',
              color: theme.text,
              cursor: 'pointer',
              fontWeight: 950,
            }}
          >
            Reset
          </button>
        </div>

        <div style={{ display: 'grid', gap: '12px' }}>
          {questions.map((item, index) => {
            const options = Array.isArray(item?.options) ? item.options.slice(0, 4) : [];
            const selected = quizAnswers[index];
            const correctText = getCorrectAnswerText(item);
            const answered = Boolean(selected);

            return (
              <div
                key={index}
                style={{
                  border: `1px solid ${theme.border}`,
                  borderRadius: '16px',
                  padding: '14px',
                  background: theme.isDark ? 'rgba(15,23,42,0.58)' : '#ffffff',
                }}
              >
                <p style={{ color: theme.text, margin: '0 0 12px', fontWeight: 950, lineHeight: 1.55 }}>
                  {index + 1}. {item?.question || 'Question missing'}
                </p>

                <div style={{ display: 'grid', gap: '8px' }}>
                  {options.map((option, optIndex) => {
                    const isSelected = selected === option;
                    const isCorrect = correctText && String(option).trim().toLowerCase() === correctText.toLowerCase().trim();

                    let optionBg = theme.isDark ? 'rgba(255,255,255,0.035)' : 'rgba(255,255,255,0.82)';
                    let optionBorder = theme.border;
                    let optionColor = theme.text;

                    if (answered && isCorrect) {
                      optionBg = theme.isDark ? 'rgba(34,197,94,0.16)' : '#dcfce7';
                      optionBorder = 'rgba(34,197,94,0.55)';
                      optionColor = theme.success;
                    } else if (answered && isSelected && !isCorrect) {
                      optionBg = theme.isDark ? 'rgba(239,68,68,0.14)' : '#fee2e2';
                      optionBorder = 'rgba(239,68,68,0.55)';
                      optionColor = '#ef4444';
                    } else if (isSelected) {
                      optionBg = theme.isDark ? 'rgba(59,130,246,0.14)' : '#dbeafe';
                      optionBorder = 'rgba(59,130,246,0.55)';
                    }

                    return (
                      <button
                        key={optIndex}
                        disabled={answered}
                        onClick={() => {
                          setQuizAnswers((prev) => ({
                            ...prev,
                            [index]: option,
                          }));
                        }}
                        style={{
                          width: '100%',
                          textAlign: 'left',
                          padding: '11px 12px',
                          borderRadius: '13px',
                          border: `1px solid ${optionBorder}`,
                          background: optionBg,
                          color: optionColor,
                          cursor: answered ? 'default' : 'pointer',
                          fontWeight: 850,
                          lineHeight: 1.45,
                        }}
                      >
                        {String.fromCharCode(65 + optIndex)}. {option}
                      </button>
                    );
                  })}
                </div>

                {answered && (
                  <div
                    style={{
                      marginTop: '12px',
                      padding: '12px',
                      borderRadius: '13px',
                      border: `1px solid ${isSelectedCorrect(item, selected) ? 'rgba(34,197,94,0.35)' : 'rgba(239,68,68,0.35)'}`,
                      background: isSelectedCorrect(item, selected)
                        ? theme.isDark
                          ? 'rgba(34,197,94,0.10)'
                          : '#dcfce7'
                        : theme.isDark
                        ? 'rgba(239,68,68,0.10)'
                        : '#fee2e2',
                    }}
                  >
                    <p
                      style={{
                        margin: '0 0 6px',
                        color: isSelectedCorrect(item, selected) ? theme.success : '#ef4444',
                        fontWeight: 950,
                      }}
                    >
                      {isSelectedCorrect(item, selected) ? '✅ Correct!' : '❌ Wrong'}
                    </p>

                    {!isSelectedCorrect(item, selected) && (
                      <p style={{ margin: '0 0 6px', color: theme.text, fontWeight: 850 }}>
                        Correct answer: {correctText || 'Not provided'}
                      </p>
                    )}

                    {item?.explanation && (
                      <p style={{ margin: 0, color: theme.muted, lineHeight: 1.55, fontWeight: 750 }}>
                        🧠 {item.explanation}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderSummaryContent = (tool) => {
    const content = tool?.content || {};

    return (
      <div style={{ marginTop: '14px' }}>
        {content.summary && (
          <div
            style={{
              padding: '16px',
              borderRadius: '18px',
              border: `1px solid ${theme.border}`,
              background: theme.isDark
                ? 'linear-gradient(135deg, rgba(34,197,94,0.12), rgba(14,165,233,0.08))'
                : 'linear-gradient(135deg, #dcfce7, #e0f2fe)',
              color: theme.text,
              fontWeight: 850,
              lineHeight: 1.75,
              marginBottom: '12px',
            }}
          >
            <h4 style={{ margin: '0 0 8px', color: theme.text, fontWeight: 950 }}>
              📝 Quick Summary
            </h4>
            <p style={{ margin: 0, color: theme.textSecondary || theme.muted }}>
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
  };

  const renderFlashcardsContent = (tool) => {
    const cards = getFlashcards(tool);
    const currentCard = cards[activeFlashcardIndex] || null;
    const isFlipped = flippedCards[activeFlashcardIndex];

    if (cards.length === 0) {
      return (
        <div
          style={{
            marginTop: '14px',
            padding: '18px',
            borderRadius: '16px',
            border: `1px solid ${theme.border}`,
            background: theme.isDark ? 'rgba(251,191,36,0.10)' : '#fef3c7',
            color: theme.muted,
            fontWeight: 850,
            lineHeight: 1.6,
          }}
        >
          ⚠️ Is flashcards draft mein cards nahi mile. AdminPanel se flashcards dobara generate karo.
        </div>
      );
    }

    return (
      <div style={{ marginTop: '14px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: '12px',
            flexWrap: 'wrap',
            alignItems: 'center',
            padding: '12px 14px',
            borderRadius: '16px',
            border: `1px solid ${theme.border}`,
            background: theme.isDark ? 'rgba(249,115,22,0.10)' : '#ffedd5',
            marginBottom: '14px',
          }}
        >
          <div>
            <h4 style={{ color: theme.text, margin: 0, fontWeight: 950 }}>
              🃏 Flashcard {activeFlashcardIndex + 1}/{cards.length}
            </h4>
            <p style={{ color: theme.muted, margin: '6px 0 0', fontWeight: 800, fontSize: '13px' }}>
              Click card to flip • Fast revision mode
            </p>
          </div>

          <button
            onClick={() => setFlippedCards({})}
            style={{
              padding: '10px 13px',
              borderRadius: '12px',
              border: `1px solid ${theme.border}`,
              background: theme.isDark ? 'rgba(255,255,255,0.06)' : '#fff',
              color: theme.text,
              cursor: 'pointer',
              fontWeight: 950,
            }}
          >
            Reset Flip
          </button>
        </div>

        <motion.div
          key={activeFlashcardIndex + '-' + Boolean(isFlipped)}
          initial={{ opacity: 0, rotateY: -10, y: 8 }}
          animate={{ opacity: 1, rotateY: 0, y: 0 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          onClick={() => {
            setFlippedCards((prev) => ({
              ...prev,
              [activeFlashcardIndex]: !prev[activeFlashcardIndex],
            }));
          }}
          style={{
            minHeight: isMobile ? '260px' : '320px',
            borderRadius: '24px',
            border: `1px solid ${theme.border}`,
            background: isFlipped
              ? theme.isDark
                ? 'linear-gradient(135deg, rgba(236,72,153,0.16), rgba(249,115,22,0.12))'
                : 'linear-gradient(135deg, #fce7f3, #ffedd5)'
              : theme.isDark
              ? 'linear-gradient(135deg, rgba(139,92,246,0.16), rgba(59,130,246,0.12))'
              : 'linear-gradient(135deg, #f5f3ff, #dbeafe)',
            boxShadow: theme.shadow,
            padding: isMobile ? '20px' : '30px',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            textAlign: 'center',
            userSelect: 'none',
          }}
        >
          <p
            style={{
              margin: '0 0 12px',
              color: isFlipped ? '#ec4899' : theme.primary,
              fontWeight: 950,
              fontSize: '12px',
              letterSpacing: '0.6px',
            }}
          >
            {isFlipped ? 'ANSWER / BACK SIDE' : 'QUESTION / FRONT SIDE'}
          </p>

          <h2
            style={{
              margin: 0,
              color: theme.text,
              fontWeight: 950,
              lineHeight: 1.35,
              fontSize: isMobile ? '22px' : '32px',
            }}
          >
            {isFlipped
              ? currentCard?.back || currentCard?.answer || 'Answer missing'
              : currentCard?.front || currentCard?.question || 'Question missing'}
          </h2>

          {isFlipped && currentCard?.hint && (
            <p
              style={{
                margin: '18px 0 0',
                color: theme.muted,
                fontWeight: 800,
                lineHeight: 1.6,
              }}
            >
              💡 Hint: {currentCard.hint}
            </p>
          )}

          {currentCard?.tag && (
            <span
              style={{
                display: 'inline-flex',
                margin: '18px auto 0',
                padding: '8px 12px',
                borderRadius: '999px',
                background: theme.isDark ? 'rgba(255,255,255,0.06)' : '#fff',
                color: theme.muted,
                border: `1px solid ${theme.border}`,
                fontSize: '12px',
                fontWeight: 950,
              }}
            >
              🏷️ {currentCard.tag}
            </span>
          )}
        </motion.div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: '10px',
            flexWrap: 'wrap',
            marginTop: '14px',
          }}
        >
          <button
            onClick={() => {
              setActiveFlashcardIndex((prev) => Math.max(0, prev - 1));
            }}
            disabled={activeFlashcardIndex === 0}
            style={{
              flex: 1,
              minWidth: '130px',
              padding: '12px 15px',
              borderRadius: '14px',
              border: `1px solid ${theme.border}`,
              background: activeFlashcardIndex === 0
                ? 'rgba(148,163,184,0.16)'
                : theme.isDark
                ? 'rgba(255,255,255,0.06)'
                : '#fff',
              color: theme.text,
              cursor: activeFlashcardIndex === 0 ? 'not-allowed' : 'pointer',
              fontWeight: 950,
            }}
          >
            ← Previous
          </button>

          <button
            onClick={() => {
              setFlippedCards((prev) => ({
                ...prev,
                [activeFlashcardIndex]: !prev[activeFlashcardIndex],
              }));
            }}
            style={{
              flex: 1,
              minWidth: '130px',
              padding: '12px 15px',
              borderRadius: '14px',
              border: 'none',
              background: 'linear-gradient(135deg, #f97316, #ec4899)',
              color: '#fff',
              cursor: 'pointer',
              fontWeight: 950,
              boxShadow: '0 12px 28px rgba(249,115,22,0.24)',
            }}
          >
            Flip Card
          </button>

          <button
            onClick={() => {
              setActiveFlashcardIndex((prev) => Math.min(cards.length - 1, prev + 1));
            }}
            disabled={activeFlashcardIndex === cards.length - 1}
            style={{
              flex: 1,
              minWidth: '130px',
              padding: '12px 15px',
              borderRadius: '14px',
              border: `1px solid ${theme.border}`,
              background: activeFlashcardIndex === cards.length - 1
                ? 'rgba(148,163,184,0.16)'
                : theme.isDark
                ? 'rgba(255,255,255,0.06)'
                : '#fff',
              color: theme.text,
              cursor: activeFlashcardIndex === cards.length - 1 ? 'not-allowed' : 'pointer',
              fontWeight: 950,
            }}
          >
            Next →
          </button>
        </div>
      </div>
    );
  };

  const renderToolContent = (tool) => {
    const content = tool?.content || {};

    if (tool?.type === 'quiz') {
      return renderQuizContent(tool);
    }

    if (tool?.type === 'summary') {
      return renderSummaryContent(tool);
    }

    if (tool?.type === 'flashcards') {
      return renderFlashcardsContent(tool);
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

  if (locked) {
    return (
      <div
        style={{
          ...styles.studyToolsCard(isMobile),
          background: theme.card,
          border: `1px solid ${theme.border}`,
          boxShadow: theme.shadow,
        }}
      >
        <p style={{ margin: '0 0 8px', color: theme.primary, fontWeight: 950, fontSize: '12px' }}>
          ✨ PREMIUM AI STUDY TOOLS
        </p>

        <h2 style={{ color: theme.text, margin: '0 0 10px', fontWeight: 950 }}>
          🔒 Study With AI Locked
        </h2>

        <p style={{ color: theme.muted, lineHeight: 1.75, fontWeight: 750, margin: '0 0 16px' }}>
          This course includes AI-generated important questions, quiz practice, AI summary and flashcards based on uploaded notes.
          Enroll to unlock smarter revision.
        </p>

        <div style={styles.aiFeatureGrid(isMobile)}>
          <span>🔒 Important Questions</span>
          <span>🔒 Quiz Practice</span>
          <span>🔒 AI Summary</span>
          <span>🔒 Flashcards</span>
        </div>

        <motion.button
          whileHover={{ scale: 1.018, y: -1 }}
          whileTap={{ scale: 0.985 }}
          transition={{ duration: 0.16, ease: 'easeOut' }}
          onClick={onUnlock}
          style={{ ...styles.unlockBtn(isMobile), marginTop: '18px' }}
        >
          🚀 Unlock Study AI
        </motion.button>
      </div>
    );
  }

  const meta = getToolMeta(toolType);

  const modalOverlay =
    selectedTool &&
    createPortal(
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 999999,
          background: 'rgba(2, 6, 23, 0.86)',
          backdropFilter: 'none',
          WebkitBackdropFilter: 'none',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: isMobile ? '12px' : '20px',
        }}
        onClick={closeToolModal}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 18 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 18 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          onClick={(e) => e.stopPropagation()}
          style={{
            width: isMobile ? 'calc(100vw - 20px)' : 'min(1180px, calc(100vw - 64px))',
            height: isMobile ? 'calc(100vh - 24px)' : 'min(92vh, 900px)',
            maxHeight: isMobile ? 'calc(100vh - 24px)' : '92vh',
            overflow: 'hidden',
            background: theme.card,
            border: `1px solid ${theme.border}`,
            borderRadius: isMobile ? '20px' : '26px',
            padding: isMobile ? '16px' : '28px',
            boxShadow: '0 20px 70px rgba(0,0,0,0.45)',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            willChange: 'transform',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: '12px',
              flexWrap: 'wrap',
              alignItems: 'flex-start',
              paddingBottom: '16px',
              marginBottom: '16px',
              borderBottom: `1px solid ${theme.border}`,
            }}
          >
            <div style={{ minWidth: 0 }}>
              <p style={{ margin: '0 0 7px', color: theme.primary, fontWeight: 950, fontSize: '12px' }}>
                {getToolMeta(selectedTool?.type).badge}
              </p>

              <h2 style={{ margin: 0, color: theme.text, fontWeight: 950, lineHeight: 1.25 }}>
                {getToolTitle(selectedTool)}
              </h2>

              <p style={{ margin: '8px 0 0', color: theme.muted, fontWeight: 750, fontSize: '13px' }}>
                {getTotalItems(selectedTool)} items • Source: {selectedTool.sourcePdf?.title || 'Course PDFs'}
              </p>
            </div>

            <button
              onClick={closeToolModal}
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '14px',
                border: `1px solid ${theme.border}`,
                background: theme.isDark ? 'rgba(255,255,255,0.06)' : '#fff',
                color: theme.text,
                cursor: 'pointer',
                fontSize: '22px',
                fontWeight: 950,
              }}
            >
              ×
            </button>
          </div>

          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              overflowX: 'hidden',
              paddingRight: isMobile ? '2px' : '10px',
              overscrollBehavior: 'contain',
              WebkitOverflowScrolling: 'touch',
              scrollbarGutter: 'stable',
            }}
          >
            {renderToolContent(selectedTool)}
          </div>
        </motion.div>
      </div>,
      document.body
    );

  return (
    <>
      <div
        style={{
          ...styles.studyToolsCard(isMobile),
          background: theme.card,
          border: `1px solid ${theme.border}`,
          boxShadow: theme.shadow,
        }}
      >
        <div>
          <p style={{ margin: '0 0 8px', color: theme.primary, fontWeight: 950, fontSize: '12px' }}>
            ✨ STUDY AI BONUS
          </p>

          <h2 style={{ color: theme.text, margin: 0, fontWeight: 950 }}>
            {meta.heading}
          </h2>

          <p style={{ color: theme.muted, margin: '8px 0 0', lineHeight: 1.65, fontWeight: 750 }}>
            {meta.desc}
          </p>

          <span
            style={{
              display: 'inline-flex',
              marginTop: '14px',
              padding: '8px 12px',
              borderRadius: '999px',
              background: theme.isDark ? 'rgba(34,197,94,0.13)' : '#dcfce7',
              color: theme.success,
              border: `1px solid ${theme.border}`,
              fontSize: '12px',
              fontWeight: 950,
            }}
          >
            {visibleTools.length} Published
          </span>
        </div>

        {loading ? (
          <p style={{ color: theme.muted, fontWeight: 900, marginTop: '16px' }}>
            ⏳ Loading AI study tools...
          </p>
        ) : visibleTools.length === 0 ? (
          <div
            style={{
              marginTop: '16px',
              padding: '14px',
              borderRadius: '16px',
              background: theme.isDark ? 'rgba(251,191,36,0.10)' : '#fef3c7',
              border: `1px solid ${theme.border}`,
              color: theme.muted,
              fontWeight: 800,
              lineHeight: 1.6,
            }}
          >
            ⚠️ {meta.empty} Publish hote hi yahan dikhega.
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '12px', marginTop: '18px' }}>
            {visibleTools.map((tool) => {
              const cardMeta = getToolMeta(tool?.type);

              return (
                <motion.div
                  key={tool._id}
                  whileHover={{ y: -2 }}
                  transition={{ duration: 0.16, ease: 'easeOut' }}
                  style={{
                    border: `1px solid ${theme.border}`,
                    borderRadius: '18px',
                    padding: '14px',
                    background: theme.isDark ? 'rgba(255,255,255,0.035)' : 'rgba(255,255,255,0.72)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: '12px',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <h3 style={{ color: theme.text, margin: '0 0 6px', fontWeight: 950 }}>
                      {cardMeta.icon} {cardMeta.label} - {getToolTitle(tool)}
                    </h3>

                    <p style={{ color: theme.muted, margin: 0, fontSize: '13px', fontWeight: 750 }}>
                      {getTotalItems(tool)} items • Source: {tool.sourcePdf?.title || 'Course PDFs'}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setQuizAnswers({});
                      setFlippedCards({});
                      setActiveFlashcardIndex(0);
                      setSelectedTool(tool);
                    }}
                    style={{
                      padding: '12px 18px',
                      borderRadius: '15px',
                      border: 'none',
                      background: cardMeta.gradient,
                      color: '#fff',
                      cursor: 'pointer',
                      fontWeight: 950,
                      boxShadow: cardMeta.shadow,
                    }}
                  >
                    Open
                  </button>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {modalOverlay}
    </>
  );
}
function CourseDetail() {
  const { id } = useParams();
  const theme = useTheme();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const [course, setCourse] = useState(null);
  const [activeTab, setActiveTab] = useState('videos');
  const [activeStudyToolType, setActiveStudyToolType] = useState('important_questions');
  const [activeVideo, setActiveVideo] = useState(null);
  const [activePdf, setActivePdf] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [lockedMsg, setLockedMsg] = useState('');
  const [doneMsg, setDoneMsg] = useState('');
  const [loadingFreeEnroll, setLoadingFreeEnroll] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [studyTools, setStudyTools] = useState([]);
  const [studyToolsLoading, setStudyToolsLoading] = useState(false);

  const [certificateLoading, setCertificateLoading] = useState(false);
  const [certificateMsg, setCertificateMsg] = useState('');
  const [generatedCertificate, setGeneratedCertificate] = useState(null);

  const [courseProgress, setCourseProgress] = useState({
    progressPercent: 0,
    completedVideoUrls: [],
    completedPdfUrls: [],
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
    if (!token || !course?._id) return;

    const canAccessStudyTools =
      isEnrolled || course.isFree || Number(course.price || 0) === 0;

    if (!canAccessStudyTools) {
      setStudyTools([]);
      return;
    }

    fetchPublishedStudyTools();
    // eslint-disable-next-line
  }, [token, id, course?._id, isEnrolled]);

  const fetchPublishedStudyTools = async () => {
    try {
      if (!token || !id) return;

      setStudyToolsLoading(true);

      const res = await axios.get(`${API}/api/study-tools/course/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setStudyTools(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.log('FETCH STUDY TOOLS ERROR:', err.response?.data || err.message);
      setStudyTools([]);
    } finally {
      setStudyToolsLoading(false);
    }
  };

  const fetchCourseProgress = async () => {
    try {
      if (!token || !id) return;

      const res = await axios.get(`${API}/api/progress/course/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setCourseProgress({
        progressPercent: res.data.progressPercent || 0,
        completedVideoUrls: res.data.completedVideoUrls || [],
        completedPdfUrls: res.data.completedPdfUrls || [],
      });
    } catch (err) {
      console.log('FETCH COURSE PROGRESS ERROR:', err.response?.data || err.message);
    }
  };

  const trackProgress = async ({ type, title, url, action = 'open' }) => {
    try {
      if (!token || !id || !type) return;

      const res = await axios.post(
        `${API}/api/progress/track`,
        {
          courseId: id,
          type,
          title: title || '',
          url: url || '',
          action,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (action === 'complete') {
        setDoneMsg(`✅ ${title || 'Content'} marked as done!`);
        setTimeout(() => setDoneMsg(''), 2500);
        await fetchCourseProgress();
      }

      return res.data;
    } catch (err) {
      console.log('PROGRESS TRACK ERROR:', err.response?.data || err.message);

      if (action === 'complete') {
        setDoneMsg('⚠️ Unable to mark as done. Try again.');
        setTimeout(() => setDoneMsg(''), 2500);
      }
    }
  };

  const isVideoDone = (video) => {
    if (!video?.url) return false;
    return courseProgress.completedVideoUrls?.includes(video.url);
  };

  const isPdfDone = (pdf) => {
    if (!pdf?.url) return false;
    return courseProgress.completedPdfUrls?.includes(pdf.url);
  };

  const markActiveVideoDone = async () => {
    if (!activeVideo || isVideoDone(activeVideo)) return;

    await trackProgress({
      type: 'video',
      title: activeVideo?.title || 'Video',
      url: activeVideo?.url || '',
      action: 'complete',
    });
  };

  const markActivePdfDone = async () => {
    if (!activePdf || isPdfDone(activePdf)) return;

    await trackProgress({
      type: 'pdf',
      title: activePdf?.title || 'PDF',
      url: activePdf?.url || '',
      action: 'complete',
    });
  };

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const courseRes = await axios.get(`${API}/api/courses/${id}`);
        setCourse(courseRes.data);

        logActivity(
          `Opened Course Detail Page | Course: ${courseRes.data.title}`,
          'CourseDetail'
        );

        if (courseRes.data.videos?.length > 0) {
          setActiveVideo(courseRes.data.videos[0]);

          logActivity(
            `Auto loaded first video: ${courseRes.data.videos[0].title} | Course: ${courseRes.data.title}`,
            'CourseDetail'
          );
        }

        if (courseRes.data.pdfs?.length > 0) {
          setActivePdf(courseRes.data.pdfs[0]);
        }

        const enrolledRes = await axios.get(`${API}/api/enroll/my/courses`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const enrolled = enrolledRes.data.some(
          (c) => c._id?.toString() === id.toString()
        );

        setIsEnrolled(enrolled);

        if (enrolled) {
          await fetchCourseProgress();

          if (courseRes.data.videos?.length > 0) {
            await trackProgress({
              type: 'video',
              title: courseRes.data.videos[0].title,
              url: courseRes.data.videos[0].url,
              action: 'open',
            });
          }
        }

        logActivity(
          enrolled
            ? `Enrollment check: User is enrolled | Course: ${courseRes.data.title}`
            : `Enrollment check: User is not enrolled | Course: ${courseRes.data.title}`,
          'CourseDetail'
        );
      } catch (err) {
        console.log('Course detail error:', err.response?.data || err.message);

        logActivity(
          `Course detail error | Course ID: ${id}`,
          'CourseDetail'
        );

        setLockedMsg('⚠️ Course load issue. Please refresh once.');
        setTimeout(() => setLockedMsg(''), 4000);
      }
    };

    fetchData();
    // eslint-disable-next-line
  }, [id, token, navigate]);

  const getEmbedUrl = (url) => {
    if (!url) return null;

    // ✅ Regex literal line-break issue avoid karne ke liye RegExp constructor use kiya hai
    const ytMatch = url.match(new RegExp('(?:youtube\.com/watch\?v=|youtu\.be/)([^&\n?#]+)'));
    if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;

    const driveMatch = url.match(new RegExp('drive\.google\.com/file/d/([^/]+)'));
    if (driveMatch) {
      return `https://drive.google.com/file/d/${driveMatch[1]}/preview`;
    }

    return url;
  };

  const isFreeCourse = course
    ? course.isFree || Number(course.price || 0) === 0
    : false;

  const locked = course ? Number(course.price || 0) > 0 && !isEnrolled : false;

  const openCheckout = (source = 'CourseDetail') => {
    logActivity(
      `Opened checkout modal from ${source} | Course: ${
        course?.title || 'Unknown Course'
      }`,
      'CourseDetail'
    );

    setShowCheckout(true);
  };

  const handleFreeEnroll = async () => {
    if (!course || loadingFreeEnroll) return;

    try {
      setLoadingFreeEnroll(true);

      const res = await axios.post(
        `${API}/api/enroll/${course._id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      logActivity(
        `Free course enrolled successfully: ${course.title}`,
        'CourseDetail'
      );

      setIsEnrolled(true);

      await fetchCourseProgress();

      if (course.videos?.length > 0) {
        await trackProgress({
          type: 'video',
          title: course.videos[0].title,
          url: course.videos[0].url,
          action: 'open',
        });
      }

      setLockedMsg(`✅ ${res.data.message || 'Course enrolled successfully'}`);
      setTimeout(() => setLockedMsg(''), 3000);
    } catch (err) {
      setLockedMsg('⚠️ ' + (err.response?.data?.message || 'Enrollment failed'));
      setTimeout(() => setLockedMsg(''), 3000);
    } finally {
      setLoadingFreeEnroll(false);
    }
  };

  const showLockedMessage = (contentTitle = 'content') => {
    setLockedMsg(`🔒 ${contentTitle} Would be available after enrollment.`);

    logActivity(
      `Locked content clicked: ${contentTitle} | Course: ${
        course?.title || 'Unknown Course'
      }`,
      'CourseDetail'
    );

    setTimeout(() => setLockedMsg(''), 3000);
  };

  const handleVideoClick = async (video) => {
    if (locked) {
      showLockedMessage(video?.title || 'Video');
      return;
    }

    setActiveVideo(video);

    await trackProgress({
      type: 'video',
      title: video?.title || 'Video',
      url: video?.url || '',
      action: 'open',
    });

    logActivity(
      `Clicked video: ${video.title} | Course: ${
        course?.title || 'Unknown Course'
      }`,
      'CourseDetail'
    );
  };

  const handlePdfClick = async (pdf) => {
    if (locked) {
      showLockedMessage(pdf?.title || 'PDF');
      return;
    }

    setActivePdf(pdf);

    await trackProgress({
      type: 'pdf',
      title: pdf?.title || 'PDF',
      url: pdf?.url || '',
      action: 'open',
    });

    logActivity(
      `Clicked PDF: ${pdf.title} | Course: ${
        course?.title || 'Unknown Course'
      }`,
      'CourseDetail'
    );
  };

  const handleTabChange = async (tab) => {
    setActiveTab(tab);

    if (tab === 'pdfs' && activePdf && !locked) {
      await trackProgress({
        type: 'pdf',
        title: activePdf.title || 'PDF',
        url: activePdf.url || '',
        action: 'open',
      });
    }

    if (tab === 'videos' && activeVideo && !locked) {
      await trackProgress({
        type: 'video',
        title: activeVideo.title || 'Video',
        url: activeVideo.url || '',
        action: 'open',
      });
    }

    logActivity(
      `Switched tab to: ${tab} | Course: ${
        course?.title || 'Unknown Course'
      }`,
      'CourseDetail'
    );
  };

  const handleGenerateCertificate = async () => {
    if (!course?._id || certificateLoading) return;

    if (!token) {
      setCertificateMsg('?? Please login again.');
      setTimeout(() => setCertificateMsg(''), 3000);
      return;
    }

    if (!isEnrolled && !isFreeCourse) {
      setCertificateMsg('?? Certificate ke liye pehle course enroll karo.');
      setTimeout(() => setCertificateMsg(''), 3500);
      return;
    }

    if ((courseProgress.progressPercent || 0) < 100) {
      setCertificateMsg('?? Certificate unlock karne ke liye course 100% complete karo.');
      setTimeout(() => setCertificateMsg(''), 4000);
      return;
    }

    try {
      setCertificateLoading(true);
      setCertificateMsg('');

      const res = await axios.post(
        `${API}/api/courses/${course._id}/complete`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setGeneratedCertificate(res.data.certificate || null);

      setCertificateMsg(
        res.data?.alreadyCompleted
          ? 'Certificate already generated! Profile mein check karo.'
          : 'Course completed! Certificate generated successfully.'
      );

      logActivity(
        `Certificate generated | Course: ${course?.title || 'Unknown Course'}`,
        'CourseDetail'
      );

      setTimeout(() => setCertificateMsg(''), 5000);
    } catch (err) {
      console.log('CERTIFICATE GENERATE ERROR:', err.response?.data || err.message);

      setCertificateMsg(
        '?? ' + (err.response?.data?.message || 'Certificate generate nahi ho paya.')
      );

      setTimeout(() => setCertificateMsg(''), 4500);
    } finally {
      setCertificateLoading(false);
    }
  };

  const handleCheckoutSuccess = () => {
    logActivity(
      `Checkout success | Redirecting to My Courses | Course: ${
        course?.title || 'Unknown Course'
      }`,
      'CourseDetail'
    );

    setShowCheckout(false);
    window.location.href = '/my-courses';
  };

  if (!course) {
    return (
      <div
        style={{
          background: theme.bg,
          minHeight: '100vh',
          color: theme.text,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <p style={{ color: theme.muted, fontSize: '18px', fontWeight: 900 }}>
          ⏳ Loading course...
        </p>
      </div>
    );
  }

  const totalVideos = course.videos?.length || 0;
  const totalPdfs = course.pdfs?.length || 0;

  const CertificateBox = () => {
    const progress = courseProgress.progressPercent || 0;
    const canGenerate = (isEnrolled || isFreeCourse) && progress >= 100;

    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        style={{
          ...styles.certificateBox(isMobile),
          background: theme.isDark
            ? 'linear-gradient(135deg, rgba(139,92,246,0.16), rgba(14,165,233,0.10))'
            : 'linear-gradient(135deg, rgba(245,243,255,0.96), rgba(224,242,254,0.88))',
          border: `1px solid ${theme.border}`,
          boxShadow: theme.shadow,
        }}
      >
        <div style={styles.certificateBoxTop(isMobile)}>
          <div>
            <p style={{ margin: '0 0 7px', color: theme.primary, fontWeight: 950, fontSize: '12px' }}>
              REHANVERSE CERTIFICATE
            </p>

            <h2 style={{ margin: 0, color: theme.text, fontWeight: 950, lineHeight: 1.25 }}>
              Complete course and unlock your certificate
            </h2>

            <p style={{ margin: '9px 0 0', color: theme.muted, fontWeight: 750, lineHeight: 1.65 }}>
              Course 100% complete hone ke baad certificate auto-generate hoga aur Profile page mein save ho jayega.
            </p>
          </div>

          <div style={styles.certificateSeal}>RV</div>
        </div>

        <div
          style={{
            ...styles.certificateProgressWrap,
            background: theme.isDark ? 'rgba(255,255,255,0.045)' : 'rgba(255,255,255,0.78)',
            border: `1px solid ${theme.border}`,
          }}
        >
          <div style={styles.certificateProgressHead}>
            <span style={{ color: theme.text, fontWeight: 950 }}>Progress</span>
            <span style={{ color: theme.primary, fontWeight: 950 }}>{progress}%</span>
          </div>

          <div
            style={{
              ...styles.certificateProgressBar,
              background: theme.isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.10)',
            }}
          >
            <div
              style={{
                width: `${Math.min(100, progress)}%`,
                height: '100%',
                borderRadius: '999px',
                background:
                  progress >= 100
                    ? 'linear-gradient(90deg, #22c55e, #06b6d4)'
                    : `linear-gradient(90deg, ${theme.primary}, ${theme.accent || '#06b6d4'})`,
                transition: 'width 0.3s ease',
              }}
            />
          </div>
        </div>

        {certificateMsg && (
          <div
            style={{
              ...styles.certificateMsg,
              background:
                certificateMsg.includes('??') || certificateMsg.includes('already')
                  ? theme.isDark
                    ? 'rgba(34,197,94,0.12)'
                    : '#dcfce7'
                  : theme.isDark
                  ? 'rgba(251,191,36,0.12)'
                  : '#fef3c7',
              color:
                certificateMsg.includes('??') || certificateMsg.includes('already')
                  ? theme.success
                  : '#f59e0b',
              border: `1px solid ${theme.border}`,
            }}
          >
            {certificateMsg}
          </div>
        )}

        {generatedCertificate?.certificateId && (
          <div
            style={{
              ...styles.generatedCertBox,
              background: theme.isDark ? 'rgba(255,255,255,0.045)' : 'rgba(255,255,255,0.78)',
              border: `1px solid ${theme.border}`,
            }}
          >
            <p style={{ margin: '0 0 6px', color: theme.muted, fontWeight: 850 }}>
              Certificate ID
            </p>

            <strong style={{ color: theme.primary, wordBreak: 'break-word' }}>
              {generatedCertificate.certificateId}
            </strong>

            <div style={{ marginTop: '12px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button
                onClick={() => navigate('/profile')}
                style={{
                  ...styles.certificateSmallBtn,
                  background: theme.primary,
                  color: theme.buttonText,
                  border: 'none',
                }}
              >
                View in Profile
              </button>

              <button
                onClick={() =>
                  navigate(`/certificate/${generatedCertificate.certificateId}`)
                }
                style={{
                  ...styles.certificateSmallBtn,
                  background: 'transparent',
                  color: theme.primary,
                  border: `1px solid ${theme.border}`,
                }}
              >
                Verify
              </button>
            </div>
          </div>
        )}

        <motion.button
          whileHover={{
            scale: certificateLoading ? 1 : 1.018,
            y: certificateLoading ? 0 : -1,
          }}
          whileTap={{ scale: certificateLoading ? 1 : 0.985 }}
          transition={{ duration: 0.16, ease: 'easeOut' }}
          onClick={handleGenerateCertificate}
          disabled={certificateLoading || !canGenerate}
          style={{
            ...styles.generateCertificateBtn(isMobile),
            background:
              certificateLoading || !canGenerate
                ? theme.muted
                : 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
            color: '#fff',
            cursor: certificateLoading || !canGenerate ? 'not-allowed' : 'pointer',
            opacity: certificateLoading || !canGenerate ? 0.72 : 1,
          }}
        >
          {certificateLoading
            ? 'Generating Certificate...'
            : progress >= 100
            ? 'Generate Certificate'
            : 'Complete 100% to Unlock Certificate'}
        </motion.button>
      </motion.div>
    );
  };

  const CourseContentPanel = () => (
  <aside
    style={{
      ...styles.sidebar(isMobile),
      background: theme.card,
      border: `1px solid ${theme.border}`,
      boxShadow: theme.shadow,
      backdropFilter: theme.glass,
      WebkitBackdropFilter: theme.glass,
    }}
  >
    <h3 style={{ marginTop: 0, marginBottom: '16px', color: theme.text }}>
      Course Content
    </h3>

    {isEnrolled && (
      <div
        style={{
          ...styles.previewOnlyBox,
          background: theme.isDark ? 'rgba(34,197,94,0.10)' : '#dcfce7',
          border: `1px solid ${theme.border}`,
          color: theme.textSecondary,
        }}
      >
        📈 Real progress: {courseProgress.progressPercent || 0}% complete.
        Open = streak, Mark Done = progress.
      </div>
    )}

    {locked && (
      <div
        style={{
          ...styles.previewOnlyBox,
          background:
            'linear-gradient(135deg, rgba(251,191,36,0.14), rgba(239,68,68,0.10))',
          border: '1px solid rgba(251,191,36,0.30)',
          color: theme.muted,
        }}
      >
        🔒 Preview only. Would be available after enrollment.
      </div>
    )}

    <div style={styles.tabRow}>
      <button
        onClick={() => handleTabChange('videos')}
        style={{
          ...styles.tabBtn,
          background: activeTab === 'videos' ? theme.primary : theme.bgSecondary,
          color: activeTab === 'videos' ? '#fff' : theme.text,
          border: `1px solid ${theme.border}`,
        }}
      >
        Videos
      </button>

      <button
        onClick={() => handleTabChange('pdfs')}
        style={{
          ...styles.tabBtn,
          background: activeTab === 'pdfs' ? theme.primary : theme.bgSecondary,
          color: activeTab === 'pdfs' ? '#fff' : theme.text,
          border: `1px solid ${theme.border}`,
        }}
      >
        PDFs
      </button>

      <button
        onClick={() => handleTabChange('study-ai')}
        style={{
          ...styles.tabBtn,
          background:
            activeTab === 'study-ai'
              ? 'linear-gradient(135deg, #8b5cf6, #06b6d4)'
              : theme.bgSecondary,
          color: activeTab === 'study-ai' ? '#fff' : theme.text,
          border: `1px solid ${
            activeTab === 'study-ai' ? 'rgba(139,92,246,0.55)' : theme.border
          }`,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        ✨ Study AI
        <span
          style={{
            marginLeft: '6px',
            padding: '2px 6px',
            borderRadius: '999px',
            background:
              activeTab === 'study-ai'
                ? 'rgba(255,255,255,0.20)'
                : 'rgba(34,197,94,0.14)',
            color: activeTab === 'study-ai' ? '#fff' : theme.success,
            fontSize: '9px',
            fontWeight: 950,
            verticalAlign: 'middle',
          }}
        >
          BONUS
        </span>
      </button>
    </div>

    {activeTab === 'videos' && (
      <ContentList
        items={course.videos}
        type="video"
        locked={locked}
        activeTitle={activeVideo?.title}
        onClick={handleVideoClick}
        theme={theme}
        completedUrls={courseProgress.completedVideoUrls}
      />
    )}

    {activeTab === 'pdfs' && (
      <ContentList
        items={course.pdfs}
        type="pdf"
        locked={locked}
        activeTitle={activePdf?.title}
        onClick={handlePdfClick}
        theme={theme}
        completedUrls={courseProgress.completedPdfUrls}
      />
    )}

    {activeTab === 'study-ai' && (
  <div style={{ display: 'grid', gap: '10px' }}>
    {[
      {
        key: 'important_questions',
        label: '✨ Important Questions',
        count: studyTools.filter((tool) => tool?.type === 'important_questions').length,
        activeBorder: 'rgba(139,92,246,0.65)',
        gradient: 'linear-gradient(135deg, #8b5cf6, #4f46e5)',
      },
      {
        key: 'quiz',
        label: '🧠 Quiz Practice',
        count: studyTools.filter((tool) => tool?.type === 'quiz').length,
        activeBorder: 'rgba(6,182,212,0.65)',
        gradient: 'linear-gradient(135deg, #06b6d4, #2563eb)',
      },
      {
        key: 'summary',
        label: '📝 AI Summary',
        count: studyTools.filter((tool) => tool?.type === 'summary').length,
        activeBorder: 'rgba(34,197,94,0.65)',
        gradient: 'linear-gradient(135deg, #22c55e, #0ea5e9)',
      },
      {
        key: 'flashcards',
        label: '🃏 Flashcards',
        count: studyTools.filter((tool) => tool?.type === 'flashcards').length,
        activeBorder: 'rgba(249,115,22,0.65)',
        gradient: 'linear-gradient(135deg, #f97316, #ec4899)',
      },
    ].map((item) => {
      const active = activeStudyToolType === item.key;

      return (
        <button
          key={item.key}
          onClick={() => {
            setActiveStudyToolType(item.key);
            setActiveTab('study-ai');
          }}
          style={{
            width: '100%',
            padding: '13px 14px',
            borderRadius: '16px',
            border: `1px solid ${active ? item.activeBorder : theme.border}`,
            background: active
              ? item.gradient
              : theme.isDark
              ? 'rgba(255,255,255,0.035)'
              : 'rgba(255,255,255,0.72)',
            color: active ? '#fff' : theme.text,
            cursor: 'pointer',
            fontWeight: 950,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <span>{item.label}</span>

          <span
            style={{
              padding: '4px 9px',
              borderRadius: '999px',
              background: active ? 'rgba(255,255,255,0.18)' : 'rgba(148,163,184,0.14)',
              color: active ? '#fff' : theme.muted,
              fontSize: '12px',
              fontWeight: 950,
            }}
          >
            {item.count}
          </span>
        </button>
      );
    })}
  </div>
)}

    {locked && (
      <motion.button
        whileHover={{ scale: 1.018, y: -1 }}
        whileTap={{ scale: 0.985 }}
        transition={{ duration: 0.16, ease: 'easeOut' }}
        onClick={() => openCheckout('sidebar locked preview')}
        style={{
          ...styles.sidebarUnlockBtn,
          background: 'linear-gradient(135deg, #22c55e, #3b82f6)',
        }}
      >
         Unlock Course Now
      </motion.button>
    )}
  </aside>
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

      <main style={styles.page(isMobile)}>
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
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
            <button
              onClick={() => {
                logActivity(
                  `Clicked back button from course: ${course.title}`,
                  'CourseDetail'
                );
                navigate(isEnrolled ? '/my-courses' : '/courses');
              }}
              style={{
                ...styles.backBtn,
                border: `1px solid ${theme.border}`,
                background: theme.isDark ? 'rgba(255,255,255,0.035)' : 'rgba(255,255,255,0.78)',
                color: theme.text,
              }}
            >
              ← Back
            </button>

            <div style={styles.heroTags}>
              <span
                style={{
                  ...styles.heroTag,
                  background: isEnrolled ? 'rgba(34,197,94,0.15)' : locked ? 'rgba(249,115,22,0.15)' : 'rgba(59,130,246,0.15)',
                  color: isEnrolled ? theme.success : locked ? '#f97316' : theme.primary,
                  border: `1px solid ${theme.border}`,
                }}
              >
                {isEnrolled ? '✅ Enrolled' : locked ? '🔒 Premium Course' : '🆓 Free Course'}
              </span>

              <span
                style={{
                  ...styles.heroTag,
                  background: theme.isDark ? 'rgba(255,255,255,0.035)' : 'rgba(255,255,255,0.72)',
                  color: theme.muted,
                  border: `1px solid ${theme.border}`,
                }}
              >
                🎥 {totalVideos} Videos
              </span>

              <span
                style={{
                  ...styles.heroTag,
                  background: theme.isDark ? 'rgba(255,255,255,0.035)' : 'rgba(255,255,255,0.72)',
                  color: theme.muted,
                  border: `1px solid ${theme.border}`,
                }}
              >
                📄 {totalPdfs} PDFs
              </span>

              <span
                style={{
                  ...styles.heroTag,
                  background: theme.isDark ? 'rgba(139,92,246,0.13)' : '#f5f3ff',
                  color: theme.primary,
                  border: `1px solid ${theme.border}`,
                }}
              >
                ✨ AI Study Tools
              </span>

              {isEnrolled && (
                <span
                  style={{
                    ...styles.heroTag,
                    background: theme.isDark ? 'rgba(34,197,94,0.12)' : '#dcfce7',
                    color: theme.success,
                    border: `1px solid ${theme.border}`,
                  }}
                >
                  📈 {courseProgress.progressPercent || 0}% Done
                </span>
              )}
            </div>

            <h1 style={{ ...styles.heroTitle(isMobile), color: theme.text }}>
              {course.title}
            </h1>

            <p style={{ ...styles.heroText(isMobile), color: theme.muted }}>
              {course.description || 'Access structured content, videos, PDFs, AI study tools and course resources in one clean learning page.'}
            </p>
          </div>

          <div
            style={{
              ...styles.priceCard(isMobile),
              background: theme.isDark ? 'rgba(255,255,255,0.035)' : 'rgba(255,255,255,0.74)',
              border: `1px solid ${theme.border}`,
            }}
          >
            <p style={{ ...styles.priceLabel, color: theme.muted }}>
              Course Access
            </p>

            <h2
              style={{
                ...styles.priceValue,
                color: isFreeCourse ? theme.success : '#f97316',
              }}
            >
              {isFreeCourse ? 'Free' : `₹${course.price}`}
            </h2>

            <p style={{ color: theme.textSecondary, lineHeight: 1.6, fontWeight: 800 }}>
              {isEnrolled
                ? 'You already own this course.'
                : isFreeCourse
                ? 'Enroll free and start learning.'
                : 'Unlock videos, PDFs, live classes and AI study tools after payment approval.'}
            </p>

            {isEnrolled ? (
              <button
                onClick={() => navigate('/my-courses')}
                style={{
                  ...styles.mainActionBtn,
                  background: theme.success,
                  color: '#fff',
                }}
              >
                🎒 Go to My Courses
              </button>
            ) : isFreeCourse ? (
              <button
                onClick={handleFreeEnroll}
                disabled={loadingFreeEnroll}
                style={{
                  ...styles.mainActionBtn,
                  background: loadingFreeEnroll ? theme.muted : 'linear-gradient(135deg, #22c55e, #16a34a)',
                  color: '#fff',
                  cursor: loadingFreeEnroll ? 'not-allowed' : 'pointer',
                }}
              >
                {loadingFreeEnroll ? 'Enrolling...' : 'Enroll for Free 🚀'}
              </button>
            ) : (
              <button
                onClick={() => openCheckout('hero unlock card')}
                style={{
                  ...styles.mainActionBtn,
                  background: 'linear-gradient(135deg, #f97316, #ea580c)',
                  color: '#fff',
                }}
              >
                Unlock Course 
              </button>
            )}
          </div>
        </motion.div>

        {lockedMsg && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              ...styles.lockedMsg,
              background: lockedMsg.includes('✅')
                ? theme.isDark
                  ? 'rgba(34,197,94,0.14)'
                  : '#dcfce7'
                : theme.isDark
                ? 'rgba(251,191,36,0.14)'
                : '#fef3c7',
              color: lockedMsg.includes('✅')
                ? theme.isDark
                  ? '#86efac'
                  : '#166534'
                : theme.isDark
                ? '#fbbf24'
                : '#92400e',
              border: lockedMsg.includes('✅')
                ? theme.isDark
                  ? '1px solid rgba(34,197,94,0.28)'
                  : '1px solid #bbf7d0'
                : theme.isDark
                ? '1px solid rgba(251,191,36,0.28)'
                : '1px solid #fde68a',
            }}
          >
            {lockedMsg}
          </motion.div>
        )}

        {doneMsg && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              ...styles.lockedMsg,
              background: doneMsg.includes('✅')
                ? theme.isDark
                  ? 'rgba(34,197,94,0.14)'
                  : '#dcfce7'
                : theme.isDark
                ? 'rgba(251,191,36,0.14)'
                : '#fef3c7',
              color: doneMsg.includes('✅')
                ? theme.isDark
                  ? '#86efac'
                  : '#166534'
                : theme.isDark
                ? '#fbbf24'
                : '#92400e',
              border: `1px solid ${theme.border}`,
            }}
          >
            {doneMsg}
          </motion.div>
        )}

        <div style={styles.mainLayout(isMobile)}>
          <div style={styles.contentArea}>
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              style={{
                ...styles.playerCard(isMobile),
                background: theme.card,
                border: `1px solid ${theme.border}`,
                boxShadow: theme.shadow,
                backdropFilter: theme.glass,
                WebkitBackdropFilter: theme.glass,
              }}
            >
              {locked ? (
                <LockedCoursePreview
                  course={course}
                  theme={theme}
                  onUnlock={() => openCheckout('locked preview')}
                  isMobile={isMobile}
                />
              ) : (
                <>
                  {activeTab === 'videos' && activeVideo && (
                    <div>
                      <iframe
                        src={getEmbedUrl(activeVideo.url)}
                        width="100%"
                        height={isMobile ? '220px' : '430px'}
                        title={activeVideo.title}
                        style={{
                          border: 'none',
                          borderRadius: isMobile ? '14px' : '18px',
                          background: '#000',
                        }}
                        allowFullScreen
                      />

                      <h3 style={{ marginTop: '16px', color: theme.text }}>
                        ▶️ {activeVideo.title}
                      </h3>

                      <button
                        onClick={markActiveVideoDone}
                        disabled={isVideoDone(activeVideo)}
                        style={{
                          ...styles.doneBtn,
                          width: isMobile ? '100%' : 'auto',
                          background: isVideoDone(activeVideo)
                            ? 'linear-gradient(135deg, #16a34a, #15803d)'
                            : theme.success,
                          opacity: isVideoDone(activeVideo) ? 0.75 : 1,
                          cursor: isVideoDone(activeVideo) ? 'not-allowed' : 'pointer',
                        }}
                      >
                        {isVideoDone(activeVideo)
                          ? '✅ Video Done'
                          : '✅ Mark Video as Done'}
                      </button>
                    </div>
                  )}

                  {activeTab === 'videos' && !activeVideo && (
                    <p style={{ color: theme.muted, fontWeight: 800 }}>No videos available.</p>
                  )}

                  {activeTab === 'pdfs' && (
                    <div>
                      {activePdf ? (
                        <>
                          <SecurePDFViewer
                            pdf={activePdf}
                            theme={theme}
                            courseTitle={course.title}
                          />

                          <button
                            onClick={markActivePdfDone}
                            disabled={isPdfDone(activePdf)}
                            style={{
                              ...styles.doneBtn,
                              width: isMobile ? '100%' : 'auto',
                              marginTop: '14px',
                              background: isPdfDone(activePdf)
                                ? 'linear-gradient(135deg, #16a34a, #15803d)'
                                : theme.success,
                              opacity: isPdfDone(activePdf) ? 0.75 : 1,
                              cursor: isPdfDone(activePdf) ? 'not-allowed' : 'pointer',
                            }}
                          >
                            {isPdfDone(activePdf)
                              ? '✅ PDF Done'
                              : '✅ Mark PDF as Done'}
                          </button>
                        </>
                      ) : (
                        <p style={{ color: theme.muted, fontWeight: 800 }}>No PDFs available.</p>
                      )}
                    </div>
                  )}

                  {activeTab === 'study-ai' && (
                    <StudyToolsBox
                      tools={studyTools}
                      loading={studyToolsLoading}
                      locked={locked}
                      theme={theme}
                      isMobile={isMobile}
                      onUnlock={() => openCheckout('Study with AI bonus tab')}
                      toolType={activeStudyToolType}
                    />
                  )}
                </>
              )}
            </motion.div>

            {/* ✅ Mobile: Course Content comes immediately after viewer + Mark Done */}
            {isMobile && <CourseContentPanel />}
            {!locked && (isEnrolled || isFreeCourse) && <CertificateBox />}

            <LiveClassesBox courseId={id} isEnrolled={isEnrolled} theme={theme} />

            {course.price > 0 && isEnrolled && (
              <div style={styles.approvedBox}>
                ✅ Payment approved. You are enrolled in this course.
              </div>
            )}

            {course.price > 0 && !isEnrolled && (
              <div
                style={{
                  ...styles.bottomUnlockCard(isMobile),
                  background: theme.card,
                  border: `1px solid ${theme.border}`,
                  boxShadow: theme.shadow,
                }}
              >
                <h3 style={{ marginTop: 0, color: theme.text }}>
                  🔐 Unlock This Course
                </h3>

                <p style={{ color: theme.muted, lineHeight: '1.7', marginBottom: '18px' }}>
                  Apply coupon code, scan QR, upload payment screenshot, or enroll directly if your coupon makes this course free.
                </p>

                <motion.button
                  whileHover={{ scale: 1.018, y: -1 }}
                  whileTap={{ scale: 0.985 }}
                  transition={{ duration: 0.16, ease: 'easeOut' }}
                  onClick={() => openCheckout('bottom unlock card')}
                  style={styles.unlockBtn(isMobile)}
                >
                   Unlock Full Course Now
                </motion.button>
              </div>
            )}

            <div style={{ marginTop: '30px' }}>
              <Reviews courseId={id} />
            </div>
          </div>

          {/* ✅ Desktop: Course Content stays as right sidebar */}
          {!isMobile && <CourseContentPanel />}
        </div>
      </main>

      {showCheckout && (
        <CheckoutModal
          course={course}
          onClose={() => {
            logActivity(
              `Closed checkout modal | Course: ${course.title}`,
              'CourseDetail'
            );
            setShowCheckout(false);
          }}
          onSuccess={handleCheckoutSuccess}
        />
      )}

      <Footer />
    </div>
  );
}

function ContentList({ items, type, locked, activeTitle, onClick, theme, completedUrls = [] }) {
  if (!items?.length) {
    return <p style={{ color: theme.muted }}>No {type === 'video' ? 'videos' : 'PDFs'} available.</p>;
  }

  return (
    <div>
      {items.map((item, i) => {
        const active = !locked && activeTitle === item.title;
        const done = item?.url && completedUrls.includes(item.url);

        return (
          <div
            key={i}
            onClick={() => onClick(item)}
            style={{
              ...styles.contentItem,
              cursor: 'pointer',
              background: active
                ? theme.primary
                : done
                ? theme.isDark
                  ? 'rgba(34,197,94,0.13)'
                  : '#dcfce7'
                : theme.isDark
                ? 'rgba(255,255,255,0.035)'
                : 'rgba(255,255,255,0.72)',
              color: active ? '#fff' : theme.text,
              border: `1px solid ${done ? 'rgba(34,197,94,0.35)' : theme.border}`,
            }}
          >
            <span style={{ minWidth: 0, overflowWrap: 'break-word' }}>
              {locked ? '🔒' : type === 'video' ? '▶️' : '📄'} {item.title}
            </span>

            {locked ? (
              <span style={styles.lockedSmall}>Locked</span>
            ) : done ? (
              <span style={{ ...styles.lockedSmall, color: '#22c55e' }}>Done</span>
            ) : (
              <span style={{ ...styles.lockedSmall, color: theme.muted }}>Open</span>
            )}
          </div>
        );
      })}
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
    maxWidth: '1240px',
    margin: '0 auto',
    padding: isMobile ? '22px 14px 36px' : '32px 20px 46px',
    position: 'relative',
    zIndex: 1,
    width: '100%',
  }),

  hero: (isMobile) => ({
    padding: isMobile ? '22px 16px' : '28px',
    marginBottom: '22px',
    display: 'grid',
    gridTemplateColumns: isMobile ? '1fr' : '1.35fr 0.65fr',
    gap: isMobile ? '18px' : '24px',
    alignItems: 'center',
    width: '100%',
    overflow: 'hidden',
  }),

  backBtn: {
    padding: '10px 14px',
    borderRadius: '14px',
    cursor: 'pointer',
    fontWeight: 900,
    marginBottom: '16px',
  },

  heroTags: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
    marginBottom: '14px',
  },

  heroTag: {
    padding: '8px 12px',
    borderRadius: '999px',
    fontSize: '12px',
    fontWeight: 950,
  },

  heroTitle: (isMobile) => ({
    margin: '0 0 12px',
    fontSize: isMobile ? 'clamp(26px, 8vw, 38px)' : 'clamp(30px, 4vw, 48px)',
    lineHeight: 1.08,
    fontWeight: 950,
    letterSpacing: '-0.8px',
    wordBreak: 'normal',
  }),

  heroText: (isMobile) => ({
    margin: 0,
    lineHeight: 1.75,
    fontSize: isMobile ? '13.5px' : '15px',
    maxWidth: '720px',
  }),

  priceCard: (isMobile) => ({
    padding: isMobile ? '18px' : '22px',
    borderRadius: isMobile ? '20px' : '24px',
    width: '100%',
    overflow: 'hidden',
  }),

  priceLabel: {
    margin: '0 0 6px',
    fontSize: '13px',
    fontWeight: 900,
    textTransform: 'uppercase',
  },

  priceValue: {
    margin: '0 0 10px',
    fontSize: '34px',
    fontWeight: 950,
  },

  mainActionBtn: {
    width: '100%',
    padding: '13px 16px',
    borderRadius: '15px',
    border: 'none',
    fontWeight: 950,
    cursor: 'pointer',
    fontSize: '15px',
    marginTop: '10px',
  },

  doneBtn: {
    marginTop: '10px',
    padding: '12px 16px',
    borderRadius: '14px',
    border: 'none',
    color: '#fff',
    fontWeight: 950,
    cursor: 'pointer',
  },

  lockedMsg: {
    marginBottom: '18px',
    padding: '13px 16px',
    borderRadius: '16px',
    fontWeight: 900,
  },

  mainLayout: (isMobile) => ({
    display: 'grid',
    gridTemplateColumns: isMobile ? '1fr' : '1fr 330px',
    gap: isMobile ? '18px' : '22px',
    alignItems: 'start',
    width: '100%',
  }),

  contentArea: {
    minWidth: 0,
  },

  playerCard: (isMobile) => ({
    borderRadius: isMobile ? '20px' : '24px',
    padding: isMobile ? '12px' : '18px',
    marginBottom: isMobile ? '14px' : '22px',
    width: '100%',
    overflow: 'hidden',
  }),

  sidebar: (isMobile) => ({
    borderRadius: isMobile ? '20px' : '24px',
    padding: isMobile ? '14px' : '18px',
    position: isMobile ? 'relative' : 'sticky',
    top: isMobile ? 'auto' : '92px',
    width: '100%',
    overflow: 'hidden',
    marginBottom: isMobile ? '18px' : 0,
  }),

  previewOnlyBox: {
    padding: '12px',
    borderRadius: '14px',
    marginBottom: '14px',
    fontSize: '13px',
    lineHeight: '1.55',
    fontWeight: 800,
  },

  tabRow: {
    display: 'flex',
    gap: '10px',
    marginBottom: '18px',
  },

  tabBtn: {
    flex: 1,
    padding: '11px 14px',
    borderRadius: '13px',
    cursor: 'pointer',
    fontWeight: 900,
  },

  contentItem: {
    padding: '12px 14px',
    borderRadius: '14px',
    marginBottom: '10px',
    fontWeight: 800,
    display: 'flex',
    justifyContent: 'space-between',
    gap: '8px',
    alignItems: 'center',
  },

  lockedSmall: {
    color: '#fbbf24',
    fontSize: '11px',
    fontWeight: 950,
    flex: '0 0 auto',
  },

  sidebarUnlockBtn: {
    marginTop: '14px',
    width: '100%',
    padding: '13px 16px',
    borderRadius: '15px',
    border: 'none',
    color: '#fff',
    cursor: 'pointer',
    fontWeight: 950,
    boxShadow: '0 12px 28px rgba(34,197,94,0.22)',
  },

  approvedBox: {
    marginTop: '24px',
    padding: '16px',
    borderRadius: '16px',
    background: '#052e16',
    color: '#bbf7d0',
    fontWeight: 900,
    border: '1px solid #166534',
  },

  bottomUnlockCard: (isMobile) => ({
    marginTop: '24px',
    padding: isMobile ? '18px' : '22px',
    borderRadius: isMobile ? '20px' : '24px',
  }),

  unlockBtn: (isMobile) => ({
    width: isMobile ? '100%' : 'auto',
    padding: '14px 20px',
    borderRadius: '16px',
    border: 'none',
    background: 'linear-gradient(135deg, #22c55e, #16a34a)',
    color: '#fff',
    cursor: 'pointer',
    fontWeight: 950,
    boxShadow: '0 12px 28px rgba(34,197,94,0.24)',
  }),

  lockedBadge: {
    display: 'inline-flex',
    padding: '8px 12px',
    borderRadius: '999px',
    background: 'linear-gradient(135deg, rgba(249,115,22,0.16), rgba(239,68,68,0.12))',
    color: '#fb923c',
    border: '1px solid rgba(249,115,22,0.28)',
    fontWeight: 950,
    fontSize: '12px',
    marginBottom: '14px',
  },

  lockedTitle: (isMobile) => ({
    margin: '0 0 12px',
    fontSize: isMobile ? '26px' : '36px',
    fontWeight: 950,
    letterSpacing: '-0.6px',
    lineHeight: 1.15,
  }),

  lockedText: (isMobile) => ({
    margin: '0 auto',
    maxWidth: '780px',
    lineHeight: 1.75,
    fontSize: isMobile ? '14px' : '15.5px',
    fontWeight: 750,
  }),

  lockedTags: {
    marginTop: '16px',
    display: 'flex',
    gap: '10px',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },

  greenTag: {
    padding: '8px 11px',
    borderRadius: '999px',
    background: 'rgba(34,197,94,0.14)',
    color: '#22c55e',
    fontSize: '12px',
    fontWeight: 950,
    border: '1px solid rgba(34,197,94,0.25)',
  },

  blueTag: {
    padding: '8px 11px',
    borderRadius: '999px',
    background: 'rgba(59,130,246,0.14)',
    color: '#60a5fa',
    fontSize: '12px',
    fontWeight: 950,
    border: '1px solid rgba(59,130,246,0.25)',
  },

  yellowTag: {
    padding: '8px 11px',
    borderRadius: '999px',
    background: 'rgba(251,191,36,0.14)',
    color: '#fbbf24',
    fontSize: '12px',
    fontWeight: 950,
    border: '1px solid rgba(251,191,36,0.25)',
  },

  previewGrid: (isMobile) => ({
    display: 'grid',
    gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)',
    gap: isMobile ? '10px' : '14px',
    marginBottom: isMobile ? '18px' : '24px',
  }),

  previewCard: (isMobile) => ({
    padding: isMobile ? '14px 10px' : '18px',
    borderRadius: isMobile ? '16px' : '20px',
    textAlign: 'center',
  }),

  unlockBox: (isMobile) => ({
    marginTop: '18px',
    padding: isMobile ? '16px' : '20px',
    borderRadius: isMobile ? '18px' : '22px',
  }),

  unlockGrid: (isMobile) => ({
    display: 'grid',
    gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
    gap: '10px',
    fontWeight: 800,
    lineHeight: 1.5,
  }),

  aiLockedBox: (isMobile) => ({
    marginTop: '18px',
    padding: isMobile ? '16px' : '20px',
    borderRadius: isMobile ? '18px' : '22px',
    display: 'grid',
    gridTemplateColumns: isMobile ? '1fr' : '1fr 0.85fr',
    gap: '16px',
    alignItems: 'center',
  }),

  aiLockedPreviewGrid: (isMobile) => ({
    display: 'grid',
    gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
    gap: '9px',
    fontSize: '13px',
    fontWeight: 900,
    color: '#a78bfa',
  }),

  compareGrid: (isMobile) => ({
    marginTop: '18px',
    display: 'grid',
    gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
    gap: '12px',
  }),

  compareCard: {
    padding: '16px',
    borderRadius: '18px',
  },

  compareText: {
    margin: '8px 0 0',
    lineHeight: 1.6,
    fontWeight: 750,
    fontSize: '13px',
  },

  lockedListsGrid: (isMobile) => ({
    marginTop: '18px',
    display: 'grid',
    gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
    gap: '14px',
  }),

  lockedList: {
    padding: '16px',
    borderRadius: '18px',
  },

  lockedItem: {
    padding: '11px 12px',
    borderRadius: '13px',
    marginBottom: '8px',
    display: 'flex',
    justifyContent: 'space-between',
    gap: '10px',
    alignItems: 'center',
  },

  finalUnlock: (isMobile) => ({
    marginTop: '24px',
    padding: isMobile ? '20px 14px' : '28px',
    textAlign: 'center',
    borderRadius: isMobile ? '20px' : '24px',
    background: 'linear-gradient(135deg, rgba(15,23,42,0.85), rgba(88,28,135,0.35))',
    border: '1px solid rgba(139,92,246,0.25)',
  }),

  launchBadge: {
    display: 'inline-flex',
    padding: '8px 12px',
    borderRadius: '999px',
    background: 'rgba(251,191,36,0.14)',
    color: '#fbbf24',
    border: '1px solid rgba(251,191,36,0.25)',
    fontWeight: 950,
    fontSize: '12px',
    marginBottom: '12px',
  },

  finalUnlockTitle: (isMobile) => ({
    color: '#fff',
    margin: '0 auto 10px',
    maxWidth: '780px',
    fontSize: isMobile ? '24px' : '34px',
    lineHeight: 1.15,
    fontWeight: 950,
  }),

  finalUnlockText: (isMobile) => ({
    color: '#cbd5e1',
    maxWidth: '780px',
    margin: '0 auto',
    lineHeight: 1.75,
    fontWeight: 750,
    fontSize: isMobile ? '13.5px' : '15px',
  }),

  unlockSmallText: {
    color: '#94a3b8',
    fontSize: '12px',
    marginTop: '12px',
    fontWeight: 800,
  },

  studyToolsCard: (isMobile) => ({
    borderRadius: isMobile ? '20px' : '24px',
    padding: isMobile ? '16px' : '22px',
    width: '100%',
    overflow: 'hidden',
  }),

  aiFeatureGrid: (isMobile) => ({
    display: 'grid',
    gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
    gap: '10px',
    color: '#a78bfa',
    fontWeight: 900,
    fontSize: '13px',
  }),

  pdfControls: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
    flexWrap: 'wrap',
  },

  pdfBtn: {
    width: '34px',
    height: '34px',
    borderRadius: '10px',
    fontWeight: 950,
    fontSize: '18px',
  },

  fitBtn: {
    padding: '9px 12px',
    borderRadius: '10px',
    border: 'none',
    fontWeight: 950,
    cursor: 'pointer',
  },

  zoomText: {
    minWidth: '46px',
    textAlign: 'center',
    fontWeight: 950,
    fontSize: '13px',
  },

  pdfWatermark: {
    position: 'sticky',
    top: '58px',
    zIndex: 20,
    textAlign: 'center',
    color: 'rgba(139,92,246,0.38)',
    fontWeight: 950,
    fontSize: '13px',
    pointerEvents: 'none',
    letterSpacing: '0.5px',
    marginBottom: '10px',
  },

  certificateBox: (isMobile) => ({
    width: '100%',
    padding: isMobile ? '18px' : '24px',
    borderRadius: isMobile ? '20px' : '24px',
    marginBottom: '20px',
    overflow: 'hidden',
  }),

  certificateBoxTop: (isMobile) => ({
    display: 'flex',
    justifyContent: 'space-between',
    gap: '16px',
    alignItems: 'flex-start',
    flexDirection: isMobile ? 'column' : 'row',
  }),

  certificateSeal: {
    width: '58px',
    height: '58px',
    borderRadius: '50%',
    display: 'grid',
    placeItems: 'center',
    background: 'rgba(139,92,246,0.18)',
    fontSize: '30px',
    flex: '0 0 auto',
  },

  certificateProgressWrap: {
    padding: '14px',
    borderRadius: '16px',
    marginTop: '18px',
  },

  certificateProgressHead: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '12px',
    marginBottom: '10px',
  },

  certificateProgressBar: {
    width: '100%',
    height: '11px',
    borderRadius: '999px',
    overflow: 'hidden',
  },

  certificateMsg: {
    marginTop: '14px',
    padding: '12px 14px',
    borderRadius: '14px',
    fontWeight: 900,
    lineHeight: 1.45,
  },

  generatedCertBox: {
    marginTop: '14px',
    padding: '14px',
    borderRadius: '16px',
  },

  certificateSmallBtn: {
    padding: '10px 13px',
    borderRadius: '12px',
    fontWeight: 950,
    cursor: 'pointer',
  },

  generateCertificateBtn: (isMobile) => ({
    width: '100%',
    marginTop: '16px',
    padding: isMobile ? '13px' : '15px',
    border: 'none',
    borderRadius: '16px',
    fontSize: isMobile ? '14px' : '15px',
    fontWeight: 950,
    boxShadow: '0 14px 32px rgba(139,92,246,0.24)',
  }),

};

export default CourseDetail;
