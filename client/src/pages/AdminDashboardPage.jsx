// src/pages/AdminDashboardPage.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Button, Form, Modal, Spinner } from 'react-bootstrap';
import fetchWithInterceptors from '../services/fetchWithInterceptors';
import './AdminDashboardPage.css';

function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState('blood'); // users | blood | general

  const [users, setUsers] = useState([]);
  const [bloodRequests, setBloodRequests] = useState([]);
  const [generalRequests, setGeneralRequests] = useState([]);

  const [loading, setLoading] = useState(false);
  const [topError, setTopError] = useState('');

  const [searchText, setSearchText] = useState('');
  const [userFilter, setUserFilter] = useState('all'); // all | userId

  const [expandedBloodId, setExpandedBloodId] = useState(null);
  const [expandedGeneralId, setExpandedGeneralId] = useState(null);

  // نافذة التأكيد / التعليق
  const [confirmState, setConfirmState] = useState({
    show: false,
    scope: null, // 'user' | 'blood' | 'general'
    action: null, // 'delete' | 'toggle'
    item: null,
    comment: '',
    loading: false,
  });

  const openConfirm = (scope, action, item) => {
    setConfirmState({
      show: true,
      scope,
      action,
      item,
      comment: '',
      loading: false,
    });
  };

  const closeConfirm = () => {
    if (confirmState.loading) return;
    setConfirmState((s) => ({ ...s, show: false, item: null, comment: '' }));
  };

  const loadAll = async () => {
    setLoading(true);
    setTopError('');
    try {
      const [uRes, bRes, gRes] = await Promise.all([
        fetchWithInterceptors('/api/admin/users'),
        fetchWithInterceptors('/api/admin/blood-requests'),
        fetchWithInterceptors('/api/admin/general-requests'),
      ]);

      if (!uRes.ok) throw new Error(uRes.body?.message || 'خطأ في تحميل المستخدمين');
      if (!bRes.ok) throw new Error(bRes.body?.message || 'خطأ في تحميل طلبات الدم');
      if (!gRes.ok) throw new Error(gRes.body?.message || 'خطأ في تحميل الطلبات العامة');

      setUsers(uRes.body?.data || uRes.body || []);
      setBloodRequests(bRes.body?.data || bRes.body || []);
      setGeneralRequests(gRes.body?.data || gRes.body || []);
    } catch (err) {
      console.error(err);
      setTopError(err.message || 'حدث خطأ أثناء تحميل البيانات.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const stats = useMemo(
    () => ({
      usersCount: users.length,
      bloodCount: bloodRequests.length,
      generalCount: generalRequests.length,
    }),
    [users, bloodRequests, generalRequests],
  );

  const normalizedSearch = searchText.trim().toLowerCase();
  const selectedUserId = userFilter !== 'all' ? userFilter : null;

  const filterBySearchAndUser = (list, extraFieldsFn) =>
    list.filter((item) => {
      if (selectedUserId && String(item.userId?._id || item.userId) !== selectedUserId) {
        return false;
      }

      if (!normalizedSearch) return true;

      const fields = extraFieldsFn(item)
        .concat([
          item.description,
          item.category,
          item.type,
          item.place,
          item.city,
          item.hospitalName,
          item.phoneNumber,
          item.firstName,
          item.lastName,
          item.username,
        ])
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return fields.includes(normalizedSearch);
    });

  const filteredUsers = useMemo(
    () =>
      filterBySearchAndUser(
        users,
        (u) => [u.email, u.phoneNumber, u.whatsappNumber, `${u.firstName || ''} ${u.lastName || ''}`],
      ),
    [users, normalizedSearch, selectedUserId],
  );

  const filteredBloodRequests = useMemo(
    () =>
      filterBySearchAndUser(bloodRequests, (r) => [
        r.description,
        r.location,
        r.city,
        r.hospitalName,
        r.userId?.firstName,
        r.userId?.lastName,
        r.userId?.phoneNumber,
      ]),
    [bloodRequests, normalizedSearch, selectedUserId],
  );

  const filteredGeneralRequests = useMemo(
    () =>
      filterBySearchAndUser(generalRequests, (r) => [
        r.description,
        r.category,
        r.type,
        r.place,
        r.userId?.firstName,
        r.userId?.lastName,
        r.userId?.phoneNumber,
      ]),
    [generalRequests, normalizedSearch, selectedUserId],
  );

  // ===== Helpers لعرض النص / الشيبس =====
  const formatUserName = (u) =>
    u ? `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.username || u.email || '—' : '—';

  const formatPhone = (u) => u?.phoneNumber || '—';

  const formatDate = (value) => {
    if (!value) return '—';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('ar-MA', { year: 'numeric', month: 'short', day: '2-digit' });
  };

  const statusPillClass = (status) => {
    switch (status) {
      case 'verified':
      case 'active':
        return 'status-pill status-pill--success';
      case 'pending':
        return 'status-pill status-pill--pending';
      case 'suspended':
      case 'cancelled':
        return 'status-pill status-pill--danger';
      default:
        return 'status-pill status-pill--default';
    }
  };

  const roleClass = (role) => {
    if (role === 'admin') return 'role-pill role-pill--admin';
    return 'role-pill role-pill--user';
  };

  // ===== API Actions (تُستدعى من نافذة التأكيد) =====
  const performAction = async () => {
    if (!confirmState.item || !confirmState.scope || !confirmState.action) return;

    setConfirmState((s) => ({ ...s, loading: true }));
    setTopError('');

    const { scope, action, item, comment } = confirmState;

    try {
      let res;

      if (scope === 'user') {
        if (action === 'delete') {
          res = await fetchWithInterceptors(`/api/admin/users/${item._id}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reason: comment || undefined }),
          });
        } else if (action === 'toggle') {
          res = await fetchWithInterceptors(`/api/admin/users/${item._id}/toggle-status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reason: comment || undefined }),
          });
        }
      }

      if (scope === 'blood') {
        if (action === 'delete') {
          res = await fetchWithInterceptors(`/api/admin/blood-requests/${item._id}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reason: comment || undefined }),
          });
        } else if (action === 'toggle') {
          res = await fetchWithInterceptors(
            `/api/admin/blood-requests/${item._id}/toggle-active`,
            {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ reason: comment || undefined }),
            },
          );
        }
      }

      if (scope === 'general') {
        if (action === 'delete') {
          res = await fetchWithInterceptors(`/api/admin/general-requests/${item._id}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reason: comment || undefined }),
          });
        } else if (action === 'toggle') {
          res = await fetchWithInterceptors(
            `/api/admin/general-requests/${item._id}/toggle-status`,
            {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ reason: comment || undefined }),
            },
          );
        }
      }

      if (!res || !res.ok) {
        throw new Error(res?.body?.message || 'فشل تنفيذ العملية');
      }

      await loadAll();
      closeConfirm();
    } catch (err) {
      console.error(err);
      setTopError(err.message || 'فشل تنفيذ العملية.');
      setConfirmState((s) => ({ ...s, loading: false }));
    }
  };

  // ======= Render =======

  const renderUsersTable = () => (
    <div className="admin-panel">
      <div className="admin-panel-header">
        <h2>قائمة المستخدمين</h2>
        <div className="admin-panel-filters">
          <Form.Control
            type="text"
            className="admin-search-input"
            placeholder="بحث في المستخدمين (الاسم، الهاتف، البريد)..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>
      </div>

      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>الاسم</th>
              <th>الهاتف</th>
              <th>الدور</th>
              <th>الحالة</th>
              <th className="admin-actions-col">الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan={5} className="admin-empty">
                  لا يوجد مستخدمون مطابقون لبحثك.
                </td>
              </tr>
            )}

            {filteredUsers.map((u) => (
              <tr key={u._id}>
                <td>
                  {formatUserName(u)}
                  {u.username && (
                    <span className="admin-username-chip">{u.username}</span>
                  )}
                </td>
                <td>{u.phoneNumber || '—'}</td>
                <td>
                  <span className={roleClass(u.role || 'user')}>
                    {u.role || 'user'}
                  </span>
                </td>
                <td>
                  <span className={statusPillClass(u.status || 'pending')}>
                    {u.status || 'pending'}
                  </span>
                </td>
                <td className="admin-actions-col">
                  <div className="admin-actions">
                    <button
                      type="button"
                      className="btn-sm btn-warning"
                      onClick={() => openConfirm('user', 'toggle', u)}
                    >
                      {u.status === 'suspended' ? 'تفعيل' : 'تعطيل'}
                    </button>
                    <button
                      type="button"
                      className="btn-sm btn-danger"
                      onClick={() => openConfirm('user', 'delete', u)}
                    >
                      حذف
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderBloodTable = () => (
    <div className="admin-panel">
      <div className="admin-panel-header">
        <h2>طلبات التبرع بالدم</h2>
        <div className="admin-panel-filters">
          <Form.Control
            type="text"
            className="admin-search-input"
            placeholder="بحث في الطلبات (الوصف، صاحب الطلب، الهاتف)..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <Form.Select
            className="admin-select"
            value={userFilter}
            onChange={(e) => setUserFilter(e.target.value)}
          >
            <option value="all">كل المستخدمين</option>
            {users.map((u) => (
              <option key={u._id} value={u._id}>
                {formatUserName(u)} – {u.phoneNumber}
              </option>
            ))}
          </Form.Select>
        </div>
      </div>

      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>الوصف</th>
              <th>فصيلة الدم</th>
              <th>صاحب الطلب</th>
              <th>الهاتف</th>
              <th>المكان</th>
              <th>تاريخ الإنشاء</th>
              <th>الحالة</th>
              <th className="admin-actions-col">الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {filteredBloodRequests.length === 0 && (
              <tr>
                <td colSpan={8} className="admin-empty">
                  لا توجد طلبات دم مطابقة لبحثك.
                </td>
              </tr>
            )}

            {filteredBloodRequests.map((r) => {
              const expanded = expandedBloodId === r._id;
              return (
                <React.Fragment key={r._id}>
                  <tr className={r.isUrgent ? 'row-urgent' : ''}>
                    <td>{r.description || '—'}</td>
                    <td>{r.bloodType || '—'}</td>
                    <td>{formatUserName(r.userId)}</td>
                    <td>{formatPhone(r.userId)}</td>
                    <td>{r.location || r.city || r.hospitalName || '—'}</td>
                    <td>{formatDate(r.createdAt || r.date)}</td>
                    <td>
                      <span
                        className={statusPillClass(r.isActive ? 'active' : 'paused')}
                      >
                        {r.isActive ? 'active' : 'paused'}
                      </span>
                    </td>
                    <td className="admin-actions-col">
                      <div className="admin-actions">
                        <button
                          type="button"
                          className="btn-sm btn-outline"
                          onClick={() =>
                            setExpandedBloodId(expanded ? null : r._id)
                          }
                        >
                          تفاصيل {expanded ? '▲' : '▼'}
                        </button>
                        <button
                          type="button"
                          className="btn-sm btn-warning"
                          onClick={() => openConfirm('blood', 'toggle', r)}
                        >
                          {r.isActive ? 'تعطيل' : 'تفعيل'}
                        </button>
                        <button
                          type="button"
                          className="btn-sm btn-danger"
                          onClick={() => openConfirm('blood', 'delete', r)}
                        >
                          حذف
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expanded && (
                    <tr className="admin-details-row">
                      <td colSpan={8}>
                        <div className="details-grid">
                          <div>
                            <h6>الوصف</h6>
                            <p>{r.description || '—'}</p>
                          </div>
                          <div>
                            <h6>المكان</h6>
                            <p>
                              {r.city && <span>{r.city} – </span>}
                              {r.hospitalName && <span>{r.hospitalName} – </span>}
                              {r.location || '—'}
                            </p>
                          </div>
                          <div>
                            <h6>التواصل</h6>
                            {Array.isArray(r.contactMethods) &&
                              r.contactMethods.map((c, idx) => (
                                <p key={idx}>
                                  {c.method}: {c.number}
                                </p>
                              ))}
                            {!r.contactMethods?.length && <p>—</p>}
                          </div>
                          <div>
                            <h6>المدة القصوى</h6>
                            <p>{formatDate(r.deadline)}</p>
                            <h6>أنشئ في</h6>
                            <p>{formatDate(r.createdAt)}</p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderGeneralTable = () => (
    <div className="admin-panel">
      <div className="admin-panel-header">
        <h2>طلبات التبرع العام</h2>
        <div className="admin-panel-filters">
          <Form.Control
            type="text"
            className="admin-search-input"
            placeholder="بحث في الطلبات (الوصف، صاحب الطلب، الهاتف)..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <Form.Select
            className="admin-select"
            value={userFilter}
            onChange={(e) => setUserFilter(e.target.value)}
          >
            <option value="all">كل المستخدمين</option>
            {users.map((u) => (
              <option key={u._id} value={u._id}>
                {formatUserName(u)} – {u.phoneNumber}
              </option>
            ))}
          </Form.Select>
        </div>
      </div>

      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>العنوان / الوصف</th>
              <th>النوع</th>
              <th>صاحب الطلب</th>
              <th>الهاتف</th>
              <th>المكان</th>
              <th>تاريخ الإنشاء</th>
              <th>الحالة</th>
              <th className="admin-actions-col">الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {filteredGeneralRequests.length === 0 && (
              <tr>
                <td colSpan={8} className="admin-empty">
                  لا توجد طلبات عامة مطابقة لبحثك.
                </td>
              </tr>
            )}

            {filteredGeneralRequests.map((r) => {
              const expanded = expandedGeneralId === r._id;
              return (
                <React.Fragment key={r._id}>
                  <tr className={r.isUrgent ? 'row-urgent' : ''}>
                    <td>{r.description || '—'}</td>
                    <td>{r.type || r.category || '—'}</td>
                    <td>{formatUserName(r.userId)}</td>
                    <td>{formatPhone(r.userId)}</td>
                    <td>{r.place || '—'}</td>
                    <td>{formatDate(r.createdAt || r.date)}</td>
                    <td>
                      <span
                        className={statusPillClass(r.status || 'active')}
                      >
                        {r.status || 'active'}
                      </span>
                    </td>
                    <td className="admin-actions-col">
                      <div className="admin-actions">
                        <button
                          type="button"
                          className="btn-sm btn-outline"
                          onClick={() =>
                            setExpandedGeneralId(expanded ? null : r._id)
                          }
                        >
                          تفاصيل {expanded ? '▲' : '▼'}
                        </button>
                        <button
                          type="button"
                          className="btn-sm btn-warning"
                          onClick={() => openConfirm('general', 'toggle', r)}
                        >
                          {r.status === 'paused' ? 'تفعيل' : 'تعطيل'}
                        </button>
                        <button
                          type="button"
                          className="btn-sm btn-danger"
                          onClick={() => openConfirm('general', 'delete', r)}
                        >
                          حذف
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expanded && (
                    <tr className="admin-details-row">
                      <td colSpan={8}>
                        <div className="details-grid">
                          <div>
                            <h6>الوصف</h6>
                            <p>{r.description || '—'}</p>
                          </div>
                          <div>
                            <h6>المكان</h6>
                            <p>{r.place || '—'}</p>
                          </div>
                          <div>
                            <h6>طرق الدفع</h6>
                            {Array.isArray(r.paymentMethods) &&
                              r.paymentMethods.map((p, idx) => (
                                <p key={idx}>
                                  {p.method}: {p.phone}
                                </p>
                              ))}
                            {!r.paymentMethods?.length && <p>—</p>}
                          </div>
                          <div>
                            <h6>التواصل</h6>
                            {Array.isArray(r.contactMethods) &&
                              r.contactMethods.map((c, idx) => (
                                <p key={idx}>
                                  {c.method}: {c.number}
                                </p>
                              ))}
                            {!r.contactMethods?.length && <p>—</p>}
                            <h6>المدة القصوى</h6>
                            <p>{formatDate(r.deadline)}</p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <main className="admin-page" dir="rtl">
      <div className="admin-hero-card">
        <div className="admin-hero-text">
          <h1 className="admin-title">لوحة تحكم الإدارة</h1>
          <p className="admin-subtitle">
            إدارة الحسابات والطلبات من مكان واحد، يمكنك البحث عن المستخدمين والطلبات بسهولة.
          </p>
        </div>
        <div className="admin-stats-grid">
          <div className="admin-stat-card">
            <span className="admin-stat-label">عدد المستخدمين</span>
            <span className="admin-stat-value">{stats.usersCount}</span>
          </div>
          <div className="admin-stat-card">
            <span className="admin-stat-label">طلبات التبرع بالدم</span>
            <span className="admin-stat-value">{stats.bloodCount}</span>
          </div>
          <div className="admin-stat-card">
            <span className="admin-stat-label">طلبات التبرع العامة</span>
            <span className="admin-stat-value">{stats.generalCount}</span>
          </div>
        </div>
      </div>

      {topError && (
        <Alert
          variant="danger"
          onClose={() => setTopError('')}
          dismissible
          className="mb-3"
        >
          {topError}
        </Alert>
      )}

      <div className="admin-tabs mb-3">
        <button
          type="button"
          className={`admin-tab-btn ${
            activeTab === 'users' ? 'is-active' : ''
          }`}
          onClick={() => setActiveTab('users')}
        >
          المستخدمون
        </button>
        <button
          type="button"
          className={`admin-tab-btn ${
            activeTab === 'blood' ? 'is-active' : ''
          }`}
          onClick={() => setActiveTab('blood')}
        >
          طلبات التبرع بالدم
        </button>
        <button
          type="button"
          className={`admin-tab-btn ${
            activeTab === 'general' ? 'is-active' : ''
          }`}
          onClick={() => setActiveTab('general')}
        >
          طلبات التبرع العام
        </button>
      </div>

      {loading && (
        <div className="admin-loading">
          <Spinner animation="border" size="sm" />
          <span>جارٍ تحميل البيانات...</span>
        </div>
      )}

      {!loading && activeTab === 'users' && renderUsersTable()}
      {!loading && activeTab === 'blood' && renderBloodTable()}
      {!loading && activeTab === 'general' && renderGeneralTable()}

      {/* نافذة التأكيد / كتابة التعليق */}
      <Modal show={confirmState.show} onHide={closeConfirm} centered>
        <Modal.Header closeButton={!confirmState.loading}>
          <Modal.Title>تأكيد العملية</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="mb-2">
            {confirmState.action === 'delete'
              ? 'هل أنت متأكد من حذف هذا العنصر؟ هذا الإجراء لا يمكن التراجع عنه.'
              : 'هل تريد تغيير حالة هذا العنصر (تفعيل / تعطيل)؟'}
          </p>
          <Form.Group className="mt-3">
            <Form.Label>سبب العملية (يظهر لصاحب الطلب – اختياري)</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={confirmState.comment}
              onChange={(e) =>
                setConfirmState((s) => ({ ...s, comment: e.target.value }))
              }
              placeholder="مثال: تم إيقاف الطلب لمراجعة المعلومات، أو تم الحذف بعد انتهاء الحالة..."
              disabled={confirmState.loading}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={closeConfirm}
            disabled={confirmState.loading}
          >
            إلغاء
          </Button>
          <Button
            variant={
              confirmState.action === 'delete' ? 'danger' : 'warning'
            }
            onClick={performAction}
            disabled={confirmState.loading}
          >
            {confirmState.loading ? 'جارٍ التنفيذ...' : 'تأكيد'}
          </Button>
        </Modal.Footer>
      </Modal>
    </main>
  );
}

export default AdminDashboardPage;
