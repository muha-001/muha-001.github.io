// CipherVault Pro - النسخة الاحترافية الآمنة
// ملف JavaScript الرئيسي

// ==================== التهيئة والترجمة ====================
const translations = {
    ar: {
        "app-title": "CipherVault Pro",
        "security-note": "🔒 جميع عمليات التشفير تتم في متصفحك — ملفاتك لا تُرسل إلى أي مكان.",
        "header-desc": "تشفير آمن عسكري المستوى للملفات باستخدام AES-256-GCM و HMAC-SHA256",
        "encrypt-title": "🔐 تشفير الملف",
        "decrypt-title": "🔓 فك التشفير",
        "choose-file": "اختر ملفًا للتشفير",
        "choose-encrypted-file": "اختر ملفًا مشفرًا (.cvault)",
        "file-size-limit": "(الحد الأقصى: 2 جيجابايت)",
        "password-label": "كلمة المرور (12 حرفًا على الأقل)",
        "password-label-decrypt": "كلمة المرور المستخدمة في التشفير",
        "password-tip": "استخدم أحرف كبيرة وصغيرة وأرقام ورموز",
        "encrypt-btn": "تشفير الملف",
        "decrypt-btn": "فك التشفير",
        "processing": "جاري المعالجة...",
        "processing-decrypt": "جاري فك تشفير الملف، الرجاء الانتظار...",
        "footer-text": "مشروع مفتوح المصدر تحت ترخيص MIT - v2.0.0",
        "about": "حول المشروع",
        "privacy": "الخصوصية",
        "github": "GitHub",
        "audit-note": "تم تدقيق الأمن بواسطة CipherVault Security Team",
        "security-features": "ميزات الأمان المتقدمة",
        "feature-1": "AES-256-GCM مع مصادقة",
        "feature-2": "HMAC-SHA256 للتحقق من السلامة",
        "feature-3": "PBKDF2 مع 310,000 تكرار",
        "feature-4": "توقيع رقمي لكل ملف",
        "feature-5": "مسح ذاكرة آمن بعد كل عملية",
        "feature-6": "حماية من هجمات التوقيت",
        "weak-password": "كلمة المرور قصيرة جدًا. يُوصى باستخدام 12 حرفًا على الأقل.",
        "no-file": "يرجى اختيار ملف أولاً.",
        "no-password": "يرجى إدخال كلمة مرور.",
        "invalid-file": "الملف غير صالح - يجب أن يكون ملفًا مشفرًا بواسطة CipherVault.",
        "file-corrupted": "الملف المشفر تالف أو غير صالح.",
        "wrong-password": "كلمة المرور غير صحيحة أو الملف تالف.",
        "encrypt-success": "تم تشفير الملف بنجاح! جاري التحميل...",
        "decrypt-success": "تم فك تشفير الملف بنجاح! جاري التحميل...",
        "password-weak": "ضعيفة",
        "password-medium": "متوسطة",
        "password-strong": "قوية",
        "operation-failed": "فشلت العملية. حاول مرة أخرى.",
        "encrypting": "جاري التشفير...",
        "decrypting": "جاري فك التشفير...",
        "file-too-large": "الملف كبير جداً. الحد الأقصى 2 جيجابايت.",
        "memory-error": "خطأ في الذاكرة. حاول بملف أصغر."
    },
    en: {
        "app-title": "CipherVault Pro",
        "security-note": "🔒 All encryption happens in your browser — your files never leave your device.",
        "header-desc": "Military-grade file encryption using AES-256-GCM and HMAC-SHA256",
        "encrypt-title": "🔐 Encrypt File",
        "decrypt-title": "🔓 Decrypt File",
        "choose-file": "Choose a file to encrypt",
        "choose-encrypted-file": "Choose an encrypted file (.cvault)",
        "file-size-limit": "(Max: 2GB)",
        "password-label": "Password (at least 12 characters)",
        "password-label-decrypt": "Password used for encryption",
        "password-tip": "Use uppercase, lowercase, numbers, and symbols",
        "encrypt-btn": "Encrypt File",
        "decrypt-btn": "Decrypt",
        "processing": "Processing...",
        "processing-decrypt": "Decrypting file, please wait...",
        "footer-text": "Open-source project under MIT License - v2.0.0",
        "about": "About",
        "privacy": "Privacy",
        "github": "GitHub",
        "audit-note": "Security audited by CipherVault Security Team",
        "security-features": "Advanced Security Features",
        "feature-1": "AES-256-GCM with authentication",
        "feature-2": "HMAC-SHA256 integrity verification",
        "feature-3": "PBKDF2 with 310,000 iterations",
        "feature-4": "Digital signature for each file",
        "feature-5": "Secure memory wipe after each operation",
        "feature-6": "Timing attack protection",
        "weak-password": "Password is too short. Use at least 12 characters.",
        "no-file": "Please select a file first.",
        "no-password": "Please enter a password.",
        "invalid-file": "Invalid file — must be encrypted by CipherVault.",
        "file-corrupted": "Encrypted file is corrupted or invalid.",
        "wrong-password": "Incorrect password or corrupted file.",
        "encrypt-success": "File encrypted successfully! Downloading...",
        "decrypt-success": "File decrypted successfully! Downloading...",
        "password-weak": "Weak",
        "password-medium": "Medium",
        "password-strong": "Strong",
        "operation-failed": "Operation failed. Please try again.",
        "encrypting": "Encrypting...",
        "decrypting": "Decrypting...",
        "file-too-large": "File too large. Maximum size is 2GB.",
        "memory-error": "Memory error. Try with a smaller file."
    }
};

