// === إضافة في بداية الملف بعد المتغيرات ===
let securityAudit;
let cryptoWorkerManager;
let militaryCrypto;
let securityLevel = 'STANDARD';

// === دالة التهيئة المحسنة ===
async function initApp() {
    try {
        // 1. تحقق من بيئة الأمان
        await checkSecurityEnvironment();
        
        // 2. تهيئة Three.js
        initThreeJS();
        
        // 3. تهيئة نظام الأمان
        await initSecuritySystems();
        
        // 4. تهيئة اللغة
        setLanguage('en');
        
        // 5. إعداد Service Worker لـ PWA
        await initServiceWorker();
        
        // 6. إعداد واجهة المستخدم
        setupUI();
        
        // 7. تسجيل حدث البدء
        await securityAudit.logEvent('APPLICATION_STARTED', 'INFO');
        
        // 8. التحقق من التحديثات
        checkForUpdates();
        
    } catch (error) {
        console.error('Application initialization failed:', error);
        showFatalError('Failed to initialize application. Please refresh.');
    }
}

async function checkSecurityEnvironment() {
    // التحقق من HTTPS
    if (!window.isSecureContext) {
        const proceed = await showSecurityWarning(
            'For maximum security, please use HTTPS.',
            'Continue anyway?'
        );
        if (!proceed) {
            window.location.href = 'https://' + window.location.host;
        }
    }
    
    // التحقق من Web Crypto API
    if (!window.crypto || !window.crypto.subtle) {
        throw new Error('Web Crypto API is not supported');
    }
    
    // التحقق من Web Workers
    if (!window.Worker) {
        showStatus('general', 'Web Workers not available - performance may be affected', 'warning');
    }
}

async function initSecuritySystems() {
    // نظام التدقيق الأمني
    securityAudit = new SecurityAuditSystem();
    
    // نظام Web Workers
    cryptoWorkerManager = new CryptoWorkerManager();
    
    // نظام التشفير العسكري
    militaryCrypto = new MilitaryGradeCrypto();
    
    // إعداد مستوى الأمان
    securityLevel = await determineSecurityLevel();
    
    // تحديث واجهة مستوى الأمان
    updateSecurityUI();
}

async function initServiceWorker() {
    if ('serviceWorker' in navigator) {
        try {
            const registration = await navigator.serviceWorker.register('/service-worker.js');
            
            registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        showUpdateNotification();
                    }
                });
            });
            
            // طلب الإذن للإشعارات
            if ('Notification' in window && Notification.permission === 'default') {
                await Notification.requestPermission();
            }
            
        } catch (error) {
            console.warn('Service Worker registration failed:', error);
        }
    }
}

async function determineSecurityLevel() {
    const factors = {
        https: window.isSecureContext ? 30 : 0,
        crypto: window.crypto && window.crypto.subtle ? 20 : 0,
        workers: window.Worker ? 15 : 0,
        storage: 'storage' in navigator ? 10 : 0,
        memory: navigator.deviceMemory >= 4 ? 10 : 5,
        cpu: navigator.hardwareConcurrency >= 4 ? 15 : 5
    };
    
    const score = Object.values(factors).reduce((a, b) => a + b, 0);
    
    if (score >= 80) return 'MILITARY';
    if (score >= 60) return 'HIGH';
    if (score >= 40) return 'MEDIUM';
    return 'BASIC';
}

function updateSecurityUI() {
    const indicator = document.getElementById('securityLevelIndicator');
    if (indicator) {
        indicator.textContent = `Security: ${securityLevel}`;
        indicator.className = `security-level-${securityLevel.toLowerCase()}`;
    }
    
    // تحديث خيارات التشفير بناء على مستوى الأمان
    updateEncryptionOptions();
}

function updateEncryptionOptions() {
    const options = {
        MILITARY: {
            iterations: 600000,
            keySize: 32,
            layers: 3,
            hmac: 'SHA-512'
        },
        HIGH: {
            iterations: 310000,
            keySize: 32,
            layers: 2,
            hmac: 'SHA-256'
        },
        MEDIUM: {
            iterations: 100000,
            keySize: 32,
            layers: 1,
            hmac: 'SHA-256'
        },
        BASIC: {
            iterations: 100000,
            keySize: 32,
            layers: 1,
            hmac: 'SHA-256'
        }
    };
    
    const config = options[securityLevel];
    
    // تحديث واجهة المستخدم
    document.querySelectorAll('.security-setting').forEach(el => {
        const key = el.dataset.setting;
        if (config[key]) {
            el.textContent = config[key];
        }
    });
}

