// src/components/ChatBox.jsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Form, Button, Spinner, Alert } from './ui';
import { connectSocket, getSocket, waitUntilConnected } from '../socket';
import './ChatBox.css';

const fmtTime = (d) => {
  try {
    return new Date(d).toLocaleTimeString('ar-MA', { hour: '2-digit', minute: '2-digit' });
  } catch { return ''; }
};

const PAGE_SIZE = 5; // pagination size

const ChatBox = ({ conversationId, recipientId, className = '' }) => {
  const [messages, setMessages]   = useState([]);
  const [input, setInput]         = useState('');
  const [loading, setLoading]     = useState(true);
  const [sending, setSending]     = useState(false);
  const [isTyping, setIsTyping]   = useState(false);
  const [error, setError]         = useState('');
  const [hasMore, setHasMore]     = useState(true);
  const [loadingPrev, setLoadingPrev] = useState(false);

  const listRef                  = useRef(null);
  const knownIdsRef              = useRef(new Set());
  const knownTempRef             = useRef(new Set());
  const typingTimeoutRef         = useRef(null);
  const typingSentAtRef          = useRef(0);
  const historyRequestedRef      = useRef(false);
  const reconnectTimerRef        = useRef(null);
  const watchdogRef              = useRef(null);
  const socketRef                = useRef(null);
  const preventAutoScrollRef     = useRef(false);
  const loadingMoreRef           = useRef(false);
  // track read-marking to avoid duplicates and to batch updates
  const readMarkedRef            = useRef(new Set());
  const markQueueRef             = useRef(new Set());
  const markTimerRef             = useRef(null);

  const token = useMemo(() => {
    const u = JSON.parse(localStorage.getItem('user') || '{}');
    return u?.token || localStorage.getItem('token') || localStorage.getItem('authToken') || null;
  }, []);

  const myId = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('user') || '{}')._id || null; }
    catch { return null; }
  }, []);

  const scrollToBottom = () => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  };
  useEffect(() => {
    if (preventAutoScrollRef.current) {
      // skip one auto-scroll (used when prepending older messages)
      preventAutoScrollRef.current = false;
      return;
    }
    scrollToBottom();
  }, [messages]);

  const clearWatchdog = () => {
    if (watchdogRef.current) {
      clearTimeout(watchdogRef.current);
      watchdogRef.current = null;
    }
  };

  const startWatchdog = () => {
    clearWatchdog();
    // إن لم يصل التاريخ خلال 7 ثوانٍ، أظهر زر إعادة المحاولة
    watchdogRef.current = setTimeout(() => {
      setLoading(false);
      setError('تأخّر تحميل المحادثة. جرّب إعادة المحاولة.');
    }, 7000);
  };

  const requestHistory = async () => {
    if (!conversationId || !recipientId) {
      setError('بيانات غير مكتملة لبدء المحادثة.');
      setLoading(false);
      return;
    }

    const s = socketRef.current || getSocket();
    if (!s || !s.connected) {
      // انتظر حتى يتصل الـ socket
      const ready = await waitUntilConnected(8000);
      if (!ready) {
        setError('تعذّر الاتصال بالخادم. تحقّق من تسجيل الدخول أو الشبكة.');
        setLoading(false);
        return;
      }
    }

    startWatchdog();
    historyRequestedRef.current = true;
    // مهم: تمرير recipientId لأن قاعدة البيانات لا تخزن conversationId
    (socketRef.current || getSocket())?.emit('loadMessages', {
      conversationId,
      recipientId,
      limit: PAGE_SIZE,
      before: null, // first page (newest)
    });
  };

  const loadPrevious = async () => {
    if (loadingPrev || !messages.length || !hasMore) return;

    const s = socketRef.current || getSocket();
    if (!s || !s.connected) return;

    setLoadingPrev(true);
    loadingMoreRef.current = true;

    // Preserve scroll position during prepend
    const el = listRef.current;
    const prevScrollHeight = el ? el.scrollHeight : 0;

    const beforeCursor = messages[0]?.timestamp || null;
    // avoid auto-scroll to bottom on prepend
    preventAutoScrollRef.current = true;

    s.emit('loadMessages', {
      conversationId,
      recipientId,
      limit: PAGE_SIZE,
      before: beforeCursor,
    });

    // After messages merge, adjust scroll to keep viewport stable
    setTimeout(() => {
      const el2 = listRef.current;
      if (el && el2) {
        const newScrollHeight = el2.scrollHeight;
        el2.scrollTop = newScrollHeight - prevScrollHeight + el2.scrollTop;
      }
      setLoadingPrev(false);
    }, 0);
  };

  const flushMarkRead = () => {
    if (markTimerRef.current) {
      clearTimeout(markTimerRef.current);
      markTimerRef.current = null;
    }
    const ids = Array.from(markQueueRef.current);
    if (!ids.length) return;
    markQueueRef.current.clear();

    const s = socketRef.current || getSocket();
    if (s?.connected) {
      try { s.emit('markRead', { messageIds: ids }); } catch {}
    }

    // Optimistically update local state to reflect read status
    setMessages((prev) => prev.map((m) => (m._id && ids.includes(String(m._id)) ? { ...m, read: true } : m)));
  };

  const queueMarkRead = (ids = []) => {
    let added = false;
    ids.forEach((id) => {
      const sid = String(id);
      if (!sid) return;
      if (readMarkedRef.current.has(sid)) return;
      readMarkedRef.current.add(sid);
      markQueueRef.current.add(sid);
      added = true;
    });
    if (added && !markTimerRef.current) {
      markTimerRef.current = setTimeout(flushMarkRead, 300);
    }
  };

  const bindSocket = (s) => {
    socketRef.current = s;

    const onConnect = () => {
      setError('');
      // انضم إلى غرفة المحادثة ثم اطلب السجل
      s.emit('joinConversation', { conversationId });
      historyRequestedRef.current = false;
      setLoading(true);
      requestHistory();
    };

    const onConnectError = (err) => {
      setError(err?.message || 'تعذّر الاتصال.');
      setLoading(false);
    };

    const onDisconnect = () => {
      setError('انقطع الاتصال… جارِ إعادة المحاولة');
      setLoading(true);
    };

    const onReconnect = () => {
      setError('');
      setLoading(true);
      historyRequestedRef.current = false;
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = setTimeout(() => {
        s.emit('joinConversation', { conversationId });
        requestHistory();
      }, 300);
    };

    const onHistory = (payload) => {
      clearWatchdog();
      const list = Array.isArray(payload?.messages)
        ? payload.messages
        : Array.isArray(payload)
        ? payload
        : [];

      if (payload?.conversationId && payload.conversationId !== conversationId) return;

      const normalized = list.map((m) => {
        if (m._id) knownIdsRef.current.add(String(m._id));
        // default read flag to false if missing
        return { read: false, ...m };
      });

      if (loadingMoreRef.current) {
        // prepend older messages, avoid duplicates
        setMessages((prev) => {
          const dedup = normalized.filter((m) => !m._id || !prev.some((p) => p._id === m._id));
          return dedup.length ? [...dedup, ...prev] : prev;
        });
        loadingMoreRef.current = false;
        // if page smaller than PAGE_SIZE, likely no more
        if (normalized.length < PAGE_SIZE) setHasMore(false);
      } else {
        setMessages(normalized);
        setHasMore(normalized.length >= PAGE_SIZE);
      }

      // Queue mark-as-read for messages addressed to me that are not yet read
      const unreadIds = normalized
        .filter((m) => String(m.recipient) === String(myId) && !m.read && m._id)
        .map((m) => String(m._id));
      if (unreadIds.length) queueMarkRead(unreadIds);

      setLoading(false);
      setError('');
    };

    const onReceive = (msg) => {
      if (!msg || msg.conversationId !== conversationId) return;
      if (msg?._id && knownIdsRef.current.has(String(msg._id))) return;
      if (msg?.tempId && knownTempRef.current.has(String(msg.tempId))) return;

      if (msg?.tempId) {
        setMessages((prev) => {
          const i = prev.findIndex((x) => x.tempId === msg.tempId);
          if (i !== -1) {
            const next = [...prev];
            knownTempRef.current.delete(String(msg.tempId));
            if (msg._id) knownIdsRef.current.add(String(msg._id));
            next[i] = { ...msg, pending: false };
            return next;
          }
          if (msg._id) knownIdsRef.current.add(String(msg._id));
          return [...prev, { ...msg, pending: false }];
        });
        // If I am the recipient, mark this message as read
        if (msg._id && String(msg.recipient) === String(myId)) queueMarkRead([msg._id]);
        return;
      }

      if (msg?._id) knownIdsRef.current.add(String(msg._id));
      setMessages((prev) => [...prev, { ...msg, pending: false }]);
      // If I am the recipient, mark this message as read
      if (msg?._id && String(msg.recipient) === String(myId)) queueMarkRead([msg._id]);
    };

    const onSent = (msg) => {
      if (!msg || msg.conversationId !== conversationId) return;
      if (msg?.tempId) {
        setMessages((prev) => {
          const i = prev.findIndex((x) => x.tempId === msg.tempId);
          if (i !== -1) {
            const next = [...prev];
            knownTempRef.current.delete(String(msg.tempId));
            if (msg._id) knownIdsRef.current.add(String(msg._id));
            next[i] = { ...msg, pending: false };
            return next;
          }
          if (msg._id) knownIdsRef.current.add(String(msg._id));
          return [...prev, { ...msg, pending: false }];
        });
      } else if (msg?._id && !knownIdsRef.current.has(String(msg._id))) {
        knownIdsRef.current.add(String(msg._id));
        setMessages((prev) => [...prev, { ...msg, pending: false }]);
      }
    };

    const onTyping = (payload) => {
      if (!payload || payload.conversationId !== conversationId) return;
      setIsTyping(true);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 1200);
    };

    const onServerError = (payload) => {
      clearWatchdog();
      setError(payload?.message || 'حدث خطأ في المحادثة.');
      setLoading(false);
    };

    const onMessagesRead = ({ conversationId: conv, messageIds = [] } = {}) => {
      if (!conv || conv !== conversationId) return;
      if (!Array.isArray(messageIds) || !messageIds.length) return;
      const idSet = new Set(messageIds.map(String));
      setMessages((prev) => prev.map((m) => (m._id && idSet.has(String(m._id)) ? { ...m, read: true } : m)));
    };

    s.on('connect', onConnect);
    s.on('connect_error', onConnectError);
    s.on('disconnect', onDisconnect);
    s.on('reconnect', onReconnect);
    s.on('chatHistory', onHistory);
    s.on('receiveMessage', onReceive);
    s.on('messageSent', onSent);
    s.on('typing', onTyping);
    // listen to namespaced server errors
    s.on('ws:error', onServerError);
    s.on('messagesRead', onMessagesRead);

    // إلغاء الاشتراكات
    return () => {
      s.off('connect', onConnect);
      s.off('connect_error', onConnectError);
      s.off('disconnect', onDisconnect);
      s.off('reconnect', onReconnect);
      s.off('chatHistory', onHistory);
      s.off('receiveMessage', onReceive);
      s.off('messageSent', onSent);
      s.off('typing', onTyping);
      s.off('ws:error', onServerError);
      s.off('messagesRead', onMessagesRead);
      if (markTimerRef.current) clearTimeout(markTimerRef.current);
    };
  };

  // الاشتراكات/الإعداد
  useEffect(() => {
    setLoading(true);
    setError('');
    setHasMore(true);
    setLoadingPrev(false);
    knownIdsRef.current.clear();
    knownTempRef.current.clear();
    readMarkedRef.current.clear();
    markQueueRef.current.clear();
    if (markTimerRef.current) { clearTimeout(markTimerRef.current); markTimerRef.current = null; }
    historyRequestedRef.current = false;
    clearWatchdog();

    if (!token || !recipientId || !conversationId) {
      setError('بيانات غير مكتملة لبدء المحادثة.');
      setLoading(false);
      return;
    }

    const s = connectSocket(token);
    const unbind = bindSocket(s);

    // إن كان متصلًا بالفعل بعد التحديث
    if (s.connected) {
      s.emit('joinConversation', { conversationId });
      requestHistory();
    }

    return () => {
      clearTimeout(reconnectTimerRef.current);
      clearWatchdog();
      try { s.emit('leaveConversation', { conversationId }); } catch {}
      unbind?.();
    };
  }, [token, recipientId, conversationId]);

  const sendTyping = () => {
    const now = Date.now();
    if (now - typingSentAtRef.current > 800) {
      typingSentAtRef.current = now;
      const s = getSocket();
      if (s?.connected && conversationId) s.emit('typing', { conversationId });
    }
  };

  const sendMessage = (e) => {
    e?.preventDefault?.();
    const text = input.trim();
    if (!text || sending) return;

    const s = getSocket();
    if (!s?.connected) return;

    const tempId = `tmp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    knownTempRef.current.add(tempId);

    const me = JSON.parse(localStorage.getItem('user') || '{}');
    const optimistic = {
      tempId,
      conversationId,
      sender: me?._id || 'me',
      recipient: recipientId,
      content: text,
      timestamp: new Date().toISOString(),
      pending: true,
      read: false,
      senderName: `${me?.firstName || ''} ${me?.lastName || ''}`.trim() || 'أنا',
      senderProfileImage: me?.profileImage || '',
    };

    setMessages((prev) => [...prev, optimistic]);
    setInput('');
    setSending(true);

    s.emit('sendMessage', { conversationId, recipientId, content: text, type: 'chat', tempId });

    // Fallback لإزالة pending إن لم يصل messageSent
    setTimeout(() => {
      setMessages((prev) =>
        prev.map((m) => (m.tempId === tempId ? { ...m, pending: false } : m)),
      );
    }, 8000);

    setSending(false);
  };

  return (
    <div className={`chatbox chatbox-container card shadow-sm ${className}`} dir="rtl">
      <div className="card-header bg-white d-flex align-items-center justify-content-between">
        <div className="fw-bold">
          <i className="fas fa-comments ms-2 text-primary" />
          المحادثة
        </div>
        {isTyping && <small className="text-muted">يكتب الآن…</small>}
      </div>

      <div ref={listRef} className="card-body p-2 messages-area messages-scroll">
        {!loading && hasMore && messages.length > 0 && (
          <div className="text-center mb-2">
            <Button variant="outline-secondary" size="sm" onClick={loadPrevious} disabled={loadingPrev}>
              {loadingPrev ? <Spinner size="sm" /> : 'تحميل الرسائل الأقدم'}
            </Button>
          </div>
        )}
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" />
            <div className="mt-2 text-muted">جارٍ تحميل المحادثة…</div>
          </div>
        ) : error ? (
          <div className="text-center py-4">
            <Alert variant="warning" className="mx-auto mb-3" style={{ maxWidth: 520 }}>
              {error}
            </Alert>
            <Button variant="outline-success" size="sm" onClick={requestHistory}>
              إعادة المحاولة
            </Button>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-muted py-5">ابدأ المحادثة…</div>
        ) : (
          messages.map((m) => {
            const mine = String(m.sender) === String(myId);
            const avatarSrc = m.senderProfileImage
              ? (m.senderProfileImage.startsWith('http') ? m.senderProfileImage : `/uploads/profileImages/${m.senderProfileImage}`)
              : '/default-avatar.png';

            return (
              <div
                key={m._id || m.tempId}
                className={`d-flex mb-2 ${mine ? 'justify-content-end' : 'justify-content-start'}`}
              >
                {!mine && (
                  <img
                    src={avatarSrc}
                    alt=""
                    className="bubble-avatar"
                    onError={(e) => { e.currentTarget.src = '/default-avatar.png'; }}
                  />
                )}
                <div className={`bubble ${mine ? 'mine' : 'theirs'}`}>
                  {!mine && <div className="bubble-name">{m.senderName || 'مستخدم'}</div>}
                  <div className="bubble-message" style={{ whiteSpace: 'pre-wrap' }}>{m.content}</div>
                  <div className="bubble-meta">
                    <span>{fmtTime(m.timestamp)}</span>
                    {mine && (
                      m.read ? (
                        <span className="tick tick-delivered">✓✓</span>
                      ) : (
                        <span className="tick tick-sent">✓</span>
                      )
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="card-footer bg-white">
        <Form onSubmit={sendMessage} className="chat">
          <Button type="submit" variant="success" disabled={!input.trim()} title="إرسال" className="px-5">
            {sending ? <Spinner size="sm" /> : <i className="fas fa-paper-plane" />}
          </Button>

          <Form.Control
            as="textarea"
            rows={1}
            className="chat-text"
            placeholder="اكتب رسالتك…"
            value={input}
            onChange={(e) => { setInput(e.target.value); sendTyping(); }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
          />
        </Form>
      </div>
    </div>
  );
};

ChatBox.propTypes = {
  conversationId: PropTypes.string.isRequired,
  recipientId: PropTypes.string.isRequired,
  className: PropTypes.string,
};

export default ChatBox;
