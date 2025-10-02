import React from 'react';

const PrivacyPolicy = () => (
  <div className="container" style={{maxWidth: 800, margin: '40px auto', padding: '2rem', background: '#fff', borderRadius: 16, boxShadow: '0 2px 16px rgba(0,0,0,0.06)'}}>
    <h1 style={{color: 'var(--eh-brand)', fontWeight: 800, fontSize: '2rem', marginBottom: 24}}>سياسة الخصوصية</h1>
    <p style={{fontSize: '1.1rem', color: '#374151', marginBottom: 16}}>
      نحن نولي أهمية كبيرة لخصوصيتك وحماية بياناتك الشخصية. تهدف هذه الصفحة إلى شرح كيفية جمع واستخدام وحماية المعلومات التي تقدمها لنا عند استخدامك لمنصتنا.
    </p>
    <h2 style={{color: 'var(--eh-brand)', fontWeight: 700, fontSize: '1.2rem', marginTop: 32}}>ما هي المعلومات التي نجمعها؟</h2>
    <ul style={{margin: '1rem 0 1.5rem 1.5rem', color: '#374151'}}>
      <li>معلومات التسجيل (الاسم، البريد الإلكتروني، رقم الهاتف...)</li>
      <li>معلومات التبرع أو الطلبات التي تقدمها عبر المنصة</li>
      <li>بيانات الاستخدام (مثل الصفحات التي تزورها ووقت التصفح)</li>
    </ul>
    <h2 style={{color: 'var(--eh-brand)', fontWeight: 700, fontSize: '1.2rem', marginTop: 32}}>كيف نستخدم هذه المعلومات؟</h2>
    <ul style={{margin: '1rem 0 1.5rem 1.5rem', color: '#374151'}}>
      <li>لتقديم خدماتنا وتحسين تجربة المستخدم</li>
      <li>للتواصل معك بشأن الطلبات أو التبرعات</li>
      <li>لضمان الأمان وحماية المستخدمين</li>
    </ul>
    <h2 style={{color: 'var(--eh-brand)', fontWeight: 700, fontSize: '1.2rem', marginTop: 32}}>هل نشارك بياناتك مع أطراف ثالثة؟</h2>
    <p style={{color: '#374151'}}>لا نقوم ببيع أو مشاركة بياناتك الشخصية مع أي جهة خارجية إلا في حالات قانونية أو لتحسين الخدمة بعد موافقتك.</p>
    <h2 style={{color: 'var(--eh-brand)', fontWeight: 700, fontSize: '1.2rem', marginTop: 32}}>حقوقك</h2>
    <ul style={{margin: '1rem 0 1.5rem 1.5rem', color: '#374151'}}>
      <li>يحق لك طلب معرفة أو تعديل أو حذف بياناتك في أي وقت</li>
      <li>يمكنك التواصل معنا لأي استفسار حول خصوصيتك</li>
    </ul>
    <p style={{marginTop: 32, color: '#64748b', fontSize: '0.95rem'}}>قد نقوم بتحديث سياسة الخصوصية من وقت لآخر. سيتم نشر أي تغييرات هنا.</p>
  </div>
);

export default PrivacyPolicy;
