/**
 * CipherVault 3D Pro - نظام التدقيق الأمني المحسن
 * الإصدار: 4.2.0
 */

class EnhancedSecurityAudit {
    constructor() {
        this.logs = [];
        this.maxLogs = 5000;
        this.threatLevel = 'LOW';
        this.auditConfig = {
            ENABLE_REAL_TIME_MONITORING: true,
            DETECT_MEMORY_LEAKS: true,
            DETECT_TIMING_ATTACKS: true,
            DETECT_CRYPTO_ANOMALIES: true,
            BLOCK_SUSPICIOUS_ACTIVITY: true,
            ALERT_THRESHOLD: 3
        };
        
        this.attackPatterns = this.initializeAttackPatterns();
        this.behaviorBaseline = null;
        this.init();
    }
    
    initializeAttackPatterns() {
        return {
            // هجمات التوقيت
            TIMING_ATTACKS: [
                'password_compare_timing',
                'key_derivation_timing',
                'encryption_timing'
            ],
            
            // هجمات الذاكرة
            MEMORY_ATTACKS: [
                'memory_dump',
                'buffer_overflow',
                'heap_inspection'
            ],
            
            // هجمات التشفير
            CRYPTO_ATTACKS: [
                'weak_key_detected',
                'iv_reuse',
                'padding_oracle',
                'side_channel'
            ],
            
            // هجمات على المتصفح
            BROWSER_ATTACKS: [
                'csp_violation',
                'xss_attempt',
                'csrf_attempt',
                'clickjacking'
            ]
        };
    }
    
    async init() {
        // إنشاء خط أساسي للسلوك
        this.behaviorBaseline = await this.createBehaviorBaseline();
        
        // بدء المراقبة في الوقت الحقيقي
        if (this.auditConfig.ENABLE_REAL_TIME_MONITORING) {
            this.startRealTimeMonitoring();
        }
        
        // فحص بيئة التشغيل
        await this.auditRuntimeEnvironment();
        
        this.logEvent('SYSTEM_INITIALIZED', 'INFO', {
            version: '4.2.0',
            timestamp: Date.now(),
            environment: this.getEnvironmentInfo()
        });
    }
    
    async createBehaviorBaseline() {
        const baseline = {
            performance: {},
            memory: {},
            network: {},
            crypto: {},
            userBehavior: {}
        };
        
        // قياس أداء التشفير الأساسي
        baseline.crypto = await this.measureCryptoPerformance();
        
        // قياس استخدام الذاكرة
        baseline.memory = this.measureMemoryUsage();
        
        // قياس أداء الشبكة
        baseline.network = await this.measureNetworkPerformance();
        
        // تسجيل السلوك الطبيعي للمستخدم
        baseline.userBehavior = {
            typicalFileSizes: [1024, 1048576, 5242880], // 1KB, 1MB, 5MB
            typicalOperationTimes: {},
            commonPatterns: []
        };
        
        return baseline;
    }
    
    async measureCryptoPerformance() {
        const measurements = {
            keyDerivation: [],
            encryption: [],
            decryption: [],
            hmac: []
        };
        
        // قياس أداء PBKDF2
        for (let i = 0; i < 5; i++) {
            const start = performance.now();
            const salt = crypto.getRandomValues(new Uint8Array(16));
            const keyMaterial = await crypto.subtle.importKey(
                'raw',
                new TextEncoder().encode('test_password'),
                'PBKDF2',
                false,
                ['deriveKey']
            );
            await crypto.subtle.deriveKey(
                {
                    name: 'PBKDF2',
                    salt,
                    iterations: 100000,
                    hash: 'SHA-256'
                },
                keyMaterial,
                { name: 'AES-GCM', length: 256 },
                false,
                ['encrypt', 'decrypt']
            );
            measurements.keyDerivation.push(performance.now() - start);
        }
        
        // قياس أداء AES-GCM
        const key = await crypto.subtle.generateKey(
            { name: 'AES-GCM', length: 256 },
            true,
            ['encrypt', 'decrypt']
        );
        const data = crypto.getRandomValues(new Uint8Array(1024));
        
        for (let i = 0; i < 10; i++) {
            const iv = crypto.getRandomValues(new Uint8Array(12));
            const start = performance.now();
            await crypto.subtle.encrypt(
                { name: 'AES-GCM', iv },
                key,
                data
            );
            measurements.encryption.push(performance.now() - start);
        }
        
        return {
            keyDerivation: this.calculateStats(measurements.keyDerivation),
            encryption: this.calculateStats(measurements.encryption),
            thresholds: {
                keyDerivationMax: 1000, // ms
                encryptionMax: 50, // ms
                decryptionMax: 50 // ms
            }
        };
    }
    
