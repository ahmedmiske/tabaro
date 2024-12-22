import React, { useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import Header from './components/Header';
import UserPage from './pages/UserPage';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import Register from './pages/Register';
import Login from './pages/Login';
import SocialMedia from './components/SocialMedia';
import DonationDetails from './components/DonationDetails';
import CampaignDetails from './components/CampaignDetails'; // Import the new component
import Donor from './components/Donor';
import './App.css';
import InfoBar from './components/InfoBar';

// import ImportantInfoBar from './components/ImportantInfoBar';
// import Notifications from './components/Notifications';

function App({ donations }) {
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      const header = document.querySelector('.header');
      const footer = document.querySelector('.footer');
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const windowHeight = window.innerHeight;
      const bodyHeight = document.body.scrollHeight - windowHeight;

      if (scrollTop >= bodyHeight - 50) {
        footer.classList.add('show');
      } else {
        footer.classList.remove('show');
      }

      if (scrollTop > 100) {
        header.classList.add('hide');
      } else {
        header.classList.remove('hide');
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location]);

  return (
    <div>
        <InfoBar />
        <Header />
      <SocialMedia />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/users" element={<UserPage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/donation-details/:id" element={<DonationDetails />} />
        <Route path="/campaign/:id" element={<CampaignDetails />} /> 
        <Route path="/donor" element={<Donor />} /> 
      </Routes>
      <Footer />
    </div>
  );
}

export default App;