// === تحديث دالة handleEncrypt ===
async function handleEncrypt() {
    try {
        // التحقق من المدخلات
        const validation = await validateEncryptionInputs();
        if (!validation.valid) {
            showStatus('encrypt', validation.message, 'error');
            return;
        }
        
        // تسجيل بدء العملية
        await securityAudit.logEvent('ENCRYPTION_STARTED', 'INFO');
        
        // تأكيد الأمان للملفات الكبيرة
        const file = document.getElementById('fileInputEncrypt').files[0];
        if (file.size > 100 * 1024 * 1024) { // 100MB
            const confirmed = await showSecurityConfirmation(
                'Large file encryption',
                'Encrypting large files may take time and resources. Continue?'
            );
            if (!confirmed) return;
        }
        
        // تعطيل الواجهة
        setUIState('encrypt', 'processing');
        
        // اختيار طريقة التشفير بناء على الحجم
        let result;
        const password = document.getElementById('passwordEncrypt').value;
        const options = getEncryptionOptions();
        
        if (file.size > 500 * 1024 * 1024) { // 500MB
            // استخدام Web Workers
            result = await cryptoWorkerManager.processFile(
                file,
                'encrypt',
                password,
                options
            );
        } else {
            // التشفير المباشر
            result = await militaryCrypto.encryptWithProtection(
                file,
                password,
                options
            );
        }
        
        // إنشاء الملف للتحميل
        await createDownloadFile(result, file.name);
        
        // تسجيل النجاح
        await securityAudit.logEvent('ENCRYPTION_COMPLETED', 'INFO');
        
        // عرض النجاح
        showStatus('encrypt', 'success-encrypt', 'success');
        
        // تحديث الإحصائيات
        updateStats(file.size, 'encrypt');
        
        // تنظيف
        cleanupAfterOperation();
        
    } catch (error) {
        // تسجيل الخطأ
        await securityAudit.logEvent(`ENCRYPTION_FAILED: ${error.message}`, 'ERROR');
        
        // عرض الخطأ
        showStatus('encrypt', error.message, 'error');
        
        // إجراءات الطوارئ
        emergencyCleanup();
    } finally {
        // إعادة تفعيل الواجهة
        setUIState('encrypt', 'ready');
    }
}

async function validateEncryptionInputs() {
    const fileInput = document.getElementById('fileInputEncrypt');
    const passwordInput = document.getElementById('passwordEncrypt');
    const file = fileInput.files[0];
    const password = passwordInput.value;
    
    if (!file) {
        return { valid: false, message: 'error-no-file' };
    }
    
    if (!password) {
        return { valid: false, message: 'error-no-password' };
    }
    
    // التحقق من قوة كلمة المرور
    const strength = checkPasswordStrength(password);
    if (strength === 'weak') {
        const bypass = await showPasswordWarning();
        if (!bypass) {
            return { valid: false, message: 'error-password-weak' };
        }
    }
    
    // التحقق من حجم الملف
    if (file.size > MAX_FILE_SIZE) {
        return { valid: false, message: 'File too large (max 5GB)' };
    }
    
    // التحقق من نوع الملف
    if (!validateFileType(file)) {
        return { valid: false, message: 'Unsupported file type' };
    }
    
    return { valid: true };
}

function getEncryptionOptions() {
    return {
        compress: document.getElementById('compressOption').checked,
        split: document.getElementById('splitOption').checked,
        securityLevel: securityLevel,
        timestamp: Date.now(),
        metadata: {
            originalName: document.getElementById('fileInputEncrypt').files[0].name,
            size: document.getElementById('fileInputEncrypt').files[0].size,
            type: document.getElementById('fileInputEncrypt').files[0].type
        }
    };
}

async function createDownloadFile(result, originalName) {
    // إنشاء اسم آمن
    const safeName = generateSafeFilename(originalName, result.metadata);
    
    // إنشاء Blob
    const blob = new Blob([result.encryptedData], {
        type: 'application/octet-stream'
    });
    
    // إضافة metadata كـ custom attribute
    blob.metadata = result.metadata;
    
    // التحميل
    downloadFile(safeName, blob);
    
    // تخزين معلومات الاسترداد
    if (result.metadata.recoveryShards) {
        await storeRecoveryInfo(result.metadata.recoveryShards, safeName);
    }
}

function generateSafeFilename(originalName, metadata) {
    const timestamp = Date.now();
    const randomId = crypto.getRandomValues(new Uint8Array(8))
        .reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');
    
    const extension = securityLevel === 'MILITARY' ? '.cvmil' : '.cvault';
    
    return `encrypted_${timestamp}_${randomId}${extension}`;
}

