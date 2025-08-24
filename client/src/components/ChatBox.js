// src/components/ChatBox.js
import React, { useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Form, Button, Spinner } from 'react-bootstrap';
import { connectSocket, getSocket } from '../socket';

const fmtTime = (d) => {
  try {
    return new Date(d).toLocaleTimeString('ar-MA', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
};

const ChatBox = ({ recipientId, className = '' }) => {
  const [messages, setMessages] = useState([]);  // [{_id?, tempId?, content, sender, recipient, timestamp, pending?, senderName, senderProfileImage}]
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const listRef = useRef(null);
  const knownIdsRef = useRef(new Set());   // _id القادم من DB
  const knownTempRef = useRef(new Set());  // tempId للرسائل التفاؤلية
  const typingTimeoutRef = useRef(null);
  const typingSentAtRef = useRef(0);

  // token الحالي
  const token = useMemo(() => {
    const u = JSON.parse(localStorage.getItem('user') || '{}');
    return u?.token || localStorage.getItem('token') || localStorage.getItem('authToken') || null;
  }, []);

  // scroll لأسفل عند ورود رسائل
  const scrollToBottom = () => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  };
  useEffect(scrollToBottom, [messages]);

  // اتصال socket + الاشتراكات
  useEffect(() => {
    if (!token || !recipientId) return;
    const s = connectSocket(token);

    // طلب التاريخ
    s.emit('loadMessages', { recipientId, limit: 100 });

    const onHistory = (list) => {
      const normalized = (Array.isArray(list) ? list : []).map((m) => {
        if (m._id) knownIdsRef.current.add(String(m._id));
        return m;
      });
      setMessages(normalized);
      setLoading(false);
    };

    const onReceive = (msg) => {
      // منع التكرار
      if (msg?._id && knownIdsRef.current.has(String(msg._id))) return;
      if (msg?.tempId && knownTempRef.current.has(String(msg.tempId))) return;

      // استبدال التفاؤلي إذا جاء tempId مطابق
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
        return;
      }

      if (msg?._id) knownIdsRef.current.add(String(msg._id));
      setMessages((prev) => [...prev, { ...msg, pending: false }]);
    };

    const onSent = (msg) => {
      // تأكيد للمرسل ليستبدل التفاؤلي
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

    const onTyping = () => {
      setIsTyping(true);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 1200);
    };

    const onError = (payload) => {
      console.warn('[socket:error]', payload?.message || payload);
    };

    s.on('chatHistory', onHistory);
    s.on('receiveMessage', onReceive);
    s.on('messageSent', onSent);
    s.on('typing', onTyping);
    s.on('error', onError);

    return () => {
      s.off('chatHistory', onHistory);
      s.off('receiveMessage', onReceive);
      s.off('messageSent', onSent);
      s.off('typing', onTyping);
      s.off('error', onError);
    };
  }, [token, recipientId]);

  // إرسال مؤشر الكتابة (rate-limit)
  const sendTyping = () => {
    const now = Date.now();
    if (now - typingSentAtRef.current > 800) {
      typingSentAtRef.current = now;
      const s = getSocket();
      if (s?.connected && recipientId) s.emit('typing', { recipientId });
    }
  };

  // إرسال رسالة
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
      sender: me?._id || 'me',
      recipient: recipientId,
      content: text,
      timestamp: new Date().toISOString(),
      pending: true,
      senderName: `${me?.firstName || ''} ${me?.lastName || ''}`.trim() || 'أنا',
      senderProfileImage: me?.profileImage || '',
    };

    setMessages((prev) => [...prev, optimistic]);
    setInput('');
    setSending(true);

    s.emit('sendMessage', {
      recipientId,
      content: text,
      type: 'chat',
    });

    // fallback لإزالة pending إن لم يصل تأكيد
    setTimeout(() => {
      setMessages((prev) =>
        prev.map((m) => (m.tempId === tempId ? { ...m, pending: false } : m)),
      );
    }, 8000);

    setSending(false);
  };

  return (
    <div className={`chatbox card shadow-sm ${className}`} dir="rtl">
      <div className="card-header bg-white d-flex align-items-center justify-content-between">
        <div className="fw-bold">
          <i className="fas fa-comments ms-2 text-primary" />
          المحادثة
        </div>
        {isTyping && <small className="text-muted">يكتب الآن…</small>}
      </div>

      <div
        ref={listRef}
        className="card-body p-2"
        style={{ height: 360, overflowY: 'auto', background: '#fafafa' }}
      >
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" />
            <div className="mt-2 text-muted">جارٍ تحميل المحادثة…</div>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-muted py-5">ابدأ المحادثة…</div>
        ) : (
          messages.map((m) => {
            const myId = (JSON.parse(localStorage.getItem('user') || '{}')._id);
            const mine = m.sender === myId;
            return (
              <div
                key={m._id || m.tempId}
                className={`d-flex mb-2 ${mine ? 'justify-content-end' : 'justify-content-start'}`}
              >
                {!mine && (
                  <img
                    src={m.senderProfileImage || '/default-avatar.png'}
                    alt=""
                    style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', marginInlineEnd: 8 }}
                    onError={(e) => { e.currentTarget.src = '/default-avatar.png'; }}
                  />
                )}
                <div
                  className={`p-2 rounded-3 ${mine ? 'bg-primary text-white' : 'bg-white border'}`}
                  style={{ maxWidth: '76%' }}
                >
                  {!mine && <div className="small text-muted mb-1">{m.senderName || 'مستخدم'}</div>}
                  <div style={{ whiteSpace: 'pre-wrap' }}>{m.content}</div>
                  <div className={`small mt-1 ${mine ? 'text-white-50' : 'text-muted'}`}>
                    {fmtTime(m.timestamp)}
                    {m.pending && <span className="ms-2">…إرسال</span>}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="card-footer bg-white">
        <Form onSubmit={sendMessage} className="d-flex gap-2">
          <Form.Control
            as="textarea"
            rows={1}
            className="flex-grow-1"
            style={{ resize: 'none' }}
            placeholder="اكتب رسالتك…"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              sendTyping();
            }}
          />
          <Button type="submit" variant="success" disabled={!input.trim()} title="إرسال">
            {sending ? <Spinner size="sm" /> : <i className="fas fa-paper-plane" />}
          </Button>
        </Form>
      </div>
    </div>
  );
};

ChatBox.propTypes = {
  recipientId: PropTypes.string.isRequired,
  className: PropTypes.string,
};

export default ChatBox;
// client/src/components/Header.js