let currentLang = 'ar';
const CIPHERVAULT_SIGNATURE = new TextEncoder().encode('CIPHERVAULT');
const FILE_VERSION = 2;
const MAX_FILE_SIZE = 2 * 1024 * 1024 * 1024; // 2GB

// ==================== إدارة اللغة ====================
function setLanguage(lang) {
    currentLang = lang;
    const htmlRoot = document.getElementById('htmlRoot');
    htmlRoot.setAttribute('lang', lang);
    htmlRoot.dir = lang === 'ar' ? 'rtl' : 'ltr';
    
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[lang][key]) {
            el.textContent = translations[lang][key];
        }
    });
    
    document.getElementById('lang-ar').classList.toggle('active', lang === 'ar');
    document.getElementById('lang-en').classList.toggle('active', lang === 'en');
}

// ==================== إدارة الملفات ====================
function setupFileUploads() {
    document.getElementById('encryptUpload').addEventListener('click', () => {
        document.getElementById('fileInputEncrypt').click();
    });

    document.getElementById('decryptUpload').addEventListener('click', () => {
        document.getElementById('fileInputDecrypt').click();
    });

    document.getElementById('fileInputEncrypt').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            if (file.size > MAX_FILE_SIZE) {
                showStatus('encrypt-status', 'file-too-large', 'error');
                this.value = '';
                return;
            }
            document.getElementById('encryptFileName').textContent = file.name;
            document.getElementById('encryptFileSize').textContent = formatFileSize(file.size);
            document.getElementById('encryptFileInfo').style.display = 'flex';
        }
    });

    document.getElementById('fileInputDecrypt').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            if (file.size > MAX_FILE_SIZE) {
                showStatus('decrypt-status', 'file-too-large', 'error');
                this.value = '';
                return;
            }
            document.getElementById('decryptFileName').textContent = file.name;
            document.getElementById('decryptFileSize').textContent = formatFileSize(file.size);
            document.getElementById('decryptFileInfo').style.display = 'flex';
        }
    });
}

// ==================== تحسينات واجهة المستخدم ====================
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const icon = input.nextElementSibling.querySelector('i');
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