    measureMemoryUsage() {
        if (window.performance && window.performance.memory) {
            return {
                usedJSHeapSize: window.performance.memory.usedJSHeapSize,
                totalJSHeapSize: window.performance.memory.totalJSHeapSize,
                jsHeapSizeLimit: window.performance.memory.jsHeapSizeLimit
            };
        }
        
        return {
            estimatedHeap: (navigator.deviceMemory || 4) * 1024 * 1024 * 1024
        };
    }
    
    async measureNetworkPerformance() {
        const measurements = [];
        
        for (let i = 0; i < 3; i++) {
            const start = performance.now();
            try {
                await fetch('/', { method: 'HEAD', cache: 'no-store' });
                measurements.push(performance.now() - start);
            } catch (error) {
                measurements.push(1000); // افتراضي إذا فشل
            }
        }
        
        return {
            latency: this.calculateStats(measurements),
            online: navigator.onLine,
            connectionType: navigator.connection ? navigator.connection.effectiveType : 'unknown'
        };
    }
    
    calculateStats(array) {
        if (array.length === 0) return { avg: 0, min: 0, max: 0, std: 0 };
        
        const sum = array.reduce((a, b) => a + b, 0);
        const avg = sum / array.length;
        const min = Math.min(...array);
        const max = Math.max(...array);
        
        const squareDiffs = array.map(value => {
            const diff = value - avg;
            return diff * diff;
        });
        
        const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / array.length;
        const std = Math.sqrt(avgSquareDiff);
        
        return { avg, min, max, std };
    }
    
    startRealTimeMonitoring() {
        // مراقبة استخدام الذاكرة
        setInterval(() => this.monitorMemory(), 30000);
        
        // مراقبة أداء التشفير
        this.monitorCryptoPerformance();
        
        // مراقبة أحداث DOM المشبوهة
        this.monitorDOMEvents();
        
        // مراقبة طلبات الشبكة
        this.monitorNetworkRequests();
    }
    
