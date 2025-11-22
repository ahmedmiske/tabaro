// src/components/UserDetails.js
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Form, Button, Alert } from 'react-bootstrap';
import {
  FaPhoneAlt,
  FaWhatsapp,
  FaEnvelope,
  FaMapMarkerAlt,
  FaBuilding,
  FaUser,
} from 'react-icons/fa';
import fetchWithInterceptors from '../services/fetchWithInterceptors';
import './UserDetails.css';

function UserDetails({
  userDetails = {
    firstName: '',
    lastName: '',
    address: '',
    institutionName: '',
    institutionLicenseNumber: '',
    institutionAddress: '',
    userType: 'individual',
    phoneNumber: '',
    email: '',
  },
  setUserDetails = () => {},
  isVisitor = false,
}) {
  const [formData, setFormData] = useState({
    firstName: userDetails?.firstName || '',
    lastName: userDetails?.lastName || '',
    address: userDetails?.address || '',
    institutionName: userDetails?.institutionName || '',
    institutionLicenseNumber: userDetails?.institutionLicenseNumber || '',
    institutionAddress: userDetails?.institutionAddress || '',
  });

  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // ✅ مزامنة البيانات مع userDetails كلما تغيّرت
  useEffect(() => {
    if (!userDetails) return;
    setFormData({
      firstName: userDetails.firstName || '',
      lastName: userDetails.lastName || '',
      address: userDetails.address || '',
      institutionName: userDetails.institutionName || '',
      institutionLicenseNumber: userDetails.institutionLicenseNumber || '',
      institutionAddress: userDetails.institutionAddress || '',
    });
  }, [userDetails]);

  const handleChange = (e) => {
    if (isVisitor) return;
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isVisitor) return;

    try {
      const resp = await fetchWithInterceptors('/api/users/profile', {
        method: 'PUT',
        body: JSON.stringify(formData),
      });

      if (!resp.ok) throw new Error(resp.body?.message || `HTTP ${resp.status}`);

      setSuccessMessage('تم تحديث المعلومات الشخصية بنجاح.');
      setUserDetails({ ...userDetails, ...formData });

      setTimeout(() => window.location.reload(), 2000);
    } catch (err) {
      setErrorMessage('فشل في تحديث المعلومات. يرجى المحاولة لاحقاً.');
    }
  };

  if (!userDetails) {
    return <p className="text-center mt-3">جاري تحميل البيانات...</p>;
  }

  const fullName =
    `${userDetails.firstName || ''} ${userDetails.lastName || ''}`.trim() ||
    'غير متوفر';
  const isInstitution = userDetails.userType === 'institutional';
  const phone = userDetails.phoneNumber || '';
  const email = userDetails.email || '';

  const waPhone = phone.replace(/\D/g, '');
  const whatsappLink = waPhone ? `https://wa.me/${waPhone}` : null;

  // 🔹 واجهة الزائر: عرض المعلومات فقط
  if (isVisitor) {
    return (
      <div className="container-user-details visitor-view" dir="rtl">
        <div className="user-details-header visitor-header">
          <h5>
            <FaUser className="me-2" />
            البيانات الأساسية للمستخدم
          </h5>
          <p className="visitor-subtitle">
            تساعدك هذه المعلومات على التعرف على صاحب الحساب قبل التبرع أو التواصل معه.
          </p>
        </div>

        <div className="visitor-info-card">
          <div className="info-row">
            <span className="info-label">الاسم الكامل</span>
            <span className="info-value">{fullName}</span>
          </div>

          <div className="info-row">
            <span className="info-label">نوع الحساب</span>
            <span className="info-value">
              {isInstitution ? 'حساب مؤسسي' : 'حساب فردي'}
            </span>
          </div>

          {userDetails.address && (
            <div className="info-row">
              <span className="info-label">
                <FaMapMarkerAlt className="ms-1" />
                العنوان
              </span>
              <span className="info-value">{userDetails.address}</span>
            </div>
          )}

          {/* 🔢 رقم الهاتف ظاهر نصًا */}
          {phone && (
            <div className="info-row">
              <span className="info-label">رقم الهاتف</span>
              <span className="info-value">{phone}</span>
            </div>
          )}

          {/* ✉ البريد الإلكتروني ظاهر نصًا */}
          {email && (
            <div className="info-row">
              <span className="info-label">البريد الإلكتروني</span>
              <span className="info-value">{email}</span>
            </div>
          )}

          {isInstitution && (
            <>
              {userDetails.institutionName && (
                <div className="info-row">
                  <span className="info-label">
                    <FaBuilding className="ms-1" />
                    اسم المؤسسة
                  </span>
                  <span className="info-value">{userDetails.institutionName}</span>
                </div>
              )}

              {userDetails.institutionLicenseNumber && (
                <div className="info-row">
                  <span className="info-label">رقم الترخيص</span>
                  <span className="info-value">
                    {userDetails.institutionLicenseNumber}
                  </span>
                </div>
              )}

              {userDetails.institutionAddress && (
                <div className="info-row">
                  <span className="info-label">
                    <FaMapMarkerAlt className="ms-1" />
                    عنوان المؤسسة
                  </span>
                  <span className="info-value">
                    {userDetails.institutionAddress}
                  </span>
                </div>
              )}
            </>
          )}

          {/* وسائل التواصل (أزرار) */}
          {(phone || email) && (
            <div className="info-row">
              <span className="info-label">وسائل التواصل المتاحة</span>
              <div className="info-value contact-actions">
                {phone && (
                  <>
                    <a
                      href={`tel:${phone}`}
                      className="contact-badge contact-call"
                      title="اتصال هاتفي"
                    >
                      <FaPhoneAlt className="ms-1" />
                      اتصال
                    </a>
                    {whatsappLink && (
                      <a
                        href={whatsappLink}
                        target="_blank"
                        rel="noreferrer"
                        className="contact-badge contact-wa"
                        title="مراسلة عبر واتساب"
                      >
                        <FaWhatsapp className="ms-1" />
                        واتساب
                      </a>
                    )}
                  </>
                )}
                {email && (
                  <a
                    href={`mailto:${email}`}
                    className="contact-badge contact-mail"
                    title="إرسال بريد إلكتروني"
                  >
                    <FaEnvelope className="ms-1" />
                    بريد إلكتروني
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 🔹 واجهة صاحب الحساب (فورم التعديل)
  return (
    <div className="container-user-details">
      <div className="user-details-header">
        <h5>
          <i className="fas fa-id-card me-2" />
          تحديث المعلومات الشخصية
        </h5>
      </div>

      <Form onSubmit={handleSubmit} dir="rtl">
        {successMessage && <Alert variant="success">{successMessage}</Alert>}
        {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}

        <Form.Group>
          <Form.Label>الاسم الشخصي</Form.Label>
          <Form.Control
            name="firstName"
            type="text"
            value={formData.firstName}
            onChange={handleChange}
          />
        </Form.Group>

        <Form.Group>
          <Form.Label>الاسم العائلي</Form.Label>
          <Form.Control
            name="lastName"
            type="text"
            value={formData.lastName}
            onChange={handleChange}
          />
        </Form.Group>

        <Form.Group>
          <Form.Label>العنوان</Form.Label>
          <Form.Control
            name="address"
            type="text"
            value={formData.address}
            onChange={handleChange}
          />
        </Form.Group>

        {userDetails?.userType === 'institutional' && (
          <>
            <Form.Group>
              <Form.Label>اسم المؤسسة</Form.Label>
              <Form.Control
                name="institutionName"
                type="text"
                value={formData.institutionName}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group>
              <Form.Label>رقم ترخيص المؤسسة</Form.Label>
              <Form.Control
                name="institutionLicenseNumber"
                type="text"
                value={formData.institutionLicenseNumber}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group>
              <Form.Label>عنوان المؤسسة</Form.Label>
              <Form.Control
                name="institutionAddress"
                type="text"
                value={formData.institutionAddress}
                onChange={handleChange}
              />
            </Form.Group>
          </>
        )}

        <br />
        <Button variant="primary" type="submit">
          حفظ التعديلات
        </Button>
      </Form>
    </div>
  );
}

UserDetails.propTypes = {
  userDetails: PropTypes.shape({
    firstName: PropTypes.string,
    lastName: PropTypes.string,
    address: PropTypes.string,
    institutionName: PropTypes.string,
    institutionLicenseNumber: PropTypes.string,
    institutionAddress: PropTypes.string,
    userType: PropTypes.oneOf(['individual', 'institutional']),
    phoneNumber: PropTypes.string,
    email: PropTypes.string,
  }),
  setUserDetails: PropTypes.func,
  isVisitor: PropTypes.bool,
};

export default UserDetails;
