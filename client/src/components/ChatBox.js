// components/ChatBox.jsx
import React, { useEffect, useState } from 'react';
import fetchWithInterceptors from '../services/fetchWithInterceptors';
import { useParams } from 'react-router-dom';
import './ChatBox.css';

const ChatBox = ({ currentUserId, recipientId }) => {
  const { id: donationId } = useParams(); // donation ID for context if needed
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');

  // Load messages between current user and recipient
  const loadMessages = async () => {
    try {
      const res = await fetchWithInterceptors(
        `/api/messages?user1=${currentUserId}&user2=${recipientId}`
      );
      if (res.ok) setMessages(res.body);
    } catch (err) {
      console.error('Error loading chat messages:', err);
    }
  };

  // Send a new message
  const sendMessage = async () => {
    if (!newMsg.trim()) return;

    try {
      const res = await fetchWithInterceptors('/api/messages', {
        method: 'POST',
        body: JSON.stringify({
          sender: currentUserId,
          recipient: recipientId,
          content: newMsg,
        }),
      });

      if (res.ok) {
        setMessages((prev) => [...prev, res.body]); // append new message
        setNewMsg('');
      }
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  useEffect(() => {
    loadMessages(); // initial fetch
  }, []);

  return (
    <div className="chat-box-container">
      <div className="messages-area">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`message ${msg.sender === currentUserId ? 'sent' : 'received'}`}
          >
            {msg.content}
          </div>
        ))}
      </div>
      <div className="input-area">
        <input
          type="text"
          value={newMsg}
          onChange={(e) => setNewMsg(e.target.value)}
          placeholder="أكتب رسالتك هنا..."
        />
        <button onClick={sendMessage}>إرسال</button>
      </div>
    </div>
  );
};

export default ChatBox;
