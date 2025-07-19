import React from 'react';
import { useParams } from 'react-router-dom';
import ChatBox from '../components/ChatBox';

const ChatPage = () => {
  const { recipientId } = useParams();

  return (
    <div className="container mt-4">
      <h4 className="text-center mb-3">
        <i className="fas fa-comments me-2 text-primary"></i>الدردشة مع صاحب الطلب
      </h4>
      <ChatBox recipientId={recipientId} />
    </div>
  );
};

export default ChatPage;
// This page is for the chat functionality, allowing users to communicate with each other.
// It uses the ChatBox component to handle the chat interface and logic.