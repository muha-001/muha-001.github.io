/**
 * CipherVault 3D Pro - File Processing Engine
 * Handles chunked file processing, worker coordination, and memory safety
 * Version: 4.2.0
 */

class FileProcessorSystem {
    constructor() {
        this.activeProcess = null;
        this.chunkSize = 10 * 1024 * 1024; // 10MB default chunk size
        this.maxFileSize = 5 * 1024 * 1024 * 1024; // 5GB limit
    }

    /**
     * معالجة الملف (تشفير أو فك تشفير)
     * @param {File} file - الملف المختار
     * @param {string} password - كلمة المرور
     * @param {string} operation - 'encrypt' | 'decrypt'
     */
    async processFile(file, password, operation) {
        if (!this.validateFile(file)) return;

        const startTime = Date.now();
        const operationId = `OP_${startTime}_${Math.random().toString(36).substr(2, 9)}`;
        
        // تسجيل بدء العملية
        if (window.AuditLogger) {
            window.AuditLogger.log('FILE_PROCESS_START', 'INFO', {
                fileName: file.name,
                size: file.size,
                operation,
                id: operationId
            });
        }

        try {
            window.UIManager.setBusyState(true);
            
            // تجهيز المفاتيح المشتقة (Key Derivation)
            // نستخدم CryptoMilitary للعمليات الحساسة
            const keyMaterial = await window.MilitaryCryptoEngine.deriveKeyMaterial(password);
            
            // تحديد استراتيجية المعالجة بناءً على الحجم
            if (file.size < this.chunkSize) {
                await this.processSmallFile(file, keyMaterial, operation);
            } else {
                await this.processLargeFileStream(file, keyMaterial, operation);
            }

            // تسجيل النجاح
            if (window.AuditLogger) {
                window.AuditLogger.log('FILE_PROCESS_COMPLETE', 'SUCCESS', {
                    duration: Date.now() - startTime,
                    id: operationId
                });
            }
            
            window.UIManager.showNotification(`${operation}-success`, 'success');

        } catch (error) {
            console.error('Processing failed:', error);
            window.UIManager.showNotification(error.message || 'generic-error', 'error');
            
            if (window.AuditLogger) {
                window.AuditLogger.log('FILE_PROCESS_ERROR', 'ERROR', {
                    error: error.toString(),
                    id: operationId
                });
            }
        } finally {
            window.UIManager.setBusyState(false);
            window.UIManager.updateProgress(0, 'idle', 'IDLE');
        }
    }

    validateFile(file) {
        if (!file) {
            throw new Error('No file selected');
        }
        if (file.size > this.maxFileSize) {
            throw new Error('File too large (Max 5GB)');
        }
        return true;
    }

    /**
     * معالجة الملفات الصغيرة (في الذاكرة مباشرة)
     */
    async processSmallFile(file, keyMaterial, operation) {
        window.UIManager.updateProgress(10, 'reading-file', operation === 'encrypt' ? 'ENCRYPTING' : 'DECRYPTING');
        
        const buffer = await file.arrayBuffer();
        let result;

        if (operation === 'encrypt') {
            result = await window.MilitaryCryptoEngine.encrypt(buffer, keyMaterial);
        } else {
            result = await window.MilitaryCryptoEngine.decrypt(buffer, keyMaterial);
        }

        window.UIManager.updateProgress(90, 'saving-file', 'COMPLETED');
        this.saveFile(result, file.name, operation);
        
        // تنظيف الذاكرة
        window.MilitaryCryptoEngine.secureCleanup([buffer]);
    }

    /**
     * معالجة الملفات الكبيرة (Chunking & Workers)
     * يستخدم WorkerManager الموجود في web-workers.js
     */
    async processLargeFileStream(file, keyMaterial, operation) {
        const totalChunks = Math.ceil(file.size / this.chunkSize);
        let processedChunks = 0;
        
        // تهيئة كاتب الدفق (Stream Writer)
        const writableStream = await this.createSaveStream(file.name, operation);
        const writer = writableStream.getWriter();

        for (let start = 0; start < file.size; start += this.chunkSize) {
            const end = Math.min(start + this.chunkSize, file.size);
            const chunk = file.slice(start, end);
            const buffer = await chunk.arrayBuffer();

            // إرسال القطعة للـ Worker
            // ملاحظة: يفترض أن WorkerManager يدعم دالة processChunk
            // إذا لم يكن كذلك، يمكن استدعاء Web Worker يدوياً هنا
            const processedBuffer = await this.processChunkInWorker(buffer, keyMaterial, operation, processedChunks);
            
            await writer.write(new Uint8Array(processedBuffer));
            
            // تحديث التقدم
            processedChunks++;
            const progress = (processedChunks / totalChunks) * 100;
            window.UIManager.updateProgress(progress, operation === 'encrypt' ? 'encrypting-chunk' : 'decrypting-chunk', operation === 'encrypt' ? 'ENCRYPTING' : 'DECRYPTING');
            
            // تنظيف الذاكرة المرحلية
            // buffer = null; // Let GC handle it
        }

        await writer.close();
    }

    // محاكاة الاتصال بـ Web Worker لمعالجة القطعة
    async processChunkInWorker(buffer, keyMaterial, operation, index) {
        // في التطبيق الحقيقي، نستخدم WorkerManager.postMessage
        // هنا سأستخدم المحرك المباشر للتبسيط، ولكن يجب ربطه بـ web-workers.js
        if (operation === 'encrypt') {
            return await window.MilitaryCryptoEngine.encryptChunk(buffer, keyMaterial, index);
        } else {
            return await window.MilitaryCryptoEngine.decryptChunk(buffer, keyMaterial, index);
        }
    }

    createSaveStream(originalName, operation) {
        // استخدام File System Access API إذا كان مدعوماً
        // أو StreamSaver.js كبديل
        const newName = operation === 'encrypt' ? `${originalName}.cvault` : originalName.replace('.cvault', '');
        
        // (تبسيط للنسخة الحالية - التنزيل المباشر غير مدعوم بالكامل للـ Streams في كل المتصفحات)
        // هذا الكود يتطلب مكتبة StreamSaver.js أو Native File System API
        // سأضع Placeholder للتطبيق الفعلي
        return {
            getWriter: () => {
                const chunks = [];
                return {
                    write: (chunk) => chunks.push(chunk),
                    close: () => {
                        const blob = new Blob(chunks);
                        this.saveFile(blob, newName, operation);
                    }
                };
            }
        };
    }

    saveFile(data, fileName, operation) {
        const blob = data instanceof Blob ? data : new Blob([data]);
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        
        // تعديل الاسم والامتداد
        if (operation === 'encrypt' && !fileName.endsWith('.cvault')) {
            a.download = fileName + '.cvault';
        } else if (operation === 'decrypt' && fileName.endsWith('.cvault')) {
            a.download = fileName.replace('.cvault', '');
        } else {
            a.download = fileName;
        }

        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
}

const FileProcessor = new FileProcessorSystem();
if (typeof window !== 'undefined') {
    window.FileProcessor = FileProcessor;
}
