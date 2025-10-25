// server/middlewares/errorMiddleware.js

/** 404 - Not Found */
const notFound = (req, res, next) => {
  const err = new Error(`المورد غير موجود: ${req.originalUrl}`);
  err.status = 404;
  next(err);
};

/** معالج أخطاء ودّي وموحّد */
const errorHandler = (err, req, res, _next) => {
  const isProd = process.env.NODE_ENV === 'production';

  // حوّل بعض الأنواع إلى رسائل واضحة
  if (err?.name === 'ValidationError') {
    const details = Object.values(err.errors || {}).map(e => ({
      path: e.path,
      message: e.message,
      kind: e.kind,
    }));
    return res.status(400).json({
      message: 'البيانات غير صالحة، يرجى مراجعة الحقول.',
      details, // يمكن للواجهة عرضها أسفل الحقول
    });
  }

  if (err?.name === 'CastError') {
    return res.status(400).json({ message: 'المعرّف غير صالح.' });
  }

  if (err?.name === 'JsonWebTokenError' || err?.name === 'TokenExpiredError') {
    return res.status(401).json({ message: 'انتهت الصلاحية أو رمز الدخول غير صالح. سجّل الدخول مجددًا.' });
  }

  if (err?.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ message: 'حجم الملف أكبر من المسموح.' });
  }

  // إن كان مرفق status مسبقًا
  if (err?.status) {
    return res.status(err.status).json({ message: err.message || 'حدث خطأ.' });
  }

  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;

  // سجّل بإيجاز أثناء التطوير فقط
  if (!isProd) {
    console.warn('[API ERROR]', err?.name || 'Error', err?.message);
  }

  return res.status(statusCode).json({
    message: isProd ? 'حدث خطأ غير متوقع. حاول لاحقًا.' : (err?.message || 'Internal Server Error'),
    ...(isProd ? {} : { stack: err?.stack }),
  });
};

module.exports = { notFound, errorHandler };
