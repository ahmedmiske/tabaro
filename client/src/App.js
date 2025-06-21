import React, { useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import Header from './components/Header';
import UserPage from './pages/UserPage';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import Register from './pages/Register';
import Login from './pages/Login';
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
import DonationComponent from './components/DonationComponent';
import DonationRequestForm from './components/DonationRequestForm';
import DonorListe from './components/DonorListe';

function App() {
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      const header = document.querySelector('.header');
      const footer = document.querySelector('.footer');

      if (!header || !footer) return;

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
      {/* <InfoBar /> */}
      <Header />
      <SocialMedia />
      
      <div className="container">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/users" element={<UserPage />} />
        <Route path="/add-user" element={<AddUserserPage />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/login" element={<Login />} />
        <Route path="/donation-details/:id" element={<DonationDetails />} />
        <Route path="/campaign/:id" element={<CampaignDetails />} />
        <Route path="/donation-requests" element={<DonationRequestForm />} />
        <Route path="/blood-donation" element={<BloodDonationForm />} />
        <Route path="/donations" element={<DonorListe />} />
        <Route path="/reset-password" element={<PasswordReset />} />
         
        {/* <Route path="/profile" element= {<UserProfile />} /> */}
      </Routes>
      
      </div>
      <Footer />
    </div>
  );
}

export default App;
