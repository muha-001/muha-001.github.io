/**
 * CipherVault 3D Pro - نظام تسجيل التدقيق المحسن
 * الإصدار: 4.2.1 - مصحح
 */

class EnhancedAuditLogger {
    constructor() {
        this.logs = [];
        this.maxLogs = 10000;
        this.encryptionKey = null;
        this.compressionEnabled = true;
        this.retentionDays = 30;
        this.autoExportInterval = 24 * 60 * 60 * 1000; // 24 ساعة
        
        // إضافة معرف جلسة فريد - محفوظ عبر الجلسات
        this.sessionId = this.getOrCreateSessionId();
        
        // تهيئة غير متزامنة
        this.initPromise = this.init();
    }
    
    getOrCreateSessionId() {
        // محاولة استرداد معرف الجلسة من التخزين المحلي
        let sessionId = localStorage.getItem('ciphervault_session_id');
        
        if (!sessionId) {
            // إنشاء معرف جلسة جديد
            sessionId = this.generateSessionId();
            
            // تخزينه في localStorage للمستقبل
            try {
                localStorage.setItem('ciphervault_session_id', sessionId);
            } catch (e) {
                console.warn('Failed to save session ID:', e);
            }
        }
        
        return sessionId;
    }
    
    generateSessionId() {
        return `sess_${Date.now()}_${crypto.getRandomValues(new Uint8Array(4))
            .reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '')}`;
    }
    
    async init() {
        try {
            // إنشاء مفتاح تشفير للسجلات
            await this.generateEncryptionKey();
            
            // تحميل السجلات المحفوظة
            await this.loadSavedLogs();
            
            // بدء التصدير التلقائي
            this.startAutoExport();
            
            // بدء التنظيف التلقائي
            this.startAutoCleanup();
            
            this.log('SYSTEM_INITIALIZED', 'INFO', {
                version: '4.2.1',
                maxLogs: this.maxLogs,
                retentionDays: this.retentionDays,
                sessionId: this.sessionId
            });
            
            console.log('Audit Logger initialized successfully');
        } catch (error) {
            console.error('Audit Logger initialization failed:', error);
            // الاستمرار بدون تشفير مع سجل الخطأ
            this.encryptionKey = null;
            
            // تسجيل الخطأ بدون تشفير
            this.logs.push({
                id: this.generateLogId(),
                type: 'INIT_FAILED',
                severity: 'ERROR',
                timestamp: Date.now(),
                timestampISO: new Date().toISOString(),
                userId: 'system',
                sessionId: this.sessionId,
                data: { error: error.message }
            });
        }
    }
    
    async generateEncryptionKey() {
        try {
            // استخدام معرف الجلسة كأساس للمفتاح
            const keyBase = this.sessionId + '_audit_log_key_2024';
            
            // استخدام salt ثابت ومخزن للتأكد من نفس المفتاح
            let salt = localStorage.getItem('ciphervault_audit_salt');
            if (!salt) {
                // إنشاء salt جديد
                salt = crypto.getRandomValues(new Uint8Array(16));
                localStorage.setItem('ciphervault_audit_salt', 
                    btoa(String.fromCharCode.apply(null, salt)));
            } else {
                // تحويل من base64 إلى Uint8Array
                salt = Uint8Array.from(atob(salt), c => c.charCodeAt(0));
            }
            
            // استيراد مادة المفتاح
            const keyMaterial = await crypto.subtle.importKey(
                'raw',
                new TextEncoder().encode(keyBase),
                { name: 'PBKDF2' },
                false,
                ['deriveKey']
            );
            
            // اشتقاق المفتاح باستخدام نفس المعلمات دائماً
            this.encryptionKey = await crypto.subtle.deriveKey(
                {
                    name: 'PBKDF2',
                    salt: salt,
                    iterations: 100000,
                    hash: 'SHA-256'
                },
                keyMaterial,
                { name: 'AES-GCM', length: 256 },
                true,
                ['encrypt', 'decrypt']
            );
            
            // التحقق من أن المفتاح صالح للاستخدام
            const testData = new TextEncoder().encode('test');
            const testIv = crypto.getRandomValues(new Uint8Array(12));
            
            const encrypted = await crypto.subtle.encrypt(
                {
                    name: 'AES-GCM',
                    iv: testIv
                },
                this.encryptionKey,
                testData
            );
            
            const decrypted = await crypto.subtle.decrypt(
                {
                    name: 'AES-GCM',
                    iv: testIv
                },
                this.encryptionKey,
                encrypted
            );
            
            const decoder = new TextDecoder();
            const result = decoder.decode(decrypted);
            
            if (result !== 'test') {
                throw new Error('Key test failed');
            }
            
            this.log('ENCRYPTION_KEY_GENERATED', 'INFO', {
                algorithm: 'AES-GCM-256',
                timestamp: Date.now(),
                sessionId: this.sessionId,
                keyValid: true
            });
            
        } catch (error) {
            console.warn('Failed to generate encryption key, using unencrypted logs:', error);
            this.encryptionKey = null;
            
            this.log('ENCRYPTION_KEY_FAILED', 'WARNING', {
                error: error.message,
                sessionId: this.sessionId,
                fallback: 'unencrypted'
            });
        }
    }
    
