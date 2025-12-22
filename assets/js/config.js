/**
 * CipherVault 3D Pro - Configuration File
 * Military Grade Encryption System
 * Version: 4.1.0
 */

// ============================================================================
// SECURITY CONFIGURATION - DO NOT MODIFY WITHOUT SECURITY REVIEW
// ============================================================================

const SECURITY_CONFIG = {
    // Core Encryption Settings
    ENCRYPTION: {
        ALGORITHM: 'AES-GCM',
        KEY_SIZE: 256,
        BLOCK_SIZE: 128,
        HMAC: 'SHA-256',
        
        // PBKDF2 Iterations per security level
        PBKDF2_ITERATIONS: {
            BASIC: 100000,
            MEDIUM: 310000,
            HIGH: 600000,
            MILITARY: 1000000
        },
        
        // Salt sizes (in bytes)
        SALT_SIZES: {
            BASIC: 16,
            MEDIUM: 24,
            HIGH: 32,
            MILITARY: 48
        },
        
        // IV sizes (in bytes)
        IV_SIZES: {
            AES_GCM: 12,
            CHACHA20: 24
        },
        
        // Key derivation settings
        KEY_DERIVATION: {
            HASH: 'SHA-512',
            ITERATIONS: 310000,
            KEY_LENGTH: 64
        }
    },
    
    // File Processing Limits
    FILE_LIMITS: {
        MAX_FILE_SIZE: 5 * 1024 * 1024 * 1024, // 5GB
        CHUNK_SIZE: 10 * 1024 * 1024, // 10MB
        MEMORY_THRESHOLD: 100 * 1024 * 1024, // 100MB
        WORKER_THRESHOLD: 500 * 1024 * 1024, // 500MB
        
        // Compression thresholds
        COMPRESSION_THRESHOLD: 1024 * 1024, // 1MB
        MAX_COMPRESSION_RATIO: 10,
        
        // Progress update intervals (ms)
        PROGRESS_INTERVAL: 100
    },
    
    // Security Levels Configuration
    SECURITY_LEVELS: {
        BASIC: {
            name: 'BASIC',
            description: 'Basic encryption for non-sensitive files',
            layers: 1,
            algorithms: ['AES-256-GCM'],
            iterations: 100000,
            keySize: 32,
            hmac: 'SHA-256',
            compression: true,
            wipeMemory: false
        },
        
        MEDIUM: {
            name: 'MEDIUM',
            description: 'Balanced security for most files',
            layers: 2,
            algorithms: ['AES-256-GCM', 'ChaCha20-Poly1305'],
            iterations: 310000,
            keySize: 32,
            hmac: 'SHA-384',
            compression: true,
            wipeMemory: true
        },
        
        HIGH: {
            name: 'HIGH',
            description: 'High security for sensitive data',
            layers: 3,
            algorithms: ['AES-256-GCM', 'ChaCha20-Poly1305', 'Obfuscation'],
            iterations: 600000,
            keySize: 48,
            hmac: 'SHA-512',
            compression: true,
            wipeMemory: true,
            antiTiming: true
        },
        
        MILITARY: {
            name: 'MILITARY',
            description: 'Military grade encryption for classified data',
            layers: 4,
            algorithms: ['AES-256-GCM', 'ChaCha20-Poly1305', 'Obfuscation', 'Double Encryption'],
            iterations: 1000000,
            keySize: 64,
            hmac: 'SHA-512',
            compression: true,
            wipeMemory: true,
            antiTiming: true,
            memoryProtection: true,
            recoveryShards: 5,
            shardThreshold: 3
        }
    },
    
    // Recovery System Settings
    RECOVERY: {
        SHARDS: {
            TOTAL: 5,
            THRESHOLD: 3,
            EXPIRY_DAYS: 30,
            KEY_SIZE: 32
        },
        
        ENCRYPTION: {
            ALGORITHM: 'AES-GCM',
            ITERATIONS: 100000,
            SALT_SIZE: 32
        }
    },
    
    // Audit System Settings
    AUDIT: {
        MAX_LOGS: 1000,
        LOG_RETENTION_DAYS: 30,
        ENCRYPT_LOGS: true,
        COMPRESS_LOGS: true,
        
        // Alert thresholds
        ALERTS: {
            FAILED_ATTEMPTS: 10,
            TIME_WINDOW: 5 * 60 * 1000, // 5 minutes
            HIGH_FREQUENCY: 50,
            HIGH_FREQUENCY_WINDOW: 5 * 60 * 1000 // 5 minutes
        }
    },
    
    // Performance Settings
    PERFORMANCE: {
        MAX_WORKERS: navigator.hardwareConcurrency || 4,
        WORKER_TIMEOUT: 300000, // 5 minutes
        MEMORY_LIMIT: 0.8, // 80% of available memory
        CACHE_SIZE: 100 * 1024 * 1024, // 100MB
        
        // Chunk processing
        CHUNK_PARALLELISM: 2,
        STREAM_BUFFER_SIZE: 1024 * 1024 // 1MB
    },
    
    // UI Settings
    UI: {
        ANIMATION_DURATION: 300,
        NOTIFICATION_DURATION: 5000,
        TOOLTIP_DELAY: 300,
        DEBOUNCE_DELAY: 300,
        
        // Progress animation
        PROGRESS_ANIMATION: {
            DURATION: 500,
            EASING: 'cubic-bezier(0.4, 0, 0.2, 1)'
        }
    },
    
    // Network Settings
    NETWORK: {
        OFFLINE_TIMEOUT: 5000,
        RETRY_ATTEMPTS: 3,
        RETRY_DELAY: 1000,
        
        // Service Worker
        SERVICE_WORKER: {
            CACHE_NAME: 'ciphervault-v4.1',
            OFFLINE_PAGE: '/offline.html',
            PRECACHE_RESOURCES: [
                '/',
                '/index.html',
                '/manifest.json'
            ]
        }
    },
    
    // Privacy Settings
    PRIVACY: {
        AUTO_WIPE: true,
        WIPE_ITERATIONS: 3,
        CLEAR_CLIPBOARD: true,
        CLEAR_CLIPBOARD_DELAY: 30000, // 30 seconds
        
        // Local storage
        LOCAL_STORAGE: {
            ENCRYPT: true,
            MAX_ITEMS: 100,
            AUTO_CLEANUP: true
        }
    }
};

