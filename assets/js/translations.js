/**
 * CipherVault 3D Pro - Translations System
 * Bilingual Support (Arabic/English)
 * Version: 4.1.0
 */

const TRANSLATIONS = {
    ar: {
        // Application
        "app-title": "سيفر فولت ثلاثي الأبعاد",
        "tagline": "تشفير عسكري المستوى · نظام لا يعرف الثقة",
        
        // Navigation
        "nav-encrypt": "تشفير",
        "nav-decrypt": "فك التشفير",
        "nav-security": "الأمان",
        "nav-settings": "الإعدادات",
        "nav-help": "المساعدة",
        
        // Encryption Card
        "encrypt-title": "تشفير الملف",
        "choose-file": "اسحب وأفلت أو انقر لاختيار ملف",
        "supported-files": "يدعم جميع أنواع الملفات حتى 5 جيجابايت",
        "password-label": "كلمة المرور (12+ حرفًا)",
        "password-placeholder": "أدخل كلمة مرور قوية...",
        "confirm-password": "تأكيد كلمة المرور",
        "confirm-placeholder": "أعد إدخال كلمة المرور...",
        "encrypt-btn": "تشفير الآن",
        
        // Decryption Card
        "decrypt-title": "فك تشفير الملف",
        "choose-encrypted-file": "اختر ملف .cvault مشفر",
        "encrypted-only": "الملفات المشفرة فقط",
        "password-label-decrypt": "كلمة مرور التشفير",
        "password-decrypt-placeholder": "أدخل كلمة المرور المستخدمة في التشفير...",
        "decrypt-btn": "فك التشفير الآن",
        
        // Password Strength
        "password-weak": "ضعيفة",
        "password-medium": "متوسطة",
        "password-strong": "قوية",
        "password-very-strong": "قوية جداً",
        "hint-length": "12+ حرف",
        "hint-uppercase": "حروف كبيرة",
        "hint-lowercase": "حروف صغيرة",
        "hint-numbers": "أرقام",
        "hint-symbols": "رموز",
        "passwords-match": "كلمات المرور متطابقة",
        "passwords-dont-match": "كلمات المرور غير متطابقة",
        
        // Options
        "compress-option": "ضغط قبل التشفير",
        "split-option": "تقسيم الملفات الكبيرة",
        "verify-option": "التحقق من سلامة الملف",
        "wipe-option": "مسح الذاكرة بعد الانتهاء",
        "keep-metadata": "الحفاظ على بيانات الملف",
        "auto-open": "فتح الملف بعد فك التشفير",
        
        // Progress
        "processing": "جاري المعالجة...",
        "processing-decrypt": "جاري فك التشفير...",
        "encrypting": "جاري التشفير...",
        "decrypting": "جاري فك التشفير...",
        "compressing": "جاري الضغط...",
        "decompressing": "جاري فك الضغط...",
        "verifying": "جاري التحقق...",
        "finalizing": "جاري الإنهاء...",
        
        // Algorithms
        "algo": "AES-256-GCM",
        "hmac": "HMAC-SHA256",
        "integrity": "فحص السلامة",
        "memory-safe": "ذاكرة آمنة",
        "high-speed": "سرعة عالية",
        
        // Statistics
        "files-processed": "الملفات المعالجة",
        "data-encrypted": "البيانات المشفرة",
        "avg-speed": "متوسط السرعة",
        "security-level": "مستوى الأمان",
        
        // Security Badges
        "aes-256": "AES-256 + ChaCha20",
        "zero-knowledge": "صفر معرفة",
        "client-side": "عميل فقط",
        "pwa-ready": "جاهز كتطبيق",
        "open-source": "مفتوح المصدر",
        
        // Footer
        "footer-text": "سيفر فولت ثلاثي الأبعاد الإصدار 4.1",
        "engine": "مشغل بـ Three.js",
        "zero-trust": "نظام لا يعرف الثقة",
        "security-audit": "مراجعة أمنية",
        "privacy": "الخصوصية",
        "docs": "التوثيق",
        "about": "حول",
        
        // Success Messages
        "success-encrypt": "تم تشفير الملف بنجاح!",
        "success-decrypt": "تم فك التشفير بنجاح!",
        "success-compress": "تم ضغط الملف بنجاح",
        "success-verify": "تم التحقق من سلامة الملف",
        
        // Error Messages
        "error-no-file": "الرجاء اختيار ملف أولاً",
        "error-no-password": "الرجاء إدخال كلمة المرور",
        "error-password-weak": "كلمة المرور ضعيفة جداً",
        "error-password-mismatch": "كلمة المرور غير صحيحة",
        "error-file-corrupt": "الملف تالف أو غير صالح",
        "error-memory": "خطأ في الذاكرة",
        "error-unknown": "حدث خطأ غير معروف",
        "error-file-too-large": "الملف كبير جداً (الحد الأقصى 5 جيجابايت)",
        "error-unsupported-file": "نوع الملف غير مدعوم",
        "error-network": "خطأ في الشبكة",
        "error-decryption-failed": "فشل فك التشفير",
        
        // Warning Messages
        "warning-weak-password": "تحذير: كلمة المرور ضعيفة",
        "warning-large-file": "تحذير: الملف كبير وقد يستغرق وقتاً",
        "warning-memory-usage": "تحذير: استخدام عالٍ للذاكرة",
        "warning-insecure-connection": "تحذير: الاتصال غير آمن",
        
        // Info Messages
        "info-select-file": "الرجاء اختيار ملف",
        "info-enter-password": "الرجاء إدخال كلمة المرور",
        "info-processing": "جاري معالجة الملف...",
        "info-complete": "اكتملت العملية",
        
        // Settings
        "settings-title": "الإعدادات",
        "settings-security": "الأمان",
        "settings-performance": "الأداء",
        "settings-privacy": "الخصوصية",
        "settings-appearance": "المظهر",
        
        // Security Levels
        "level-basic": "أساسي",
        "level-medium": "متوسط",
        "level-high": "عالي",
        "level-military": "عسكري",
        
        // Recovery
        "password-recovery": "نسيت كلمة المرور؟ استخدم أجزاء الاسترداد",
        "recovery-title": "استرداد كلمة المرور",
        "recovery-description": "كلمة المرور مقسمة إلى 5 أجزاء. تحتاج إلى 3 أجزاء على الأقل للاسترداد.",
        "recovery-upload": "رفع أجزاء الاسترداد",
        "recovery-enter-codes": "إدخال رموز الأجزاء",
        "recovery-recover": "استرداد كلمة المرور",
        
        // Audit
        "audit-title": "مراجعة الأمان",
        "audit-passed": "ناجح",
        "audit-failed": "فاشل",
        "audit-warning": "تحذير",
        
        // PWA
        "pwa-install": "تثبيت كتطبيق",
        "pwa-install-description": "تثبيت للتجربة الأفضل والاستخدام بدون إنترنت",
        "pwa-install-button": "تثبيت",
        "pwa-dismiss": "ليس الآن",
        
        // Connection
        "connection-online": "متصل بالإنترنت",
        "connection-offline": "غير متصل بالإنترنت",
        "connection-slow": "اتصال بطيء",
        
        // Time
        "time-elapsed": "الوقت المنقضي",
        "time-remaining": "الوقت المتبقي",
        "time-complete": "مكتمل",
        
        // File Info
        "file-name": "اسم الملف",
        "file-size": "حجم الملف",
        "file-type": "نوع الملف",
        "file-modified": "آخر تعديل",
        "file-created": "تاريخ الإنشاء",
        
        // Actions
        "action-clear": "مسح",
        "action-cancel": "إلغاء",
        "action-confirm": "تأكيد",
        "action-save": "حفظ",
        "action-reset": "إعادة تعيين",
        "action-close": "إغلاق",
        "action-download": "تحميل",
        "action-open": "فتح",
        "action-delete": "حذف",
        
        // Months
        "month-1": "يناير",
        "month-2": "فبراير",
        "month-3": "مارس",
        "month-4": "أبريل",
        "month-5": "مايو",
        "month-6": "يونيو",
        "month-7": "يوليو",
        "month-8": "أغسطس",
        "month-9": "سبتمبر",
        "month-10": "أكتوبر",
        "month-11": "نوفمبر",
        "month-12": "ديسمبر",
        
        // Days
        "day-sun": "الأحد",
        "day-mon": "الاثنين",
        "day-tue": "الثلاثاء",
        "day-wed": "الأربعاء",
        "day-thu": "الخميس",
        "day-fri": "الجمعة",
        "day-sat": "السبت"
    },
    
    en: {
        // Application
        "app-title": "CIPHERVAULT 3D PRO",
        "tagline": "Military-Grade Encryption · Zero Trust Architecture",
        
        // Navigation
        "nav-encrypt": "Encrypt",
        "nav-decrypt": "Decrypt",
        "nav-security": "Security",
        "nav-settings": "Settings",
        "nav-help": "Help",
        
        // Encryption Card
        "encrypt-title": "ENCRYPT FILE",
        "choose-file": "Drag & Drop or Click to Select File",
        "supported-files": "Supports ALL file types up to 5GB",
        "password-label": "PASSWORD (12+ CHARACTERS)",
        "password-placeholder": "Enter strong password...",
        "confirm-password": "CONFIRM PASSWORD",
        "confirm-placeholder": "Re-enter password...",
        "encrypt-btn": "ENCRYPT NOW",
        
        // Decryption Card
        "decrypt-title": "DECRYPT FILE",
        "choose-encrypted-file": "Select .cvault encrypted file",
        "encrypted-only": "Encrypted files only",
        "password-label-decrypt": "ENCRYPTION PASSWORD",
        "password-decrypt-placeholder": "Enter encryption password...",
        "decrypt-btn": "DECRYPT NOW",
        
        // Password Strength
        "password-weak": "WEAK",
        "password-medium": "MEDIUM",
        "password-strong": "STRONG",
        "password-very-strong": "VERY STRONG",
        "hint-length": "12+ chars",
        "hint-uppercase": "Uppercase",
        "hint-lowercase": "Lowercase",
        "hint-numbers": "Numbers",
        "hint-symbols": "Symbols",
        "passwords-match": "Passwords match",
        "passwords-dont-match": "Passwords don't match",
        
        // Options
        "compress-option": "Compress before encryption",
        "split-option": "Split large files",
        "verify-option": "Verify file integrity",
        "wipe-option": "Wipe memory after",
        "keep-metadata": "Preserve file metadata",
        "auto-open": "Open file after decryption",
        
        // Progress
        "processing": "PROCESSING...",
        "processing-decrypt": "DECRYPTING...",
        "encrypting": "ENCRYPTING...",
        "decrypting": "DECRYPTING...",
        "compressing": "COMPRESSING...",
        "decompressing": "DECOMPRESSING...",
        "verifying": "VERIFYING...",
        "finalizing": "FINALIZING...",
        
        // Algorithms
        "algo": "AES-256-GCM",
        "hmac": "HMAC-SHA256",
        "integrity": "Integrity Check",
        "memory-safe": "Memory Safe",
        "high-speed": "High Speed",
        
        // Statistics
        "files-processed": "Files Processed",
        "data-encrypted": "Data Encrypted",
        "avg-speed": "Avg Speed",
        "security-level": "Security Level",
        
        // Security Badges
        "aes-256": "AES-256 + ChaCha20",
        "zero-knowledge": "Zero-Knowledge",
        "client-side": "Client-Side Only",
        "pwa-ready": "PWA Ready",
        "open-source": "Open Source",
        
        // Footer
        "footer-text": "CipherVault 3D Pro v4.1",
        "engine": "Three.js Powered",
        "zero-trust": "Zero-Trust Architecture",
        "security-audit": "Security Audit",
        "privacy": "Privacy",
        "docs": "Documentation",
        "about": "About",
        
        // Success Messages
        "success-encrypt": "File encrypted successfully!",
        "success-decrypt": "File decrypted successfully!",
        "success-compress": "File compressed successfully",
        "success-verify": "File integrity verified",
        
        // Error Messages
        "error-no-file": "Please select a file first",
        "error-no-password": "Please enter password",
        "error-password-weak": "Password is too weak",
        "error-password-mismatch": "Incorrect password",
        "error-file-corrupt": "File is corrupted or invalid",
        "error-memory": "Memory error",
        "error-unknown": "An unknown error occurred",
        "error-file-too-large": "File too large (max 5GB)",
        "error-unsupported-file": "Unsupported file type",
        "error-network": "Network error",
        "error-decryption-failed": "Decryption failed",
        
        // Warning Messages
        "warning-weak-password": "Warning: Password is weak",
        "warning-large-file": "Warning: Large file may take time",
        "warning-memory-usage": "Warning: High memory usage",
        "warning-insecure-connection": "Warning: Insecure connection",
        
        // Info Messages
        "info-select-file": "Please select a file",
        "info-enter-password": "Please enter password",
        "info-processing": "Processing file...",
        "info-complete": "Operation complete",
        
        // Settings
        "settings-title": "Settings",
        "settings-security": "Security",
        "settings-performance": "Performance",
        "settings-privacy": "Privacy",
        "settings-appearance": "Appearance",
        
        // Security Levels
        "level-basic": "Basic",
        "level-medium": "Medium",
        "level-high": "High",
        "level-military": "Military",
        
        // Recovery
        "password-recovery": "Forgot password? Use recovery shards",
        "recovery-title": "Password Recovery",
        "recovery-description": "Your password is split into 5 recovery shards. You need at least 3 shards to recover access.",
        "recovery-upload": "Upload Shard Files",
        "recovery-enter-codes": "Enter Shard Codes",
        "recovery-recover": "Recover Password",
        
        // Audit
        "audit-title": "Security Audit",
        "audit-passed": "PASSED",
        "audit-failed": "FAILED",
        "audit-warning": "WARNING",
        
        // PWA
        "pwa-install": "Install CipherVault Pro",
        "pwa-install-description": "Install as app for better experience and offline access",
        "pwa-install-button": "Install",
        "pwa-dismiss": "Not Now",
        
        // Connection
        "connection-online": "Online",
        "connection-offline": "Offline",
        "connection-slow": "Slow Connection",
        
        // Time
        "time-elapsed": "Time Elapsed",
        "time-remaining": "Time Remaining",
        "time-complete": "Complete",
        
        // File Info
        "file-name": "File Name",
        "file-size": "File Size",
        "file-type": "File Type",
        "file-modified": "Last Modified",
        "file-created": "Created",
        
        // Actions
        "action-clear": "Clear",
        "action-cancel": "Cancel",
        "action-confirm": "Confirm",
        "action-save": "Save",
        "action-reset": "Reset",
        "action-close": "Close",
        "action-download": "Download",
        "action-open": "Open",
        "action-delete": "Delete",
        
        // Months
        "month-1": "January",
        "month-2": "February",
        "month-3": "March",
        "month-4": "April",
        "month-5": "May",
        "month-6": "June",
        "month-7": "July",
        "month-8": "August",
        "month-9": "September",
        "month-10": "October",
        "month-11": "November",
        "month-12": "December",
        
        // Days
        "day-sun": "Sunday",
        "day-mon": "Monday",
        "day-tue": "Tuesday",
        "day-wed": "Wednesday",
        "day-thu": "Thursday",
        "day-fri": "Friday",
        "day-sat": "Saturday"
    }
};