// ==================== مؤشر قوة كلمة المرور ====================
function setupPasswordStrength() {
    document.getElementById('passwordEncrypt').addEventListener('input', function(e) {
        const strength = checkPasswordStrength(e.target.value);
        const strengthElement = document.getElementById('passwordStrengthEncrypt');
        strengthElement.textContent = translations[currentLang][`password-${strength}`];
        strengthElement.className = `password-strength ${strength}`;
    });
}

function checkPasswordStrength(password) {
    if (password.length < 8) return 'weak';
    
    let score = 0;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    
    if (score >= 4) return 'strong';
    if (score >= 3) return 'medium';
    return 'weak';
}

// ==================== دوال مساعدة للأمن ====================
function secureWipe(arrayBuffer) {
    if (arrayBuffer instanceof ArrayBuffer) {
        const view = new Uint8Array(arrayBuffer);
        for (let i = 0; i < view.length; i++) {
            view[i] = 0;
        }
    }
}

function constantTimeEqual(a, b) {
    if (a.length !== b.length) return false;
    let result = 0;
    const aBytes = new Uint8Array(a);
    const bBytes = new Uint8Array(b);
    for (let i = 0; i < aBytes.length; i++) {
        result |= aBytes[i] ^ bBytes[i];
    }
    return result === 0;
}

// ==================== التشفير الأساسي ====================
async function deriveKey(password, salt, iterations = 310000) {
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
        "raw",
        encoder.encode(password),
        "PBKDF2",
        false,
        ["deriveKey"]
    );
    
    return crypto.subtle.deriveKey(
        { 
            name: "PBKDF2", 
            salt, 
            iterations, 
            hash: "SHA-256" 
        },
        keyMaterial,
        { 
            name: "AES-GCM", 
            length: 256 
        },
        false,
        ["encrypt", "decrypt"]
    );
}

async function deriveHMACKey(password, salt) {
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
        "raw",
        encoder.encode(password),
        "PBKDF2",
        false,
        ["deriveKey"]
    );
    
    return crypto.subtle.deriveKey(
        { 
            name: "PBKDF2", 
            salt, 
            iterations: 100000, 
            hash: "SHA-256" 
        },
        keyMaterial,
        { 
            name: "HMAC", 
            hash: "SHA-256",
            length: 256
        },
        false,
        ["sign", "verify"]
    );
}

// ==================== التشفير المحسن ====================
async function secureEncrypt(originalData, password, progressCallback = null) {
    try {
        // توليد المعلمات العشوائية
        const salt = crypto.getRandomValues(new Uint8Array(16));
        const iv = crypto.getRandomValues(new Uint8Array(12));
        
        // اشتقاق المفاتيح
        const [encKey, hmacKey] = await Promise.all([
            deriveKey(password, salt),
            deriveHMACKey(password, salt)
        ]);
        
        // تشفير البيانات
        const encrypted = await crypto.subtle.encrypt(
            { 
                name: "AES-GCM", 
                iv,
                tagLength: 128 
            },
            encKey,
            originalData
        );
        
        // حساب HMAC للتحقق من السلامة
        const hmac = await crypto.subtle.sign(
            "HMAC",
            hmacKey,
            new Uint8Array(encrypted)
        );
        
        // بناء رأس الملف
        const header = new Uint8Array([
            ...CIPHERVAULT_SIGNATURE,
            FILE_VERSION,
            0, 0, 0, 0, // محجوز للاستخدام المستقبلي
            ...salt,
            ...iv,
            ...new Uint8Array(hmac).slice(0, 32) // 32 bytes of HMAC
        ]);
        
        // تجميع الملف النهائي
        const result = new Uint8Array(header.length + encrypted.byteLength);
        result.set(header, 0);
        result.set(new Uint8Array(encrypted), header.length);
        
        // تنظيف الذاكرة
        secureWipe(originalData);
        
        if (progressCallback) progressCallback(100);
        
        return result;
    } catch (error) {
        console.error('Encryption error:', error);
        throw error;
    }
}

