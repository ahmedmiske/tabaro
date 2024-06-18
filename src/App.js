import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import UserPage from './pages/UserPage';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import Register from './pages/Register';
import Login from './pages/Login';
import './App.css';

function App() {
  return (
    <div>
      <Header />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/users" element={<UserPage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
      </Routes>
      <Footer />
    </div>
  );
}

export default App;