    async loadSavedLogs() {
        try {
            const saved = localStorage.getItem('ciphervault_audit_logs');
            if (!saved) {
                this.log('NO_SAVED_LOGS', 'INFO', {
                    message: 'No previous logs found'
                });
                return;
            }
            
            const parsed = JSON.parse(saved);
            
            // تحقق مما إذا كانت البيانات مشفرة
            if (parsed.unencrypted) {
                // بيانات غير مشفرة
                this.logs = Array.isArray(parsed.data) ? parsed.data.slice(-this.maxLogs) : [];
                this.log('LOGS_LOADED_UNENCRYPTED', 'INFO', {
                    count: this.logs.length,
                    source: 'localStorage'
                });
                return;
            }
            
            // محاولة فك التشفير
            try {
                const decrypted = await this.decryptLogs(saved);
                this.logs = decrypted.slice(-this.maxLogs);
                
                this.log('LOGS_LOADED', 'INFO', {
                    count: this.logs.length,
                    source: 'localStorage',
                    encrypted: true,
                    sessionId: this.sessionId
                });
            } catch (decryptionError) {
                console.warn('Failed to decrypt logs, attempting recovery:', decryptionError);
                
                // محاولة استرداد البيانات من الهيكل المباشر
                if (parsed.data && Array.isArray(parsed.data)) {
                    this.logs = parsed.data.slice(-this.maxLogs);
                    this.log('LOGS_RECOVERED_UNENCRYPTED', 'WARNING', {
                        count: this.logs.length,
                        error: decryptionError.message
                    });
                } else {
                    // بدء بسجل جديد
                    this.logs = [];
                    this.log('LOGS_LOAD_FAILED', 'ERROR', {
                        error: decryptionError.message,
                        sessionId: this.sessionId
                    });
                }
            }
            
        } catch (error) {
            console.warn('Failed to load saved logs, starting fresh:', error);
            this.logs = [];
            this.log('LOGS_LOAD_FAILED', 'ERROR', {
                error: error.message,
                sessionId: this.sessionId
            });
        }
    }
    
    async saveLogs() {
        try {
            if (this.logs.length === 0) return;
            
            const logsToSave = this.logs.slice(-this.maxLogs);
            const encrypted = await this.encryptLogs(logsToSave);
            
            if (encrypted) {
                localStorage.setItem('ciphervault_audit_logs', encrypted);
                
                this.log('LOGS_SAVED', 'DEBUG', {
                    count: logsToSave.length,
                    size: encrypted.length,
                    encrypted: !!this.encryptionKey,
                    sessionId: this.sessionId
                });
            }
        } catch (error) {
            console.error('Failed to save logs:', error);
            this.log('LOGS_SAVE_FAILED', 'ERROR', {
                error: error.message,
                timestamp: Date.now(),
                sessionId: this.sessionId
            });
        }
    }
    
