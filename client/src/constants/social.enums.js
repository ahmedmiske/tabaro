// أنواع الإعلانات
export const SOCIAL_AD_CATEGORY = Object.freeze({
  VOLUNTEERING: 'VOLUNTEERING',
  SOCIAL_IDEA: 'SOCIAL_IDEA',
  MISSING_PERSON_SEARCH: 'MISSING_PERSON_SEARCH',
  MISSING_PERSON_FOUND: 'MISSING_PERSON_FOUND',
  JOB_SEEKER: 'JOB_SEEKER',
  JOB_OFFER: 'JOB_OFFER',
});

// الحالات
export const SOCIAL_AD_STATUS = Object.freeze({
  PendingReview: 'PendingReview',
  Published: 'Published',
  Expired: 'Expired',
  Archived: 'Archived',
  Rejected: 'Rejected',
});

// تسميات عربية مختصرة لواجهة المستخدم
export const CATEGORY_LABELS_AR = {
  VOLUNTEERING: 'مبادرات تطوعية',
  SOCIAL_IDEA: 'أفكار اجتماعية',
  MISSING_PERSON_SEARCH: 'بحث عن مفقود',
  MISSING_PERSON_FOUND: 'عُثر على مفقود',
  JOB_SEEKER: 'البحث عن عمل',
  JOB_OFFER: 'إعلان وظيفة',
};

export const STATUS_LABELS_AR = {
  PendingReview: 'قيد المراجعة',
  Published: 'منشور',
  Expired: 'منتهي',
  Archived: 'مؤرشف',
  Rejected: 'مرفوض',
};
