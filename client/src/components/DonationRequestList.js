import React, { useEffect, useMemo, useState } from 'react';
import fetchWithInterceptors from '../services/fetchWithInterceptors';
import { Card, Button, Form, Spinner, Badge, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import Title from './Title';
import FindeNot from './FindeNot';
import './DonationRequestList.css'; // CSS بالأسفل

const DEFAULT_Q = { category:'', type:'', place:'', urgent:'', page:1, limit:12 };

const DonationRequestList = () => {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState(DEFAULT_Q);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({ total:0, pages:1 });
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams(
        Object.entries(q).filter(([_, v]) => v !== '' && v !== null)
      );
      const res = await fetchWithInterceptors(`/api/donationRequests?${params.toString()}`);
      if (!res.ok) throw new Error(res.body?.message || 'فشل جلب البيانات');
      const list = res.body?.data || [];
      const pagination = res.body?.pagination || { total: list.length, pages: 1, page: q.page, limit: q.limit };
      setItems(list);
      setMeta(pagination);
    } catch (e) {
      console.error(e);
      setError(e.message || 'تعذر تحميل القائمة');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [q.page, q.category, q.type, q.place, q.urgent]);

  // قيم الفلاتر (من البيانات الحالية)
  const categories = useMemo(
    () => [...new Set(items.map(i => i.category).filter(Boolean))],
    [items]
  );

  const types = useMemo(() => {
    const source = q.category ? items.filter(i => i.category === q.category) : items;
    return [...new Set(source.map(i => i.type).filter(Boolean))];
  }, [items, q.category]);

  const places = useMemo(
    () => [...new Set(items.map(i => i.place).filter(Boolean))],
    [items]
  );

  const resetFilters = () => setQ({ ...DEFAULT_Q });

  const truncate = (txt, n = 110) => !txt ? '-' : (txt.length > n ? txt.slice(0, n) + '…' : txt);

  return (
    <div className="donation-container py-4" dir="rtl">
      <Title text="الطلبات العامة للتبرع" />

      {/* فلاتر بنفس أسلوب BloodDonationList */}
      <div className="filter">
        <Form.Select
          value={q.category}
          onChange={(e) => setQ({ ...q, category: e.target.value, type:'', page:1 })}
          style={{ maxWidth: 220 }}
          aria-label="اختيار المجال"
        >
          <option value="">كل المجالات</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </Form.Select>

        <Form.Select
          value={q.type}
          onChange={(e) => setQ({ ...q, type: e.target.value, page:1 })}
          style={{ maxWidth: 220 }}
          aria-label="اختيار النوع"
          disabled={!types.length}
        >
          <option value="">كل الأنواع</option>
          {types.map(t => <option key={t} value={t}>{t}</option>)}
        </Form.Select>

        <Form.Select
          value={q.place}
          onChange={(e) => setQ({ ...q, place: e.target.value, page:1 })}
          style={{ maxWidth: 220 }}
          aria-label="اختيار المكان"
        >
          <option value="">كل الأماكن</option>
          {places.map(p => <option key={p} value={p}>{p}</option>)}
        </Form.Select>

        <Form.Select
          value={q.urgent}
          onChange={(e) => setQ({ ...q, urgent: e.target.value, page:1 })}
          style={{ maxWidth: 180 }}
          aria-label="حالة الاستعجال"
        >
          <option value="">الكل</option>
          <option value="1">مستعجل فقط</option>
        </Form.Select>

        <Button variant="outline-secondary" onClick={resetFilters}>
          مسح الفلاتر
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" />
          <div className="mt-2">جارٍ التحميل…</div>
        </div>
      ) : error ? (
        <div className="text-center text-danger py-4">{error}</div>
      ) : (
        <div className="container-card my-4">
          {items.length === 0 ? (
            <FindeNot />
          ) : (
            <>
              <Row className="donation-grid">
                {items.map(item => (
                  <div key={item._id} className="donation-card">
                    <Card className="h-100 shadow-sm">
                      <Card.Body>
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <div className="fw-bold">{item.category || '-'}</div>
                          <Badge bg={item.isUrgent ? 'danger' : 'secondary'}>
                            {item.isUrgent ? 'مستعجل' : 'عادي'}
                          </Badge>
                        </div>
                        <div className="text-muted mb-1">{item.type || '-'}</div>
                        <div className="small text-secondary mb-2">{item.place || '-'}</div>

                        {'amount' in item && (
                          <div className="mb-2">
                            <span className="fw-semibold">المبلغ:</span>{' '}
                            <span>{item.amount ?? '-'}</span>
                          </div>
                        )}

                        <div className="mb-3 small">{truncate(item.description)}</div>

                        <div className="d-flex justify-content-between align-items-center">
                          <small className="text-muted">
                            {item.createdAt ? new Date(item.createdAt).toLocaleDateString('ar-MA') : ''}
                          </small>
                          <Link
                            to={`/donations/${item._id}`}
                            className="btn btn-outline-primary btn-sm"
                          >
                            التفاصيل
                          </Link>
                        </div>
                      </Card.Body>
                    </Card>
                  </div>
                ))}
              </Row>

              {/* ترقيم بنفس روح BloodDonationList */}
              <div className="pagination-controls text-center mt-4 d-flex justify-content-center gap-3">
                <Button
                  variant="outline-secondary"
                  onClick={() => setQ(prev => ({ ...prev, page: Math.max(prev.page - 1, 1) }))}
                  disabled={q.page <= 1}
                  aria-label="الصفحة السابقة"
                >
                  ➡️ السابقة
                </Button>

                <span className="align-self-center">
                  الصفحة {q.page} من {meta.pages || 1}
                </span>

                <Button
                  variant="outline-primary"
                  onClick={() => setQ(prev => ({ ...prev, page: Math.min(prev.page + 1, meta.pages || 1) }))}
                  disabled={q.page >= (meta.pages || 1)}
                  aria-label="الصفحة التالية"
                >
                  ⬅️ التالية
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default DonationRequestList;
