// client/src/components/SearchResults.jsx
import React, { useEffect, useState, useMemo } from "react";
import { useLocation, Link } from "react-router-dom";
import { Card, Spinner, Alert, Badge, Button } from "react-bootstrap";
import { FiHeart, FiDroplet, FiMapPin } from "react-icons/fi";
import fetchWithInterceptors from "../services/fetchWithInterceptors";
import "./SearchResults.css";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";

function useQueryParam() {
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  // نقبل q أو query (للخلفية أو للروابط القديمة)
  return params.get("q") || params.get("query") || "";
}

function SearchResults() {
  const query = useQueryParam();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const controller = new AbortController();

    const load = async () => {
      try {
        setLoading(true);
        setError("");

        const { body, ok } = await fetchWithInterceptors(
          `${API_BASE}/api/search?q=${encodeURIComponent(query)}`,
          { signal: controller.signal }
        );

        if (!ok) {
          setError("حدث خطأ أثناء جلب النتائج.");
          setResults([]);
          return;
        }

        const data = body?.data || body || [];
        setResults(Array.isArray(data) ? data : []);
      } catch (err) {
        if (err.name === "AbortError") return;
        setError("تعذر الاتصال بالخادم. حاول مرة أخرى.");
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    load();

    return () => controller.abort();
  }, [query]);

  // تقسيم النتائج حسب النوع
  const bloodResults = useMemo(
    () => results.filter((r) => r.type === "blood"),
    [results]
  );
  const generalResults = useMemo(
    () => results.filter((r) => r.type !== "blood"),
    [results]
  );

  return (
    <main className="container py-4 search-page" dir="rtl">
      {/* العنوان الرئيسي */}
      <h2 className="search-page__title">
        نتائج البحث عن: <span>{query ? `«${query}»` : "—"}</span>
      </h2>

      {/* ملخص النتائج + أزرار الذهاب للقوائم */}
      {!loading && !error && results.length > 0 && (
        <section className="search-page__summary-box">
          <div className="d-flex flex-wrap justify-content-between align-items-center">
            <div className="search-page__summary-badges">
              <Badge bg="danger" pill>
                طلبات التبرع بالدم: {bloodResults.length}
              </Badge>
              <Badge bg="success" pill>
                التبرعات العامة: {generalResults.length}
              </Badge>
              <Badge bg="secondary" pill>
                الإجمالي: {results.length}
              </Badge>
            </div>

            <div className="search-page__summary-buttons mt-3 mt-md-0">
              {bloodResults.length > 0 && (
                <Button
                  as={Link}
                  to="/blood-donations"
                  size="sm"
                  variant="outline-danger"
                >
                  عرض قائمة طلبات التبرع بالدم
                </Button>
              )}
              {generalResults.length > 0 && (
                <Button
                  as={Link}
                  to="/donations"
                  size="sm"
                  variant="outline-success"
                >
                  عرض قائمة التبرعات العامة
                </Button>
              )}
            </div>
          </div>
        </section>
      )}

      {loading && (
        <div className="d-flex align-items-center gap-2 my-4">
          <Spinner animation="border" role="status" />
          <span>جاري البحث عن الطلبات المناسبة...</span>
        </div>
      )}

      {error && (
        <Alert variant="danger" className="mt-3">
          {error}
        </Alert>
      )}

      {!loading && !error && query && results.length === 0 && (
        <Alert variant="info" className="mt-3">
          لم يتم العثور على طلبات تبرع تطابق كلمات البحث.
        </Alert>
      )}

      {/* قسم طلبات التبرع بالدم */}
      {bloodResults.length > 0 && (
        <section className="mt-4">
          <h3 className="search-page__section-title">
            طلبات التبرع بالدم المطابقة للبحث
          </h3>
          <div className="row justify-content-center">
            {bloodResults.map((item) => {
              const detailsLink = `/blood-donation-details/${item._id}`;
              const listLink = "/blood-donations";

              return (
                <div
                  key={item._id}
                  className="col-12 col-md-8 col-lg-6 mb-3"
                >
                  <Card className="h-100 shadow-sm search-page__card">
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <Card.Title className="mb-0 fs-5">
                          {item.title || "طلب تبرع بالدم"}
                        </Card.Title>
                        <Badge bg="danger">تبرع بالدم</Badge>
                      </div>

                      <Card.Text className="text-muted small card-text">
                        {item.description
                          ? item.description.slice(0, 150) +
                            (item.description.length > 150 ? "..." : "")
                          : "لا يوجد وصف مفصل."}
                      </Card.Text>

                      {/* ميتاداتا (فصيلة الدم / المدينة) */}
                      <div className="search-page__meta-row">
                        <Badge bg="light" text="dark">
                          <FiDroplet />{" "}
                          {item.bloodType
                            ? `فصيلة ${item.bloodType}`
                            : "تبرع بالدم"}
                        </Badge>

                        {item.city && (
                          <div className="search-page__location">
                            <FiMapPin size={14} />
                            <span>{item.city}</span>
                          </div>
                        )}
                      </div>

                      <div className="search-page__card-actions">
                        <Button
                          size="sm"
                          variant="outline-danger"
                          as={Link}
                          to={detailsLink}
                        >
                          عرض التفاصيل
                        </Button>
                        <Button
                          size="sm"
                          variant="link"
                          className="search-page__link-to-list"
                          as={Link}
                          to={listLink}
                        >
                          الانتقال إلى قائمة طلبات الدم
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* قسم التبرعات العامة */}
      {generalResults.length > 0 && (
        <section className="mt-4">
          <h3 className="search-page__section-title">
            طلبات التبرع العامة المطابقة للبحث
          </h3>
          <div className="row justify-content-center">
            {generalResults.map((item) => {
              const detailsLink = `/donations/${item._id}`;
              const listLink = "/donations";

              return (
                <div
                  key={item._id}
                  className="col-12 col-md-8 col-lg-6 mb-3"
                >
                  <Card className="h-100 shadow-sm search-page__card">
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <Card.Title className="mb-0 fs-5">
                          {item.title || "طلب تبرع"}
                        </Card.Title>
                        <Badge bg="success">
                          {item.category || "تبرع عام"}
                        </Badge>
                      </div>

                      <Card.Text className="text-muted small card-text">
                        {item.description
                          ? item.description.slice(0, 150) +
                            (item.description.length > 150 ? "..." : "")
                          : "لا يوجد وصف مفصل."}
                      </Card.Text>

                      {/* ميتاداتا (نوع التبرع / المدينة) */}
                      <div className="search-page__meta-row">
                        <Badge bg="light" text="dark">
                          <FiHeart /> {item.donationType || "تبرع عام"}
                        </Badge>

                        {item.city && (
                          <div className="search-page__location">
                            <FiMapPin size={14} />
                            <span>{item.city}</span>
                          </div>
                        )}
                      </div>

                      <div className="search-page__card-actions">
                        <Button
                          size="sm"
                          variant="outline-success"
                          as={Link}
                          to={detailsLink}
                        >
                          عرض التفاصيل
                        </Button>
                        <Button
                          size="sm"
                          variant="link"
                          className="search-page__link-to-list"
                          as={Link}
                          to={listLink}
                        >
                          الانتقال إلى قائمة التبرعات العامة
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </main>
  );
}

export default SearchResults;
