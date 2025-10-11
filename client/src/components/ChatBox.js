import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/ar';
import { Spinner } from 'react-bootstrap';
import { FiSend, FiPaperclip, FiChevronDown, FiCheck, FiCheckSquare } from 'react-icons/fi';
import { io } from 'socket.io-client';
import fetchWithInterceptors from '../services/fetchWithInterceptors';
import './ChatBox.css';

dayjs.extend(relativeTime);
dayjs.locale('ar');

const API_BASE =
  process.env.REACT_APP_API_ORIGIN ||
  process.env.REACT_APP_API_URL ||
  'http://localhost:5000';

const resolveAvatar = (p) => {
  if (!p) return '/default-avatar.png';
  if (/^https?:\/\//i.test(p)) return p;
  const path = p.startsWith('/uploads/') ? p : `/uploads/profileImages/${p}`;
  return `${API_BASE}${path}`.replace(/([^:]\/)\/+/g, '$1');
};

const getMe = () => {
  try { return JSON.parse(localStorage.getItem('user') || '{}'); }
  catch { return {}; }
};
const getToken = () => {
  try { return localStorage.getItem('token') || ''; }
  catch { return ''; }
};

function ChatBox({ conversationId, recipientId, recipient }) {
  const me = useMemo(getMe, []);
  const token = useMemo(getToken, []);
  const myId = me?._id || null;

  const [socket, setSocket] = useState(null);

  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [moreLoading, setMoreLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);

  const [typing, setTyping] = useState(false);
  const [selfTyping, setSelfTyping] = useState(false);
  const [attachment, setAttachment] = useState(null);

  const viewportRef = useRef(null);
  const endRef = useRef(null);
  const oldestCursorRef = useRef(null); // ISO أو _id من السيرفر
  const focusedRef = useRef(true);

  // ===== تهيئة Socket.io
  useEffect(() => {
    const s = io(API_BASE, {
      transports: ['websocket'],
      auth: { token },
    });
    setSocket(s);
    return () => { s.disconnect(); };
  }, [token]);

  // ===== الانضمام للغرفة + تحميل السجل
  const joinAndLoad = useCallback((first = false) => {
    if (!socket || !recipientId) return;
    socket.emit('joinConversation', { conversationId });

    // أول تحميل أو تحميل إضافي (before=cursor)
    const payload = {
      conversationId,
      recipientId,
      limit: 30,
      ...(first ? {} : (oldestCursorRef.current ? { before: oldestCursorRef.current } : {})),
    };
    socket.emit('loadMessages', payload);
  }, [socket, conversationId, recipientId]);

  useEffect(() => {
    if (!socket) return;
    setLoading(true);
    joinAndLoad(true);
    return () => {
      socket.emit('leaveConversation', { conversationId });
    };
  }, [socket, conversationId, joinAndLoad]);

  // ===== استقبال السجل والرسائل والأحداث
  useEffect(() => {
    if (!socket) return;

    const onHistory = ({ conversationId: conv, messages }) => {
      // messages آتية بالأحدث أخيرًا (حسب كودك)
      const items = Array.isArray(messages) ? messages : [];
      // حدّث اللائحة
      setList((prev) => {
        // لو كان هذا استرجاعًا “أقدم” (scroll up) نضيفها في البداية
        // نميّز ذلك بوجود cursor سابق
        if (oldestCursorRef.current) {
          return [...items, ...prev];
        }
        return items;
      });

      // حدّث المؤشر للأقدم: نأخذ timestamp أو _id من أول عنصر
      if (items.length > 0) {
        const first = items[0];
        oldestCursorRef.current = first.timestamp || first._id;
      }
      setHasMore(items.length >= 30);
      setLoading(false);

      // مرّر لآخر رسالة عند أول تحميل
      if (!oldestCursorRef.current || items.length < 30) {
        setTimeout(() => endRef.current?.scrollIntoView({ behavior: 'auto' }), 0);
      }
    };

    const onReceive = (m) => {
      // تصل للمستلم عبر io.to(recipientId)
      setList((prev) => [...prev, m]);
      setTimeout(() => endRef.current?.scrollIntoView({ behavior: 'smooth' }), 0);
    };

    const onSentAck = (m) => {
      // تأكيد للمرسل. لو أرسلنا tempId يمكن استبداله، هنا نضيف/نحدّث
      setList((prev) => {
        // لو سبق وضعنا رسالة مؤقتة يمكن مطابقتها بـ tempId
        if (m.tempId) {
          const idx = prev.findIndex(x => x.tempId === m.tempId);
          if (idx >= 0) {
            const copy = [...prev];
            copy[idx] = { ...m, status: 'sent' };
            return copy;
          }
        }
        return [...prev, { ...m, status: 'sent' }];
      });
      setTimeout(() => endRef.current?.scrollIntoView({ behavior: 'smooth' }), 0);
    };

    const onTyping = ({ conversationId: convId, from }) => {
      if (convId !== conversationId || from === myId) return;
      setTyping(true);
      setTimeout(() => setTyping(false), 1500);
    };

    const onRead = ({ conversationId: convId, messageIds }) => {
      if (convId !== conversationId) return;
      setList(prev => prev.map(m => (messageIds.includes(String(m._id)) ? { ...m, read: true } : m)));
    };

    const onErr = (e) => { /* يمكن إظهار toast */ console.warn('WS error:', e?.message); };

    socket.on('chatHistory', onHistory);
    socket.on('receiveMessage', onReceive);
    socket.on('messageSent', onSentAck);
    socket.on('typing', onTyping);
    socket.on('messagesRead', onRead);
    socket.on('ws:error', onErr);

    return () => {
      socket.off('chatHistory', onHistory);
      socket.off('receiveMessage', onReceive);
      socket.off('messageSent', onSentAck);
      socket.off('typing', onTyping);
      socket.off('messagesRead', onRead);
      socket.off('ws:error', onErr);
    };
  }, [socket, conversationId, myId]);

  // ===== تعليم كمقروء عند العرض/التركيز
  const markReadAll = useCallback(() => {
    if (!socket) return;
    const unreadIds = list.filter(m => m.recipient === myId && !m.read).map(m => String(m._id));
    if (unreadIds.length) socket.emit('markRead', { messageIds: unreadIds });
  }, [socket, list, myId]);

  useEffect(() => {
    const onFocus = () => { focusedRef.current = true; markReadAll(); };
    const onBlur = () => { focusedRef.current = false; };
    const onVisible = () => { if (document.visibilityState === 'visible') { focusedRef.current = true; markReadAll(); } };
    window.addEventListener('focus', onFocus);
    window.addEventListener('blur', onBlur);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('blur', onBlur);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [markReadAll]);

  useEffect(() => {
    // كلما وصلت رسائل جديدة، علّم كمقروء (إن كنا على المحادثة)
    markReadAll();
  }, [list.length, markReadAll]);

  // ===== تحميل أقدم عند السحب للأعلى
  const onScroll = (e) => {
    const el = e.currentTarget;
    if (el.scrollTop < 40 && hasMore && !moreLoading) {
      const prevHeight = el.scrollHeight;
      setMoreLoading(true);
      joinAndLoad(false);
      setTimeout(() => {
        // بعد وصول history handler سيزيد الارتفاع؛ نضبط الموضع
        const diff = e.currentTarget.scrollHeight - prevHeight;
        el.scrollTop = diff + el.scrollTop;
        setMoreLoading(false);
      }, 350);
    }
  };

  // ===== إرسال
  const send = () => {
    const body = text.trim();
    if (!socket || !body) return;

    const tempId = `tmp-${Date.now()}`;
    // إظهار متفائلًا
    setList(prev => [
      ...prev,
      {
        _id: tempId,
        tempId,
        conversationId,
        sender: myId,
        recipient: recipientId,
        content: body,
        timestamp: new Date().toISOString(),
        read: false,
        status: 'sending',
        senderName: `${me.firstName || ''} ${me.lastName || ''}`.trim() || 'أنا',
        senderProfileImage: me.profileImage || '',
      },
    ]);
    setText('');
    setSelfTyping(false);
    setTimeout(() => endRef.current?.scrollIntoView({ behavior: 'smooth' }), 0);

    socket.emit('sendMessage', {
      conversationId,
      recipientId,
      content: body,
      tempId,
    });
  };

  // Enter للإرسال
  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    } else {
      // typing إشارة
      if (socket) socket.emit('typing', { conversationId });
    }
  };

  // ===== اسم وصورة المخاطَب في الهيدر
  const [peer, setPeer] = useState(recipient || null);

  // لو ما وصل recipient كـ prop، حاوِل استنتاجه: إمّا من الرسائل (أول رسالة من الطرف الآخر)
  // أو من API بسيط /api/users/:id
  useEffect(() => {
    if (recipient && (recipient.firstName || recipient.name || recipient.fullName)) {
      setPeer(recipient);
      return;
    }
    // جرّب من الرسائل
    const otherMsg = list.find(m => m.sender && String(m.sender) !== String(myId));
    if (otherMsg && (otherMsg.senderName || otherMsg.senderProfileImage)) {
      setPeer({
        firstName: otherMsg.senderName,
        profileImage: otherMsg.senderProfileImage,
      });
      return;
    }
    // API fallback (غيّر المسار حسب مشروعك)
    let stop = false;
    (async () => {
      try {
        const { ok, body } = await fetchWithInterceptors(`/api/users/${recipientId}`);
        if (ok && !stop) {
          const u = body?.data || body || {};
          setPeer({
            firstName: `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.name || u.fullName || 'المستخدم',
            profileImage: u.profileImage || '',
          });
        }
      } catch { /* ignore */ }
    })();
    return () => { stop = true; };
  }, [recipient, list, myId, recipientId]);

  // ===== عنصر رسالة (يتوافق مع socket.js)
  const renderMsg = (m) => {
    const mine = String(m.sender) === String(myId);
    const cls = `msg ${mine ? 'mine' : 'theirs'}`;
    const time = m.timestamp ? dayjs(m.timestamp).fromNow() : '';
    const avatarSrc = mine
      ? resolveAvatar(me?.profileImage || m.senderProfileImage)
      : resolveAvatar(m.senderProfileImage);

    return (
      <div className={cls} key={m._id || m.tempId}>
        {!mine && (
          <img className="avatar" src={avatarSrc} alt="" onError={(e)=> (e.currentTarget.src='/default-avatar.png')} />
        )}

        <div className="bubble">
          {m.content && <div className="text">{m.content}</div>}
          {m.attachment && (
            <div className="att">
              <FiPaperclip /> <span className="name">{m.attachment.name || 'ملف'}</span>
            </div>
          )}
          <div className="meta">
            <span className="time">{time}</span>
            {mine && (
              <span className="status" title={m.read ? 'مقروءة' : (m.status === 'sending' ? 'جاري الإرسال' : 'مرسلة')}>
                {m.read ? <FiCheckSquare /> : (m.status === 'sending' ? <Spinner animation="border" size="sm" /> : <FiCheck />)}
              </span>
            )}
          </div>
        </div>

        {mine && (
          <img className="avatar" src={avatarSrc} alt="" onError={(e)=> (e.currentTarget.src='/default-avatar.png')} />
        )}
      </div>
    );
  };

  return (
    <div className="chatbox" dir="rtl">
      <div className="chat-header">
        <div className="who">
          <img
            src={resolveAvatar(peer?.profileImage)}
            alt=""
            onError={(e)=> (e.currentTarget.src='/default-avatar.png')}
          />
          <div className="who-text">
            <div className="name">{peer?.firstName || peer?.fullName || peer?.name || 'المستخدم'}</div>
            <div className={`typing ${typing ? 'show' : ''}`}>{typing ? 'يكتب الآن…' : '\u00A0'}</div>
          </div>
        </div>
        <button className="jump" title="الانتقال لآخر رسالة" onClick={() => endRef.current?.scrollIntoView({ behavior:'smooth' })}>
          <FiChevronDown />
        </button>
      </div>

      <div className="chat-viewport" ref={viewportRef} onScroll={onScroll}>
        {moreLoading && (
          <div className="more-loading"><Spinner animation="border" size="sm" /> تحميل رسائل أقدم…</div>
        )}
        {loading ? (
          <div className="loading"><Spinner animation="border" /> جاري التحميل…</div>
        ) : (
          list.map(renderMsg)
        )}
        <div ref={endRef} />
      </div>

      <div className="chat-input">
        <label className="attach" title="إرفاق">
          <input
            type="file"
            style={{ display: 'none' }}
            onChange={(e) => setAttachment(e.target.files?.[0] || null)}
          />
          <FiPaperclip />
        </label>
        {attachment && (
          <div className="attach-preview" title={attachment.name}>
            <FiPaperclip /> <span>{attachment.name}</span>
            <button className="clear" onClick={() => setAttachment(null)} aria-label="إزالة المرفق">×</button>
          </div>
        )}
        <textarea
          value={text}
          onChange={(e) => { setText(e.target.value); setSelfTyping(true); if (socket) socket.emit('typing', { conversationId }); }}
          onKeyDown={onKeyDown}
          placeholder="اكتب رسالتك…"
          rows={1}
        />
        <button className="send" onClick={send} disabled={!text.trim() || sending} aria-label="إرسال">
          {sending ? <Spinner animation="border" size="sm" /> : <FiSend />}
        </button>
      </div>
    </div>
  );
}

ChatBox.propTypes = {
  conversationId: PropTypes.string.isRequired,
  recipientId: PropTypes.string.isRequired,
  recipient: PropTypes.shape({
    profileImage: PropTypes.string,
    name: PropTypes.string,
    fullName: PropTypes.string,
    firstName: PropTypes.string,
  }),
};
ChatBox.defaultProps = { recipient: null };

export default ChatBox;
