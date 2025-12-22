/**
 * CipherVault 3D Pro - Browser Compatibility Manager
 * مدير التوافق مع المتصفحات ودعم جميع الأجهزة
 * Version: 4.2.0 Enhanced
 */

class BrowserCompatibility {
    constructor() {
        this.features = new Map();
        this.issues = [];
        this.solutions = new Map();
        this.fallbacks = new Map();
        
        this.initialize();
    }
    
    /**
     * تهيئة مدير التوافق
     */
    initialize() {
        this.detectFeatures();
        this.checkCompatibility();
        this.setupFallbacks();
        this.applySolutions();
        this.setupCompatibilityWarning();
    }
    
    /**
     * اكتشاف الميزات المتاحة
     */
    detectFeatures() {
        const detection = {
            // Web Crypto API
            crypto: {
                available: typeof crypto !== 'undefined',
                subtle: typeof crypto !== 'undefined' && crypto.subtle,
                getRandomValues: typeof crypto !== 'undefined' && crypto.getRandomValues,
                randomUUID: typeof crypto !== 'undefined' && crypto.randomUUID
            },
            
            // Web Workers
            workers: {
                available: typeof Worker !== 'undefined',
                serviceWorker: 'serviceWorker' in navigator,
                sharedWorker: typeof SharedWorker !== 'undefined'
            },
            
            // Web Storage APIs
            storage: {
                localStorage: typeof localStorage !== 'undefined',
                sessionStorage: typeof sessionStorage !== 'undefined',
                indexedDB: 'indexedDB' in window,
                caches: 'caches' in window
            },
            
            // File APIs
            file: {
                fileReader: 'FileReader' in window,
                fileList: 'FileList' in window,
                fileSystem: 'showOpenFilePicker' in window,
                directory: 'showDirectoryPicker' in window
            },
            
            // WebGL و 3D APIs
            graphics: {
                webGL: this.detectWebGL(),
                webGL2: this.detectWebGL2(),
                webGPU: 'gpu' in navigator,
                canvas: 'HTMLCanvasElement' in window
            },
            
            // Network APIs
            network: {
                fetch: 'fetch' in window,
                beacon: 'sendBeacon' in navigator,
                xhr: 'XMLHttpRequest' in window,
                eventsource: 'EventSource' in window
            },
            
            // Compression APIs
            compression: {
                compressionStreams: 'CompressionStream' in window,
                decompressionStreams: 'DecompressionStream' in window
            },
            
            // Media APIs
            media: {
                mediaRecorder: 'MediaRecorder' in window,
                mediaSource: 'MediaSource' in window,
                webAudio: 'AudioContext' in window || 'webkitAudioContext' in window
            },
            
            // Performance APIs
            performance: {
                memory: 'memory' in performance,
                timing: 'timing' in performance,
                now: 'now' in performance,
                mark: 'mark' in performance
            },
            
            // Modern JavaScript Features
            javascript: {
                es6: this.testES6(),
                es2020: this.testES2020(),
                modules: 'noModule' in HTMLScriptElement.prototype,
                bigInt: typeof BigInt !== 'undefined',
                promise: typeof Promise !== 'undefined',
                asyncAwait: this.testAsyncAwait()
            },
            
            // CSS Features
            css: {
                grid: CSS.supports('display', 'grid'),
                flexbox: CSS.supports('display', 'flex'),
                variables: CSS.supports('(--test: 0)'),
                backdropFilter: CSS.supports('backdrop-filter', 'blur(10px)'),
                clipPath: CSS.supports('clip-path', 'circle(50%)')
            },
            
            // Device Capabilities
            device: {
                touch: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
                pointer: 'PointerEvent' in window,
                orientation: 'orientation' in screen,
                motion: 'DeviceMotionEvent' in window,
                vibration: 'vibrate' in navigator
            },
            
            // Browser Information
            browser: {
                name: this.getBrowserName(),
                version: this.getBrowserVersion(),
                engine: this.getBrowserEngine(),
                os: this.getOS(),
                architecture: this.getArchitecture(),
                mobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
                tablet: /iPad|Android(?!.*Mobile)|Tablet|Silk/i.test(navigator.userAgent)
            },
            
            // Memory و CPU
            hardware: {
                memory: navigator.deviceMemory || 4,
                cores: navigator.hardwareConcurrency || 4,
                maxHeap: performance.memory?.jsHeapSizeLimit || 0
            }
        };
        
        this.features = new Map(Object.entries(detection));
        return detection;
    }
    