async function storeRecoveryInfo(shards, filename) {
    // تخزين في IndexedDB
    const db = await openRecoveryDB();
    const tx = db.transaction(['recovery'], 'readwrite');
    const store = tx.objectStore('recovery');
    
    await store.put({
        id: crypto.randomUUID(),
        filename,
        shards,
        created: Date.now(),
        expires: Date.now() + (30 * 24 * 60 * 60 * 1000) // 30 يوم
    });
    
    return tx.complete;
}

function openRecoveryDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('CipherVaultRecovery', 1);
        
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('recovery')) {
                const store = db.createObjectStore('recovery', { keyPath: 'id' });
                store.createIndex('filename', 'filename', { unique: false });
                store.createIndex('created', 'created', { unique: false });
            }
        };
        
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

function setUIState(operation, state) {
    const btn = document.getElementById(`${operation}Btn`);
    const card = document.querySelector(`.${operation}-card`);
    
    switch (state) {
        case 'processing':
            btn.disabled = true;
            btn.innerHTML = `
                <div class="btn-content">
                    <i class="fas fa-spinner fa-spin"></i>
                    <span data-i18n="processing">PROCESSING...</span>
                </div>
            `;
            if (card) card.classList.add('flipped');
            break;
            
        case 'ready':
            btn.disabled = false;
            btn.innerHTML = `
                <div class="btn-content">
                    <i class="fas fa-lock"></i>
                    <span data-i18n="encrypt-btn">ENCRYPT NOW</span>
                </div>
                <div class="btn-glow"></div>
            `;
            if (card) card.classList.remove('flipped');
            break;
    }
}

function cleanupAfterOperation() {
    // مسح كلمات المرور
    ['passwordEncrypt', 'passwordDecrypt'].forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            securityAudit.secureWipeString(input.value);
            input.value = '';
        }
    });
    
    // مسح ملفات الإدخال
    ['fileInputEncrypt', 'fileInputDecrypt'].forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.value = '';
        }
    });
    
    // إخفاء معلومات الملف
    ['encryptFileInfo', 'decryptFileInfo'].forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.style.display = 'none';
        }
    });
    
    // إعادة تعيين مقاييس القوة
    const strengthBar = document.querySelector('#passwordStrengthEncrypt .strength-bar');
    const strengthText = document.querySelector('#passwordStrengthEncrypt .strength-text');
    if (strengthBar && strengthText) {
        strengthBar.className = 'strength-bar weak';
        strengthText.textContent = translations[currentLang]['password-weak'];
    }
    
    // إفراغ الذاكرة المؤقتة
    if (window.gc) {
        window.gc();
    }
}

function emergencyCleanup() {
    // مسح فوري للبيانات الحساسة
    const sensitiveData = [
        'passwordEncrypt',
        'passwordDecrypt',
        'fileInputEncrypt',
        'fileInputDecrypt'
    ];
    
    sensitiveData.forEach(id => {
        const element = document.getElementById(id);
        if (element && element.value) {
            // Overwrite multiple times
            const value = element.value;
            for (let i = 0; i < 3; i++) {
                element.value = crypto.getRandomValues(new Uint8Array(value.length));
            }
            element.value = '';
        }
    });
    
    // إيقاف جميع العمال
    if (cryptoWorkerManager) {
        cryptoWorkerManager.terminateAll();
    }
    
    // إغلاق جميع اتصالات قاعدة البيانات
    if (indexedDB.databases) {
        indexedDB.databases().then(databases => {
            databases.forEach(db => {
                if (db.name.includes('CipherVault')) {
                    indexedDB.deleteDatabase(db.name);
                }
            });
        });
    }
}

