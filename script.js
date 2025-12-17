// === الترجمات ===
const translations = {
  ar: {
    "security-note": "🔒 جميع عمليات التشفير تتم في متصفحك — ملفاتك لا تُرسل إلى أي مكان.",
    "header-desc": "واجهة آمنة لتشفير وفك تشفير ملفاتك باستخدام معايير عسكرية (AES-256-GCM)",
    "encrypt-title": "🔐 تشفير ملف",
    "decrypt-title": "🔓 فك تشفير ملف",
    "choose-file": "اختر ملفًا للتشفير",
    "choose-encrypted-file": "اختر ملفًا مشفرًا (.encrypted)",
    "password-label": "كلمة المرور (12 حرفًا على الأقل)",
    "encrypt-btn": "تشفير الملف",
    "decrypt-btn": "فك التشفير",
    "switch-encrypt": "التشفير",
    "switch-decrypt": "فك التشفير",
    "footer-text": "مشروع مفتوح المصدر تحت ترخيص MIT",
    "weak-password": "كلمة المرور قصيرة جدًّا. يُوصى باستخدام 12 حرفًا على الأقل.\nهل تريد المتابعة؟",
    "no-file": "يرجى اختيار ملف أولاً.",
    "no-password": "يرجى إدخال كلمة مرور.",
    "not-encrypted": "الملف يجب أن ينتهي بامتداد '.encrypted' لفك التشفير.",
    "processing": "معالجة الملف...",
    "encrypt-success": "تم تشفير الملف بنجاح!",
    "decrypt-success": "تم فك تشفير الملف بنجاح!"
  },
  en: {
    "security-note": "🔒 All encryption happens in your browser — your files never leave your device.",
    "header-desc": "Secure military-grade file encryption and decryption (AES-256-GCM)",
    "encrypt-title": "🔐 Encrypt File",
    "decrypt-title": "🔓 Decrypt File",
    "choose-file": "Choose a file to encrypt",
    "choose-encrypted-file": "Choose an encrypted file (.encrypted)",
    "password-label": "Password (at least 12 characters)",
    "encrypt-btn": "Encrypt File",
    "decrypt-btn": "Decrypt",
    "switch-encrypt": "Encrypt",
    "switch-decrypt": "Decrypt",
    "footer-text": "Open-source project under MIT License",
    "weak-password": "Password is too short. Use at least 12 characters.\nProceed anyway?",
    "no-file": "Please select a file first.",
    "no-password": "Please enter a password.",
    "not-encrypted": "File must end with '.encrypted' to decrypt.",
    "processing": "Processing file...",
    "encrypt-success": "File encrypted successfully!",
    "decrypt-success": "File decrypted successfully!"
  }
};

// === إدارة اللغة ===
let currentLang = 'ar';
const htmlRoot = document.getElementById('htmlRoot');

function setLanguage(lang) {
  currentLang = lang;
  htmlRoot.setAttribute('lang', lang);
  htmlRoot.dir = lang === 'ar' ? 'rtl' : 'ltr';
  
  // تحديث النصوص
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    el.textContent = translations[lang][key];
  });

  // تحديث أزرار اللغة
  document.getElementById('lang-ar').classList.toggle('active', lang === 'ar');
  document.getElementById('lang-en').classList.toggle('active', lang === 'en');
}

// === تبديل اللغة ===
document.getElementById('lang-ar').addEventListener('click', () => setLanguage('ar'));
document.getElementById('lang-en').addEventListener('click', () => setLanguage('en'));

// === التبديل بين الأقسام ===
function showSection(sectionId) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.getElementById(sectionId).classList.add('active');

  document.querySelectorAll('.switch-btn').forEach(btn => btn.classList.remove('active'));
  if (sectionId === 'encrypt-section') {
    document.getElementById('switch-to-encrypt').classList.add('active');
  } else {
    document.getElementById('switch-to-decrypt').classList.add('active');
  }
}

document.getElementById('switch-to-encrypt').addEventListener('click', () => showSection('encrypt-section'));
document.getElementById('switch-to-decrypt').addEventListener('click', () => showSection('decrypt-section'));

