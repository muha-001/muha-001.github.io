/*!
 * CipherVault 3D Pro - Main Application File (ES6 Module Version - Updated for window.THREE)
 * Version: 4.4.2 - Enhanced & Fixed for ES6 Modules & r182 Compatibility
 */

// ⭐ استيراد ThreeSceneManager (الملف المُعدّل حديثًا)
import { ThreeSceneManager } from './three-scene.js';

// ⭐ (اختياري) استيراد مكونات من three.core.js إذا كنت ستحتاجها مباشرة
// import { THREE, OrbitControls, EffectComposer, ... } from './assets/js/three.core.js';

// ⭐ استيراد الملفات الأخرى حسب الحاجة (مثلًا)
// import './assets/js/config.js';
// import './assets/js/translations.js';
// import './assets/js/crypto-core.js';
// import './assets/js/crypto-military.js';
// import './assets/js/crypto-worker.js';
// import './assets/js/audit-log.js';
// import './assets/js/security-audit.js';
// import './assets/js/pwa-manager.js';
// import './assets/js/ui-manager.js';
// import './assets/js/file-processor.js';
// import './assets/js/recovery-system.js';
// import './assets/js/worker-manager.js';

// ============================================================================
// GLOBAL APPLICATION STATE
// ============================================================================

// تعريف PerformanceMonitor أولاً لمنع تكرار التعريف
if (typeof PerformanceMonitor === 'undefined') {
class PerformanceMonitor {
constructor() {
this.metrics = {
memory: [],
cpu: [],
fps: [],
timestamp: []
};
this.isMonitoring = false;
this.monitorInterval = null;
}

startMonitoring() {
if (this.isMonitoring) return;
this.isMonitoring = true;
this.monitorInterval = setInterval(() => {
const memory = performance.memory ? {
used: performance.memory.usedJSHeapSize,
total: performance.memory.totalJSHeapSize,
usage: performance.memory.usedJSHeapSize / performance.memory.totalJSHeapSize
} : null;

const cpu = performance.now(); // Simplified CPU estimation

this.metrics.memory.push(memory);
this.metrics.cpu.push(cpu);
this.metrics.timestamp.push(Date.now());

// Keep last 100 measurements
if (this.metrics.memory.length > 100) {
this.metrics.memory.shift();
this.metrics.cpu.shift();
this.metrics.timestamp.shift();
}
}, 1000);
}

stopMonitoring() {
this.isMonitoring = false;
if (this.monitorInterval) {
clearInterval(this.monitorInterval);
this.monitorInterval = null;
}
}

getMetrics() {
return {
memory: this.metrics.memory[this.metrics.memory.length - 1],
cpu: this.metrics.cpu[this.metrics.cpu.length - 1],
timestamp: this.metrics.timestamp[this.metrics.timestamp.length - 1]
};
}
}
}

// ============================================================================
// MAIN APPLICATION CLASS
// ============================================================================

