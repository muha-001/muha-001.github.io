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
        
        // إضافة معرف جلسة فريد
        this.sessionId = this.generateSessionId();
        
        // تهيئة غير متزامنة
        this.initPromise = this.init();
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
            // الاستمرار بدون تشفير
            this.encryptionKey = null;
        }
    }
    
    generateSessionId() {
        return `sess_${Date.now()}_${crypto.getRandomValues(new Uint8Array(4))
            .reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '')}`;
    }
    
    async generateEncryptionKey() {
        try {
            // استخدام مفتاح مشتق من معرف الجلسة للاستمرارية
            const keyMaterial = await crypto.subtle.importKey(
                'raw',
                new TextEncoder().encode(this.sessionId + '_audit_log_key_2024'),
                'PBKDF2',
                false,
                ['deriveKey']
            );
            
            // استخدام salt ثابت (يمكن تخزينه في localStorage للاستمرارية)
            let salt = localStorage.getItem('ciphervault_audit_salt');
            if (!salt) {
                salt = crypto.getRandomValues(new Uint8Array(16));
                localStorage.setItem('ciphervault_audit_salt', 
                    btoa(String.fromCharCode.apply(null, salt)));
            } else {
                salt = Uint8Array.from(atob(salt), c => c.charCodeAt(0));
            }
            
            this.encryptionKey = await crypto.subtle.deriveKey(
                {
                    name: 'PBKDF2',
                    salt,
                    iterations: 100000,
                    hash: 'SHA-256'
                },
                keyMaterial,
                { name: 'AES-GCM', length: 256 },
                true,
                ['encrypt', 'decrypt']
            );
            
            this.log('ENCRYPTION_KEY_GENERATED', 'INFO', {
                algorithm: 'AES-GCM-256',
                timestamp: Date.now(),
                sessionId: this.sessionId
            });
        } catch (error) {
            console.warn('Failed to generate encryption key, using unencrypted logs:', error);
            this.encryptionKey = null;
        }
    }
    
    async loadSavedLogs() {
        try {
            const saved = localStorage.getItem('ciphervault_audit_logs');
            if (saved) {
                const decrypted = await this.decryptLogs(saved);
                this.logs = decrypted.slice(-this.maxLogs);
                
                this.log('LOGS_LOADED', 'INFO', {
                    count: this.logs.length,
                    source: 'localStorage',
                    sessionId: this.sessionId
                });
            } else {
                this.log('NO_SAVED_LOGS', 'INFO', {
                    message: 'No previous logs found'
                });
            }
        } catch (error) {
            console.warn('Failed to load saved logs, starting fresh:', error);
            this.logs = [];
            this.log('LOGS_LOAD_FAILED', 'WARNING', {
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
                timestamp: Date.now()
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
                    iv: iv
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
                sessionId: this.sessionId
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
                error: error.message
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
            
            // إذا لم يكن هناك مفتاح تشفير، ارجع مصفوفة فارغة
            if (!this.encryptionKey) {
                console.warn('No encryption key available for decryption');
                this.log('NO_ENCRYPTION_KEY', 'WARNING', {
                    message: 'Cannot decrypt logs without encryption key'
                });
                return [];
            }
            
            // التحقق من بنية البيانات المشفرة
            if (!parsed.iv || !parsed.data) {
                console.warn('Invalid encrypted data structure');
                return [];
            }
            
            const iv = new Uint8Array(parsed.iv);
            const encrypted = new Uint8Array(parsed.data);
            
            const decrypted = await crypto.subtle.decrypt(
                {
                    name: 'AES-GCM',
                    iv: iv
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
                console.warn('Decrypted data is not an array');
                return [];
            }
            
            return result;
        } catch (error) {
            console.error('Log decryption failed:', error);
            this.log('DECRYPTION_FAILED', 'ERROR', {
                error: error.message,
                timestamp: Date.now(),
                sessionId: this.sessionId
            });
            
            // محاولة استرجاع البيانات بدون تشفير إذا أمكن
            try {
                const parsed = JSON.parse(encryptedData);
                if (parsed.unencrypted && Array.isArray(parsed.data)) {
                    return parsed.data;
                }
            } catch (e) {
                // لا يمكن استرجاع أي شيء
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
            this.logs.shift();
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
        
        if (isDevelopment && severity.toUpperCase() === 'ERROR') {
            console.error(`[Audit] ${type}:`, data);
        } else if (isDevelopment && severity.toUpperCase() === 'WARNING') {
            console.warn(`[Audit] ${type}:`, data);
        } else if (isDevelopment) {
            console.log(`[Audit] ${severity}: ${type}`, data);
        }
        
        return logEntry;
    }
    
    generateLogId() {
        return `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}_${crypto.getRandomValues(new Uint8Array(2))
            .reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '')}`;
    }
    
    getClientIP() {
        // في بيئة المتصفح، لا يمكننا الحصول على IP الحقيقي بدون خادم
        // نستخدم WebRTC كحل بدائي (للاستخدام المحلي فقط)
        try {
            if (typeof RTCPeerConnection !== 'undefined') {
                const pc = new RTCPeerConnection({ iceServers: [] });
                pc.createDataChannel('');
                pc.createOffer().then(offer => pc.setLocalDescription(offer));
                
                return 'client-side-detected';
            }
        } catch (e) {
            // تجاهل الأخطاء
        }
        
        return 'unknown-ip';
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
        setTimeout(() => {
            this.exportInterval = setInterval(async () => {
                try {
                    await this.exportLogs('auto-backup');
                } catch (error) {
                    console.warn('Auto-export failed:', error);
                }
            }, this.autoExportInterval);
        }, 60000); // انتظر دقيقة قبل البدء
    }
    
    startAutoCleanup() {
        // بدء التنظيف التلقائي بعد التأكد من التهيئة
        setTimeout(() => {
            this.cleanupInterval = setInterval(() => {
                this.cleanupOldLogs();
            }, 60 * 60 * 1000); // كل ساعة
        }, 30000); // انتظر 30 ثانية قبل البدء
    }
    
    cleanupOldLogs() {
        try {
            const cutoffDate = Date.now() - (this.retentionDays * 24 * 60 * 60 * 1000);
            const initialCount = this.logs.length;
            
            this.logs = this.logs.filter(log => log.timestamp > cutoffDate);
            
            const removedCount = initialCount - this.logs.length;
            if (removedCount > 0) {
                this.log('LOGS_CLEANUP', 'INFO', {
                    removedCount,
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
            if (this.initPromise) {
                await this.initPromise;
            }
            
            const exportData = {
                metadata: {
                    exportDate: new Date().toISOString(),
                    reason,
                    version: '4.2.1',
                    totalLogs: this.logs.length,
                    sessionId: this.sessionId,
                    retentionDays: this.retentionDays
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
            
            return true;
        } catch (error) {
            console.error('Failed to export logs:', error);
            this.log('LOG_EXPORT_FAILED', 'ERROR', {
                error: error.message,
                reason,
                sessionId: this.sessionId
            });
            
            return false;
        }
    }
    
    searchLogs(query, filters = {}) {
        // انتظار تهيئة النظام إذا لزم
        if (!this.logs) {
            return {
                query,
                filters,
                totalResults: 0,
                results: []
            };
        }
        
        let results = [...this.logs];
        
        // تطبيق الفلاتر
        if (filters.severity && filters.severity.length > 0) {
            results = results.filter(log => 
                filters.severity.includes(log.severity.toUpperCase())
            );
        }
        
        if (filters.type && filters.type.length > 0) {
            results = results.filter(log => 
                filters.type.includes(log.type)
            );
        }
        
        if (filters.startDate) {
            const startTimestamp = new Date(filters.startDate).getTime();
            results = results.filter(log => log.timestamp >= startTimestamp);
        }
        
        if (filters.endDate) {
            const endTimestamp = new Date(filters.endDate).getTime();
            results = results.filter(log => log.timestamp <= endTimestamp);
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
                    log.type.toLowerCase().includes(searchTerm) ||
                    log.severity.toLowerCase().includes(searchTerm) ||
                    log.userId.toLowerCase().includes(searchTerm) ||
                    (log.data && JSON.stringify(log.data).toLowerCase().includes(searchTerm))
                );
            });
        }
        
        // الفرز حسب التاريخ (الأحدث أولاً)
        results.sort((a, b) => b.timestamp - a.timestamp);
        
        // تطبيق الحد
        const limit = filters.limit || 100;
        const paginatedResults = results.slice(0, limit);
        
        return {
            query,
            filters,
            totalResults: results.length,
            results: paginatedResults,
            page: filters.page || 1,
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
                byHour: {},
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
            const severity = log.severity.toUpperCase();
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
                errors: dateLogs.filter(log => log.severity === 'ERROR').length
            });
        });
        
        return stats;
    }
    
    // باقي الدوال تبقى كما هي مع تعديلات طفيفة للتعامل مع الأخطاء
    
    clearLogs(confirm = true) {
        if (confirm && !window.confirm('Are you sure you want to clear all audit logs? This action cannot be undone.')) {
            return false;
        }
        
        const count = this.logs.length;
        this.logs = [];
        
        try {
            localStorage.removeItem('ciphervault_audit_logs');
            localStorage.removeItem('ciphervault_audit_salt');
        } catch (e) {
            console.warn('Failed to clear localStorage:', e);
        }
        
        this.log('LOGS_CLEARED', 'WARNING', {
            clearedCount: count,
            clearedBy: 'user',
            timestamp: Date.now(),
            sessionId: this.sessionId
        });
        
        return count;
    }
    
    destroy() {
        // تنظيف الفواصل الزمنية
        if (this.exportInterval) {
            clearInterval(this.exportInterval);
        }
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
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
} catch (error) {
    console.error('Failed to create Audit Logger:', error);
    // إنشاء نسخة بديلة بدون تشفير
    AuditLogger = {
        logs: [],
        log: function(type, severity, data, userId = 'system') {
            console.log(`[Audit Fallback] ${severity}: ${type}`, data);
            return { id: Date.now().toString(), type, severity, timestamp: Date.now() };
        },
        exportLogs: async function() { return false; },
        searchLogs: function() { return { totalResults: 0, results: [] }; },
        getStatistics: function() { return { totalLogs: 0 }; },
        clearLogs: function() { return 0; },
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
            AuditLogger.destroy();
        }
    });
}
