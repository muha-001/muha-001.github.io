/**
 * CipherVault 3D Pro - Enhanced Configuration File
 * Military Grade Encryption System v4.2.0
 * Supports files up to 10GB
 */

// ============================================================================
// ENHANCED SECURITY CONFIGURATION
// ============================================================================

const ENHANCED_CONFIG = {
    // System Information
    SYSTEM: {
        VERSION: "4.2.0",
        BUILD: "2024.01",
        NAME: "CipherVault 3D Pro",
        MODE: "ENHANCED",
        MAX_FILE_SIZE: 10 * 1024 * 1024 * 1024 // 10GB
    },
    
    // Core Encryption Settings
    ENCRYPTION: {
        PRIMARY_ALGORITHM: 'AES-GCM',
        ALTERNATE_ALGORITHMS: ['ChaCha20-Poly1305', 'AES-CBC', 'AES-CTR'],
        
        // Key sizes (in bits)
        KEY_SIZES: {
            AES: 256,
            CHACHA20: 256,
            HMAC: 512
        },
        
        // PBKDF2 Iterations per security level
        PBKDF2_ITERATIONS: {
            BASIC: 100000,
            MEDIUM: 310000,
            HIGH: 600000,
            MILITARY: 1000000,
            ULTRA: 2000000
        },
        
        // Salt sizes (in bytes)
        SALT_SIZES: {
            BASIC: 16,
            MEDIUM: 24,
            HIGH: 32,
            MILITARY: 48,
            ULTRA: 64
        },
        
        // IV sizes (in bytes)
        IV_SIZES: {
            AES_GCM: 12,
            AES_CBC: 16,
            CHACHA20: 12,
            AES_CTR: 16
        },
        
        // Authentication tag sizes
        TAG_SIZES: {
            AES_GCM: 16,
            CHACHA20: 16
        },
        
        // Key derivation settings
        KEY_DERIVATION: {
            HASH: 'SHA-512',
            MIN_ITERATIONS: 100000,
            MAX_ITERATIONS: 2000000,
            KEY_LENGTH: 64, // 512 bits
            SALT_LENGTH: 32
        }
    },
    
    // File Processing Configuration
    FILE_PROCESSING: {
        // Maximum file size: 10GB
        MAX_FILE_SIZE: 10 * 1024 * 1024 * 1024,
        
        // Chunk sizes for different scenarios
        CHUNK_SIZES: {
            MOBILE: 1 * 1024 * 1024, // 1MB for mobile
            DESKTOP: 10 * 1024 * 1024, // 10MB for desktop
            LOW_MEMORY: 512 * 1024, // 512KB for low memory devices
            STREAMING: 5 * 1024 * 1024 // 5MB for streaming
        },
        
        // Memory thresholds
        MEMORY_THRESHOLDS: {
            LOW_MEMORY: 100 * 1024 * 1024, // 100MB
            MEDIUM_MEMORY: 500 * 1024 * 1024, // 500MB
            HIGH_MEMORY: 1024 * 1024 * 1024, // 1GB
            WORKER_THRESHOLD: 100 * 1024 * 1024 // Use workers for files > 100MB
        },
        
        // Compression settings
        COMPRESSION: {
            ENABLED: true,
            THRESHOLD: 1024 * 1024, // 1MB
            LEVEL: 6, // Compression level (1-9)
            TYPES: ['text', 'json', 'xml', 'html', 'css', 'js', 'log', 'csv'],
            EXCLUDE_TYPES: ['jpg', 'jpeg', 'png', 'gif', 'mp4', 'avi', 'mov', 'mp3', 'wav', 'zip', 'rar', '7z']
        },
        
        // Progress update intervals (ms)
        PROGRESS_INTERVAL: 100,
        THROTTLE_INTERVAL: 500
    },
    
    // Enhanced Security Levels
    SECURITY_LEVELS: {
        BASIC: {
            id: 'BASIC',
            name: 'Basic Encryption',
            description: 'Fast encryption for non-sensitive files',
            layers: 1,
            algorithms: ['AES-256-GCM'],
            iterations: 100000,
            keySize: 32,
            saltSize: 16,
            hmac: 'SHA-256',
            compression: true,
            wipeMemory: false,
            maxFileSize: 1 * 1024 * 1024 * 1024, // 1GB
            recommendedFor: ['Documents', 'Images', 'Non-sensitive data']
        },
        
        MEDIUM: {
            id: 'MEDIUM',
            name: 'Medium Security',
            description: 'Balanced security for most files',
            layers: 2,
            algorithms: ['AES-256-GCM', 'ChaCha20-Poly1305'],
            iterations: 310000,
            keySize: 32,
            saltSize: 24,
            hmac: 'SHA-384',
            compression: true,
            wipeMemory: true,
            maxFileSize: 5 * 1024 * 1024 * 1024, // 5GB
            recommendedFor: ['Business documents', 'Personal files', 'Archives']
        },
        
        HIGH: {
            id: 'HIGH',
            name: 'High Security',
            description: 'Maximum security for sensitive data',
            layers: 3,
            algorithms: ['AES-256-GCM', 'ChaCha20-Poly1305', 'AES-256-CBC'],
            iterations: 600000,
            keySize: 48,
            saltSize: 32,
            hmac: 'SHA-512',
            compression: true,
            wipeMemory: true,
            antiTiming: true,
            obfuscation: true,
            maxFileSize: 10 * 1024 * 1024 * 1024, // 10GB
            recommendedFor: ['Financial data', 'Legal documents', 'Sensitive information']
        },
        
        MILITARY: {
            id: 'MILITARY',
            name: 'Military Grade',
            description: 'Ultimate protection for classified data',
            layers: 4,
            algorithms: ['AES-256-GCM', 'ChaCha20-Poly1305', 'AES-256-CBC', 'Obfuscation Layer'],
            iterations: 1000000,
            keySize: 64,
            saltSize: 48,
            hmac: 'SHA-512',
            compression: true,
            wipeMemory: true,
            antiTiming: true,
            obfuscation: true,
            memoryProtection: true,
            doubleEncryption: true,
            maxFileSize: 10 * 1024 * 1024 * 1024, // 10GB
            recommendedFor: ['Government data', 'Military secrets', 'Top secret information']
        },
        
        ULTRA: {
            id: 'ULTRA',
            name: 'Ultra Security',
            description: 'Extreme protection for critical assets',
            layers: 5,
            algorithms: ['AES-256-GCM', 'ChaCha20-Poly1305', 'AES-256-CBC', 'AES-256-CTR', 'Obfuscation'],
            iterations: 2000000,
            keySize: 64,
            saltSize: 64,
            hmac: 'SHA-512',
            compression: true,
            wipeMemory: true,
            antiTiming: true,
            obfuscation: true,
            memoryProtection: true,
            doubleEncryption: true,
            keyStretching: true,
            maxFileSize: 10 * 1024 * 1024 * 1024, // 10GB
            recommendedFor: ['Nuclear codes', 'Bank vault codes', 'Ultra-sensitive data']
        }
    },
    
    // Enhanced Recovery System
    RECOVERY: {
        SHARDS: {
            TOTAL: 5,
            THRESHOLD: 3,
            KEY_SIZE: 32,
            ENCRYPTION: 'AES-256-GCM',
            EXPIRY_DAYS: 30,
            AUTO_GENERATE: true
        },
        
        BACKUP: {
            ENABLED: true,
            AUTO_BACKUP: true,
            BACKUP_INTERVAL: 24 * 60 * 60 * 1000, // 24 hours
            MAX_BACKUPS: 10,
            ENCRYPT_BACKUPS: true
        }
    },
    
    // Enhanced Audit System
    AUDIT: {
        ENABLED: true,
        MAX_LOGS: 10000,
        LOG_RETENTION_DAYS: 90,
        ENCRYPT_LOGS: true,
        COMPRESS_LOGS: true,
        AUTO_EXPORT: true,
        EXPORT_INTERVAL: 7 * 24 * 60 * 60 * 1000, // 7 days
        
        // Alert thresholds
        ALERTS: {
            FAILED_ATTEMPTS: 5,
            TIME_WINDOW: 5 * 60 * 1000, // 5 minutes
            HIGH_FREQUENCY: 50,
            HIGH_FREQUENCY_WINDOW: 5 * 60 * 1000, // 5 minutes
            MEMORY_THRESHOLD: 0.9, // 90% memory usage
            CPU_THRESHOLD: 0.8 // 80% CPU usage
        }
    },
    
    // Performance Configuration
    PERFORMANCE: {
        // Worker configuration
        WORKERS: {
            MAX_COUNT: Math.min(navigator.hardwareConcurrency || 4, 8),
            TIMEOUT: 5 * 60 * 1000, // 5 minutes
            RECYCLE_INTERVAL: 30 * 60 * 1000, // 30 minutes
            MEMORY_LIMIT: 512 * 1024 * 1024 // 512MB per worker
        },
        
        // Memory management
        MEMORY: {
            LIMIT: 0.8, // 80% of available memory
            CLEANUP_THRESHOLD: 0.7, // Cleanup at 70% usage
            WIPE_CYCLES: 3, // Number of overwrite cycles
            WIPE_PATTERN: [0x00, 0xFF, 0xAA, 0x55] // Wipe pattern
        },
        
        // Cache settings
        CACHE: {
            ENABLED: true,
            SIZE: 100 * 1024 * 1024, // 100MB
            MAX_ITEMS: 1000,
            CLEANUP_INTERVAL: 5 * 60 * 1000 // 5 minutes
        },
        
        // Streaming settings
        STREAMING: {
            ENABLED: true,
            BUFFER_SIZE: 1024 * 1024, // 1MB
            PARALLEL_STREAMS: 2,
            CHUNK_OVERLAP: 1024 // 1KB overlap for integrity
        },
        
        // Mobile optimizations
        MOBILE_OPTIMIZATIONS: {
            DISABLE_3D: true,
            REDUCE_ANIMATIONS: true,
            LIMIT_WORKERS: 2,
            SMALLER_CHUNKS: true,
            DISABLE_EFFECTS: true
        }
    },
    
    // UI Configuration
    UI: {
        // Animation settings
        ANIMATIONS: {
            ENABLED: true,
            DURATION: 300,
            EASING: 'cubic-bezier(0.4, 0, 0.2, 1)',
            REDUCE_MOTION: false
        },
        
        // Notification settings
        NOTIFICATIONS: {
            DURATION: 5000,
            MAX_VISIBLE: 5,
            POSITION: 'bottom-right',
            TYPES: ['success', 'error', 'warning', 'info', 'security']
        },
        
        // Tooltip settings
        TOOLTIPS: {
            DELAY: 300,
            DURATION: 3000,
            MAX_WIDTH: 300
        },
        
        // Progress indicators
        PROGRESS: {
            UPDATE_INTERVAL: 100,
            SMOOTHING: 0.3,
            SHOW_DETAILS: true,
            SHOW_ESTIMATE: true
        }
    },
    
    // Network Configuration
    NETWORK: {
        OFFLINE: {
            ENABLED: true,
            TIMEOUT: 5000,
            RETRY_ATTEMPTS: 3,
            RETRY_DELAY: 1000
        },
        
        // PWA settings
        PWA: {
            INSTALL_PROMPT: true,
            UPDATE_CHECK: true,
            UPDATE_INTERVAL: 24 * 60 * 60 * 1000, // 24 hours
            OFFLINE_FALLBACK: true
        }
    },
    
    // Compatibility Configuration
    COMPATIBILITY: {
        // Minimum browser versions
        MINIMUM_VERSIONS: {
            CHROME: 60,
            FIREFOX: 55,
            SAFARI: 11,
            EDGE: 79,
            OPERA: 47,
            IOS_SAFARI: 11,
            ANDROID_CHROME: 7
        },
        
        // Feature detection
        REQUIRED_FEATURES: [
            'crypto.subtle',
            'Uint8Array',
            'TextEncoder',
            'TextDecoder',
            'Promise'
        ],
        
        // Optional features (with fallbacks)
        OPTIONAL_FEATURES: [
            'ReadableStream',
            'WritableStream',
            'CompressionStream',
            'DecompressionStream',
            'WebAssembly'
        ],
        
        // Fallback URLs for polyfills
        FALLBACKS: {
            CRYPTO: 'https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.1.1/crypto-js.min.js',
            STREAMS: 'https://cdnjs.cloudflare.com/ajax/libs/web-streams-polyfill/3.2.1/ponyfill.min.js',
            COMPRESSION: 'https://cdnjs.cloudflare.com/ajax/libs/pako/2.0.4/pako.min.js',
            PROMISE: 'https://cdn.jsdelivr.net/npm/promise-polyfill@8.2.3/dist/polyfill.min.js'
        }
    },
    
    // File Format Configuration
    FILE_FORMATS: {
        // Supported input formats (all files)
        INPUT: {
            ALL: true,
            MAX_SIZE: 10 * 1024 * 1024 * 1024 // 10GB
        },
        
        // Output formats
        OUTPUT: {
            EXTENSION: '.cvault',
            VERSIONS: {
                '1.0': '.cvenc',
                '2.0': '.cvmil',
                '3.0': '.cv10g'
            },
            METADATA: {
                INCLUDED: true,
                ENCRYPTED: true,
                COMPRESSED: true,
                TIMESTAMP: true,
                SECURITY_LEVEL: true,
                HMAC: true
            }
        },
        
        // File type specific settings
        TYPES: {
            // Text files
            TEXT: ['.txt', '.md', '.html', '.htm', '.xml', '.json', '.css', '.js', '.ts'],
            
            // Document files
            DOCUMENTS: ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.odt'],
            
            // Image files
            IMAGES: ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff', '.svg', '.webp'],
            
            // Video files
            VIDEOS: ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.mkv', '.webm', '.m4v'],
            
            // Audio files
            AUDIO: ['.mp3', '.wav', '.ogg', '.flac', '.m4a', '.aac', '.wma'],
            
            // Archive files
            ARCHIVES: ['.zip', '.rar', '.7z', '.tar', '.gz', '.bz2'],
            
            // Executable files
            EXECUTABLES: ['.exe', '.msi', '.dmg', '.app', '.deb', '.rpm', '.apk']
        }
    },
    
    // Security Policies
    SECURITY_POLICIES: {
        // Password policies
        PASSWORD: {
            MIN_LENGTH: 12,
            REQUIRE_UPPERCASE: true,
            REQUIRE_LOWERCASE: true,
            REQUIRE_NUMBERS: true,
            REQUIRE_SYMBOLS: true,
            MAX_AGE_DAYS: 90,
            HISTORY_SIZE: 5,
            BLOCK_COMMON: true
        },
        
        // Session policies
        SESSION: {
            TIMEOUT: 15 * 60 * 1000, // 15 minutes
            MAX_SESSIONS: 5,
            CLEAR_ON_CLOSE: true,
            SECURE_COOKIES: true
        },
        
        // Encryption policies
        ENCRYPTION_POLICY: {
            MIN_ITERATIONS: 100000,
            MIN_KEY_SIZE: 256,
            REQUIRED_ALGORITHMS: ['AES-GCM'],
            FORCE_INTEGRITY_CHECK: true,
            FORCE_MEMORY_WIPE: true
        }
    }
};

// Export configuration
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ENHANCED_CONFIG;
}

// Make available globally
if (typeof window !== 'undefined') {
    window.ENHANCED_CONFIG = ENHANCED_CONFIG;
}
