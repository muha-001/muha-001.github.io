/**
 * CipherVault 3D Pro - مدير التطبيق التقدمي المحسن
 * الإصدار: 4.2.0
 */

class EnhancedPWAManager {
    constructor() {
        this.deferredPrompt = null;
        this.installed = false;
        this.standalone = false;
        this.updateAvailable = false;
        this.serviceWorker = null;
        this.offlineMode = false;
        
        this.config = {
            CACHE_NAME: 'ciphervault-pro-v4.2',
            OFFLINE_CACHE: 'ciphervault-offline-v4.2',
            CACHE_VERSION: '4.2.0',
            PRECACHE_FILES: [
                '/',
                '/index.html',
                '/manifest.json',
                '/assets/css/main.css',
                '/assets/css/dark-mode.css',
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
            PUSH_NOTIFICATIONS_ENABLED: true,
            OFFLINE_RETRY_LIMIT: 3
        };
        
        this.init();
    }
    
    async init() {
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
        
        console.log('Enhanced PWA Manager initialized');
    }
    
    checkInstallStatus() {
        this.installed = window.matchMedia('(display-mode: standalone)').matches || 
                        window.navigator.standalone ||
                        document.referrer.includes('android-app://');
        
        this.standalone = window.matchMedia('(display-mode: standalone)').matches;
        
        if (this.installed) {
            this.logEvent('PWA_INSTALLED', 'INFO', {
                displayMode: this.standalone ? 'standalone' : 'browser',
                timestamp: Date.now()
            });
        }
    }
    
    async registerServiceWorker() {
        if (!('serviceWorker' in navigator)) {
            console.warn('Service Workers not supported');
            return;
        }
        
        try {
            this.serviceWorker = await navigator.serviceWorker.register('/service-worker.js', {
                scope: '/',
                updateViaCache: 'none'
            });
            
            console.log('Service Worker registered:', this.serviceWorker);
            
            // الاستماع لتحديث Service Worker
            this.serviceWorker.addEventListener('updatefound', () => {
                const newWorker = this.serviceWorker.installing;
                console.log('New Service Worker found:', newWorker);
                
                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        this.updateAvailable = true;
                        this.showUpdateNotification();
                    }
                });
            });
            
            // التحقق من التحديثات بشكل دوري
            setInterval(() => this.checkForUpdates(), 60 * 60 * 1000); // كل ساعة
            
