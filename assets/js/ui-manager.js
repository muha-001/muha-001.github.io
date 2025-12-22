/**
 * CipherVault 3D Pro - UI Manager
 * مدير واجهة المستخدم للتحكم في جميع العناصر البصرية
 * Version: 4.2.0
 */

class UIManager {
    constructor() {
        this.elements = new Map();
        this.animations = new Map();
        this.notifications = new Map();
        this.state = {
            darkMode: false,
            language: 'en',
            performanceMode: false,
            accessibility: {
                highContrast: false,
                reducedMotion: false,
                fontSize: 'medium'
            }
        };
        
        this.initialize();
    }
    
    /**
     * تهيئة مدير واجهة المستخدم
     */
    initialize() {
        this.cacheElements();
        this.setupEventListeners();
        this.applySavedPreferences();
        this.setupResizeObserver();
        this.setupIntersectionObserver();
    }
    
    /**
     * تخزين العناصر في الذاكرة المؤقتة
     */
    cacheElements() {
        // العناصر الرئيسية
        this.elements.set('loadingScreen', document.getElementById('loadingScreen'));
        this.elements.set('mainContainer', document.querySelector('.main-container'));
        this.elements.set('securityStatus', document.querySelector('.security-status-bar'));
        
        // البطاقات
        this.elements.set('encryptCard', document.querySelector('.encrypt-card'));
        this.elements.set('decryptCard', document.querySelector('.decrypt-card'));
        
        // الأزرار
        this.elements.set('encryptBtn', document.getElementById('encryptBtn'));
        this.elements.set('decryptBtn', document.getElementById('decryptBtn'));
        this.elements.set('toggleDarkMode', document.getElementById('toggleDarkMode'));
        this.elements.set('toggleAdvanced', document.getElementById('toggleAdvanced'));
        
        // الحقول
        this.elements.set('fileInputEncrypt', document.getElementById('fileInputEncrypt'));
        this.elements.set('fileInputDecrypt', document.getElementById('fileInputDecrypt'));
        this.elements.set('passwordEncrypt', document.getElementById('passwordEncrypt'));
        this.elements.set('passwordDecrypt', document.getElementById('passwordDecrypt'));
        
        // اللوحات
        this.elements.set('advancedSettings', document.getElementById('advancedSettingsPanel'));
        this.elements.set('recoveryPanel', document.getElementById('recoveryPanel'));
        this.elements.set('statusContainer', document.getElementById('status-container'));
        
        console.log('UI Elements cached:', this.elements.size);
    }
    
