import React, { useEffect, useMemo, useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Badge, Spinner, Tabs, Tab } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import fetchWithInterceptors from '../services/fetchWithInterceptors';

const PAGE_SIZE = 12;
const isEight = (v='') => /^\d{8}$/.test(v);

// Helpers
const useQuery = () => new URLSearchParams(useLocation().search);

function BloodTab() {
  const locationHook = useLocation();
  const navigate = useNavigate();
  const params = useMemo(() => new URLSearchParams(locationHook.search), [locationHook.search]);

  const [filters, setFilters] = useState({
    location: params.get('location') || '',
    bloodType: params.get('bloodType') || ''
  });
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState([]);
  const [page, setPage] = useState(1);

  const bloodTypes = ['','A+','A-','B+','B-','AB+','AB-','O+','O-','غير معروف'];

  const fetchData = async () => {
    setLoading(true);
    try {
      const qs = new URLSearchParams();
      if (filters.location) qs.set('location', filters.location);
      if (filters.bloodType) qs.set('bloodType', filters.bloodType);
      const res = await fetchWithInterceptors(`/api/ready-to-donate-blood?${qs.toString()}`);
      const json = await res.json();
      setList(Array.isArray(json?.data) ? json.data : []);
    } catch (e) {
      console.error(e);
      setList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); /* eslint-disable-next-line */ }, []);

  const applyFilters = (ev) => {
    ev?.preventDefault?.();
    // حدّث URL
    const qs = new URLSearchParams();
    if (filters.bloodType) qs.set('bloodType', filters.bloodType);
    if (filters.location) qs.set('location', filters.location);
    navigate({ pathname: '/ready-donors', search: `?tab=blood&${qs.toString()}` });
    setPage(1);
    fetchData();
  };

  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return list.slice(start, start + PAGE_SIZE);
  }, [list, page]);

  return (
    <div dir="rtl">
      <Card className="border-0 shadow-sm mb-3">
        <Card.Body>
          <Form onSubmit={applyFilters} className="row g-3">
            <div className="col-md-4">
              <Form.Label>الموقع</Form.Label>
              <Form.Control
                placeholder="مثال: نواكشوط"
                value={filters.location}
                onChange={(e)=>setFilters(f=>({...f, location: e.target.value}))}
              />
            </div>
            <div className="col-md-4">
              <Form.Label>فصيلة الدم</Form.Label>
              <Form.Select
                value={filters.bloodType}
                onChange={(e)=>setFilters(f=>({...f, bloodType: e.target.value}))}
              >
                {bloodTypes.map(t => <option key={t || 'any'} value={t}>{t || 'الكل'}</option>)}
              </Form.Select>
            </div>
            <div className="col-md-4 d-flex align-items-end">
              <Button type="submit" className="me-auto">تطبيق الفلاتر</Button>
            </div>
          </Form>
        </Card.Body>
      </Card>

      {loading ? (
        <div className="text-center py-5"><Spinner /></div>
      ) : (
        <>
          <Row xs={1} md={2} lg={3} className="g-3">
            {paginated.map(item => (
              <Col key={item._id}>
                <Card className="h-100 border-0 shadow-sm">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h5 className="mb-0">متبرّع بالدم</h5>
                      <Badge bg="danger">{item.bloodType}</Badge>
                    </div>
                    <div className="small text-muted mb-2">الموقع: {item.location || '-'}</div>
                    {item.note && <p className="mb-2">{item.note}</p>}

                    <div className="mt-3">
                      <div className="fw-bold mb-1">وسائل التواصل:</div>
                      {(item.contactMethods || []).map((c, idx) => (
                        <div key={idx} className="small">
                          {c.method === 'phone' ? '📞' : '💬'} {c.number}
                        </div>
                      ))}
                    </div>
                  </Card.Body>
                  <Card.Footer className="small text-muted">
                    أضيفت في: {new Date(item.createdAt).toLocaleString('fr-FR')}
                  </Card.Footer>
                </Card>
              </Col>
            ))}
          </Row>

          {/* Pagination بسيط */}
          {list.length > PAGE_SIZE && (
            <div className="d-flex justify-content-center gap-2 mt-3">
              <Button variant="outline-secondary" disabled={page===1} onClick={()=>setPage(p=>p-1)}>السابق</Button>
              <div className="px-2 pt-2 small">صفحة {page} من {Math.ceil(list.length/PAGE_SIZE)}</div>
              <Button variant="outline-secondary" disabled={page===Math.ceil(list.length/PAGE_SIZE)} onClick={()=>setPage(p=>p+1)}>التالي</Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function GeneralTab() {
  const locationHook = useLocation();
  const navigate = useNavigate();
  const params = useMemo(() => new URLSearchParams(locationHook.search), [locationHook.search]);

  const [filters, setFilters] = useState({
    city: params.get('city') || '',
    category: params.get('category') || ''
  });
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState([]);
  const [page, setPage] = useState(1);

  const categories = ['', 'money', 'goods', 'time', 'other'];

  const fetchData = async () => {
    setLoading(true);
    try {
      const qs = new URLSearchParams();
      if (filters.city) qs.set('city', filters.city);
      if (filters.category) qs.set('category', filters.category);
      const res = await fetchWithInterceptors(`/api/ready-to-donate-general?${qs.toString()}`);
      const json = await res.json();
      setList(Array.isArray(json?.data) ? json.data : []);
    } catch (e) {
      console.error(e);
      setList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); /* eslint-disable-next-line */ }, []);

  const applyFilters = (ev) => {
    ev?.preventDefault?.();
    const qs = new URLSearchParams();
    if (filters.category) qs.set('category', filters.category);
    if (filters.city) qs.set('city', filters.city);
    navigate({ pathname: '/ready-donors', search: `?tab=general&${qs.toString()}` });
    setPage(1);
    fetchData();
  };

  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return list.slice(start, start + PAGE_SIZE);
  }, [list, page]);

  const labelMap = { money: 'مالي', goods: 'مواد', time: 'وقت/جهد', other: 'أخرى' };

  return (
    <div dir="rtl">
      <Card className="border-0 shadow-sm mb-3">
        <Card.Body>
          <Form onSubmit={applyFilters} className="row g-3">
            <div className="col-md-4">
              <Form.Label>المدينة</Form.Label>
              <Form.Control
                placeholder="مثال: نواكشوط"
                value={filters.city}
                onChange={(e)=>setFilters(f=>({...f, city: e.target.value}))}
              />
            </div>
            <div className="col-md-4">
              <Form.Label>نوع التبرع</Form.Label>
              <Form.Select
                value={filters.category}
                onChange={(e)=>setFilters(f=>({...f, category: e.target.value}))}
              >
                {categories.map(c => <option key={c || 'any'} value={c}>{c ? labelMap[c] : 'الكل'}</option>)}
              </Form.Select>
            </div>
            <div className="col-md-4 d-flex align-items-end">
              <Button type="submit" className="me-auto">تطبيق الفلاتر</Button>
            </div>
          </Form>
        </Card.Body>
      </Card>

      {loading ? (
        <div className="text-center py-5"><Spinner /></div>
      ) : (
        <>
          <Row xs={1} md={2} lg={3} className="g-3">
            {paginated.map(item => (
              <Col key={item._id}>
                <Card className="h-100 border-0 shadow-sm">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h5 className="mb-0">متبرّع عام</h5>
                      <Badge bg="primary">{labelMap[item?.extra?.category] || 'غير محدد'}</Badge>
                    </div>
                    <div className="small text-muted mb-2">المدينة: {item.city || '-'}</div>
                    {item.note && <p className="mb-2">{item.note}</p>}

                    <div className="mt-3">
                      <div className="fw-bold mb-1">وسائل التواصل:</div>
                      {(item.contactMethods || []).map((c, idx) => (
                        <div key={idx} className="small">
                          {c.method === 'phone' ? '📞' : '💬'} {c.number}
                        </div>
                      ))}
                    </div>
                  </Card.Body>
                  <Card.Footer className="small text-muted">
                    أضيفت في: {new Date(item.createdAt).toLocaleString('fr-FR')}
                  </Card.Footer>
                </Card>
              </Col>
            ))}
          </Row>

          {list.length > PAGE_SIZE && (
            <div className="d-flex justify-content-center gap-2 mt-3">
              <Button variant="outline-secondary" disabled={page===1} onClick={()=>setPage(p=>p-1)}>السابق</Button>
              <div className="px-2 pt-2 small">صفحة {page} من {Math.ceil(list.length/PAGE_SIZE)}</div>
              <Button variant="outline-secondary" disabled={page===Math.ceil(list.length/PAGE_SIZE)} onClick={()=>setPage(p=>p+1)}>التالي</Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function ReadyDonors() {
  const q = useQuery();
  const defaultKey = q.get('tab') === 'general' ? 'general' : 'blood';

  return (
    <Container className="py-4" dir="rtl">
      <div className="mb-3">
        <h2 className="fw-bold">لائحة المستعدين للتبرعات</h2>
        <div className="text-muted">ابحث سريعًا عن متبرعين جاهزين للتواصل.</div>
      </div>

      <Tabs defaultActiveKey={defaultKey} activeKey={defaultKey} id="ready-tabs" className="mb-3"
        onSelect={(k)=> {
          const base = '/ready-donors';
          const s = new URLSearchParams(window.location.search);
          s.set('tab', k);
          window.history.replaceState(null, '', `${base}?${s.toString()}`);
        }}
      >
        <Tab eventKey="blood" title="التبرع بالدم">
          <BloodTab />
        </Tab>
        <Tab eventKey="general" title="التبرعات العامة">
          <GeneralTab />
        </Tab>
      </Tabs>
    </Container>
  );
}
