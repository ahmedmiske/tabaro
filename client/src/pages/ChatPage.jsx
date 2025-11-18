import React, { useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import ChatBox from '../components/ChatBox.jsx';
import './ChatPage.css';

const getMyId = () => {
  try { return JSON.parse(localStorage.getItem('user') || '{}')._id || null; }
  catch { return null; }
};

const ChatPage = () => {
  // /chat/:recipientId?req=<requestId> أو /chat/:recipientId?off=<offerId>
  const { recipientId } = useParams();
  const [qs] = useSearchParams();
  const reqId = qs.get('req');
  const offId = qs.get('off');

  const myId = useMemo(getMyId, []);
  const conversationId = useMemo(() => {
    if (!myId || !recipientId) return null;
    const pair = [String(myId), String(recipientId)].sort().join(':');
    if (reqId) return `req:${reqId}:${pair}`;
    if (offId) return `off:${offId}:${pair}`;
    return `dm:${pair}`;
  }, [myId, recipientId, reqId, offId]);

  return (
    <div className="chat-page-container">
      <div className="chat-page-title">
        <h2>
          <i className="fas fa-comments chat-page-title-icon"></i>
          الدردشة مع صاحب الطلب
        </h2>
        <div className="chat-page-title-underline"></div>
      </div>

      {conversationId ? (
        <ChatBox
          conversationId={conversationId}
          recipientId={recipientId}
          recipient={{ firstName: '...', profileImage: '...' }}
        />
      ) : (
        <div className="chat-unavailable-alert">
          <i className="fas fa-exclamation-triangle" style={{ marginLeft: '0.5rem' }}></i>
          لا يمكن فتح المحادثة: معرفات ناقصة
        </div>
      )}
    </div>
  );
};

export default ChatPage;
