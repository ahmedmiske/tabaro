// src/App.js
import React, { useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './AuthContext';
import Header from './components/Header';
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

function App() {
  const location = useLocation();

  // أنشئ اتصال السوكت مرة واحدة عند توفّر التوكن
  useEffect(() => {
    const token = localStorage.getItem('token') || localStorage.getItem('authToken');
    if (token) connectSocket(token);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const header = document.querySelector('.header');
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
            <Route path="/" element={<LandingPage />} />
            <Route path="/users" element={<UserPage />} />
            <Route path="/add-user" element={<AddUserserPage />} />
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/login" element={<Login />} />
            <Route path="/donation-details/:id" element={<DonationDetails />} />
            <Route path="/blood-donation-details/:id" element={<BloodDonationDetails />} />
            <Route path="/campaign/:id" element={<CampaignDetails />} />
            <Route path="/donation-requests" element={<DonationRequestForm />} />
            <Route path="/donations" element={<DonationRequestList />} />
            <Route path="/donations/:id" element={<DonationRequestDetails />} />
            <Route path="/blood-donation" element={<BloodDonationForm />} />
            <Route path="/donor-list" element={<DonorListe />} />
            <Route path="/blood-donations" element={<BloodDonationList />} />
            <Route path="/reset-password" element={<PasswordReset />} />
            <Route path="/chat/:recipientId" element={<ChatPage />} />
            <Route path="/messages" element={<ChatList />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/my-request-details/:id" element={<MyRequestDetails />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </AuthProvider>
  );
}

export default App;
