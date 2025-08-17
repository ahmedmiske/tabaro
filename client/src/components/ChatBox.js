import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import socket from '../socket';
import './ChatBox.css';

function getCurrentUser() {
  // 1) حاول تقرأ user من localStorage
  let user = null;
  try { user = JSON.parse(localStorage.getItem('user') || 'null'); } catch { user = null; }

  // 2) لو مافيش _id، فكّ الـ JWT وخُد id
  const token =
    localStorage.getItem('token') ||
    localStorage.getItem('authToken') ||
    sessionStorage.getItem('token');

  if ((!user || !user._id) && token && token.split('.').length === 3) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const id = payload?.id || payload?._id || payload?.userId;
      if (id) user = { ...(user || {}), _id: id };
    } catch {/* ignore */}
  }
  return user;
}

const ChatBox = ({ recipientId }) => {
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const [typing, setTyping] = useState(false);

  const messagesEndRef = useRef(null);
  const typingTickRef = useRef(0);

  const user = useMemo(getCurrentUser, []);
  const currentUserId = user?._id;

  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    const p = (n) => String(n).padStart(2, '0');
    return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}`;
  };

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const upsertMessage = useCallback((msg) => {
    setMessages((prev) => {
      const id = msg._id || msg.id || msg.tempId || `${msg.sender}-${msg.timestamp}-${(msg.content||'').slice(0,6)}`;
      const i = prev.findIndex(m => (m._id || m.id || m.tempId) === id);
      if (i >= 0) {
        const next = prev.slice(); next[i] = { ...prev[i], ...msg }; return next;
      }
      return [...prev, msg];
    });
  }, []);

  const isSameConversation = useCallback((msg) => {
    const s = msg.sender || msg.senderId;
    const r = msg.recipient || msg.recipientId;
    return (
      String(s) === String(currentUserId) && String(r) === String(recipientId)
    ) || (
      String(s) === String(recipientId) && String(r) === String(currentUserId)
    );
  }, [currentUserId, recipientId]);

  useEffect(() => {
    if (!recipientId || !currentUserId) return;

    socket.emit('loadMessages', { recipientId, currentUserId, limit: 50 });

    const onChatHistory = (msgs = []) => setMessages(msgs.filter(isSameConversation));
    const onReceive = (msg) => { if (isSameConversation(msg)) upsertMessage(msg); };
    const onSent    = (msg) => { if (isSameConversation(msg)) upsertMessage(msg); };
    const onTyping  = ({ senderId }) => {
      if (String(senderId) === String(recipientId)) {
        setTyping(true);
        const t = setTimeout(() => setTyping(false), 2000);
        return () => clearTimeout(t);
      }
    };

    socket.on('chatHistory', onChatHistory);
    socket.on('receiveMessage', onReceive);
    socket.on('messageSent', onSent);
    socket.on('typing', onTyping);

    return () => {
      socket.off('chatHistory', onChatHistory);
      socket.off('receiveMessage', onReceive);
      socket.off('messageSent', onSent);
      socket.off('typing', onTyping);
    };
  }, [recipientId, currentUserId, isSameConversation, upsertMessage]);

  useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

  const sendMessage = useCallback(() => {
    const content = newMsg.trim();
    if (!content || !recipientId || !currentUserId) return;

    const tempId = `tmp-${Date.now()}`;
    upsertMessage({
      tempId,
      sender: currentUserId,
      recipient: recipientId,
      content,
      timestamp: new Date().toISOString(),
      senderName: user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'أنت',
      senderProfileImage: user?.profileImage
    });

    socket.emit('sendMessage', { recipientId, content, tempId });
    setNewMsg('');
  }, [newMsg, recipientId, currentUserId, user, upsertMessage]);

  const handleTyping = useCallback(() => {
    const now = Date.now();
    if (now - typingTickRef.current > 1200 && recipientId && currentUserId) {
      typingTickRef.current = now;
      socket.emit('typing', { recipientId, senderId: currentUserId });
    }
  }, [recipientId, currentUserId]);

  const onInputKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); sendMessage(); return;
    }
    handleTyping();
  }, [sendMessage, handleTyping]);

  const getAvatarUrl = (msg) => {
    if (msg.senderProfileImage) return `/uploads/profileImages/${msg.senderProfileImage}`;
    const name = msg.senderName
      || (msg.senderDetails ? `${msg.senderDetails.firstName} ${msg.senderDetails.lastName}` : 'User');
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;
  };

  // ✅ لو المستخدم غير معروف: أعرض دعوة لتسجيل الدخول
  if (!currentUserId) {
    return (
      <div className="chat-box-container">
        <p className="text-danger mb-2">⚠️ لا يمكن بدء المحادثة: المستخدم غير معروف</p>
        <Link to="/login" className="btn btn-primary btn-sm">تسجيل الدخول</Link>
      </div>
    );
  }

  return (
    <div className="chat-box-container">
      <div className="messages-area">
        {messages.map((msg) => {
          const key = msg._id || msg.id || msg.tempId;
          const isSent = String(msg.sender) === String(currentUserId);
          const time = msg.timestamp || msg.createdAt || msg.updatedAt;
          return (
            <div key={key} className={`message-bubble ${isSent ? 'sent' : 'received'}`}>
              <div className="bubble-content">
                <div className="bubble-header">
                  <img src={getAvatarUrl(msg)} alt="avatar" className="bubble-avatar" />
                  <div className="bubble-name">
                    {isSent ? 'أنت'
                      : msg.senderName
                      || (msg.senderDetails ? `${msg.senderDetails.firstName} ${msg.senderDetails.lastName}` : 'مستخدم')}
                  </div>
                </div>
                <div className="bubble-message">{msg.content}</div>
                <div className="bubble-time">{formatDateTime(time)}</div>
              </div>
            </div>
          );
        })}
        {typing && <div className="text-muted mt-2">...يكتب الآن</div>}
        <div ref={messagesEndRef} />
      </div>

      <div className="input-area mt-2">
        <textarea
          rows={1}
          value={newMsg}
          onChange={(e) => setNewMsg(e.target.value)}
          onKeyDown={onInputKeyDown}
          onInput={handleTyping}
          placeholder="اكتب رسالتك هنا... (Enter للإرسال، Shift+Enter لسطر جديد)"
        />
        <button onClick={sendMessage} disabled={!newMsg.trim()}>إرسال</button>
      </div>
    </div>
  );
};

export default ChatBox;
