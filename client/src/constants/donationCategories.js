// src/constants/donationCategories.js
import {
  FiHeart, FiDollarSign, FiAlertOctagon, FiUsers, FiLayers,
  FiFeather, FiPackage, FiClock, FiHome, FiBook
} from 'react-icons/fi';

export const GENERAL_CATEGORY_META = {
  sadaqa:          { label: 'صدقة',             icon: FiHeart,       color: 'primary'  },
  zakat:           { label: 'زكاة',              icon: FiDollarSign,  color: 'success'  },
  kafara:          { label: 'كفارة',             icon: FiAlertOctagon,color: 'danger'   },
  orphans:         { label: 'الأيتام',           icon: FiUsers,       color: 'warning'  },
  awqaf:           { label: 'الأوقاف',           icon: FiLayers,      color: 'info'     },
  livestock:       { label: 'الأنعام',           icon: FiFeather,     color: 'secondary'},
  money:           { label: 'المساعدات المالية', icon: FiDollarSign,  color: 'success'  },
  goods:           { label: 'مواد/أغراض',        icon: FiPackage,     color: 'secondary'},
  time:            { label: 'تطوع بالوقت',       icon: FiClock,       color: 'info'     },
  mosque_services: { label: 'خدمات المسجد',      icon: FiHome,        color: 'success'  }, // جديد
  mahadir_services:{ label: 'خدمات المحاظر',     icon: FiBook,        color: 'primary'  }, // جديد
  other:           { label: 'أخرى',              icon: FiHeart,       color: 'secondary'}
};

export const codeToLabel = (code) => GENERAL_CATEGORY_META[code]?.label || 'أخرى';

export const labelToCode = (label) => {
  const entry = Object.entries(GENERAL_CATEGORY_META).find(([,v]) => v.label === label);
  return entry ? entry[0] : 'other';
};

export const GENERAL_CATEGORY_OPTIONS = Object.keys(GENERAL_CATEGORY_META)
  .map(k => ({ value: k, label: GENERAL_CATEGORY_META[k].label }));