    monitorMemory() {
        if (!window.performance || !window.performance.memory) return;
        
        const memory = window.performance.memory;
        const usagePercentage = (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100;
        
        if (usagePercentage > 90) {
            this.logEvent('HIGH_MEMORY_USAGE', 'WARNING', {
                usagePercentage,
                usedJSHeapSize: memory.usedJSHeapSize,
                totalJSHeapSize: memory.totalJSHeapSize
            });
            
            if (this.auditConfig.DETECT_MEMORY_LEAKS) {
                this.detectMemoryLeaks();
            }
        }
    }
    
    async monitorCryptoPerformance() {
        // قياس أداء التشفير أثناء التشغيل
        const originalEncrypt = CryptoEngine.encryptData;
        const originalDecrypt = CryptoEngine.decryptData;
        
        CryptoEngine.encryptData = async function(...args) {
            const start = performance.now();
            const result = await originalEncrypt.apply(this, args);
            const duration = performance.now() - start;
            
            // اكتشاف هجمات التوقيت
            if (duration > this.auditConfig.CRYPTO_TIMING_THRESHOLD) {
                this.logEvent('SUSPICIOUS_CRYPTO_TIMING', 'WARNING', {
                    operation: 'encrypt',
                    duration,
                    threshold: this.auditConfig.CRYPTO_TIMING_THRESHOLD
                });
            }
            
            return result;
        }.bind(this);
        
        CryptoEngine.decryptData = async function(...args) {
            const start = performance.now();
            const result = await originalDecrypt.apply(this, args);
            const duration = performance.now() - start;
            
            if (duration > this.auditConfig.CRYPTO_TIMING_THRESHOLD) {
                this.logEvent('SUSPICIOUS_CRYPTO_TIMING', 'WARNING', {
                    operation: 'decrypt',
                    duration,
                    threshold: this.auditConfig.CRYPTO_TIMING_THRESHOLD
                });
            }
            
            return result;
        }.bind(this);
    }
    
    monitorDOMEvents() {
        // اكتشاف محاولات XSS
        const suspiciousPatterns = [
            /<script.*?>.*?<\/script>/gi,
            /javascript:/gi,
            /on\w+\s*=/gi,
            /eval\s*\(/gi,
            /document\.cookie/gi
        ];
        
        // مراقبة إدخال المستخدم
        const inputs = document.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.addEventListener('input', (e) => {
                const value = e.target.value;
                suspiciousPatterns.forEach(pattern => {
                    if (pattern.test(value)) {
                        this.logEvent('XSS_ATTEMPT_DETECTED', 'CRITICAL', {
                            pattern: pattern.toString(),
                            inputId: e.target.id,
                            value: value.substring(0, 100) // تسجيل جزء فقط
                        });
                        
                        if (this.auditConfig.BLOCK_SUSPICIOUS_ACTIVITY) {
                            e.target.value = e.target.value.replace(pattern, '');
                            this.showSecurityAlert('تم اكتشاف محاولة هجوم XSS');
                        }
                    }
                });
            });
        });
    }
    
    monitorNetworkRequests() {
        const originalFetch = window.fetch;
        
        window.fetch = async function(...args) {
            const [resource, config] = args;
            
            // تسجيل طلبات الشبكة
            this.logEvent('NETWORK_REQUEST', 'DEBUG', {
                url: typeof resource === 'string' ? resource : resource.url,
                method: config?.method || 'GET',
                timestamp: Date.now()
            });
            
            // منع طلبات إلى نطاقات غير مصرح بها
            const url = new URL(resource, window.location.origin);
            if (!this.isAllowedOrigin(url.origin)) {
                this.logEvent('UNAUTHORIZED_NETWORK_REQUEST', 'CRITICAL', {
                    origin: url.origin,
                    requestedUrl: url.href
                });
                
                throw new Error('طلب شبكة غير مصرح به');
            }
            
            return originalFetch.apply(window, args);
        }.bind(this);
    }
    
    isAllowedOrigin(origin) {
        const allowedOrigins = [
            window.location.origin,
            'https://cdnjs.cloudflare.com',
            'https://fonts.googleapis.com',
            'https://fonts.gstatic.com'
        ];
        
        return allowedOrigins.includes(origin);
    }
    
    async auditRuntimeEnvironment() {
        const checks = [
            this.checkSecureContext(),
            this.checkCryptoAPI(),
            this.checkWebWorkers(),
            this.checkStorageAPIs(),
            this.checkBrowserExtensions(),
            this.checkDebuggingTools(),
            this.checkNetworkSecurity()
        ];
        
        const results = await Promise.allSettled(checks);
        const auditReport = {
            timestamp: Date.now(),
            passed: [],
            failed: [],
            warnings: []
        };
        
        results.forEach((result, index) => {
            if (result.status === 'fulfilled' && result.value.passed) {
                auditReport.passed.push(result.value);
            } else if (result.status === 'fulfilled' && !result.value.passed) {
                auditReport.failed.push(result.value);
            } else {
                auditReport.warnings.push({
                    check: checks[index].name,
                    error: result.reason
                });
            }
        });
        
        this.logEvent('RUNTIME_AUDIT_COMPLETE', auditReport.failed.length > 0 ? 'WARNING' : 'INFO', auditReport);
        
        return auditReport;
    }
    