// ============================================================================
// APPLICATION STATE CONFIGURATION
// ============================================================================

const APP_STATE = {
    // Current application state
    current: {
        language: 'en',
        securityLevel: 'MEDIUM',
        darkMode: false,
        animations: true,
        reducedMotion: false,
        autoWipe: true,
        sessionTimeout: 15 * 60 * 1000, // 15 minutes
        lastActivity: Date.now(),
        
        // Encryption state
        encryption: {
            active: false,
            progress: 0,
            currentFile: null,
            startTime: null
        },
        
        // Decryption state
        decryption: {
            active: false,
            progress: 0,
            currentFile: null,
            startTime: null
        },
        
        // Security state
        security: {
            https: window.isSecureContext,
            crypto: !!window.crypto?.subtle,
            workers: !!window.Worker,
            storage: 'localStorage' in window,
            memory: navigator.deviceMemory || 4,
            cores: navigator.hardwareConcurrency || 4
        },
        
        // Statistics
        stats: {
            filesProcessed: 0,
            dataEncrypted: 0,
            totalTime: 0,
            averageSpeed: 0,
            lastUpdate: Date.now()
        },
        
        // Session data
        session: {
            id: generateSessionId(),
            startTime: Date.now(),
            activities: [],
            securityScore: 0
        }
    },
    
    // Default settings
    defaults: {
        language: 'en',
        securityLevel: 'MEDIUM',
        darkMode: window.matchMedia('(prefers-color-scheme: dark)').matches,
        animations: true,
        reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
        autoWipe: true,
        sessionTimeout: 15 * 60 * 1000,
        
        // Performance defaults
        performance: {
            useWorkers: true,
            chunkSize: 10 * 1024 * 1024,
            maxWorkers: navigator.hardwareConcurrency || 4,
            enableCompression: true
        },
        
        // Privacy defaults
        privacy: {
            autoClear: true,
            disableLogging: false,
            clearClipboard: true
        }
    },
    
    // State management methods
    methods: {
        updateState(key, value) {
            const keys = key.split('.');
            let obj = this.current;
            
            for (let i = 0; i < keys.length - 1; i++) {
                if (!obj[keys[i]]) obj[keys[i]] = {};
                obj = obj[keys[i]];
            }
            
            obj[keys[keys.length - 1]] = value;
            this.saveState();
            this.dispatchEvent('stateChanged', { key, value });
        },
        
        getState(key) {
            const keys = key.split('.');
            let obj = this.current;
            
            for (const k of keys) {
                if (!obj || typeof obj !== 'object') return undefined;
                obj = obj[k];
            }
            
            return obj;
        },
        
        saveState() {
            try {
                const stateToSave = {
                    language: this.current.language,
                    securityLevel: this.current.securityLevel,
                    darkMode: this.current.darkMode,
                    animations: this.current.animations,
                    reducedMotion: this.current.reducedMotion,
                    autoWipe: this.current.autoWipe,
                    sessionTimeout: this.current.sessionTimeout
                };
                
                localStorage.setItem('ciphervault_state', JSON.stringify(stateToSave));
            } catch (error) {
                console.warn('Failed to save state:', error);
            }
        },
        
        loadState() {
            try {
                const saved = localStorage.getItem('ciphervault_state');
                if (saved) {
                    const state = JSON.parse(saved);
                    Object.assign(this.current, state);
                }
            } catch (error) {
                console.warn('Failed to load state:', error);
            }
        },
        
        resetState() {
            Object.assign(this.current, this.defaults);
            this.saveState();
            this.dispatchEvent('stateReset', {});
        },
        
        updateSecurityScore() {
            let score = 100;
            
            // HTTPS check
            if (!this.current.security.https) score -= 30;
            
            // Crypto API check
            if (!this.current.security.crypto) score -= 20;
            
            // Web Workers check
            if (!this.current.security.workers) score -= 10;
            
            // Memory check
            if (this.current.security.memory < 4) score -= 5;
            
            // Update session
            this.current.session.securityScore = Math.max(score, 0);
            this.updateState('session.securityScore', this.current.session.securityScore);
            
            return this.current.session.securityScore;
        },
        
        updateActivity(type, details = {}) {
            const activity = {
                type,
                timestamp: Date.now(),
                details,
                sessionId: this.current.session.id
            };
            
            this.current.session.activities.push(activity);
            this.current.lastActivity = Date.now();
            
            // Keep only last 100 activities
            if (this.current.session.activities.length > 100) {
                this.current.session.activities.shift();
            }
            
            this.dispatchEvent('activityLogged', activity);
        },
        
        checkSessionTimeout() {
            const now = Date.now();
            const inactiveTime = now - this.current.lastActivity;
            
            if (inactiveTime > this.current.sessionTimeout) {
                this.dispatchEvent('sessionTimeout', { inactiveTime });
                return true;
            }
            
            return false;
        },
        
        // Event system
        _events: {},
        
        on(event, callback) {
            if (!this._events[event]) this._events[event] = [];
            this._events[event].push(callback);
        },
        
        off(event, callback) {
            if (!this._events[event]) return;
            const index = this._events[event].indexOf(callback);
            if (index > -1) this._events[event].splice(index, 1);
        },
        
        dispatchEvent(event, data) {
            if (!this._events[event]) return;
            this._events[event].forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in event handler for ${event}:`, error);
                }
            });
        }
    }
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Generate a unique session ID
 */
function generateSessionId() {
    return 'session_' + Date.now() + '_' + 
           Math.random().toString(36).substr(2, 9) + '_' +
           crypto.getRandomValues(new Uint8Array(4))
               .reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');
}

/**
 * Format file size to human readable format
 */
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Format time duration
 */
function formatTimeDuration(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
        return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
        return `${minutes}m ${seconds % 60}s`;
    } else {
        return `${seconds}s`;
    }
}

/**
 * Debounce function for performance
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Throttle function for performance
 */
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Deep clone object
 */
function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

/**
 * Secure wipe of data
 */
function secureWipe(arrayBuffer) {
    if (!arrayBuffer) return;
    
    const view = new Uint8Array(arrayBuffer);
    for (let i = 0; i < view.length; i++) {
        view[i] = 0;
    }
    
    // Multiple passes for security
    for (let pass = 0; pass < 3; pass++) {
        crypto.getRandomValues(view);
        for (let i = 0; i < view.length; i++) {
            view[i] = 0;
        }
    }
}

/**
 * Validate password strength
 */
function validatePasswordStrength(password) {
    if (!password) return { valid: false, score: 0, reasons: [] };
    
    const checks = {
        length: password.length >= 12,
        lowercase: /[a-z]/.test(password),
        uppercase: /[A-Z]/.test(password),
        numbers: /\d/.test(password),
        symbols: /[^A-Za-z0-9]/.test(password),
        noSpaces: !/\s/.test(password),
        noRepeats: !/(.)\1\1/.test(password)
    };
    
    let score = 0;
    const reasons = [];
    
    if (checks.length) score += 20;
    else reasons.push('Password must be at least 12 characters long');
    
    if (checks.lowercase) score += 10;
    else reasons.push('Password must contain lowercase letters');
    
    if (checks.uppercase) score += 10;
    else reasons.push('Password must contain uppercase letters');
    
    if (checks.numbers) score += 10;
    else reasons.push('Password must contain numbers');
    
    if (checks.symbols) score += 10;
    else reasons.push('Password must contain symbols');
    
    if (checks.noSpaces) score += 10;
    else reasons.push('Password must not contain spaces');
    
    if (checks.noRepeats) score += 10;
    else reasons.push('Password must not contain repeating characters');
    
    // Additional length bonus
    if (password.length >= 16) score += 10;
    if (password.length >= 20) score += 10;
    
    return {
        valid: score >= 70,
        score: Math.min(score, 100),
        reasons,
        checks
    };
}

/**
 * Generate random filename
 */
function generateRandomFilename(originalName, securityLevel) {
    const timestamp = Date.now();
    const randomId = crypto.getRandomValues(new Uint8Array(8))
        .reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');
    
    const extensions = {
        BASIC: '.cvault',
        MEDIUM: '.cvenc',
        HIGH: '.cvsec',
        MILITARY: '.cvmil'
    };
    
    const extension = extensions[securityLevel] || '.cvault';
    const sanitizedName = originalName.replace(/[^a-zA-Z0-9.-]/g, '_');
    
    return `${sanitizedName}_${timestamp}_${randomId}${extension}`;
}

/**
 * Check browser capabilities
 */
function checkBrowserCapabilities() {
    const capabilities = {
        // Web Crypto API
        crypto: {
            available: !!window.crypto?.subtle,
            algorithms: ['AES-GCM', 'SHA-256', 'PBKDF2']
        },
        
        // Web Workers
        workers: {
            available: !!window.Worker,
            count: navigator.hardwareConcurrency || 4
        },
        
        // File API
        file: {
            fileReader: !!window.FileReader,
            fileReaderSync: !!window.FileReaderSync,
            blob: !!window.Blob,
            stream: !!window.ReadableStream
        },
        
        // Storage
        storage: {
            localStorage: 'localStorage' in window,
            sessionStorage: 'sessionStorage' in window,
            indexedDB: 'indexedDB' in window
        },
        
        // Performance
        performance: {
            memory: 'deviceMemory' in navigator ? navigator.deviceMemory : 4,
            cores: navigator.hardwareConcurrency || 4,
            connection: navigator.connection ? navigator.connection.effectiveType : 'unknown'
        },
        
        // Security
        security: {
            https: window.isSecureContext,
            referrerPolicy: 'referrerPolicy' in document,
            contentSecurityPolicy: 'securityPolicy' in document
        }
    };
    
    return capabilities;
}

/**
 * Get system information
 */
function getSystemInfo() {
    return {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        languages: navigator.languages,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        screen: {
            width: window.screen.width,
            height: window.screen.height,
            colorDepth: window.screen.colorDepth,
            pixelDepth: window.screen.pixelDepth
        },
        hardware: {
            cores: navigator.hardwareConcurrency || 4,
            memory: navigator.deviceMemory || 4,
            maxTouchPoints: navigator.maxTouchPoints || 0
        },
        connection: navigator.connection ? {
            effectiveType: navigator.connection.effectiveType,
            downlink: navigator.connection.downlink,
            rtt: navigator.connection.rtt,
            saveData: navigator.connection.saveData
        } : null
    };
}

/**
 * Performance monitoring
 */
class PerformanceMonitor {
    constructor() {
        this.metrics = new Map();
        this.startTimes = new Map();
    }
    
    start(label) {
        this.startTimes.set(label, performance.now());
    }
    
    end(label) {
        const startTime = this.startTimes.get(label);
        if (!startTime) return;
        
        const duration = performance.now() - startTime;
        const metric = this.metrics.get(label) || { count: 0, total: 0, min: Infinity, max: 0 };
        
        metric.count++;
        metric.total += duration;
        metric.min = Math.min(metric.min, duration);
        metric.max = Math.max(metric.max, duration);
        metric.average = metric.total / metric.count;
        
        this.metrics.set(label, metric);
        this.startTimes.delete(label);
        
        return duration;
    }
    
    getMetrics(label) {
        return this.metrics.get(label);
    }
    
    getAllMetrics() {
        return Object.fromEntries(this.metrics);
    }
    
    reset() {
        this.metrics.clear();
        this.startTimes.clear();
    }
}

// ============================================================================
// EXPORTS
// ============================================================================

// Make configuration available globally
if (typeof window !== 'undefined') {
    window.CipherVaultConfig = SECURITY_CONFIG;
    window.AppState = APP_STATE;
    window.PerformanceMonitor = PerformanceMonitor;
    
    // Helper functions
    window.formatFileSize = formatFileSize;
    window.formatTimeDuration = formatTimeDuration;
    window.validatePasswordStrength = validatePasswordStrength;
    window.generateRandomFilename = generateRandomFilename;
    window.checkBrowserCapabilities = checkBrowserCapabilities;
    window.getSystemInfo = getSystemInfo;
    window.secureWipe = secureWipe;
}

// For Node.js/ES modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        SECURITY_CONFIG,
        APP_STATE,
        PerformanceMonitor,
        formatFileSize,
        formatTimeDuration,
        validatePasswordStrength,
        generateRandomFilename,
        checkBrowserCapabilities,
        getSystemInfo,
        secureWipe
    };
}