    async encryptLogs(logs) {
        // إذا لم يكن هناك مفتاح تشفير، احفظ بدون تشفير
        if (!this.encryptionKey) {
            return JSON.stringify({
                unencrypted: true,
                data: logs,
                timestamp: Date.now(),
                sessionId: this.sessionId,
                version: '1.0'
            });
        }
        
        try {
            const data = JSON.stringify(logs);
            const encoder = new TextEncoder();
            const dataBuffer = encoder.encode(data);
            
            // ضغط البيانات إذا كان مفعلاً وكانت مكتبة pako متوفرة
            let dataToEncrypt = dataBuffer;
            let compressed = false;
            
            if (this.compressionEnabled && typeof pako !== 'undefined') {
                try {
                    const compressedData = pako.deflate(dataBuffer, { level: 6 });
                    dataToEncrypt = new Uint8Array(compressedData);
                    compressed = true;
                } catch (compressionError) {
                    console.warn('Log compression failed:', compressionError);
                    this.log('COMPRESSION_FAILED', 'WARNING', {
                        error: compressionError.message
                    });
                }
            }
            
            const iv = crypto.getRandomValues(new Uint8Array(12));
            const encrypted = await crypto.subtle.encrypt(
                {
                    name: 'AES-GCM',
                    iv: iv,
                    tagLength: 128
                },
                this.encryptionKey,
                dataToEncrypt
            );
            
            const result = {
                iv: Array.from(iv),
                data: Array.from(new Uint8Array(encrypted)),
                compressed: compressed,
                timestamp: Date.now(),
                version: '1.1',
                sessionId: this.sessionId,
                algorithm: 'AES-GCM-256'
            };
            
            return JSON.stringify(result);
        } catch (error) {
            console.error('Log encryption failed, saving unencrypted:', error);
            this.log('ENCRYPTION_FAILED', 'ERROR', {
                error: error.message,
                sessionId: this.sessionId
            });
            
            // Fallback: حفظ بدون تشفير
            return JSON.stringify({
                unencrypted: true,
                data: logs,
                timestamp: Date.now(),
                sessionId: this.sessionId,
                error: error.message,
                version: '1.0'
            });
        }
    }
    
    async decryptLogs(encryptedData) {
        try {
            const parsed = JSON.parse(encryptedData);
            
            // إذا كانت البيانات غير مشفرة، ارجعها مباشرة
            if (parsed.unencrypted) {
                return Array.isArray(parsed.data) ? parsed.data : [];
            }
            
            // إذا لم يكن هناك مفتاح تشفير، حاول استرداد البيانات بدون تشفير
            if (!this.encryptionKey) {
                console.warn('No encryption key available for decryption');
                
                // إذا كان هناك بيانات مباشرة في الهيكل (لسجلات قديمة)
                if (parsed.data && Array.isArray(parsed.data)) {
                    return parsed.data;
                }
                
                return [];
            }
            
            // التحقق من وجود جميع الحقول المطلوبة
            if (!parsed.iv || !parsed.data || !Array.isArray(parsed.iv) || !Array.isArray(parsed.data)) {
                throw new Error('Invalid encrypted data structure');
            }
            
            const iv = new Uint8Array(parsed.iv);
            const encrypted = new Uint8Array(parsed.data);
            
            // التحقق من صحة طول IV (12 بايت لـ AES-GCM)
            if (iv.length !== 12) {
                throw new Error(`Invalid IV length: ${iv.length}, expected 12`);
            }
            
            const decrypted = await crypto.subtle.decrypt(
                {
                    name: 'AES-GCM',
                    iv: iv,
                    tagLength: 128
                },
                this.encryptionKey,
                encrypted
            );
            
            let decryptedData = new Uint8Array(decrypted);
            
            // فك الضغط إذا كان مضغوطًا
            if (parsed.compressed && typeof pako !== 'undefined') {
                try {
                    const decompressed = pako.inflate(decryptedData);
                    decryptedData = new Uint8Array(decompressed);
                } catch (decompressionError) {
                    console.warn('Log decompression failed:', decompressionError);
                    this.log('DECOMPRESSION_FAILED', 'WARNING', {
                        error: decompressionError.message
                    });
                }
            }
            
            const decoder = new TextDecoder();
            const decoded = decoder.decode(decryptedData);
            
            const result = JSON.parse(decoded);
            
            // التحقق من أن النتيجة هي مصفوفة
            if (!Array.isArray(result)) {
                throw new Error('Decrypted data is not an array');
            }
            
            return result;
            
        } catch (error) {
            console.error('Log decryption failed:', error);
            this.log('DECRYPTION_FAILED', 'ERROR', {
                error: error.message,
                errorType: error.constructor.name,
                timestamp: Date.now(),
                sessionId: this.sessionId,
                encryptedDataLength: encryptedData ? encryptedData.length : 0
            });
            
            // محاولة استرداد البيانات بدون تشفير إذا أمكن
            try {
                const parsed = JSON.parse(encryptedData);
                
                // إذا كان هناك بيانات مباشرة في الهيكل
                if (parsed.data && Array.isArray(parsed.data)) {
                    console.warn('Recovered unencrypted data from structure');
                    return parsed.data;
                }
                
                // إذا كان هناك سجلات مباشرة في الجذر
                if (Array.isArray(parsed)) {
                    console.warn('Recovered array data directly');
                    return parsed;
                }
                
            } catch (recoveryError) {
                console.error('Recovery also failed:', recoveryError);
            }
            
            return [];
        }
    }
    