    async checkSecureContext() {
        const passed = window.isSecureContext;
        
        return {
            check: 'Secure Context',
            passed,
            message: passed ? 'التطبيق يعمل في بيئة آمنة (HTTPS)' : 'التطبيق لا يعمل في بيئة آمنة',
            severity: passed ? 'INFO' : 'CRITICAL'
        };
    }
    
    async checkCryptoAPI() {
        const cryptoAvailable = window.crypto && window.crypto.subtle;
        let algorithmsAvailable = [];
        
        if (cryptoAvailable) {
            algorithmsAvailable = await this.testCryptoAlgorithms();
        }
        
        return {
            check: 'Web Crypto API',
            passed: cryptoAvailable,
            message: cryptoAvailable ? 'Web Crypto API متاح' : 'Web Crypto API غير متاح',
            severity: cryptoAvailable ? 'INFO' : 'CRITICAL',
            details: { algorithmsAvailable }
        };
    }
    
    async testCryptoAlgorithms() {
        const algorithms = ['AES-GCM', 'AES-CBC', 'SHA-256', 'SHA-512', 'PBKDF2', 'HMAC'];
        const results = [];
        
        for (const algo of algorithms) {
            try {
                if (algo.includes('AES')) {
                    await crypto.subtle.generateKey(
                        { name: algo, length: 256 },
                        false,
                        ['encrypt', 'decrypt']
                    );
                } else if (algo.includes('SHA') || algo === 'HMAC') {
                    await crypto.subtle.digest(algo, new TextEncoder().encode('test'));
                }
                results.push(algo);
            } catch (error) {
                // الخوارزمية غير مدعومة
            }
        }
        
        return results;
    }
    
    async checkWebWorkers() {
        const passed = typeof Worker !== 'undefined';
        
        return {
            check: 'Web Workers',
            passed,
            message: passed ? 'Web Workers مدعوم' : 'Web Workers غير مدعوم',
            severity: 'MEDIUM'
        };
    }
    
    async checkStorageAPIs() {
        const storageTypes = ['localStorage', 'sessionStorage', 'indexedDB'];
        const available = [];
        const unavailable = [];
        
        storageTypes.forEach(type => {
            try {
                if (window[type]) {
                    available.push(type);
                } else {
                    unavailable.push(type);
                }
            } catch (error) {
                unavailable.push(type);
            }
        });
        
        return {
            check: 'Storage APIs',
            passed: available.length > 0,
            message: `التخزين المتاح: ${available.join(', ')}`,
            severity: 'LOW',
            details: { available, unavailable }
        };
    }
    
    async checkBrowserExtensions() {
        // محاولة اكتشاف أدوات المطور
        let devToolsOpen = false;
        
        const checkDevTools = () => {
            const widthThreshold = window.outerWidth - window.innerWidth > 160;
            const heightThreshold = window.outerHeight - window.innerHeight > 160;
            
            return widthThreshold || heightThreshold;
        };
        
        devToolsOpen = checkDevTools();
        
        return {
            check: 'Browser Extensions',
            passed: !devToolsOpen,
            message: devToolsOpen ? 'تم اكتشاف أدوات المطور' : 'لا توجد أدوات مطور نشطة',
            severity: devToolsOpen ? 'WARNING' : 'INFO'
        };
    }
    
