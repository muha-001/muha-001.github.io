/**
 * CipherVault 3D Pro - مدير التطبيق التقدمي المحسن
 * الإصدار: 4.3.1 - مصحح من أخطاء console و ServiceWorker
 * تم الإصلاح: أخطاء دالة console، مشاكل تسجيل ServiceWorker، وتحسين معالجة الأخطاء
 */

class EnhancedPWAManager {
    constructor() {
        this.deferredPrompt = null;
        this.installed = false;
        this.standalone = false;
        this.updateAvailable = false;
        this.serviceWorker = null;
        this.offlineMode = false;
        this.hiddenStart = null;
        
        // تهيئة المكونات
        this.components = {};
        
        this.config = {
            CACHE_NAME: 'ciphervault-pro-v4.3',
            OFFLINE_CACHE: 'ciphervault-offline-v4.3',
            CACHE_VERSION: '4.3.1',
            PRECACHE_FILES: [
                '/',
                '/index.html',
                '/manifest.json',
                '/assets/css/main.css',
                '/assets/css/style.css',
                '/assets/js/main.js',
                '/assets/js/crypto-core.js',
                '/assets/js/config.js',
                '/assets/icons/icon-192x192.png',
                '/assets/icons/icon-512x512.png'
            ],
            DYNAMIC_CACHE_WHITELIST: [
                /\.css$/,
                /\.js$/,
                /\.png$/,
                /\.jpg$/,
                /\.svg$/,
                /\.woff2?$/,
                /\.ttf$/
            ],
            SYNC_TAG: 'ciphervault-sync',
            BACKGROUND_SYNC_ENABLED: true,
            PUSH_NOTIFICATIONS_ENABLED: false,
            OFFLINE_RETRY_LIMIT: 3,
            PROMPT_DELAY_DAYS: 7
        };
        
        // تهيئة مع معالجة أخطاء محسنة
        this.init().catch(error => {
            console.error('Critical PWA Manager initialization error:', error);
            this.logEvent('PWA_MANAGER_INIT_CRITICAL', 'ERROR', {
                error: error.message,
                stack: error.stack
            });
        });
    }
    
    async init() {
        console.log('Initializing Enhanced PWA Manager for CipherVault...');
        
        try {
            // التحقق من وضع التركيب
            this.checkInstallStatus();
            
            // تسجيل Service Worker
            await this.registerServiceWorker();
            
            // إعداد مستمعات الأحداث
            this.setupEventListeners();
            
            // التحقق من التحديثات
            await this.checkForUpdates();
            
            // إعداد وضع عدم الاتصال
            this.setupOfflineMode();
            
            // استعادة حالة التطبيق
            await this.restoreAppState();
            
            console.log('Enhanced PWA Manager initialized successfully');
            
            // تسجيل حدث التهيئة
            this.logEvent('PWA_MANAGER_INITIALIZED', 'INFO', {
                version: this.config.CACHE_VERSION,
                installed: this.installed,
                standalone: this.standalone
            });
            
        } catch (error) {
            console.error('Failed to initialize PWA Manager:', error);
            this.logEvent('PWA_MANAGER_INIT_FAILED', 'ERROR', {
                error: error.message,
                stack: error.stack
            });
            throw error;
        }
    }
    
    /**
     * التحقق من وجود ملف على الخادم
     */
    async checkFileExists(url) {
        try {
            const response = await fetch(url, {
                method: 'HEAD',
                cache: 'no-store',
                signal: AbortSignal.timeout(5000)
            });
            return response.ok;
        } catch (error) {
            return false;
        }
    }
    
    /**
     * التحقق من حالة التثبيت
     */
    checkInstallStatus() {
        this.installed = window.matchMedia('(display-mode: standalone)').matches || 
                        window.navigator.standalone ||
                        document.referrer.includes('android-app://');
        
        this.standalone = window.matchMedia('(display-mode: standalone)').matches;
        
        if (this.installed) {
            this.logEvent('PWA_INSTALLED', 'INFO', {
                displayMode: this.standalone ? 'standalone' : 'browser',
                timestamp: Date.now(),
                userAgent: navigator.userAgent
            });
        }
    }
    