            this.logEvent('SERVICE_WORKER_REGISTERED', 'INFO', {
                scope: this.serviceWorker.scope,
                version: this.config.CACHE_VERSION
            });
            
        } catch (error) {
            console.error('Service Worker registration failed:', error);
            this.logEvent('SERVICE_WORKER_FAILED', 'ERROR', {
                error: error.message
            });
        }
    }
    
    async checkForUpdates() {
        if (!this.serviceWorker) return;
        
        try {
            await this.serviceWorker.update();
            
            // التحقق من وجود تحديثات للتطبيق
            const response = await fetch('/manifest.json', {
                cache: 'no-store',
                headers: {
                    'Cache-Control': 'no-cache'
                }
            });
            
            const manifest = await response.json();
            const currentVersion = '4.2.0'; // يجب أن يكون هذا من التكوين
            
            if (manifest.version !== currentVersion) {
                this.showUpdateNotification(manifest.version);
            }
            
        } catch (error) {
            console.warn('Update check failed:', error);
        }
    }
    
    setupEventListeners() {
        // حدث تثبيت PWA
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
            this.showInstallPrompt();
        });
        
        // حدث بعد التثبيت
        window.addEventListener('appinstalled', () => {
            this.installed = true;
            this.deferredPrompt = null;
            this.logEvent('PWA_INSTALLED_SUCCESS', 'INFO', {
                timestamp: Date.now()
            });
            this.showNotification('تم تثبيت التطبيق بنجاح!', 'success');
        });
        
        // أحداث Service Worker
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.addEventListener('controllerchange', () => {
                console.log('Service Worker controller changed');
                this.showNotification('تم تحديث التطبيق. أعد التحميل للاستفادة من الميزات الجديدة.', 'info');
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
    }
    
    setupOfflineMode() {
        if (!('caches' in window)) return;
        
        // إنشاء ذاكرة تخزين مؤقت للمحتوى غير المتصل
        this.createOfflineCache();
        
        // إعداد فحص الاتصال
        this.setupConnectionCheck();
    }
    
    async createOfflineCache() {
        try {
            const cache = await caches.open(this.config.OFFLINE_CACHE);
            
            // تخزين الصفحة غير المتصلة
            const offlinePage = `
                <!DOCTYPE html>
                <html lang="ar">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>CipherVault - غير متصل</title>
                    <style>
                        body {
                            font-family: 'Cairo', sans-serif;
                            background: linear-gradient(135deg, #0a0a1a, #050510);
                            color: white;
                            height: 100vh;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            text-align: center;
                            padding: 20px;
                        }
                        
                        .offline-container {
                            max-width: 500px;
                            padding: 40px;
                            background: rgba(10, 15, 35, 0.9);
                            border-radius: 20px;
                            border: 2px solid #00d4ff;
                            box-shadow: 0 0 30px rgba(0, 212, 255, 0.3);
                        }
                        
                        .offline-icon {
                            font-size: 64px;
                            color: #ff4757;
                            margin-bottom: 20px;
                        }
                        
                        h1 {
                            color: #00d4ff;
                            margin-bottom: 20px;
                        }
                        
                        p {
                            color: #8a8aa3;
                            margin-bottom: 30px;
                            line-height: 1.6;
                        }
                        
                        .features {
                            text-align: right;
                            margin: 30px 0;
                        }
                        
                        .feature {
                            padding: 10px;
                            background: rgba(0, 212, 255, 0.1);
                            margin: 10px 0;
                            border-radius: 8px;
                            border-right: 3px solid #00d4ff;
                        }
                        
                        button {
                            background: linear-gradient(135deg, #00d4ff, #0099cc);
                            color: white;
                            border: none;
                            padding: 15px 30px;
                            border-radius: 10px;
                            font-family: 'Cairo', sans-serif;
                            font-size: 16px;
                            cursor: pointer;
                            transition: transform 0.2s;
                        }
                        
                        button:hover {
                            transform: translateY(-2px);
                        }
                    </style>
                </head>
                <body>
                    <div class="offline-container">
                        <div class="offline-icon">
                            <i class="fas fa-wifi-slash"></i>
                        </div>
                        <h1>أنت غير متصل بالإنترنت</h1>
                        <p>لا يمكن الوصول إلى CipherVault حالياً بسبب فقدان الاتصال بالإنترنت.</p>
                        
                        <div class="features">
                            <div class="feature">✓ يمكنك عرض الملفات المشفرة المحفوظة</div>
                            <div class="feature">✓ يمكنك تشفير الملفات الجديدة (سيتم حفظها محلياً)</div>
                            <div class="feature">✓ يمكنك فك تشفير الملفات المحفوظة</div>
                        </div>
                        
                        <button onclick="window.location.reload()">إعادة المحاولة</button>
                    </div>
                </body>
                </html>
            `;
            
            await cache.put('/offline.html', new Response(offlinePage, {
                headers: { 'Content-Type': 'text/html' }
            }));
            
            console.log('Offline cache created');
            
        } catch (error) {
            console.error('Failed to create offline cache:', error);
        }
    }
    
    setupConnectionCheck() {
        // فحص الاتصال بشكل دوري
        setInterval(async () => {
            try {
                const response = await fetch('/ping', {
                    method: 'HEAD',
                    cache: 'no-store',
                    signal: AbortSignal.timeout(5000)
                });
                
                this.offlineMode = !response.ok;
            } catch (error) {
                this.offlineMode = true;
            }
            
            this.updateConnectionStatus();
        }, 30000); // كل 30 ثانية
    }
    
    updateConnectionStatus() {
        const statusElement = document.getElementById('connectionStatus');
        const iconElement = document.getElementById('connectionIcon');
        
        if (!statusElement || !iconElement) return;
        
        if (this.offlineMode) {
            statusElement.textContent = 'غير متصل';
            statusElement.style.color = '#ff4757';
            iconElement.className = 'fas fa-wifi-slash';
            iconElement.style.color = '#ff4757';
        } else {
            statusElement.textContent = 'متصل';
            statusElement.style.color = '#00ff88';
            iconElement.className = 'fas fa-wifi';
            iconElement.style.color = '#00ff88';
        }
    }
    
    showInstallPrompt() {
        if (this.installed || !this.deferredPrompt) return;
        
        // إنشاء نافذة تثبيت مخصصة
        const installPrompt = document.createElement('div');
        installPrompt.className = 'pwa-install-prompt show';
        installPrompt.innerHTML = `
            <div class="pwa-content">
                <div class="pwa-icon">
                    <i class="fas fa-download"></i>
                </div>
                <div class="pwa-info">
                    <h4>تثبيت CipherVault Pro</h4>
                    <p>ثبِّت التطبيق للحصول على تجربة أفضل ووصول دون اتصال</p>
                    <div class="pwa-features">
                        <span><i class="fas fa-bolt"></i> أسرع تحميل</span>
                        <span><i class="fas fa-shield-alt"></i> أمان محسّن</span>
                        <span><i class="fas fa-desktop"></i> تجربة كالتطبيق</span>
                    </div>
                </div>
                <div class="pwa-actions">
                    <button class="btn-pwa-install" id="installPWA">
                        <i class="fas fa-plus-circle"></i> تثبيت
                    </button>
                    <button class="btn-pwa-dismiss" id="dismissPWA">
                        لاحقاً
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(installPrompt);
        
        // إضافة الأنماط
        if (!document.querySelector('#pwa-prompt-styles')) {
            const styles = document.createElement('style');
            styles.id = 'pwa-prompt-styles';
            styles.textContent = `
                .pwa-install-prompt {
                    position: fixed;
                    bottom: 30px;
                    right: 30px;
                    background: var(--card-bg);
                    border: 3px solid var(--primary);
                    border-radius: var(--radius-xl);
                    padding: 25px;
                    z-index: 10000;
                    box-shadow: var(--shadow-heavy), var(--card-glow);
                    display: none;
                    animation: slideInRight 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    max-width: 450px;
                    backdrop-filter: blur(20px);
                }
                
                .pwa-install-prompt.show {
                    display: block;
                }
                
                .pwa-content {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }
                
                .pwa-icon {
                    width: 60px;
                    height: 60px;
                    background: linear-gradient(135deg, var(--primary), var(--accent));
                    border-radius: 15px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 28px;
                    color: white;
                    margin: 0 auto;
                }
                
                .pwa-info {
                    text-align: center;
                }
                
                .pwa-info h4 {
                    font-family: 'Orbitron', sans-serif;
                    color: var(--light);
                    margin-bottom: 10px;
                    font-size: 1.3rem;
                }
                
                .pwa-info p {
                    color: var(--gray);
                    font-size: 0.95rem;
                    line-height: 1.5;
                    margin-bottom: 15px;
                }
                
                .pwa-features {
                    display: flex;
                    justify-content: center;
                    gap: 15px;
                    flex-wrap: wrap;
                    margin: 15px 0;
                }
                
                .pwa-features span {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 0.85rem;
                    color: var(--primary-light);
                    background: rgba(0, 212, 255, 0.1);
                    padding: 6px 12px;
                    border-radius: 20px;
                }
                
                .pwa-features i {
                    font-size: 0.9rem;
                }
                
                .pwa-actions {
                    display: flex;
                    gap: 10px;
                }
                
                .btn-pwa-install {
                    background: linear-gradient(135deg, var(--primary), var(--primary-dark));
                    color: white;
                    border: none;
                    border-radius: var(--radius-lg);
                    padding: 12px 20px;
                    font-family: 'Orbitron', sans-serif;
                    font-weight: 600;
                    cursor: pointer;
                    transition: var(--transition-normal);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    letter-spacing: 1px;
                    flex: 2;
                }
                
                .btn-pwa-install:hover {
                    transform: scale(1.05);
                    box-shadow: var(--glow);
                }
                
                .btn-pwa-dismiss {
                    background: transparent;
                    color: var(--gray);
                    border: 2px solid var(--gray);
                    border-radius: var(--radius-lg);
                    padding: 10px 20px;
                    font-family: 'Orbitron', sans-serif;
                    font-weight: 600;
                    cursor: pointer;
                    transition: var(--transition-normal);
                    flex: 1;
                }
                
                .btn-pwa-dismiss:hover {
                    color: var(--light);
                    border-color: var(--light);
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
            `;
            document.head.appendChild(styles);
        }
        
        // إضافة أحداث الأزرار
        installPrompt.querySelector('#installPWA').addEventListener('click', () => {
            this.install();
            installPrompt.remove();
        });
        
        installPrompt.querySelector('#dismissPWA').addEventListener('click', () => {
            installPrompt.remove();
            // تأجيل العرض لمدة أسبوع
            localStorage.setItem('pwa_prompt_dismissed', Date.now().toString());
        });
        
        // إغلاق تلقائي بعد 30 ثانية
        setTimeout(() => {
            if (installPrompt.parentNode) {
                installPrompt.style.opacity = '0';
                setTimeout(() => installPrompt.remove(), 300);
            }
        }, 30000);
    }
    
    showUpdateNotification(newVersion = null) {
        const notification = document.createElement('div');
        notification.className = 'update-notification show';
        notification.innerHTML = `
            <div class="update-content">
                <div class="update-icon">
                    <i class="fas fa-sync-alt"></i>
                </div>
                <div class="update-info">
                    <h4>تحديث متاح</h4>
                    <p>${newVersion ? `الإصدار ${newVersion} متاح الآن` : 'تحديث جديد متاح'}</p>
                    <p class="update-desc">يتضمن تحسينات في الأمان والأداء</p>
                </div>
                <div class="update-actions">
                    <button class="btn-update-now" id="updateNow">
                        <i class="fas fa-download"></i> تحديث الآن
                    </button>
                    <button class="btn-update-later" id="updateLater">
                        لاحقاً
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // إضافة الأنماط
        if (!document.querySelector('#update-notification-styles')) {
            const styles = document.createElement('style');
            styles.id = 'update-notification-styles';
            styles.textContent = `
                .update-notification {
                    position: fixed;
                    top: 30px;
                    right: 30px;
                    background: linear-gradient(135deg, #ff9800, #ff5722);
                    color: white;
                    border-radius: var(--radius-xl);
                    padding: 20px;
                    z-index: 9999;
                    box-shadow: 0 10px 30px rgba(255, 87, 34, 0.3);
                    display: none;
                    animation: slideInDown 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    max-width: 400px;
                    backdrop-filter: blur(10px);
                    border: 2px solid #ff5722;
                }
                
                .update-notification.show {
                    display: block;
                }
                
                .update-content {
                    display: flex;
                    flex-direction: column;
                    gap: 15px;
                }
                
                .update-icon {
                    width: 50px;
                    height: 50px;
                    background: rgba(255, 255, 255, 0.2);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 24px;
                    margin: 0 auto;
                }
                
                .update-info {
                    text-align: center;
                }
                
                .update-info h4 {
                    font-family: 'Orbitron', sans-serif;
                    margin-bottom: 8px;
                    font-size: 1.2rem;
                }
                
                .update-info p {
                    margin-bottom: 5px;
                    opacity: 0.9;
                    font-size: 0.9rem;
                }
                
                .update-desc {
                    font-size: 0.85rem !important;
                    opacity: 0.8 !important;
                }
                
                .update-actions {
                    display: flex;
                    gap: 10px;
                }
                
                .btn-update-now {
                    background: white;
                    color: #ff5722;
                    border: none;
                    border-radius: var(--radius-lg);
                    padding: 10px 20px;
                    font-family: 'Orbitron', sans-serif;
                    font-weight: 600;
                    cursor: pointer;
                    transition: var(--transition-normal);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    flex: 2;
                }
                
                .btn-update-now:hover {
                    transform: scale(1.05);
                    box-shadow: 0 4px 15px rgba(255, 255, 255, 0.2);
                }
                
                .btn-update-later {
                    background: transparent;
                    color: white;
                    border: 2px solid white;
                    border-radius: var(--radius-lg);
                    padding: 8px 20px;
                    font-family: 'Orbitron', sans-serif;
                    font-weight: 600;
                    cursor: pointer;
                    transition: var(--transition-normal);
                    flex: 1;
                }
                
                .btn-update-later:hover {
                    background: white;
                    color: #ff5722;
                }
                
                @keyframes slideInDown {
                    from {
                        opacity: 0;
                        transform: translateY(-50px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `;
            document.head.appendChild(styles);
        }
        
        // إضافة أحداث الأزرار
        notification.querySelector('#updateNow').addEventListener('click', () => {
            window.location.reload();
        });
        
        notification.querySelector('#updateLater').addEventListener('click', () => {
            notification.remove();
            // تأجيل لمدة يوم
            localStorage.setItem('update_notification_dismissed', Date.now().toString());
        });
        
        // إغلاق تلقائي بعد 60 ثانية
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.opacity = '0';
                setTimeout(() => notification.remove(), 300);
            }
        }, 60000);
    }
    
    async install() {
        if (!this.deferredPrompt) {
            this.showNotification('التطبيق مثبت بالفعل', 'info');
            return;
        }
        
        try {
            await this.deferredPrompt.prompt();
            const { outcome } = await this.deferredPrompt.userChoice;
            
            this.logEvent('PWA_INSTALL_PROMPT', 'INFO', {
                outcome,
                timestamp: Date.now()
            });
            
            this.deferredPrompt = null;
            
        } catch (error) {
            console.error('PWA installation failed:', error);
            this.showNotification('فشل تثبيت التطبيق', 'error');
            this.logEvent('PWA_INSTALL_FAILED', 'ERROR', {
                error: error.message
            });
        }
    }
    
    showNotification(message, type = 'info') {
        // إنشاء إشعار مخصص
        const notification = document.createElement('div');
        notification.className = `pwa-notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
                <button class="notification-close">&times;</button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // إضافة الأنماط إذا لم تكن موجودة
        if (!document.querySelector('#pwa-notification-styles')) {
            const styles = document.createElement('style');
            styles.id = 'pwa-notification-styles';
            styles.textContent = `
                .pwa-notification {
                    position: fixed;
                    bottom: 80px;
                    right: 30px;
                    padding: 15px 20px;
                    border-radius: var(--radius-lg);
                    z-index: 9998;
                    animation: slideInRight 0.3s ease;
                    max-width: 350px;
                    backdrop-filter: blur(10px);
                }
                
                .pwa-notification.info {
                    background: rgba(0, 168, 255, 0.9);
                    color: white;
                    border-left: 4px solid #00a8ff;
                }
                
                .pwa-notification.success {
                    background: rgba(0, 255, 136, 0.9);
                    color: white;
                    border-left: 4px solid #00ff88;
                }
                
                .pwa-notification.warning {
                    background: rgba(255, 170, 0, 0.9);
                    color: white;
                    border-left: 4px solid #ffaa00;
                }
                
                .pwa-notification.error {
                    background: rgba(255, 71, 87, 0.9);
                    color: white;
                    border-left: 4px solid #ff4757;
                }
                
                .notification-content {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }
                
                .notification-content i {
                    font-size: 20px;
                }
                
                .notification-content span {
                    flex: 1;
                    font-size: 14px;
                }
                
                .notification-close {
                    background: none;
                    border: none;
                    color: white;
                    font-size: 20px;
                    cursor: pointer;
                    opacity: 0.7;
                    transition: opacity 0.2s;
                }
                
                .notification-close:hover {
                    opacity: 1;
                }
            `;
            document.head.appendChild(styles);
        }
        
        // إضافة حدث الإغلاق
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.remove();
        });
        
        // الإزالة التلقائية بعد 5 ثوانٍ
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.opacity = '0';
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);
    }
    
    getNotificationIcon(type) {
        const icons = {
            'info': 'info-circle',
            'success': 'check-circle',
            'warning': 'exclamation-triangle',
            'error': 'exclamation-circle'
        };
        
        return icons[type] || 'info-circle';
    }
    
    handleServiceWorkerMessage(message) {
        switch (message.type) {
            case 'CACHE_UPDATED':
                console.log('Cache updated:', message.data);
                this.showNotification('تم تحديث ذاكرة التخزين المؤقت', 'info');
                break;
                
            case 'SYNC_COMPLETED':
                console.log('Background sync completed:', message.data);
                break;
                
            case 'PUSH_NOTIFICATION':
                this.showPushNotification(message.data);
                break;
                
            case 'OFFLINE_MODE':
                this.offlineMode = message.data.enabled;
                this.updateConnectionStatus();
                break;
        }
    }
    
    showPushNotification(data) {
        if (!('Notification' in window) || Notification.permission !== 'granted') {
            return;
        }
        
        const options = {
            body: data.body,
            icon: '/assets/icons/icon-192x192.png',
            badge: '/assets/icons/icon-72x72.png',
            tag: data.tag || 'ciphervault-notification',
            requireInteraction: data.important || false,
            data: data.payload
        };
        
        const notification = new Notification(data.title, options);
        
        notification.onclick = () => {
            window.focus();
            notification.close();
            
            if (data.action) {
                // تنفيذ الإجراء المحدد
                this.handleNotificationAction(data.action, data.payload);
            }
        };
    }
    
    handleNotificationAction(action, payload) {
        switch (action) {
            case 'OPEN_FILE':
                // افتح ملفاً محدداً
                console.log('Open file:', payload.fileId);
                break;
                
            case 'SHOW_REPORT':
                // عرض تقرير
                console.log('Show report:', payload.reportId);
                break;
                
            case 'UPDATE_APP':
                // تحديث التطبيق
                window.location.reload();
                break;
        }
    }
    
    async requestNotificationPermission() {
        if (!('Notification' in window)) {
            console.log('This browser does not support notifications');
            return false;
        }
        
        if (Notification.permission === 'granted') {
            return true;
        }
        
        if (Notification.permission === 'denied') {
            console.log('Notification permission denied');
            return false;
        }
        
        const permission = await Notification.requestPermission();
        return permission === 'granted';
    }
    
    async requestBackgroundSync() {
        if (!('serviceWorker' in navigator) || !('SyncManager' in window)) {
            console.log('Background sync not supported');
            return false;
        }
        
        try {
            const registration = await navigator.serviceWorker.ready;
            await registration.sync.register(this.config.SYNC_TAG);
            return true;
        } catch (error) {
            console.error('Background sync registration failed:', error);
            return false;
        }
    }
    
    handleOnlineStatus() {
        this.showNotification('تم استعادة الاتصال بالإنترنت', 'success');
        
        // محاولة مزامنة أي عمليات معلقة
        this.requestBackgroundSync();
        
        // تحديث الواجهة
        this.updateConnectionStatus();
    }
    
    handleOfflineStatus() {
        this.showNotification('فقدان الاتصال بالإنترنت - العمل في وضع عدم الاتصال', 'warning');
        this.updateConnectionStatus();
    }
    
    handleAppVisible() {
        // تحديث البيانات عند عودة المستخدم
        this.checkForUpdates();
        
        // إرسال إحصاءات الاستخدام
        this.logEvent('APP_VISIBLE', 'INFO', {
            timestamp: Date.now(),
            durationHidden: this.hiddenStart ? Date.now() - this.hiddenStart : 0
        });
    }
    
    handleAppHidden() {
        this.hiddenStart = Date.now();
        
        // حفظ الحالة الحالية
        this.saveAppState();
    }
    
    async saveAppState() {
        const state = {
            timestamp: Date.now(),
            url: window.location.href,
            scrollPosition: window.scrollY,
            formData: this.collectFormData()
        };
        
        try {
            localStorage.setItem('ciphervault_app_state', JSON.stringify(state));
        } catch (error) {
            console.warn('Failed to save app state:', error);
        }
    }
    
    collectFormData() {
        const forms = document.querySelectorAll('form');
        const formData = {};
        
        forms.forEach((form, index) => {
            const data = new FormData(form);
            const entries = {};
            
            for (const [key, value] of data.entries()) {
                entries[key] = value;
            }
            
            if (Object.keys(entries).length > 0) {
                formData[`form_${index}`] = {
                    id: form.id,
                    entries
                };
            }
        });
        
        return formData;
    }
    
    async restoreAppState() {
        try {
            const saved = localStorage.getItem('ciphervault_app_state');
            if (!saved) return;
            
            const state = JSON.parse(saved);
            
            // استعادة موضع التمرير
            if (state.scrollPosition) {
                setTimeout(() => {
                    window.scrollTo(0, state.scrollPosition);
                }, 100);
            }
            
            // استعادة بيانات النماذج
            if (state.formData) {
                Object.values(state.formData).forEach(formInfo => {
                    const form = document.getElementById(formInfo.id);
                    if (form) {
                        Object.entries(formInfo.entries).forEach(([key, value]) => {
                            const input = form.querySelector(`[name="${key}"]`);
                            if (input) {
                                input.value = value;
                            }
                        });
                    }
                });
            }
            
            // مسح الحالة بعد الاستعادة
            localStorage.removeItem('ciphervault_app_state');
            
        } catch (error) {
            console.warn('Failed to restore app state:', error);
        }
    }
    
    logEvent(type, severity, data) {
        if (window.AuditLogger) {
            window.AuditLogger.log(type, severity, data, 'pwa-manager');
        }
    }
    
    getStatus() {
        return {
            installed: this.installed,
            standalone: this.standalone,
            updateAvailable: this.updateAvailable,
            offlineMode: this.offlineMode,
            serviceWorker: !!this.serviceWorker,
            notificationPermission: Notification.permission,
            backgroundSync: 'SyncManager' in window
        };
    }
    
    unregister() {
        if (this.serviceWorker) {
            this.serviceWorker.unregister();
            this.serviceWorker = null;
        }
        
        if ('caches' in window) {
            caches.keys().then(cacheNames => {
                cacheNames.forEach(cacheName => {
                    if (cacheName.startsWith('ciphervault')) {
                        caches.delete(cacheName);
                    }
                });
            });
        }
        
        this.logEvent('PWA_UNREGISTERED', 'INFO', {
            timestamp: Date.now()
        });
    }
}

// إنشاء نسخة عامة
const PWAManager = new EnhancedPWAManager();

// التصدير للاستخدام العام
if (typeof window !== 'undefined') {
    window.PWAManager = PWAManager;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        EnhancedPWAManager,
        PWAManager
    };
}