    async checkDebuggingTools() {
        // الكشف عن أدوات التصحيح
        const debuggerDetected = (() => {
            const start = Date.now();
            debugger; // eslint-disable-line no-debugger
            return Date.now() - start > 100;
        })();
        
        return {
            check: 'Debugging Tools',
            passed: !debuggerDetected,
            message: debuggerDetected ? 'تم اكتشاف أدوات تصحيح' : 'لا توجد أدوات تصحيح',
            severity: debuggerDetected ? 'HIGH' : 'INFO'
        };
    }
    
    async checkNetworkSecurity() {
        const securityHeaders = {};
        let missingHeaders = [];
        
        try {
            const response = await fetch(window.location.href, { method: 'HEAD' });
            const headers = ['Content-Security-Policy', 'X-Frame-Options', 'X-Content-Type-Options'];
            
            headers.forEach(header => {
                if (response.headers.get(header)) {
                    securityHeaders[header] = response.headers.get(header);
                } else {
                    missingHeaders.push(header);
                }
            });
        } catch (error) {
            // لا يمكن التحقق من الرؤوس
        }
        
        return {
            check: 'Network Security Headers',
            passed: missingHeaders.length === 0,
            message: missingHeaders.length === 0 ? 'جميع رؤوس الأمان موجودة' : `رؤوس مفقودة: ${missingHeaders.join(', ')}`,
            severity: missingHeaders.length > 0 ? 'MEDIUM' : 'INFO',
            details: { securityHeaders, missingHeaders }
        };
    }
    
    async detectMemoryLeaks() {
        if (!window.performance || !window.performance.memory) return;
        
        const memory = window.performance.memory;
        const currentUsage = memory.usedJSHeapSize;
        
        // تسجيل استخدام الذاكرة بمرور الوقت
        this.memoryHistory = this.memoryHistory || [];
        this.memoryHistory.push({
            timestamp: Date.now(),
            usedJSHeapSize: currentUsage
        });
        
        // الاحتفاظ فقط بالسجلات الأخيرة
        if (this.memoryHistory.length > 100) {
            this.memoryHistory.shift();
        }
        
        // تحليل اتجاه استخدام الذاكرة
        if (this.memoryHistory.length > 10) {
            const recent = this.memoryHistory.slice(-10);
            const first = recent[0].usedJSHeapSize;
            const last = recent[recent.length - 1].usedJSHeapSize;
            
            // إذا زاد استخدام الذاكرة بنسبة 50% دون انخفاض
            if (last > first * 1.5) {
                this.logEvent('POSSIBLE_MEMORY_LEAK', 'WARNING', {
                    increasePercentage: ((last - first) / first * 100).toFixed(2),
                    duration: recent[recent.length - 1].timestamp - recent[0].timestamp
                });
            }
        }
    }
    
    async analyzeEncryptedFile(file, metadata) {
        const analysis = {
            fileSize: file.size,
            encryptionLayers: metadata?.layers?.length || 1,
            securityLevel: metadata?.securityLevel || 'UNKNOWN',
            anomalies: []
        };
        
        // التحقق من حجم الملف مقابل التوقعات
        if (metadata?.compressed) {
            const expectedRatio = 0.3; // نسبة انضغاط متوقعة
            const actualRatio = file.size / (metadata.originalSize || file.size);
            
            if (actualRatio > 0.9) { // إذا كان الملف كبير جدًا بالنسبة للمضغوط
                analysis.anomalies.push({
                    type: 'SUSPICIOUS_COMPRESSION_RATIO',
                    severity: 'MEDIUM',
                    message: `نسبة الانضغاط غير عادية: ${actualRatio.toFixed(2)}`
                });
            }
        }
        
        // التحقق من بيانات وصفية غير عادية
        if (metadata && Object.keys(metadata).length > 20) {
            analysis.anomalies.push({
                type: 'EXCESSIVE_METADATA',
                severity: 'LOW',
                message: 'البيانات الوصفية كبيرة بشكل غير عادي'
            });
        }
        
        if (analysis.anomalies.length > 0) {
            this.logEvent('FILE_ANALYSIS_COMPLETE', 'WARNING', analysis);
        }
        
        return analysis;
    }
    