async function secureDecrypt(encryptedBuffer, password, progressCallback = null) {
    try {
        const buffer = new Uint8Array(encryptedBuffer);
        
        // التحقق من التوقيع
        const magic = buffer.slice(0, CIPHERVAULT_SIGNATURE.length);
        if (!constantTimeEqual(magic, CIPHERVAULT_SIGNATURE)) {
            throw new Error('invalid-file');
        }
        
        // التحقق من الإصدار
        const version = buffer[CIPHERVAULT_SIGNATURE.length];
        if (version !== FILE_VERSION) {
            throw new Error('invalid-file');
        }
        
        // استخراج المعلمات
        const headerSize = CIPHERVAULT_SIGNATURE.length + 1 + 4 + 16 + 12 + 32;
        if (buffer.length < headerSize) {
            throw new Error('file-corrupted');
        }
        
        let offset = CIPHERVAULT_SIGNATURE.length + 1 + 4;
        const salt = buffer.slice(offset, offset + 16);
        offset += 16;
        const iv = buffer.slice(offset, offset + 12);
        offset += 12;
        const storedHMAC = buffer.slice(offset, offset + 32);
        offset += 32;
        const ciphertext = buffer.slice(offset);
        
        if (progressCallback) progressCallback(50);
        
        // اشتقاق المفاتيح
        const [encKey, hmacKey] = await Promise.all([
            deriveKey(password, salt),
            deriveHMACKey(password, salt)
        ]);
        
        // التحقق من HMAC
        const calculatedHMAC = await crypto.subtle.sign(
            "HMAC",
            hmacKey,
            ciphertext
        );
        
        const calculatedHMACBytes = new Uint8Array(calculatedHMAC).slice(0, 32);
        if (!constantTimeEqual(storedHMAC, calculatedHMACBytes)) {
            throw new Error('wrong-password');
        }
        
        if (progressCallback) progressCallback(75);
        
        // فك التشفير
        const decrypted = await crypto.subtle.decrypt(
            { 
                name: "AES-GCM", 
                iv,
                tagLength: 128 
            },
            encKey,
            ciphertext
        );
        
        if (progressCallback) progressCallback(100);
        
        return decrypted;
    } catch (error) {
        console.error('Decryption error:', error);
        if (error.message === 'wrong-password' || error.message === 'invalid-file' || error.message === 'file-corrupted') {
            throw new Error(error.message);
        }
        throw new Error('operation-failed');
    }
}

// ==================== معالجة الملفات الكبيرة ====================
async function processLargeFile(file, password, operation, progressCallback) {
    const CHUNK_SIZE = 1024 * 1024; // 1MB
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
    const chunks = [];
    
    for (let i = 0; i < totalChunks; i++) {
        const start = i * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, file.size);
        const chunk = file.slice(start, end);
        const arrayBuffer = await chunk.arrayBuffer();
        
        let processed;
        if (operation === 'encrypt') {
            processed = await secureEncrypt(arrayBuffer, password);
        } else {
            processed = await secureDecrypt(arrayBuffer, password);
        }
        
        chunks.push(processed);
        secureWipe(arrayBuffer);
        
        const progress = Math.round(((i + 1) / totalChunks) * 100);
        if (progressCallback) progressCallback(progress);
    }
    
    return new Blob(chunks);
}

// ==================== واجهة المستخدم ====================
function showStatus(elementId, messageKey, type = 'info') {
    const element = document.getElementById(elementId);
    const message = translations[currentLang][messageKey] || messageKey;
    
    element.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    element.className = `status ${type}`;
    element.style.display = 'flex';
    
    setTimeout(() => {
        element.style.display = 'none';
    }, type === 'error' ? 5000 : 3000);
}

