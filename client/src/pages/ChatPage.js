import React, { useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import ChatBox from '../components/ChatBox';

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
      <h4 className="text-center mb-3">
        <i className="fas fa-comments me-2 text-primary"></i>
        الدردشة مع صاحب الطلب
      </h4>

      {conversationId ? (
        <ChatBox conversationId={conversationId} recipientId={recipientId} />
      ) : (
        <div className="alert alert-warning text-center">لا يمكن فتح المحادثة: معرفات ناقصة.</div>
      )}
    </div>
  );
};

export default ChatPage;
