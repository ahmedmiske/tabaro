import React, { useEffect, useMemo, useState } from 'react';
import fetchWithInterceptors from '../services/fetchWithInterceptors';
import { ListGroup, Dropdown, Button, Image, Badge } from 'react-bootstrap';
import './NotificationsPage.css';
import { useNavigate } from 'react-router-dom';

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

const fmtDateTime = (s) =>
  s
    ? new Date(s).toLocaleString('ar-MA', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

/** استنتاج مسار التفاصيل لطلبات/عروض التبرع */
const buildDetailsRoute = (n) => {
  if (n?.meta?.route) return n.meta.route;

  // لو السيرفر يرسل نوع الطلب داخل meta
  const kind = n?.meta?.requestType || n?.meta?.kind || n?.meta?.category;

  // إشعار "عرض" على طلب تبرع بالدم
  if (n.type === 'offer' && (kind === 'blood' || n?.meta?.blood === true)) {
    return `/blood-donation-details/${n.referenceId}`;
  }

  // أي إشعار عرض/تبرع عام (أو fallback)
  if (n.type === 'offer' || n.type === 'donation' || n.type === 'general') {
    return `/donations/${n.referenceId || ''}`;
  }

  // إن لم يكن تبرعًا، عند الحاجة يمكن إبقاءه دون route
  return n.referenceId ? `/donations/${n.referenceId}` : null;
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    const res = await fetchWithInterceptors('/api/notifications');
    if (res.ok) setNotifications(res.body?.data || res.body || []);
  };

  const markAsRead = async (id) => {
    try {
      await fetchWithInterceptors(`/api/notifications/${id}/read`, { method: 'PATCH' });
    } catch {}
  };

  // تعليم مجموعة رسائل مرسل واحد كمقروءة
  const markThreadAsRead = async (ids = []) => {
    try {
      await Promise.all(ids.map((id) =>
        fetchWithInterceptors(`/api/notifications/${id}/read`, { method: 'PATCH' })
      ));
    } catch {}
  };

  useEffect(() => {
    fetchNotifications();
    const t = setInterval(fetchNotifications, 30000);
    return () => clearInterval(t);
  }, []);

  // ====== تجميع الرسائل حسب المُرسِل (threads) ======
  const { messageThreads, others } = useMemo(() => {
    const threadsMap = new Map();
    const rest = [];

    (notifications || []).forEach((n) => {
      const t = n.type || 'system';
      if (t !== 'message') {
        rest.push(n);
        return;
      }
      const senderId =
        n.sender?._id || n.senderId || n.meta?.senderId || 'unknown';
      const key = String(senderId);

      const entry = threadsMap.get(key) || {
        senderId: key,
        sender: n.sender || null,
        ids: [],
        unreadCount: 0,
        lastMessage: '',
        lastCreatedAt: 0,
        lastNotificationId: null,
      };

      entry.ids.push(n._id);
      if (!n.read) entry.unreadCount += 1;

      const createdAt = new Date(n.createdAt || 0).getTime();
      if (createdAt >= entry.lastCreatedAt) {
        entry.lastCreatedAt = createdAt;
        entry.lastMessage = n.message || n.title || '';
        entry.lastNotificationId = n._id;
        entry.sender = n.sender || entry.sender;
      }

      threadsMap.set(key, entry);
    });

    // حوّلها لمصفوفة مرتبة بالأحدث
    const messageThreadsArr = Array.from(threadsMap.values()).sort(
      (a, b) => b.lastCreatedAt - a.lastCreatedAt
    );

    return { messageThreads: messageThreadsArr, others: rest };
  }, [notifications]);

  // ====== تطبيق الفلترة ======
  const viewModel = useMemo(() => {
    if (filter === 'message') {
      return { mode: 'messageOnly', threads: messageThreads, items: [] };
    }
    if (filter === 'offer' || filter === 'system' || filter === 'donation' || filter === 'general') {
      const items = (others || []).filter((n) => (n.type || 'system') === filter);
      return { mode: 'othersOnly', threads: [], items };
    }
    // all: أعرض قسم للرسائل (threads) + قسم للإشعارات الأخرى
    return { mode: 'all', threads: messageThreads, items: others };
  }, [filter, messageThreads, others]);

  // ====== أحداث الضغط ======
  const openChat = async (thread) => {
    if (!thread?.senderId || thread.senderId === 'unknown') return;
    // علم كل رسائل هذا المرسل كمقروءة
    await markThreadAsRead(thread.ids);
    // انتقل إلى المحادثة
    navigate(`/chat/${thread.senderId}`);
    // حدّث القائمة
    fetchNotifications();
  };

  const openDetails = async (n) => {
    const route = buildDetailsRoute(n);
    if (!n.read) {
      await markAsRead(n._id);
      fetchNotifications();
    }
    if (route) navigate(route);
  };

  // ====== العرض ======
  return (
    <div className="container-notifications">
      <h3 className="text-center mb-3 fw-bold text-secondary">🔔 جميع الإشعارات</h3>

      <div className="filter-notifications d-flex justify-content-end mb-3">
        <Dropdown className="filter-notifications-dropdown">
          <Dropdown.Toggle className="dropdown" variant="outline-secondary" id="filter-dropdown">
            {filter === 'all'
              ? 'تصفية: الكل'
              : filter === 'message'
              ? 'تصفية: رسائل'
              : filter === 'offer'
              ? 'تصفية: عروض'
              : filter === 'system'
              ? 'تصفية: نظام'
              : `تصفية: ${filter}`}
          </Dropdown.Toggle>
          <Dropdown.Menu className="dropdown-menu">
            <Dropdown.Item onClick={() => setFilter('all')}>الكل</Dropdown.Item>
            <Dropdown.Item onClick={() => setFilter('message')}>رسائل</Dropdown.Item>
            <Dropdown.Item onClick={() => setFilter('offer')}>عروض</Dropdown.Item>
            <Dropdown.Item onClick={() => setFilter('system')}>نظام</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>

      {/* ===== وضع: الكل ===== */}
      {viewModel.mode === 'all' && (
        <>
          {/* قسم الرسائل (threads) */}
          <h6 className="section-heading">الرسائل</h6>
          <ListGroup className="notification-list">
            {viewModel.threads.length === 0 ? (
              <div className="text-muted small p-2">لا توجد رسائل.</div>
            ) : (
              viewModel.threads.map((th) => (
                <ListGroup.Item
                  key={th.senderId}
                  className={`notification-item thread-item shadow-sm p-3 mb-3 rounded ${
                    th.unreadCount > 0 ? 'unread' : ''
                  }`}
                  onClick={() => openChat(th)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="d-flex align-items-start gap-3">
                    <Image
                      src={resolveAvatar(th.sender?.profileImage)}
                      onError={(e) => (e.currentTarget.src = '/default-avatar.png')}
                      roundedCircle
                      width={48}
                      height={48}
                      alt="sender"
                    />
                    <div className="flex-grow-1">
                      <div className="d-flex align-items-center gap-2">
                        <div className="fw-bold notification-title message">
                          💬 {th.sender ? `${th.sender.firstName || ''} ${th.sender.lastName || ''}`.trim() : 'مستخدم'}
                        </div>
                        {th.unreadCount > 0 && (
                          <Badge bg="primary" pill>{th.unreadCount}</Badge>
                        )}
                      </div>
                      <div className="msg mt-1 text-truncate">{th.lastMessage || '—'}</div>
                      <div className="notification-date">{fmtDateTime(th.lastCreatedAt)}</div>
                    </div>
                    <div>
                      <Button size="sm" variant="outline-primary" onClick={(e) => {e.stopPropagation(); openChat(th);}}>
                        فتح المحادثة
                      </Button>
                    </div>
                  </div>
                </ListGroup.Item>
              ))
            )}
          </ListGroup>

          {/* قسم باقي الإشعارات */}
          <h6 className="section-heading mt-4">إشعارات أخرى</h6>
          <ListGroup className="notification-list">
            {viewModel.items.length === 0 ? (
              <div className="text-muted small p-2">لا توجد إشعارات أخرى.</div>
            ) : (
              viewModel.items.map((n) => {
                const sender = n.sender;
                const when = fmtDateTime(n.createdAt);
                const titleIcon =
                  n.type === 'offer' ? '🩸 ' :
                  n.type === 'system' ? '⚙️ ' : '';

                return (
                  <ListGroup.Item
                    key={n._id}
                    className={`notification-item shadow-sm p-3 mb-3 rounded ${!n.read ? 'unread' : ''}`}
                    onClick={() => openDetails(n)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="d-flex align-items-start gap-3">
                      <Image
                        src={resolveAvatar(sender?.profileImage)}
                        onError={(e) => (e.currentTarget.src = '/default-avatar.png')}
                        roundedCircle
                        width={44}
                        height={44}
                        alt="sender"
                      />
                      <div className="flex-grow-1">
                        <div className="d-flex align-items-center gap-2">
                          <div className={`fw-bold notification-title ${n.type || 'system'}`}>
                            {titleIcon}{n.title || 'إشعار'}
                          </div>
                          <Badge bg={n.type === 'offer' ? 'success' : n.type === 'system' ? 'secondary' : 'secondary'}>
                            {n.type || 'system'}
                          </Badge>
                        </div>

                        <div className="message-truncated mt-2">
                          {sender && (
                            <div className="text-muted sender small mb-1">
                              <strong>👤 من طرف:</strong> {sender.firstName} {sender.lastName}
                            </div>
                          )}
                          <div className="msg">{n.message}</div>

                          {/* الزر يفتح تفاصيل الطلب مباشرة */}
                          {buildDetailsRoute(n) && (
                            <Button
                              variant="outline-secondary"
                              size="sm"
                              className="btn-details mt-3"
                              onClick={(e) => { e.stopPropagation(); openDetails(n); }}
                            >
                              👁️ تفاصيل
                            </Button>
                          )}
                        </div>

                        <div className="text-success small mt-2">{when}</div>
                      </div>
                    </div>
                  </ListGroup.Item>
                );
              })
            )}
          </ListGroup>
        </>
      )}

      {/* ===== وضع: رسائل فقط ===== */}
      {viewModel.mode === 'messageOnly' && (
        <>
          <h6 className="section-heading">الرسائل</h6>
          <ListGroup className="notification-list">
            {viewModel.threads.length === 0 ? (
              <div className="text-muted small p-2">لا توجد رسائل.</div>
            ) : (
              viewModel.threads.map((th) => (
                <ListGroup.Item
                  key={th.senderId}
                  className={`notification-item thread-item shadow-sm p-3 mb-3 rounded ${
                    th.unreadCount > 0 ? 'unread' : ''
                  }`}
                  onClick={() => openChat(th)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="d-flex align-items-start gap-3">
                    <Image
                      src={resolveAvatar(th.sender?.profileImage)}
                      onError={(e) => (e.currentTarget.src = '/default-avatar.png')}
                      roundedCircle
                      width={48}
                      height={48}
                      alt="sender"
                    />
                    <div className="flex-grow-1">
                      <div className="d-flex align-items-center gap-2">
                        <div className="fw-bold notification-title message">
                          💬 {th.sender ? `${th.sender.firstName || ''} ${th.sender.lastName || ''}`.trim() : 'مستخدم'}
                        </div>
                        {th.unreadCount > 0 && (
                          <Badge bg="primary" pill>{th.unreadCount}</Badge>
                        )}
                      </div>
                      <div className="msg mt-1 text-truncate">{th.lastMessage || '—'}</div>
                      <div className="notification-date">{fmtDateTime(th.lastCreatedAt)}</div>
                    </div>
                    <div>
                      <Button size="sm" variant="outline-primary" onClick={(e) => {e.stopPropagation(); openChat(th);}}>
                        فتح المحادثة
                      </Button>
                    </div>
                  </div>
                </ListGroup.Item>
              ))
            )}
          </ListGroup>
        </>
      )}

      {/* ===== وضع: إشعارات أخرى فقط (عرض/نظام) ===== */}
      {viewModel.mode === 'othersOnly' && (
        <>
          <h6 className="section-heading">إشعارات</h6>
          <ListGroup className="notification-list">
            {viewModel.items.length === 0 ? (
              <div className="text-muted small p-2">لا توجد إشعارات.</div>
            ) : (
              viewModel.items.map((n) => {
                const sender = n.sender;
                const when = fmtDateTime(n.createdAt);
                const titleIcon =
                  n.type === 'offer' ? '🩸 ' :
                  n.type === 'system' ? '⚙️ ' : '';

                return (
                  <ListGroup.Item
                    key={n._id}
                    className={`notification-item shadow-sm p-3 mb-3 rounded ${!n.read ? 'unread' : ''}`}
                    onClick={() => openDetails(n)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="d-flex align-items-start gap-3">
                      <Image
                        src={resolveAvatar(sender?.profileImage)}
                        onError={(e) => (e.currentTarget.src = '/default-avatar.png')}
                        roundedCircle
                        width={44}
                        height={44}
                        alt="sender"
                      />
                      <div className="flex-grow-1">
                        <div className="d-flex align-items-center gap-2">
                          <div className={`fw-bold notification-title ${n.type || 'system'}`}>
                            {titleIcon}{n.title || 'إشعار'}
                          </div>
                          <Badge bg={n.type === 'offer' ? 'success' : n.type === 'system' ? 'secondary' : 'secondary'}>
                            {n.type || 'system'}
                          </Badge>
                        </div>

                        <div className="message-truncated mt-2">
                          {sender && (
                            <div className="text-muted sender small mb-1">
                              <strong>👤 من طرف:</strong> {sender.firstName} {sender.lastName}
                            </div>
                          )}
                          <div className="msg">{n.message}</div>

                          {buildDetailsRoute(n) && (
                            <Button
                              variant="outline-secondary"
                              size="sm"
                              className="btn-details mt-3"
                              onClick={(e) => { e.stopPropagation(); openDetails(n); }}
                            >
                              👁️ تفاصيل
                            </Button>
                          )}
                        </div>

                        <div className="text-success small mt-2">{when}</div>
                      </div>
                    </div>
                  </ListGroup.Item>
                );
              })
            )}
          </ListGroup>
        </>
      )}
    </div>
  );
}
