import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfUse from './pages/TermsOfUse';
// src/App.js
import React, { useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './AuthContext';
import SimpleHeader from './components/SimpleHeader';
import Footer from './components/Footer';
import './App.css';

// صفحات عامة
import LandingPageSimple from './pages/LandingPageSimple';
import Login from './pages/Login';
import UserPage from './pages/UserPage';
import AddUserserPage from './pages/addUserPage';
import UserProfile from './pages/UserProfile';
import PublicProfile from './pages/PublicProfile';

// مكونات التبرع
import BloodDonationList from './components/BloodDonationListeNew';
import BloodDonationForm from './components/BloodDonationForm';
import BloodDonationDetails from './components/BloodDonationDetails';
import DonationDetails from './components/DonationDetails';
import DonationRequestForm from './components/DonationRequestForm';
import DonationRequestList from './components/DonationRequestList';
import DonationRequestDetails from './components/DonationRequestDetails';

// صفحات أخرى
import About from './components/AboutSimple';
import Contact from './pages/Contact';
import BloodDonationInfo from './pages/BloodDonationInfo';
import SocialMedia from './components/SocialMedia';
import CampaignDetails from './components/CampaignDetails';
import PasswordReset from './components/PasswordReset';
import NotificationsPage from './pages/NotificationsPage';
import ChatPage from './pages/ChatPage';
import ChatList from './pages/ChatList';
import MyRequestDetails from './pages/MyRequestDetails';

// صفحات التبرعات العامة
import GeneralDonations from './pages/GeneralDonations';
import CreateCampaign from './pages/CreateCampaign';
import CampaignsList from './pages/CampaignsList';

// مكونات الحماية والتأكيد
import RequireAuth from './components/RequireAuth';
import DonationConfirmationDetails from './pages/DonationConfirmationDetails';
import DonationRequestConfirmationDetails from './pages/DonationRequestConfirmationDetails';

// اتصال الـ Socket
import { connectSocket } from './socket';

function App() {
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('token') || localStorage.getItem('authToken');
    if (token) connectSocket(token);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const header = document.querySelector('.header-container'); // ← التعديل هنا
      const footer = document.querySelector('.footer');
      if (!header || !footer) return;

      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const windowHeight = window.innerHeight;
      const bodyHeight = document.body.scrollHeight - windowHeight;

      if (scrollTop >= bodyHeight - 50) footer.classList.add('show');
      else footer.classList.remove('show');

      if (scrollTop > 100) header.classList.add('hide');
      else header.classList.remove('hide');
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location]);

  return (
    <AuthProvider>
      <div className='page-app'>
        <SimpleHeader />
        <SocialMedia />
        <div className="page-wrapper">
          <Routes>
            {/* عامّة */}
            <Route path="/" element={<LandingPageSimple />} />
            <Route path="/add-user" element={<AddUserserPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/reset-password" element={<PasswordReset />} />
            <Route path="/blood-donations" element={<BloodDonationList />} />
            <Route path="/donations" element={<DonationRequestList />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfUse />} />
            <Route path="/users" element={<UserPage onEdit={(user) => console.log('edit', user)} onDelete={(user) => { console.log('delete', user); return Promise.resolve(); }} />} />
            
            {/* صفحات التبرعات العامة */}
            <Route path="/general-donations" element={<GeneralDonations />} />
            <Route path="/campaigns/list" element={<CampaignsList />} />
            <Route path="/campaigns/create" element={<RequireAuth><CreateCampaign /></RequireAuth>} />

            {/* محميّة */}
            <Route path="/donation-details/:id" element={<RequireAuth><DonationDetails /></RequireAuth>} />
            <Route path="/blood-donation-details/:id" element={<RequireAuth><BloodDonationDetails /></RequireAuth>} />
            <Route path="/campaign/:id" element={<RequireAuth><CampaignDetails /></RequireAuth>} />
            <Route path="/donations/:id" element={<RequireAuth><DonationRequestDetails /></RequireAuth>} />
            <Route path="/my-request-details/:id" element={<RequireAuth><MyRequestDetails /></RequireAuth>} />
            <Route path="/donation-requests" element={<RequireAuth><DonationRequestForm /></RequireAuth>} />
            <Route path="/blood-donation" element={<RequireAuth><BloodDonationForm /></RequireAuth>} />
            {/* صفحة معلومات التبرع بالدم */}
            <Route path="/blood-donation-info" element={<BloodDonationInfo />} />
            <Route path="/chat/:recipientId" element={<RequireAuth><ChatPage /></RequireAuth>} />
            <Route path="/messages" element={<RequireAuth><ChatList /></RequireAuth>} />
            <Route path="/notifications" element={<RequireAuth><NotificationsPage /></RequireAuth>} />
            <Route path="/users/:id" element={<RequireAuth><PublicProfile /></RequireAuth>} />

            {/* تفاصيل التأكيد */}
            <Route path="/donation-confirmations/:id" element={<RequireAuth><DonationConfirmationDetails /></RequireAuth>} />
            <Route path="/donation-request-confirmations/:id" element={<RequireAuth><DonationRequestConfirmationDetails /></RequireAuth>} />

            <Route path="/profile" element={<RequireAuth><UserProfile /></RequireAuth>} />
          </Routes>
        </div>
        <Footer />
      </div>
    </AuthProvider>
  );
}

export default App;
