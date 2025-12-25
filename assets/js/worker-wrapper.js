// worker-wrapper.js
// ⭐ ملف وهمي (Wrapper) لجعل compression-worker.js متوافق مع ES6 Modules (نوعًا ما)
// ⭐ يستخدمه file-processor.js أو worker-manager.js للإشارة إلى وجود compression-worker.js
// ⭐ ملاحظة: compression-worker.js هو Web Worker، لا يمكن استيراده كـ ES6 Module بشكل مباشر.
// ⭐ هذا الملف فقط يُشير إلى وجود الملف الأصلي، لا يحتوي على محتواه.

// ⭐ لا يمكن استيراد compression-worker.js كـ ES6 Module لأنها Web Worker
// ⭐ لذا لا نستخدم import هنا
// ⭐ بدلاً من ذلك، نُعرف ثابتًا يُشير إلى اسم الملف الأصلي
// ⭐ يمكن استخدام هذا الثابت في إنشاء Web Worker لاحقًا

// ⭐ تعريف ثابت لاسم الملف
export const COMPRESSION_WORKER_URL = './compression-worker.js';

// ⭐ (اختياري) إذا كنت ترغب في تصدير وظيفة لإنشاء Web Worker
// ⭐ (يُفضل أن يتم هذا من file-processor.js أو worker-manager.js)
/*
export function createCompressionWorker() {
  if (typeof Worker !== 'undefined') {
    try {
      const worker = new Worker(COMPRESSION_WORKER_URL);
      console.log('Compression worker created:', worker);
      return worker;
    } catch (error) {
      console.error('Failed to create compression worker:', error);
      throw error;
    }
  } else {
    console.warn('Web Workers are not supported in this browser.');
    return null;
  }
}
*/

// ⭐ التصدير الموحّد
export {
  // createCompressionWorker, // (إذا أضفت الوظيفة أعلاه)
  COMPRESSION_WORKER_URL
};

// ========================================================================
// ⭐ النهاية
// ========================================================================