class CipherVaultApp {
constructor() {
// State
this.state = {
encryption: {
file: null,
password: '',
confirmPassword: '',
settings: {
securityLevel: 'MEDIUM',
useWorkers: true,
compress: true,
verifyIntegrity: true,
wipeMemory: true
}
},
decryption: {
file: null,
password: '',
settings: {
verifyIntegrity: true,
wipeMemory: true,
keepMeta: false,
autoOpen: false
}
},
ui: {
darkMode: localStorage.getItem('darkMode') === 'true',
advancedSettings: false,
language: localStorage.getItem('language') || 'en',
currentFile: null,
isProcessing: false,
workersAvailable: false,
memoryAvailable: navigator.deviceMemory || 0,
cpuCores: navigator.hardwareConcurrency || 1
}
};

// Components
this.components = {
crypto: null,
militaryCrypto: null,
translation: null,
threejs: null, // Will hold reference to ThreeSceneManager instance
audit: null,
pwa: null,
workers: null
};

// UI References
this.ui = {
elements: {},
listeners: {}
};

// Event system
this.events = new EventTarget();

// Initialize performance monitoring
this.performance = new PerformanceMonitor();
console.log('CipherVault App initialized');
}

// ============================================================================
// INITIALIZATION
// ============================================================================

/**
* Initialize the entire application
*/
async init() {
console.log('🚀 Initializing CipherVault 3D Pro v4.4.2 (ES6 Module - Updated for window.THREE)...');
console.log('🔧 Checking browser compatibility...');
try {
await this.checkRequirements();
console.log('✅ Browser requirements met');
} catch (error) {
console.error('❌ Browser requirements not met:', error);
this.showStatus('error', 'browser_compatibility_error', error.message);
return;
}

console.log('🔧 Initializing UI elements...');
this.initUI();

console.log('🔧 Initializing subsystems...');
await this.initSubsystems();

console.log('✅ CipherVault App initialized successfully');
this.updateSecurityStatus();
this.updateStatistics();

// Dispatch initialization event
this.events.dispatchEvent(new CustomEvent('app:initialized', {
detail: { timestamp: Date.now() }
}));
}

/**
* Check browser requirements
*/
async checkRequirements() {
const requirements = {
// Modern JavaScript (ES2017+)
modernBrowser: async () => {
try {
// Test async function support
eval('(async () => {})');
// Test arrow function support
eval('(() => {})');
// Test other modern features if needed
} catch (error) {
throw new Error('Browser does not support modern JavaScript features (async/await). Please use a modern browser.');
}
return true;
},
// File API
fileApi: () => {
// Already checked in modernBrowser check
return true;
},
// Crypto API
cryptoApi: () => {
if (typeof crypto === 'undefined' || typeof crypto.subtle === 'undefined') {
throw new Error('Browser does not support Web Crypto API. Encryption will not work.');
}
return true;
},
// Web Workers
webWorkers: () => {
if (typeof Worker === 'undefined') {
throw new Error('Browser does not support Web Workers. Large file processing may be slow.');
}
return true;
},
// Local Storage
localStorage: () => {
if (typeof localStorage === 'undefined') {
throw new Error('Browser does not support Local Storage. Settings will not be saved.');
}
return true;
},
// WebGL for 3D (non-fatal)
webgl: () => {
const canvas = document.createElement('canvas');
const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
if (!gl) {
console.warn('WebGL not supported. 3D visualization will be disabled.');
return false; // Non-fatal
}
return true;
}
};

// Run all requirement checks
for (const [name, check] of Object.entries(requirements)) {
try {
await check();
console.log(`✓ ${name} check passed`);
} catch (error) {
console.error(`✗ ${name} check failed:`, error.message);
// Only critical errors should stop initialization
if (name === 'cryptoApi' || name === 'modernBrowser') {
throw error; // Fatal errors
}
}
}
}

/**
* Initialize UI elements
*/
initUI() {
// File inputs
this.ui.elements.fileInputEncrypt = document.getElementById('fileInputEncrypt');
this.ui.elements.fileInputDecrypt = document.getElementById('fileInputDecrypt');

// File info displays
this.ui.elements.encryptFileInfo = document.getElementById('encryptFileInfo');
this.ui.elements.decryptFileInfo = document.getElementById('decryptFileInfo');

// Password inputs
this.ui.elements.passwordEncrypt = document.getElementById('passwordEncrypt');
this.ui.elements.passwordConfirm = document.getElementById('passwordConfirm');
this.ui.elements.passwordDecrypt = document.getElementById('passwordDecrypt');

// Action buttons
this.ui.elements.encryptBtn = document.getElementById('encryptBtn');
this.ui.elements.decryptBtn = document.getElementById('decryptBtn');

// Progress displays
this.ui.elements.encryptProgress = document.getElementById('encryptProgress');
this.ui.elements.decryptProgress = document.getElementById('decryptProgress');

// Card elements
this.ui.elements.encryptCard = document.querySelector('.encrypt-card');
this.ui.elements.decryptCard = document.querySelector('.decrypt-card');

// Status messages
this.ui.elements.statusContainer = document.getElementById('status-container');
this.ui.elements.successStatus = document.getElementById('success-status');
this.ui.elements.errorStatus = document.getElementById('error-status');
this.ui.elements.warningStatus = document.getElementById('warning-status');
this.ui.elements.infoStatus = document.getElementById('info-status');
this.ui.elements.successText = document.getElementById('success-text');
this.ui.elements.errorText = document.getElementById('error-text');
this.ui.elements.warningText = document.getElementById('error-text');
this.ui.elements.infoText = document.getElementById('info-text');

// Statistics
this.ui.elements.filesProcessed = document.getElementById('filesProcessed');
this.ui.elements.dataEncrypted = document.getElementById('dataEncrypted');
this.ui.elements.encryptionSpeed = document.getElementById('encryptionSpeed');
this.ui.elements.securityLevelValue = document.getElementById('securityLevelValue');

// Security indicators
this.ui.elements.securityHttps = document.getElementById('securityHttps');
this.ui.elements.securityCrypto = document.getElementById('securityCrypto');
this.ui.elements.securityWorkers = document.getElementById('securityWorkers');
this.ui.elements.securityStorage = document.getElementById('securityStorage');

// Recovery system
this.ui.elements.recoveryPanel = document.getElementById('recoveryPanel');

// Settings
this.ui.elements.autoClear = document.getElementById('autoClear');

// Ensure all elements are found
const missingElements = [];
Object.entries(this.ui.elements).forEach(([name, element]) => {
if (!element) {
missingElements.push(name);
}
});

if (missingElements.length > 0) {
throw new Error(`Missing UI elements: ${missingElements.join(', ')}`);
}

console.log('✅ UI elements initialized');
}

/**
* Initialize subsystems
*/
async initSubsystems() {
console.log('Initializing subsystems...');

// Initialize Translation System
if (window.TranslationManager) {
this.components.translation = window.TranslationManager;
console.log('✓ Translation system initialized');
}

// Initialize Crypto Systems
if (window.CryptoEngine) {
this.components.crypto = window.CryptoEngine;
// Test crypto functionality
const testResult = await this.components.crypto.selfTest();
if (testResult.passed) {
console.log('✓ Core crypto system initialized and tested');
} else {
console.warn('Crypto self-test had issues:', testResult);
}
}

if (window.MilitaryCryptoEngine) {
this.components.militaryCrypto = window.MilitaryCryptoEngine;
console.log('✓ Military crypto system initialized');
}

// Initialize Three.js Scene - مع تعديل لـ ES6 و window.THREE
// ⭐ التأكد من أن ThreeSceneManager قد تم تعريفه
if (typeof ThreeSceneManager !== 'undefined') {
try {
// ⭐ تهيئة Three.js مع التأكد من تحميل الملفات أولاً
// ⭐ استخدام THREE من window (مُعرف من index.html)
console.log('✅ Three.js (ES6 Module) is available via window.THREE, initializing scene...');
this.components.threejs = new ThreeSceneManager(window.THREE); // ⭐ استخدام window.THREE
await this.components.threejs.init();
console.log('✅ Three.js scene initialized via ThreeSceneManager (ES6 - Updated for window.THREE)');
} catch (error) {
console.warn('Three.js initialization failed:', error);
this.showStatus('warning', 'threejs_warning', '3D effects initialization failed. Encryption/Decryption will still work.');
}
} else {
console.warn('ThreeSceneManager not found, skipping 3D initialization.');
this.showStatus('warning', 'threejs_warning', '3D effects not available. Encryption/Decryption will still work.');
}

// Initialize PWA Manager - مع إصلاح تسجيل المشاكل
if (window.PWAManager) {
try {
this.components.pwa = window.PWAManager;
await this.components.pwa.init();
console.log('✓ PWA manager initialized');
} catch (error) {
console.warn('PWA manager initialization failed:', error);
// استمر دون PWA، فهي ليست أساسية
}
}

// Initialize Audit System
if (window.SecurityAudit) {
this.components.audit = window.SecurityAudit;
console.log('✓ Security audit system initialized');
}

// Initialize Workers
if (window.WorkerManager) {
this.components.workers = window.WorkerManager;
console.log('✓ Worker manager initialized');
}

console.log('✅ Subsystems initialized');
}

/**
* Apply initial settings
*/
applyInitialSettings() {
// Apply dark mode
if (this.state.ui.darkMode) {
document.body.classList.add('dark-mode');
}

// Apply language
if (this.components.translation) {
this.components.translation.setLanguage(this.state.ui.language);
}

// Apply security level
this.updateSecurityLevelDisplay();

// Apply performance monitoring
this.performance.startMonitoring();
}

/**
* Update security status indicators
*/
updateSecurityStatus() {
// HTTPS
const isSecure = window.location.protocol === 'https:';
if (this.ui.elements.securityHttps) {
this.ui.elements.securityHttps.classList.toggle('active', isSecure);
this.ui.elements.securityHttps.title = isSecure ? 'Secure Connection (HTTPS)' : 'Insecure Connection (HTTP)';
}

// Crypto API
const cryptoAvailable = typeof crypto !== 'undefined' && typeof crypto.subtle !== 'undefined';
if (this.ui.elements.securityCrypto) {
this.ui.elements.securityCrypto.classList.toggle('active', cryptoAvailable);
this.ui.elements.securityCrypto.title = cryptoAvailable ? 'Web Crypto API Available' : 'Web Crypto API Not Available';
}

// Workers
const workersAvailable = typeof Worker !== 'undefined';
if (this.ui.elements.securityWorkers) {
this.ui.elements.securityWorkers.classList.toggle('active', workersAvailable);
this.ui.elements.securityWorkers.title = workersAvailable ? 'Web Workers Available' : 'Web Workers Not Available';
}

// Local Storage
const storageAvailable = typeof localStorage !== 'undefined';
if (this.ui.elements.securityStorage) {
this.ui.elements.securityStorage.classList.toggle('active', storageAvailable);
this.ui.elements.securityStorage.title = storageAvailable ? 'Local Storage Available' : 'Local Storage Not Available';
}
}

/**
* Update statistics display
*/
updateStatistics() {
// Example: Update files processed count
const filesProcessed = localStorage.getItem('filesProcessed') || 0;
if (this.ui.elements.filesProcessed) {
this.ui.elements.filesProcessed.textContent = filesProcessed;
}

// Example: Update data encrypted
const dataEncrypted = localStorage.getItem('dataEncrypted') || '0 MB';
if (this.ui.elements.dataEncrypted) {
this.ui.elements.dataEncrypted.textContent = dataEncrypted;
}

// Example: Update security level
if (this.ui.elements.securityLevelValue) {
this.ui.elements.securityLevelValue.textContent = this.state.encryption.settings.securityLevel;
}
}

/**
* Update security level display
*/
updateSecurityLevelDisplay() {
const level = this.state.encryption.settings.securityLevel;
let levelText = level;
let levelColor = '#0d47a1';

switch (level) {
case 'BASIC':
levelText = 'Basic';
levelColor = '#4caf50';
break;
case 'MEDIUM':
levelText = 'Medium';
levelColor = '#ff9800';
break;
case 'HIGH':
levelText = 'High';
levelColor = '#ff5722';
break;
case 'MILITARY':
levelText = 'Military';
levelColor = '#9c27b0';
break;
}

if (this.ui.elements.securityLevelValue) {
this.ui.elements.securityLevelValue.textContent = levelText;
this.ui.elements.securityLevelValue.style.color = levelColor;
}
}

// ============================================================================
// UI HANDLERS
// ============================================================================

/**
* Show file information
*/
showFileInformation(file, type) {
const elements = type === 'encrypt' ? {
name: document.getElementById('encryptFileName'),
size: document.getElementById('encryptFileSize'),
info: document.getElementById('encryptFileInfo')
} : {
name: document.getElementById('decryptFileName'),
size: document.getElementById('decryptFileSize'),
type: document.getElementById('decryptFileType'), // For decrypt only
info: document.getElementById('decryptFileInfo')
};

if (elements.name) {
elements.name.textContent = file.name;
}
if (elements.size) {
elements.size.textContent = this.formatFileSize(file.size);
}
if (elements.type && type === 'decrypt') {
elements.type.textContent = file.type || 'Unknown';
}
if (elements.info) {
elements.info.style.display = 'flex';
}
}

/**
* Show file info panel
*/
showFileInfo(type) {
const card = type === 'encrypt' ? this.ui.elements.encryptCard : this.ui.elements.decryptCard;
if (card) {
card.classList.add('file-selected');
}
}

/**
* Clear file selection
*/
clearFile(type) {
if (type === 'encrypt') {
this.state.encryption.file = null;
if (this.ui.elements.fileInputEncrypt) {
this.ui.elements.fileInputEncrypt.value = '';
}
if (this.ui.elements.encryptFileInfo) {
this.ui.elements.encryptFileInfo.style.display = 'none';
}
} else if (type === 'decrypt') {
this.state.decryption.file = null;
if (this.ui.elements.fileInputDecrypt) {
this.ui.elements.fileInputDecrypt.value = '';
}
if (this.ui.elements.decryptFileInfo) {
this.ui.elements.decryptFileInfo.style.display = 'none';
}
}
}

/**
* Format file size
*/
formatFileSize(bytes) {
if (bytes === 0) return '0 Bytes';
const k = 1024;
const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
const i = Math.floor(Math.log(bytes) / Math.log(k));
return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
* Show status message
*/
showStatus(type, key, message) {
const types = {
success: { element: this.ui.elements.successStatus, text: this.ui.elements.successText, icon: 'fa-check-circle' },
error: { element: this.ui.elements.errorStatus, text: this.ui.elements.errorText, icon: 'fa-exclamation-circle' },
warning: { element: this.ui.elements.warningStatus, text: this.ui.elements.warningText, icon: 'fa-exclamation-triangle' },
info: { element: this.ui.elements.infoStatus, text: this.ui.elements.infoText, icon: 'fa-info-circle' }
};

const status = types[type];
if (!status || !status.element) return;

// Hide all statuses first
Object.values(types).forEach(s => {
if (s.element) s.element.style.display = 'none';
});

// Show the requested status
const translatedMessage = this.t(key) || message;
status.text.textContent = translatedMessage;
status.element.style.display = 'flex';

// Auto-hide after 5 seconds
setTimeout(() => {
status.element.style.display = 'none';
}, 5000);

// Log to console
console[type === 'error' ? 'error' : type === 'warning' ? 'warn' : 'log'](`Status [${type.toUpperCase()}]:`, translatedMessage);
}

/**
* Translation helper
*/
t(key) {
// Use translation system if available
if (this.components.translation) {
return this.components.translation.get(key);
}
// Fallback to English
return key;
}

// ============================================================================
// ENCRYPTION & DECRYPTION LOGIC
// ============================================================================

/**
* Handle encryption
*/
async handleEncrypt() {
if (this.state.ui.isProcessing) {
this.showStatus('warning', 'processing_warning', 'Already processing a file.');
return;
}

const file = this.state.encryption.file;
const password = this.state.encryption.password;
const confirmPassword = this.state.encryption.confirmPassword;

if (!file) {
this.showStatus('error', 'no_file_error', 'Please select a file to encrypt.');
return;
}

if (!password) {
this.showStatus('error', 'no_password_error', 'Please enter a password.');
return;
}

if (password !== confirmPassword) {
this.showStatus('error', 'password_mismatch_error', 'Passwords do not match.');
return;
}

this.state.ui.isProcessing = true;
this.showStatus('info', 'processing_info', 'Starting encryption...');

try {
// Get crypto engine based on security level
let cryptoEngine = this.components.crypto;
if (this.state.encryption.settings.securityLevel === 'MILITARY' && this.components.militaryCrypto) {
cryptoEngine = this.components.militaryCrypto;
}

if (!cryptoEngine) {
throw new Error('No crypto engine available');
}

// Perform encryption
const encryptedFile = await cryptoEngine.encrypt(file, password, this.state.encryption.settings);

// Save file
const downloadUrl = URL.createObjectURL(encryptedFile);
const link = document.createElement('a');
link.href = downloadUrl;
link.download = file.name + '.cvault';
link.click();
URL.revokeObjectURL(downloadUrl);

this.showStatus('success', 'encrypt_success', `File encrypted successfully: ${encryptedFile.name}`);
this.updateStatistics();

} catch (error) {
console.error('Encryption failed:', error);
this.showStatus('error', 'encrypt_error', `Encryption failed: ${error.message}`);
} finally {
this.state.ui.isProcessing = false;
}
}

/**
* Handle decryption
*/
async handleDecrypt() {
if (this.state.ui.isProcessing) {
this.showStatus('warning', 'processing_warning', 'Already processing a file.');
return;
}

const file = this.state.decryption.file;
const password = this.state.decryption.password;

if (!file) {
this.showStatus('error', 'no_file_error', 'Please select a file to decrypt.');
return;
}

if (!password) {
this.showStatus('error', 'no_password_error', 'Please enter the password.');
return;
}

this.state.ui.isProcessing = true;
this.showStatus('info', 'processing_info', 'Starting decryption...');

try {
// Perform decryption
const decryptedFile = await this.components.crypto.decrypt(file, password, this.state.decryption.settings);

// Save file
const downloadUrl = URL.createObjectURL(decryptedFile);
const link = document.createElement('a');
link.href = downloadUrl;
link.download = file.name.replace('.cvault', '').replace('.cvenc', '').replace('.cvmil', '');
link.click();
URL.revokeObjectURL(downloadUrl);

this.showStatus('success', 'decrypt_success', `File decrypted successfully: ${decryptedFile.name}`);
this.updateStatistics();

} catch (error) {
console.error('Decryption failed:', error);
this.showStatus('error', 'decrypt_error', `Decryption failed: ${error.message}`);
} finally {
this.state.ui.isProcessing = false;
}
}

// ============================================================================
// EVENT LISTENERS
// ============================================================================

/**
* Setup event listeners
*/
setupEventListeners() {
// File inputs
if (this.ui.elements.fileInputEncrypt) {
this.ui.elements.fileInputEncrypt.addEventListener('change', (e) => {
this.state.encryption.file = e.target.files[0];
if (this.state.encryption.file) {
this.showFileInformation(this.state.encryption.file, 'encrypt');
this.showFileInfo('encrypt');
}
});
}

if (this.ui.elements.fileInputDecrypt) {
this.ui.elements.fileInputDecrypt.addEventListener('change', (e) => {
this.state.decryption.file = e.target.files[0];
if (this.state.decryption.file) {
this.showFileInformation(this.state.decryption.file, 'decrypt');
this.showFileInfo('decrypt');
}
});
}

// Password inputs
if (this.ui.elements.passwordEncrypt) {
this.ui.elements.passwordEncrypt.addEventListener('input', (e) => {
this.state.encryption.password = e.target.value;
});
}

if (this.ui.elements.passwordConfirm) {
this.ui.elements.passwordConfirm.addEventListener('input', (e) => {
this.state.encryption.confirmPassword = e.target.value;
});
}

if (this.ui.elements.passwordDecrypt) {
this.ui.elements.passwordDecrypt.addEventListener('input', (e) => {
this.state.decryption.password = e.target.value;
});
}

// Action buttons
if (this.ui.elements.encryptBtn) {
this.ui.elements.encryptBtn.addEventListener('click', () => this.handleEncrypt());
}

if (this.ui.elements.decryptBtn) {
this.ui.elements.decryptBtn.addEventListener('click', () => this.handleDecrypt());
}

// Auto-clear password
if (this.ui.elements.autoClear && this.ui.elements.autoClear.checked) {
['click', 'change'].forEach(eventType => {
document.addEventListener(eventType, (e) => {
if (e.target.matches('input[type="password"]')) {
setTimeout(() => {
e.target.value = '';
}, 30000); // Clear after 30 seconds
}
});
});
}
}

// ============================================================================
// UTILITIES
// ============================================================================

/**
* Get application statistics
*/
getStatistics() {
return {
filesProcessed: localStorage.getItem('filesProcessed') || 0,
dataEncrypted: localStorage.getItem('dataEncrypted') || '0 MB',
encryptionSpeed: localStorage.getItem('encryptionSpeed') || 'N/A',
securityLevel: this.state.encryption.settings.securityLevel,
browser: navigator.userAgent,
memory: this.state.ui.memoryAvailable,
cpuCores: this.state.ui.cpuCores
};
}

/**
* Export configuration
*/
exportConfig() {
const config = {
version: '4.4.1',
state: this.state,
timestamp: Date.now()
};
const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
const url = URL.createObjectURL(blob);
const link = document.createElement('a');
link.href = url;
link.download = 'ciphervault-config.json';
link.click();
URL.revokeObjectURL(url);
}

/**
* Import configuration
*/
importConfig(file) {
const reader = new FileReader();
reader.onload = (e) => {
try {
const config = JSON.parse(e.target.result);
// Apply config (be careful with this)
this.state = { ...this.state, ...config.state };
this.applyInitialSettings();
this.showStatus('info', 'config_imported', 'Configuration imported successfully.');
} catch (error) {
this.showStatus('error', 'config_import_error', `Failed to import configuration: ${error.message}`);
}
};
reader.readAsText(file);
}
}

// ============================================================================
// GLOBAL INITIALIZATION
// ============================================================================

// Global instance
let CipherVaultAppInstance = null;

/**
* Initialize the application
*/
async function initializeCipherVaultApp() {
if (CipherVaultAppInstance) {
console.warn('CipherVaultApp already initialized');
return CipherVaultAppInstance;
}

try {
// ⭐ التأكد من تحميل جميع المكونات المطلوبة
// ⭐ لا نحتاج إلى انتظار الملفات كما في الإصدار القديم لأن ES6 Modules يُدير التحميل تلقائيًا

CipherVaultAppInstance = new CipherVaultApp();
await CipherVaultAppInstance.init();
CipherVaultAppInstance.setupEventListeners();

console.log('✅ CipherVault App fully initialized (ES6 Module - Updated for window.THREE)');

// Dispatch initialization event
window.dispatchEvent(new CustomEvent('ciphervault:initialized', {
detail: { app: CipherVaultAppInstance, timestamp: Date.now() }
}));

return CipherVaultAppInstance;

} catch (error) {
console.error('❌ Failed to initialize CipherVault App (ES6 Module - Updated for window.THREE):', error);
// ⭐ إظهار رسالة خطأ للمستخدم
showCriticalError(error);
}
}

/**
* ⭐ دالة لعرض رسالة خطأ حرجة
*/
function showCriticalError(error) {
const container = document.querySelector('.main-container') || document.body;
const errorDiv = document.createElement('div');
errorDiv.className = 'critical-error-display';
errorDiv.style.cssText = `
position: fixed;
top: 50%;
left: 50%;
transform: translate(-50%, -50%);
text-align: center;
color: #ff4757;
padding: 30px;
background: rgba(5, 5, 16, 0.98);
border-radius: 15px;
border: 3px solid #ff4757;
max-width: 500px;
z-index: 10000;
font-family: system-ui, -apple-system, sans-serif;
box-shadow: 0 10px 30px rgba(255, 71, 87, 0.3);
`;
errorDiv.innerHTML = `
<div style="margin-bottom: 20px; font-size: 50px;">❌</div>
<h2 style="margin: 0 0 15px 0; color: #ff4757;">Critical Error</h2>
<p style="margin: 0 0 20px 0; font-size: 16px; color: #e0e0e0;">
${error.message || 'An unknown error occurred during initialization.'}
</p>
<p style="font-size: 14px; color: #aa6666; margin: 0;">
Please refresh the page or contact support.
</p>
<button onclick="location.reload()" style="
margin-top: 20px;
padding: 10px 20px;
background: #ff4757;
color: white;
border: none;
border-radius: 5px;
cursor: pointer;
font-size: 16px;
">
Refresh Page
</button>
`;
container.appendChild(errorDiv);
}

// ⭐ تهيئة التطبيق بعد تحميل DOM
if (typeof window !== 'undefined') {
if (document.readyState === 'loading') {
document.addEventListener('DOMContentLoaded', () => {
setTimeout(() => {
if (!window.CIPHERVAULT_INITIALIZED) {
initializeCipherVaultApp();
window.CIPHERVAULT_INITIALIZED = true;
}
}, 2500); // ⭐ زيادة الوقت قليلاً لضمان تحميل الملفات
});
} else {
setTimeout(() => {
if (!window.CIPHERVAULT_INITIALIZED) {
initializeCipherVaultApp();
window.CIPHERVAULT_INITIALIZED = true;
}
}, 2500); // ⭐ زيادة الوقت قليلاً لضمان تحميل الملفات
}
}

// Export for ES modules
if (typeof module !== 'undefined' && module.exports) {
module.exports = { CipherVaultApp, initializeCipherVaultApp };
}

console.log('🔧 CipherVaultApp v4.4.2 (ES6 Module - Updated for window.THREE) main.js loaded - All fixes applied');
