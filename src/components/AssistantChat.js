import { useEffect, useRef, useState } from 'react';
import API from '../api';
import { useTheme } from '../context/ThemeContext';

function AssistantChat() {
  const theme = useTheme();

  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef(null);

  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');

  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: `Hi${user?.name ? ` ${user.name}` : ''} 👋 I'm your REHANVERSE Assistant. Ask me about courses, payments, PDFs, coupons, live classes, or study doubts.`,
    },
  ]);

  useEffect(() => {
    if (open) {
      messagesEndRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'end',
      });
    }
  }, [messages, loading, open]);

  const isLight =
    theme?.isDark === false || theme?.mode === 'light' || theme?.theme === 'light';

  const askAssistant = async () => {
    const cleanQuestion = question.trim();
    if (!cleanQuestion || loading) return;

    if (!token) {
      setMessages((prev) => [
        ...prev,
        { role: 'user', text: cleanQuestion },
        {
          role: 'assistant',
          text: 'Please login first to use REHANVERSE Assistant.',
        },
      ]);
      setQuestion('');
      return;
    }

    setMessages((prev) => [...prev, { role: 'user', text: cleanQuestion }]);
    setQuestion('');
    setLoading(true);

    try {
      const res = await fetch(`${API}/api/assistant/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ question: cleanQuestion }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Assistant failed');
      }

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text:
            data.answer ||
            'Sorry, I could not generate a proper response. Please try again.',
        },
      ]);
    } catch (error) {
      console.error('Assistant error:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: 'Assistant is not responding right now. Please try again later.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      askAssistant();
    }
  };

  const ui = {
    panelBg: isLight ? 'rgba(255,255,255,0.97)' : 'rgba(7, 11, 25, 0.97)',
    panelBorder: isLight
      ? 'rgba(124,58,237,0.16)'
      : 'rgba(148,163,184,0.16)',
    text: isLight ? '#111827' : '#f8fafc',
    muted: isLight ? '#64748b' : '#94a3b8',
    chatBg: isLight
      ? 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)'
      : 'linear-gradient(180deg, #050816 0%, #070b19 100%)',
    botBubble: isLight ? '#f1f5f9' : 'rgba(30,41,59,0.92)',
    inputBg: isLight ? '#ffffff' : 'rgba(15,23,42,0.96)',
  };

  return (
    <>
      <style>
        {`
          @keyframes rvPanelOpen {
            0% {
              opacity: 0;
              transform: translateY(24px) scale(0.92);
              filter: blur(5px);
            }
            60% {
              opacity: 1;
              transform: translateY(-4px) scale(1.015);
              filter: blur(0);
            }
            100% {
              opacity: 1;
              transform: translateY(0) scale(1);
              filter: blur(0);
            }
          }

          @keyframes rvIconIdle {
            0%, 100% {
              transform: translateY(0) scale(1);
            }
            50% {
              transform: translateY(-3px) scale(1.02);
            }
          }

          @keyframes rvGlowPulse {
            0% {
              box-shadow:
                0 14px 35px rgba(124,58,237,0.28),
                0 0 0 0 rgba(139,92,246,0.25);
            }
            70% {
              box-shadow:
                0 18px 45px rgba(124,58,237,0.36),
                0 0 0 14px rgba(139,92,246,0);
            }
            100% {
              box-shadow:
                0 14px 35px rgba(124,58,237,0.28),
                0 0 0 0 rgba(139,92,246,0);
            }
          }

          @keyframes rvLabelIn {
            from {
              opacity: 0;
              transform: translateX(12px) scale(0.96);
            }
            to {
              opacity: 1;
              transform: translateX(0) scale(1);
            }
          }

          @keyframes rvMsgIn {
            from {
              opacity: 0;
              transform: translateY(7px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .rv-assistant-panel {
            animation: rvPanelOpen 0.34s cubic-bezier(.18,.9,.22,1);
            transform-origin: bottom right;
          }

          .rv-assistant-orb {
            animation: rvIconIdle 4s ease-in-out infinite, rvGlowPulse 3s infinite;
          }

          .rv-assistant-wrap:hover .rv-assistant-orb {
            width: 66px !important;
            height: 66px !important;
            border-radius: 23px !important;
            transform: translateY(-6px) scale(1.08) !important;
            box-shadow:
              0 22px 60px rgba(124,58,237,0.48),
              0 0 45px rgba(37,99,235,0.38),
              inset 0 1px 0 rgba(255,255,255,0.22) !important;
          }

          .rv-assistant-wrap:hover .rv-assistant-orb svg {
            transform: scale(1.08);
          }

          .rv-assistant-label {
            opacity: 0;
            transform: translateX(14px) scale(0.96);
            pointer-events: none;
            transition: all 0.22s cubic-bezier(.2,.8,.2,1);
          }

          .rv-assistant-wrap:hover .rv-assistant-label {
            opacity: 1;
            transform: translateX(0) scale(1);
            animation: rvLabelIn 0.22s ease-out;
          }

          .rv-assistant-message {
            animation: rvMsgIn 0.18s ease-out;
          }

          .rv-assistant-scroll::-webkit-scrollbar {
            width: 6px;
          }

          .rv-assistant-scroll::-webkit-scrollbar-thumb {
            background: rgba(148,163,184,0.28);
            border-radius: 999px;
          }

          .rv-assistant-scroll::-webkit-scrollbar-track {
            background: transparent;
          }

          @media (max-width: 520px) {
            .rv-assistant-panel-mobile {
              right: 14px !important;
              left: 14px !important;
              width: auto !important;
              bottom: 88px !important;
            }

            .rv-assistant-floating {
              right: 18px !important;
              bottom: 20px !important;
            }

            .rv-assistant-label {
              display: none !important;
            }

            .rv-assistant-wrap:hover .rv-assistant-orb {
              width: 58px !important;
              height: 58px !important;
              transform: translateY(-3px) scale(1.04) !important;
            }
          }
        `}
      </style>

      {/* ✅ Floating Assistant Logo */}
      <div
        className="rv-assistant-wrap rv-assistant-floating"
        style={{
          position: 'fixed',
          right: '30px',
          bottom: '28px',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        {/* ✅ Hover Text */}
        {!open && (
          <div
            className="rv-assistant-label"
            style={{
              background: isLight
                ? 'rgba(255,255,255,0.96)'
                : 'rgba(15,23,42,0.94)',
              color: ui.text,
              border: `1px solid ${ui.panelBorder}`,
              borderRadius: '999px',
              padding: '11px 15px',
              fontSize: '13px',
              fontWeight: 900,
              letterSpacing: '0.1px',
              boxShadow: '0 16px 38px rgba(0,0,0,0.24)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              whiteSpace: 'nowrap',
            }}
          >
            Ask REHANVERSE
          </div>
        )}

        <button
          className="rv-assistant-orb"
          onClick={() => setOpen(!open)}
          title={open ? 'Close Assistant' : 'Ask REHANVERSE'}
          style={{
            width: '58px',
            height: '58px',
            borderRadius: '20px',
            border: '1px solid rgba(255,255,255,0.16)',
            background: open
              ? 'linear-gradient(135deg, #111827, #7c3aed)'
              : 'linear-gradient(135deg, #8b5cf6, #2563eb)',
            color: '#ffffff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.24s cubic-bezier(.2,.8,.2,1)',
            boxShadow:
              '0 14px 35px rgba(124,58,237,0.30), inset 0 1px 0 rgba(255,255,255,0.18)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
          }}
        >
          {open ? (
            <span
              style={{
                fontSize: '27px',
                lineHeight: 1,
                fontWeight: 800,
                marginTop: '-2px',
              }}
            >
              ×
            </span>
          ) : (
            <svg
              width="27"
              height="27"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
              style={{
                transition: 'transform 0.22s ease',
              }}
            >
              <path
                d="M7.6 18.2H7C4.8 18.2 3 16.4 3 14.2V8.8C3 6.6 4.8 4.8 7 4.8H17C19.2 4.8 21 6.6 21 8.8V14.2C21 16.4 19.2 18.2 17 18.2H12.5L8.6 21.1C8.2 21.4 7.6 21.1 7.6 20.6V18.2Z"
                stroke="white"
                strokeWidth="1.9"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M8 10.2H16"
                stroke="white"
                strokeWidth="1.9"
                strokeLinecap="round"
              />
              <path
                d="M8 13.6H13.6"
                stroke="white"
                strokeWidth="1.9"
                strokeLinecap="round"
              />
            </svg>
          )}
        </button>
      </div>

      {/* ✅ Animated Chat Panel */}
      {open && (
        <div
          className="rv-assistant-panel rv-assistant-panel-mobile"
          style={{
            position: 'fixed',
            right: '30px',
            bottom: '104px',
            width: '390px',
            maxWidth: 'calc(100vw - 32px)',
            height: '535px',
            maxHeight: '76vh',
            zIndex: 9999,
            background: ui.panelBg,
            color: ui.text,
            borderRadius: '24px',
            overflow: 'hidden',
            border: `1px solid ${ui.panelBorder}`,
            boxShadow:
              '0 24px 80px rgba(0,0,0,0.46), 0 0 0 1px rgba(255,255,255,0.04)',
            display: 'flex',
            flexDirection: 'column',
            backdropFilter: 'blur(22px)',
            WebkitBackdropFilter: 'blur(22px)',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '17px 18px 15px',
              background: isLight
                ? 'linear-gradient(135deg, #ffffff, #f8fafc)'
                : 'linear-gradient(135deg, rgba(15,23,42,0.98), rgba(17,24,39,0.96))',
              borderBottom: `1px solid ${ui.panelBorder}`,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '15px',
                  background:
                    'linear-gradient(135deg, rgba(139,92,246,1), rgba(37,99,235,1))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  boxShadow: '0 12px 28px rgba(124,58,237,0.26)',
                }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M7.6 18.2H7C4.8 18.2 3 16.4 3 14.2V8.8C3 6.6 4.8 4.8 7 4.8H17C19.2 4.8 21 6.6 21 8.8V14.2C21 16.4 19.2 18.2 17 18.2H12.5L8.6 21.1C8.2 21.4 7.6 21.1 7.6 20.6V18.2Z"
                    stroke="white"
                    strokeWidth="1.9"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M8 10.2H16"
                    stroke="white"
                    strokeWidth="1.9"
                    strokeLinecap="round"
                  />
                  <path
                    d="M8 13.6H13.6"
                    stroke="white"
                    strokeWidth="1.9"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              <div>
                <div
                  style={{
                    fontSize: '16px',
                    fontWeight: 950,
                    letterSpacing: '-0.2px',
                  }}
                >
                  REHANVERSE Assistant
                </div>

                <div
                  style={{
                    fontSize: '12px',
                    color: ui.muted,
                    marginTop: '3px',
                    fontWeight: 600,
                  }}
                >
                  {user?.name
                    ? `Helping ${user.name}`
                    : 'Login required to ask questions'}
                </div>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div
            className="rv-assistant-scroll"
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '16px',
              background: ui.chatBg,
            }}
          >
            {messages.map((msg, index) => (
              <div
                key={index}
                className="rv-assistant-message"
                style={{
                  display: 'flex',
                  justifyContent:
                    msg.role === 'user' ? 'flex-end' : 'flex-start',
                  marginBottom: '12px',
                }}
              >
                <div
                  style={{
                    maxWidth: '84%',
                    padding: '11px 13px',
                    borderRadius:
                      msg.role === 'user'
                        ? '16px 16px 5px 16px'
                        : '16px 16px 16px 5px',
                    background:
                      msg.role === 'user'
                        ? 'linear-gradient(135deg, #7c3aed, #2563eb)'
                        : ui.botBubble,
                    color: msg.role === 'user' ? '#fff' : ui.text,
                    fontSize: '13px',
                    lineHeight: '1.55',
                    whiteSpace: 'pre-wrap',
                    border:
                      msg.role === 'user'
                        ? '1px solid rgba(255,255,255,0.12)'
                        : `1px solid ${ui.panelBorder}`,
                    boxShadow:
                      msg.role === 'user'
                        ? '0 10px 24px rgba(37,99,235,0.22)'
                        : '0 8px 22px rgba(0,0,0,0.10)',
                  }}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {loading && (
              <div
                className="rv-assistant-message"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 12px',
                  borderRadius: '14px',
                  background: ui.botBubble,
                  border: `1px solid ${ui.panelBorder}`,
                  color: ui.muted,
                  fontSize: '13px',
                  fontWeight: 600,
                }}
              >
                <span>Thinking...</span>
              </div>
            )}

            {/* ✅ Auto-scroll target */}
            <div ref={messagesEndRef} />
          </div>

          {/* Privacy */}
          <div
            style={{
              padding: '8px 15px',
              fontSize: '10.5px',
              color: ui.muted,
              borderTop: `1px solid ${ui.panelBorder}`,
              background: isLight ? '#ffffff' : 'rgba(7,11,25,0.98)',
              lineHeight: '1.4',
            }}
          >
            Assistant chats may be reviewed by admin for support and quality improvement.
          </div>

          {/* Input */}
          <div
            style={{
              display: 'flex',
              gap: '9px',
              padding: '12px',
              borderTop: `1px solid ${ui.panelBorder}`,
              background: isLight ? '#ffffff' : 'rgba(7,11,25,0.98)',
            }}
          >
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about courses, payment, PDFs..."
              rows={1}
              disabled={loading}
              style={{
                flex: 1,
                minHeight: '44px',
                maxHeight: '84px',
                resize: 'none',
                outline: 'none',
                borderRadius: '14px',
                border: `1px solid ${ui.panelBorder}`,
                background: ui.inputBg,
                color: ui.text,
                padding: '12px 13px',
                fontSize: '13px',
                fontWeight: 600,
                opacity: loading ? 0.75 : 1,
              }}
            />

            <button
              onClick={askAssistant}
              disabled={loading || !question.trim()}
              style={{
                minWidth: '72px',
                border: 'none',
                borderRadius: '14px',
                background:
                  loading || !question.trim()
                    ? '#64748b'
                    : 'linear-gradient(135deg, #7c3aed, #2563eb)',
                color: '#ffffff',
                fontSize: '13px',
                fontWeight: 900,
                cursor: loading || !question.trim() ? 'not-allowed' : 'pointer',
                boxShadow:
                  loading || !question.trim()
                    ? 'none'
                    : '0 10px 24px rgba(37,99,235,0.28)',
              }}
            >
              {loading ? 'Wait' : 'Send'}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default AssistantChat;