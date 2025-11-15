// server.js
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

// --- 1. استيراد المكتبات الجديدة ---
const http = require('http'); // مكتبة http الأساسية
const { Server } = require("socket.io"); // مكتبة Socket.io
const { initializeSocket } = require('./socketHandlers'); // ملفنا الجديد

// --- تهيئة الخادم ---
const app = express();
const PORT = process.env.PORT || 5000;
const prisma = new PrismaClient();

// --- 2. إنشاء الخادم بالطريقة الجديدة ---
const server = http.createServer(app); // إنشاء خادم http من express app
const io = new Server(server, {       // ربط Socket.io بالخادم
  cors: {
    origin: "*", // السماح بالاتصال من أي مكان (يمكن تقييده لاحقاً)
    methods: ["GET", "POST"]
  }
});
// ------------------------------------

// --- Middlewares ---
app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:5173", "https://engineering-system-eight.vercel.app"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
}));

app.use(express.json());

app.use('/uploads', express.static('uploads'));

// --- ربط ملفات الـ API (تبقى كما هي) ---
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

const employeeRoutes = require('./routes/employeeRoutes');
app.use('/api/employees', employeeRoutes);

const projectRoutes = require('./routes/projectRoutes');
app.use('/api/projects', projectRoutes);

const roleRoutes = require('./routes/roleRoutes');
app.use('/api/roles', roleRoutes);

const permissionRoutes = require('./routes/permissionRoutes');
app.use('/api/permissions', permissionRoutes);

const permissionGroupRoutes = require('./routes/permissionGroupRoutes');
app.use('/api/permission-groups', permissionGroupRoutes);

const clientRoutes = require('./routes/clientRoutes');
app.use('/api/clients', clientRoutes);

const settingsRoutes = require('./routes/settingsRoutes');
app.use('/api/settings', settingsRoutes);

const classificationRoutes = require('./routes/classificationRoutes');
app.use('/api/classifications', classificationRoutes);

const transactionRoutes = require('./routes/transactionRoutes');
app.use('/api/transactions', transactionRoutes);

const taskRoutes = require('./routes/taskRoutes');
app.use('/api/tasks', taskRoutes);

const contractRoutes = require('./routes/contractRoutes');
app.use('/api/contracts', contractRoutes);

const quotationRoutes = require('./routes/quotationRoutes');
app.use('/api/quotations', quotationRoutes);

const attachmentRoutes = require('./routes/attachmentRoutes');
app.use('/api/attachments', attachmentRoutes);

const documentRoutes = require('./routes/documentRoutes');
app.use('/api/documents', documentRoutes);

const docClassificationRoutes = require('./routes/docClassificationRoutes');
app.use('/api/document-classifications', docClassificationRoutes);

const dashboardRoutes = require('./routes/dashboardRoutes');
app.use('/api/dashboard', dashboardRoutes);

// --- مسار تجريبي (يبقى كما هو) ---
app.get('/', (req, res) => {
  res.json({ message: "مرحباً بك في API شركة الاستشارات الهندسية" });
});

// --- 3. تشغيل معالج الـ Socket ---
initializeSocket(io);
// --------------------------------

// --- 4. تغيير طريقة تشغيل الخادم ---
// بدلاً من app.listen، نستخدم server.listen
server.listen(PORT, () => {
  console.log(`🚀 الخادم يعمل على البورت ${PORT}`);
  console.log(`📡 [Socket.IO] يستمع للاتصالات`);
});
// -----------------------------------