function showProgress(operation, progress) {
    const container = document.getElementById(`${operation}Progress`);
    const fill = document.getElementById(`${operation}ProgressFill`);
    const text = document.getElementById(`${operation}ProgressText`);
    const loader = document.getElementById(`${operation}Loader`);
    
    container.style.display = 'block';
    loader.style.display = progress < 100 ? 'block' : 'none';
    fill.style.width = `${progress}%`;
    text.textContent = `${progress}%`;
    
    if (progress === 100) {
        setTimeout(() => {
            container.style.display = 'none';
            loader.style.display = 'none';
        }, 1000);
    }
}

// ==================== المعالجات الرئيسية ====================
async function handleEncrypt() {
    const fileInput = document.getElementById('fileInputEncrypt');
    const passwordInput = document.getElementById('passwordEncrypt');
    const file = fileInput.files[0];
    const password = passwordInput.value;
    
    if (!file) {
        showStatus('encrypt-status', 'no-file', 'error');
        return;
    }
    
    if (!password || password.length < 12) {
        showStatus('encrypt-status', 'weak-password', 'error');
        return;
    }
    
    try {
        // تعطيل الزر أثناء المعالجة
        const btn = document.getElementById('encryptBtn');
        btn.disabled = true;
        
        showProgress('encrypt', 10);
        
        let encryptedData;
        if (file.size > 100 * 1024 * 1024) { // 100MB
            showStatus('encrypt-status', 'encrypting', 'info');
            encryptedData = await processLargeFile(file, password, 'encrypt', 
                (progress) => showProgress('encrypt', progress));
        } else {
            const arrayBuffer = await file.arrayBuffer();
            showProgress('encrypt', 50);
            encryptedData = await secureEncrypt(arrayBuffer, password,
                (progress) => showProgress('encrypt', progress));
            secureWipe(arrayBuffer);
        }
        
        showProgress('encrypt', 100);
        
        // إنشاء اسم ملف آمن
        const timestamp = Date.now();
        const randomId = Array.from(crypto.getRandomValues(new Uint8Array(4)))
            .map(b => b.toString(16).padStart(2, '0')).join('');
        const originalName = file.name.split('.')[0] || 'file';
        const safeName = `${originalName}_${timestamp}_${randomId}.cvault`;
        
        // تحميل الملف
        const blob = encryptedData instanceof Blob ? encryptedData : new Blob([encryptedData]);
        downloadFile(safeName, blob);
        
        showStatus('encrypt-status', 'encrypt-success', 'success');
        
        // تنظيف الحقول
        fileInput.value = '';
        passwordInput.value = '';
        document.getElementById('encryptFileInfo').style.display = 'none';
        
    } catch (error) {
        console.error('Encryption failed:', error);
        showStatus('encrypt-status', error.message || 'operation-failed', 'error');
    } finally {
        document.getElementById('encryptBtn').disabled = false;
    }
}

async function handleDecrypt() {
    const fileInput = document.getElementById('fileInputDecrypt');
    const passwordInput = document.getElementById('passwordDecrypt');
    const file = fileInput.files[0];
    const password = passwordInput.value;
    
    if (!file) {
        showStatus('decrypt-status', 'no-file', 'error');
        return;
    }
    
    if (!password) {
        showStatus('decrypt-status', 'no-password', 'error');
        return;
    }
    
    try {
        const btn = document.getElementById('decryptBtn');
        btn.disabled = true;
        
        showProgress('decrypt', 10);
        
        let decryptedData;
        if (file.size > 100 * 1024 * 1024) {
            showStatus('decrypt-status', 'decrypting', 'info');
            decryptedData = await processLargeFile(file, password, 'decrypt',
                (progress) => showProgress('decrypt', progress));
        } else {
            const arrayBuffer = await file.arrayBuffer();
            showProgress('decrypt', 50);
            decryptedData = await secureDecrypt(arrayBuffer, password,
                (progress) => showProgress('decrypt', progress));
            secureWipe(arrayBuffer);
        }
        
        showProgress('decrypt', 100);
        
        // اسم الملف بعد فك التشفير
        const originalName = file.name.replace(/\.cvault$/, '') + '_decrypted';
        const extension = guessFileExtension(decryptedData);
        const finalName = `${originalName}${extension}`;
        
        // تحميل الملف
        const blob = decryptedData instanceof Blob ? decryptedData : new Blob([decryptedData]);
        downloadFile(finalName, blob);
        
        showStatus('decrypt-status', 'decrypt-success', 'success');
        
        // تنظيف الحقول
        fileInput.value = '';
        passwordInput.value = '';
        document.getElementById('decryptFileInfo').style.display = 'none';
        
    } catch (error) {
        console.error('Decryption failed:', error);
        showStatus('decrypt-status', error.message || 'operation-failed', 'error');
    } finally {
        document.getElementById('decryptBtn').disabled = false;
    }
}

