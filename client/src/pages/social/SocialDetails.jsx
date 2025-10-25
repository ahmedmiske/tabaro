import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getSocialAd, renewSocialAd, reportSocialAd, startAdConversation } from '../../services/api/socialAds.api.js';
import { CATEGORY_LABELS_AR, STATUS_LABELS_AR } from '../../constants/social.enums.js';
import '../../styles/social/social-details.css';

function SocialDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ad, setAd] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [reporting, setReporting] = useState(false);
  const [reportMsg, setReportMsg] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      setErr('');
      const data = await getSocialAd(id);
      setAd(data);
    } catch (e) {
      setErr(e.message || 'تعذر تحميل الإعلان');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [id]);

  const onRenew = async () => {
    try {
      await renewSocialAd(id);
      await load();
      alert('تم تجديد صلاحية الإعلان.');
    } catch (e) {
      alert(e.message || 'تعذر التجديد');
    }
  };

  const onStartConversation = async () => {
    try {
      const conv = await startAdConversation(id);
      // وجّه المستخدم لواجهة المحادثة لديك إن كانت /messages/:convId
      if (conv?.id) navigate(`/messages/${conv.id}`);
      else alert('تم بدء المحادثة.');
    } catch (e) {
      alert(e.message || 'تعذر بدء المحادثة');
    }
  };

  const onReport = async () => {
    try {
      setReporting(true);
      await reportSocialAd(id, 'Other', reportMsg);
      setReporting(false);
      setReportMsg('');
      alert('تم إرسال البلاغ. شكرًا لتعاونك.');
    } catch (e) {
      setReporting(false);
      alert(e.message || 'تعذر إرسال البلاغ');
    }
  };

  if (loading) return <div className="state">جارِ التحميل…</div>;
  if (err) return <div className="state state--error">{err}</div>;
  if (!ad) return <div className="state">لم يتم العثور على الإعلان.</div>;

  const { title, description, category, status, location, imageUrl, createdAt, extraFields, authorId } = ad;

  return (
    <article className="social-details" dir="rtl">
      <header className="sd-head">
        <span className={`sd-chip cat-${category?.toLowerCase()}`}>{CATEGORY_LABELS_AR[category] || category}</span>
        <span className={`sd-status st-${status}`}>{STATUS_LABELS_AR[status] || status}</span>
        <h1 className="sd-title">{title}</h1>
        <p className="sd-meta">
          <span>{location?.wilaya} — {location?.city}</span>
          <time dateTime={createdAt}> — {new Date(createdAt).toLocaleString('ar-MA')}</time>
        </p>
      </header>

      {imageUrl && (
        <div className="sd-media">
          <img src={imageUrl} alt="صورة الإعلان" />
        </div>
      )}

      <section className="sd-content">
        <p className="sd-desc">{description}</p>

        {!!extraFields && (
          <div className="sd-extra">
            <h3>تفاصيل إضافية</h3>
            {ad.extraFields && Object.keys(ad.extraFields).length > 0 ? (
  <div className="extra-fields">
    <ul>
      {Object.entries(ad.extraFields).map(([key, value]) => (
        <li key={key}>
          <strong>
            {key === "targetAudience"
              ? "الفئة المستهدفة"
              : key === "ideaType"
              ? "نوع الفكرة"
              : key}
            :
          </strong>{" "}
          {value}
        </li>
      ))}
    </ul>
  </div>
) : (
  <p>لا توجد تفاصيل إضافية</p>
)}

          </div>
        )}
      </section>

      <footer className="sd-actions">
        <button className="btn" onClick={onStartConversation}>تواصل مع صاحب الإعلان</button>
        <button className="btn btn-outline" onClick={() => window.history.back()}>رجوع</button>

        {/* أزرار للمالك فقط — اربطها بشرط المِلكية من سياق المستخدم لديك */}
        <button className="btn btn-ghost" onClick={onRenew}>تجديد الصلاحية</button>
        <Link to={`/social/edit/${id}`} className="btn btn-ghost">تعديل</Link>
      </footer>

      <section className="sd-report">
        <h3>الإبلاغ عن هذا الإعلان</h3>
        <textarea
          placeholder="اكتب سبب الإبلاغ بإيجاز…"
          value={reportMsg}
          onChange={(e) => setReportMsg(e.target.value)}
        />
        <button className="btn btn-danger" disabled={reporting || !reportMsg.trim()} onClick={onReport}>
          {reporting ? 'جارِ الإرسال…' : 'إرسال البلاغ'}
        </button>
      </section>

      <aside className="sd-note">
        <small>
          يرجى عدم مشاركة معلومات حساسة أو عناوين دقيقة. التواصل يتم داخل المنصّة حفاظًا على الخصوصية.
        </small>
      </aside>
    </article>
  );
}

export default SocialDetails;