    log(type, severity, data, userId = 'system') {
        const logEntry = {
            id: this.generateLogId(),
            type,
            severity: severity.toUpperCase(),
            timestamp: Date.now(),
            timestampISO: new Date().toISOString(),
            userId,
            sessionId: this.sessionId,
            userAgent: navigator.userAgent.substring(0, 200),
            ip: this.getClientIP(),
            data: this.sanitizeData(data)
        };
        
        this.logs.push(logEntry);
        
        // الحفاظ على الحد الأقصى للسجلات
        if (this.logs.length > this.maxLogs) {
            const removed = this.logs.shift();
            this.log('LOG_TRUNCATED', 'DEBUG', {
                removedId: removed.id,
                remainingCount: this.logs.length
            });
        }
        
        // حفظ السجلات بشكل غير متزامن
        setTimeout(() => {
            this.saveLogs().catch(err => {
                console.warn('Auto-save failed:', err);
            });
        }, 100);
        
        // تسجيل في وحدة التحكم للتطوير
        const isDevelopment = window.location.hostname === 'localhost' || 
                             window.location.hostname === '127.0.0.1' || 
                             window.location.port === '3000' ||
                             (window._ENV && window._ENV.NODE_ENV === 'development');
        
        if (isDevelopment) {
            const consoleMethod = severity.toUpperCase() === 'ERROR' ? console.error :
                                 severity.toUpperCase() === 'WARNING' ? console.warn :
                                 console.log;
            consoleMethod(`[Audit] ${severity}: ${type}`, data);
        }
        
        return logEntry;
    }
    
