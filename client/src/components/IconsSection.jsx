// src/components/IconsSection.jsx
import React from 'react';
import './IconsSection.css';
import SectionHeader from './SectionHeader.jsx';

const IconsSection = () => {
  const iconsData = [
    {
      id: 1,
      icon: '👨‍👧‍👦',
      title: 'رعاية الأيتام',
      description: 'كفالة ورعاية الأطفال الأيتام والمحتاجين'
    },
    {
      id: 2,
      icon: '💧',
      title: 'سقيا الماء',
      description: 'سقيا الماء'
    },
    {
      id: 3,
      icon: '🏥',
      title: 'دعم طبي',
      description: 'ساعد المرضى في تغطية تكاليف العلاج والأدوية'
    },
    {
      id: 4,
      icon: '🕌',
      title: 'خدمة بيوت الله',
      description: 'خدمة بيوت الله'
    },
    {
      id: 5,
      icon: '📚',
      title: 'دعم تعليمي',
      description: 'وفّر فرص التعليم للطلاب المحتاجين'
    },
    {
      id: 6,
      icon: '🏠',
      title: 'مساعدة إسكان',
      description: 'ساهم في توفير مأوى آمن للأسر المحتاجة'
    },
    {
      id: 7,
      icon: '🍲',
      title: 'إطعام المساكين',
      description: 'وفّر وجبات غذائية للعائلات والأفراد المحتاجين'
    },
    {
      id: 8,
      icon: '♿',
      title: 'ذوي الاحتياجات',
      description: 'دعم وتمكين الأشخاص ذوي الإعاقة'
    },
    {
      id: 9,
      icon: '📖',
      title: 'خدمة المحاظر',
      description: 'دعم المدارس التقليدية للتربية الدينية وتحفيظ القرآن'
    },
    {
      id: 10,
      icon: '💝',
      title: 'جبر الخواطر',
      description: 'مساعدة المحتاجين وإدخال السرور على قلوبهم'
    },
    {
      id: 11,
      icon: '💰',
      title: 'زكاة المال',
      description: 'إخراج زكاة المال للمستحقين والفقراء'
    },
    {
      id: 12,
      icon: '🐑',
      title: 'الأضاحي',
      description: 'توزيع لحوم الأضاحي على الفقراء والمساكين'
    }
  ];

  return (
    <section className="icons-section" aria-label="مجالات التبرع">
      <div className="icons-container">
        <SectionHeader title="مجالات الخير" />
        <div className="icons-grid">
          {iconsData.map((item) => (
            <div key={item.id} className="icon-card">
              <div className="icon-wrapper">
                <span className="icon" aria-hidden="true">
                  {item.icon}
                </span>
              </div>
              <h3 className="icon-card-title">{item.title}</h3>
              <p className="icon-card-description">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default IconsSection;
