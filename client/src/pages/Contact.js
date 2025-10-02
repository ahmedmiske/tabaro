import React, { useState } from 'react';
import './Contact.css';
import {
  FiPhone,
  FiMail,
  FiMapPin,
  FiClock,
  FiFacebook,
  FiTwitter,
  FiInstagram,
  FiLinkedin,
  FiSend,
  FiMessageSquare,
  FiHeart,
  FiShield,
  FiUsers,
  FiAward,
  FiChevronDown,
  FiCheckCircle,
  FiArrowRight
} from 'react-icons/fi';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const [formStatus, setFormStatus] = useState('');
  const [openFaq, setOpenFaq] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormStatus('sending');
    
    // Simulate form submission
    setTimeout(() => {
      setFormStatus('success');
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
      
      setTimeout(() => {
        setFormStatus('');
      }, 3000);
    }, 2000);
  };

  const faqData = [
    {
      question: "كيف يمكنني التبرع بالدم؟",
      answer: "يمكنك التبرع بالدم من خلال التسجيل في منصتنا، وسنقوم بتوصيلك مع أقرب مركز تبرع أو طلب تبرع في منطقتك."
    },
    {
      question: "ما هي شروط التبرع بالدم؟",
      answer: "يجب أن تكون بصحة جيدة، وعمرك بين 18-65 سنة، ووزنك أكثر من 50 كيلو، وأن تكون قد تناولت وجبة مناسبة قبل التبرع."
    },
    {
      question: "كم مرة يمكنني التبرع بالدم؟",
      answer: "يمكن للرجال التبرع كل 3 أشهر، وللنساء كل 4 أشهر، مع ضرورة الراحة الكافية بين التبرعات."
    },
    {
      question: "كيف أعرف فصيلة دمي؟",
      answer: "يمكنك إجراء فحص فصيلة الدم في أي معمل طبي، أو في مراكز التبرع المعتمدة لدينا."
    }
  ];

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
      <div className="min-h-screen">
        {/* Hero Section */}
        <div className="contact-hero-section">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full mb-6 group hover:bg-white/30 transition-all duration-300">
              <FiMessageSquare className="h-10 w-10 text-white group-hover:scale-110 transition-transform duration-300" />
            </div>
            <h1 className="contact-hero-title">
              تواصل معنا
            </h1>
            <p className="contact-hero-description">
              نحن هنا لمساعدتك. تواصل معنا لأي استفسارات حول التبرع بالدم أو خدماتنا
            </p>
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
              <div className="text-center group">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full mb-3 group-hover:bg-white/30 group-hover:scale-110 transition-all duration-300">
                  <FiUsers className="h-8 w-8 text-white" />
                </div>
                <div className="text-3xl font-bold text-white">10K+</div>
                <div className="text-green-100">متبرع نشط</div>
              </div>
              <div className="text-center group">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full mb-3 group-hover:bg-white/30 group-hover:scale-110 transition-all duration-300">
                  <FiHeart className="h-8 w-8 text-white" />
                </div>
                <div className="text-3xl font-bold text-white">50K+</div>
                <div className="text-green-100">حياة تم إنقاذها</div>
              </div>
              <div className="text-center group">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full mb-3 group-hover:bg-white/30 group-hover:scale-110 transition-all duration-300">
                  <FiShield className="h-8 w-8 text-white" />
                </div>
                <div className="text-3xl font-bold text-white">24/7</div>
                <div className="text-green-100">خدمة طوارئ</div>
              </div>
              <div className="text-center group">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full mb-3 group-hover:bg-white/30 group-hover:scale-110 transition-all duration-300">
                  <FiAward className="h-8 w-8 text-white" />
                </div>
                <div className="text-3xl font-bold text-white">5+</div>
                <div className="text-green-100">سنوات خبرة</div>
              </div>
            </div>
          </div>
        </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Contact Information */}
          <div className="space-y-8">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-pink-500/10 rounded-3xl transform rotate-1"></div>
              <div className="relative bg-white rounded-3xl shadow-xl p-8 border border-red-100">
                <div className="flex items-center mb-6">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-full mr-4">
                    <FiMapPin className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">معلومات التواصل</h3>
                </div>

                <div className="space-y-6">
                  <div className="group flex items-start space-x-4 rtl:space-x-reverse p-4 rounded-xl hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 transition-all duration-300">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <FiPhone className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">الهاتف</h4>
                      <p className="text-gray-600 text-lg direction-ltr">+213 123 456 789</p>
                      <p className="text-gray-600 text-lg direction-ltr">+213 987 654 321</p>
                    </div>
                  </div>

                  <div className="group flex items-start space-x-4 rtl:space-x-reverse p-4 rounded-xl hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 transition-all duration-300">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <FiMail className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">البريد الإلكتروني</h4>
                      <p className="text-gray-600 text-lg direction-ltr break-all">info@tabaro.com</p>
                      <p className="text-gray-600 text-lg direction-ltr break-all">support@tabaro.com</p>
                    </div>
                  </div>

                  <div className="group flex items-start space-x-4 rtl:space-x-reverse p-4 rounded-xl hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 transition-all duration-300">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <FiMapPin className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">العنوان</h4>
                      <p className="text-gray-600 text-lg leading-relaxed">
                        الجمهورية الإسلامية الموريتانية<br />تفرغ زيينة، نواكشوط
                      </p>
                    </div>
                  </div>

                  <div className="group flex items-start space-x-4 rtl:space-x-reverse p-4 rounded-xl hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 transition-all duration-300">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-violet-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <FiClock className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">ساعات العمل</h4>
                      <div className="space-y-1 text-gray-600">
                        <p>الأحد - الخميس: 8:00 ص - 6:00 م</p>
                        <p>الجمعة: 2:00 م - 6:00 م</p>
                        <p>السبت: مغلق</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Social Media */}
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">تابعنا على</h4>
                  <div className="flex space-x-4 rtl:space-x-reverse">
                    {[
                      { icon: FiFacebook, color: 'from-blue-600 to-blue-700', href: '#' },
                      { icon: FiTwitter, color: 'from-sky-500 to-sky-600', href: '#' },
                      { icon: FiInstagram, color: 'from-pink-500 to-rose-600', href: '#' },
                      { icon: FiLinkedin, color: 'from-blue-700 to-blue-800', href: '#' }
                    ].map((social, index) => (
                      <a
                        key={index}
                        href={social.href}
                        className={`inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r ${social.color} rounded-xl text-white hover:scale-110 hover:rotate-6 transition-all duration-300 shadow-lg hover:shadow-xl`}
                      >
                        <social.icon className="h-5 w-5" />
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-3xl transform -rotate-1"></div>
            <div className="relative bg-white rounded-3xl shadow-xl p-8 border border-blue-100">
              <div className="flex items-center mb-6">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mr-4">
                  <FiSend className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">أرسل لنا رسالة</h3>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="group">
                    <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                      الاسم الكامل
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 group-hover:border-blue-300"
                      placeholder="أدخل اسمك الكامل"
                    />
                  </div>

                  <div className="group">
                    <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                      البريد الإلكتروني
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 group-hover:border-blue-300 direction-ltr text-left"
                      placeholder="example@email.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="group">
                    <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                      رقم الهاتف
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 group-hover:border-blue-300 direction-ltr text-left"
                      placeholder="+213 123 456 789"
                    />
                  </div>

                  <div className="group">
                    <label htmlFor="subject" className="block text-sm font-semibold text-gray-700 mb-2">
                      الموضوع
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 group-hover:border-blue-300"
                    >
                      <option value="">اختر الموضوع</option>
                      <option value="donation">استفسار عن التبرع</option>
                      <option value="request">طلب دم طارئ</option>
                      <option value="support">دعم تقني</option>
                      <option value="partnership">شراكة</option>
                      <option value="other">أخرى</option>
                    </select>
                  </div>
                </div>

                <div className="group">
                  <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
                    الرسالة
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 group-hover:border-blue-300 resize-none"
                    placeholder="اكتب رسالتك هنا..."
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={formStatus === 'sending'}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-4 px-8 rounded-xl hover:from-blue-700 hover:to-purple-700 focus:ring-4 focus:ring-blue-300 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group flex items-center justify-center space-x-2 rtl:space-x-reverse shadow-lg hover:shadow-xl"
                >
                  {formStatus === 'sending' ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>جاري الإرسال...</span>
                    </>
                  ) : formStatus === 'success' ? (
                    <>
                      <FiCheckCircle className="h-5 w-5" />
                      <span>تم الإرسال بنجاح!</span>
                    </>
                  ) : (
                    <>
                      <FiSend className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                      <span>إرسال الرسالة</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-20">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mb-6">
              <FiMessageSquare className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">الأسئلة الشائعة</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              إجابات على أكثر الأسئلة شيوعاً حول التبرع بالدم وخدماتنا
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="space-y-4">
              {faqData.map((faq, index) => (
                <div key={index} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full px-8 py-6 text-right hover:bg-gray-50 transition-colors duration-300 focus:outline-none focus:bg-gray-50"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mr-4">
                          <span className="text-white font-bold text-sm">{index + 1}</span>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">{faq.question}</h3>
                      </div>
                      <FiChevronDown
                        className={`h-6 w-6 text-gray-500 transition-transform duration-300 ${
                          openFaq === index ? 'transform rotate-180' : ''
                        }`}
                      />
                    </div>
                  </button>
                  
                  <div
                    className={`px-8 pb-6 transition-all duration-300 ease-in-out ${
                      openFaq === index
                        ? 'max-h-96 opacity-100'
                        : 'max-h-0 opacity-0 overflow-hidden'
                    }`}
                  >
                    <div className="pl-12 pr-4">
                      <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Map Section */}
        <div className="mt-20">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full mb-6">
              <FiMapPin className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">موقعنا</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              زر مقرنا الرئيسي أو تواصل معنا للحصول على مساعدة فورية
            </p>
          </div>

          <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-r from-gray-100 to-gray-200">
            <div className="aspect-w-16 aspect-h-9 h-96">
              <div className="flex items-center justify-center h-full bg-gradient-to-br from-purple-100 to-indigo-100">
                <div className="text-center">
                  <FiMapPin className="h-24 w-24 text-purple-500 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">خريطة تفاعلية</h3>
                  <p className="text-gray-600 mb-6">سيتم إضافة الخريطة التفاعلية قريباً</p>
                  <button className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl">
                    <FiArrowRight className="h-5 w-5 mr-2" />
                    احصل على الاتجاهات
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;