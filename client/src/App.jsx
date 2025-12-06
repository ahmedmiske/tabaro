// src/App.jsx

// React & router
import React, { useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import PrivacyPolicy from "./pages/PrivacyPolicy.jsx";

// ✅ مزوّد العربة
import { CartProvider } from "./CartContext.jsx";

// Styles & providers
import "react-toastify/dist/ReactToastify.css";
import "./App.css";
import { AuthProvider } from "./AuthContext.jsx";

// Layout
import ScrollToTop from "./ScrollToTop.jsx";
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import SocialMedia from "./components/SocialMedia.jsx";

// Common / pages
import LandingPage from "./pages/LandingPage.jsx";
import Register from "./pages/Register.jsx";
import Login from "./pages/Login.jsx";
import UserPage from "./pages/UserPage.jsx";
import UserProfile from "./pages/UserProfile.jsx";
import AddUserserPage from "./pages/addUserPage.jsx";
import About from "./components/About.jsx";
import NotFound from "./pages/NotFound.jsx";
import UnderConstruction from "./pages/UnderConstruction.jsx";
import ReadyToDonateBloodPage from "./pages/ReadyToDonateBloodPage.jsx";
import ReadyToDonateGeneralPage from "./pages/ReadyToDonateGeneralPage.jsx";
import ReadyDonors from "./pages/ReadyDonors.jsx";
import Dashboard from "./pages/DashboardPage.jsx";
import ManageCenter from './pages/ManageCenter.jsx';
import ManageCenterBlood from './pages/ManageCenterBlood.jsx';
import ManageCenterGeneral from './pages/ManageCenterGeneral.jsx';
import ManageCenterCommunity from './pages/ManageCenterCommunity.jsx';
import AdminDashboardPage from './pages/AdminDashboardPage.jsx';
// Manage center
// import ManageCenter from "./pages/ManageCenter.jsx";

// Lists & details
import DonationRequestPage from "./pages/DonationRequestsPage.jsx";
import DonationDetails from "./components/DonationDetails.jsx";
import DonationRequestDetails from "./components/DonationRequestDetails.jsx";
import BloodDonationDetails from "./components/BloodDonationDetails.jsx";
import CampaignDetails from "./components/CampaignDetails.jsx";
import MyRequestDetails from "./pages/MyRequestDetails.jsx";
import PublicProfile from "./pages/PublicProfile.jsx";
import BloodDonationPage from "./pages/BloodDonationPage.jsx";

// Forms
import PasswordReset from "./components/PasswordReset.jsx";
import DonationRequestForm from "./components/DonationRequestForm.jsx";
import BloodDonationForm from "./components/BloodDonationForm.jsx";

// Donors pages
import BloodDonors from "./pages/BloodDonors.jsx";
import GeneralDonors from "./pages/GeneralDonors.jsx";
import ReadyGeneralDetails from './pages/ReadyGeneralDetails.jsx';

// Chat / notifications
import ChatPage from "./pages/ChatPage.jsx";
import ChatList from "./pages/ChatList.jsx";
import NotificationsPage from "./pages/NotificationsPage.jsx";
import SearchResults from "./components/SearchResults.jsx";

// ✅ صفحة العربة
import CartPage from "./pages/CartPage.jsx";

// Demos
import OrangeButtonsShowcase from "./components/OrangeButtonsShowcase.jsx";
import ButtonsDemo from "./components/ButtonsDemo.jsx";

// Social ads
import SocialList from "./pages/social/SocialList.jsx";
import SocialDetails from "./pages/social/SocialDetails.jsx";
import SocialForm from "./pages/social/SocialForm.jsx";

// Guards & socket
import RequireAuth from "./components/RequireAuth.jsx";
import { connectSocket } from "./socket";

// Confirmation details
import DonationConfirmationDetails from "./pages/DonationConfirmationDetails.jsx";
import DonationRequestConfirmationDetails from "./pages/DonationRequestConfirmationDetails.jsx";

function App() {
  const location = useLocation();

  // اتصال السوكيت مرة واحدة عند تحميل التطبيق
  useEffect(() => {
    const token =
      localStorage.getItem("token") || localStorage.getItem("authToken");
    if (token) connectSocket(token);
  }, []);

  // إظهار/إخفاء الهيدر والفوتر حسب موضع السكروول
  useEffect(() => {
    const handleScroll = () => {
      const header = document.querySelector(".header-container");
      const footer = document.querySelector(".footer");
      if (!header || !footer) return;

      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;
      const windowHeight = window.innerHeight;
      const bodyHeight = document.body.scrollHeight - windowHeight;

      if (scrollTop >= bodyHeight - 50) footer.classList.add("show");
      else footer.classList.remove("show");

      if (scrollTop > 100) header.classList.add("hide");
      else header.classList.remove("hide");
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [location]);

  return (
    // ✅ نلفّ التطبيق كاملًا بـ CartProvider ثم AuthProvider
    <CartProvider>
      <AuthProvider>
        <div className="page-app">
          {/* تمرير الصفحة لأعلى عند تغيير المسار */}
          <ScrollToTop />

          <Header />
          <SocialMedia />

          <div className="page-wrapper">
            <Routes>
            <Route path="/privacy" element={<PrivacyPolicy />} />
            {/* عامة */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/add-user" element={<AddUserserPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/reset-password" element={<PasswordReset />} />
            <Route path="/blood-donations" element={<BloodDonationPage />} />
            <Route path="/donations" element={<DonationRequestPage />} />
            <Route path="/about" element={<About />} />
            <Route path="/users" element={<UserPage />} />
            <Route path="/under-construction" element={<UnderConstruction />} />
            <Route path="/buttons-showcase" element={<OrangeButtonsShowcase />} />
            <Route path="/buttons-demo" element={<ButtonsDemo />} />
            <Route path="/404" element={<NotFound />} />

              {/* 🔎 صفحة نتائج البحث */}
              <Route path="/search" element={<SearchResults />} />

              {/* 🛒 صفحة العربة */}
              <Route path="/cart" element={<CartPage />} />

              {/* صفحات الاستعداد للتبرع (محميّة) */}
              <Route
                path="/admin-dashboard"
                element={ 
                  <RequireAuth>
                    <AdminDashboardPage />
                  </RequireAuth>
                }
              />
              <Route
                path="/ready/blood"
                element={
                  <RequireAuth>
                    <ReadyToDonateBloodPage />
                  </RequireAuth>
                }
              />
              <Route
                path="/ready/general"
                element={
                  <RequireAuth>
                    <ReadyToDonateGeneralPage />
                  </RequireAuth>
                }
              />

              {/* صفحات التفاصيل (محميّة) */}
              <Route
                path="/donation-details/:id"
                element={
                  <RequireAuth>
                    <DonationDetails />
                  </RequireAuth>
                }
              />
              <Route
                path="/blood-donation-details/:id"
                element={
                  <RequireAuth>
                    <BloodDonationDetails />
                  </RequireAuth>
                }
              />
              <Route
                path="/campaign/:id"
                element={
                  <RequireAuth>
                    <CampaignDetails />
                  </RequireAuth>
                }
              />
              <Route
                path="/donations/:id"
                element={
                  <RequireAuth>
                    <DonationRequestDetails />
                  </RequireAuth>
                }
              />
              <Route
                path="/my-request-details/:id"
                element={
                  <RequireAuth>
                    <MyRequestDetails />
                  </RequireAuth>
                }
              />

              {/* نماذج الطلبات (محميّة) */}
              <Route
                path="/donation-requests"
                element={
                  <RequireAuth>
                    <DonationRequestForm />
                  </RequireAuth>
                }
              />
              <Route
                path="/blood-donation"
                element={
                  <RequireAuth>
                    <BloodDonationForm />
                  </RequireAuth>
                }
              />

              {/* الدردشة والإشعارات */}
              <Route
                path="/chat/:recipientId"
                element={
                  <RequireAuth>
                    <ChatPage />
                  </RequireAuth>
                }
              />
              <Route
                path="/messages"
                element={
                  <RequireAuth>
                    <ChatList />
                  </RequireAuth>
                }
              />
              <Route
                path="/notifications"
                element={
                  <RequireAuth>
                    <NotificationsPage />
                  </RequireAuth>
                }
              />

              {/* ملفات المستخدمين */}
              <Route path="/profile/:userId" element={<UserProfile />} />
              <Route
                path="/users/:id"
                element={
                  <RequireAuth>
                    <PublicProfile />
                  </RequireAuth>
                }
              />
              <Route
                path="/profile"
                element={
                  <RequireAuth>
                    <UserProfile />
                  </RequireAuth>
                }
              />
                <Route
                path="/manage/Community"
                element={
                  <RequireAuth>
                    <ManageCenterCommunity />
                  </RequireAuth>
                }
              />

              {/* لوحة التحكم وإدارة المركز */}
              <Route
                path="/dashboard"
                element={
                  <RequireAuth>
                    <Dashboard />
                  </RequireAuth>
                }
              />
              <Route
                path="/manage"
                element={
                  <RequireAuth>
                    <ManageCenter />
                  </RequireAuth>
                }
              />
                <Route
                path="/manage/blood"
                element={
                  <RequireAuth>
                    <ManageCenterBlood />
                  </RequireAuth>
                }
              />
                <Route
                path="/manage/general"
                element={
                  <RequireAuth>
                    <ManageCenterGeneral />
                  </RequireAuth>
                }
              />

              {/* صفحات الإعلانات الاجتماعية */}
              <Route path="/social" element={<SocialList />} />
              <Route
                path="/social/new"
                element={
                  <RequireAuth>
                    <SocialForm />
                  </RequireAuth>
                }
              />
              <Route path="/social/:id" element={<SocialDetails />} />

              {/* صفحات المتبرعين */}
              <Route
                path="/ready-donors"
                element={
                  <RequireAuth>
                    <ReadyDonors />
                  </RequireAuth>
                }
              />
              <Route
                path="/blood-donors"
                element={
                  <RequireAuth>
                    <BloodDonors />
                  </RequireAuth>
                }
              />
              <Route
                path="/general-donors"
                element={
                  <RequireAuth>
                    <GeneralDonors />
                  </RequireAuth>
                }
              />
              <Route
                path="/ready-general/:id"
                element={ 
                  <RequireAuth>
                    <ReadyGeneralDetails />
                  </RequireAuth>
                }
              />

              {/* تفاصيل التأكيد */}
              <Route
                path="/donation-confirmations/:id"
                element={
                  <RequireAuth>
                    <DonationConfirmationDetails />
                  </RequireAuth>
                }
              />
              <Route
                path="/donation-request-confirmations/:id"
                element={
                  <RequireAuth>
                    <DonationRequestConfirmationDetails />
                  </RequireAuth>
                }
              />

              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>

          <Footer />
        </div>
      </AuthProvider>
    </CartProvider>
  );
}

export default App;