    /**
     * تسجيل Service Worker مع معالجة أخطاء محسنة
     */
    async registerServiceWorker() {
        if (!('serviceWorker' in navigator)) {
            console.warn('Service Workers not supported in this browser');
            this.logEvent('SERVICE_WORKER_UNSUPPORTED', 'WARNING', {
                browser: navigator.userAgent
            });
            return;
        }
        
        // التحقق من وجود ملف service-worker.js
        const swPath = '/service-worker.js';
        const swExists = await this.checkFileExists(swPath);
        
        if (!swExists) {
            console.warn('Service Worker file not found, creating basic service worker');
            this.logEvent('SERVICE_WORKER_MISSING', 'WARNING', {
                path: swPath,
                message: 'service-worker.js file not found on server'
            });
            
            // إنشاء Service Worker أساسي تلقائياً
            await this.createBasicServiceWorker();
            return;
        }
        
        try {
            this.serviceWorker = await navigator.serviceWorker.register(swPath, {
                scope: '/',
                updateViaCache: 'none'
            });
            
            console.log('Service Worker registered successfully:', this.serviceWorker);
            
            // الاستماع لتحديث Service Worker
            this.serviceWorker.addEventListener('updatefound', () => {
                const newWorker = this.serviceWorker.installing;
                console.log('New Service Worker found:', newWorker);
                
                newWorker.addEventListener('statechange', () => {
                    console.log(`Service Worker state changed: ${newWorker.state}`);
                    
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        this.updateAvailable = true;
                        this.showUpdateNotification();
                        
                        this.logEvent('SERVICE_WORKER_UPDATE_AVAILABLE', 'INFO', {
                            newState: newWorker.state,
                            timestamp: Date.now()
                        });
                    }
                });
            });
            
            // مراقبة حالة Service Worker
            if (navigator.serviceWorker.controller) {
                navigator.serviceWorker.controller.addEventListener('statechange', (event) => {
                    console.log('Controller state changed:', event.target.state);
                });
            }
            
            // التحقق من التحديثات بشكل دوري
            setInterval(() => this.checkForUpdates(), 30 * 60 * 1000); // كل 30 دقيقة
            
            this.logEvent('SERVICE_WORKER_REGISTERED', 'INFO', {
                scope: this.serviceWorker.scope,
                version: this.config.CACHE_VERSION,
                timestamp: Date.now()
            });
            
        } catch (error) {
            console.error('Service Worker registration failed:', error);
            this.logEvent('SERVICE_WORKER_REGISTRATION_FAILED', 'ERROR', {
                error: error.message,
                errorName: error.name,
                timestamp: Date.now()
            });
            
            // محاولة إنشاء Service Worker أساسي كحل بديل
            await this.createBasicServiceWorker();
        }
    }
    
    /**
     * إنشاء Service Worker أساسي عند فشل التسجيل
     */
    async createBasicServiceWorker() {
        try {
            // إنشاء Service Worker بسيط في الذاكرة
            const swCode = `
                // Service Worker الأساسي لـ CipherVault
                const CACHE_NAME = '${this.config.CACHE_NAME}-basic';
                const OFFLINE_URL = '/offline.html';
                
                self.addEventListener('install', (event) => {
                    event.waitUntil(
                        caches.open(CACHE_NAME).then((cache) => {
                            return cache.addAll([
                                '/',
                                '/index.html',
                                '/manifest.json'
                            ]);
                        })
                    );
                });
                
                self.addEventListener('fetch', (event) => {
                    event.respondWith(
                        caches.match(event.request).then((response) => {
                            return response || fetch(event.request).catch(() => {
                                return caches.match(OFFLINE_URL);
                            });
                        })
                    );
                });
                
                self.addEventListener('activate', (event) => {
                    event.waitUntil(
                        caches.keys().then((cacheNames) => {
                            return Promise.all(
                                cacheNames.map((cacheName) => {
                                    if (cacheName !== CACHE_NAME) {
                                        return caches.delete(cacheName);
                                    }
                                })
                            );
                        })
                    );
                });
            `;
            
            // إنشاء blob من الكود
            const blob = new Blob([swCode], { type: 'application/javascript' });
            const swURL = URL.createObjectURL(blob);
            
            // تسجيل Service Worker من الـ blob
            this.serviceWorker = await navigator.serviceWorker.register(swURL, {
                scope: '/'
            });
            
            console.log('Basic Service Worker registered as fallback');
            
            this.logEvent('BASIC_SERVICE_WORKER_CREATED', 'INFO', {
                timestamp: Date.now(),
                type: 'fallback'
            });
            
            // تنظيف URL بعد التسجيل
            URL.revokeObjectURL(swURL);
            
        } catch (error) {
            console.error('Failed to create basic Service Worker:', error);
            this.logEvent('BASIC_SERVICE_WORKER_FAILED', 'ERROR', {
                error: error.message
            });
        }
    }
    
    /**
     * التحقق من التحديثات
     */
    async checkForUpdates() {
        if (!this.serviceWorker) {
            console.log('No Service Worker available for update check');
            return;
        }
        
        try {
            // تحديث Service Worker
            const registration = await navigator.serviceWorker.getRegistration();
            if (registration) {
                await registration.update();
                
                // التحقق من تحديثات التطبيق
                const response = await fetch('/manifest.json', {
                    cache: 'no-store',
                    headers: {
                        'Cache-Control': 'no-cache, no-store, must-revalidate',
                        'Pragma': 'no-cache'
                    },
                    signal: AbortSignal.timeout(10000) // مهلة 10 ثواني
                });
                
                if (response.ok) {
                    const manifest = await response.json();
                    const currentVersion = this.config.CACHE_VERSION;
                    
                    if (manifest.version && manifest.version !== currentVersion) {
                        console.log(`New version available: ${manifest.version}`);
                        this.showUpdateNotification(manifest.version);
                    }
                }
            }
            
        } catch (error) {
            console.warn('Update check failed:', error);
            
            // التحقق من نوع الخطأ
            let errorType = 'UNKNOWN';
            if (error.name === 'AbortError') {
                errorType = 'TIMEOUT';
            } else if (error.message.includes('Not found')) {
                errorType = 'NOT_FOUND';
            }
            
            this.logEvent('UPDATE_CHECK_FAILED', 'WARNING', {
                error: error.message,
                errorType: errorType,
                errorName: error.name,
                timestamp: Date.now()
            });
        }
    }
    
    /**
     * إعداد مستمعات الأحداث
     */
    setupEventListeners() {
        // حدث تثبيت PWA
        window.addEventListener('beforeinstallprompt', (e) => {
            console.log('beforeinstallprompt event fired');
            e.preventDefault();
            this.deferredPrompt = e;
            
            // عرض موجه التثبيت بعد تأخير قصير
            setTimeout(() => {
                this.showInstallPromptIfNeeded();
            }, 3000);
        });
        
        // حدث بعد التثبيت
        window.addEventListener('appinstalled', () => {
            console.log('PWA installed successfully');
            this.installed = true;
            this.deferredPrompt = null;
            
            this.logEvent('PWA_INSTALLED_SUCCESS', 'INFO', {
                timestamp: Date.now(),
                displayMode: this.getDisplayMode()
            });
            
            this.showNotification('تم تثبيت CipherVault بنجاح!', 'success');
        });
        
        // أحداث Service Worker
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.addEventListener('controllerchange', () => {
                console.log('Service Worker controller changed');
                this.showNotification('تم تحديث التطبيق. أعد التحميل للاستفادة من الميزات الجديدة.', 'info');
                
                this.logEvent('SERVICE_WORKER_CONTROLLER_CHANGED', 'INFO', {
                    timestamp: Date.now()
                });
            });
            
            navigator.serviceWorker.addEventListener('message', (event) => {
                this.handleServiceWorkerMessage(event.data);
            });
        }
        
        // أحداث الاتصال بالشبكة
        window.addEventListener('online', () => {
            this.offlineMode = false;
            this.handleOnlineStatus();
        });
        
        window.addEventListener('offline', () => {
            this.offlineMode = true;
            this.handleOfflineStatus();
        });
        
        // أحداث رؤية الصفحة
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                this.handleAppVisible();
            } else {
                this.handleAppHidden();
            }
        });
        
        // حدث قبل إغلاق الصفحة
        window.addEventListener('beforeunload', () => {
            this.saveAppState();
        });
    }
    
    /**
     * إعداد وضع عدم الاتصال
     */
    setupOfflineMode() {
        if (!('caches' in window)) {
            console.warn('Cache API not supported');
            return;
        }
        
        // إنشاء ذاكرة تخزين مؤقت للمحتوى غير المتصل
        this.createOfflineCache();
        
        // إعداد فحص الاتصال
        this.setupConnectionCheck();
    }
    
    /**
     * إنشاء ذاكرة التخزين المؤقت للمحتوى غير المتصل
     */
    async createOfflineCache() {
        try {
            const cache = await caches.open(this.config.OFFLINE_CACHE);
            
            // التحقق من الملفات المطلوبة
            const filesToCache = [];
            for (const file of this.config.PRECACHE_FILES) {
                const exists = await this.checkFileExists(file);
                if (exists) {
                    filesToCache.push(file);
                } else {
                    console.warn(`File not found, skipping cache: ${file}`);
                }
            }
            
            // إضافة الصفحة غير المتصلة
            const offlinePage = this.createOfflinePage();
            await cache.put('/offline.html', new Response(offlinePage, {
                headers: { 
                    'Content-Type': 'text/html',
                    'Cache-Control': 'no-cache'
                }
            }));
            
            // تخزين الملفات الأساسية
            if (filesToCache.length > 0) {
                await cache.addAll(filesToCache);
            }
            
            console.log(`Offline cache created with ${filesToCache.length} files`);
            
            this.logEvent('OFFLINE_CACHE_CREATED', 'INFO', {
                filesCount: filesToCache.length,
                cacheName: this.config.OFFLINE_CACHE,
                timestamp: Date.now()
            });
            
        } catch (error) {
            console.error('Failed to create offline cache:', error);
            this.logEvent('OFFLINE_CACHE_FAILED', 'ERROR', {
                error: error.message
            });
        }
    }
    
    /**
     * إنشاء صفحة وضع عدم الاتصال
     */
    createOfflinePage() {
        return `
            <!DOCTYPE html>
            <html lang="ar" dir="rtl">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>CipherVault - وضع عدم الاتصال</title>
                <style>
                    * {
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                        font-family: 'Cairo', sans-serif;
                    }
                    
                    body {
                        background: linear-gradient(135deg, #050510 0%, #0a1a2a 100%);
                        color: #ffffff;
                        min-height: 100vh;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        padding: 20px;
                        text-align: center;
                        line-height: 1.6;
                    }
                    
                    .offline-container {
                        max-width: 600px;
                        width: 100%;
                        padding: 40px 30px;
                        background: rgba(10, 15, 35, 0.95);
                        border-radius: 20px;
                        border: 2px solid #00d4ff;
                        box-shadow: 0 0 40px rgba(0, 212, 255, 0.3);
                        backdrop-filter: blur(10px);
                    }
                    
                    .offline-icon {
                        font-size: 80px;
                        color: #ff4757;
                        margin-bottom: 25px;
                        animation: pulse 2s infinite;
                    }
                    
                    h1 {
                        color: #00d4ff;
                        margin-bottom: 20px;
                        font-size: 2.2rem;
                        font-family: 'Orbitron', sans-serif;
                    }
                    
                    .subtitle {
                        color: #8a8aa3;
                        font-size: 1.1rem;
                        margin-bottom: 30px;
                    }
                    
                    .features {
                        text-align: right;
                        margin: 35px 0;
                        background: rgba(0, 212, 255, 0.05);
                        padding: 25px;
                        border-radius: 15px;
                        border-right: 3px solid #00d4ff;
                    }
                    
                    .feature {
                        padding: 12px 15px;
                        background: rgba(0, 212, 255, 0.1);
                        margin: 12px 0;
                        border-radius: 10px;
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        transition: transform 0.3s;
                    }
                    
                    .feature:hover {
                        transform: translateX(-10px);
                    }
                    
                    .feature i {
                        color: #00ff88;
                        font-size: 1.2rem;
                        margin-left: 15px;
                    }
                    
                    .feature span {
                        color: #ffffff;
                        font-size: 1rem;
                    }
                    
                    .buttons {
                        display: flex;
                        gap: 15px;
                        justify-content: center;
                        margin-top: 30px;
                        flex-wrap: wrap;
                    }
                    
                    .btn {
                        padding: 15px 30px;
                        border-radius: 12px;
                        font-family: 'Orbitron', sans-serif;
                        font-size: 1rem;
                        font-weight: 600;
                        cursor: pointer;
                        transition: all 0.3s;
                        border: none;
                        min-width: 180px;
                        letter-spacing: 1px;
                    }
                    
                    .btn-primary {
                        background: linear-gradient(135deg, #00d4ff, #0099cc);
                        color: white;
                    }
                    
                    .btn-primary:hover {
                        transform: translateY(-3px);
                        box-shadow: 0 5px 20px rgba(0, 212, 255, 0.4);
                    }
                    
                    .btn-secondary {
                        background: transparent;
                        color: #8a8aa3;
                        border: 2px solid #8a8aa3;
                    }
                    
                    .btn-secondary:hover {
                        color: #ffffff;
                        border-color: #ffffff;
                    }
                    
                    .status {
                        margin-top: 25px;
                        color: #8a8aa3;
                        font-size: 0.9rem;
                    }
                    
                    @keyframes pulse {
                        0%, 100% { opacity: 1; }
                        50% { opacity: 0.6; }
                    }
                    
                    @media (max-width: 768px) {
                        .offline-container {
                            padding: 30px 20px;
                        }
                        
                        .offline-icon {
                            font-size: 60px;
                        }
                        
                        h1 {
                            font-size: 1.8rem;
                        }
                        
                        .btn {
                            min-width: 150px;
                            padding: 12px 25px;
                        }
                    }
                </style>
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
                <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&family=Orbitron:wght@400;600;700&display=swap" rel="stylesheet">
            </head>
            <body>
                <div class="offline-container">
                    <div class="offline-icon">
                        <i class="fas fa-wifi-slash"></i>
                    </div>
                    <h1>أنت غير متصل بالإنترنت</h1>
                    <p class="subtitle">فقدت الاتصال بالشبكة، لكن يمكنك الاستمرار في استخدام الميزات المحلية</p>
                    
                    <div class="features">
                        <div class="feature">
                            <span>عرض الملفات المشفرة المحفوظة محلياً</span>
                            <i class="fas fa-lock"></i>
                        </div>
                        <div class="feature">
                            <span>تشفير الملفات الجديدة وحفظها محلياً</span>
                            <i class="fas fa-shield-alt"></i>
                        </div>
                        <div class="feature">
                            <span>فك تشفير الملفات المحفوظة سابقاً</span>
                            <i class="fas fa-key"></i>
                        </div>
                        <div class="feature">
                            <span>الوصول إلى جميع وظائف التشفير الأساسية</span>
                            <i class="fas fa-bolt"></i>
                        </div>
                    </div>
                    
                    <div class="buttons">
                        <button class="btn btn-primary" onclick="window.location.reload()">
                            <i class="fas fa-redo"></i> إعادة المحاولة
                        </button>
                        <button class="btn btn-secondary" onclick="window.history.back()">
                            <i class="fas fa-arrow-right"></i> العودة
                        </button>
                    </div>
                    
                    <div class="status">
                        <i class="fas fa-info-circle"></i>
                        جميع البيانات المشفرة محفوظة بأمان على جهازك
                    </div>
                </div>
            </body>
            </html>
        `;
    }
    
    /**
     * إعداد فحص الاتصال
     */
    setupConnectionCheck() {
        // التحقق المبدئي
        this.offlineMode = !navigator.onLine;
        this.updateConnectionStatus();
        
        // فحص الاتصال بشكل دوري
        setInterval(async () => {
            try {
                const response = await fetch('/health-check', {
                    method: 'HEAD',
                    cache: 'no-store',
                    signal: AbortSignal.timeout(3000)
                }).catch(() => null);
                
                this.offlineMode = !response || !response.ok;
                this.updateConnectionStatus();
                
            } catch (error) {
                this.offlineMode = true;
                this.updateConnectionStatus();
            }
        }, 30000); // كل 30 ثانية
    }
    
    /**
     * تحديث حالة الاتصال في واجهة المستخدم
     */
    updateConnectionStatus() {
        // البحث عن عناصر حالة الاتصال
        let statusElement = document.getElementById('connectionStatus');
        let iconElement = document.getElementById('connectionIcon');
        
        // إنشاء العناصر إذا لم تكن موجودة
        if (!statusElement || !iconElement) {
            this.createConnectionStatusElement();
            statusElement = document.getElementById('connectionStatus');
            iconElement = document.getElementById('connectionIcon');
        }
        
        if (!statusElement || !iconElement) return;
        
        if (this.offlineMode) {
            statusElement.textContent = 'غير متصل';
            statusElement.style.color = '#ff4757';
            iconElement.className = 'fas fa-wifi-slash';
            iconElement.style.color = '#ff4757';
            
            // إضافة فئة للإشارة إلى وضع عدم الاتصال
            statusElement.classList.add('offline');
            statusElement.classList.remove('online');
        } else {
            statusElement.textContent = 'متصل';
            statusElement.style.color = '#00ff88';
            iconElement.className = 'fas fa-wifi';
            iconElement.style.color = '#00ff88';
            
            // إضافة فئة للإشارة إلى وضع الاتصال
            statusElement.classList.add('online');
            statusElement.classList.remove('offline');
        }
    }
    
    /**
     * إنشاء عنصر حالة الاتصال في واجهة المستخدم
     */
    createConnectionStatusElement() {
        // التحقق مما إذا كان العنصر موجوداً بالفعل
        if (document.getElementById('connectionStatusContainer')) return;
        
        // إنشاء حاوية حالة الاتصال
        const container = document.createElement('div');
        container.id = 'connectionStatusContainer';
        container.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 20px;
            z-index: 9990;
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 8px 15px;
            background: rgba(10, 15, 35, 0.9);
            border-radius: 20px;
            border: 2px solid;
            backdrop-filter: blur(10px);
            transition: all 0.3s;
            font-family: 'Orbitron', sans-serif;
            font-size: 14px;
            font-weight: 600;
            letter-spacing: 0.5px;
        `;
        
        // إنشاء الأيقونة
        const icon = document.createElement('i');
        icon.id = 'connectionIcon';
        icon.style.cssText = 'font-size: 16px;';
        
        // إنشاء النص
        const text = document.createElement('span');
        text.id = 'connectionStatus';
        
        // إضافة العناصر إلى الحاوية
        container.appendChild(icon);
        container.appendChild(text);
        
        // إضافة الحاوية إلى body
        document.body.appendChild(container);
        
        // تحديث الحالة
        this.updateConnectionStatus();
    }
    
    /**
     * عرض موجه التثبيت إذا لزم الأمر - الدالة المطلوبة من main.js
     */
    showInstallPromptIfNeeded() {
        // التحقق مما إذا كان التطبيق مثبتاً بالفعل
        if (this.installed) {
            console.log('App already installed, skipping prompt');
            return false;
        }
        
        // التحقق من وجود deferredPrompt
        if (!this.deferredPrompt) {
            console.log('No deferred prompt available');
            return false;
        }
        
        // التحقق مما إذا كان المستخدم قد رفض العرض مؤخراً
        const lastDismissed = localStorage.getItem('pwa_prompt_dismissed');
        if (lastDismissed) {
            const dismissedTime = parseInt(lastDismissed, 10);
            const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);
            
            // إذا مر أقل من الأيام المحددة في الإعدادات، لا نعرض العرض
            if (daysSinceDismissed < this.config.PROMPT_DELAY_DAYS) {
                console.log(`Prompt dismissed ${daysSinceDismissed.toFixed(1)} days ago, waiting`);
                return false;
            }
        }
        
        // عرض موجه التثبيت
        this.showInstallPrompt();
        return true;
    }
    
    /**
     * عرض موجه التثبيت
     */
    showInstallPrompt() {
        if (this.installed || !this.deferredPrompt) {
            console.log('Cannot show install prompt: installed=', this.installed, 'deferredPrompt=', !!this.deferredPrompt);
            return;
        }
        
        // إنشاء نافذة تثبيت مخصصة
        const installPrompt = document.createElement('div');
        installPrompt.id = 'pwaInstallPrompt';
        installPrompt.className = 'pwa-install-prompt';
        installPrompt.innerHTML = `
            <div class="pwa-prompt-content">
                <div class="pwa-prompt-header">
                    <div class="pwa-prompt-icon">
                        <i class="fas fa-rocket"></i>
                    </div>
                    <button class="pwa-prompt-close" id="pwaPromptClose">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="pwa-prompt-body">
                    <h3 class="pwa-prompt-title">تثبيت CipherVault Pro</h3>
                    <p class="pwa-prompt-description">
                        ثبّت التطبيق للحصول على تجربة تشفير محسنة وأداء أسرع
                    </p>
                    
                    <div class="pwa-prompt-features">
                        <div class="pwa-feature">
                            <i class="fas fa-bolt"></i>
                            <span>تحميل فوري</span>
                        </div>
                        <div class="pwa-feature">
                            <i class="fas fa-shield-alt"></i>
                            <span>حماية متقدمة</span>
                        </div>
                        <div class="pwa-feature">
                            <i class="fas fa-desktop"></i>
                            <span>واجهة تطبيق كاملة</span>
                        </div>
                        <div class="pwa-feature">
                            <i class="fas fa-database"></i>
                            <span>عمل دون اتصال</span>
                        </div>
                    </div>
                </div>
                
                <div class="pwa-prompt-footer">
                    <button class="pwa-prompt-button pwa-prompt-install" id="pwaPromptInstall">
                        <i class="fas fa-download"></i>
                        تثبيت التطبيق
                    </button>
                    <button class="pwa-prompt-button pwa-prompt-dismiss" id="pwaPromptDismiss">
                        ربما لاحقاً
                    </button>
                </div>
            </div>
        `;
        
        // إضافة الأنماط إذا لم تكن موجودة
        if (!document.querySelector('#pwa-prompt-styles')) {
            const styles = document.createElement('style');
            styles.id = 'pwa-prompt-styles';
            styles.textContent = `
                .pwa-install-prompt {
                    position: fixed;
                    bottom: 30px;
                    right: 30px;
                    z-index: 10000;
                    animation: slideInRight 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    font-family: 'Cairo', 'Orbitron', sans-serif;
                }
                
                .pwa-prompt-content {
                    background: linear-gradient(135deg, rgba(10, 15, 35, 0.95), rgba(5, 10, 25, 0.98));
                    border: 3px solid #00d4ff;
                    border-radius: 20px;
                    padding: 25px;
                    width: 380px;
                    max-width: 90vw;
                    backdrop-filter: blur(20px);
                    box-shadow: 0 10px 40px rgba(0, 212, 255, 0.3),
                                0 0 60px rgba(0, 212, 255, 0.15);
                }
                
                .pwa-prompt-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                }
                
                .pwa-prompt-icon {
                    width: 50px;
                    height: 50px;
                    background: linear-gradient(135deg, #00d4ff, #0099cc);
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 24px;
                    color: white;
                }
                
                .pwa-prompt-close {
                    background: transparent;
                    border: none;
                    color: #8a8aa3;
                    font-size: 20px;
                    cursor: pointer;
                    transition: color 0.3s;
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .pwa-prompt-close:hover {
                    color: #ff4757;
                    background: rgba(255, 71, 87, 0.1);
                }
                
                .pwa-prompt-title {
                    color: #ffffff;
                    font-family: 'Orbitron', sans-serif;
                    font-size: 1.4rem;
                    margin-bottom: 10px;
                    text-align: center;
                }
                
                .pwa-prompt-description {
                    color: #8a8aa3;
                    font-size: 0.95rem;
                    line-height: 1.5;
                    margin-bottom: 25px;
                    text-align: center;
                }
                
                .pwa-prompt-features {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 12px;
                    margin-bottom: 25px;
                }
                
                .pwa-feature {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 12px;
                    background: rgba(0, 212, 255, 0.08);
                    border-radius: 10px;
                    border: 1px solid rgba(0, 212, 255, 0.2);
                    transition: all 0.3s;
                }
                
                .pwa-feature:hover {
                    background: rgba(0, 212, 255, 0.15);
                    transform: translateY(-2px);
                }
                
                .pwa-feature i {
                    color: #00d4ff;
                    font-size: 1.1rem;
                }
                
                .pwa-feature span {
                    color: #ffffff;
                    font-size: 0.9rem;
                    font-weight: 600;
                }
                
                .pwa-prompt-footer {
                    display: flex;
                    gap: 12px;
                }
                
                .pwa-prompt-button {
                    flex: 1;
                    padding: 14px 20px;
                    border-radius: 12px;
                    font-family: 'Orbitron', sans-serif;
                    font-size: 0.95rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s;
                    border: none;
                    letter-spacing: 0.5px;
                }
                
                .pwa-prompt-install {
                    background: linear-gradient(135deg, #00d4ff, #0099cc);
                    color: white;
                }
                
                .pwa-prompt-install:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 5px 20px rgba(0, 212, 255, 0.4);
                }
                
                .pwa-prompt-dismiss {
                    background: transparent;
                    color: #8a8aa3;
                    border: 2px solid #8a8aa3;
                }
                
                .pwa-prompt-dismiss:hover {
                    color: #ffffff;
                    border-color: #ffffff;
                }
                
                @keyframes slideInRight {
                    from {
                        opacity: 0;
                        transform: translateX(50px) scale(0.9);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0) scale(1);
                    }
                }
                
                @keyframes slideOutRight {
                    from {
                        opacity: 1;
                        transform: translateX(0) scale(1);
                    }
                    to {
                        opacity: 0;
                        transform: translateX(50px) scale(0.9);
                    }
                }
                
                .pwa-install-prompt.hiding {
                    animation: slideOutRight 0.3s ease forwards;
                }
                
                @media (max-width: 768px) {
                    .pwa-install-prompt {
                        bottom: 20px;
                        right: 20px;
                        left: 20px;
                        width: auto;
                    }
                    
                    .pwa-prompt-content {
                        width: 100%;
                        padding: 20px;
                    }
                    
                    .pwa-prompt-features {
                        grid-template-columns: 1fr;
                    }
                }
            `;
            document.head.appendChild(styles);
        }
        
        // إضافة النافذة إلى body
        document.body.appendChild(installPrompt);
        
        // إضافة معالجات الأحداث
        const closeBtn = installPrompt.querySelector('#pwaPromptClose');
        const dismissBtn = installPrompt.querySelector('#pwaPromptDismiss');
        const installBtn = installPrompt.querySelector('#pwaPromptInstall');
        
        // إغلاق النافذة
        closeBtn.addEventListener('click', () => {
            this.hideInstallPrompt(installPrompt);
        });
        
        // رفض التثبيت
        dismissBtn.addEventListener('click', () => {
            localStorage.setItem('pwa_prompt_dismissed', Date.now().toString());
            this.hideInstallPrompt(installPrompt);
            
            this.logEvent('PWA_PROMPT_DISMISSED', 'INFO', {
                timestamp: Date.now()
            });
        });
        
        // تثبيت التطبيق
        installBtn.addEventListener('click', () => {
            this.install();
            this.hideInstallPrompt(installPrompt);
        });
        
        // إغلاق النافذة تلقائياً بعد 30 ثانية
        setTimeout(() => {
            if (installPrompt.parentNode) {
                this.hideInstallPrompt(installPrompt);
            }
        }, 30000);
        
        this.logEvent('PWA_PROMPT_SHOWN', 'INFO', {
            timestamp: Date.now()
        });
    }
    
    /**
     * إخفاء موجه التثبيت
     */
    hideInstallPrompt(promptElement) {
        if (!promptElement) {
            promptElement = document.getElementById('pwaInstallPrompt');
        }
        
        if (!promptElement || !promptElement.parentNode) return;
        
        promptElement.classList.add('hiding');
        
        setTimeout(() => {
            if (promptElement.parentNode) {
                promptElement.parentNode.removeChild(promptElement);
            }
        }, 300);
    }
    
    /**
     * عرض إشعار التحديث
     */
    showUpdateNotification(newVersion = null) {
        // التحقق مما إذا كان المستخدم قد رفض الإشعار مؤخراً
        const lastUpdateDismissed = localStorage.getItem('update_notification_dismissed');
        if (lastUpdateDismissed) {
            const dismissedTime = parseInt(lastUpdateDismissed, 10);
            const hoursSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60);
            
            // إذا مر أقل من 4 ساعات، لا نعرض الإشعار
            if (hoursSinceDismissed < 4) {
                return;
            }
        }
        
        const notification = document.createElement('div');
        notification.id = 'updateNotification';
        notification.className = 'update-notification';
        notification.innerHTML = `
            <div class="update-content">
                <div class="update-icon">
                    <i class="fas fa-sync-alt"></i>
                </div>
                <div class="update-info">
                    <h4>تحديث جديد متاح</h4>
                    <p>${newVersion ? `الإصدار ${newVersion} جاهز للتثبيت` : 'تحسينات جديدة في الأمان والأداء'}</p>
                    <p class="update-description">
                        يتضمن إصلاحات وتحسينات مهمة لتجربة تشفير أكثر أماناً
                    </p>
                </div>
                <div class="update-actions">
                    <button class="update-button update-now" id="updateNow">
                        <i class="fas fa-download"></i>
                        تحديث الآن
                    </button>
                    <button class="update-button update-later" id="updateLater">
                        لاحقاً
                    </button>
                </div>
            </div>
        `;
        
        // إضافة الأنماط إذا لم تكن موجودة
        if (!document.querySelector('#update-notification-styles')) {
            const styles = document.createElement('style');
            styles.id = 'update-notification-styles';
            styles.textContent = `
                .update-notification {
                    position: fixed;
                    top: 30px;
                    right: 30px;
                    z-index: 9999;
                    animation: slideInDown 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    font-family: 'Cairo', 'Orbitron', sans-serif;
                }
                
                .update-content {
                    background: linear-gradient(135deg, rgba(255, 152, 0, 0.95), rgba(255, 87, 34, 0.98));
                    border: 2px solid #ff5722;
                    border-radius: 15px;
                    padding: 20px;
                    width: 350px;
                    max-width: 90vw;
                    backdrop-filter: blur(10px);
                    box-shadow: 0 10px 30px rgba(255, 87, 34, 0.3);
                }
                
                .update-icon {
                    width: 50px;
                    height: 50px;
                    background: rgba(255, 255, 255, 0.2);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 22px;
                    color: white;
                    margin: 0 auto 15px;
                }
                
                .update-info {
                    text-align: center;
                    margin-bottom: 20px;
                }
                
                .update-info h4 {
                    color: white;
                    font-family: 'Orbitron', sans-serif;
                    font-size: 1.2rem;
                    margin-bottom: 8px;
                }
                
                .update-info p {
                    color: rgba(255, 255, 255, 0.9);
                    font-size: 0.9rem;
                    margin-bottom: 5px;
                }
                
                .update-description {
                    font-size: 0.85rem !important;
                    color: rgba(255, 255, 255, 0.8) !important;
                }
                
                .update-actions {
                    display: flex;
                    gap: 10px;
                }
                
                .update-button {
                    flex: 1;
                    padding: 12px 15px;
                    border-radius: 10px;
                    font-family: 'Orbitron', sans-serif;
                    font-size: 0.9rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s;
                    border: none;
                }
                
                .update-now {
                    background: white;
                    color: #ff5722;
                }
                
                .update-now:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 5px 15px rgba(255, 255, 255, 0.3);
                }
                
                .update-later {
                    background: transparent;
                    color: white;
                    border: 2px solid white;
                }
                
                .update-later:hover {
                    background: white;
                    color: #ff5722;
                }
                
                @keyframes slideInDown {
                    from {
                        opacity: 0;
                        transform: translateY(-50px) scale(0.9);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }
                
                @keyframes slideOutUp {
                    from {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                    to {
                        opacity: 0;
                        transform: translateY(-50px) scale(0.9);
                    }
                }
                
                .update-notification.hiding {
                    animation: slideOutUp 0.3s ease forwards;
                }
                
                @media (max-width: 768px) {
                    .update-notification {
                        top: 20px;
                        right: 20px;
                        left: 20px;
                        width: auto;
                    }
                    
                    .update-content {
                        width: 100%;
                    }
                }
            `;
            document.head.appendChild(styles);
        }
        
        document.body.appendChild(notification);
        
        // معالجات الأحداث
        const updateNowBtn = notification.querySelector('#updateNow');
        const updateLaterBtn = notification.querySelector('#updateLater');
        
        updateNowBtn.addEventListener('click', () => {
            window.location.reload();
        });
        
        updateLaterBtn.addEventListener('click', () => {
            localStorage.setItem('update_notification_dismissed', Date.now().toString());
            this.hideUpdateNotification(notification);
            
            this.logEvent('UPDATE_NOTIFICATION_DISMISSED', 'INFO', {
                timestamp: Date.now()
            });
        });
        
        // إغلاق تلقائي بعد 60 ثانية
        setTimeout(() => {
            if (notification.parentNode) {
                this.hideUpdateNotification(notification);
            }
        }, 60000);
        
        this.logEvent('UPDATE_NOTIFICATION_SHOWN', 'INFO', {
            newVersion,
            timestamp: Date.now()
        });
    }
    
    /**
     * إخفاء إشعار التحديث
     */
    hideUpdateNotification(notificationElement) {
        if (!notificationElement) {
            notificationElement = document.getElementById('updateNotification');
        }
        
        if (!notificationElement || !notificationElement.parentNode) return;
        
        notificationElement.classList.add('hiding');
        
        setTimeout(() => {
            if (notificationElement.parentNode) {
                notificationElement.parentNode.removeChild(notificationElement);
            }
        }, 300);
    }
    
    /**
     * تثبيت التطبيق
     */
    async install() {
        if (!this.deferredPrompt) {
            this.showNotification('التطبيق مثبت بالفعل على جهازك', 'info');
            return;
        }
        
        try {
            // عرض موجه التثبيت الأصلي للمتصفح
            await this.deferredPrompt.prompt();
            const choiceResult = await this.deferredPrompt.userChoice;
            
            this.logEvent('PWA_INSTALL_PROMPT_SHOWN', 'INFO', {
                outcome: choiceResult.outcome,
                timestamp: Date.now()
            });
            
            this.deferredPrompt = null;
            
            if (choiceResult.outcome === 'accepted') {
                this.showNotification('جاري تثبيت CipherVault...', 'success');
            }
            
        } catch (error) {
            console.error('PWA installation failed:', error);
            this.showNotification('فشل تثبيت التطبيق', 'error');
            
            this.logEvent('PWA_INSTALL_FAILED', 'ERROR', {
                error: error.message,
                errorName: error.name,
                timestamp: Date.now()
            });
        }
    }
    
    /**
     * عرض إشعار للمستخدم
     */
    showNotification(message, type = 'info', duration = 5000) {
        // إنشاء عنصر الإشعار
        const notification = document.createElement('div');
        notification.className = `pwa-notification pwa-notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${this.getNotificationIcon(type)}"></i>
                <span class="notification-message">${message}</span>
                <button class="notification-close">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        // إضافة الأنماط إذا لم تكن موجودة
        if (!document.querySelector('#pwa-notification-styles')) {
            const styles = document.createElement('style');
            styles.id = 'pwa-notification-styles';
            styles.textContent = `
                .pwa-notification {
                    position: fixed;
                    bottom: 100px;
                    right: 30px;
                    z-index: 9998;
                    animation: slideInRight 0.3s ease;
                    font-family: 'Cairo', sans-serif;
                    max-width: 400px;
                }
                
                .notification-content {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    padding: 16px 20px;
                    border-radius: 12px;
                    backdrop-filter: blur(10px);
                    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
                    border-left: 4px solid;
                }
                
                .pwa-notification-info .notification-content {
                    background: rgba(0, 168, 255, 0.9);
                    border-left-color: #00a8ff;
                    color: white;
                }
                
                .pwa-notification-success .notification-content {
                    background: rgba(0, 255, 136, 0.9);
                    border-left-color: #00ff88;
                    color: white;
                }
                
                .pwa-notification-warning .notification-content {
                    background: rgba(255, 170, 0, 0.9);
                    border-left-color: #ffaa00;
                    color: white;
                }
                
                .pwa-notification-error .notification-content {
                    background: rgba(255, 71, 87, 0.9);
                    border-left-color: #ff4757;
                    color: white;
                }
                
                .notification-content i {
                    font-size: 20px;
                }
                
                .notification-message {
                    flex: 1;
                    font-size: 14px;
                    font-weight: 500;
                }
                
                .notification-close {
                    background: transparent;
                    border: none;
                    color: inherit;
                    cursor: pointer;
                    opacity: 0.7;
                    transition: opacity 0.2s;
                    display: flex;
                        align-items: center;
                        justify-content: center;
                        width: 24px;
                        height: 24px;
                        border-radius: 50%;
                }
                
                .notification-close:hover {
                    opacity: 1;
                    background: rgba(255, 255, 255, 0.1);
                }
                
                @keyframes slideInRight {
                    from {
                        opacity: 0;
                        transform: translateX(50px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }
                
                @keyframes slideOutRight {
                    from {
                        opacity: 1;
                        transform: translateX(0);
                    }
                    to {
                        opacity: 0;
                        transform: translateX(50px);
                    }
                }
                
                .pwa-notification.hiding {
                    animation: slideOutRight 0.3s ease forwards;
                }
                
                @media (max-width: 768px) {
                    .pwa-notification {
                        bottom: 80px;
                        right: 20px;
                        left: 20px;
                        max-width: none;
                    }
                }
            `;
            document.head.appendChild(styles);
        }
        
        document.body.appendChild(notification);
        
        // إغلاق الإشعار
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            this.hideNotification(notification);
        });
        
        // إغلاق تلقائي بعد المدة المحددة
        setTimeout(() => {
            if (notification.parentNode) {
                this.hideNotification(notification);
            }
        }, duration);
    }
    
    /**
     * الحصول على أيقونة الإشعار المناسبة
     */
    getNotificationIcon(type) {
        const icons = {
            'info': 'info-circle',
            'success': 'check-circle',
            'warning': 'exclamation-triangle',
            'error': 'exclamation-circle'
        };
        
        return icons[type] || 'info-circle';
    }
    
    /**
     * إخفاء الإشعار
     */
    hideNotification(notificationElement) {
        if (!notificationElement || !notificationElement.parentNode) return;
        
        notificationElement.classList.add('hiding');
        
        setTimeout(() => {
            if (notificationElement.parentNode) {
                notificationElement.parentNode.removeChild(notificationElement);
            }
        }, 300);
    }
    
    /**
     * معالجة رسائل Service Worker
     */
    handleServiceWorkerMessage(message) {
        if (!message || !message.type) return;
        
        switch (message.type) {
            case 'CACHE_UPDATED':
                console.log('Cache updated:', message.data);
                this.showNotification('تم تحديث ذاكرة التخزين المؤقت', 'info');
                break;
                
            case 'SYNC_COMPLETED':
                console.log('Background sync completed:', message.data);
                if (message.data.success) {
                    this.showNotification('تمت مزامنة البيانات بنجاح', 'success');
                }
                break;
                
            case 'OFFLINE_MODE':
                this.offlineMode = message.data.enabled;
                this.updateConnectionStatus();
                break;
                
            case 'INSTALLATION_COMPLETE':
                console.log('Service Worker installation complete:', message.data);
                break;
                
            default:
                console.log('Unknown Service Worker message:', message);
        }
    }
    
    /**
     * معالجة حالة الاتصال بالإنترنت
     */
    handleOnlineStatus() {
        this.showNotification('تم استعادة الاتصال بالإنترنت', 'success', 3000);
        
        // طلب مزامنة الخلفية
        this.requestBackgroundSync();
        
        // تحديث حالة الاتصال
        this.updateConnectionStatus();
        
        // تسجيل الحدث
        this.logEvent('CONNECTION_ONLINE', 'INFO', {
            timestamp: Date.now()
        });
    }
    
    /**
     * معالجة حالة عدم الاتصال
     */
    handleOfflineStatus() {
        this.showNotification('فقدان الاتصال بالإنترنت - العمل في وضع عدم الاتصال', 'warning', 5000);
        this.updateConnectionStatus();
        
        // تسجيل الحدث
        this.logEvent('CONNECTION_OFFLINE', 'WARNING', {
            timestamp: Date.now()
        });
    }
    
    /**
     * طلب مزامنة الخلفية
     */
    async requestBackgroundSync() {
        if (!('serviceWorker' in navigator) || !('SyncManager' in window)) {
            return false;
        }
        
        try {
            const registration = await navigator.serviceWorker.ready;
            await registration.sync.register(this.config.SYNC_TAG);
            
            this.logEvent('BACKGROUND_SYNC_REGISTERED', 'INFO', {
                tag: this.config.SYNC_TAG,
                timestamp: Date.now()
            });
            
            return true;
        } catch (error) {
            console.error('Background sync registration failed:', error);
            
            this.logEvent('BACKGROUND_SYNC_FAILED', 'ERROR', {
                error: error.message,
                timestamp: Date.now()
            });
            
            return false;
        }
    }
    
    /**
     * معالجة ظهور التطبيق
     */
    handleAppVisible() {
        // التحقق من التحديثات
        this.checkForUpdates();
        
        // تحديث حالة الاتصال
        this.updateConnectionStatus();
        
        // تسجيل الحدث
        this.logEvent('APP_VISIBLE', 'INFO', {
            timestamp: Date.now(),
            durationHidden: this.hiddenStart ? Date.now() - this.hiddenStart : 0
        });
        
        this.hiddenStart = null;
    }
    
    /**
     * معالجة إخفاء التطبيق
     */
    handleAppHidden() {
        this.hiddenStart = Date.now();
        
        // حفظ حالة التطبيق
        this.saveAppState();
        
        // تسجيل الحدث
        this.logEvent('APP_HIDDEN', 'INFO', {
            timestamp: Date.now()
        });
    }
    
    /**
     * حفظ حالة التطبيق
     */
    async saveAppState() {
        try {
            const state = {
                timestamp: Date.now(),
                url: window.location.href,
                scrollPosition: window.scrollY,
                viewState: this.getCurrentViewState(),
                sessionData: this.collectSessionData()
            };
            
            localStorage.setItem('ciphervault_app_state', JSON.stringify(state));
            
            this.logEvent('APP_STATE_SAVED', 'INFO', {
                timestamp: state.timestamp
            });
            
        } catch (error) {
            console.warn('Failed to save app state:', error);
            
            this.logEvent('APP_STATE_SAVE_FAILED', 'WARNING', {
                error: error.message
            });
        }
    }
    
    /**
     * جمع بيانات الجلسة
     */
    collectSessionData() {
        const forms = document.querySelectorAll('form[data-save-state="true"]');
        const formData = {};
        
        forms.forEach((form, index) => {
            try {
                const data = new FormData(form);
                const entries = {};
                
                for (const [key, value] of data.entries()) {
                    // تجنب حفظ البيانات الحساسة
                    if (key.toLowerCase().includes('password') || 
                        key.toLowerCase().includes('secret') ||
                        key.toLowerCase().includes('key')) {
                        continue;
                    }
                    entries[key] = value;
                }
                
                if (Object.keys(entries).length > 0) {
                    formData[`form_${index}`] = {
                        id: form.id || `form_${index}`,
                        entries
                    };
                }
            } catch (error) {
                console.warn(`Failed to collect data from form ${index}:`, error);
            }
        });
        
        return formData;
    }
    
    /**
     * الحصول على حالة العرض الحالية
     */
    getCurrentViewState() {
        const activeSection = document.querySelector('.section.active') || 
                             document.querySelector('[data-section].active');
        
        return {
            activeSection: activeSection ? activeSection.id || activeSection.dataset.section : null,
            activeTab: document.querySelector('.tab.active') ? document.querySelector('.tab.active').id : null,
            activeModal: document.querySelector('.modal.show') ? document.querySelector('.modal.show').id : null
        };
    }
    
    /**
     * استعادة حالة التطبيق
     */
    async restoreAppState() {
        try {
            const savedState = localStorage.getItem('ciphervault_app_state');
            if (!savedState) return;
            
            const state = JSON.parse(savedState);
            
            // التحقق من تاريخ الحالة (لا تستعيد إذا مر أكثر من ساعة)
            const stateAge = Date.now() - state.timestamp;
            if (stateAge > 60 * 60 * 1000) { // ساعة واحدة
                localStorage.removeItem('ciphervault_app_state');
                return;
            }
            
            // استعادة موضع التمرير
            if (state.scrollPosition && state.scrollPosition > 0) {
                setTimeout(() => {
                    window.scrollTo(0, state.scrollPosition);
                }, 100);
            }
            
            // استعادة بيانات النماذج
            if (state.sessionData && state.sessionData.formData) {
                Object.values(state.sessionData.formData).forEach(formInfo => {
                    const form = document.getElementById(formInfo.id);
                    if (form) {
                        Object.entries(formInfo.entries).forEach(([key, value]) => {
                            const input = form.querySelector(`[name="${key}"]`);
                            if (input && !input.type || input.type !== 'password') {
                                input.value = value;
                            }
                        });
                    }
                });
            }
            
            // مسح الحالة المحفوظة
            localStorage.removeItem('ciphervault_app_state');
            
            this.logEvent('APP_STATE_RESTORED', 'INFO', {
                timestamp: Date.now(),
                stateAge
            });
            
        } catch (error) {
            console.warn('Failed to restore app state:', error);
            
            this.logEvent('APP_STATE_RESTORE_FAILED', 'WARNING', {
                error: error.message
            });
            
            // مسح الحالة التالفة
            localStorage.removeItem('ciphervault_app_state');
        }
    }
    
    /**
     * الحصول على وضع العرض
     */
    getDisplayMode() {
        if (this.standalone) return 'standalone';
        if (window.matchMedia('(display-mode: fullscreen)').matches) return 'fullscreen';
        if (window.matchMedia('(display-mode: minimal-ui)').matches) return 'minimal-ui';
        if (window.matchMedia('(display-mode: browser)').matches) return 'browser';
        return 'unknown';
    }
    
    /**
     * تسجيل حدث في سجل التدقيق - الدالة المصححة
     */
    logEvent(type, severity, data) {
        // أولاً، محاولة تسجيل في AuditLogger إذا كان متاحاً
        if (window.AuditLogger && typeof window.AuditLogger.log === 'function') {
            try {
                window.AuditLogger.log(type, severity, data, 'pwa-manager');
            } catch (error) {
                console.warn('Failed to log audit event:', error);
            }
        }
        
        // تسجيل في console مع التحقق من دالة console المناسبة
        const severityLower = severity.toLowerCase();
        const consoleMethods = {
            'error': console.error,
            'warning': console.warn,
            'info': console.info,
            'debug': console.debug,
            'log': console.log
        };
        
        const consoleMethod = consoleMethods[severityLower] || console.log;
        
        // التحقق من أن consoleMethod هي دالة
        if (typeof consoleMethod === 'function') {
            try {
                consoleMethod(`PWA Event [${severity}]: ${type}`, data);
            } catch (e) {
                // Fallback إلى console.log
                console.log(`PWA Event [${severity}]: ${type}`, data);
            }
        } else {
            // Fallback إذا لم تكن الدالة موجودة
            console.log(`PWA Event [${severity}]: ${type}`, data);
        }
    }
    
    /**
     * الحصول على حالة PWA
     */
    getStatus() {
        return {
            installed: this.installed,
            standalone: this.standalone,
            updateAvailable: this.updateAvailable,
            offlineMode: this.offlineMode,
            serviceWorkerRegistered: !!this.serviceWorker,
            notificationPermission: Notification.permission,
            backgroundSyncSupported: 'SyncManager' in window,
            displayMode: this.getDisplayMode(),
            version: this.config.CACHE_VERSION
        };
    }
    
    /**
     * إلغاء تسجيل Service Worker
     */
    async unregister() {
        if (this.serviceWorker) {
            try {
                await this.serviceWorker.unregister();
                this.serviceWorker = null;
                
                this.logEvent('SERVICE_WORKER_UNREGISTERED', 'INFO', {
                    timestamp: Date.now()
                });
            } catch (error) {
                console.error('Failed to unregister Service Worker:', error);
                
                this.logEvent('SERVICE_WORKER_UNREGISTER_FAILED', 'ERROR', {
                    error: error.message
                });
            }
        }
        
        // مسح ذاكرة التخزين المؤقت
        if ('caches' in window) {
            try {
                const cacheNames = await caches.keys();
                await Promise.all(
                    cacheNames.map(cacheName => {
                        if (cacheName.startsWith('ciphervault')) {
                            return caches.delete(cacheName);
                        }
                    })
                );
                
                this.logEvent('CACHE_CLEARED', 'INFO', {
                    timestamp: Date.now(),
                    cacheCount: cacheNames.length
                });
            } catch (error) {
                console.error('Failed to clear cache:', error);
            }
        }
    }
}

