// socketHandlers.js
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const prisma = new PrismaClient();

function initializeSocket(io) {

  // ===============================================
  // 1. وسيط (Middleware) لمصادقة الـ Socket
  // ===============================================
  // هذا الـ "Middleware" سيعمل مرة واحدة عند محاولة أي مستخدم الاتصال
  // ويقوم بالتحقق من الـ Token الخاص به.
  io.use(async (socket, next) => {
    try {
      // 1. جلب التوكن من طلب الاتصال
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error: No token provided.'));
      }
      
      const tokenValue = token.split(' ')[1]; // إزالة "Bearer "
      if (!tokenValue) {
        return next(new Error('Authentication error: Invalid token format.'));
      }

      // 2. التحقق من التوكن
      const decoded = jwt.verify(tokenValue, process.env.JWT_SECRET);
      
      // 3. جلب الموظف والتحقق من وجوده
      const employee = await prisma.employee.findUnique({
        where: { id: decoded.id },
      });

      if (!employee) {
        return next(new Error('Authentication error: Employee not found.'));
      }

      // 4. إرفاق بيانات الموظف بالـ socket
      // هذا يجعلنا نعرف من هو المستخدم في جميع الأحداث القادمة
      socket.employee = employee;
      next();

    } catch (error) {
      console.error("Socket Auth Error:", error.message);
      next(new Error('Authentication error.'));
    }
  });


  // ===============================================
  // 2. معالجة الاتصالات
  // ===============================================
  io.on('connection', (socket) => {
    console.log(`✅ [Socket.IO] User connected: ${socket.employee.name} (${socket.id})`);

    // --- الانضمام إلى المحادثات ---
    // عندما يفتح المستخدم صفحة محادثة، يجب أن يرسل "joinConversation"
    socket.on('joinConversation', (conversationId) => {
      socket.join(conversationId);
      console.log(`[Socket.IO] ${socket.employee.name} joined room: ${conversationId}`);
    });

    // --- مغادرة المحادثة ---
    socket.on('leaveConversation', (conversationId) => {
      socket.leave(conversationId);
      console.log(`[Socket.IO] ${socket.employee.name} left room: ${conversationId}`);
    });

    // --- إرسال رسالة ---
    // هذا هو الحدث الرئيسي
    socket.on('sendMessage', async (data) => {
      try {
        const { conversationId, content } = data;
        const senderId = socket.employee.id; // نحصل عليه من المصادقة

        if (!conversationId || !content) {
          return socket.emit('error', 'Missing conversationId or content');
        }

        // 1. حفظ الرسالة في قاعدة البيانات
        const newMessage = await prisma.message.create({
          data: {
            content: content,
            senderId: senderId,
            conversationId: conversationId,
          },
          include: {
            sender: { // جلب بيانات المرسل (الاسم)
              select: { name: true, employeeCode: true }
            }
          }
        });

        // 2. إرسال الرسالة الجديدة إلى جميع من في "الغرفة" (المحادثة)
        io.to(conversationId).emit('receiveMessage', newMessage);

      } catch (error) {
        console.error("Error saving message:", error);
        socket.emit('error', 'Server error while sending message.');
      }
    });

    // --- عند قطع الاتصال ---
    socket.on('disconnect', () => {
      console.log(`🔌 [Socket.IO] User disconnected: ${socket.employee.name} (${socket.id})`);
    });
  });
}

module.exports = { initializeSocket };