    logEvent(type, severity, data) {
        const event = {
            id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type,
            severity,
            timestamp: Date.now(),
            data,
            sessionId: window.sessionId || 'unknown',
            userAgent: navigator.userAgent,
            origin: window.location.origin
        };
        
        this.logs.push(event);
        
        // الحفاظ على الحد الأقصى للسجلات
        if (this.logs.length > this.maxLogs) {
            this.logs.shift();
        }
        
        // تحديث مستوى التهديد
        this.updateThreatLevel(event);
        
        // عرض التنبيهات المهمة
        if (severity === 'CRITICAL' || severity === 'HIGH') {
            this.showSecurityAlert(`${type}: ${JSON.stringify(data)}`);
        }
        
        // تسجيل في وحدة التحكم للتطوير
        if (process.env.NODE_ENV === 'development') {
            console.log(`[Security Audit] ${severity}: ${type}`, data);
        }
        
        return event;
    }
    
    updateThreatLevel(event) {
        const severityPoints = {
            'INFO': 0,
            'DEBUG': 0,
            'LOW': 1,
            'MEDIUM': 2,
            'HIGH': 3,
            'CRITICAL': 5
        };
        
        // حساب النقاط للأحداث الأخيرة (آخر 5 دقائق)
        const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
        const recentEvents = this.logs.filter(log => 
            log.timestamp > fiveMinutesAgo && 
            log.severity !== 'INFO' && 
            log.severity !== 'DEBUG'
        );
        
        const totalPoints = recentEvents.reduce((sum, log) => 
            sum + (severityPoints[log.severity] || 0), 0
        );
        
        // تحديث مستوى التهديد
        if (totalPoints >= 15) {
            this.threatLevel = 'CRITICAL';
        } else if (totalPoints >= 10) {
            this.threatLevel = 'HIGH';
        } else if (totalPoints >= 5) {
            this.threatLevel = 'MEDIUM';
        } else if (totalPoints >= 2) {
            this.threatLevel = 'LOW';
        } else {
            this.threatLevel = 'NORMAL';
        }
        
        // إذا كان مستوى التهديد مرتفعًا، اتخاذ إجراءات
        if (this.threatLevel === 'CRITICAL' && this.auditConfig.BLOCK_SUSPICIOUS_ACTIVITY) {
            this.initiateLockdown();
        }
    }
    
    initiateLockdown() {
        this.logEvent('SYSTEM_LOCKDOWN_INITIATED', 'CRITICAL', {
            reason: 'مستوى التهديد مرتفع جدًا',
            threatLevel: this.threatLevel,
            timestamp: Date.now()
        });
        
        // تعطيل وظائف حساسة
        if (window.CryptoEngine) {
            window.CryptoEngine.secureWipeEnabled = true;
        }
        
        // إظهار تحذير للمستخدم
        this.showSecurityAlert(
            'تم اكتشاف نشاط مشبوه. تم تعطيل بعض الميزات مؤقتًا.',
            true
        );
        
        // إعادة تعيين النظام بعد 5 دقائق
        setTimeout(() => {
            this.threatLevel = 'NORMAL';
            this.logEvent('SYSTEM_LOCKDOWN_LIFTED', 'INFO', {
                timestamp: Date.now()
            });
        }, 5 * 60 * 1000);
    }
    
