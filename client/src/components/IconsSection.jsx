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
      description: 'رعاية الأيتام'
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
      title: 'رعاية المرضى',
      description: 'رعاية المرضى'
    },
    {
      id: 4,
      icon: '🕌',
      title: 'خدمة بيوت الله',
      description: 'خدمة بيوت الله'
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