async function showSecurityConfirmation(title, message) {
    return new Promise((resolve) => {
        const modal = document.createElement('div');
        modal.className = 'security-confirmation-modal active';
        modal.innerHTML = `
            <div class="security-confirmation-content">
                <div class="security-confirmation-icon">
                    <i class="fas fa-shield-alt"></i>
                </div>
                <h3>${title}</h3>
                <p class="security-confirmation-text">${message}</p>
                <div class="security-confirmation-buttons">
                    <button class="btn-3d btn-encrypt" id="confirmYes">
                        <i class="fas fa-check"></i> Yes, Continue
                    </button>
                    <button class="btn-3d btn-decrypt" id="confirmNo">
                        <i class="fas fa-times"></i> Cancel
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        document.getElementById('confirmYes').onclick = () => {
            document.body.removeChild(modal);
            resolve(true);
        };
        
        document.getElementById('confirmNo').onclick = () => {
            document.body.removeChild(modal);
            resolve(false);
        };
    });
}

async function showPasswordWarning() {
    return new Promise((resolve) => {
        const modal = document.createElement('div');
        modal.className = 'security-confirmation-modal active';
        modal.innerHTML = `
            <div class="security-confirmation-content">
                <div class="security-confirmation-icon" style="color: var(--warning);">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <h3>Weak Password Detected</h3>
                <p class="security-confirmation-text">
                    Your password does not meet recommended security standards.<br>
                    <strong>Recommendations:</strong><br>
                    • At least 12 characters<br>
                    • Mix of uppercase and lowercase<br>
                    • Include numbers and symbols<br><br>
                    Continue with weak password?
                </p>
                <div class="security-confirmation-buttons">
                    <button class="btn-3d btn-decrypt" id="weakPasswordYes">
                        <i class="fas fa-shield-alt"></i> Use Anyway
                    </button>
                    <button class="btn-3d btn-encrypt" id="weakPasswordNo">
                        <i class="fas fa-edit"></i> Change Password
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        document.getElementById('weakPasswordYes').onclick = () => {
            document.body.removeChild(modal);
            resolve(true);
        };
        
        document.getElementById('weakPasswordNo').onclick = () => {
            document.body.removeChild(modal);
            resolve(false);
        };
    });
}

function checkForUpdates() {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({ type: 'CHECK_FOR_UPDATES' });
    }
}

