// src/pages/Login.jsx
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiUser, FiLock, FiLogIn } from 'react-icons/fi';
import loginImg from './login.jpeg';
import fetchWithInterceptors from '../services/fetchWithInterceptors.js';
import { useAuth } from '../AuthContext';
import { Button } from '../components/ui';

function Login() {
  const [loginInput, setLoginInput] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  // لو فيه ?next=/something نرجع له بعد النجاح
  const params = new URLSearchParams(location.search);
  const next = params.get('next');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await fetchWithInterceptors('/api/users/login', {
        method: 'POST',
        body: JSON.stringify({ loginInput: loginInput.trim(), password })
      });

      if (response.ok) {
        const user = response.body?.user;
        const token = response.body?.token;
        if (user && token) {
          login({ ...user, token });
          navigate(next || '/profile', { replace: true }); // ✅ رجوع للصفحة المطلوبة
        } else {
          setError('البيانات غير مكتملة. الرجاء المحاولة لاحقًا.');
        }
      } else {
        setError(response.body?.message || 'فشل تسجيل الدخول');
      }
    } catch {
      setError('خطأ في الشبكة. حاول مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-red-100 p-4">
      <div className="max-w-3xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden grid md:grid-cols-2 border border-red-100">
        {/* Login Image */}
        <div className="hidden md:flex flex-col items-center justify-center bg-gradient-to-b from-red-100 to-white p-8">
          <img src={loginImg} alt="Login" className="w-56 h-56 object-contain rounded-2xl shadow-md mb-6" />
          <div className="text-center text-red-600 font-bold text-lg">مرحبًا بعودتك إلى المنصة الوطنية للتبرع!</div>
        </div>
        {/* Login Form */}
        <div className="p-8 flex flex-col justify-center">
          <h2 className="text-3xl font-extrabold text-center text-red-600 mb-8 flex items-center justify-center gap-2">
            <FiLogIn className="inline-block text-2xl" />
            تسجيل الدخول
          </h2>
          <form onSubmit={handleSubmit} className="space-y-7">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-center relative animate-shake">
                <span className="block">❌ {error}</span>
                <button 
                  type="button"
                  className="absolute top-0 right-0 p-3 text-red-700 hover:text-red-900"
                  onClick={() => setError('')}
                >
                  ✕
                </button>
              </div>
            )}
            <div className="space-y-2">
              <label htmlFor="loginInput" className="block text-sm font-semibold text-gray-700">
                اسم المستخدم أو رقم الهاتف
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <FiUser />
                </span>
                <input
                  id="loginInput"
                  type="text"
                  value={loginInput}
                  onChange={(e) => setLoginInput(e.target.value)}
                  placeholder="أدخل اسم المستخدم أو رقم الهاتف"
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-200 focus:border-red-400 outline-none transition-colors bg-gray-50 text-gray-800 shadow-sm"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                كلمة المرور
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <FiLock />
                </span>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="أدخل كلمة المرور"
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-200 focus:border-red-400 outline-none transition-colors bg-gray-50 text-gray-800 shadow-sm"
                />
              </div>
            </div>
            <Button 
              type="submit" 
              disabled={loading} 
              className="w-full !bg-gradient-to-l !from-red-500 !to-red-400 !hover:from-red-600 !hover:to-red-500 !shadow-lg !text-lg !py-3 !rounded-xl"
              size="lg"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white ml-2"></div>
                  جاري الدخول...
                </div>
              ) : (
                <span className="flex items-center justify-center gap-2"><FiLogIn /> تسجيل الدخول</span>
              )}
            </Button>
            <div className="flex flex-col gap-2 pt-4 text-center">
              <Link 
                to="/reset-password" 
                className="text-red-500 hover:text-red-700 text-sm transition-colors"
              >
                هل نسيت كلمة السر؟
              </Link>
              <Link 
                to="/add-user" 
                className="inline-block px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 text-sm transition-colors mt-1"
              >
                إنشاء حساب جديد
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
