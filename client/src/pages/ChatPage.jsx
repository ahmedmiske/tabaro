import React, { useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import ChatBox from '../components/ChatBox.jsx';

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
    <div className="container mt-4" dir="rtl">
      <h2 
        className="text-center mb-4" 
        style={{
          fontSize: '2.5rem',
          fontWeight: '700',
          background: 'linear-gradient(135deg, #4CAF50 0%, #66BB6A 50%, #388E3C 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          textShadow: '0 2px 4px rgba(0,0,0,0.1)',
          marginBottom: '1.5rem',
          position: 'relative',
          paddingBottom: '1rem'
        }}
      >
        <i className="fas fa-comments" style={{ 
          marginLeft: '0.75rem',
          color: '#4CAF50',
          WebkitTextFillColor: '#4CAF50'
        }}></i>
        الدردشة مع صاحب الطلب
        <div style={{
          position: 'absolute',
          bottom: '0',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '120px',
          height: '4px',
          background: 'linear-gradient(90deg, #4CAF50, #66BB6A, #388E3C)',
          borderRadius: '2px'
        }}></div>
      </h2>

      {conversationId ? (
       <ChatBox
  conversationId={conversationId}
  recipientId={recipientId}
  recipient={{ firstName: '...', profileImage: '...' }} // إذا توفر لديك
/>
      ) : (
        <div className="alert alert-warning text-center">لا يمكن فتح المحادثة: معرفات ناقصة.</div>
      )}
    </div>
  );
};

export default ChatPage;
