import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import socket from '../socket';
import './ChatBox.css';

const ChatBox = ({ recipientId }) => {
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const [typing, setTyping] = useState(false);

  const messagesEndRef = useRef(null);
  const typingTickRef = useRef(0);
  const user = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
  }, []);
  const currentUserId = user?._id;

  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const pad = (n) => n.toString().padStart(2, '0');
    return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
  };

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // إدراج/تحديث رسالة بدون تكرار
  const upsertMessage = useCallback((msg) => {
    setMessages((prev) => {
      const id = msg._id || msg.id || msg.tempId || `${msg.sender}-${msg.timestamp}-${msg.content?.slice(0,6)}`;
      const existsAt = prev.findIndex(m => (m._id || m.id || m.tempId) === id);
      if (existsAt >= 0) {
        const next = prev.slice();
        next[existsAt] = { ...prev[existsAt], ...msg };
        return next;
      }
      return [...prev, msg];
    });
  }, []);

  // تحقّق أن الرسالة تخص نفس المحادثة
  const isSameConversation = useCallback((msg) => {
    const s = msg.sender || msg.senderId;
    const r = msg.recipient || msg.recipientId;
    const mine = String(currentUserId);
    const peer = String(recipientId);
    return (
      (String(s) === mine && String(r) === peer) ||
      (String(s) === peer && String(r) === mine)
    );
  }, [currentUserId, recipientId]);

  useEffect(() => {
    if (!recipientId || !currentUserId) return;

    // طلب تاريخ المحادثة
    socket.emit('loadMessages', { recipientId, currentUserId, limit: 50 });

    const onChatHistory = (msgs = []) => {
      // فلترة احترازية إن لم يكن السيرفر يفعلها
      const safe = msgs.filter(isSameConversation);
      setMessages(safe);
    };

    const onReceive = (msg) => {
      if (isSameConversation(msg)) upsertMessage(msg);
    };

    const onSent = (msg) => {
      if (isSameConversation(msg)) upsertMessage(msg);
    };

    const onTyping = ({ senderId }) => {
      if (String(senderId) === String(recipientId)) {
        setTyping(true);
        // أخفي المؤشر بعد ثانيتين
        const t = setTimeout(() => setTyping(false), 2000);
        // تنظيف التايمر في حال توالت الإشعارات
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

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const sendMessage = useCallback(() => {
    const content = newMsg.trim();
    if (!content || !recipientId || !currentUserId) return;

    // تفاؤليًا: أضف رسالة مؤقتة حتى يأتي تأكيد السيرفر
    const tempId = `tmp-${Date.now()}`;
    const optimistic = {
      tempId,
      sender: currentUserId,
      recipient: recipientId,
      content,
      timestamp: new Date().toISOString(),
      senderName: user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'أنت',
      senderProfileImage: user?.profileImage
    };
    upsertMessage(optimistic);

    socket.emit('sendMessage', { recipientId, content, tempId });
    setNewMsg('');
  }, [newMsg, recipientId, currentUserId, upsertMessage, user]);

  const handleTyping = useCallback(() => {
    // throttle كل 1200ms لتقليل الزحمة
    const now = Date.now();
    if (now - typingTickRef.current > 1200 && recipientId) {
      typingTickRef.current = now;
      socket.emit('typing', { recipientId, senderId: currentUserId });
    }
  }, [recipientId, currentUserId]);

  const onInputKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
      return;
    }
    handleTyping();
  }, [sendMessage, handleTyping]);

  const getAvatarUrl = (msg) => {
    if (msg.senderProfileImage) {
      return `/uploads/profileImages/${msg.senderProfileImage}`;
    }
    const name =
      msg.senderName ||
      (msg.senderDetails ? `${msg.senderDetails.firstName} ${msg.senderDetails.lastName}` : 'User');
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;
  };

  if (!currentUserId) {
    return <p className="text-danger">⚠️ لا يمكن بدء المحادثة: المستخدم غير معروف</p>;
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
                    {isSent
                      ? 'أنت'
                      : msg.senderName ||
                        (msg.senderDetails
                          ? `${msg.senderDetails.firstName} ${msg.senderDetails.lastName}`
                          : 'مستخدم')}
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