    /**
     * اكتشاف WebGL
     */
    detectWebGL() {
        try {
            const canvas = document.createElement('canvas');
            return !!(window.WebGLRenderingContext && 
                (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
        } catch (e) {
            return false;
        }
    }
    
    /**
     * اكتشاف WebGL2
     */
    detectWebGL2() {
        try {
            const canvas = document.createElement('canvas');
            return !!(window.WebGL2RenderingContext && canvas.getContext('webgl2'));
        } catch (e) {
            return false;
        }
    }
    
    /**
     * اختبار ES6
     */
    testES6() {
        try {
            // اختبار ميزات ES6 الأساسية
            const test = {
                arrow: () => true,
                classes: class Test { constructor() { this.test = true; } },
                letConst: (() => { let a = 1; const b = 2; return a + b === 3; })(),
                template: `test${1}` === 'test1',
                destructuring: (() => { const {a} = {a: 1}; return a === 1; })(),
                spread: (() => { const arr = [...[1,2]]; return arr.length === 2; })(),
                promises: (() => { return new Promise(() => {}); })()
            };
            return true;
        } catch (e) {
            return false;
        }
    }
    
    /**
     * اختبار ES2020
     */
    testES2020() {
        try {
            // اختبار ميزات ES2020
            const test = {
                bigInt: 1n + 2n === 3n,
                optionalChaining: (() => { const obj = {}; return obj?.test === undefined; })(),
                nullishCoalescing: (() => { return null ?? 'default' === 'default'; })(),
                dynamicImport: typeof import('') === 'object',
                globalThis: globalThis !== undefined
            };
            return true;
        } catch (e) {
            return false;
        }
    }
    
    /**
     * اختبار Async/Await
     */
    testAsyncAwait() {
        try {
            eval('async function test() { await Promise.resolve(); }');
            return true;
        } catch (e) {
            return false;
        }
    }
    
    /**
     * الحصول على اسم المتصفح
     */
    getBrowserName() {
        const userAgent = navigator.userAgent;
        
        if (userAgent.includes('Firefox')) return 'Firefox';
        if (userAgent.includes('SamsungBrowser')) return 'Samsung Internet';
        if (userAgent.includes('Opera') || userAgent.includes('OPR')) return 'Opera';
        if (userAgent.includes('Trident')) return 'Internet Explorer';
        if (userAgent.includes('Edge')) return 'Edge';
        if (userAgent.includes('Chrome')) return 'Chrome';
        if (userAgent.includes('Safari')) return 'Safari';
        
        return 'Unknown';
    }
    
    /**
     * الحصول على إصدار المتصفح
     */
    getBrowserVersion() {
        const userAgent = navigator.userAgent;
        let version = 'Unknown';
        
        // Chrome/Edge
        const chromeMatch = userAgent.match(/Chrome\/(\d+)/);
        if (chromeMatch) version = chromeMatch[1];
        
        // Firefox
        const firefoxMatch = userAgent.match(/Firefox\/(\d+)/);
        if (firefoxMatch) version = firefoxMatch[1];
        
        // Safari
        const safariMatch = userAgent.match(/Version\/(\d+).*Safari/);
        if (safariMatch) version = safariMatch[1];
        
        // IE
        const ieMatch = userAgent.match(/MSIE (\d+)/);
        if (ieMatch) version = ieMatch[1];
        
        return version;
    }
    
    /**
     * الحصول على محرك المتصفح
     */
    getBrowserEngine() {
        const userAgent = navigator.userAgent;
        
        if (userAgent.includes('AppleWebKit') && !userAgent.includes('Chrome')) {
            return 'WebKit';
        }
        if (userAgent.includes('Gecko')) {
            return 'Gecko';
        }
        if (userAgent.includes('Trident')) {
            return 'Trident';
        }
        if (userAgent.includes('Blink')) {
            return 'Blink';
        }
        
        return 'Unknown';
    }
    
    /**
     * الحصول على نظام التشغيل
     */
    getOS() {
        const userAgent = navigator.userAgent;
        const platform = navigator.platform;
        
        if (/Windows/.test(userAgent)) return 'Windows';
        if (/Mac/.test(platform)) return 'macOS';
        if (/Linux/.test(platform)) return 'Linux';
        if (/Android/.test(userAgent)) return 'Android';
        if (/iOS|iPhone|iPad|iPod/.test(userAgent)) return 'iOS';
        
        return 'Unknown';
    }
    
    /**
     * الحصول على بنية المعالج
     */
    getArchitecture() {
        const platform = navigator.platform;
        
        if (/x86_64|x64|amd64|win64|wow64/i.test(platform)) return 'x64';
        if (/x86|i386|i686|win32/i.test(platform)) return 'x86';
        if (/arm|aarch64/i.test(platform)) return 'ARM';
        if (/mips/i.test(platform)) return 'MIPS';
        
        return 'Unknown';
    }
    
    /**
     * التحقق من التوافق
     */
    checkCompatibility() {
        const requiredFeatures = [
            'crypto.subtle',
            'workers.available',
            'storage.localStorage',
            'file.fileReader',
            'graphics.webGL',
            'network.fetch',
            'javascript.promise',
            'javascript.es6'
        ];
        
        requiredFeatures.forEach(featurePath => {
            const value = this.getFeatureValue(featurePath);
            if (!value) {
                this.issues.push({
                    feature: featurePath,
                    severity: 'critical',
                    message: `Required feature missing: ${featurePath}`,
                    impact: 'Application may not function properly'
                });
            }
        });
        
        // تحقق من الميزات الموصى بها
        const recommendedFeatures = [
            'compression.compressionStreams',
            'performance.memory',
            'css.grid',
            'device.touch'
        ];
        
        recommendedFeatures.forEach(featurePath => {
            const value = this.getFeatureValue(featurePath);
            if (!value) {
                this.issues.push({
                    feature: featurePath,
                    severity: 'warning',
                    message: `Recommended feature missing: ${featurePath}`,
                    impact: 'Some features may be limited'
                });
            }
        });
        
        // التحقق من إصدار المتصفح
        this.checkBrowserVersion();
        
        // التحقق من إعدادات الأمان
        this.checkSecuritySettings();
        
        return {
            compatible: this.issues.filter(i => i.severity === 'critical').length === 0,
            issues: this.issues,
            score: this.calculateCompatibilityScore()
        };
    }
    
    /**
     * الحصول على قيمة الميزة
     */
    getFeatureValue(path) {
        const parts = path.split('.');
        let current = this.features;
        
        for (const part of parts) {
            if (current instanceof Map) {
                current = current.get(part);
            } else if (current && typeof current === 'object') {
                current = current[part];
            } else {
                return null;
            }
        }
        
        return current;
    }
    
    /**
     * التحقق من إصدار المتصفح
     */
    checkBrowserVersion() {
        const browser = this.features.get('browser');
        const version = parseInt(browser.version, 10);
        
        const minVersions = {
            'Chrome': 80,
            'Firefox': 75,
            'Safari': 13,
            'Edge': 80,
            'Opera': 67,
            'Samsung Internet': 12
        };
        
        if (minVersions[browser.name] && version < minVersions[browser.name]) {
            this.issues.push({
                feature: 'browser.version',
                severity: 'warning',
                message: `Browser version ${version} is older than recommended ${minVersions[browser.name]}`,
                impact: 'Update browser for better performance and security'
            });
        }
    }
    
    /**
     * التحقق من إعدادات الأمان
     */
    checkSecuritySettings() {
        // HTTPS
        if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
            this.issues.push({
                feature: 'security.https',
                severity: 'warning',
                message: 'Not using HTTPS connection',
                impact: 'Encryption security may be compromised'
            });
        }
        
        // Secure Context
        if (!window.isSecureContext) {
            this.issues.push({
                feature: 'security.context',
                severity: 'critical',
                message: 'Not in a secure context',
                impact: 'Web Crypto API may not be available'
            });
        }
        
        // Content Security Policy
        const csp = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
        if (!csp) {
            this.issues.push({
                feature: 'security.csp',
                severity: 'info',
                message: 'No Content Security Policy detected',
                impact: 'Consider adding CSP for enhanced security'
            });
        }
    }
    
    /**
     * حساب درجة التوافق
     */
    calculateCompatibilityScore() {
        const totalFeatures = 25; // عدد الميزات التي نتحقق منها
        const criticalIssues = this.issues.filter(i => i.severity === 'critical').length;
        const warningIssues = this.issues.filter(i => i.severity === 'warning').length;
        
        const score = 100 - (criticalIssues * 10) - (warningIssues * 2);
        return Math.max(0, Math.min(100, score));
    }
    
    /**
     * إعداد البدائل
     */
    setupFallbacks() {
        this.fallbacks.set('crypto.subtle', {
            condition: () => !this.getFeatureValue('crypto.subtle'),
            action: () => this.loadPolyfill('webcrypto'),
            message: 'Web Crypto API not available, loading polyfill'
        });
        
        this.fallbacks.set('compression.compressionStreams', {
            condition: () => !this.getFeatureValue('compression.compressionStreams'),
            action: () => this.loadPolyfill('pako'),
            message: 'Compression Streams not available, using Pako library'
        });
        
        this.fallbacks.set('workers.available', {
            condition: () => !this.getFeatureValue('workers.available'),
            action: () => this.setupMainThreadProcessing(),
            message: 'Web Workers not available, processing in main thread'
        });
        
        this.fallbacks.set('css.grid', {
            condition: () => !this.getFeatureValue('css.grid'),
            action: () => this.applyCSSFallbacks(),
            message: 'CSS Grid not available, using Flexbox fallback'
        });
        
        this.fallbacks.set('performance.memory', {
            condition: () => !this.getFeatureValue('performance.memory'),
            action: () => this.setupMemoryMonitoring(),
            message: 'Performance Memory API not available, using estimation'
        });
    }
    
    /**
     * تطبيق الحلول
     */
    applySolutions() {
        let applied = 0;
        
        this.fallbacks.forEach((fallback, feature) => {
            if (fallback.condition()) {
                console.warn(fallback.message);
                fallback.action();
                applied++;
                
                // تحديث المشكلات
                const issueIndex = this.issues.findIndex(i => i.feature === feature);
                if (issueIndex !== -1) {
                    this.issues[issueIndex].resolved = true;
                    this.issues[issueIndex].solution = 'Fallback applied';
                }
            }
        });
        
        console.log(`Applied ${applied} fallback solutions`);
        return applied;
    }
    
    /**
     * تحميل Polyfill
     */
    loadPolyfill(type) {
        const polyfills = {
            webcrypto: 'https://cdn.jsdelivr.net/npm/webcrypto-shim@latest',
            pako: 'https://cdn.jsdelivr.net/npm/pako@latest/dist/pako.min.js',
            promise: 'https://cdn.jsdelivr.net/npm/promise-polyfill@latest/dist/polyfill.min.js',
            fetch: 'https://cdn.jsdelivr.net/npm/whatwg-fetch@latest/dist/fetch.umd.js'
        };
        
        if (polyfills[type]) {
            const script = document.createElement('script');
            script.src = polyfills[type];
            script.async = true;
            document.head.appendChild(script);
        }
    }
    
    /**
     * إعداد المعالجة في الخيط الرئيسي
     */
    setupMainThreadProcessing() {
        // وضع علامة على أن المعالجة ستكون في الخيط الرئيسي
        window.CipherVaultConfig = window.CipherVaultConfig || {};
        window.CipherVaultConfig.useMainThread = true;
        
        // تحميل نسخة بديلة من ملفات العمال
        this.loadScript('assets/js/crypto-mainthread.js');
    }
    
    /**
     * تطبيق بدائل CSS
     */
    applyCSSFallbacks() {
        const style = document.createElement('style');
        style.textContent = `
            .card-container-3d {
                display: flex !important;
                flex-wrap: wrap !important;
            }
            
            .stats-panel-3d {
                display: flex !important;
                flex-wrap: wrap !important;
            }
            
            .progress-details,
            .progress-stats {
                display: flex !important;
                flex-wrap: wrap !important;
            }
        `;
        document.head.appendChild(style);
    }
    
    /**
     * إعداد مراقبة الذاكرة
     */
    setupMemoryMonitoring() {
        // استخدام تقدير للذاكرة
        window.performance.memory = window.performance.memory || {
            usedJSHeapSize: 0,
            totalJSHeapSize: 256 * 1024 * 1024, // 256MB تقديري
            jsHeapSizeLimit: 512 * 1024 * 1024 // 512MB تقديري
        };
        
        // تحديث دوري (تقديري)
        setInterval(() => {
            if (window.performance.memory) {
                // زيادة تقديرية بناءً على الوقت
                window.performance.memory.usedJSHeapSize = 
                    Math.min(
                        window.performance.memory.usedJSHeapSize + 1024 * 1024, // +1MB كل ثانية
                        window.performance.memory.jsHeapSizeLimit
                    );
            }
        }, 1000);
    }
    
    /**
     * إعداد تحذير التوافق
     */
    setupCompatibilityWarning() {
        const compatibility = this.checkCompatibility();
        
        if (compatibility.score < 80) {
            this.showCompatibilityWarning(compatibility);
        }
        
        // تحديث عرض التوافق
        this.updateCompatibilityDisplay(compatibility);
    }
    
    /**
     * إظهار تحذير التوافق
     */
    showCompatibilityWarning(compatibility) {
        const warning = document.createElement('div');
        warning.className = 'compatibility-warning';
        warning.innerHTML = `
            <div class="warning-content">
                <div class="warning-icon">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <div class="warning-text">
                    <h4>Compatibility Issues Detected</h4>
                    <p>Your browser may not support all features. Some functionality may be limited.</p>
                    <p>Compatibility Score: <strong>${compatibility.score}/100</strong></p>
                    <button class="btn-warning-details">View Details</button>
                    <button class="btn-warning-dismiss">Dismiss</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(warning);
        
        // مستمعي الأحداث
        warning.querySelector('.btn-warning-details').addEventListener('click', () => {
            this.showCompatibilityDetails(compatibility);
        });
        
        warning.querySelector('.btn-warning-dismiss').addEventListener('click', () => {
            warning.remove();
            localStorage.setItem('ciphervault_compatibility_dismissed', 'true');
        });
        
        // إزالة تلقائية بعد 10 ثواني
        setTimeout(() => {
            if (document.body.contains(warning)) {
                warning.style.opacity = '0';
                setTimeout(() => warning.remove(), 300);
            }
        }, 10000);
    }
    
    /**
     * إظهار تفاصيل التوافق
     */
    showCompatibilityDetails(compatibility) {
        const details = document.createElement('div');
        details.className = 'compatibility-details';
        
        let issuesHTML = '';
        compatibility.issues.forEach(issue => {
            issuesHTML += `
                <div class="compatibility-issue ${issue.severity}">
                    <div class="issue-header">
                        <i class="fas ${this.getIssueIcon(issue.severity)}"></i>
                        <span class="issue-feature">${issue.feature}</span>
                        <span class="issue-severity">${issue.severity.toUpperCase()}</span>
                    </div>
                    <div class="issue-message">${issue.message}</div>
                    <div class="issue-impact">Impact: ${issue.impact}</div>
                    ${issue.resolved ? '<div class="issue-resolved">✓ Resolved with fallback</div>' : ''}
                </div>
            `;
        });
        
        details.innerHTML = `
            <div class="details-modal">
                <div class="details-header">
                    <h3>Browser Compatibility Report</h3>
                    <button class="details-close"><i class="fas fa-times"></i></button>
                </div>
                <div class="details-content">
                    <div class="compatibility-score">
                        <div class="score-circle">
                            <svg width="120" height="120">
                                <circle cx="60" cy="60" r="54" fill="none" stroke="#e0e0e0" stroke-width="12"></circle>
                                <circle cx="60" cy="60" r="54" fill="none" 
                                    stroke="${this.getScoreColor(compatibility.score)}" 
                                    stroke-width="12" 
                                    stroke-dasharray="339.292"
                                    stroke-dashoffset="${339.292 * (1 - compatibility.score / 100)}">
                                </circle>
                            </svg>
                            <div class="score-text">${compatibility.score}</div>
                        </div>
                        <div class="score-info">
                            <h4>Overall Compatibility Score</h4>
                            <p>${this.getScoreDescription(compatibility.score)}</p>
                        </div>
                    </div>
                    
                    <div class="browser-info">
                        <h4>Browser Information</h4>
                        <div class="info-grid">
                            <div class="info-item">
                                <span class="info-label">Browser:</span>
                                <span class="info-value">${this.features.get('browser').name} ${this.features.get('browser').version}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Engine:</span>
                                <span class="info-value">${this.features.get('browser').engine}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">OS:</span>
                                <span class="info-value">${this.features.get('browser').os}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Architecture:</span>
                                <span class="info-value">${this.getArchitecture()}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Memory:</span>
                                <span class="info-value">${this.features.get('hardware').memory} GB</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">CPU Cores:</span>
                                <span class="info-value">${this.features.get('hardware').cores}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="issues-section">
                        <h4>Detected Issues (${compatibility.issues.length})</h4>
                        <div class="issues-list">
                            ${issuesHTML}
                        </div>
                    </div>
                    
                    <div class="recommendations">
                        <h4>Recommendations</h4>
                        <ul>
                            ${this.generateRecommendations(compatibility)}
                        </ul>
                    </div>
                </div>
                <div class="details-footer">
                    <button class="btn-details-close">Close</button>
                    <button class="btn-export-report">Export Report</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(details);
        
        // مستمعي الأحداث
        details.querySelector('.details-close').addEventListener('click', () => details.remove());
        details.querySelector('.btn-details-close').addEventListener('click', () => details.remove());
        details.querySelector('.btn-export-report').addEventListener('click', () => {
            this.exportCompatibilityReport(compatibility);
        });
    }
    
    /**
     * الحصول على أيقونة المشكلة
     */
    getIssueIcon(severity) {
        const icons = {
            critical: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };
        return icons[severity] || 'fa-info-circle';
    }
    
    /**
     * الحصول على لون الدرجة
     */
    getScoreColor(score) {
        if (score >= 90) return '#00ff88';
        if (score >= 70) return '#ffaa00';
        return '#ff4757';
    }
    
    /**
     * الحصول على وصف الدرجة
     */
    getScoreDescription(score) {
        if (score >= 90) return 'Excellent compatibility';
        if (score >= 70) return 'Good compatibility';
        if (score >= 50) return 'Fair compatibility';
        return 'Poor compatibility - consider updating your browser';
    }
    
    /**
     * توليد التوصيات
     */
    generateRecommendations(compatibility) {
        const recommendations = [];
        
        if (compatibility.score < 90) {
            recommendations.push('<li>Update your browser to the latest version</li>');
        }
        
        const criticalIssues = compatibility.issues.filter(i => i.severity === 'critical' && !i.resolved);
        if (criticalIssues.length > 0) {
            recommendations.push('<li>Enable JavaScript and Web Crypto API in browser settings</li>');
        }
        
        if (!this.features.get('crypto.subtle')) {
            recommendations.push('<li>Use HTTPS for full Web Crypto API support</li>');
        }
        
        if (this.features.get('browser').mobile && compatibility.score < 80) {
            recommendations.push('<li>Consider using the desktop version for full features</li>');
        }
        
        if (recommendations.length === 0) {
            recommendations.push('<li>Your browser is well configured. No recommendations needed.</li>');
        }
        
        return recommendations.join('');
    }
    
    /**
     * تصدير تقرير التوافق
     */
    exportCompatibilityReport(compatibility) {
        const report = {
            timestamp: new Date().toISOString(),
            browser: this.features.get('browser'),
            hardware: this.features.get('hardware'),
            compatibility: {
                score: compatibility.score,
                compatible: compatibility.compatible,
                issues: compatibility.issues
            },
            features: Object.fromEntries(this.features)
        };
        
        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        
        a.href = url;
        a.download = `ciphervault-compatibility-report-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    
    /**
     * تحديث عرض التوافق
     */
    updateCompatibilityDisplay(compatibility) {
        const compatibilityElement = document.getElementById('browserCompatibility');
        if (compatibilityElement) {
            let status = 'Compatible';
            let color = 'var(--success)';
            
            if (compatibility.score < 50) {
                status = 'Not Compatible';
                color = 'var(--error)';
            } else if (compatibility.score < 80) {
                status = 'Partially Compatible';
                color = 'var(--warning)';
            }
            
            compatibilityElement.textContent = `${status} (${compatibility.score}/100)`;
            compatibilityElement.style.color = color;
        }
    }
    
    /**
     * تحميل سكربت
     */
    loadScript(url) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = url;
            script.async = true;
            
            script.onload = resolve;
            script.onerror = reject;
            
            document.head.appendChild(script);
        });
    }
    
    /**
     * الحصول على تقرير كامل
     */
    getFullReport() {
        return {
            features: Object.fromEntries(this.features),
            compatibility: this.checkCompatibility(),
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent
        };
    }
    
    /**
     * التحقق من توافق الميزة المحددة
     */
    checkFeature(featurePath) {
        const value = this.getFeatureValue(featurePath);
        return {
            available: !!value,
            value: value,
            fallback: this.fallbacks.has(featurePath)
        };
    }
    
    /**
     * تحسين الأداء بناءً على إمكانيات الجهاز
     */
    optimizeForDevice() {
        const hardware = this.features.get('hardware');
        const browser = this.features.get('browser');
        
        const optimizations = {
            useWorkers: hardware.cores > 1 && this.getFeatureValue('workers.available'),
            useCompression: this.getFeatureValue('compression.compressionStreams'),
            useWebGL: this.getFeatureValue('graphics.webGL') && !browser.mobile,
            chunkSize: this.calculateOptimalChunkSize(),
            maxParallelOperations: Math.min(hardware.cores, 4)
        };
        
        // تطبيق التحسينات
        window.CipherVaultConfig = window.CipherVaultConfig || {};
        Object.assign(window.CipherVaultConfig, optimizations);
        
        console.log('Device optimizations applied:', optimizations);
        return optimizations;
    }
    
    /**
     * حساب حجم القطعة الأمثل
     */
    calculateOptimalChunkSize() {
        const memory = this.features.get('hardware').memory;
        
        if (memory >= 8) return 50 * 1024 * 1024; // 50MB
        if (memory >= 4) return 25 * 1024 * 1024; // 25MB
        if (memory >= 2) return 10 * 1024 * 1024; // 10MB
        return 5 * 1024 * 1024; // 5MB
    }
    
    /**
     * اختبار سرعة المعالجة
     */
    async runPerformanceTest() {
        const testSizes = [1024 * 1024, 10 * 1024 * 1024, 50 * 1024 * 1024]; // 1MB, 10MB, 50MB
        const results = [];
        
        for (const size of testSizes) {
            const startTime = performance.now();
            
            // اختبار التشفير
            const testData = new Uint8Array(size);
            crypto.getRandomValues(testData);
            
            const testKey = new Uint8Array(32);
            crypto.getRandomValues(testKey);
            
            try {
                const cryptoKey = await crypto.subtle.importKey(
                    'raw',
                    testKey,
                    'AES-GCM',
                    false,
                    ['encrypt']
                );
                
                const iv = new Uint8Array(12);
                crypto.getRandomValues(iv);
                
                await crypto.subtle.encrypt(
                    { name: 'AES-GCM', iv: iv },
                    cryptoKey,
                    testData
                );
                
                const endTime = performance.now();
                const duration = endTime - startTime;
                const speed = size / (duration / 1000); // bytes/second
                
                results.push({
                    size: size,
                    duration: duration,
                    speed: speed,
                    speedMB: (speed / (1024 * 1024)).toFixed(2) + ' MB/s'
                });
            } catch (error) {
                console.warn(`Performance test failed for size ${size}:`, error);
            }
        }
        
        return results;
    }
    
    /**
     * تقدير قدرات النظام
     */
    estimateSystemCapabilities() {
        const hardware = this.features.get('hardware');
        const browser = this.features.get('browser');
        
        return {
            maxFileSize: this.calculateMaxFileSize(),
            recommendedSecurityLevel: this.getRecommendedSecurityLevel(),
            estimatedEncryptionSpeed: this.estimateEncryptionSpeed(),
            supportsLargeFiles: hardware.memory >= 4 && !browser.mobile,
            recommendedChunkSize: this.calculateOptimalChunkSize()
        };
    }
    
    /**
     * حساب أقصى حجم للملف
     */
    calculateMaxFileSize() {
        const memory = this.features.get('hardware').memory;
        
        if (memory >= 16) return 10 * 1024 * 1024 * 1024; // 10GB
        if (memory >= 8) return 5 * 1024 * 1024 * 1024; // 5GB
        if (memory >= 4) return 2 * 1024 * 1024 * 1024; // 2GB
        return 1 * 1024 * 1024 * 1024; // 1GB
    }
    
    /**
     * الحصول على مستوى الأمان الموصى به
     */
    getRecommendedSecurityLevel() {
        const hardware = this.features.get('hardware');
        
        if (hardware.memory >= 8 && hardware.cores >= 4) {
            return 'HIGH';
        } else if (hardware.memory >= 4 && hardware.cores >= 2) {
            return 'MEDIUM';
        } else {
            return 'BASIC';
        }
    }
    
    /**
     * تقدير سرعة التشفير
     */
    estimateEncryptionSpeed() {
        const hardware = this.features.get('hardware');
        let baseSpeed = 10 * 1024 * 1024; // 10MB/s أساسي
        
        if (hardware.cores >= 4) baseSpeed *= 2;
        if (hardware.memory >= 8) baseSpeed *= 1.5;
        
        return {
            min: baseSpeed * 0.5,
            avg: baseSpeed,
            max: baseSpeed * 2
        };
    }
}

// Export للاستخدام العام
window.BrowserCompatibility = window.BrowserCompatibility || new BrowserCompatibility();

// Export لأنظمة الوحدات
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BrowserCompatibility;
}
