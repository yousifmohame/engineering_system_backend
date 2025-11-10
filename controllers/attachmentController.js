// controllers/attachmentController.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');
const path = require('path');

// ===============================================
// 1. رفع ملف جديد وربطه
// POST /api/attachments/upload
// ===============================================
const uploadFile = async (req, res) => {
  try {
    // 1. التحقق من وجود الملف (multer يضيفه إلى req.file)
    if (!req.file) {
      return res.status(400).json({ message: 'لم يتم رفع أي ملف' });
    }

    // 2. جلب الـ IDs من جسم الطلب
    const { transactionId, contractId, clientId } = req.body;
    
    // 3. حفظ معلومات الملف في قاعدة البيانات
    const newAttachment = await prisma.attachment.create({
      data: {
        fileName: req.file.originalname,
        filePath: req.file.path, // المسار الذي حفظه multer
        fileType: req.file.mimetype,
        fileSize: req.file.size,
        uploadedById: req.employee.id, // من وسيط الحماية
        
        // ربط الملف (إذا تم إرسال الـ ID)
        ...(transactionId && { transactionId: transactionId }),
        ...(contractId && { contractId: contractId }),
        ...(clientId && { clientId: clientId }),
      }
    });

    res.status(201).json({ message: 'تم رفع الملف بنجاح', attachment: newAttachment });

  } catch (error) {
    console.error(error);
    // في حال حدوث خطأ، احذف الملف الذي تم رفعه
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
};

// ===============================================
// 2. جلب مرفقات معاملة معينة
// GET /api/attachments/transaction/:transactionId
// ===============================================
const getAttachmentsForTransaction = async (req, res) => {
    try {
        const { transactionId } = req.params;
        const attachments = await prisma.attachment.findMany({
            where: { transactionId: transactionId },
            include: {
                uploadedBy: { select: { name: true } } // جلب اسم من قام بالرفع
            },
            orderBy: { createdAt: 'desc' }
        });
        res.status(200).json(attachments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'خطأ في الخادم' });
    }
};
// (يمكنك إضافة getAttachmentsForContract بنفس الطريقة)


// ===============================================
// 3. حذف مرفق
// DELETE /api/attachments/:id
// ===============================================
const deleteAttachment = async (req, res) => {
    try {
        const { id } = req.params;

        // 1. العثور على المرفق
        const attachment = await prisma.attachment.findUnique({
            where: { id: id }
        });

        if (!attachment) {
            return res.status(404).json({ message: 'المرفق غير موجود' });
        }

        // (اختياري: يمكنك إضافة تحقق من الصلاحيات هنا)

        // 2. حذف الملف من الخادم (File System)
        try {
            fs.unlinkSync(attachment.filePath);
        } catch (fsError) {
            console.warn(`Failed to delete file from disk: ${attachment.filePath}`, fsError);
            // (نستمر حتى لو فشل حذف الملف، الأهم حذفه من القاعدة)
        }

        // 3. حذف سجل الملف من قاعدة البيانات
        await prisma.attachment.delete({
            where: { id: id }
        });

        res.status(200).json({ message: 'تم حذف المرفق بنجاح' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'خطأ في الخادم' });
    }
};


module.exports = {
  uploadFile,
  getAttachmentsForTransaction,
  deleteAttachment
};