// ============================================================================
// TRANSLATION SYSTEM
// ============================================================================

class TranslationSystem {
    constructor() {
        this.currentLang = 'en';
        this.fallbackLang = 'en';
        this.translations = TRANSLATIONS;
        this.rtlLanguages = ['ar', 'he', 'fa', 'ur'];
        this.initialized = false;
        
        // Load saved language preference
        this.loadLanguagePreference();
    }
    
    /**
     * Initialize translation system
     */
    init() {
        if (this.initialized) return;
        
        // Set initial language
        this.setLanguage(this.currentLang);
        
        // Watch for language changes
        this.setupLanguageSwitcher();
        
        this.initialized = true;
        console.log('Translation system initialized:', this.currentLang);
    }
    
    /**
     * Set current language
     */
    setLanguage(lang) {
        if (!this.translations[lang]) {
            console.warn(`Language "${lang}" not found, falling back to "${this.fallbackLang}"`);
            lang = this.fallbackLang;
        }
        
        this.currentLang = lang;
        
        // Update HTML attributes
        document.documentElement.lang = lang;
        document.documentElement.dir = this.isRTL(lang) ? 'rtl' : 'ltr';
        
        // Update all translatable elements
        this.updatePageTranslations();
        
        // Update UI elements
        this.updateLanguageSwitcher();
        
        // Save preference
        this.saveLanguagePreference();
        
        // Dispatch event
        this.dispatchLanguageChange(lang);
        
        return lang;
    }
    