// التحقق من دعم المتصفح قبل التهيئة
function isPwaSupported() {
    return 'serviceWorker' in navigator && 
           'caches' in window && 
           'Promise' in window;
}

// تهيئة PWA Manager مع معالجة الأخطاء
let PWAManager = null;

if (typeof window !== 'undefined' && isPwaSupported()) {
    try {
        PWAManager = new EnhancedPWAManager();
        
        // جعل المدير متاحاً عالمياً
        window.PWAManager = PWAManager;
        
        // التصدير للاستخدام في الوحدات
        if (typeof module !== 'undefined' && module.exports) {
            module.exports = {
                EnhancedPWAManager,
                PWAManager,
                isPwaSupported
            };
        }
        
        // إضافة حدث لمعرفة عندما يكون المدير جاهزاً
        window.dispatchEvent(new CustomEvent('pwa:ready', {
            detail: { manager: PWAManager }
        }));
        
    } catch (error) {
        console.error('Failed to initialize PWA Manager:', error);
        
        // إنشاء مدير بديل مع وظائف محدودة
        PWAManager = {
            getStatus: () => ({ error: 'PWA Manager initialization failed' }),
            showNotification: (message, type) => {
                console.log(`[PWA Notification - ${type}]: ${message}`);
            },
            logEvent: (type, severity, data) => {
                console.log(`[PWA Event - ${severity}]: ${type}`, data);
            },
            showInstallPromptIfNeeded: () => false
        };
        
        window.PWAManager = PWAManager;
    }
} else {
    console.warn('PWA features not supported in this browser');
    
    // إنشاء مدير وهمي للتوافق
    PWAManager = {
        getStatus: () => ({ 
            supported: false,
            message: 'PWA features not supported in this browser' 
        }),
        showNotification: (message, type) => {
            console.log(`[PWA Notification - ${type}]: ${message}`);
        },
        logEvent: (type, severity, data) => {
            console.log(`[PWA Event - ${severity}]: ${type}`, data);
        },
        showInstallPromptIfNeeded: () => false
    };
    
    if (typeof window !== 'undefined') {
        window.PWAManager = PWAManager;
    }
}

// التصدير للاستخدام في الوحدات النمطية
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        EnhancedPWAManager,
        PWAManager: PWAManager || {
            getStatus: () => ({ error: 'PWA not initialized' })
        },
        isPwaSupported
    };
}
