// src/constants/donationCategories.js

// ميتاداتا لكل نوع تبرع
export const GENERAL_CATEGORY_META = {
  medical_support: {
    label: 'الإغاثة والدعم الطبي',
    description: 'دعم تكاليف العلاج والدواء والعمليات والأجهزة الطبية والمرضى المحتاجين.',
    color: 'danger',
  },
  water: {
    label: 'سقيا الماء',
    description: 'حفر الآبار، توفير خزانات، شراء مياه الشرب للأحياء الفقيرة.',
    color: 'info',
  },
  orphans: {
    label: 'كفالة ورعاية الأيتام',
    description: 'رعاية الأيتام وأسرهم في المعيشة والتعليم والصحة.',
    color: 'warning',
  },
  food: {
    label: 'إطعام الفقراء والمساكين',
    description: 'سلات غذائية، وجبات ساخنة، موائد إفطار، دعم غذائي شهري.',
    color: 'success',
  },
  education: {
    label: 'دعم التعليم والمعرفة',
    description: 'رسوم دراسية، لوازم مدرسية، دعم طلاب العلم والمدارس.',
    color: 'primary',
  },
  mahadir_quran: {
    label: 'دعم المحاظر والقرآن الكريم',
    description: 'دعم المحاظر وطلابها، توفير مصاحف ووسائل تعليم القرآن.',
    color: 'success',
  },
  mosques: {
    label: 'عمارة بيوت الله',
    description: 'بناء المساجد، ترميمها، تجهيزها وصيانتها.',
    color: 'secondary',
  },
  housing: {
    label: 'إسكان وإيواء المحتاجين',
    description: 'ترميم منازل بسيطة، مساعدات إيجار، توفير سكن طارئ للمحتاجين.',
    color: 'secondary',
  },
  disability_support: {
    label: 'تمكين ذوي الإعاقة',
    description: 'أجهزة مساعدة، كراسي متحركة، دعم تعليم وعلاج ذوي الإعاقة.',
    color: 'info',
  },
  relief: {
    label: 'الإغاثة الطارئة',
    description: 'دعم المتضررين من الكوارث والحوادث، وتقديم العون العاجل.',
    color: 'danger',
  },
  hardship_relief: {
    label: 'جبر الخواطر وتفريج الكرب',
    description: 'مساعدات إنسانية متنوعة لتخفيف الكرب وجبر الخاطر.',
    color: 'warning',
  },
  debt_repayment: {
    label: 'قضاء الديون',
    description: 'مساعدة الغارمين في سداد ديونهم بقدر الاستطاعة.',
    color: 'dark',
  },
  clothes_furniture: {
    label: 'توزيع الملابس والأثاث',
    description: 'توفير أو توزيع ملابس أو أثاث للأسر المحتاجة.',
    color: 'secondary',
  },
  udhiyah: {
    label: 'الأضحية',
    description: 'المشاركة في أضاحي العيد وتوزيع لحومها على المحتاجين.',
    color: 'success',
  },
  general_sadaqah: {
    label: 'الصدقة العامة',
    description: 'تبرعات عامة غير مقيّدة لوجوه الخير المختلفة.',
    color: 'primary',
  },
  zakat: {
    label: 'زكاة المال',
    description: 'إخراج زكاة المال في مصارفها الشرعية.',
    color: 'warning',
  },
  financial_aid: {
    label: 'المساعدات المالية',
    description: 'مبالغ مالية مباشرة لدعم الأسر، المرضى، الطلاب، والحالات العاجلة.',
    color: 'warning',
  },
  other: {
    label: 'أوجه خير أخرى',
    description: 'أعمال خيرية أخرى لا تندرج تحت التصنيفات السابقة.',
    color: 'secondary',
  },
};

// مصفوفة خيارات للاستخدام في الـ <select>
export const GENERAL_CATEGORY_OPTIONS = Object.keys(GENERAL_CATEGORY_META).map(
  (k) => ({
    value: k,
    label: GENERAL_CATEGORY_META[k].label,
  }),
);

// تحويل الكود إلى عنوان عربي
export const codeToLabel = (code) =>
  GENERAL_CATEGORY_META[code]?.label || '';

// تحويل العنوان العربي إلى الكود الداخلي
export const labelToCode = (label) => {
  if (!label) return '';
  const entry = Object.entries(GENERAL_CATEGORY_META).find(
    ([, v]) => v.label === label,
  );
  return entry ? entry[0] : '';
};
