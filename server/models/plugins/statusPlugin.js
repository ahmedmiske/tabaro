// server/models/plugins/statusPlugin.js
module.exports = function statusPlugin(schema, options = {}) {
  const dateField = options.dateField || 'deadline';

  // لو ما فيه حقل status نضيفه (للاستعدادات مثلاً)
  if (!schema.path('status')) {
    schema.add({
      status: {
        type: String,
        enum: ['active', 'paused', 'finished'],
        default: 'active',
        index: true,
      },
    });
  }

  // دالة تحسب الحالة الفعلية
  schema.methods.getEffectiveStatus = function () {
    let baseStatus = this.status;

    // دعم الحقول القديمة isActive
    if (!baseStatus && typeof this.isActive === 'boolean') {
      baseStatus = this.isActive ? 'active' : 'paused';
    }

    if (!baseStatus) {
      baseStatus = 'active';
    }

    const dateValue = this[dateField];

    // لو فيه تاريخ صالح وانتهى والـ status ما زال active => نعتبره finished
    if (dateValue instanceof Date && !Number.isNaN(dateValue.getTime())) {
      if (dateValue.getTime() < Date.now() && baseStatus === 'active') {
        return 'finished';
      }
    }

    return baseStatus;
  };

  function transformWithStatus(doc, ret) {
    if (typeof doc.getEffectiveStatus === 'function') {
      ret.status = doc.getEffectiveStatus();
    }
    return ret;
  }

  // toJSON
  schema.set('toJSON', {
    virtuals: true,
    transform: (doc, ret) => transformWithStatus(doc, ret),
  });

  // toObject (لو احتجته في أماكن أخرى)
  schema.set('toObject', {
    virtuals: true,
    transform: (doc, ret) => transformWithStatus(doc, ret),
  });
};
