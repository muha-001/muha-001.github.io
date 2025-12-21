/**
 * CipherVault 3D Pro - Main Application File
 * Version: 4.1.0
 * 
 * This file initializes and orchestrates all components of the CipherVault application.
 * It serves as the main entry point for the encryption/decryption system.
 */

// ============================================================================
// GLOBAL APPLICATION STATE
// ============================================================================

class CipherVaultApp {
    constructor() {
        // Application state
        this.state = {
            initialized: false,
            language: 'en',
            securityLevel: 'MEDIUM',
            darkMode: false,
            currentOperation: null,
            fileProcessing: false,
            activeWorkers: 0,
            sessionStart: Date.now(),
            
            // Encryption state
            encryption: {
                file: null,
                password: '',
                options: {},
                progress: 0,
                startTime: null
            },
            
            // Decryption state
            decryption: {
                file: null,
                password: '',
                progress: 0,
                startTime: null
            },
            
            // Statistics
            statistics: {
                filesEncrypted: 0,
                filesDecrypted: 0,
                totalDataProcessed: 0,
                totalTimeSpent: 0,
                averageSpeed: 0
            },
            
            // Security state
            security: {
                https: window.isSecureContext,
                cryptoAvailable: false,
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
            threejs: null,
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
     * Initialize the application
     */
    async init() {
        console.log('Starting CipherVault initialization...');
        
        try {
            // Step 1: Check system requirements
            await this.checkRequirements();
            
            // Step 2: Initialize subsystems
            await this.initSubsystems();
            
            // Step 3: Setup UI
            await this.setupUI();
            
            // Step 4: Setup event listeners
            await this.setupEventListeners();
            
            // Step 5: Load saved state
            await this.loadSavedState();
            
            // Step 6: Finalize initialization
            await this.finalizeInit();
            
            console.log('CipherVault initialization complete');
            return true;
            
        } catch (error) {
            console.error('Initialization failed:', error);
            this.showFatalError('Failed to initialize application. Please refresh the page.');
            return false;
        }
    }
    
    /**
     * Check system requirements
     */
    async checkRequirements() {
        console.log('Checking system requirements...');
        
        const requirements = {
            // Web Crypto API
            crypto: () => {
                const available = window.crypto && window.crypto.subtle;
                if (!available) {
                    throw new Error('Web Crypto API is not available. This browser may not support encryption.');
                }
                this.state.security.cryptoAvailable = true;
                return available;
            },
            
            // HTTPS/secure context
            https: () => {
                const secure = window.isSecureContext;
                if (!secure) {
                    console.warn('Not running in secure context. Some features may be limited.');
                }
                this.state.security.https = secure;
                return true; // Not fatal, just warning
            },
            
            // Modern browser features
            modernBrowser: () => {
                const required = [
                    'Promise',
                    'async',
                    'await',
                    'Uint8Array',
                    'TextEncoder',
                    'TextDecoder'
                ];
                
                for (const feature of required) {
                    if (!window[feature]) {
                        throw new Error(`Required feature ${feature} is not available. Please use a modern browser.`);
                    }
                }
                return true;
            },
            
            // File API
            fileApi: () => {
                const required = ['File', 'FileReader', 'Blob'];
                for (const feature of required) {
                    if (!window[feature]) {
                        throw new Error(`File API feature ${feature} is not available.`);
                    }
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
                if (name === 'crypto' || name === 'modernBrowser') {
                    throw error; // Fatal errors
                }
            }
        }
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
        
        // Initialize Three.js Scene
        if (typeof initThreeJS === 'function') {
            try {
                initThreeJS();
                this.components.threejs = {
                    scene: window.scene,
                    camera: window.camera,
                    renderer: window.renderer
                };
                console.log('✓ Three.js scene initialized');
            } catch (error) {
                console.warn('Three.js initialization failed:', error);
            }
        }
        
        // Initialize PWA Manager
        if (window.PWAManager) {
            this.components.pwa = window.PWAManager;
            await this.components.pwa.init();
            console.log('✓ PWA manager initialized');
        }
        
        // Initialize Audit System
        if (window.SecurityAudit) {
            this.components.audit = window.SecurityAudit;
            await this.components.audit.init();
            console.log('✓ Security audit system initialized');
        }
        
        // Initialize Web Workers
        if (window.CryptoWorkerManager) {
            this.components.workers = new window.CryptoWorkerManager();
            this.state.security.workersAvailable = true;
            console.log('✓ Web Workers manager initialized');
        }
    }
    
    /**
     * Setup UI elements and references
     */
    async setupUI() {
        console.log('Setting up UI...');
        
        // Collect UI element references
        this.ui.elements = {
            // Language selector
            languageSelector: document.querySelector('.language-selector-3d'),
            langOptions: document.querySelectorAll('.lang-option'),
            
            // Encryption card
            encryptCard: document.querySelector('.encrypt-card'),
            encryptUpload: document.getElementById('encryptUpload'),
            fileInputEncrypt: document.getElementById('fileInputEncrypt'),
            encryptFileInfo: document.getElementById('encryptFileInfo'),
            encryptFileName: document.getElementById('encryptFileName'),
            encryptFileSize: document.getElementById('encryptFileSize'),
            passwordEncrypt: document.getElementById('passwordEncrypt'),
            passwordStrengthEncrypt: document.getElementById('passwordStrengthEncrypt'),
            passwordConfirm: document.getElementById('passwordConfirm'),
            passwordMatchIndicator: document.getElementById('passwordMatchIndicator'),
            compressOption: document.getElementById('compressOption'),
            splitOption: document.getElementById('splitOption'),
            encryptBtn: document.getElementById('encryptBtn'),
            encryptProgress: document.getElementById('encryptProgress'),
            encryptProgressPercent: document.getElementById('encryptProgressPercent'),
            encryptProgressStatus: document.getElementById('encryptProgressStatus'),
            
            // Decryption card
            decryptCard: document.querySelector('.decrypt-card'),
            decryptUpload: document.getElementById('decryptUpload'),
            fileInputDecrypt: document.getElementById('fileInputDecrypt'),
            decryptFileInfo: document.getElementById('decryptFileInfo'),
            decryptFileName: document.getElementById('decryptFileName'),
            decryptFileSize: document.getElementById('decryptFileSize'),
            passwordDecrypt: document.getElementById('passwordDecrypt'),
            decryptBtn: document.getElementById('decryptBtn'),
            decryptProgress: document.getElementById('decryptProgress'),
            decryptProgressPercent: document.getElementById('decryptProgressPercent'),
            decryptProgressStatus: document.getElementById('decryptProgressStatus'),
            
            // Advanced settings
            advancedSettingsPanel: document.getElementById('advancedSettingsPanel'),
            toggleAdvanced: document.getElementById('toggleAdvanced'),
            closeAdvancedSettings: document.getElementById('closeAdvancedSettings'),
            
            // Security settings
            securityLevelOptions: document.querySelectorAll('input[name="securityLevel"]'),
            useWorkers: document.getElementById('useWorkers'),
            enableCompression: document.getElementById('enableCompression'),
            enableWipe: document.getElementById('enableWipe'),
            autoClear: document.getElementById('autoClear'),
            
            // Status messages
            statusContainer: document.getElementById('status-container'),
            successStatus: document.getElementById('success-status'),
            errorStatus: document.getElementById('error-status'),
            warningStatus: document.getElementById('warning-status'),
            infoStatus: document.getElementById('info-status'),
            successText: document.getElementById('success-text'),
            errorText: document.getElementById('error-text'),
            warningText: document.getElementById('warning-text'),
            infoText: document.getElementById('info-text'),
            
            // Statistics
            filesProcessed: document.getElementById('filesProcessed'),
            dataEncrypted: document.getElementById('dataEncrypted'),
            encryptionSpeed: document.getElementById('encryptionSpeed'),
            securityLevelValue: document.getElementById('securityLevelValue'),
            
            // Security indicators
            securityHttps: document.getElementById('securityHttps'),
            securityCrypto: document.getElementById('securityCrypto'),
            securityWorkers: document.getElementById('securityWorkers'),
            securityStorage: document.getElementById('securityStorage'),
            
            // Recovery system
            recoveryPanel: document.getElementById('recoveryPanel'),
            closeRecovery: document.getElementById('closeRecovery'),
            
            // PWA
            pwaInstallPrompt: document.getElementById('pwaInstallPrompt'),
            installPWA: document.getElementById('installPWA'),
            dismissPWA: document.getElementById('dismissPWA'),
            
            // Dark mode
            toggleDarkMode: document.getElementById('toggleDarkMode'),
            
            // Footer
            connectionStatus: document.getElementById('connectionStatus'),
            connectionIcon: document.getElementById('connectionIcon'),
            auditStatus: document.getElementById('auditStatus')
        };
        
        // Initialize Vanilla Tilt for 3D cards
        if (typeof VanillaTilt !== 'undefined') {
            VanillaTilt.init(document.querySelectorAll('.card-3d'), {
                max: 15,
                speed: 400,
                glare: true,
                "max-glare": 0.2,
                scale: 1.02
            });
            console.log('✓ 3D card effects initialized');
        }
        
        // Setup password strength indicators
        this.setupPasswordStrength();
        
        // Setup drag and drop
        this.setupDragAndDrop();
        
        // Update UI state
        this.updateUIState();
        
        console.log('✓ UI setup complete');
    }
    
    /**
     * Setup event listeners
     */
    async setupEventListeners() {
        console.log('Setting up event listeners...');
        
        // Language selection
        this.ui.elements.langOptions.forEach(option => {
            this.addListener(option, 'click', () => {
                const lang = option.dataset.lang;
                this.setLanguage(lang);
            });
        });
        
        // File upload triggers
        this.addListener(this.ui.elements.encryptUpload, 'click', () => {
            this.ui.elements.fileInputEncrypt.click();
        });
        
        this.addListener(this.ui.elements.decryptUpload, 'click', () => {
            this.ui.elements.fileInputDecrypt.click();
        });
        
        // File input changes
        this.addListener(this.ui.elements.fileInputEncrypt, 'change', (e) => {
            this.handleFileSelect('encrypt', e.target.files[0]);
        });
        
        this.addListener(this.ui.elements.fileInputDecrypt, 'change', (e) => {
            this.handleFileSelect('decrypt', e.target.files[0]);
        });
        
        // Password strength checking
        this.addListener(this.ui.elements.passwordEncrypt, 'input', (e) => {
            this.checkPasswordStrength(e.target.value);
        });
        
        // Password confirmation
        this.addListener(this.ui.elements.passwordConfirm, 'input', (e) => {
            this.checkPasswordMatch();
        });
        
        // Encryption/Decryption buttons
        this.addListener(this.ui.elements.encryptBtn, 'click', () => {
            this.handleEncrypt();
        });
        
        this.addListener(this.ui.elements.decryptBtn, 'click', () => {
            this.handleDecrypt();
        });
        
        // Advanced settings
        this.addListener(this.ui.elements.toggleAdvanced, 'click', () => {
            this.toggleAdvancedSettings();
        });
        
        this.addListener(this.ui.elements.closeAdvancedSettings, 'click', () => {
            this.toggleAdvancedSettings(false);
        });
        
        // Security level selection
        this.ui.elements.securityLevelOptions.forEach(option => {
            this.addListener(option, 'change', (e) => {
                if (e.target.checked) {
                    this.setSecurityLevel(e.target.value);
                }
            });
        });
        
        // PWA installation
        if (this.ui.elements.installPWA) {
            this.addListener(this.ui.elements.installPWA, 'click', () => {
                this.installPWA();
            });
            
            this.addListener(this.ui.elements.dismissPWA, 'click', () => {
                this.hidePWAInstallPrompt();
            });
        }
        
        // Dark mode toggle
        if (this.ui.elements.toggleDarkMode) {
            this.addListener(this.ui.elements.toggleDarkMode, 'click', () => {
                this.toggleDarkMode();
            });
        }
        
        // Recovery system
        if (this.ui.elements.closeRecovery) {
            this.addListener(this.ui.elements.closeRecovery, 'click', () => {
                this.hideRecoveryPanel();
            });
        }
        
        // Window events
        this.addListener(window, 'beforeunload', (e) => {
            if (this.state.fileProcessing) {
                e.preventDefault();
                e.returnValue = 'File processing in progress. Are you sure you want to leave?';
                return e.returnValue;
            }
        });
        
        this.addListener(window, 'online', () => {
            this.updateConnectionStatus(true);
        });
        
        this.addListener(window, 'offline', () => {
            this.updateConnectionStatus(false);
        });
        
        // Keyboard shortcuts
        this.addListener(document, 'keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });
        
        console.log('✓ Event listeners setup complete');
    }
    
    /**
     * Load saved application state
     */
    async loadSavedState() {
        try {
            // Load language preference
            const savedLang = localStorage.getItem('ciphervault_language');
            if (savedLang && this.components.translation) {
                this.state.language = savedLang;
                this.components.translation.setLanguage(savedLang);
            }
            
            // Load security level
            const savedSecurityLevel = localStorage.getItem('ciphervault_security_level');
            if (savedSecurityLevel) {
                this.state.securityLevel = savedSecurityLevel;
                this.setSecurityLevel(savedSecurityLevel, true);
            }
            
            // Load dark mode preference
            const savedDarkMode = localStorage.getItem('ciphervault_dark_mode');
            if (savedDarkMode !== null) {
                this.state.darkMode = savedDarkMode === 'true';
                this.applyDarkMode(this.state.darkMode);
            }
            
            // Load statistics
            const savedStats = localStorage.getItem('ciphervault_statistics');
            if (savedStats) {
                this.state.statistics = JSON.parse(savedStats);
                this.updateStatisticsDisplay();
            }
            
            console.log('✓ Saved state loaded');
        } catch (error) {
            console.warn('Failed to load saved state:', error);
        }
    }
    
    /**
     * Finalize initialization
     */
    async finalizeInit() {
        // Update security indicators
        this.updateSecurityIndicators();
        
        // Update connection status
        this.updateConnectionStatus(navigator.onLine);
        
        // Check for PWA installation
        if (this.components.pwa) {
            setTimeout(() => {
                this.components.pwa.showInstallPromptIfNeeded();
            }, 3000);
        }
        
        // Log successful initialization
        if (this.components.audit) {
            await this.components.audit.logEvent('APPLICATION_INITIALIZED', 'INFO', {
                version: '4.1.0',
                securityLevel: this.state.securityLevel,
                language: this.state.language
            });
        }
        
        // Set initialization flag
        this.state.initialized = true;
        
        // Show welcome message
        setTimeout(() => {
            this.showStatus('info', 'welcome_message', 'CipherVault 3D Pro is ready. Select a file to begin.');
        }, 1000);
    }
    
    // ============================================================================
    // LANGUAGE & LOCALIZATION
    // ============================================================================
    
    /**
     * Set application language
     */
    setLanguage(lang) {
        if (!this.components.translation) return;
        
        try {
            this.components.translation.setLanguage(lang);
            this.state.language = lang;
            
            // Update UI elements that depend on language
            this.updateUIState();
            
            // Save preference
            localStorage.setItem('ciphervault_language', lang);
            
            // Log event
            if (this.components.audit) {
                this.components.audit.logEvent('LANGUAGE_CHANGED', 'INFO', { language: lang });
            }
            
            console.log(`Language changed to: ${lang}`);
        } catch (error) {
            console.error('Failed to set language:', error);
            this.showStatus('error', 'language_change_failed', 'Failed to change language');
        }
    }
    
    // ============================================================================
    // SECURITY MANAGEMENT
    // ============================================================================
    
    /**
     * Set security level
     */
    setSecurityLevel(level, silent = false) {
        const validLevels = ['BASIC', 'MEDIUM', 'HIGH', 'MILITARY'];
        if (!validLevels.includes(level)) {
            console.warn(`Invalid security level: ${level}`);
            return;
        }
        
        this.state.securityLevel = level;
        
        // Update UI
        this.ui.elements.securityLevelValue.textContent = level;
        this.ui.elements.securityLevelValue.className = `security-value level-${level.toLowerCase()}`;
        
        // Update radio button
        this.ui.elements.securityLevelOptions.forEach(option => {
            option.checked = option.value === level;
        });
        
        // Save preference
        localStorage.setItem('ciphervault_security_level', level);
        
        if (!silent) {
            this.showStatus('info', 'security_level_changed', `Security level set to ${level}`);
            
            // Log event
            if (this.components.audit) {
                this.components.audit.logEvent('SECURITY_LEVEL_CHANGED', 'INFO', { level });
            }
        }
    }
    
    /**
     * Update security indicators
     */
    updateSecurityIndicators() {
        const indicators = [
            { id: 'securityHttps', active: this.state.security.https, icon: 'fa-lock' },
            { id: 'securityCrypto', active: this.state.security.cryptoAvailable, icon: 'fa-microchip' },
            { id: 'securityWorkers', active: this.state.security.workersAvailable, icon: 'fa-cogs' },
            { id: 'securityStorage', active: 'localStorage' in window, icon: 'fa-database' }
        ];
        
        indicators.forEach(indicator => {
            const element = document.getElementById(indicator.id);
            if (element) {
                if (indicator.active) {
                    element.classList.add('active');
                    element.classList.remove('inactive');
                    element.innerHTML = `<i class="fas ${indicator.icon}"></i>`;
                } else {
                    element.classList.add('inactive');
                    element.classList.remove('active');
                    element.innerHTML = `<i class="fas ${indicator.icon}"></i>`;
                }
            }
        });
    }
    
    /**
     * Setup password strength checking
     */
    setupPasswordStrength() {
        const passwordInput = this.ui.elements.passwordEncrypt;
        if (!passwordInput) return;
        
        passwordInput.addEventListener('input', (e) => {
            this.checkPasswordStrength(e.target.value);
        });
    }
    
    /**
     * Check password strength
     */
    checkPasswordStrength(password) {
        if (!password) {
            this.updatePasswordStrengthUI('weak', 0);
            return 'weak';
        }
        
        let score = 0;
        const requirements = {
            length: password.length >= 12,
            lowercase: /[a-z]/.test(password),
            uppercase: /[A-Z]/.test(password),
            numbers: /\d/.test(password),
            symbols: /[^A-Za-z0-9]/.test(password),
            noSpaces: !/\s/.test(password),
            noRepeats: !/(.)\1\1/.test(password)
        };
        
        // Calculate score
        Object.values(requirements).forEach(met => {
            if (met) score++;
        });
        
        // Additional points for length
        if (password.length >= 16) score++;
        if (password.length >= 20) score++;
        
        // Determine strength level
        let strength;
        if (score >= 6) {
            strength = 'very-strong';
        } else if (score >= 5) {
            strength = 'strong';
        } else if (score >= 4) {
            strength = 'medium';
        } else {
            strength = 'weak';
        }
        
        // Update UI
        this.updatePasswordStrengthUI(strength, score);
        
        return strength;
    }
    
    /**
     * Update password strength UI
     */
    updatePasswordStrengthUI(strength, score) {
        const strengthBar = this.ui.elements.passwordStrengthEncrypt?.querySelector('.strength-bar');
        const strengthText = this.ui.elements.passwordStrengthEncrypt?.querySelector('.strength-text');
        
        if (!strengthBar || !strengthText) return;
        
        // Update visual bar
        strengthBar.className = 'strength-bar';
        strengthBar.classList.add(strength);
        
        // Update text
        const translations = {
            'weak': this.t('password-weak'),
            'medium': this.t('password-medium'),
            'strong': this.t('password-strong'),
            'very-strong': this.t('password-very-strong')
        };
        
        strengthText.textContent = translations[strength] || this.t('password-weak');
        
        // Update requirement hints
        this.updatePasswordHints();
    }
    
    /**
     * Update password requirement hints
     */
    updatePasswordHints() {
        const hints = document.querySelectorAll('.password-hints .hint');
        const password = this.ui.elements.passwordEncrypt?.value || '';
        
        hints.forEach(hint => {
            const type = hint.id.replace('hint', '').toLowerCase();
            let isValid = false;
            
            switch (type) {
                case 'length':
                    isValid = password.length >= 12;
                    break;
                case 'upper':
                    isValid = /[A-Z]/.test(password);
                    break;
                case 'lower':
                    isValid = /[a-z]/.test(password);
                    break;
                case 'numbers':
                    isValid = /\d/.test(password);
                    break;
                case 'symbols':
                    isValid = /[^A-Za-z0-9]/.test(password);
                    break;
            }
            
            if (isValid) {
                hint.classList.add('valid');
            } else {
                hint.classList.remove('valid');
            }
        });
    }
    
    /**
     * Check if passwords match
     */
    checkPasswordMatch() {
        const password = this.ui.elements.passwordEncrypt?.value || '';
        const confirm = this.ui.elements.passwordConfirm?.value || '';
        const indicator = this.ui.elements.passwordMatchIndicator;
        
        if (!indicator) return;
        
        if (password && confirm) {
            if (password === confirm) {
                indicator.classList.add('show');
                indicator.querySelector('span').textContent = this.t('passwords-match');
                indicator.style.display = 'flex';
            } else {
                indicator.classList.remove('show');
                indicator.style.display = 'none';
            }
        } else {
            indicator.style.display = 'none';
        }
    }
    
    // ============================================================================
    // FILE HANDLING
    // ============================================================================
    
    /**
     * Handle file selection
     */
    async handleFileSelect(type, file) {
        if (!file) return;
        
        try {
            // Validate file
            if (!this.validateFile(file, type)) {
                return;
            }
            
            // Update state
            if (type === 'encrypt') {
                this.state.encryption.file = file;
                this.updateFileInfo('encrypt', file);
            } else {
                this.state.decryption.file = file;
                this.updateFileInfo('decrypt', file);
            }
            
            // Show file info
            this.showFileInfo(type);
            
            // Log event
            if (this.components.audit) {
                this.components.audit.logEvent('FILE_SELECTED', 'INFO', {
                    type,
                    fileName: file.name,
                    fileSize: file.size,
                    fileType: file.type
                });
            }
            
        } catch (error) {
            console.error('File selection error:', error);
            this.showStatus('error', 'file_selection_error', 'Failed to process selected file');
        }
    }
    
    /**
     * Validate file
     */
    validateFile(file, type) {
        // Check file size
        const maxSize = 5 * 1024 * 1024 * 1024; // 5GB
        if (file.size > maxSize) {
            this.showStatus('error', 'file_too_large', 'File size exceeds 5GB limit');
            return false;
        }
        
        // Check for empty file
        if (file.size === 0) {
            this.showStatus('error', 'file_empty', 'File is empty');
            return false;
        }
        
        // Additional validation for decryption
        if (type === 'decrypt') {
            const validExtensions = ['.cvault', '.cvenc', '.cvmil', '.encrypted'];
            const fileName = file.name.toLowerCase();
            const hasValidExtension = validExtensions.some(ext => fileName.endsWith(ext));
            
            if (!hasValidExtension) {
                this.showStatus('error', 'invalid_encrypted_file', 'File does not appear to be encrypted');
                return false;
            }
        }
        
        return true;
    }
    
    /**
     * Update file info display
     */
    updateFileInfo(type, file) {
        const elements = type === 'encrypt' ? {
            name: this.ui.elements.encryptFileName,
            size: this.ui.elements.encryptFileSize,
            info: this.ui.elements.encryptFileInfo
        } : {
            name: this.ui.elements.decryptFileName,
            size: this.ui.elements.decryptFileSize,
            info: this.ui.elements.decryptFileInfo
        };
        
        if (elements.name) {
            elements.name.textContent = file.name;
        }
        
        if (elements.size) {
            elements.size.textContent = this.formatFileSize(file.size);
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
            this.ui.elements.fileInputEncrypt.value = '';
            this.ui.elements.encryptFileInfo.style.display = 'none';
            this.ui.elements.encryptCard?.classList.remove('file-selected');
        } else {
            this.state.decryption.file = null;
            this.ui.elements.fileInputDecrypt.value = '';
            this.ui.elements.decryptFileInfo.style.display = 'none';
            this.ui.elements.decryptCard?.classList.remove('file-selected');
        }
        
        this.showStatus('info', 'file_cleared', 'File selection cleared');
    }
    
    /**
     * Setup drag and drop
     */
    setupDragAndDrop() {
        const setupArea = (area, type) => {
            if (!area) return;
            
            area.addEventListener('dragover', (e) => {
                e.preventDefault();
                area.classList.add('drag-over');
            });
            
            area.addEventListener('dragleave', () => {
                area.classList.remove('drag-over');
            });
            
            area.addEventListener('drop', (e) => {
                e.preventDefault();
                area.classList.remove('drag-over');
                
                const files = e.dataTransfer.files;
                if (files.length > 0) {
                    const fileInput = type === 'encrypt' ? 
                        this.ui.elements.fileInputEncrypt : 
                        this.ui.elements.fileInputDecrypt;
                    
                    fileInput.files = files;
                    fileInput.dispatchEvent(new Event('change'));
                }
            });
        };
        
        setupArea(this.ui.elements.encryptUpload, 'encrypt');
        setupArea(this.ui.elements.decryptUpload, 'decrypt');
    }
    
    // ============================================================================
    // ENCRYPTION/DECRYPTION
    // ============================================================================
    
    /**
     * Handle encryption
     */
    async handleEncrypt() {
        // Validation
        if (!this.state.encryption.file) {
            this.showStatus('error', 'no_file_selected', 'Please select a file first');
            return;
        }
        
        const password = this.ui.elements.passwordEncrypt.value;
        if (!password) {
            this.showStatus('error', 'no_password', 'Please enter a password');
            return;
        }
        
        const confirmPassword = this.ui.elements.passwordConfirm.value;
        if (password !== confirmPassword) {
            this.showStatus('error', 'passwords_dont_match', 'Passwords do not match');
            return;
        }
        
        const strength = this.checkPasswordStrength(password);
        if (strength === 'weak') {
            const confirmed = await this.showConfirmation(
                'Weak Password',
                'Your password is weak. It may be easily guessed. Continue anyway?',
                'Continue',
                'Cancel'
            );
            
            if (!confirmed) return;
        }
        
        // Start encryption
        try {
            this.state.fileProcessing = true;
            this.state.encryption.startTime = Date.now();
            this.state.encryption.password = password;
            
            // Disable UI
            this.setUIState('encrypt', 'processing');
            
            // Show progress
            this.showProgress('encrypt', 0);
            
            // Get options
            const options = {
                securityLevel: this.state.securityLevel,
                compress: this.ui.elements.compressOption?.checked || false,
                split: this.ui.elements.splitOption?.checked || false
            };
            
            // Log start
            if (this.components.audit) {
                await this.components.audit.logEvent('ENCRYPTION_STARTED', 'INFO', {
                    fileName: this.state.encryption.file.name,
                    fileSize: this.state.encryption.file.size,
                    securityLevel: options.securityLevel
                });
            }
            
            // Choose encryption method based on file size and security level
            let result;
            if (this.state.encryption.file.size > 100 * 1024 * 1024) {
                // Large file: use streaming
                result = await this.encryptLargeFile(this.state.encryption.file, password, options);
            } else if (options.securityLevel === 'MILITARY') {
                // Military grade encryption
                result = await this.components.militaryCrypto.militaryEncrypt(
                    this.state.encryption.file,
                    password,
                    options
                );
            } else {
                // Standard encryption
                result = await this.components.crypto.encryptFile(
                    this.state.encryption.file,
                    password,
                    options
                );
            }
            
            // Create download
            const filename = this.generateEncryptedFilename(this.state.encryption.file.name);
            this.downloadFile(filename, result.data);
            
            // Update statistics
            this.updateStatistics('encrypt', this.state.encryption.file.size, Date.now() - this.state.encryption.startTime);
            
            // Show success
            this.showStatus('success', 'encryption_success', 'File encrypted successfully');
            
            // Log success
            if (this.components.audit) {
                await this.components.audit.logEvent('ENCRYPTION_COMPLETED', 'INFO', {
                    fileName: this.state.encryption.file.name,
                    encryptedSize: result.data.length,
                    timeTaken: Date.now() - this.state.encryption.startTime
                });
            }
            
            // Reset form
            this.resetEncryptionForm();
            
        } catch (error) {
            console.error('Encryption failed:', error);
            this.showStatus('error', 'encryption_failed', error.message || 'Encryption failed');
            
            // Log error
            if (this.components.audit) {
                await this.components.audit.logEvent('ENCRYPTION_FAILED', 'ERROR', {
                    error: error.message,
                    fileName: this.state.encryption.file?.name
                });
            }
        } finally {
            // Re-enable UI
            this.setUIState('encrypt', 'ready');
            this.state.fileProcessing = false;
            this.hideProgress('encrypt');
        }
    }
    
    /**
     * Handle decryption
     */
    async handleDecrypt() {
        // Validation
        if (!this.state.decryption.file) {
            this.showStatus('error', 'no_file_selected', 'Please select a file first');
            return;
        }
        
        const password = this.ui.elements.passwordDecrypt.value;
        if (!password) {
            this.showStatus('error', 'no_password', 'Please enter the decryption password');
            return;
        }
        
        // Start decryption
        try {
            this.state.fileProcessing = true;
            this.state.decryption.startTime = Date.now();
            this.state.decryption.password = password;
            
            // Disable UI
            this.setUIState('decrypt', 'processing');
            
            // Show progress
            this.showProgress('decrypt', 0);
            
            // Log start
            if (this.components.audit) {
                await this.components.audit.logEvent('DECRYPTION_STARTED', 'INFO', {
                    fileName: this.state.decryption.file.name,
                    fileSize: this.state.decryption.file.size
                });
            }
            
            // Read file
            const arrayBuffer = await this.state.decryption.file.arrayBuffer();
            const encryptedData = new Uint8Array(arrayBuffer);
            
            // Try different decryption methods
            let result;
            try {
                // First try standard decryption
                result = await this.components.crypto.decryptFile(
                    encryptedData,
                    password,
                    (progress) => {
                        this.updateProgress('decrypt', progress);
                    }
                );
            } catch (error) {
                // If standard decryption fails, try military decryption
                console.log('Standard decryption failed, trying military decryption...');
                result = await this.components.militaryCrypto.militaryDecrypt(
                    encryptedData,
                    password,
                    (progress) => {
                        this.updateProgress('decrypt', progress);
                    }
                );
            }
            
            // Create download
            const filename = this.generateDecryptedFilename(this.state.decryption.file.name, result.metadata);
            this.downloadFile(filename, result.data);
            
            // Update statistics
            this.updateStatistics('decrypt', result.data.byteLength, Date.now() - this.state.decryption.startTime);
            
            // Show success
            this.showStatus('success', 'decryption_success', 'File decrypted successfully');
            
            // Log success
            if (this.components.audit) {
                await this.components.audit.logEvent('DECRYPTION_COMPLETED', 'INFO', {
                    fileName: this.state.decryption.file.name,
                    decryptedSize: result.data.byteLength,
                    timeTaken: Date.now() - this.state.decryption.startTime
                });
            }
            
            // Reset form
            this.resetDecryptionForm();
            
        } catch (error) {
            console.error('Decryption failed:', error);
            
            // Check for specific error types
            let errorMessage = 'Decryption failed';
            if (error.message.includes('password') || error.message.includes('Password')) {
                errorMessage = 'Incorrect password or corrupted file';
            } else if (error.message.includes('corrupt') || error.message.includes('invalid')) {
                errorMessage = 'File is corrupted or invalid';
            }
            
            this.showStatus('error', 'decryption_failed', errorMessage);
            
            // Log error
            if (this.components.audit) {
                await this.components.audit.logEvent('DECRYPTION_FAILED', 'ERROR', {
                    error: error.message,
                    fileName: this.state.decryption.file?.name
                });
            }
        } finally {
            // Re-enable UI
            this.setUIState('decrypt', 'ready');
            this.state.fileProcessing = false;
            this.hideProgress('decrypt');
        }
    }
    
    /**
     * Encrypt large file using streaming/chunks
     */
    async encryptLargeFile(file, password, options) {
        // For files larger than 100MB, use chunked encryption
        const CHUNK_SIZE = 10 * 1024 * 1024; // 10MB chunks
        const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
        const encryptedChunks = [];
        
        for (let i = 0; i < totalChunks; i++) {
            const start = i * CHUNK_SIZE;
            const end = Math.min(start + CHUNK_SIZE, file.size);
            const chunk = file.slice(start, end);
            
            // Encrypt chunk
            const chunkResult = await this.components.crypto.encryptFile(
                new File([chunk], file.name),
                password,
                options
            );
            
            encryptedChunks.push(chunkResult.data);
            
            // Update progress
            const progress = Math.round(((i + 1) / totalChunks) * 100);
            this.updateProgress('encrypt', progress);
        }
        
        // Combine all chunks
        const totalSize = encryptedChunks.reduce((sum, chunk) => sum + chunk.length, 0);
        const result = new Uint8Array(totalSize);
        
        let offset = 0;
        for (const chunk of encryptedChunks) {
            result.set(chunk, offset);
            offset += chunk.length;
        }
        
        return { data: result };
    }
    
    // ============================================================================
    // UI MANAGEMENT
    // ============================================================================
    
    /**
     * Update UI state
     */
    updateUIState() {
        // Update language-specific elements
        if (this.components.translation) {
            this.components.translation.updatePageTranslations();
        }
        
        // Update security level display
        this.ui.elements.securityLevelValue.textContent = this.state.securityLevel;
        
        // Update statistics
        this.updateStatisticsDisplay();
        
        // Update dark mode
        this.applyDarkMode(this.state.darkMode);
    }
    
    /**
     * Set UI state for operation
     */
    setUIState(operation, state) {
        const elements = operation === 'encrypt' ? {
            btn: this.ui.elements.encryptBtn,
            card: this.ui.elements.encryptCard,
            inputs: [
                this.ui.elements.fileInputEncrypt,
                this.ui.elements.passwordEncrypt,
                this.ui.elements.passwordConfirm
            ]
        } : {
            btn: this.ui.elements.decryptBtn,
            card: this.ui.elements.decryptCard,
            inputs: [
                this.ui.elements.fileInputDecrypt,
                this.ui.elements.passwordDecrypt
            ]
        };
        
        switch (state) {
            case 'processing':
                elements.btn.disabled = true;
                elements.btn.innerHTML = `
                    <div class="btn-content">
                        <i class="fas fa-spinner fa-spin"></i>
                        <span>${this.t('processing')}</span>
                    </div>
                `;
                
                if (elements.card) {
                    elements.card.classList.add('processing');
                    elements.card.classList.add('flipped');
                }
                
                elements.inputs.forEach(input => {
                    if (input) input.disabled = true;
                });
                break;
                
            case 'ready':
                elements.btn.disabled = false;
                elements.btn.innerHTML = `
                    <div class="btn-content">
                        <i class="fas ${operation === 'encrypt' ? 'fa-lock' : 'fa-unlock'}"></i>
                        <span>${this.t(`${operation}-btn`)}</span>
                    </div>
                    <div class="btn-glow"></div>
                `;
                
                if (elements.card) {
                    elements.card.classList.remove('processing');
                    elements.card.classList.remove('flipped');
                }
                
                elements.inputs.forEach(input => {
                    if (input) input.disabled = false;
                });
                break;
        }
    }
    
    /**
     * Show progress
     */
    showProgress(operation, percent) {
        const elements = operation === 'encrypt' ? {
            progress: this.ui.elements.encryptProgress,
            percent: this.ui.elements.encryptProgressPercent,
            status: this.ui.elements.encryptProgressStatus
        } : {
            progress: this.ui.elements.decryptProgress,
            percent: this.ui.elements.decryptProgressPercent,
            status: this.ui.elements.decryptProgressStatus
        };
        
        if (elements.progress) {
            elements.progress.style.display = 'block';
        }
        
        this.updateProgress(operation, percent);
    }
    
    /**
     * Update progress
     */
    updateProgress(operation, percent) {
        const elements = operation === 'encrypt' ? {
            percent: this.ui.elements.encryptProgressPercent,
            status: this.ui.elements.encryptProgressStatus,
            card: this.ui.elements.encryptCard
        } : {
            percent: this.ui.elements.decryptProgressPercent,
            status: this.ui.elements.decryptProgressStatus,
            card: this.ui.elements.decryptCard
        };
        
        // Update percentage
        if (elements.percent) {
            elements.percent.textContent = Math.round(percent);
            
            // Update circular progress bar
            const circle = elements.percent.closest('.progress-circle')?.querySelector('.progress-bar');
            if (circle) {
                const radius = 54;
                const circumference = 2 * Math.PI * radius;
                const offset = circumference - (percent / 100) * circumference;
                circle.style.strokeDashoffset = offset;
            }
        }
        
        // Update status text
        if (elements.status) {
            if (percent < 100) {
                elements.status.textContent = this.t('processing');
            } else {
                elements.status.textContent = this.t('complete');
            }
        }
        
        // Flip card if just starting
        if (percent === 0 && elements.card) {
            elements.card.classList.add('flipped');
        }
        
        // Unflip card when complete
        if (percent === 100 && elements.card) {
            setTimeout(() => {
                elements.card.classList.remove('flipped');
            }, 1000);
        }
    }
    
    /**
     * Hide progress
     */
    hideProgress(operation) {
        const progress = operation === 'encrypt' ? 
            this.ui.elements.encryptProgress : 
            this.ui.elements.decryptProgress;
        
        if (progress) {
            setTimeout(() => {
                progress.style.display = 'none';
                this.updateProgress(operation, 0);
            }, 1000);
        }
    }
    
    /**
     * Show status message
     */
    showStatus(type, key, message) {
        const types = {
            success: {
                element: this.ui.elements.successStatus,
                text: this.ui.elements.successText,
                icon: 'fa-check-circle'
            },
            error: {
                element: this.ui.elements.errorStatus,
                text: this.ui.elements.errorText,
                icon: 'fa-exclamation-circle'
            },
            warning: {
                element: this.ui.elements.warningStatus,
                text: this.ui.elements.warningText,
                icon: 'fa-exclamation-triangle'
            },
            info: {
                element: this.ui.elements.infoStatus,
                text: this.ui.elements.infoText,
                icon: 'fa-info-circle'
            }
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
        console.log(`${type.toUpperCase()}: ${translatedMessage}`);
    }
    
    /**
     * Toggle advanced settings
     */
    toggleAdvancedSettings(show) {
        const panel = this.ui.elements.advancedSettingsPanel;
        if (!panel) return;
        
        if (show === undefined) {
            show = !panel.classList.contains('active');
        }
        
        if (show) {
            panel.classList.add('active');
            document.body.style.overflow = 'hidden';
        } else {
            panel.classList.remove('active');
            document.body.style.overflow = '';
        }
    }
    
    /**
     * Toggle dark mode
     */
    toggleDarkMode() {
        this.state.darkMode = !this.state.darkMode;
        this.applyDarkMode(this.state.darkMode);
        localStorage.setItem('ciphervault_dark_mode', this.state.darkMode);
    }
    
    /**
     * Apply dark mode
     */
    applyDarkMode(enabled) {
        if (enabled) {
            document.body.classList.add('dark-mode');
            if (this.ui.elements.toggleDarkMode) {
                this.ui.elements.toggleDarkMode.innerHTML = '<i class="fas fa-sun"></i>';
            }
        } else {
            document.body.classList.remove('dark-mode');
            if (this.ui.elements.toggleDarkMode) {
                this.ui.elements.toggleDarkMode.innerHTML = '<i class="fas fa-moon"></i>';
            }
        }
    }
    
    /**
     * Update connection status
     */
    updateConnectionStatus(online) {
        if (!this.ui.elements.connectionStatus || !this.ui.elements.connectionIcon) return;
        
        if (online) {
            this.ui.elements.connectionStatus.textContent = this.t('connection-online');
            this.ui.elements.connectionIcon.className = 'fas fa-wifi';
            this.ui.elements.connectionIcon.style.color = 'var(--success)';
        } else {
            this.ui.elements.connectionStatus.textContent = this.t('connection-offline');
            this.ui.elements.connectionIcon.className = 'fas fa-wifi-slash';
            this.ui.elements.connectionIcon.style.color = 'var(--error)';
        }
    }
    
    // ============================================================================
    // STATISTICS
    // ============================================================================
    
    /**
     * Update statistics
     */
    updateStatistics(operation, fileSize, timeTaken) {
        if (operation === 'encrypt') {
            this.state.statistics.filesEncrypted++;
        } else {
            this.state.statistics.filesDecrypted++;
        }
        
        this.state.statistics.totalDataProcessed += fileSize;
        this.state.statistics.totalTimeSpent += timeTaken;
        
        if (timeTaken > 0) {
            const speed = fileSize / (timeTaken / 1000); // bytes per second
            this.state.statistics.averageSpeed = 
                (this.state.statistics.averageSpeed + speed) / 2;
        }
        
        // Save to localStorage
        this.saveStatistics();
        
        // Update display
        this.updateStatisticsDisplay();
    }
    
    /**
     * Update statistics display
     */
    updateStatisticsDisplay() {
        if (this.ui.elements.filesProcessed) {
            const totalFiles = this.state.statistics.filesEncrypted + this.state.statistics.filesDecrypted;
            this.ui.elements.filesProcessed.textContent = totalFiles;
        }
        
        if (this.ui.elements.dataEncrypted) {
            this.ui.elements.dataEncrypted.textContent = this.formatFileSize(this.state.statistics.totalDataProcessed);
        }
        
        if (this.ui.elements.encryptionSpeed) {
            const speedMBps = (this.state.statistics.averageSpeed / (1024 * 1024)).toFixed(2);
            this.ui.elements.encryptionSpeed.textContent = `${speedMBps} MB/s`;
        }
    }
    
    /**
     * Save statistics
     */
    saveStatistics() {
        try {
            localStorage.setItem('ciphervault_statistics', JSON.stringify(this.state.statistics));
        } catch (error) {
            console.warn('Failed to save statistics:', error);
        }
    }
    
    // ============================================================================
    // FILE DOWNLOAD
    // ============================================================================
    
    /**
     * Download file
     */
    downloadFile(filename, data) {
        try {
            const blob = new Blob([data], { type: 'application/octet-stream' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            
            a.href = url;
            a.download = filename;
            a.style.display = 'none';
            
            document.body.appendChild(a);
            a.click();
            
            // Cleanup
            setTimeout(() => {
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }, 100);
            
        } catch (error) {
            console.error('Download failed:', error);
            this.showStatus('error', 'download_failed', 'Failed to download file');
        }
    }
    
    /**
     * Generate encrypted filename
     */
    generateEncryptedFilename(originalName) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const randomId = Math.random().toString(36).substr(2, 8);
        const extension = this.getEncryptedFileExtension();
        
        // Remove original extension and add encrypted extension
        const baseName = originalName.replace(/\.[^/.]+$/, "");
        return `${baseName}_${timestamp}_${randomId}${extension}`;
    }
    
    /**
     * Generate decrypted filename
     */
    generateDecryptedFilename(encryptedName, metadata) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        
        if (metadata?.originalName) {
            // Use original name from metadata
            return `decrypted_${metadata.originalName}`;
        } else {
            // Fallback: remove encrypted extension and add decrypted prefix
            const baseName = encryptedName.replace(/\.(cvault|cvenc|cvmil|encrypted)$/i, "");
            return `decrypted_${baseName}_${timestamp}`;
        }
    }
    
    /**
     * Get encrypted file extension based on security level
     */
    getEncryptedFileExtension() {
        const extensions = {
            'BASIC': '.cvault',
            'MEDIUM': '.cvenc',
            'HIGH': '.cvsec',
            'MILITARY': '.cvmil'
        };
        
        return extensions[this.state.securityLevel] || '.cvault';
    }
    
    // ============================================================================
    // FORM MANAGEMENT
    // ============================================================================
    
    /**
     * Reset encryption form
     */
    resetEncryptionForm() {
        // Clear file selection
        this.clearFile('encrypt');
        
        // Clear passwords
        this.ui.elements.passwordEncrypt.value = '';
        this.ui.elements.passwordConfirm.value = '';
        this.ui.elements.passwordMatchIndicator.style.display = 'none';
        
        // Reset password strength
        this.updatePasswordStrengthUI('weak', 0);
        
        // Clear state
        this.state.encryption = {
            file: null,
            password: '',
            options: {},
            progress: 0,
            startTime: null
        };
    }
    
    /**
     * Reset decryption form
     */
    resetDecryptionForm() {
        // Clear file selection
        this.clearFile('decrypt');
        
        // Clear password
        this.ui.elements.passwordDecrypt.value = '';
        
        // Clear state
        this.state.decryption = {
            file: null,
            password: '',
            progress: 0,
            startTime: null
        };
    }
    
    // ============================================================================
    // PWA MANAGEMENT
    // ============================================================================
    
    /**
     * Install PWA
     */
    async installPWA() {
        if (!this.components.pwa) return;
        
        try {
            await this.components.pwa.install();
            this.hidePWAInstallPrompt();
        } catch (error) {
            console.error('PWA installation failed:', error);
            this.showStatus('error', 'pwa_install_failed', 'Failed to install app');
        }
    }
    
    /**
     * Hide PWA install prompt
     */
    hidePWAInstallPrompt() {
        if (this.ui.elements.pwaInstallPrompt) {
            this.ui.elements.pwaInstallPrompt.classList.remove('show');
        }
    }
    
    // ============================================================================
    // RECOVERY SYSTEM
    // ============================================================================
    
    /**
     * Show recovery panel
     */
    showRecoveryPanel() {
        if (this.ui.elements.recoveryPanel) {
            this.ui.elements.recoveryPanel.style.display = 'block';
        }
    }
    
    /**
     * Hide recovery panel
     */
    hideRecoveryPanel() {
        if (this.ui.elements.recoveryPanel) {
            this.ui.elements.recoveryPanel.style.display = 'none';
        }
    }
    
    // ============================================================================
    // KEYBOARD SHORTCUTS
    // ============================================================================
    
    /**
     * Handle keyboard shortcuts
     */
    handleKeyboardShortcuts(event) {
        // Don't trigger shortcuts if user is typing in an input
        if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
            return;
        }
        
        // Ctrl/Cmd + E: Encrypt
        if ((event.ctrlKey || event.metaKey) && event.key === 'e') {
            event.preventDefault();
            if (!this.ui.elements.encryptBtn.disabled) {
                this.ui.elements.encryptBtn.click();
            }
        }
        
        // Ctrl/Cmd + D: Decrypt
        if ((event.ctrlKey || event.metaKey) && event.key === 'd') {
            event.preventDefault();
            if (!this.ui.elements.decryptBtn.disabled) {
                this.ui.elements.decryptBtn.click();
            }
        }
        
        // Ctrl/Cmd + L: Toggle language
        if ((event.ctrlKey || event.metaKey) && event.key === 'l') {
            event.preventDefault();
            const currentLang = this.state.language;
            const newLang = currentLang === 'en' ? 'ar' : 'en';
            this.setLanguage(newLang);
        }
        
        // Ctrl/Cmd + ,: Open settings
        if ((event.ctrlKey || event.metaKey) && event.key === ',') {
            event.preventDefault();
            this.toggleAdvancedSettings(true);
        }
        
        // Escape: Close modals
        if (event.key === 'Escape') {
            this.toggleAdvancedSettings(false);
            this.hideRecoveryPanel();
        }
    }
    
    // ============================================================================
    // UTILITY METHODS
    // ============================================================================
    
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
     * Get translation
     */
    t(key, params) {
        if (this.components.translation) {
            return this.components.translation.t(key, params);
        }
        return key;
    }
    
    /**
     * Add event listener with cleanup tracking
     */
    addListener(element, event, handler) {
        if (!element) return;
        
        element.addEventListener(event, handler);
        
        // Track for cleanup
        if (!this.ui.listeners[event]) {
            this.ui.listeners[event] = [];
        }
        this.ui.listeners[event].push({ element, handler });
    }
    
    /**
     * Show confirmation dialog
     */
    async showConfirmation(title, message, confirmText, cancelText) {
        return new Promise((resolve) => {
            const modal = document.createElement('div');
            modal.className = 'confirmation-modal active';
            modal.innerHTML = `
                <div class="confirmation-content">
                    <div class="confirmation-header">
                        <h3>${title}</h3>
                        <button class="close-confirmation">&times;</button>
                    </div>
                    <div class="confirmation-body">
                        <p>${message}</p>
                    </div>
                    <div class="confirmation-footer">
                        <button class="btn-confirm">${confirmText}</button>
                        <button class="btn-cancel">${cancelText}</button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            const closeModal = (result) => {
                document.body.removeChild(modal);
                resolve(result);
            };
            
            modal.querySelector('.close-confirmation').addEventListener('click', () => closeModal(false));
            modal.querySelector('.btn-confirm').addEventListener('click', () => closeModal(true));
            modal.querySelector('.btn-cancel').addEventListener('click', () => closeModal(false));
            
            // Close on escape
            const handleEscape = (e) => {
                if (e.key === 'Escape') closeModal(false);
            };
            document.addEventListener('keydown', handleEscape);
            
            // Remove escape listener when modal closes
            setTimeout(() => {
                document.removeEventListener('keydown', handleEscape);
            }, 100);
        });
    }
    
    /**
     * Show fatal error
     */
    showFatalError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'fatal-error';
        errorDiv.innerHTML = `
            <div class="fatal-error-content">
                <i class="fas fa-exclamation-triangle"></i>
                <h2>Fatal Error</h2>
                <p>${message}</p>
                <button onclick="location.reload()">Reload Application</button>
            </div>
        `;
        
        document.body.innerHTML = '';
        document.body.appendChild(errorDiv);
        document.body.className = 'fatal-error-page';
    }
    
    /**
     * Cleanup resources
     */
    cleanup() {
        // Remove event listeners
        Object.entries(this.ui.listeners).forEach(([event, listeners]) => {
            listeners.forEach(({ element, handler }) => {
                element.removeEventListener(event, handler);
            });
        });
        
        // Terminate workers
        if (this.components.workers) {
            this.components.workers.terminateAll();
        }
        
        // Clear timeouts/intervals
        // (Add any cleanup for timers here)
        
        console.log('CipherVault cleanup completed');
    }
}

// ============================================================================
// GLOBAL INITIALIZATION
// ============================================================================

// Create global application instance
const App = new CipherVaultApp();

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        App.init().catch(error => {
            console.error('Failed to initialize app:', error);
        });
    });
} else {
    App.init().catch(error => {
        console.error('Failed to initialize app:', error);
    });
}

// Make app available globally
if (typeof window !== 'undefined') {
    window.CipherVaultApp = App;
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    App.cleanup();
});

// Export for ES modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CipherVaultApp, App };
}
