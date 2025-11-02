// src/pages/DashboardWrapper.jsx
import React, { useEffect, useState } from 'react';
import DashboardPage from './DashboardPage.jsx';
import fetchWithInterceptors from '../services/fetchWithInterceptors.js';

export default function DashboardWrapper() {
  const [userName, setUserName] = useState('');
  const [stats, setStats] = useState(null);

  const [latestBloodRequests, setLatestBloodRequests] = useState([]);
  const [latestDonationRequests, setLatestDonationRequests] = useState([]);

  const [myRequests, setMyRequests] = useState([]);
  const [myOffers, setMyOffers] = useState([]);

  const [loading, setLoading] = useState(true);

  // مساعد لاستخراج قائمة من body بأي شكل
  const listFrom = (body) => {
    if (!body) return [];
    if (Array.isArray(body)) return body;
    if (Array.isArray(body.data)) return body.data;
    if (Array.isArray(body.docs)) return body.docs;
    if (Array.isArray(body.items)) return body.items;
    return [];
  };

  useEffect(() => {
    // نجيب بيانات المستخدم من localStorage مثلاً
    let currentUser = null;
    try {
      const raw = localStorage.getItem('user');
      if (raw) currentUser = JSON.parse(raw);
    } catch (e) {
      console.warn('Failed to parse user from localStorage', e);
    }
    setUserName(
      currentUser?.name ||
      currentUser?.fullName ||
      currentUser?.username ||
      'المستخدم'
    );

    const fetchAll = async () => {
      try {
        // 1) احصائيات عامة للوحة التحكم
        let statsData = {
          activeBlood: 0,
          urgentBlood: 0,
          activeDonations: 0,
          pendingReviews: 0,
        };
        try {
          const statsRes = await fetchWithInterceptors('/api/dashboard/stats', {
            method: 'GET',
          });
          if (statsRes?.body) {
            statsData = {
              activeBlood: statsRes.body.activeBlood ?? 0,
              urgentBlood: statsRes.body.urgentBlood ?? 0,
              activeDonations: statsRes.body.activeDonations ?? 0,
              pendingReviews: statsRes.body.pendingReviews ?? 0,
            };
          }
        } catch {
          // fallback تجريبي
          statsData = {
            activeBlood: 3,
            urgentBlood: 1,
            activeDonations: 5,
            pendingReviews: 2,
          };
        }
        setStats(statsData);

        // 2) آخر طلبات الدم العامة
        let bloodList = [];
        try {
          const bloodRes = await fetchWithInterceptors(
            '/api/blood-requests?status=active&limit=5',
            { method: 'GET' }
          );
          bloodList = listFrom(bloodRes?.body).map((b) => ({
            id: b._id || b.id || Math.random().toString(36),
            title: b.description || b.title || 'طلب تبرع بالدم',
            bloodType: b.bloodType || '—',
            location: b.location || '—',
            deadline: b.deadline || b.createdAt || null,
            isUrgent: b.isUrgent === true,
          }));
        } catch {
          bloodList = [
            {
              id: 'blood-demo-1',
              title: 'حالة مستعجلة بعد حادث سير',
              bloodType: 'A+',
              location: 'نواكشوط',
              deadline: new Date().toISOString(),
              isUrgent: true,
            },
          ];
        }
        setLatestBloodRequests(bloodList);

        // 3) آخر الطلبات العامة (مال/سكن/لوازم...)
        let generalList = [];
        try {
          const genRes = await fetchWithInterceptors(
            '/api/donationRequests?limit=5',
            { method: 'GET' }
          );
          generalList = listFrom(genRes?.body).map((d) => ({
            id: d._id || d.id || Math.random().toString(36),
            category: d.category || 'مساعدة',
            title: d.type || d.title || 'طلب مساعدة',
            amountNeeded: d.amount || d.amountNeeded || null,
            place: d.place || d.location || '—',
            isUrgent: d.isUrgent === true,
          }));
        } catch {
          generalList = [
            {
              id: 'don-demo-1',
              category: 'التعليم',
              title: 'لوازم مدرسية لطفل',
              amountNeeded: 5000,
              place: 'ألاك',
              isUrgent: true,
            },
          ];
        }
        setLatestDonationRequests(generalList);

        // 4) طلباتي أنا (للدم والعام)
        let mine = [];
        try {
          const mineRes = await fetchWithInterceptors('/api/me/requests', {
            method: 'GET',
          });
          mine = listFrom(mineRes?.body).map((r) => ({
            id: r._id || r.id || Math.random().toString(36),
            title: r.title || r.description || r.type || 'طلب',
            kind: r.kind || r.requestType || 'general', // 'blood' أو 'general'
            bloodType: r.bloodType,
            category: r.category,
            isUrgent: r.isUrgent === true,
            status: r.status || 'قيد المتابعة',
          }));
        } catch {
          mine = [
            {
              id: 'req-me-1',
              title: 'مساعدة إيجاد سكن مؤقت',
              kind: 'general',
              category: 'سكن',
              isUrgent: true,
              status: 'قيد المراجعة',
            },
            {
              id: 'req-me-2',
              title: 'حالة تبرع بالدم لقريب مريض',
              kind: 'blood',
              bloodType: 'O-',
              isUrgent: true,
              status: 'نشطة',
            },
          ];
        }
        setMyRequests(mine);

        // 5) عروضي / تبرعاتي اللي قدمتها لناس آخرين
        let offers = [];
        try {
          const offRes = await fetchWithInterceptors('/api/me/offers', {
            method: 'GET',
          });
          offers = listFrom(offRes?.body).map((o) => ({
            id: o._id || o.id || Math.random().toString(36),
            title: o.title || 'عرض مساعدة',
            toWhom: o.toWhom || o.receiverName || 'مستخدم',
            status: o.status || 'pending', // pending / accepted / done
          }));
        } catch {
          offers = [
            {
              id: 'offer-me-1',
              title: 'تبرع بملابس شتوية',
              toWhom: 'عائلة في وضع صعب',
              status: 'accepted',
            },
            {
              id: 'offer-me-2',
              title: 'تبرع بمبلغ بسيط',
              toWhom: 'حالة مستعجلة',
              status: 'pending',
            },
          ];
        }
        setMyOffers(offers);
      } catch (err) {
        console.error('Dashboard data fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  if (loading) {
    return (
      <main
        style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '3rem 1rem',
          fontFamily: 'Cairo, system-ui, sans-serif',
          textAlign: 'center',
        }}
        dir="rtl"
      >
        <p
          style={{
            fontWeight: 600,
            fontSize: '1rem',
            color: '#145c2f',
            marginBottom: '.5rem',
          }}
        >
          جاري تحميل لوحة التحكم…
        </p>
        <p
          style={{
            fontSize: '.85rem',
            color: '#666',
            fontWeight: 500,
          }}
        >
          لحظة من فضلك 🙏
        </p>
      </main>
    );
  }

  return (
    <DashboardPage
      userName={userName}
      stats={stats}
      latestBloodRequests={latestBloodRequests}
      latestDonationRequests={latestDonationRequests}
      myRequests={myRequests}
      myOffers={myOffers}
    />
  );
}
