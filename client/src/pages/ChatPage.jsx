// src/pages/ChatPage.jsx
import React, { useMemo, useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import ChatBox from '../components/ChatBox.jsx';
import fetchWithInterceptors from '../services/fetchWithInterceptors';
import './ChatPage.css';

const getMyId = () => {
  try {
    return JSON.parse(localStorage.getItem('user') || '{}')._id || null;
  } catch {
    return null;
  }
};

const ChatPage = () => {
  const { recipientId } = useParams();
  const [qs] = useSearchParams();
  const reqId = qs.get('req');
  const offId = qs.get('off');

  const myId = useMemo(getMyId, []);
  const [recipient, setRecipient] = useState(null);

  // جلب بيانات المستخدم الآخر (لتمريرها للـ ChatBox)
  useEffect(() => {
    if (!recipientId) return;
    fetchWithInterceptors(`/api/users/${recipientId}`)
      .then((res) => {
        if (res.ok) setRecipient(res.body?.data || res.body);
      })
      .catch(() => {});
  }, [recipientId]);

  const conversationId = useMemo(() => {
    if (!myId || !recipientId) return null;
    const pair = [String(myId), String(recipientId)].sort().join(':');
    if (reqId) return `req:${reqId}:${pair}`;
    if (offId) return `off:${offId}:${pair}`;
    return `dm:${pair}`;
  }, [myId, recipientId, reqId, offId]);

  return (
    <div className="chat-page-container">
      {conversationId ? (
        <ChatBox
          conversationId={conversationId}
          recipientId={recipientId}
          recipient={recipient}
        />
      ) : (
        <div className="chat-unavailable-alert">
          لا يمكن فتح المحادثة: معرفات ناقصة
        </div>
      )}
    </div>
  );
};

export default ChatPage;