    generateLogId() {
        return `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    getClientIP() {
        // في بيئة المتصفح، لا يمكننا الحصول على IP الحقيقي بدون خادم
        // نرجع قيمة افتراضية للاستخدام المحلي
        try {
            return 'client-' + navigator.userAgent.substring(0, 20).replace(/[^a-z0-9]/gi, '-');
        } catch (e) {
            return 'unknown-ip';
        }
    }
    
    sanitizeData(data) {
        if (typeof data !== 'object' || data === null) {
            return data;
        }
        
        // إذا كانت البيانات مصفوفة، تعقيم كل عنصر
        if (Array.isArray(data)) {
            return data.map(item => this.sanitizeData(item));
        }
        
        const sanitized = { ...data };
        
        // إزالة البيانات الحساسة
        const sensitiveFields = ['password', 'key', 'secret', 'token', 'credit', 'ssn', 'cvv', 'pin', 'private'];
        
        Object.keys(sanitized).forEach(key => {
            const lowerKey = key.toLowerCase();
            
            // إذا كان الحقل حساسًا، استبدله بقناع
            if (sensitiveFields.some(field => lowerKey.includes(field))) {
                if (typeof sanitized[key] === 'string' && sanitized[key].length > 0) {
                    sanitized[key] = '***REDACTED***';
                } else if (typeof sanitized[key] === 'object') {
                    sanitized[key] = '[REDACTED OBJECT]';
                }
            }
            
            // إذا كانت القيمة كائن، تعقيمها بشكل متكرر
            if (typeof sanitized[key] === 'object' && sanitized[key] !== null && !Array.isArray(sanitized[key])) {
                sanitized[key] = this.sanitizeData(sanitized[key]);
            }
        });
        
        return sanitized;
    }
    
    startAutoExport() {
        // بدء التصدير التلقائي بعد التأكد من التهيئة
        this.initPromise.then(() => {
            this.exportInterval = setInterval(async () => {
                try {
                    await this.exportLogs('auto-backup');
                } catch (error) {
                    console.warn('Auto-export failed:', error);
                }
            }, this.autoExportInterval);
        }).catch(() => {
            console.warn('Auto-export delayed due to initialization failure');
        });
    }
    
    startAutoCleanup() {
        // بدء التنظيف التلقائي بعد التأكد من التهيئة
        this.initPromise.then(() => {
            this.cleanupInterval = setInterval(() => {
                this.cleanupOldLogs();
            }, 60 * 60 * 1000); // كل ساعة
            
            // تنظيف أولي
            setTimeout(() => this.cleanupOldLogs(), 5000);
        }).catch(() => {
            console.warn('Auto-cleanup delayed due to initialization failure');
        });
    }
    
    cleanupOldLogs() {
        try {
            const cutoffDate = Date.now() - (this.retentionDays * 24 * 60 * 60 * 1000);
            const initialCount = this.logs.length;
            
            const newLogs = [];
            const removedLogs = [];
            
            this.logs.forEach(log => {
                if (log.timestamp > cutoffDate) {
                    newLogs.push(log);
                } else {
                    removedLogs.push(log.id);
                }
            });
            
            if (removedLogs.length > 0) {
                this.logs = newLogs;
                
                this.log('LOGS_CLEANUP', 'INFO', {
                    removedCount: removedLogs.length,
                    retentionDays: this.retentionDays,
                    remainingCount: this.logs.length,
                    sessionId: this.sessionId
                });
                
                this.saveLogs();
            }
        } catch (error) {
            console.error('Log cleanup failed:', error);
        }
    }
    
    async exportLogs(reason = 'manual') {
        try {
            // انتظار تهيئة النظام إذا لزم
            await this.initPromise;
            
            const exportData = {
                metadata: {
                    exportDate: new Date().toISOString(),
                    reason,
                    version: '4.2.1',
                    totalLogs: this.logs.length,
                    sessionId: this.sessionId,
                    retentionDays: this.retentionDays,
                    system: {
                        userAgent: navigator.userAgent,
                        timestamp: Date.now()
                    }
                },
                logs: this.logs
            };
            
            const filename = `ciphervault_audit_logs_${Date.now()}_${reason.replace(/[^a-z0-9]/gi, '_')}.json`;
            const dataStr = JSON.stringify(exportData, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            
            // إنشاء رابط تنزيل
            const url = URL.createObjectURL(dataBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.style.display = 'none';
            document.body.appendChild(a);
            a.click();
            
            // تنظيف بعد التنزيل
            setTimeout(() => {
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }, 100);
            
            this.log('LOGS_EXPORTED', 'INFO', {
                filename,
                logCount: this.logs.length,
                reason,
                sessionId: this.sessionId
            });
            
            return {
                success: true,
                filename,
                count: this.logs.length
            };
            
        } catch (error) {
            console.error('Failed to export logs:', error);
            this.log('LOG_EXPORT_FAILED', 'ERROR', {
                error: error.message,
                reason,
                sessionId: this.sessionId
            });
            
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    searchLogs(query, filters = {}) {
        // انتظار تهيئة النظام إذا لزم
        if (!this.logs || this.logs.length === 0) {
            return {
                query,
                filters,
                totalResults: 0,
                results: [],
                page: 1,
                totalPages: 0
            };
        }
        
        let results = [...this.logs];
        
        // تطبيق الفلاتر
        if (filters.severity && filters.severity.length > 0) {
            results = results.filter(log => 
                filters.severity.map(s => s.toUpperCase()).includes(log.severity.toUpperCase())
            );
        }
        
        if (filters.type && filters.type.length > 0) {
            results = results.filter(log => 
                filters.type.includes(log.type)
            );
        }
        
        if (filters.startDate) {
            const startTimestamp = new Date(filters.startDate).getTime();
            if (!isNaN(startTimestamp)) {
                results = results.filter(log => log.timestamp >= startTimestamp);
            }
        }
        
        if (filters.endDate) {
            const endTimestamp = new Date(filters.endDate).getTime();
            if (!isNaN(endTimestamp)) {
                results = results.filter(log => log.timestamp <= endTimestamp);
            }
        }
        
        if (filters.userId) {
            results = results.filter(log => 
                log.userId.toLowerCase().includes(filters.userId.toLowerCase())
            );
        }
        
        if (filters.sessionId) {
            results = results.filter(log => 
                log.sessionId === filters.sessionId
            );
        }
        
        // البحث النصي
        if (query && query.trim() !== '') {
            const searchTerm = query.toLowerCase();
            results = results.filter(log => {
                return (
                    (log.type && log.type.toLowerCase().includes(searchTerm)) ||
                    (log.severity && log.severity.toLowerCase().includes(searchTerm)) ||
                    (log.userId && log.userId.toLowerCase().includes(searchTerm)) ||
                    (log.data && JSON.stringify(log.data).toLowerCase().includes(searchTerm))
                );
            });
        }
        
        // الفرز حسب التاريخ (الأحدث أولاً)
        results.sort((a, b) => b.timestamp - a.timestamp);
        
        // تطبيق التجزئة
        const limit = filters.limit && filters.limit > 0 ? filters.limit : 100;
        const page = filters.page && filters.page > 0 ? filters.page : 1;
        const offset = (page - 1) * limit;
        const paginatedResults = results.slice(offset, offset + limit);
        
        return {
            query,
            filters,
            totalResults: results.length,
            results: paginatedResults,
            page,
            limit,
            totalPages: Math.ceil(results.length / limit)
        };
    }
    
    getStatistics(timeRange = 'all') {
        // انتظار تهيئة النظام إذا لزم
        if (!this.logs || this.logs.length === 0) {
            return {
                timeRange,
                totalLogs: 0,
                bySeverity: {},
                byType: {},
                byHour: Array.from({ length: 24 }, (_, i) => ({ hour: i, count: 0 })),
                byDay: {},
                trends: []
            };
        }
        
        const now = Date.now();
        let timeFilteredLogs = this.logs;
        
        // تطبيق نطاق الوقت
        switch (timeRange) {
            case 'day':
                timeFilteredLogs = this.logs.filter(log => 
                    log.timestamp > now - (24 * 60 * 60 * 1000)
                );
                break;
            case 'week':
                timeFilteredLogs = this.logs.filter(log => 
                    log.timestamp > now - (7 * 24 * 60 * 60 * 1000)
                );
                break;
            case 'month':
                timeFilteredLogs = this.logs.filter(log => 
                    log.timestamp > now - (30 * 24 * 60 * 60 * 1000)
                );
                break;
            case 'year':
                timeFilteredLogs = this.logs.filter(log => 
                    log.timestamp > now - (365 * 24 * 60 * 60 * 1000)
                );
                break;
        }
        
        const stats = {
            timeRange,
            totalLogs: timeFilteredLogs.length,
            bySeverity: {},
            byType: {},
            byHour: Array.from({ length: 24 }, (_, i) => ({ hour: i, count: 0 })),
            byDay: {},
            trends: []
        };
        
        // إحصائيات حسب الشدة
        timeFilteredLogs.forEach(log => {
            const severity = log.severity ? log.severity.toUpperCase() : 'UNKNOWN';
            stats.bySeverity[severity] = (stats.bySeverity[severity] || 0) + 1;
        });
        
        // إحصائيات حسب النوع (أعلى 20 نوعًا)
        timeFilteredLogs.forEach(log => {
            stats.byType[log.type] = (stats.byType[log.type] || 0) + 1;
        });
        
        // إحصائيات حسب الساعة
        timeFilteredLogs.forEach(log => {
            const hour = new Date(log.timestamp).getHours();
            stats.byHour[hour].count++;
        });
        
        // إحصائيات حسب اليوم
        timeFilteredLogs.forEach(log => {
            const day = new Date(log.timestamp).toLocaleDateString('en-US', { weekday: 'short' });
            stats.byDay[day] = (stats.byDay[day] || 0) + 1;
        });
        
        // حساب الاتجاهات (آخر 7 أيام)
        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const date = new Date(now - (i * 24 * 60 * 60 * 1000));
            return date.toISOString().split('T')[0];
        }).reverse();
        
        last7Days.forEach(date => {
            const dateLogs = timeFilteredLogs.filter(log => 
                new Date(log.timestamp).toISOString().split('T')[0] === date
            );
            
            stats.trends.push({
                date,
                count: dateLogs.length,
                critical: dateLogs.filter(log => log.severity === 'CRITICAL').length,
                errors: dateLogs.filter(log => log.severity === 'ERROR').length,
                warnings: dateLogs.filter(log => log.severity === 'WARNING').length
            });
        });
        
        return stats;
    }
    
    clearLogs(confirm = true) {
        if (confirm && !window.confirm('هل أنت متأكد أنك تريد مسح جميع سجلات التدقيق؟ هذا الإجراء لا يمكن التراجع عنه.')) {
            return {
                success: false,
                message: 'Cancelled by user'
            };
        }
        
        const count = this.logs.length;
        this.logs = [];
        
        try {
            localStorage.removeItem('ciphervault_audit_logs');
        } catch (e) {
            console.warn('Failed to clear localStorage:', e);
        }
        
        this.log('LOGS_CLEARED', 'WARNING', {
            clearedCount: count,
            clearedBy: 'user',
            timestamp: Date.now(),
            sessionId: this.sessionId
        });
        
        return {
            success: true,
            clearedCount: count
        };
    }
    
    destroy() {
        // تنظيف الفواصل الزمنية
        if (this.exportInterval) {
            clearInterval(this.exportInterval);
            this.exportInterval = null;
        }
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
            this.cleanupInterval = null;
        }
        
        // حفظ السجلات النهائي
        this.saveLogs().catch(() => {});
        
        this.log('SYSTEM_SHUTDOWN', 'INFO', {
            sessionId: this.sessionId,
            timestamp: Date.now()
        });
    }
}

// إنشاء نسخة عامة مع معالجة الأخطاء
let AuditLogger;
try {
    AuditLogger = new EnhancedAuditLogger();
    
    // تأخير تسجيل بدء التشغيل للتأكد من التهيئة
    setTimeout(() => {
        if (AuditLogger.logs.length === 0) {
            AuditLogger.log('SYSTEM_STARTED', 'INFO', {
                version: '4.2.1',
                timestamp: Date.now()
            });
        }
    }, 1000);
    
} catch (error) {
    console.error('Failed to create Audit Logger:', error);
    
    // إنشاء نسخة بديلة بدون تشفير
    AuditLogger = {
        logs: [],
        sessionId: 'fallback-' + Date.now(),
        log: function(type, severity, data, userId = 'system') {
            const entry = { 
                id: Date.now().toString(), 
                type, 
                severity, 
                timestamp: Date.now(),
                userId,
                data 
            };
            this.logs.push(entry);
            console.log(`[Audit Fallback] ${severity}: ${type}`, data);
            return entry;
        },
        exportLogs: async function() { 
            return { success: false, error: 'Fallback mode' }; 
        },
        searchLogs: function() { 
            return { totalResults: 0, results: [] }; 
        },
        getStatistics: function() { 
            return { totalLogs: 0 }; 
        },
        clearLogs: function() { 
            return { success: false, clearedCount: 0 }; 
        },
        destroy: function() {}
    };
}

// التصدير للاستخدام العام
if (typeof window !== 'undefined') {
    window.AuditLogger = AuditLogger;
    window.EnhancedAuditLogger = EnhancedAuditLogger;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        EnhancedAuditLogger,
        AuditLogger
    };
}

// تهيئة عند تحميل الصفحة
if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', () => {
        if (AuditLogger && typeof AuditLogger.destroy === 'function') {
            try {
                AuditLogger.destroy();
            } catch (e) {
                console.error('Error during cleanup:', e);
            }
        }
    });
    
    // تسجيل حدث تحميل الصفحة
    window.addEventListener('load', () => {
        setTimeout(() => {
            if (AuditLogger && typeof AuditLogger.log === 'function') {
                AuditLogger.log('PAGE_LOADED', 'INFO', {
                    url: window.location.href,
                    loadTime: Date.now() - window.performance.timing.navigationStart
                });
            }
        }, 100);
    });
}

console.log('Enhanced Audit Logger loaded (Version 4.2.1 - Fixed)');