    /**
     * إعداد مستمعي الأحداث
     */
    setupEventListeners() {
        // تبديل الوضع الداكن
        const darkModeToggle = this.elements.get('toggleDarkMode');
        if (darkModeToggle) {
            darkModeToggle.addEventListener('click', () => this.toggleDarkMode());
        }
        
        // الإعدادات المتقدمة
        const advancedToggle = this.elements.get('toggleAdvanced');
        const advancedPanel = this.elements.get('advancedSettings');
        
        if (advancedToggle && advancedPanel) {
            advancedToggle.addEventListener('click', () => this.togglePanel('advancedSettings'));
            
            const closeBtn = advancedPanel.querySelector('.close-settings');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => this.togglePanel('advancedSettings', false));
            }
        }
        
        // الأزرار الرئيسية
        this.setupButtonAnimations();
        
        // تحسينات اللمس
        this.setupTouchEnhancements();
        
        // إمكانية الوصول
        this.setupAccessibility();
    }
    
    /**
     * تطبيق التفضيلات المحفوظة
     */
    applySavedPreferences() {
        // الوضع الداكن
        const savedDarkMode = localStorage.getItem('ciphervault_darkmode');
        if (savedDarkMode !== null) {
            this.state.darkMode = savedDarkMode === 'true';
            this.applyDarkMode(this.state.darkMode);
        } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            this.state.darkMode = true;
            this.applyDarkMode(true);
        }
        
        // اللغة
        const savedLanguage = localStorage.getItem('ciphervault_language');
        if (savedLanguage) {
            this.state.language = savedLanguage;
            this.switchLanguage(savedLanguage);
        }
        
        // إمكانية الوصول
        const savedAccessibility = localStorage.getItem('ciphervault_accessibility');
        if (savedAccessibility) {
            this.state.accessibility = JSON.parse(savedAccessibility);
            this.applyAccessibilitySettings();
        }
    }
    
    /**
     * إعداد مراقب تغيير الحجم
     */
    setupResizeObserver() {
        if ('ResizeObserver' in window) {
            this.resizeObserver = new ResizeObserver((entries) => {
                entries.forEach(entry => {
                    this.handleResize(entry.target, entry.contentRect);
                });
            });
            
            // مراقبة العناصر المهمة
            const mainContainer = this.elements.get('mainContainer');
            if (mainContainer) {
                this.resizeObserver.observe(mainContainer);
            }
        }
    }
    
    /**
     * معالجة تغيير الحجم
     */
    handleResize(element, rect) {
        const width = rect.width;
        
        // تعديل التخطيط بناءً على العرض
        if (width < 768) {
            this.activateMobileLayout();
        } else if (width < 1024) {
            this.activateTabletLayout();
        } else {
            this.activateDesktopLayout();
        }
        
        // تحديث مؤشرات الأداء
        this.updatePerformanceIndicators();
    }
    
    /**
     * تنشيط تخطيط الهاتف
     */
    activateMobileLayout() {
        document.body.classList.add('mobile-layout');
        document.body.classList.remove('tablet-layout', 'desktop-layout');
        
        // إخفاء العناصر غير الضرورية
        this.toggleElementsVisibility('.floating-elements', false);
        this.toggleElementsVisibility('.security-badges-3d', false);
        
        // تعديل أحجام الخطوط
        document.documentElement.style.fontSize = '14px';
    }
    
    /**
     * تنشيط تخطيط الجهاز اللوحي
     */
    activateTabletLayout() {
        document.body.classList.add('tablet-layout');
        document.body.classList.remove('mobile-layout', 'desktop-layout');
        
        // إظهار بعض العناصر
        this.toggleElementsVisibility('.floating-elements', true);
        this.toggleElementsVisibility('.security-badges-3d', true);
        
        // تعديل أحجام الخطوط
        document.documentElement.style.fontSize = '15px';
    }
    
    /**
     * تنشيط تخطيط سطح المكتب
     */
    activateDesktopLayout() {
        document.body.classList.add('desktop-layout');
        document.body.classList.remove('mobile-layout', 'tablet-layout');
        
        // إظهار جميع العناصر
        this.toggleElementsVisibility('.floating-elements', true);
        this.toggleElementsVisibility('.security-badges-3d', true);
        
        // إعادة أحجام الخطوط
        document.documentElement.style.fontSize = '16px';
    }
    
    /**
     * تبديل رؤية العناصر
     */
    toggleElementsVisibility(selector, show) {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
            element.style.display = show ? '' : 'none';
        });
    }
    
    /**
     * إعداد مراقب التقاطع
     */
    setupIntersectionObserver() {
        if ('IntersectionObserver' in window) {
            this.intersectionObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.animateOnScroll(entry.target);
                    }
                });
            }, {
                threshold: 0.1,
                rootMargin: '50px'
            });
            
            // مراقبة العناصر المتحركة
            const animatedElements = document.querySelectorAll('.stat-card, .card-3d, .badge');
            animatedElements.forEach(element => {
                this.intersectionObserver.observe(element);
            });
        }
    }
    
    /**
     * تحريك العنصر عند التمرير
     */
    animateOnScroll(element) {
        element.classList.add('animated');
        
        // إضافة تأثيرات مختلفة بناءً على نوع العنصر
        if (element.classList.contains('stat-card')) {
            element.style.animation = 'slideUp 0.6s ease forwards';
        } else if (element.classList.contains('card-3d')) {
            element.style.animation = 'fadeIn 0.8s ease forwards';
        } else if (element.classList.contains('badge')) {
            element.style.animation = 'bounceIn 0.5s ease forwards';
        }
    }
    
    /**
     * إعداد تحسينات اللمس
     */
    setupTouchEnhancements() {
        // تحسين استجابة اللمس
        document.addEventListener('touchstart', () => {}, { passive: true });
        
        // منع التكبير على حقول الإدخال
        const inputs = document.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.addEventListener('touchstart', (e) => {
                if (e.target.type === 'text' || e.target.type === 'password' || e.target.tagName === 'TEXTAREA') {
                    document.body.style.fontSize = '16px';
                }
            });
        });
        
        // تحسين أهداف اللمس
        const touchElements = document.querySelectorAll('.btn-3d, .btn-icon, .control-btn');
        touchElements.forEach(element => {
            element.classList.add('touch-optimized');
        });
    }
    
    /**
     * إعداد إمكانية الوصول
     */
    setupAccessibility() {
        // دعم لوحة المفاتيح
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardNavigation(e);
        });
        
        // إضافة ARIA labels
        this.addAriaLabels();
        
        // دعم قارئ الشاشة
        this.setupScreenReaderSupport();
    }
    
    /**
     * التعامل مع التنقل بلوحة المفاتيح
     */
    handleKeyboardNavigation(e) {
        switch (e.key) {
            case 'Tab':
                this.highlightFocusedElement(e.target);
                break;
            case 'Escape':
                this.closeAllPanels();
                break;
            case 'Enter':
                if (e.target.classList.contains('card-3d')) {
                    this.flipCard(e.target);
                }
                break;
        }
    }
    
    /**
     * تمييز العنصر المركز
     */
    highlightFocusedElement(element) {
        // إزالة التمييز السابق
        document.querySelectorAll('.keyboard-focused').forEach(el => {
            el.classList.remove('keyboard-focused');
        });
        
        // إضافة التمييز الجديد
        element.classList.add('keyboard-focused');
        
        // تمرير للعنصر إذا لزم الأمر
        element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    
    /**
     * إضافة تسميات ARIA
     */
    addAriaLabels() {
        // الأزرار
        const buttons = document.querySelectorAll('button');
        buttons.forEach(button => {
            if (!button.getAttribute('aria-label')) {
                const text = button.textContent || button.title || '';
                if (text.trim()) {
                    button.setAttribute('aria-label', text.trim());
                }
            }
        });
        
        // حقول الإدخال
        const inputs = document.querySelectorAll('input[type="password"]');
        inputs.forEach(input => {
            input.setAttribute('aria-describedby', 'passwordRequirements');
        });
    }
    
    /**
     * إعداد دعم قارئ الشاشة
     */
    setupScreenReaderSupport() {
        // إضافة منطقة ARIA live للإشعارات
        const liveRegion = document.createElement('div');
        liveRegion.id = 'sr-live-region';
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.style.position = 'absolute';
        liveRegion.style.width = '1px';
        liveRegion.style.height = '1px';
        liveRegion.style.padding = '0';
        liveRegion.style.margin = '-1px';
        liveRegion.style.overflow = 'hidden';
        liveRegion.style.clip = 'rect(0, 0, 0, 0)';
        liveRegion.style.whiteSpace = 'nowrap';
        liveRegion.style.border = '0';
        
        document.body.appendChild(liveRegion);
        this.elements.set('srLiveRegion', liveRegion);
    }
    
    /**
     * إعلان لقارئ الشاشة
     */
    announceToScreenReader(message, priority = 'polite') {
        const liveRegion = this.elements.get('srLiveRegion');
        if (liveRegion) {
            liveRegion.setAttribute('aria-live', priority);
            liveRegion.textContent = message;
            
            // مسح الرسالة بعد ثانية
            setTimeout(() => {
                liveRegion.textContent = '';
            }, 1000);
        }
    }
    
    /**
     * تبديل الوضع الداكن
     */
    toggleDarkMode(force = null) {
        if (force !== null) {
            this.state.darkMode = force;
        } else {
            this.state.darkMode = !this.state.darkMode;
        }
        
        this.applyDarkMode(this.state.darkMode);
        
        // تحديث الزر
        const toggleBtn = this.elements.get('toggleDarkMode');
        if (toggleBtn) {
            toggleBtn.innerHTML = this.state.darkMode ? 
                '<i class="fas fa-sun"></i>' : 
                '<i class="fas fa-moon"></i>';
            
            toggleBtn.setAttribute('aria-label', 
                this.state.darkMode ? 'Switch to light mode' : 'Switch to dark mode'
            );
        }
        
        // إعلان التغيير
        this.announceToScreenReader(
            this.state.darkMode ? 'Dark mode enabled' : 'Light mode enabled'
        );
        
        // حفظ التفضيل
        localStorage.setItem('ciphervault_darkmode', this.state.darkMode);
    }
    
    /**
     * تطبيق الوضع الداكن
     */
    applyDarkMode(enabled) {
        if (enabled) {
            document.body.classList.add('dark-mode');
            document.body.setAttribute('data-theme', 'dark');
        } else {
            document.body.classList.remove('dark-mode');
            document.body.setAttribute('data-theme', 'light');
        }
    }
    
    /**
     * تبديل اللوحة
     */
    togglePanel(panelId, force = null) {
        const panel = this.elements.get(panelId);
        if (!panel) return;
        
        const isActive = panel.classList.contains('active');
        const shouldActivate = force !== null ? force : !isActive;
        
        if (shouldActivate) {
            panel.classList.add('active');
            panel.setAttribute('aria-hidden', 'false');
            
            // إغلاق اللوحات الأخرى
            this.closeOtherPanels(panelId);
            
            // منع التمرير خلف اللوحة
            document.body.style.overflow = 'hidden';
        } else {
            panel.classList.remove('active');
            panel.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
        }
    }
    
    /**
     * إغلاق اللوحات الأخرى
     */
    closeOtherPanels(currentPanelId) {
        const panels = ['advancedSettings', 'recoveryPanel'];
        panels.forEach(panelId => {
            if (panelId !== currentPanelId) {
                this.togglePanel(panelId, false);
            }
        });
    }
    
    /**
     * إغلاق جميع اللوحات
     */
    closeAllPanels() {
        ['advancedSettings', 'recoveryPanel'].forEach(panelId => {
            this.togglePanel(panelId, false);
        });
    }
    
    /**
     * تبديل اللغة
     */
    switchLanguage(lang) {
        this.state.language = lang;
        
        // تحديث اتجاه الصفحة
        document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = lang;
        
        // تحديث أزرار اللغة
        document.querySelectorAll('.lang-option').forEach(option => {
            option.classList.toggle('active', option.dataset.lang === lang);
        });
        
        // تحديث النصوص
        this.updateTexts(lang);
        
        // إعلان التغيير
        this.announceToScreenReader(`Language switched to ${lang === 'ar' ? 'Arabic' : 'English'}`);
        
        // حفظ التفضيل
        localStorage.setItem('ciphervault_language', lang);
    }
    
    /**
     * تحديث النصوص
     */
    updateTexts(lang) {
        // هذا سيتم دمجها مع نظام الترجمة الفعلي
        const elements = document.querySelectorAll('[data-i18n]');
        elements.forEach(element => {
            const key = element.getAttribute('data-i18n');
            // مؤقتاً: تغيير النص بناءً على اللغة
            element.textContent = lang === 'ar' ? `[AR] ${key}` : `[EN] ${key}`;
        });
    }
    
    /**
     * إعداد تحريك الأزرار
     */
    setupButtonAnimations() {
        const buttons = document.querySelectorAll('.btn-3d, .btn-icon, .control-btn');
        
        buttons.forEach(button => {
            // تأثير الضغط
            button.addEventListener('mousedown', () => {
                button.style.transform = 'scale(0.95)';
            });
            
            button.addEventListener('mouseup', () => {
                button.style.transform = '';
            });
            
            button.addEventListener('mouseleave', () => {
                button.style.transform = '';
            });
            
            // تأثير التحويم
            button.addEventListener('mouseenter', () => {
                if (!this.state.performanceMode) {
                    button.style.transform = 'translateY(-2px)';
                }
            });
            
            button.addEventListener('mouseleave', () => {
                button.style.transform = '';
            });
        });
    }
    
    /**
     * قلب البطاقة
     */
    flipCard(cardElement) {
        cardElement.classList.toggle('flipped');
        
        // إعلان حالة البطاقة
        const isFlipped = cardElement.classList.contains('flipped');
        const cardType = cardElement.classList.contains('encrypt-card') ? 'Encryption' : 'Decryption';
        this.announceToScreenReader(
            `${cardType} card ${isFlipped ? 'flipped to back' : 'flipped to front'}`
        );
    }
    
    /**
     * إظهار إشعار
     */
    showNotification(type, title, message, duration = 5000) {
        const notificationId = `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        const notification = document.createElement('div');
        notification.id = notificationId;
        notification.className = `status-message ${type}`;
        notification.setAttribute('role', 'alert');
        notification.setAttribute('aria-live', 'assertive');
        
        notification.innerHTML = `
            <div class="status-icon">
                <i class="fas ${this.getNotificationIcon(type)}"></i>
            </div>
            <div class="status-content">
                <h4>${title}</h4>
                <span>${message}</span>
            </div>
            <button class="status-close" aria-label="Close notification">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        const statusContainer = this.elements.get('statusContainer');
        if (statusContainer) {
            statusContainer.appendChild(notification);
            
            // إضافة مستمع للإغلاق
            const closeBtn = notification.querySelector('.status-close');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    this.removeNotification(notificationId);
                });
            }
            
            // إزالة تلقائية
            if (duration > 0) {
                setTimeout(() => {
                    this.removeNotification(notificationId);
                }, duration);
            }
            
            this.notifications.set(notificationId, notification);
            
            // إعلان لقارئ الشاشة
            this.announceToScreenReader(`${title}: ${message}`, 'assertive');
            
            return notificationId;
        }
        
        return null;
    }
    
    /**
     * الحصول على أيقونة الإشعار
     */
    getNotificationIcon(type) {
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle',
            security: 'fa-shield-alt'
        };
        
        return icons[type] || 'fa-info-circle';
    }
    
    /**
     * إزالة الإشعار
     */
    removeNotification(notificationId) {
        const notification = this.notifications.get(notificationId);
        if (notification) {
            notification.style.opacity = '0';
            notification.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                notification.remove();
                this.notifications.delete(notificationId);
            }, 300);
        }
    }
    
    /**
     * إخفاء شاشة التحميل
     */
    hideLoadingScreen() {
        const loadingScreen = this.elements.get('loadingScreen');
        const mainContainer = this.elements.get('mainContainer');
        
        if (loadingScreen && mainContainer) {
            // تأثير الاختفاء
            loadingScreen.style.opacity = '0';
            loadingScreen.style.pointerEvents = 'none';
            
            setTimeout(() => {
                loadingScreen.style.display = 'none';
                mainContainer.style.display = 'block';
                
                // تأثير الظهور
                setTimeout(() => {
                    mainContainer.style.opacity = '1';
                    mainContainer.style.transform = 'translateY(0)';
                }, 50);
                
                // إعلان الجاهزية
                this.announceToScreenReader('CipherVault 3D Pro is ready');
                
            }, 500);
        }
    }
    
    /**
     * تحديث مؤشر التقدم
     */
    updateProgress(progressData) {
        const { operation, current, total, status, speed } = progressData;
        
        // تحديث شاشة التقدم في البطاقة
        const card = operation === 'encrypt' ? 
            this.elements.get('encryptCard') : 
            this.elements.get('decryptCard');
        
        if (card) {
            const progressPercent = Math.round((current / total) * 100);
            const progressCircle = card.querySelector('.progress-bar');
            const progressText = card.querySelector('.progress-text span:first-child');
            const progressStatus = card.querySelector('.progress-status span:last-child');
            
            if (progressCircle) {
                const circumference = 2 * Math.PI * 64;
                const offset = circumference - (progressPercent / 100) * circumference;
                progressCircle.style.strokeDashoffset = offset;
            }
            
            if (progressText) {
                progressText.textContent = progressPercent;
            }
            
            if (progressStatus) {
                progressStatus.textContent = status;
            }
            
            // تحديث الإحصائيات
            this.updateProgressStats(card, progressData);
        }
    }
    
    /**
     * تحديث إحصائيات التقدم
     */
    updateProgressStats(card, progressData) {
        const stats = card.querySelectorAll('.stat-value');
        
        if (stats.length >= 4) {
            // الوقت المنقضي
            const elapsed = ((Date.now() - progressData.startTime) / 1000).toFixed(1);
            stats[0].textContent = `${elapsed}s`;
            
            // البيانات المعالجة
            const processed = this.formatBytes(progressData.current);
            const total = this.formatBytes(progressData.total);
            stats[1].textContent = `${processed} / ${total}`;
            
            // السرعة
            stats[2].textContent = `${this.formatBytes(progressData.speed)}/s`;
            
            // استخدام الذاكرة
            if (performance.memory) {
                const memory = Math.round(performance.memory.usedJSHeapSize / 1024 / 1024);
                stats[3].textContent = `${memory} MB`;
            }
        }
    }
    
    /**
     * تنسيق البايتات
     */
    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    /**
     * تحديث مؤشرات الأداء
     */
    updatePerformanceIndicators() {
        // تحديث مؤشرات الأمان
        this.updateSecurityIndicators();
        
        // تحديث حالة الذاكرة
        this.updateMemoryStatus();
        
        // تحديث حالة الاتصال
        this.updateConnectionStatus();
    }
    
    /**
     * تحديث مؤشرات الأمان
     */
    updateSecurityIndicators() {
        const indicators = document.querySelectorAll('.security-indicator');
        if (indicators.length === 0) return;
        
        // HTTPS
        indicators[0].classList.toggle('active', window.location.protocol === 'https:');
        
        // Crypto API
        indicators[1].classList.toggle('active', typeof crypto !== 'undefined' && crypto.subtle);
        
        // Web Workers
        indicators[2].classList.toggle('active', typeof Worker !== 'undefined');
        
        // Secure Context
        indicators[3].classList.toggle('active', window.isSecureContext);
        
        // Memory Protection
        indicators[4].classList.toggle('active', true); // دائماً نشط
    }
    
    /**
     * تحديث حالة الذاكرة
     */
    updateMemoryStatus() {
        const memoryStatus = document.getElementById('memoryStatus');
        if (memoryStatus && performance.memory) {
            const used = Math.round(performance.memory.usedJSHeapSize / 1024 / 1024);
            const total = Math.round(performance.memory.totalJSHeapSize / 1024 / 1024);
            const percent = Math.round((used / total) * 100);
            
            memoryStatus.textContent = `${percent}% used (${used}MB/${total}MB)`;
            
            // تغيير اللون بناءً على الاستخدام
            if (percent > 90) {
                memoryStatus.style.color = 'var(--error)';
            } else if (percent > 70) {
                memoryStatus.style.color = 'var(--warning)';
            } else {
                memoryStatus.style.color = 'var(--success)';
            }
        }
    }
    
    /**
     * تحديث حالة الاتصال
     */
    updateConnectionStatus() {
        const connectionStatus = document.getElementById('connectionStatus');
        const connectionIcon = document.getElementById('connectionIcon');
        
        if (connectionStatus && connectionIcon) {
            if (navigator.onLine) {
                connectionStatus.textContent = 'Online';
                connectionIcon.className = 'fas fa-wifi';
                connectionStatus.style.color = 'var(--success)';
            } else {
                connectionStatus.textContent = 'Offline';
                connectionIcon.className = 'fas fa-wifi-slash';
                connectionStatus.style.color = 'var(--warning)';
            }
        }
    }
    
    /**
     * تطبيق إعدادات إمكانية الوصول
     */
    applyAccessibilitySettings() {
        const { highContrast, reducedMotion, fontSize } = this.state.accessibility;
        
        // النقيض العالي
        if (highContrast) {
            document.body.classList.add('high-contrast');
        } else {
            document.body.classList.remove('high-contrast');
        }
        
        // تقليل الحركة
        if (reducedMotion) {
            document.body.classList.add('reduced-motion');
        } else {
            document.body.classList.remove('reduced-motion');
        }
        
        // حجم الخط
        document.body.style.fontSize = {
            'small': '14px',
            'medium': '16px',
            'large': '18px',
            'x-large': '20px'
        }[fontSize] || '16px';
    }
    
    /**
     * تبديل وضع الأداء
     */
    togglePerformanceMode() {
        this.state.performanceMode = !this.state.performanceMode;
        
        if (this.state.performanceMode) {
            document.body.classList.add('performance-mode');
            this.showNotification('info', 'Performance Mode', 'Visual effects reduced for better performance');
        } else {
            document.body.classList.remove('performance-mode');
            this.showNotification('success', 'Performance Mode', 'Visual effects restored');
        }
        
        localStorage.setItem('ciphervault_performance', this.state.performanceMode);
    }
    
    /**
     * إظهار تلميح الأدوات
     */
    showTooltip(element, text) {
        // إزالة التلميح السابق
        this.hideTooltip();
        
        // إنشاء تلميح جديد
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.textContent = text;
        
        // تحديد الموضع
        const rect = element.getBoundingClientRect();
        tooltip.style.position = 'fixed';
        tooltip.style.top = `${rect.top - 40}px`;
        tooltip.style.left = `${rect.left + rect.width / 2}px`;
        tooltip.style.transform = 'translateX(-50%)';
        
        document.body.appendChild(tooltip);
        this.elements.set('currentTooltip', tooltip);
        
        // إزالة بعد 3 ثواني
        setTimeout(() => {
            this.hideTooltip();
        }, 3000);
    }
    
    /**
     * إخفاء تلميح الأدوات
     */
    hideTooltip() {
        const tooltip = this.elements.get('currentTooltip');
        if (tooltip) {
            tooltip.remove();
            this.elements.delete('currentTooltip');
        }
    }
    
    /**
     * تهتز العنصر
     */
    shakeElement(element) {
        element.classList.add('shake');
        setTimeout(() => {
            element.classList.remove('shake');
        }, 500);
    }
    
    /**
     * وميض العنصر
     */
    flashElement(element, color = 'var(--primary)') {
        const originalColor = element.style.backgroundColor;
        element.style.backgroundColor = color;
        
        setTimeout(() => {
            element.style.backgroundColor = originalColor;
        }, 300);
    }
    
    /**
     * تحميل الترجمة
     */
    async loadTranslation(lang) {
        try {
            const response = await fetch(`assets/lang/${lang}.json`);
            if (!response.ok) throw new Error('Translation not found');
            
            return await response.json();
        } catch (error) {
            console.warn(`Failed to load translation for ${lang}:`, error);
            return null;
        }
    }
    
    /**
     * إنشاء عنصر واجهة ديناميكي
     */
    createUIElement(type, options = {}) {
        const element = document.createElement(type);
        
        // تطبيق الخصائص
        if (options.className) {
            element.className = options.className;
        }
        
        if (options.id) {
            element.id = options.id;
        }
        
        if (options.text) {
            element.textContent = options.text;
        }
        
        if (options.html) {
            element.innerHTML = options.html;
        }
        
        if (options.attributes) {
            Object.entries(options.attributes).forEach(([key, value]) => {
                element.setAttribute(key, value);
            });
        }
        
        if (options.styles) {
            Object.assign(element.style, options.styles);
        }
        
        if (options.parent) {
            options.parent.appendChild(element);
        }
        
        if (options.events) {
            Object.entries(options.events).forEach(([event, handler]) => {
                element.addEventListener(event, handler);
            });
        }
        
        return element;
    }
}

// Export للاستخدام العام
window.UIManager = window.UIManager || new UIManager();

// Export لأنظمة الوحدات
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UIManager;
}
