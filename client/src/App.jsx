// src/App.js
import React, { useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './AuthContext';
import Header from './components/Header.jsx';
import UserPage from './pages/UserPage';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import Register from './pages/Register';
import Login from './pages/Login';
import BloodDonationList from './components/BloodDonationListe';
import SocialMedia from './components/SocialMedia';
import DonationDetails from './components/DonationDetails';
import CampaignDetails from './components/CampaignDetails';
import BloodDonationForm from './components/BloodDonationForm';
import Donor from './components/Donor';
import InfoBar from './components/InfoBar';
import './App.css';
import UserForm from './components/UserForm';
import UserProfile from './pages/UserProfile';
import AddUserserPage from './pages/addUserPage';
import PasswordReset from './components/PasswordReset';
import DonationRequestForm from './components/DonationRequestForm';
import DonorListe from './components/BloodDonationListe';
import BloodDonationDetails from './components/BloodDonationDetails';
import NotificationsPage from './pages/NotificationsPage';
import ChatPage from './pages/ChatPage';
import ChatList from './pages/ChatList';
import MyRequestDetails from './pages/MyRequestDetails';
import About from './components/About';
import DonationRequestList from './components/DonationRequestList';
import DonationRequestDetails from './components/DonationRequestDetails';
import { connectSocket } from './socket';
import PublicProfile from './pages/PublicProfile';
import OrangeButtonsShowcase from './components/OrangeButtonsShowcase';
import ButtonsDemo from './components/ButtonsDemo';
import NotFound from './pages/NotFound';
import BloodDonors from './pages/BloodDonors';
import GeneralDonors from './pages/GeneralDonors';
import ReaydToDonateBlood from './components/ReadyToDonateBlood.jsx';
// ✅ الحارس
import RequireAuth from './components/RequireAuth';
// ✅ صفحة تفاصيل التبرّع/التأكيد/العرض
import DonationConfirmationDetails from './pages/DonationConfirmationDetails';
import DonationRequestConfirmationDetails from './pages/DonationRequestConfirmationDetails';
import ChatBox from './components/ChatBox.js';

function App() {
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('token') || localStorage.getItem('authToken');
    if (token) connectSocket(token);
  }, []);

  // تمرير الصفحة لأعلى عند تغيير المسار
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

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
        <Header />
        <SocialMedia />
        <div className="page-wrapper">
          <Routes>
            {/* عامّة */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/add-user" element={<AddUserserPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/reset-password" element={<PasswordReset />} />
            <Route path="/blood-donations" element={<BloodDonationList />} />
            <Route path="/donations" element={<DonationRequestList />} />
            <Route path="/about" element={<About />} />
            <Route path="/users" element={<UserPage />} />
            <Route path="/buttons-showcase" element={<OrangeButtonsShowcase />} />
            <Route path="/buttons-demo" element={<ButtonsDemo />} />
            <Route path="/404" element={<NotFound />} />

            {/* محميّة */}
            <Route path="/donation-details/:id" element={<RequireAuth><DonationDetails /></RequireAuth>} />
            <Route path="/blood-donation-details/:id" element={<RequireAuth><BloodDonationDetails /></RequireAuth>} />
            <Route path="/campaign/:id" element={<RequireAuth><CampaignDetails /></RequireAuth>} />
            <Route path="/donations/:id" element={<RequireAuth><DonationRequestDetails /></RequireAuth>} />
            <Route path="/my-request-details/:id" element={<RequireAuth><MyRequestDetails /></RequireAuth>} />
            <Route path="/donation-requests" element={<RequireAuth><DonationRequestForm /></RequireAuth>} />
            <Route path="/blood-donation" element={<RequireAuth><BloodDonationForm /></RequireAuth>} />
             <Route path="/ready-blood" element={<RequireAuth><ٌReadyToDonateBlood /></RequireAuth>} />
            <Route path="/chat/:recipientId" element={<RequireAuth><ChatPage/></RequireAuth>} />
            <Route path="/messages" element={<RequireAuth><ChatList /></RequireAuth>} />
            <Route path="/notifications" element={<RequireAuth><NotificationsPage /></RequireAuth>} />
            <Route path="/users/:id" element={<RequireAuth><PublicProfile /></RequireAuth>} />
            
            {/* صفحات المتبرعين - محمية للمستخدمين المسجلين فقط */}
            <Route path="/donors/blood" element={<BloodDonors />} />
            <Route path="/donors/general" element={<GeneralDonors />} />

            {/* تفاصيل التأكيد */}
            <Route path="/donation-confirmations/:id" element={<RequireAuth><DonationConfirmationDetails /></RequireAuth>} />
            <Route path="/donation-request-confirmations/:id" element={<RequireAuth><DonationRequestConfirmationDetails /></RequireAuth>} />

            <Route path="/profile" element={<RequireAuth><UserProfile /></RequireAuth>} />
            
            {/* صفحة 404 - يجب أن تكون آخر route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </AuthProvider>
  );
}

export default App;
