import React, { useState, useEffect } from 'react';
// تمت إزالة جميع مكونات bootstrap. سنستخدم عناصر HTML عادية فقط.
import { Link, useNavigate } from 'react-router-dom';
import { FiPlus, FiList, FiHeart, FiUsers, FiTarget, FiTrendingUp, FiCalendar, FiMapPin } from 'react-icons/fi';
import './GeneralDonations.css';

const GeneralDonations = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalCampaigns: 156,
    activeCampaigns: 89,
    totalDonations: 2547,
    totalAmount: 850000
  });

  const [featuredCampaigns, setFeaturedCampaigns] = useState([
    {
      id: 1,
      title: "مساعدة العائلات المحتاجة",
      description: "حملة لدعم العائلات التي تواجه صعوبات مالية",
      targetAmount: 50000,
      currentAmount: 32500,
      donorsCount: 125,
      daysLeft: 15,
      image: "/images/campaign1.jpg",
      category: "مساعدة اجتماعية",
      location: "الرياض"
    },
    {
      id: 2,
      title: "دعم التعليم للأطفال",
      description: "توفير المستلزمات الدراسية للطلاب المحتاجين",
      targetAmount: 30000,
      currentAmount: 18750,
      donorsCount: 89,
      daysLeft: 22,
      image: "/images/campaign2.jpg",
      category: "تعليم",
      location: "جدة"
    },
    {
      id: 3,
      title: "كسوة الشتاء",
      description: "توزيع الملابس الشتوية على المحتاجين",
      targetAmount: 25000,
      currentAmount: 21000,
      donorsCount: 156,
      daysLeft: 8,
      image: "/images/campaign3.jpg",
      category: "إغاثة",
      location: "الدمام"
    }
  ]);

  const calculateProgress = (current, target) => {
    return Math.round((current / target) * 100);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="general-donations-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-section-inner" style={{display:'flex',flexWrap:'wrap',alignItems:'center',minHeight:'50vh',gap:'2rem'}}>
          <div style={{flex:'1 1 350px',minWidth:300}}>
            <div className="hero-content">
              <h1 className="hero-title">
                <FiHeart className="hero-icon" />
                تبرعات عامة
              </h1>
              <p className="hero-description">
                ساهم في إحداث فرق حقيقي في المجتمع من خلال دعم الحملات الخيرية المتنوعة. 
                كل تبرع، مهما كان صغيراً، يمكن أن يغير حياة شخص للأفضل.
              </p>
              <div className="hero-buttons" style={{display:'flex',gap:'1rem'}}>
                <button className="btn btn-primary" style={{padding:'0.75rem 2rem',fontSize:'1.1rem',borderRadius:8,background:'#007bff',color:'#fff',border:'none',fontWeight:600,cursor:'pointer'}} onClick={() => navigate('/campaigns/create')}>
                  <FiPlus style={{marginLeft:8}} />
                  إنشاء حملة جديدة
                </button>
                <button className="btn btn-outline-primary" style={{padding:'0.75rem 2rem',fontSize:'1.1rem',borderRadius:8,background:'#fff',color:'#007bff',border:'2px solid #007bff',fontWeight:600,cursor:'pointer'}} onClick={() => navigate('/campaigns/list')}>
                  <FiList style={{marginLeft:8}} />
                  تصفح الحملات
                </button>
              </div>
            </div>
          </div>
          <div style={{flex:'1 1 350px',minWidth:300,display:'flex',justifyContent:'center'}}>
            <div className="hero-image">
              <img 
                src={require('../images/tabar4.jpg')} 
                alt="تبرعات عامة" 
                style={{maxWidth:'100%',borderRadius:'1rem',boxShadow:'0 4px 24px rgba(0,0,0,0.10)'}}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="stats-section-inner" style={{display:'flex',flexWrap:'wrap',gap:'1.5rem',justifyContent:'center'}}>
          <div className="stat-card text-center" style={{flex:'1 1 200px',minWidth:200,maxWidth:260,background:'#fff',borderRadius:12,boxShadow:'0 2px 12px rgba(0,0,0,0.07)',padding:'2rem 1rem',marginBottom:'1rem'}}>
            <div className="stat-icon text-primary mb-3"><FiTarget size={40} /></div>
            <h3 className="stat-number">{stats.totalCampaigns}</h3>
            <p className="stat-label">إجمالي الحملات</p>
          </div>
          <div className="stat-card text-center" style={{flex:'1 1 200px',minWidth:200,maxWidth:260,background:'#fff',borderRadius:12,boxShadow:'0 2px 12px rgba(0,0,0,0.07)',padding:'2rem 1rem',marginBottom:'1rem'}}>
            <div className="stat-icon text-success mb-3"><FiTrendingUp size={40} /></div>
            <h3 className="stat-number">{stats.activeCampaigns}</h3>
            <p className="stat-label">الحملات النشطة</p>
          </div>
          <div className="stat-card text-center" style={{flex:'1 1 200px',minWidth:200,maxWidth:260,background:'#fff',borderRadius:12,boxShadow:'0 2px 12px rgba(0,0,0,0.07)',padding:'2rem 1rem',marginBottom:'1rem'}}>
            <div className="stat-icon text-info mb-3"><FiUsers size={40} /></div>
            <h3 className="stat-number">{stats.totalDonations}</h3>
            <p className="stat-label">إجمالي التبرعات</p>
          </div>
          <div className="stat-card text-center" style={{flex:'1 1 200px',minWidth:200,maxWidth:260,background:'#fff',borderRadius:12,boxShadow:'0 2px 12px rgba(0,0,0,0.07)',padding:'2rem 1rem',marginBottom:'1rem'}}>
            <div className="stat-icon text-warning mb-3"><FiHeart size={40} /></div>
            <h3 className="stat-number">{formatCurrency(stats.totalAmount)}</h3>
            <p className="stat-label">المبلغ المجموع</p>
          </div>
        </div>
      </section>

      {/* Featured Campaigns Section */}
      <section className="featured-campaigns-section">
        <div className="section-header text-center mb-5">
          <h2 className="section-title">الحملات المميزة</h2>
          <p className="section-subtitle">
            اكتشف أحدث الحملات الخيرية التي تحتاج لدعمك
          </p>
        </div>
        <div className="featured-campaigns-grid" style={{display:'flex',flexWrap:'wrap',gap:'2rem',justifyContent:'center'}}>
          {featuredCampaigns.map((campaign) => (
            <div className="campaign-card" key={campaign.id} style={{flex:'1 1 320px',minWidth:280,maxWidth:370,background:'#fff',borderRadius:14,boxShadow:'0 2px 16px rgba(0,0,0,0.09)',display:'flex',flexDirection:'column',padding:'1.5rem'}}>
              <div className="campaign-image-wrapper" style={{position:'relative',marginBottom:'1rem'}}>
                <img 
                  src={campaign.image} 
                  alt={campaign.title}
                  className="campaign-image"
                  style={{width:'100%',borderRadius:'10px',height:180,objectFit:'cover'}}
                />
                <span className="campaign-category" style={{position:'absolute',top:12,right:12,background:'#007bff',color:'#fff',borderRadius:8,padding:'2px 12px',fontSize:13,fontWeight:600}}>{campaign.category}</span>
              </div>
              <div className="campaign-meta mb-2" style={{marginBottom:8}}>
                <small className="text-muted">
                  <FiMapPin style={{marginLeft:4}} />
                  {campaign.location}
                  <span style={{margin:'0 8px'}}>•</span>
                  <FiCalendar style={{marginLeft:4}} />
                  {campaign.daysLeft} يوم متبقي
                </small>
              </div>
              <h3 className="campaign-title" style={{fontSize:'1.15rem',fontWeight:700,marginBottom:6}}>{campaign.title}</h3>
              <p className="campaign-description" style={{color:'#555',marginBottom:10}}>{campaign.description}</p>
              <div className="campaign-progress mb-3" style={{marginBottom:12}}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
                  <span style={{fontWeight:600}}>{formatCurrency(campaign.currentAmount)}</span>
                  <span className="text-muted">من {formatCurrency(campaign.targetAmount)}</span>
                </div>
                <div className="progress" style={{background:'#e9ecef',borderRadius:8,height:10,overflow:'hidden'}}>
                  <div 
                    className="progress-bar bg-success" 
                    style={{ width: `${calculateProgress(campaign.currentAmount, campaign.targetAmount)}%`,background:'#28a745',height:'100%' }}
                  ></div>
                </div>
                <div className="progress-info mt-2" style={{marginTop:6}}>
                  <small className="text-muted">
                    {calculateProgress(campaign.currentAmount, campaign.targetAmount)}% مكتمل
                    <span style={{margin:'0 8px'}}>•</span>
                    {campaign.donorsCount} متبرع
                  </small>
                </div>
              </div>
              <div style={{marginTop:'auto'}}>
                <button 
                  className="btn btn-primary" 
                  style={{width:'100%',padding:'0.75rem',fontWeight:600,fontSize:'1rem',borderRadius:8,background:'#007bff',color:'#fff',border:'none',cursor:'pointer'}}
                  onClick={() => navigate(`/campaigns/${campaign.id}`)}
                >
                  تبرع الآن
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center mt-4" style={{marginTop:'2rem',textAlign:'center'}}>
          <button 
            className="btn btn-outline-primary" 
            style={{padding:'0.75rem 2rem',fontSize:'1.1rem',borderRadius:8,background:'#fff',color:'#007bff',border:'2px solid #007bff',fontWeight:600,cursor:'pointer'}}
            onClick={() => navigate('/campaigns/list')}
          >
            عرض جميع الحملات
          </button>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="cta-section">
        <div className="cta-section-inner" style={{display:'flex',flexWrap:'wrap',alignItems:'center',gap:'2rem',justifyContent:'space-between'}}>
          <div style={{flex:'2 1 350px',minWidth:260}}>
            <h3 className="cta-title">هل لديك مبادرة خيرية؟</h3>
            <p className="cta-description">
              ابدأ حملتك الخيرية اليوم وساعد في تحقيق أهدافك الإنسانية. 
              منصتنا توفر لك جميع الأدوات اللازمة لإدارة حملتك بنجاح.
            </p>
          </div>
          <div style={{flex:'1 1 200px',minWidth:180,textAlign:'end'}}>
            <button 
              className="btn btn-light" 
              style={{padding:'0.75rem 2rem',fontSize:'1.1rem',borderRadius:8,background:'#f8f9fa',color:'#007bff',border:'2px solid #e9ecef',fontWeight:600,cursor:'pointer'}}
              onClick={() => navigate('/campaigns/create')}
            >
              <FiPlus style={{marginLeft:8}} />
              ابدأ حملتك الآن
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default GeneralDonations;