function showUpdateNotification() {
    const notification = document.createElement('div');
    notification.className = 'update-notification';
    notification.innerHTML = `
        <div class="update-content">
            <i class="fas fa-sync-alt"></i>
            <span>New version available. Click to update.</span>
            <button onclick="location.reload()">Update Now</button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOut 0.3s ease forwards';
            setTimeout(() => {
                if (notification.parentNode) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }
    }, 10000);
}

// === تحديث دالة setLanguage ===
function setLanguage(lang) {
    currentLang = lang;
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    
    // تحديث جميع العناصر القابلة للترجمة
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[lang][key]) {
            el.textContent = translations[lang][key];
        }
    });
    
    // تحديث محدد اللغة
    document.querySelectorAll('.lang-option').forEach(option => {
        option.classList.toggle('active', option.dataset.lang === lang);
    });
    
    // تحديث الفواصل والأرقام بناءً على اللغة
    updateLocaleFormatting(lang);
    
    // تسجيل تغيير اللغة
    securityAudit.logEvent(`LANGUAGE_CHANGED_TO_${lang.toUpperCase()}`, 'INFO');
}

function updateLocaleFormatting(lang) {
    // تحديث تنسيق الأرقام والتواريخ
    const numbers = document.querySelectorAll('.number-format');
    numbers.forEach(el => {
        const value = parseFloat(el.textContent);
        if (!isNaN(value)) {
            el.textContent = value.toLocaleString(lang);
        }
    });
    
    // تحديث التواريخ
    const dates = document.querySelectorAll('.date-format');
    dates.forEach(el => {
        const date = new Date(el.textContent);
        if (!isNaN(date.getTime())) {
            el.textContent = date.toLocaleDateString(lang, {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }
    });
}

// === إضافة أداة الإدارة المتقدمة ===
function showAdvancedSettings() {
    const settings = document.getElementById('advancedSettings');
    if (settings) {
        settings.classList.toggle('active');
        
        if (settings.classList.contains('active')) {
            loadAdvancedSettings();
        }
    }
}

async function loadAdvancedSettings() {
    const container = document.getElementById('advancedSettingsContent');
    if (!container) return;
    
    const settings = {
        security: {
            title: 'Security Settings',
            options: [
                {
                    id: 'autoWipe',
                    title: 'Auto Wipe Memory',
                    description: 'Automatically wipe sensitive data from memory after operations',
                    type: 'toggle',
                    default: true
                },
                {
                    id: 'sessionTimeout',
                    title: 'Session Timeout',
                    description: 'Automatically wipe data after inactivity period',
                    type: 'select',
                    options: [
                        { value: '5', label: '5 minutes' },
                        { value: '15', label: '15 minutes' },
                        { value: '30', label: '30 minutes' },
                        { value: '60', label: '1 hour' },
                        { value: '0', label: 'Never' }
                    ],
                    default: '15'
                },
                {
                    id: 'encryptionLevel',
                    title: 'Encryption Level',
                    description: 'Adjust encryption strength based on your needs',
                    type: 'select',
                    options: [
                        { value: 'BASIC', label: 'Basic (Faster)' },
                        { value: 'MEDIUM', label: 'Medium (Balanced)' },
                        { value: 'HIGH', label: 'High (Secure)' },
                        { value: 'MILITARY', label: 'Military (Maximum)' }
                    ],
                    default: securityLevel
                }
            ]
        },
        performance: {
            title: 'Performance Settings',
            options: [
                {
                    id: 'useWorkers',
                    title: 'Use Web Workers',
                    description: 'Process files in background threads for better performance',
                    type: 'toggle',
                    default: true
                },
                {
                    id: 'chunkSize',
                    title: 'Chunk Size',
                    description: 'Size of file chunks for processing',
                    type: 'select',
                    options: [
                        { value: '1048576', label: '1 MB' },
                        { value: '5242880', label: '5 MB' },
                        { value: '10485760', label: '10 MB' },
                        { value: '20971520', label: '20 MB' }
                    ],
                    default: '10485760'
                },
                {
                    id: 'maxWorkers',
                    title: 'Max Workers',
                    description: 'Maximum number of parallel workers',
                    type: 'range',
                    min: 1,
                    max: navigator.hardwareConcurrency || 8,
                    step: 1,
                    default: Math.min(4, navigator.hardwareConcurrency || 4)
                }
            ]
        },
        interface: {
            title: 'Interface Settings',
            options: [
                {
                    id: 'animations',
                    title: 'Animations',
                    description: 'Enable/disable interface animations',
                    type: 'toggle',
                    default: true
                },
                {
                    id: 'darkMode',
                    title: 'Dark Mode',
                    description: 'Use dark color scheme',
                    type: 'toggle',
                    default: window.matchMedia('(prefers-color-scheme: dark)').matches
                },
                {
                    id: 'reducedMotion',
                    title: 'Reduced Motion',
                    description: 'Reduce animations for accessibility',
                    type: 'toggle',
                    default: window.matchMedia('(prefers-reduced-motion: reduce)').matches
                }
            ]
        }
    };
    
    let html = '';
    
    for (const [category, data] of Object.entries(settings)) {
        html += `
            <div class="setting-group">
                <h4>${data.title}</h4>
                <div class="settings-grid">
        `;
        
        for (const option of data.options) {
            html += createSettingHTML(option);
        }
        
        html += `
                </div>
            </div>
        `;
    }
    
    container.innerHTML = html;
    
    // إضافة معالجات الأحداث
    setupSettingHandlers();
}

function createSettingHTML(option) {
    switch (option.type) {
        case 'toggle':
            return `
                <div class="setting-option">
                    <div class="setting-info">
                        <div class="setting-title">${option.title}</div>
                        <div class="setting-description">${option.description}</div>
                    </div>
                    <div class="setting-control">
                        <label class="switch">
                            <input type="checkbox" id="${option.id}" 
                                   ${option.default ? 'checked' : ''}>
                            <span class="slider"></span>
                        </label>
                    </div>
                </div>
            `;
            
        case 'select':
            let optionsHTML = '';
            for (const opt of option.options) {
                optionsHTML += `<option value="${opt.value}" 
                    ${opt.value === option.default ? 'selected' : ''}>
                    ${opt.label}
                </option>`;
            }
            
            return `
                <div class="setting-option">
                    <div class="setting-info">
                        <div class="setting-title">${option.title}</div>
                        <div class="setting-description">${option.description}</div>
                    </div>
                    <div class="setting-control">
                        <select id="${option.id}" class="setting-select">
                            ${optionsHTML}
                        </select>
                    </div>
                </div>
            `;
            
        case 'range':
            return `
                <div class="setting-option">
                    <div class="setting-info">
                        <div class="setting-title">${option.title}</div>
                        <div class="setting-description">${option.description}</div>
                    </div>
                    <div class="setting-control">
                        <input type="range" id="${option.id}" 
                               min="${option.min}" max="${option.max}" 
                               step="${option.step}" value="${option.default}"
                               class="setting-range">
                        <span class="range-value" id="${option.id}Value">${option.default}</span>
                    </div>
                </div>
            `;
    }
}

function setupSettingHandlers() {
    // معالجة التبديلات
    document.querySelectorAll('.setting-option input[type="checkbox"]').forEach(input => {
        input.addEventListener('change', async (e) => {
            const value = e.target.checked;
            const id = e.target.id;
            
            await saveSetting(id, value);
            applySetting(id, value);
        });
    });
    
    // معالجة القوائم المنسدلة
    document.querySelectorAll('.setting-select').forEach(select => {
        select.addEventListener('change', async (e) => {
            const value = e.target.value;
            const id = e.target.id;
            
            await saveSetting(id, value);
            applySetting(id, value);
        });
    });
    
    // معالجة النطاقات
    document.querySelectorAll('.setting-range').forEach(range => {
        const valueSpan = document.getElementById(`${range.id}Value`);
        if (valueSpan) {
            valueSpan.textContent = range.value;
        }
        
        range.addEventListener('input', (e) => {
            const valueSpan = document.getElementById(`${e.target.id}Value`);
            if (valueSpan) {
                valueSpan.textContent = e.target.value;
            }
        });
        
        range.addEventListener('change', async (e) => {
            const value = e.target.value;
            const id = e.target.id;
            
            await saveSetting(id, value);
            applySetting(id, value);
        });
    });
}

async function saveSetting(key, value) {
    try {
        localStorage.setItem(`setting_${key}`, JSON.stringify(value));
        await securityAudit.logEvent(`SETTING_CHANGED: ${key}=${value}`, 'INFO');
    } catch (error) {
        console.warn('Failed to save setting:', error);
    }
}

function applySetting(key, value) {
    switch (key) {
        case 'encryptionLevel':
            securityLevel = value;
            updateSecurityUI();
            break;
            
        case 'useWorkers':
            if (cryptoWorkerManager) {
                cryptoWorkerManager.enabled = value;
            }
            break;
            
        case 'chunkSize':
            if (cryptoWorkerManager) {
                cryptoWorkerManager.chunkSize = parseInt(value);
            }
            break;
            
        case 'darkMode':
            document.body.classList.toggle('dark-mode', value);
            break;
            
        case 'animations':
            document.body.classList.toggle('no-animations', !value);
            break;
            
        case 'reducedMotion':
            document.body.classList.toggle('reduced-motion', value);
            break;
    }
}

// === إضافة شريط التقدم المحسن ===
function updateEnhancedProgress(operation, progress) {
    const bar = document.getElementById(`${operation}EnhancedProgress`);
    if (bar) {
        bar.style.width = `${progress}%`;
        
        // تحديث النص
        const text = document.getElementById(`${operation}EnhancedProgressText`);
        if (text) {
            text.textContent = `${Math.round(progress)}%`;
        }
        
        // تغيير اللون بناء على التقدم
        if (progress < 30) {
            bar.style.background = 'linear-gradient(90deg, var(--error), var(--warning))';
        } else if (progress < 70) {
            bar.style.background = 'linear-gradient(90deg, var(--warning), var(--primary))';
        } else {
            bar.style.background = 'linear-gradient(90deg, var(--primary), var(--success))';
        }
    }
}

// === تحديث دالة setupUI ===
function setupUI() {
    // الإعدادات الحالية
    setupLanguageSelector();
    setupFileUploads();
    setupPasswordStrength();
    setupEncryptDecryptButtons();
    setupVanillaTilt();
    setupDragAndDrop();
    setupModals();
    setupAdvancedSettings();
    setupSecurityIndicators();
    setupKeyboardShortcuts();
}

function setupAdvancedSettings() {
    // زر الإعدادات المتقدمة
    const settingsBtn = document.createElement('button');
    settingsBtn.className = 'advanced-settings-btn';
    settingsBtn.innerHTML = '<i class="fas fa-cog"></i>';
    settingsBtn.title = 'Advanced Settings';
    settingsBtn.onclick = showAdvancedSettings;
    
    document.querySelector('.language-selector-3d').appendChild(settingsBtn);
    
    // حاوية الإعدادات المتقدمة
    const settingsContainer = document.createElement('div');
    settingsContainer.id = 'advancedSettings';
    settingsContainer.className = 'advanced-settings';
    
    const settingsContent = document.createElement('div');
    settingsContent.id = 'advancedSettingsContent';
    settingsContent.className = 'advanced-settings-content';
    
    settingsContainer.appendChild(settingsContent);
    document.querySelector('.main-container').appendChild(settingsContainer);
}

function setupSecurityIndicators() {
    // مؤشرات الأمان
    const indicators = document.createElement('div');
    indicators.className = 'security-indicators-bar';
    indicators.innerHTML = `
        <div class="security-indicator" id="securityHttps" title="HTTPS Connection"></div>
        <div class="security-indicator" id="securityCrypto" title="Crypto API"></div>
        <div class="security-indicator" id="securityWorkers" title="Web Workers"></div>
        <div class="security-indicator" id="securityStorage" title="Secure Storage"></div>
        <span id="securityLevelIndicator" class="security-level">Security: ${securityLevel}</span>
    `;
    
    document.querySelector('.footer-content').prepend(indicators);
    
    // تحديث المؤشرات
    updateSecurityIndicators();
}

function updateSecurityIndicators() {
    const indicators = {
        securityHttps: window.isSecureContext,
        securityCrypto: !!window.crypto?.subtle,
        securityWorkers: !!window.Worker,
        securityStorage: 'localStorage' in window && 'indexedDB' in window
    };
    
    for (const [id, active] of Object.entries(indicators)) {
        const indicator = document.getElementById(id);
        if (indicator) {
            indicator.classList.toggle('active', active);
            indicator.classList.toggle('medium', !active);
        }
    }
}

function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + E للتشفير
        if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
            e.preventDefault();
            document.getElementById('encryptBtn').click();
        }
        
        // Ctrl/Cmd + D لفك التشفير
        if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
            e.preventDefault();
            document.getElementById('decryptBtn').click();
        }
        
        // Ctrl/Cmd + L لتغيير اللغة
        if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
            e.preventDefault();
            const current = document.querySelector('.lang-option.active');
            const next = current.nextElementSibling || 
                        document.querySelector('.lang-option');
            if (next) next.click();
        }
        
        // Escape لإلغاء/إغلاق
        if (e.key === 'Escape') {
            const modal = document.querySelector('.security-confirmation-modal.active');
            if (modal) {
                modal.querySelector('#confirmNo')?.click();
            }
        }
    });
}

// === إضافة الـ Service Worker messages ===
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', (event) => {
        switch (event.data.type) {
            case 'CRYPTO_KEY_UPDATE':
                handleCryptoKeyUpdate(event.data.payload);
                break;
            }
        });
    }
    
    function handleCryptoKeyUpdate(keys) {
        // معالجة تحديث مفاتيح التشفير
        console.log('Crypto keys updated from service worker');
    }
    
    // === تحديث دالة showStatus ===
    function showStatus(type, messageKey, status = 'info') {
        const container = document.getElementById('status-container');
        let statusElement;
        
        if (status === 'success') {
            statusElement = document.getElementById('success-status');
            document.getElementById('success-text').textContent = 
                translations[currentLang][messageKey] || messageKey;
                
            // إضافة مؤثرات للنجاح
            statusElement.style.animation = 'none';
            setTimeout(() => {
                statusElement.style.animation = 'slideUp 0.3s ease, pulseSuccess 2s ease';
            }, 10);
            
        } else if (status === 'error') {
            statusElement = document.getElementById('error-status');
            document.getElementById('error-text').textContent = 
                translations[currentLang][messageKey] || messageKey;
                
            // إضافة مؤثرات للخطأ
            statusElement.style.animation = 'none';
            setTimeout(() => {
                statusElement.style.animation = 'slideUp 0.3s ease, shake 0.5s ease';
            }, 10);
            
        } else if (status === 'warning') {
            // إنشاء رسالة تحذير جديدة
            statusElement = document.createElement('div');
            statusElement.className = 'status-message warning';
            statusElement.innerHTML = `
                <i class="fas fa-exclamation-triangle"></i>
                <span>${translations[currentLang][messageKey] || messageKey}</span>
            `;
            
            container.appendChild(statusElement);
            
            // الإزالة التلقائية
            setTimeout(() => {
                if (statusElement.parentNode) {
                    statusElement.style.animation = 'slideOut 0.3s ease forwards';
                    setTimeout(() => {
                        if (statusElement.parentNode) {
                            container.removeChild(statusElement);
                        }
                    }, 300);
                }
            }, 5000);
            
            return;
        } else {
            return;
        }
        
        // إخفاء جميع الحالات أولاً
        document.querySelectorAll('.status-message:not(.warning)').forEach(el => {
            el.style.display = 'none';
        });
        
        // عرض الحالة المحددة
        statusElement.style.display = 'flex';
        
        // الإزالة التلقائية بعد 5 ثوانٍ
        setTimeout(() => {
            if (statusElement.parentNode) {
                statusElement.style.animation = 'slideOut 0.3s ease forwards';
                setTimeout(() => {
                    if (statusElement.parentNode && statusElement.style.display !== 'none') {
                        statusElement.style.display = 'none';
                        statusElement.style.animation = '';
                    }
                }, 300);
            }
        }, 5000);
    }
    
    // === إضافة أنماط CSS للتحسينات ===
    const style = document.createElement('style');
    style.textContent = `
        @keyframes pulseSuccess {
            0%, 100% { box-shadow: 0 0 20px rgba(0, 255, 136, 0.5); }
            50% { box-shadow: 0 0 40px rgba(0, 255, 136, 0.8); }
        }
        
        @keyframes shake {
            0%, 100% { transform: translateX(0) translateZ(20px); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-5px) translateZ(20px); }
            20%, 40%, 60%, 80% { transform: translateX(5px) translateZ(20px); }
        }
        
        @keyframes slideOut {
            from { 
                opacity: 1; 
                transform: translateY(0) translateZ(20px); 
            }
            to { 
                opacity: 0; 
                transform: translateY(20px) translateZ(20px); 
            }
        }
        
        .status-message.warning {
            background: rgba(255, 170, 0, 0.1);
            border: 2px solid var(--warning);
            color: var(--warning);
        }
        
        .advanced-settings-btn {
            width: 60px;
            height: 60px;
            background: var(--card-bg);
            border: 2px solid var(--card-border);
            border-radius: 50%;
            color: var(--gray);
            font-size: 24px;
            cursor: pointer;
            transition: var(--transition-3d);
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .advanced-settings-btn:hover {
            color: var(--primary);
            border-color: var(--primary);
            transform: translateY(-5px) rotate(90deg);
            box-shadow: var(--glow);
        }
        
        .security-indicators-bar {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 20px;
            justify-content: center;
        }
        
        .security-level {
            padding: 5px 15px;
            background: rgba(0, 212, 255, 0.1);
            border: 1px solid var(--primary);
            border-radius: 20px;
            font-size: 0.9rem;
            color: var(--primary);
            font-family: 'Orbitron', sans-serif;
            letter-spacing: 1px;
        }
        
        .security-level-military {
            background: rgba(0, 255, 136, 0.1);
            border-color: var(--accent);
            color: var(--accent);
        }
        
        .security-level-high {
            background: rgba(0, 212, 255, 0.1);
            border-color: var(--primary);
            color: var(--primary);
        }
        
        .security-level-medium {
            background: rgba(255, 170, 0, 0.1);
            border-color: var(--warning);
            color: var(--warning);
        }
        
        .security-level-basic {
            background: rgba(255, 71, 87, 0.1);
            border-color: var(--error);
            color: var(--error);
        }
        
        .update-notification {
            position: fixed;
            bottom: 100px;
            left: 50%;
            transform: translateX(-50%);
            background: var(--card-bg);
            border: 2px solid var(--primary);
            border-radius: var(--radius-3d);
            padding: 20px 30px;
            display: flex;
            align-items: center;
            gap: 15px;
            z-index: 10000;
            animation: slideUp 0.3s ease;
            backdrop-filter: blur(20px);
        }
        
        .update-content {
            display: flex;
            align-items: center;
            gap: 15px;
        }
        
        .update-content i {
            font-size: 24px;
            color: var(--primary);
        }
        
        .update-content span {
            color: var(--light);
            flex-grow: 1;
        }
        
        .update-content button {
            background: var(--primary);
            color: var(--dark);
            border: none;
            border-radius: 10px;
            padding: 8px 16px;
            font-family: 'Orbitron', sans-serif;
            font-weight: 600;
            cursor: pointer;
            transition: var(--transition-3d);
        }
        
        .update-content button:hover {
            transform: scale(1.05);
            box-shadow: var(--glow);
        }
        
        .no-animations * {
            animation: none !important;
            transition: none !important;
        }
        
        .reduced-motion * {
            animation-duration: 0.01ms !important;
            transition-duration: 0.01ms !important;
        }
        
        .dark-mode {
            --dark: #0a0a1a;
            --darker: #050510;
            --card-bg: rgba(5, 10, 25, 0.95);
        }
        
        .setting-select {
            background: rgba(0, 0, 0, 0.3);
            border: 2px solid var(--card-border);
            border-radius: 10px;
            color: var(--light);
            padding: 8px 16px;
            font-family: 'Cairo', sans-serif;
            font-size: 0.9rem;
            cursor: pointer;
            transition: var(--transition-3d);
        }
        
        .setting-select:focus {
            outline: none;
            border-color: var(--primary);
        }
        
        .setting-range {
            width: 120px;
            height: 6px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 3px;
            outline: none;
            -webkit-appearance: none;
        }
        
        .setting-range::-webkit-slider-thumb {
            -webkit-appearance: none;
            width: 20px;
            height: 20px;
            background: var(--primary);
            border-radius: 50%;
            cursor: pointer;
            transition: var(--transition-3d);
        }
        
        .setting-range::-webkit-slider-thumb:hover {
            transform: scale(1.2);
            box-shadow: var(--glow);
        }
        
        .range-value {
            min-width: 30px;
            text-align: center;
            color: var(--primary);
            font-family: 'Orbitron', sans-serif;
        }
        
        .enhanced-progress-container {
            margin: 30px 0;
        }
        
        .enhanced-progress-info {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            color: var(--gray);
            font-size: 0.9rem;
        }
    `;
    
    document.head.appendChild(style);
    
    // === بدء التطبيق ===
    document.addEventListener('DOMContentLoaded', initApp);
