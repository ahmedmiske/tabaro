import React from 'react';

function DonatePage() {
  // نموذج طلب التبرع بالدم
  const [form, setForm] = React.useState({
    fullName: '',
    phone: '',
    email: '',
    bloodType: '',
    location: '',
    date: '',
    reason: '',
    notes: '',
    terms: false
  });
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState('');
  const [error, setError] = React.useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    // تحقق أساسي
    if (!form.fullName || !form.phone || !form.email || !form.bloodType || !form.location || !form.date || !form.terms) {
      setError('يرجى تعبئة جميع الحقول المطلوبة والموافقة على الشروط.');
      return;
    }
    setLoading(true);
    try {
      // إرسال البيانات للباكند
      const res = await fetch('/api/blood-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        setSuccess('تم إرسال الطلب بنجاح! سيتم التواصل معك قريباً.');
        setForm({
          fullName: '', phone: '', email: '', bloodType: '', location: '', date: '', reason: '', notes: '', terms: false
        });
      } else {
        setError('حدث خطأ أثناء إرسال الطلب. حاول مرة أخرى.');
      }
    } catch {
      setError('تعذر الاتصال بالخادم.');
    }
    setLoading(false);
  };

  return (
    <div className="donate-page" style={{padding: '2rem', maxWidth: 600, margin: '0 auto'}}>
      <h2 style={{color: '#e74c3c', fontWeight: 800, marginBottom: 24}}>طلب تبرع بالدم</h2>
      <form onSubmit={handleSubmit}>
        <div style={{marginBottom: 16}}>
          <label htmlFor="fullName" style={{fontWeight: 600}}>الاسم الكامل</label>
          <input type="text" id="fullName" name="fullName" style={{width: '100%', padding: 8, borderRadius: 6}} placeholder="أدخل اسمك الكامل" value={form.fullName} onChange={handleChange} />
        </div>
        <div style={{marginBottom: 16}}>
          <label htmlFor="phone" style={{fontWeight: 600}}>رقم الجوال</label>
          <input type="tel" id="phone" name="phone" style={{width: '100%', padding: 8, borderRadius: 6}} placeholder="مثال: 05XXXXXXXX" value={form.phone} onChange={handleChange} />
        </div>
        <div style={{marginBottom: 16}}>
          <label htmlFor="email" style={{fontWeight: 600}}>البريد الإلكتروني</label>
          <input type="email" id="email" name="email" style={{width: '100%', padding: 8, borderRadius: 6}} placeholder="example@email.com" value={form.email} onChange={handleChange} />
        </div>
        <div style={{marginBottom: 16}}>
          <label htmlFor="bloodType" style={{fontWeight: 600}}>فصيلة الدم</label>
          <select id="bloodType" name="bloodType" style={{width: '100%', padding: 8, borderRadius: 6}} value={form.bloodType} onChange={handleChange}>
            <option value="">-- اختر --</option>
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
          </select>
        </div>
        <div style={{marginBottom: 16}}>
          <label htmlFor="location" style={{fontWeight: 600}}>الموقع</label>
          <input type="text" id="location" name="location" style={{width: '100%', padding: 8, borderRadius: 6}} placeholder="اسم المستشفى أو المدينة" value={form.location} onChange={handleChange} />
        </div>
        <div style={{marginBottom: 16}}>
          <label htmlFor="date" style={{fontWeight: 600}}>تاريخ التبرع</label>
          <input type="date" id="date" name="date" style={{width: '100%', padding: 8, borderRadius: 6}} value={form.date} onChange={handleChange} />
        </div>
        <div style={{marginBottom: 16}}>
          <label htmlFor="reason" style={{fontWeight: 600}}>سبب الحاجة للتبرع</label>
          <input type="text" id="reason" name="reason" style={{width: '100%', padding: 8, borderRadius: 6}} placeholder="حالة طارئة، عملية جراحية، إلخ" value={form.reason} onChange={handleChange} />
        </div>
        <div style={{marginBottom: 16}}>
          <label htmlFor="notes" style={{fontWeight: 600}}>ملاحظات إضافية</label>
          <textarea id="notes" name="notes" style={{width: '100%', padding: 8, borderRadius: 6}} rows={3} placeholder="أي تفاصيل أو طلبات خاصة" value={form.notes} onChange={handleChange} />
        </div>
        <div style={{marginBottom: 16, display: 'flex', alignItems: 'center'}}>
          <input type="checkbox" id="terms" name="terms" style={{marginLeft: 8}} checked={form.terms} onChange={handleChange} />
          <label htmlFor="terms" style={{fontWeight: 600}}>أوافق على الشروط وسياسة المنصة</label>
        </div>
        {error && <div style={{color: '#e74c3c', marginBottom: 12, fontWeight: 700}}>{error}</div>}
        {success && <div style={{color: '#10b981', marginBottom: 12, fontWeight: 700}}>{success}</div>}
        <button type="submit" style={{background: '#e74c3c', color: '#fff', padding: '0.7rem 2rem', borderRadius: 24, fontWeight: 700, fontSize: 16}} disabled={loading}>{loading ? 'جاري الإرسال...' : 'إرسال الطلب'}</button>
      </form>
    </div>
  );
}

export default DonatePage;
