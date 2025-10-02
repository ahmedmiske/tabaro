import React, { useEffect, useState } from 'react';
import { ListGroup, Badge } from '../components/ui';
import { useNavigate } from 'react-router-dom';
import fetchWithInterceptors from '../services/fetchWithInterceptors';
import './ChatList.css';

const ChatList = () => {
  const [threads, setThreads] = useState([]);
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const fetchThreads = async () => {
      try {
        const res = await fetchWithInterceptors('/api/messages/threads');
        if (res.ok) setThreads(res.body || []);
      } catch (err) {
        console.error('❌ فشل في جلب المحادثات:', err.message);
      }
    };

    fetchThreads();
  }, []);

  const getOtherUser = (msg) => {
    if (!currentUser) return {};
    return msg.sender._id === currentUser._id ? msg.recipient : msg.sender;
  };

  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    return `${date.getDate()}/${date.getMonth() + 1} - ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  return (
    <div className="chat-list-page container mt-4">
      <h4 className="text-center mb-4">
        💬 قائمة المحادثات
      </h4>

      <ListGroup>
        {threads.map((msg, index) => {
          const other = getOtherUser(msg);
          return (
            <ListGroup.Item
              key={index}
              action
              className="d-flex justify-content-between align-items-center chat-item"
              onClick={() => navigate(`/chat/${other._id}`)}
            >
              <div>
                <div className="fw-bold">{other.firstName} {other.lastName}</div>
                <div className="text-muted small">{msg.content.slice(0, 50)}</div>
              </div>
              <div className="text-end">
                <small className="text-muted">{formatTime(msg.timestamp || msg.createdAt)}</small>
                {!msg.read && msg.recipient._id === currentUser._id && (
                  <Badge bg="success" className="ms-2">جديد</Badge>
                )}
              </div>
            </ListGroup.Item>
          );
        })}
      </ListGroup>
    </div>
  );
};

export default ChatList;
// This component represents the chat list page where users can see their recent chat threads.  