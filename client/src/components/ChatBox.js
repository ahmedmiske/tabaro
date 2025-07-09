// components/ChatBox.jsx
import React, { useEffect, useState, useRef } from 'react';
import socket from '../socket';
import './ChatBox.css';

const ChatBox = ({ recipientId }) => {
  // ✅ Use recipientId prop to identify the chat recipient
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const [typing, setTyping] = useState(false);

  const messagesEndRef = useRef(null);
 // Get current user from localStorage
  const user = JSON.parse(localStorage.getItem('user'));
  const currentUserId = user?._id;
  const currentUserName = user?.firstName + ' ' + user?.lastName;
  // ✅ Format date as dd/MM/yyyy HH:mm
  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    const pad = (n) => n.toString().padStart(2, '0');
    return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    socket.on('receiveMessage', (message) => {
      setMessages(prev => [...prev, message]);
    });

    socket.on('messageSent', (message) => {
      setMessages(prev => [...prev, message]);
    });

    socket.on('typing', ({ senderId }) => {
      if (senderId === recipientId) {
        setTyping(true);
        setTimeout(() => setTyping(false), 2000);
      }
    });

    return () => {
      socket.off('receiveMessage');
      socket.off('messageSent');
      socket.off('typing');
    };
  }, [recipientId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = () => {
    if (!newMsg.trim()) return;

    socket.emit('sendMessage', {
      recipientId,
      content: newMsg
    });

    setNewMsg('');
  };

  const handleTyping = () => {
    socket.emit('typing', { recipientId });
  };

   if (!currentUserId) {
    return <p className="text-danger">⚠️ لا يمكن بدء المحادثة: المستخدم غير معروف</p>;
  }

 return (
    <div className="chat-box-container">
      <div className="messages-area">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`message ${msg.sender === currentUserId ? 'sent' : 'received'}`}
          >
            <div className="sender-name fw-bold mb-1">
              {msg.sender === currentUserId ? 'أنت' : msg.senderName || 'المستخدم'}
            </div>
            <div>{msg.content}</div>
            <div className="timestamp text-muted small mt-1">
              {formatDateTime(msg.timestamp)}
            </div>
          </div>
        ))}
        {typing && <div className="text-muted">...يكتب الآن</div>}
        <div ref={messagesEndRef} />
      </div>

      <div className="input-area mt-2">
        <input
          type="text"
          value={newMsg}
          onChange={(e) => setNewMsg(e.target.value)}
          onKeyDown={handleTyping}
          placeholder="أكتب رسالتك هنا..."
        />
        <button onClick={sendMessage}>إرسال</button>
      </div>
    </div>
  );
};


export default ChatBox;
// This component handles the chat box functionality including sending and receiving messages,
// displaying messages with timestamps, and showing typing status.