    /**
     * Get translation for key
     */
    t(key, params = {}) {
        let translation = this.translations[this.currentLang]?.[key] || 
                         this.translations[this.fallbackLang]?.[key] || 
                         key;
        
        // Replace parameters
        if (params && typeof params === 'object') {
            Object.keys(params).forEach(param => {
                const regex = new RegExp(`\\{${param}\\}`, 'g');
                translation = translation.replace(regex, params[param]);
            });
        }
        
        return translation;
    }
    
    /**
     * Get translation with pluralization
     */
    tPlural(key, count, params = {}) {
        const pluralKey = `${key}.${count === 1 ? 'singular' : 'plural'}`;
        return this.t(pluralKey, { count, ...params }) || this.t(key, { count, ...params });
    }
    
    /**
     * Update all translatable elements on page
     */
    updatePageTranslations() {
        // Update elements with data-i18n attribute
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = this.t(key);
            
            if (translation && translation !== key) {
                // Handle different element types
                if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                    element.placeholder = translation;
                } else if (element.hasAttribute('title')) {
                    element.title = translation;
                } else if (element.hasAttribute('alt')) {
                    element.alt = translation;
                } else {
                    element.textContent = translation;
                }
            }
        });
        
        // Update elements with data-i18n-html attribute
        document.querySelectorAll('[data-i18n-html]').forEach(element => {
            const key = element.getAttribute('data-i18n-html');
            const translation = this.t(key);
            
            if (translation && translation !== key) {
                element.innerHTML = translation;
            }
        });
        
        // Update elements with data-i18n-attr attribute
        document.querySelectorAll('[data-i18n-attr]').forEach(element => {
            const attrValue = element.getAttribute('data-i18n-attr');
            const [attr, key] = attrValue.split(':');
            
            if (attr && key) {
                const translation = this.t(key);
                if (translation && translation !== key) {
                    element.setAttribute(attr, translation);
                }
            }
        });
        
        // Update numbers and dates based on locale
        this.updateLocaleFormatting();
    }
    
    /**
     * Update locale-specific formatting
     */
    updateLocaleFormatting() {
        // Format numbers
        document.querySelectorAll('[data-i18n-number]').forEach(element => {
            const value = parseFloat(element.textContent);
            if (!isNaN(value)) {
                element.textContent = value.toLocaleString(this.currentLang);
            }
        });
        
        // Format dates
        document.querySelectorAll('[data-i18n-date]').forEach(element => {
            const date = new Date(element.textContent);
            if (!isNaN(date.getTime())) {
                element.textContent = date.toLocaleDateString(this.currentLang, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
            }
        });
        
        // Format times
        document.querySelectorAll('[data-i18n-time]').forEach(element => {
            const time = parseInt(element.textContent);
            if (!isNaN(time)) {
                if (time < 60) {
                    element.textContent = this.t('time-seconds', { seconds: time });
                } else if (time < 3600) {
                    element.textContent = this.t('time-minutes', { minutes: Math.floor(time / 60) });
                } else {
                    element.textContent = this.t('time-hours', { hours: Math.floor(time / 3600) });
                }
            }
        });
    }
    
    /**
     * Check if language is RTL
     */
    isRTL(lang) {
        return this.rtlLanguages.includes(lang);
    }
    
    /**
     * Get current language direction
     */
    getDirection() {
        return this.isRTL(this.currentLang) ? 'rtl' : 'ltr';
    }
    
    /**
     * Get available languages
     */
    getAvailableLanguages() {
        return Object.keys(this.translations).map(code => ({
            code,
            name: this.getLanguageName(code),
            nativeName: this.getNativeLanguageName(code),
            direction: this.isRTL(code) ? 'rtl' : 'ltr',
            flag: this.getLanguageFlag(code)
        }));
    }
    
    /**
     * Get language name in current language
     */
    getLanguageName(code) {
        const names = {
            ar: 'Arabic',
            en: 'English'
        };
        return this.t(`language-${code}`) || names[code] || code;
    }
    
    /**
     * Get native language name
     */
    getNativeLanguageName(code) {
        const nativeNames = {
            ar: 'العربية',
            en: 'English'
        };
        return nativeNames[code] || code;
    }
    
    /**
     * Get language flag emoji
     */
    getLanguageFlag(code) {
        const flags = {
            ar: '🇸🇦',
            en: '🇺🇸'
        };
        return flags[code] || '🌐';
    }
    
    /**
     * Setup language switcher UI
     */
    setupLanguageSwitcher() {
        // Create language switcher if it doesn't exist
        if (!document.querySelector('.language-switcher')) {
            this.createLanguageSwitcher();
        }
        
        // Add click handlers to language options
        document.querySelectorAll('.lang-option').forEach(option => {
            option.addEventListener('click', (e) => {
                const lang = e.currentTarget.dataset.lang;
                if (lang && lang !== this.currentLang) {
                    this.setLanguage(lang);
                }
            });
        });
    }
    
    /**
     * Create language switcher UI
     */
    createLanguageSwitcher() {
        const languages = this.getAvailableLanguages();
        
        const switcherHTML = `
            <div class="language-switcher dropdown">
                <button class="dropdown-toggle" data-i18n="current-language">
                    <span class="flag">${this.getLanguageFlag(this.currentLang)}</span>
                    <span class="language-name">${this.getLanguageName(this.currentLang)}</span>
                    <i class="fas fa-chevron-down"></i>
                </button>
                <div class="dropdown-menu">
                    ${languages.map(lang => `
                        <div class="dropdown-item lang-option ${lang.code === this.currentLang ? 'active' : ''}" 
                             data-lang="${lang.code}"
                             data-direction="${lang.direction}">
                            <span class="flag">${lang.flag}</span>
                            <span class="language-name">${lang.nativeName}</span>
                            <span class="language-english">${lang.name}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        
        // Insert switcher into the language selector
        const languageSelector = document.querySelector('.language-selector-3d');
        if (languageSelector) {
            languageSelector.innerHTML = switcherHTML;
        }
    }
    
    /**
     * Update language switcher UI
     */
    updateLanguageSwitcher() {
        const dropdownToggle = document.querySelector('.language-switcher .dropdown-toggle');
        const langOptions = document.querySelectorAll('.lang-option');
        
        if (dropdownToggle) {
            const flagSpan = dropdownToggle.querySelector('.flag');
            const nameSpan = dropdownToggle.querySelector('.language-name');
            
            if (flagSpan) flagSpan.textContent = this.getLanguageFlag(this.currentLang);
            if (nameSpan) nameSpan.textContent = this.getLanguageName(this.currentLang);
        }
        
        // Update active state
        langOptions.forEach(option => {
            const lang = option.dataset.lang;
            if (lang === this.currentLang) {
                option.classList.add('active');
            } else {
                option.classList.remove('active');
            }
        });
    }
    
    /**
     * Load language preference from storage
     */
    loadLanguagePreference() {
        try {
            const savedLang = localStorage.getItem('ciphervault_language');
            const browserLang = navigator.language.split('-')[0];
            
            if (savedLang && this.translations[savedLang]) {
                this.currentLang = savedLang;
            } else if (this.translations[browserLang]) {
                this.currentLang = browserLang;
            }
        } catch (error) {
            console.warn('Failed to load language preference:', error);
        }
    }
    
    /**
     * Save language preference to storage
     */
    saveLanguagePreference() {
        try {
            localStorage.setItem('ciphervault_language', this.currentLang);
        } catch (error) {
            console.warn('Failed to save language preference:', error);
        }
    }
    
    /**
     * Dispatch language change event
     */
    dispatchLanguageChange(lang) {
        const event = new CustomEvent('languageChanged', {
            detail: {
                language: lang,
                direction: this.getDirection(),
                isRTL: this.isRTL(lang)
            }
        });
        
        document.dispatchEvent(event);
        
        // Also trigger a global event
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('ciphervault:languageChanged', {
                detail: { language: lang }
            }));
        }
    }
    
    /**
     * Format date according to current locale
     */
    formatDate(date, options = {}) {
        const defaultOptions = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        
        return new Date(date).toLocaleDateString(
            this.currentLang, 
            { ...defaultOptions, ...options }
        );
    }
    
    /**
     * Format number according to current locale
     */
    formatNumber(number, options = {}) {
        return Number(number).toLocaleString(this.currentLang, options);
    }
    
    /**
     * Format currency according to current locale
     */
    formatCurrency(amount, currency = 'USD', options = {}) {
        return amount.toLocaleString(this.currentLang, {
            style: 'currency',
            currency,
            ...options
        });
    }
    
    /**
     * Get localized file size
     */
    formatFileSize(bytes) {
        const sizes = this.currentLang === 'ar' 
            ? ['بايت', 'كيلوبايت', 'ميجابايت', 'جيجابايت', 'تيرابايت']
            : ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        
        if (bytes === 0) return `0 ${sizes[0]}`;
        
        const k = 1024;
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        const size = parseFloat((bytes / Math.pow(k, i)).toFixed(2));
        
        return `${size} ${sizes[i]}`;
    }
    
    /**
     * Get localized time duration
     */
    formatDuration(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        
        if (hours > 0) {
            return this.t('time-hours-minutes', {
                hours,
                minutes: minutes % 60
            });
        } else if (minutes > 0) {
            return this.t('time-minutes-seconds', {
                minutes,
                seconds: seconds % 60
            });
        } else {
            return this.t('time-seconds', { seconds });
        }
    }
}

// ============================================================================
// EXPORT AND INITIALIZATION
// ============================================================================

// Create global translation instance
const TranslationManager = new TranslationSystem();

// Make available globally
if (typeof window !== 'undefined') {
    window.TranslationManager = TranslationManager;
    window.t = TranslationManager.t.bind(TranslationManager);
    window.formatFileSize = TranslationManager.formatFileSize.bind(TranslationManager);
    window.formatDuration = TranslationManager.formatDuration.bind(TranslationManager);
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        TranslationManager.init();
    });
} else {
    TranslationManager.init();
}

// Export for ES modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        TRANSLATIONS,
        TranslationManager,
        TranslationSystem
    };
}
