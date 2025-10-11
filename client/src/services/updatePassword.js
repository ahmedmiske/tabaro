const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('../../../server/models/user');

// اتصل بقاعدة البيانات
mongoose.connect('mongodb://localhost:27017/pndd', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

async function createUser() {
    try {
        const newPassword = "123"; // كلمة المرور الجديدة
        const salt = await bcrypt.genSalt(10); // إنشاء ملح
        const hashedPassword = await bcrypt.hash(newPassword, salt); // تجزئة كلمة المرور

        // إنشاء كائن المستخدم الجديد
        const newUser = new User({
            firstName: "Sidi", // الاسم الشخصي
            lastName: "SIDI", // الاسم العائلي
            username: "ahmed", // اسم المستخدم
            password: hashedPassword, // كلمة المرور المجزأة
            email: "ahmed@yahoo.fr", // البريد الإلكتروني
            userType: "individual", // نوع المستخدم
            phoneNumber: "36351161", // رقم الهاتف
            status: "verified" // الحالة
            // يمكنك إضافة المزيد من الحقول حسب تعريف النموذج في مشروعك
        });

        const savedUser = await newUser.save(); // حفظ المستخدم في قاعدة البيانات
        console.log("User created successfully:", savedUser);
    } catch (e) {
        console.error("Error creating user:", e);
    } finally {
        mongoose.connection.close(); // غلق الاتصال بقاعدة البيانات
    }
}

createUser();
