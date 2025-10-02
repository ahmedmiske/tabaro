import React from 'react';

const TermsOfUse = () => (
  <div className="container" style={{maxWidth: 800, margin: '40px auto', padding: '2rem', background: '#fff', borderRadius: 16, boxShadow: '0 2px 16px rgba(0,0,0,0.06)'}}>
    <h1 style={{color: 'var(--eh-brand)', fontWeight: 800, fontSize: '2rem', marginBottom: 24}}>شروط الاستخدام</h1>
    <p style={{fontSize: '1.1rem', color: '#374151', marginBottom: 16}}>
      باستخدامك لمنصة التبرع الوطنية، فإنك توافق على الالتزام بالشروط والأحكام التالية. يرجى قراءة هذه الشروط بعناية قبل استخدام المنصة.
    </p>
    <h2 style={{color: 'var(--eh-brand)', fontWeight: 700, fontSize: '1.2rem', marginTop: 32}}>1. الاستخدام المشروع</h2>
    <ul style={{margin: '1rem 0 1.5rem 1.5rem', color: '#374151'}}>
      <li>يجب استخدام المنصة فقط للأغراض الإنسانية والخيرية المتعلقة بالتبرع بالدم.</li>
      <li>يمنع استخدام المنصة لأي أغراض تجارية أو غير قانونية.</li>
    </ul>
    <h2 style={{color: 'var(--eh-brand)', fontWeight: 700, fontSize: '1.2rem', marginTop: 32}}>2. الحسابات والبيانات</h2>
    <ul style={{margin: '1rem 0 1.5rem 1.5rem', color: '#374151'}}>
      <li>يجب تقديم معلومات دقيقة وصحيحة عند التسجيل.</li>
      <li>أنت مسؤول عن سرية بيانات الدخول الخاصة بك.</li>
      <li>يحق للإدارة حذف أو تعليق أي حساب يخالف الشروط.</li>
    </ul>
    <h2 style={{color: 'var(--eh-brand)', fontWeight: 700, fontSize: '1.2rem', marginTop: 32}}>3. حماية البيانات</h2>
    <p style={{color: '#374151'}}>نلتزم بحماية بياناتك وفق سياسة الخصوصية، ولا نشاركها مع أي طرف ثالث إلا بموافقتك أو لأسباب قانونية.</p>
    <h2 style={{color: 'var(--eh-brand)', fontWeight: 700, fontSize: '1.2rem', marginTop: 32}}>4. التعديلات على الشروط</h2>
    <p style={{color: '#374151'}}>يحق لنا تعديل هذه الشروط في أي وقت. سيتم نشر التعديلات على هذه الصفحة ويعتبر استمرارك في استخدام المنصة موافقة عليها.</p>
    <h2 style={{color: 'var(--eh-brand)', fontWeight: 700, fontSize: '1.2rem', marginTop: 32}}>5. التواصل</h2>
    <p style={{color: '#374151'}}>لأي استفسار أو شكوى، يمكنك التواصل معنا عبر صفحة الاتصال.</p>
    <p style={{marginTop: 32, color: '#64748b', fontSize: '0.95rem'}}>آخر تحديث: أكتوبر 2025</p>
  </div>
);

export default TermsOfUse;