    showSecurityAlert(message, isCritical = false) {
        // إنشاء عنصر التنبيه
        const alertDiv = document.createElement('div');
        alertDiv.className = `security-alert ${isCritical ? 'critical' : 'warning'}`;
        alertDiv.innerHTML = `
            <div class="alert-content">
                <i class="fas fa-shield-alt"></i>
                <div class="alert-text">
                    <strong>تنبيه أمني:</strong>
                    <span>${message}</span>
                </div>
                <button class="alert-close">&times;</button>
            </div>
        `;
        
        // إضافة الأنماط إذا لم تكن موجودة
        if (!document.querySelector('#security-alert-styles')) {
            const styles = document.createElement('style');
            styles.id = 'security-alert-styles';
            styles.textContent = `
                .security-alert {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    z-index: 9999;
                    min-width: 300px;
                    max-width: 500px;
                    padding: 15px;
                    border-radius: 8px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                    animation: slideIn 0.3s ease;
                }
                
                .security-alert.warning {
                    background: linear-gradient(135deg, #ff9800, #ff5722);
                    color: white;
                    border-left: 4px solid #ff5722;
                }
                
                .security-alert.critical {
                    background: linear-gradient(135deg, #f44336, #d32f2f);
                    color: white;
                    border-left: 4px solid #b71c1c;
                    animation: criticalPulse 1s infinite;
                }
                
                .alert-content {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }
                
                .alert-content i {
                    font-size: 24px;
                }
                
                .alert-text {
                    flex: 1;
                }
                
                .alert-text strong {
                    display: block;
                    font-size: 14px;
                    margin-bottom: 4px;
                }
                
                .alert-text span {
                    font-size: 13px;
                    opacity: 0.9;
                }
                
                .alert-close {
                    background: none;
                    border: none;
                    color: white;
                    font-size: 20px;
                    cursor: pointer;
                    opacity: 0.7;
                    transition: opacity 0.2s;
                }
                
                .alert-close:hover {
                    opacity: 1;
                }
                
                @keyframes slideIn {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                
                @keyframes criticalPulse {
                    0%, 100% { box-shadow: 0 0 0 0 rgba(244, 67, 54, 0.7); }
                    50% { box-shadow: 0 0 0 10px rgba(244, 67, 54, 0); }
                }
            `;
            document.head.appendChild(styles);
        }
        
        document.body.appendChild(alertDiv);
        
        // إضافة حدث الإغلاق
        alertDiv.querySelector('.alert-close').addEventListener('click', () => {
            alertDiv.remove();
        });
        
        // الإزالة التلقائية بعد 10 ثوانٍ
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.style.opacity = '0';
                setTimeout(() => alertDiv.remove(), 300);
            }
        }, 10000);
    }
    
    getEnvironmentInfo() {
        return {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language,
            languages: navigator.languages,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            screen: {
                width: window.screen.width,
                height: window.screen.height,
                colorDepth: window.screen.colorDepth
            },
            hardware: {
                cores: navigator.hardwareConcurrency || 4,
                memory: navigator.deviceMemory || 4
            },
            connection: navigator.connection ? {
                effectiveType: navigator.connection.effectiveType,
                downlink: navigator.connection.downlink,
                rtt: navigator.connection.rtt
            } : null,
            secureContext: window.isSecureContext,
            crypto: !!window.crypto?.subtle,
            workers: !!window.Worker,
            serviceWorker: 'serviceWorker' in navigator
        };
    }
    
    getAuditReport() {
        const report = {
            summary: {
                totalEvents: this.logs.length,
                threatLevel: this.threatLevel,
                lastUpdated: Date.now()
            },
            eventsBySeverity: this.getEventsBySeverity(),
            recentCriticalEvents: this.getRecentEvents('CRITICAL', 10),
            systemStatus: this.getSystemStatus(),
            recommendations: this.generateRecommendations()
        };
        
        return report;
    }
    
    getEventsBySeverity() {
        const counts = {
            CRITICAL: 0,
            HIGH: 0,
            MEDIUM: 0,
            LOW: 0,
            INFO: 0,
            DEBUG: 0
        };
        
        this.logs.forEach(log => {
            counts[log.severity] = (counts[log.severity] || 0) + 1;
        });
        
        return counts;
    }
    
    getRecentEvents(severity, limit = 20) {
        return this.logs
            .filter(log => log.severity === severity)
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, limit);
    }
    
    getSystemStatus() {
        return {
            threatLevel: this.threatLevel,
            environment: this.getEnvironmentInfo(),
            auditConfig: this.auditConfig,
            memoryUsage: this.measureMemoryUsage(),
            performance: window.performance ? {
                timing: window.performance.timing,
                navigation: window.performance.navigation
            } : null
        };
    }
    
    generateRecommendations() {
        const recommendations = [];
        
        if (!window.isSecureContext) {
            recommendations.push({
                severity: 'CRITICAL',
                message: 'قم بتشغيل التطبيق على HTTPS لضمان أمان الاتصال',
                action: 'نقل التطبيق إلى خادم يدعم HTTPS'
            });
        }
        
        if (!window.crypto?.subtle) {
            recommendations.push({
                severity: 'CRITICAL',
                message: 'المتصفح لا يدعم Web Crypto API',
                action: 'تحديث المتصفح أو استخدام متصفح حديث'
            });
        }
        
        if (this.threatLevel === 'CRITICAL' || this.threatLevel === 'HIGH') {
            recommendations.push({
                severity: 'HIGH',
                message: 'مستوى التهديد مرتفع. تفقد سجلات التدقيق للحصول على التفاصيل',
                action: 'مراجعة سجلات الأمان واتخاذ الإجراءات المناسبة'
            });
        }
        
        return recommendations;
    }
    
    exportLogs(format = 'json') {
        switch (format) {
            case 'json':
                return JSON.stringify(this.logs, null, 2);
            case 'csv':
                return this.convertLogsToCSV();
            case 'html':
                return this.convertLogsToHTML();
            default:
                return JSON.stringify(this.logs);
        }
    }
    
    convertLogsToCSV() {
        if (this.logs.length === 0) return '';
        
        const headers = ['Timestamp', 'Severity', 'Type', 'Session ID', 'Details'];
        const rows = this.logs.map(log => [
            new Date(log.timestamp).toISOString(),
            log.severity,
            log.type,
            log.sessionId,
            JSON.stringify(log.data)
        ]);
        
        return [headers, ...rows].map(row => 
            row.map(cell => `"${cell}"`).join(',')
        ).join('\n');
    }
    
    convertLogsToHTML() {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Security Audit Report</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    table { border-collapse: collapse; width: 100%; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background-color: #f2f2f2; }
                    .critical { background-color: #ffebee; }
                    .high { background-color: #fff3e0; }
                    .medium { background-color: #fff8e1; }
                    .low { background-color: #f1f8e9; }
                </style>
            </head>
            <body>
                <h1>Security Audit Report</h1>
                <p>Generated: ${new Date().toISOString()}</p>
                <p>Total Events: ${this.logs.length}</p>
                <table>
                    <thead>
                        <tr>
                            <th>Timestamp</th>
                            <th>Severity</th>
                            <th>Type</th>
                            <th>Session ID</th>
                            <th>Details</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${this.logs.map(log => `
                            <tr class="${log.severity.toLowerCase()}">
                                <td>${new Date(log.timestamp).toISOString()}</td>
                                <td>${log.severity}</td>
                                <td>${log.type}</td>
                                <td>${log.sessionId}</td>
                                <td><pre>${JSON.stringify(log.data, null, 2)}</pre></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </body>
            </html>
        `;
    }
    
    clearLogs() {
        const count = this.logs.length;
        this.logs = [];
        this.logEvent('AUDIT_LOGS_CLEARED', 'INFO', {
            clearedCount: count,
            timestamp: Date.now()
        });
        
        return count;
    }
}

// إنشاء نسخة عامة
const SecurityAudit = new EnhancedSecurityAudit();

// التصدير للاستخدام العام
if (typeof window !== 'undefined') {
    window.SecurityAudit = SecurityAudit;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        EnhancedSecurityAudit,
        SecurityAudit
    };
}