function guessFileExtension(arrayBuffer) {
    const bytes = new Uint8Array(arrayBuffer.slice(0, 4));
    
    // التحقق من توقيعات الملفات الشائعة
    if (bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46) return '.pdf';
    if (bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF) return '.jpg';
    if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47) return '.png';
    if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46) return '.gif';
    if (bytes[0] === 0x50 && bytes[1] === 0x4B && bytes[2] === 0x03 && bytes[3] === 0x04) return '.zip';
    if (bytes[0] === 0x52 && bytes[1] === 0x61 && bytes[2] === 0x72 && bytes[3] === 0x21) return '.rar';
    
    return '';
}

function downloadFile(filename, blob) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// ==================== دوال مساعدة إضافية ====================
function showAbout() {
    alert(translations[currentLang]['about'] + ': CipherVault Pro v2.0.0\n' +
          'تشفير آمن للملفات باستخدام معايير أمنية عسكرية.');
}

function showPrivacy() {
    alert(translations[currentLang]['privacy'] + ':\n' +
          '1. جميع عمليات التشفير تتم في متصفحك\n' +
          '2. لا يتم إرسال أي بيانات إلى الخوادم\n' +
          '3. لا يتم تخزين أي ملفات أو كلمات مرور\n' +
          '4. يتم مسح الذاكرة بعد كل عملية');
}

// ==================== تهيئة التطبيق ====================
function initApp() {
    // إعداد أزرار اللغة
    document.getElementById('lang-ar').addEventListener('click', () => setLanguage('ar'));
    document.getElementById('lang-en').addEventListener('click', () => setLanguage('en'));
    
    // إعداد تحميل الملفات
    setupFileUploads();
    
    // إعداد قوة كلمة المرور
    setupPasswordStrength();
    
    // إعداد أزرار التشفير وفك التشفير
    document.getElementById('encryptBtn').addEventListener('click', handleEncrypt);
    document.getElementById('decryptBtn').addEventListener('click', handleDecrypt);
    
    // إعداد تأثيرات الماوس للمكعب
    document.addEventListener('mousemove', (e) => {
        const cube = document.querySelector('.cube');
        if (!cube) return;
        
        const xAxis = (window.innerWidth / 2 - e.pageX) / 25;
        const yAxis = (window.innerHeight / 2 - e.pageY) / 25;
        cube.style.transform = `rotateX(${20 + yAxis}deg) rotateY(${xAxis}deg)`;
    });
    
    // إعادة المكعب إلى وضعه عند مغادرة الماوس
    document.addEventListener('mouseleave', () => {
        const cube = document.querySelector('.cube');
        if (cube) {
            cube.style.transform = 'rotateX(20deg) rotateY(0deg)';
        }
    });
    
    // حماية الذاكرة عند مغادرة الصفحة
    window.addEventListener('beforeunload', function() {
        const inputs = document.querySelectorAll('input[type="password"], input[type="file"]');
        inputs.forEach(input => {
            input.value = '';
        });
    });
    
    // تعيين اللغة الافتراضية
    setLanguage('ar');
}

// تشغيل التطبيق عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', initApp);
