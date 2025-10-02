import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, ProgressBar, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FiUpload, FiTarget, FiCalendar, FiMapPin, FiUser, FiFileText, FiDollarSign, FiImage, FiCheck } from 'react-icons/fi';
import './CreateCampaign.css';

const CreateCampaign = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1: Basic Info
    title: '',
    category: '',
    description: '',
    
    // Step 2: Financial Details
    targetAmount: '',
    currency: 'SAR',
    
    // Step 3: Timeline & Location
    startDate: '',
    endDate: '',
    location: '',
    
    // Step 4: Media & Additional Info
    images: [],
    videoUrl: '',
    organizerName: '',
    organizerContact: '',
    
    // Step 5: Terms & Verification
    agreeTerms: false,
    verificationDocuments: []
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    { value: 'medical', label: 'طبي وصحي', icon: '🏥' },
    { value: 'education', label: 'تعليم', icon: '📚' },
    { value: 'social', label: 'مساعدة اجتماعية', icon: '🤝' },
    { value: 'emergency', label: 'إغاثة طارئة', icon: '🚨' },
    { value: 'environment', label: 'بيئي', icon: '🌱' },
    { value: 'children', label: 'رعاية الأطفال', icon: '👶' },
    { value: 'elderly', label: 'رعاية المسنين', icon: '👴' },
    { value: 'other', label: 'أخرى', icon: '💡' }
  ];

  const totalSteps = 5;

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleFileUpload = (field, files) => {
    setFormData(prev => ({
      ...prev,
      [field]: Array.from(files)
    }));
  };

  const validateStep = (step) => {
    const newErrors = {};
    
    switch (step) {
      case 1:
        if (!formData.title.trim()) newErrors.title = 'عنوان الحملة مطلوب';
        if (!formData.category) newErrors.category = 'اختيار الفئة مطلوب';
        if (!formData.description.trim()) newErrors.description = 'وصف الحملة مطلوب';
        if (formData.description.length < 50) newErrors.description = 'الوصف يجب أن يكون 50 حرف على الأقل';
        break;
        
      case 2:
        if (!formData.targetAmount || formData.targetAmount <= 0) {
          newErrors.targetAmount = 'المبلغ المستهدف مطلوب ويجب أن يكون أكبر من صفر';
        }
        break;
        
      case 3:
        if (!formData.startDate) newErrors.startDate = 'تاريخ البداية مطلوب';
        if (!formData.endDate) newErrors.endDate = 'تاريخ النهاية مطلوب';
        if (!formData.location.trim()) newErrors.location = 'الموقع مطلوب';
        if (new Date(formData.endDate) <= new Date(formData.startDate)) {
          newErrors.endDate = 'تاريخ النهاية يجب أن يكون بعد تاريخ البداية';
        }
        break;
        
      case 4:
        if (!formData.organizerName.trim()) newErrors.organizerName = 'اسم منظم الحملة مطلوب';
        if (!formData.organizerContact.trim()) newErrors.organizerContact = 'معلومات التواصل مطلوبة';
        if (formData.images.length === 0) newErrors.images = 'يجب رفع صورة واحدة على الأقل';
        break;
        
      case 5:
        if (!formData.agreeTerms) newErrors.agreeTerms = 'يجب الموافقة على الشروط والأحكام';
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;
    
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Success - redirect to campaigns list
      navigate('/campaigns/list', { 
        state: { 
          message: 'تم إنشاء الحملة بنجاح! سيتم مراجعتها والموافقة عليها قريباً.' 
        }
      });
    } catch (error) {
      setErrors({ submit: 'حدث خطأ أثناء إنشاء الحملة. يرجى المحاولة مرة أخرى.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="step-content">
            <h4 className="step-title">
              <FiFileText className="me-2" />
              المعلومات الأساسية
            </h4>
            
            <Form.Group className="mb-4">
              <Form.Label className="fw-semibold">عنوان الحملة *</Form.Label>
              <Form.Control
                type="text"
                placeholder="اكتب عنواناً واضحاً ومختصراً للحملة"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                isInvalid={!!errors.title}
                className="form-control-lg"
              />
              <Form.Control.Feedback type="invalid">
                {errors.title}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label className="fw-semibold">فئة الحملة *</Form.Label>
              <div className="category-grid">
                {categories.map((category) => (
                  <div
                    key={category.value}
                    className={`category-item ${formData.category === category.value ? 'selected' : ''}`}
                    onClick={() => handleInputChange('category', category.value)}
                  >
                    <span className="category-icon">{category.icon}</span>
                    <span className="category-label">{category.label}</span>
                  </div>
                ))}
              </div>
              {errors.category && (
                <div className="text-danger mt-2 small">{errors.category}</div>
              )}
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label className="fw-semibold">وصف الحملة *</Form.Label>
              <Form.Control
                as="textarea"
                rows={6}
                placeholder="اشرح هدف الحملة وأهميتها وكيف ستساعد المستفيدين..."
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                isInvalid={!!errors.description}
              />
              <div className="form-text">
                {formData.description.length}/500 حرف (الحد الأدنى: 50 حرف)
              </div>
              <Form.Control.Feedback type="invalid">
                {errors.description}
              </Form.Control.Feedback>
            </Form.Group>
          </div>
        );

      case 2:
        return (
          <div className="step-content">
            <h4 className="step-title">
              <FiDollarSign className="me-2" />
              التفاصيل المالية
            </h4>
            
            <Form.Group className="mb-4">
              <Form.Label className="fw-semibold">المبلغ المستهدف *</Form.Label>
              <div className="input-group input-group-lg">
                <Form.Control
                  type="number"
                  placeholder="0"
                  value={formData.targetAmount}
                  onChange={(e) => handleInputChange('targetAmount', e.target.value)}
                  isInvalid={!!errors.targetAmount}
                />
                <span className="input-group-text">ريال سعودي</span>
              </div>
              <Form.Control.Feedback type="invalid">
                {errors.targetAmount}
              </Form.Control.Feedback>
              <div className="form-text">
                حدد المبلغ الذي تحتاجه لتحقيق هدف الحملة
              </div>
            </Form.Group>

            <div className="amount-suggestions">
              <p className="mb-3 fw-semibold">اقتراحات المبالغ الشائعة:</p>
              <div className="d-flex flex-wrap gap-2">
                {[5000, 10000, 25000, 50000, 100000].map((amount) => (
                  <Button
                    key={amount}
                    variant="outline-primary"
                    size="sm"
                    onClick={() => handleInputChange('targetAmount', amount.toString())}
                  >
                    {amount.toLocaleString()} ريال
                  </Button>
                ))}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="step-content">
            <h4 className="step-title">
              <FiCalendar className="me-2" />
              الجدول الزمني والموقع
            </h4>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-4">
                  <Form.Label className="fw-semibold">تاريخ بداية الحملة *</Form.Label>
                  <Form.Control
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                    isInvalid={!!errors.startDate}
                    min={new Date().toISOString().split('T')[0]}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.startDate}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-4">
                  <Form.Label className="fw-semibold">تاريخ انتهاء الحملة *</Form.Label>
                  <Form.Control
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => handleInputChange('endDate', e.target.value)}
                    isInvalid={!!errors.endDate}
                    min={formData.startDate || new Date().toISOString().split('T')[0]}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.endDate}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-4">
              <Form.Label className="fw-semibold">الموقع/المنطقة *</Form.Label>
              <Form.Select
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                isInvalid={!!errors.location}
              >
                <option value="">اختر المنطقة</option>
                <option value="riyadh">الرياض</option>
                <option value="jeddah">جدة</option>
                <option value="dammam">الدمام</option>
                <option value="mecca">مكة المكرمة</option>
                <option value="medina">المدينة المنورة</option>
                <option value="taif">الطائف</option>
                <option value="tabuk">تبوك</option>
                <option value="abha">أبها</option>
                <option value="nationwide">جميع أنحاء المملكة</option>
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                {errors.location}
              </Form.Control.Feedback>
            </Form.Group>
          </div>
        );

      case 4:
        return (
          <div className="step-content">
            <h4 className="step-title">
              <FiImage className="me-2" />
              الوسائط ومعلومات المنظم
            </h4>
            
            <Form.Group className="mb-4">
              <Form.Label className="fw-semibold">صور الحملة *</Form.Label>
              <div className="upload-area">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => handleFileUpload('images', e.target.files)}
                  className="d-none"
                  id="imageUpload"
                />
                <label htmlFor="imageUpload" className="upload-label">
                  <FiUpload size={40} />
                  <p>اسحب الصور هنا أو انقر للاختيار</p>
                  <small>PNG, JPG, GIF حتى 10MB لكل صورة</small>
                </label>
              </div>
              {formData.images.length > 0 && (
                <div className="uploaded-files">
                  {Array.from(formData.images).map((file, index) => (
                    <Badge key={index} bg="success" className="me-2 mb-2">
                      {file.name}
                    </Badge>
                  ))}
                </div>
              )}
              {errors.images && (
                <div className="text-danger mt-2 small">{errors.images}</div>
              )}
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label className="fw-semibold">رابط فيديو (اختياري)</Form.Label>
              <Form.Control
                type="url"
                placeholder="https://youtube.com/watch?v=..."
                value={formData.videoUrl}
                onChange={(e) => handleInputChange('videoUrl', e.target.value)}
              />
              <div className="form-text">
                يمكنك إضافة رابط فيديو من YouTube أو Vimeo لشرح الحملة
              </div>
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-4">
                  <Form.Label className="fw-semibold">اسم منظم الحملة *</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="الاسم الكامل"
                    value={formData.organizerName}
                    onChange={(e) => handleInputChange('organizerName', e.target.value)}
                    isInvalid={!!errors.organizerName}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.organizerName}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-4">
                  <Form.Label className="fw-semibold">معلومات التواصل *</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="رقم الهاتف أو البريد الإلكتروني"
                    value={formData.organizerContact}
                    onChange={(e) => handleInputChange('organizerContact', e.target.value)}
                    isInvalid={!!errors.organizerContact}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.organizerContact}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
          </div>
        );

      case 5:
        return (
          <div className="step-content">
            <h4 className="step-title">
              <FiCheck className="me-2" />
              المراجعة والموافقة
            </h4>
            
            <div className="campaign-preview">
              <h5 className="mb-3">معاينة الحملة:</h5>
              <Card className="preview-card">
                <Card.Body>
                  <h6 className="text-primary">{formData.title}</h6>
                  <p className="text-muted small mb-2">
                    {categories.find(c => c.value === formData.category)?.label} • {formData.location}
                  </p>
                  <p className="mb-2">{formData.description.substring(0, 150)}...</p>
                  <div className="d-flex justify-content-between">
                    <span>المبلغ المستهدف:</span>
                    <strong>{parseInt(formData.targetAmount).toLocaleString()} ريال</strong>
                  </div>
                </Card.Body>
              </Card>
            </div>

            <Form.Group className="mb-4">
              <Form.Check
                type="checkbox"
                id="agreeTerms"
                label="أوافق على الشروط والأحكام وسياسة الخصوصية"
                checked={formData.agreeTerms}
                onChange={(e) => handleInputChange('agreeTerms', e.target.checked)}
                isInvalid={!!errors.agreeTerms}
              />
              <Form.Control.Feedback type="invalid">
                {errors.agreeTerms}
              </Form.Control.Feedback>
            </Form.Group>

            {errors.submit && (
              <Alert variant="danger">{errors.submit}</Alert>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="create-campaign-page">
      <Container>
        <div className="page-header">
          <Row className="align-items-center">
            <Col>
              <h1 className="page-title">إنشاء حملة جديدة</h1>
              <p className="page-subtitle">
                ابدأ حملتك الخيرية وساعد في تحقيق أهدافك الإنسانية
              </p>
            </Col>
          </Row>
        </div>

        <Row className="justify-content-center">
          <Col xl={8} lg={10}>
            <Card className="main-card shadow-lg">
              <Card.Body className="p-5">
                {/* Progress Bar */}
                <div className="progress-section mb-5">
                  <div className="d-flex justify-content-between mb-3">
                    <span className="fw-semibold">الخطوة {currentStep} من {totalSteps}</span>
                    <span className="text-muted">{Math.round((currentStep / totalSteps) * 100)}% مكتمل</span>
                  </div>
                  <ProgressBar 
                    now={(currentStep / totalSteps) * 100} 
                    className="custom-progress"
                    animated={currentStep < totalSteps}
                  />
                </div>

                {/* Step Content */}
                {renderStepContent()}

                {/* Navigation Buttons */}
                <div className="step-navigation">
                  <div className="d-flex justify-content-between">
                    <Button
                      variant="outline-secondary"
                      onClick={prevStep}
                      disabled={currentStep === 1}
                    >
                      السابق
                    </Button>
                    
                    {currentStep < totalSteps ? (
                      <Button
                        variant="primary"
                        onClick={nextStep}
                        className="px-4"
                      >
                        التالي
                      </Button>
                    ) : (
                      <Button
                        variant="success"
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="px-4"
                      >
                        {isSubmitting ? 'جاري الإنشاء...' : 'إنشاء الحملة'}
                      </Button>
                    )}
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default CreateCampaign;