// === التشفير وفك التشفير ===
document.getElementById('encryptBtn').addEventListener('click', () => processFile('encrypt'));
document.getElementById('decryptBtn').addEventListener('click', () => processFile('decrypt'));

async function processFile(mode) {
  const fileInput = mode === 'encrypt' ? document.getElementById('fileInputEncrypt') : document.getElementById('fileInputDecrypt');
  const passwordInput = mode === 'encrypt' ? document.getElementById('passwordEncrypt') : document.getElementById('passwordDecrypt');
  const statusDiv = mode === 'encrypt' ? document.getElementById('encrypt-status') : document.getElementById('decrypt-status');

  const file = fileInput.files[0];
  const password = passwordInput.value;

  if (!file) {
    showError(statusDiv, translations[currentLang]["no-file"]);
    return;
  }

  if (!password) {
    showError(statusDiv, translations[currentLang]["no-password"]);
    return;
  }

  if (password.length < 12) {
    if (!confirm(translations[currentLang]["weak-password"])) {
      return;
    }
  }

  try {
    showStatus(statusDiv, translations[currentLang]["processing"], "success");
    const arrayBuffer = await file.arrayBuffer();
    let processedData;

    if (mode === 'encrypt') {
      processedData = await encryptFile(arrayBuffer, password);
      // ✅ إخفاء اسم الملف الأصلي: استخدام اسم عشوائي
      const randomName = `vault_${Array.from(crypto.getRandomValues(new Uint8Array(4)))
        .map(b => b.toString(16).padStart(2, '0')).join('')}.encrypted`;
      const blob = new Blob([processedData]);
      downloadFile(randomName, blob);
      showStatus(statusDiv, translations[currentLang]["encrypt-success"], "success");
    } else {
      if (!file.name.endsWith('.encrypted')) {
        throw new Error(translations[currentLang]["not-encrypted"]);
      }
      processedData = await decryptFile(arrayBuffer, password);
      const blob = new Blob([processedData]);
      // محاولة استخراج الاسم الأصلي من البيانات (في هذا الإصدار، لا يتم تخزين الاسم)
      // لذا نستخدم اسمًا عامًا
      downloadFile("decrypted_file", blob);
      showStatus(statusDiv, translations[currentLang]["decrypt-success"], "success");
    }

    passwordInput.value = '';
    fileInput.value = '';
  } catch (err) {
    console.error(err);
    showError(statusDiv, err.message || "Unexpected error");
  }
}

// === وظائف التشفير (كما هي) ===
async function encryptFile(data, password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(password, salt);
  const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv: iv }, key, data);
  const result = new Uint8Array(salt.length + iv.length + encrypted.byteLength);
  result.set(salt, 0);
  result.set(iv, 16);
  result.set(new Uint8Array(encrypted), 28);
  return result;
}

async function decryptFile(encryptedData, password) {
  const buffer = new Uint8Array(encryptedData);
  if (buffer.length < 28) throw new Error("Invalid encrypted data.");
  const salt = buffer.slice(0, 16);
  const iv = buffer.slice(16, 28);
  const ciphertext = buffer.slice(28);
  const key = await deriveKey(password, salt);
  const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv: iv }, key, ciphertext);
  return decrypted;
}

async function deriveKey(password, salt) {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: salt, iterations: 100000, hash: "SHA-256" },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

// === وظائف مساعدة ===
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

function showStatus(element, message, type) {
  element.textContent = message;
  element.className = `status ${type}`;
}

function showError(element, message) {
  showStatus(element, message, 'error');
}

// === تأثير 3D تفاعلي مع الماوس (اختياري) ===
document.addEventListener('mousemove', (e) => {
  const cube = document.querySelector('.cube');
  if (!cube) return;
  
  const xAxis = (window.innerWidth / 2 - e.pageX) / 25;
  const yAxis = (window.innerHeight / 2 - e.pageY) / 25;
  cube.style.transform = `translate(-50%, -50%) rotateY(${xAxis}deg) rotateX(${yAxis}deg)`;
  
  document.body.classList.add('mouse-active');
});
