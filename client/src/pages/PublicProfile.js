import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Card, Button, Spinner, Alert, Image, Badge } from '../components/ui';
import fetchWithInterceptors from '../services/fetchWithInterceptors';
import './PublicProfile.css';

const API_BASE =
  process.env.REACT_APP_API_ORIGIN ||
  process.env.REACT_APP_API_URL ||
  'http://localhost:5000';

const resolveAvatar = (p) => {
  if (!p) return '/default-avatar.png';
  if (/^https?:\/\//i.test(p)) return p;
  const path = p.startsWith('/uploads/') ? p : `/uploads/profileImages/${p}`;
  return `${API_BASE}${path}`.replace(/([^:]\/)\/+/g, '$1');
};

export default function PublicProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [user,    setUser]    = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true); setError(''); setUser(null);
      try {
        const res = await fetchWithInterceptors(`/api/public/users/${id}`);
        if (res?.ok && (res.body || res.data)) {
          setUser(res.body?.data || res.body || res.data);
        } else {
          setError('تعذّر تحميل الملف الشخصي.');
        }
      } catch {
        setError('تعذّر تحميل الملف الشخصي.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const back  = () => navigate(location.state?.from || -1);
  const chat  = () => navigate(`/chat/${id}`);

  if (loading) {
    return <div className="p-4 text-center text-muted"><Spinner animation="border" size="sm" /> جاري التحميل...</div>;
  }
  if (error) {
    return (
      <div className="container py-3 public-profile">
        <div className="top-actions"><Button variant="outline-secondary" onClick={back}>⬅ رجوع</Button></div>
        <Alert className="mt-3" variant="danger">{error}</Alert>
      </div>
    );
  }

  const first = user?.firstName || user?.name || '';
  const last  = user?.lastName || '';
  const full  = `${first} ${last}`.trim() || 'مستخدم';

  return (
    <div className="container py-3 public-profile">
      <div className="top-actions"><Button variant="outline-secondary" onClick={back}>⬅ رجوع</Button></div>

      <Card className="shadow-sm pp-card">
        <Card.Body>
          <div className="pp-header">
            <Image
              src={resolveAvatar(user?.profileImage)}
              onError={(e) => (e.currentTarget.src = '/default-avatar.png')}
              roundedCircle width={96} height={96} alt="avatar"
            />
            <div className="pp-meta">
              <div className="pp-name">{full}</div>
              {user?.email && <div className="pp-sub">{user.email}</div>}
              {user?.phoneNumber && <div className="pp-sub">📞 {user.phoneNumber}</div>}
              {typeof user?.averageRating === 'number' && (
                <div className="pp-sub"><Badge bg="warning" text="dark">⭐ {user.averageRating.toFixed(1)}</Badge></div>
              )}
              <div className="pp-actions">
                <Button variant="primary" onClick={chat}>💬 مراسلة</Button>
              </div>
            </div>
          </div>

          {user?.bio && (
            <div className="pp-section">
              <div className="pp-title">نبذة</div>
              <p className="prewrap">{user.bio}</p>
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
}
