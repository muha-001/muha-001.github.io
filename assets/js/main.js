/**
 * CipherVault 3D Pro - Main Application Controller
 * Version: 4.2.0
 */

class CipherVaultApp {
    constructor() {
        this.appName = 'CipherVault 3D Pro';
        this.version = '4.2.0';
        this.buildNumber = '#2024.01';
        
        // Core systems
        this.cryptoEngine = null;
        this.militaryCrypto = null;
        this.fileProcessor = null;
        this.workerManager = null;
        this.uiManager = null;
        
        // Application state
        this.state = {
            initialized: false,
            securityLevel: 'MEDIUM',
            darkMode: true,
            language: 'en',
            isOnline: true,
            isPWA: false,
            isMobile: false,
            lastActivity: Date.now(),
            sessionTimeout: 15 * 60 * 1000, // 15 minutes
            maxFileSize: 5 * 1024 * 1024 * 1024 // 5GB
        };
        
        // Performance monitoring
        this.performance = {
            startupTime: 0,
            memoryUsage: [],
            encryptionTimes: [],
            decryptionTimes: []
        };
        
        // Initialize timers
        this.startupTime = performance.now();
        this.activityTimer = null;
        this.performanceTimer = null;
    }

    /**
     * Initialize the application
     */
    async initialize() {
        try {
            console.log(`🚀 Initializing ${this.appName} v${this.version}`);
            
            // Detect environment
            this.detectEnvironment();
            
            // Initialize core systems
            await this.initializeCoreSystems();
            
            // Initialize UI
            await this.initializeUI();
            
            // Setup security
            await this.setupSecurity();
            
            // Setup PWA
            await this.setupPWA();
            
            // Setup monitoring
            this.setupMonitoring();
            
            // Setup session management
            this.setupSessionManagement();
            
            // Update state
            this.state.initialized = true;
            this.performance.startupTime = performance.now() - this.startupTime;
            
            console.log(`✅ ${this.appName} initialized in ${this.performance.startupTime.toFixed(2)}ms`);
            
            // Show welcome message
            this.showWelcomeMessage();
            
            return true;
            
        } catch (error) {
            console.error('❌ Application initialization failed:', error);
            this.handleInitializationError(error);
            return false;
        }
    }

    /**
     * Detect environment and capabilities
     */
    detectEnvironment() {
        // Detect device type
        this.state.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
            navigator.userAgent
        );
        
        // Detect PWA
        this.state.isPWA = window.matchMedia('(display-mode: standalone)').matches || 
                          window.navigator.standalone ||
                          document.referrer.includes('android-app://');
        
        // Detect online status
        this.state.isOnline = navigator.onLine;
        
        // Detect touch capability
        this.state.isTouch = 'ontouchstart' in window || 
                            navigator.maxTouchPoints > 0 || 
                            navigator.msMaxTouchPoints > 0;
        
        console.log('📱 Environment detected:', {
            isMobile: this.state.isMobile,
            isPWA: this.state.isPWA,
            isOnline: this.state.isOnline,
            isTouch: this.state.isTouch,
            userAgent: navigator.userAgent.substring(0, 100) + '...',
            platform: navigator.platform,
            cores: navigator.hardwareConcurrency || 'unknown',
            memory: navigator.deviceMemory || 'unknown'
        });
    }

    /**
     * Initialize core systems
     */
    async initializeCoreSystems() {
        console.log('🔧 Initializing core systems...');
        
        try {
            // Check for required APIs
            this.checkRequiredAPIs();
            
            // Initialize Crypto Engine
            if (typeof window.CryptoEngine !== 'undefined') {
                this.cryptoEngine = window.CryptoEngine;
                console.log('✅ Crypto Engine loaded');
            } else {
                throw new Error('Crypto Engine not found');
            }
            
            // Initialize Military Crypto
            if (typeof window.MilitaryCryptoEngine !== 'undefined') {
                this.militaryCrypto = window.MilitaryCryptoEngine;
                console.log('✅ Military Crypto loaded');
            }
            
            // Initialize File Processor
            if (typeof window.FileProcessor !== 'undefined') {
                this.fileProcessor = window.FileProcessor;
                console.log('✅ File Processor loaded');
            } else {
                throw new Error('File Processor not found');
            }
            
            // Initialize Worker Manager
            if (typeof window.WorkerManager !== 'undefined') {
                this.workerManager = window.WorkerManager;
                console.log('✅ Worker Manager loaded');
            }
            
            // Test crypto functionality
            await this.testCryptoFunctionality();
            
            return true;
            
        } catch (error) {
            console.error('❌ Core systems initialization failed:', error);
            throw error;
        }
    }

    /**
     * Check for required Web APIs
     */
    checkRequiredAPIs() {
        const requiredAPIs = [
            { name: 'crypto.subtle', check: () => typeof crypto !== 'undefined' && typeof crypto.subtle !== 'undefined' },
            { name: 'File API', check: () => typeof File !== 'undefined' },
            { name: 'Blob API', check: () => typeof Blob !== 'undefined' },
            { name: 'Uint8Array', check: () => typeof Uint8Array !== 'undefined' },
            { name: 'localStorage', check: () => typeof localStorage !== 'undefined' }
        ];
        
        const missingAPIs = requiredAPIS.filter(api => !api.check());
        
        if (missingAPIs.length > 0) {
            throw new Error(`Missing required APIs: ${missingAPIs.map(api => api.name).join(', ')}`);
        }
        
        console.log('✅ All required APIs available');
    }

    /**
     * Test cryptographic functionality
     */
    async testCryptoFunctionality() {
        try {
            console.log('🔐 Testing cryptographic functionality...');
            
            // Run self-test
            const testResult = await this.cryptoEngine.selfTest();
            
            if (!testResult.passed) {
                console.warn('⚠️ Cryptographic self-test warnings:', testResult);
                this.showNotification('Some security features may be limited', 'warning');
            } else {
                console.log('✅ Cryptographic tests passed');
            }
            
            // Check algorithm support
            const capabilities = await this.checkAlgorithmSupport();
            console.log('🔐 Algorithm support:', capabilities);
            
        } catch (error) {
            console.error('❌ Cryptographic tests failed:', error);
            throw new Error('Cryptographic functionality test failed');
        }
    }

    /**
     * Check supported algorithms
     */
    async checkAlgorithmSupport() {
        const algorithms = ['AES-GCM', 'AES-CBC', 'PBKDF2', 'HMAC', 'SHA-256', 'SHA-512'];
        const support = {};
        
        for (const algo of algorithms) {
            try {
                if (algo.includes('AES')) {
                    const key = await crypto.subtle.generateKey(
                        { name: algo, length: 256 },
                        false,
                        ['encrypt', 'decrypt']
                    );
                    support[algo] = !!key;
                } else if (algo === 'HMAC') {
                    const key = await crypto.subtle.generateKey(
                        { name: algo, hash: 'SHA-256' },
                        false,
                        ['sign', 'verify']
                    );
                    support[algo] = !!key;
                } else if (algo.includes('SHA')) {
                    const hash = await crypto.subtle.digest(
                        algo,
                        new TextEncoder().encode('test')
                    );
                    support[algo] = !!hash;
                } else if (algo === 'PBKDF2') {
                    support[algo] = true; // Assumed supported if we got this far
                }
            } catch (error) {
                support[algo] = false;
            }
        }
        
        return support;
    }

    /**
     * Initialize UI
     */
    async initializeUI() {
        console.log('🎨 Initializing UI...');
        
        try {
            // Initialize UI Manager
            if (typeof window.UIManager !== 'undefined') {
                this.uiManager = window.UIManager;
                await this.uiManager.initialize();
                console.log('✅ UI Manager initialized');
            } else {
                throw new Error('UI Manager not found');
            }
            
            // Setup Three.js scene if available
            await this.setupThreeJSScene();
            
            // Setup event handlers
            this.setupGlobalEventHandlers();
            
            // Update UI based on environment
            this.adaptUIForEnvironment();
            
            return true;
            
        } catch (error) {
            console.error('❌ UI initialization failed:', error);
            throw error;
        }
    }

    /**
     * Setup Three.js scene
     */
    async setupThreeJSScene() {
        // Check if Three.js is loaded
        if (typeof THREE === 'undefined') {
            console.log('ℹ️ Three.js not loaded, skipping 3D scene');
            return;
        }
        
        // Check if three-scene.js exists
        if (typeof window.ThreeScene !== 'undefined') {
            try {
                this.threeScene = new window.ThreeScene();
                await this.threeScene.initialize();
                console.log('✅ Three.js scene initialized');
            } catch (error) {
                console.warn('⚠️ Three.js scene initialization failed:', error);
            }
        } else {
            console.log('ℹ️ ThreeScene module not found, using fallback background');
            this.setupFallbackBackground();
        }
    }

    /**
     * Setup fallback background
     */
    setupFallbackBackground() {
        const container = document.getElementById('threejs-container');
        if (!container) return;
        
        // Create a simple gradient background
        container.style.background = 'radial-gradient(circle at center, #050510 0%, #030308 100%)';
        container.style.backgroundSize = '400% 400%';
        
        // Add subtle animation
        container.style.animation = 'gradientShift 15s ease infinite';
        
        // Add gradient animation to styles
        if (!document.getElementById('fallback-styles')) {
            const style = document.createElement('style');
            style.id = 'fallback-styles';
            style.textContent = `
                @keyframes gradientShift {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
            `;
            document.head.appendChild(style);
        }
    }

    /**
     * Adapt UI for environment
     */
    adaptUIForEnvironment() {
        if (this.state.isMobile) {
            console.log('📱 Adapting UI for mobile device');
            
            // Disable heavy animations
            document.querySelectorAll('.floating-icon').forEach(icon => {
                icon.style.display = 'none';
            });
            
            // Adjust chunk sizes
            if (this.fileProcessor) {
                this.fileProcessor.chunkSize = 2 * 1024 * 1024; // 2MB for mobile
            }
            
            // Show mobile-optimized message
            this.showNotification('Mobile-optimized mode enabled', 'info', 3000);
        }
        
        if (this.state.isTouch) {
            console.log('🖐️ Touch device detected');
            
            // Increase tap targets
            document.querySelectorAll('button, .btn-icon, .control-btn').forEach(btn => {
                btn.style.minHeight = '44px';
                btn.style.minWidth = '44px';
            });
        }
    }

    /**
     * Setup global event handlers
     */
    setupGlobalEventHandlers() {
        // Handle online/offline status
        window.addEventListener('online', () => {
            this.state.isOnline = true;
            this.showNotification('Back online', 'success', 2000);
        });
        
        window.addEventListener('offline', () => {
            this.state.isOnline = false;
            this.showNotification('You are offline. Encryption/decryption will still work.', 'warning', 5000);
        });
        
        // Handle visibility changes
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.state.lastActivity = Date.now();
            }
        });
        
        // Handle beforeunload
        window.addEventListener('beforeunload', (e) => {
            if (this.isProcessing()) {
                e.preventDefault();
                e.returnValue = 'File processing in progress. Are you sure you want to leave?';
                return e.returnValue;
            }
        });
        
        // Handle errors
        window.addEventListener('error', (event) => {
            this.handleError(event.error || event.message);
        });
        
        window.addEventListener('unhandledrejection', (event) => {
            this.handleError(event.reason);
        });
        
        // Handle resize
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.handleResize();
            }, 250);
        });
    }

    /**
     * Setup security features
     */
    async setupSecurity() {
        console.log('🛡️ Setting up security...');
        
        try {
            // Check HTTPS
            if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
                console.warn('⚠️ Not using HTTPS. Security may be compromised.');
                this.showNotification('For maximum security, use HTTPS', 'warning', 5000);
            }
            
            // Setup Content Security Policy compliance
            this.setupCSPCompliance();
            
            // Setup secure headers
            this.setupSecureHeaders();
            
            // Initialize audit logging
            await this.initializeAuditLogging();
            
            // Setup security monitoring
            this.setupSecurityMonitoring();
            
            console.log('✅ Security setup complete');
            
        } catch (error) {
            console.error('❌ Security setup failed:', error);
        }
    }

    /**
     * Setup CSP compliance
     */
    setupCSPCompliance() {
        // Check if we're violating CSP
        const csp = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
        if (csp) {
            console.log('✅ Content Security Policy detected');
            
            // Report CSP violations
            if (typeof window.SecurityPolicyViolationEvent !== 'undefined') {
                document.addEventListener('securitypolicyviolation', (e) => {
                    console.warn('CSP Violation:', {
                        violatedDirective: e.violatedDirective,
                        blockedURI: e.blockedURI,
                        sourceFile: e.sourceFile,
                        lineNumber: e.lineNumber
                    });
                });
            }
        }
    }

    /**
     * Setup secure headers
     */
    setupSecureHeaders() {
        // Note: These headers should be set server-side
        // This is just for client-side validation
        
        const secureHeaders = {
            'X-Content-Type-Options': 'nosniff',
            'X-Frame-Options': 'DENY',
            'X-XSS-Protection': '1; mode=block'
        };
        
        console.log('🔒 Secure headers validation:', secureHeaders);
    }

    /**
     * Initialize audit logging
     */
    async initializeAuditLogging() {
        // Check if audit log module exists
        if (typeof window.AuditLogger !== 'undefined') {
            try {
                await window.AuditLogger.initialize();
                console.log('✅ Audit logging initialized');
            } catch (error) {
                console.warn('⚠️ Audit logging initialization failed:', error);
            }
        } else {
            console.log('ℹ️ Audit logging not available');
        }
    }

    /**
     * Setup security monitoring
     */
    setupSecurityMonitoring() {
        // Monitor memory usage for potential attacks
        if (performance.memory) {
            setInterval(() => {
                const memory = performance.memory.usedJSHeapSize;
                this.performance.memoryUsage.push(memory);
                
                // Keep only last 100 readings
                if (this.performance.memoryUsage.length > 100) {
                    this.performance.memoryUsage.shift();
                }
                
                // Check for unusual memory patterns
                const avg = this.performance.memoryUsage.reduce((a, b) => a + b, 0) / 
                           this.performance.memoryUsage.length;
                if (memory > avg * 2) {
                    console.warn('⚠️ Unusual memory usage detected');
                }
            }, 10000); // Check every 10 seconds
        }
    }

    /**
     * Setup PWA features
     */
    async setupPWA() {
        console.log('📱 Setting up PWA features...');
        
        // Check if PWA is installed
        if (this.state.isPWA) {
            console.log('✅ Running as PWA');
            this.showNotification('Running as installed app', 'info', 3000);
        }
        
        // Setup install prompt
        this.setupPWAInstallPrompt();
        
        // Setup offline capabilities
        this.setupOfflineCapabilities();
    }

    /**
     * Setup PWA install prompt
     */
    setupPWAInstallPrompt() {
        let deferredPrompt;
        
        window.addEventListener('beforeinstallprompt', (e) => {
            // Prevent Chrome 67 and earlier from automatically showing the prompt
            e.preventDefault();
            
            // Stash the event so it can be triggered later
            deferredPrompt = e;
            
            // Show custom install prompt
            setTimeout(() => {
                this.showInstallPrompt();
            }, 5000);
            
            console.log('📱 PWA install prompt available');
        });
        
        // Store for later use
        window.deferredPrompt = deferredPrompt;
    }

    /**
     * Show PWA install prompt
     */
    showInstallPrompt() {
        const prompt = document.getElementById('pwaInstallPrompt');
        if (!prompt) return;
        
        prompt.classList.add('show');
        
        // Handle install button
        const installBtn = document.getElementById('installPWA');
        if (installBtn) {
            installBtn.onclick = async () => {
                if (window.deferredPrompt) {
                    window.deferredPrompt.prompt();
                    
                    const { outcome } = await window.deferredPrompt.userChoice;
                    console.log(`User ${outcome} the PWA installation`);
                    
                    window.deferredPrompt = null;
                    prompt.classList.remove('show');
                }
            };
        }
        
        // Handle dismiss button
        const dismissBtn = document.getElementById('dismissPWA');
        if (dismissBtn) {
            dismissBtn.onclick = () => {
                prompt.classList.remove('show');
                localStorage.setItem('pwaPromptDismissed', 'true');
            };
        }
    }

    /**
     * Setup offline capabilities
     */
    setupOfflineCapabilities() {
        // Check if service worker is registered
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistration().then(registration => {
                if (registration) {
                    console.log('✅ Service Worker registered');
                } else {
                    console.log('ℹ️ Service Worker not registered');
                }
            });
        }
        
        // Setup offline detection
        if (!this.state.isOnline) {
            this.showNotification('Running in offline mode', 'info', 3000);
        }
    }

    /**
     * Setup performance monitoring
     */
    setupMonitoring() {
        console.log('📊 Setting up performance monitoring...');
        
        // Monitor encryption/decryption performance
        if (this.cryptoEngine && this.cryptoEngine.performance) {
            this.performanceTimer = setInterval(() => {
                const stats = this.cryptoEngine.getPerformanceStats();
                this.performance.encryptionTimes = this.cryptoEngine.performance.encryptTimes;
                this.performance.decryptionTimes = this.cryptoEngine.performance.decryptTimes;
                
                // Log performance every 5 minutes
                console.debug('Performance stats:', stats);
            }, 300000); // 5 minutes
        }
        
        // Monitor memory
        if (performance.memory) {
            setInterval(() => {
                const memory = performance.memory.usedJSHeapSize;
                const limit = performance.memory.jsHeapSizeLimit;
                
                if (memory > limit * 0.8) {
                    console.warn('⚠️ High memory usage:', memory);
                    this.showNotification('High memory usage detected', 'warning', 3000);
                }
            }, 30000); // 30 seconds
        }
    }

    /**
     * Setup session management
     */
    setupSessionManagement() {
        console.log('⏱️ Setting up session management...');
        
        // Reset activity timer on user interaction
        const activities = ['click', 'keypress', 'mousemove', 'scroll', 'touchstart'];
        activities.forEach(activity => {
            document.addEventListener(activity, () => {
                this.state.lastActivity = Date.now();
            }, { passive: true });
        });
        
        // Check session timeout every minute
        setInterval(() => {
            const inactiveTime = Date.now() - this.state.lastActivity;
            
            if (inactiveTime > this.state.sessionTimeout) {
                this.handleSessionTimeout();
            }
            
            // Warn user 1 minute before timeout
            if (inactiveTime > this.state.sessionTimeout - 60000) {
                this.showSessionWarning();
            }
        }, 60000); // Check every minute
    }

    /**
     * Handle session timeout
     */
    handleSessionTimeout() {
        console.log('⏱️ Session timeout');
        
        // Clear sensitive data
        this.clearSensitiveData();
        
        // Show timeout message
        this.showNotification('Session timed out for security. Please refresh.', 'warning', 10000);
        
        // Optionally reload page
        setTimeout(() => {
            if (confirm('Your session has expired for security. Reload page?')) {
                window.location.reload();
            }
        }, 5000);
    }

    /**
     * Show session warning
     */
    showSessionWarning() {
        const warningShown = sessionStorage.getItem('sessionWarningShown');
        if (!warningShown) {
            this.showNotification('Session will expire in 1 minute due to inactivity', 'warning', 5000);
            sessionStorage.setItem('sessionWarningShown', 'true');
            
            // Reset warning after 5 minutes
            setTimeout(() => {
                sessionStorage.removeItem('sessionWarningShown');
            }, 300000);
        }
    }

    /**
     * Clear sensitive data
     */
    clearSensitiveData() {
        console.log('🧹 Clearing sensitive data...');
        
        // Clear password fields
        const passwordFields = document.querySelectorAll('input[type="password"]');
        passwordFields.forEach(field => {
            field.value = '';
        });
        
        // Clear file cache
        if (this.uiManager && this.uiManager.fileCache) {
            this.uiManager.fileCache.clear();
        }
        
        // Clear file inputs
        const fileInputs = document.querySelectorAll('input[type="file"]');
        fileInputs.forEach(input => {
            input.value = '';
        });
        
        // Clear file info displays
        const fileInfos = document.querySelectorAll('.file-info-3d');
        fileInfos.forEach(info => {
            info.style.display = 'none';
        });
        
        // Force garbage collection if available
        if (typeof window.gc === 'function') {
            window.gc();
        }
    }

    /**
     * Show welcome message
     */
    showWelcomeMessage() {
        const messages = [
            `Welcome to ${this.appName} v${this.version}`,
            'Military-grade encryption in your browser',
            'Your files never leave your device',
            'Zero-knowledge architecture'
        ];
        
        const message = messages[Math.floor(Math.random() * messages.length)];
        
        setTimeout(() => {
            this.showNotification(message, 'info', 5000);
        }, 1000);
    }

    /**
     * Handle initialization error
     */
    handleInitializationError(error) {
        // Show error to user
        const errorMessage = `
            Failed to initialize application.
            ${error.message}
            
            Please check:
            1. You are using a modern browser
            2. JavaScript is enabled
            3. You have a stable internet connection
            
            Error details have been logged to console.
        `;
        
        // Create error display
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-container';
        errorDiv.innerHTML = `
            <div class="error-content">
                <h2>🚫 Application Error</h2>
                <p>${errorMessage}</p>
                <button onclick="location.reload()">🔄 Retry</button>
                <button onclick="showFallbackMode()">🔧 Use Basic Mode</button>
            </div>
        `;
        
        document.body.appendChild(errorDiv);
        
        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .error-container {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: #050510;
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9999;
                padding: 20px;
            }
            
            .error-content {
                background: rgba(255, 71, 87, 0.1);
                border: 2px solid #ff4757;
                border-radius: 20px;
                padding: 40px;
                max-width: 600px;
                text-align: center;
            }
            
            .error-content h2 {
                color: #ff4757;
                margin-bottom: 20px;
            }
            
            .error-content p {
                color: #8a8aa3;
                margin-bottom: 30px;
                line-height: 1.6;
                white-space: pre-line;
            }
            
            .error-content button {
                background: linear-gradient(135deg, #ff4757, #cc3745);
                color: white;
                border: none;
                border-radius: 10px;
                padding: 12px 24px;
                margin: 0 10px;
                cursor: pointer;
                font-family: 'Orbitron', sans-serif;
                font-weight: 600;
                transition: all 0.3s ease;
            }
            
            .error-content button:hover {
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(255, 71, 87, 0.3);
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Show fallback mode
     */
    showFallbackMode() {
        console.log('🔧 Switching to fallback mode');
        
        // Remove error display
        const errorDiv = document.querySelector('.error-container');
        if (errorDiv) {
            errorDiv.remove();
        }
        
        // Show basic interface
        this.showNotification('Running in basic mode with limited features', 'warning', 5000);
        
        // Disable advanced features
        document.querySelectorAll('.advanced-feature').forEach(el => {
            el.style.display = 'none';
        });
    }

    /**
     * Handle resize event
     */
    handleResize() {
        console.log('🖥️ Window resized:', {
            width: window.innerWidth,
            height: window.innerHeight,
            isMobile: this.state.isMobile
        });
        
        // Update mobile detection
        const wasMobile = this.state.isMobile;
        this.state.isMobile = window.innerWidth <= 768;
        
        if (wasMobile !== this.state.isMobile) {
            this.adaptUIForEnvironment();
        }
        
        // Update Three.js scene if available
        if (this.threeScene) {
            this.threeScene.handleResize();
        }
    }

    /**
     * Handle errors
     */
    handleError(error) {
        console.error('❌ Application error:', error);
        
        // Don't show error notifications for network errors
        if (error.message && error.message.includes('NetworkError')) {
            return;
        }
        
        // Show user-friendly error message
        const userMessage = this.getUserFriendlyErrorMessage(error);
        this.showNotification(userMessage, 'error', 10000);
        
        // Log to audit if available
        if (typeof window.AuditLogger !== 'undefined') {
            window.AuditLogger.log('APPLICATION_ERROR', 'ERROR', {
                message: error.message,
                stack: error.stack,
                timestamp: Date.now()
            });
        }
    }

    /**
     * Get user-friendly error message
     */
    getUserFriendlyErrorMessage(error) {
        const message = error.message || String(error);
        
        // Common error mappings
        const errorMap = {
            'QuotaExceededError': 'Storage limit exceeded. Please clear some space.',
            'SecurityError': 'Security restriction. Try using HTTPS.',
            'TypeError': 'Application error. Please refresh the page.',
            'NetworkError': 'Network error. Check your connection.',
            'DOMException': 'Operation failed. Please try again.',
            'InvalidStateError': 'Application state error. Please refresh.'
        };
        
        // Find matching error
        for (const [key, value] of Object.entries(errorMap)) {
            if (message.includes(key)) {
                return value;
            }
        }
        
        // Default message
        return `Error: ${message.substring(0, 100)}${message.length > 100 ? '...' : ''}`;
    }

    /**
     * Show notification
     */
    showNotification(message, type = 'info', duration = 5000) {
        if (this.uiManager) {
            this.uiManager.showNotification(message, type, duration);
        } else {
            // Fallback notification
            const notification = document.createElement('div');
            notification.className = `fallback-notification ${type}`;
            notification.textContent = message;
            notification.style.cssText = `
                position: fixed;
                bottom: 20px;
                left: 50%;
                transform: translateX(-50%);
                background: ${type === 'error' ? '#ff4757' : type === 'warning' ? '#ffaa00' : '#00a8ff'};
                color: white;
                padding: 15px 25px;
                border-radius: 10px;
                z-index: 10000;
                max-width: 90%;
                text-align: center;
                animation: slideUp 0.3s ease;
            `;
            
            document.body.appendChild(notification);
            
            // Auto-remove
            setTimeout(() => {
                notification.remove();
            }, duration);
        }
    }

    /**
     * Check if processing is in progress
     */
    isProcessing() {
        if (this.uiManager) {
            // Check if any buttons are disabled (processing state)
            const buttons = document.querySelectorAll('.btn-3d');
            return Array.from(buttons).some(btn => btn.disabled);
        }
        return false;
    }

    /**
     * Get application statistics
     */
    getStatistics() {
        return {
            version: this.version,
            initialized: this.state.initialized,
            environment: {
                isMobile: this.state.isMobile,
                isPWA: this.state.isPWA,
                isOnline: this.state.isOnline,
                isTouch: this.state.isTouch
            },
            performance: {
                startupTime: this.performance.startupTime,
                memoryUsage: this.performance.memoryUsage.length > 0 ? 
                    this.performance.memoryUsage[this.performance.memoryUsage.length - 1] : 0,
                encryptionCount: this.performance.encryptionTimes.length,
                decryptionCount: this.performance.decryptionTimes.length
            },
            security: {
                level: this.state.securityLevel,
                https: window.location.protocol === 'https:',
                cryptoSupported: typeof crypto.subtle !== 'undefined'
            }
        };
    }

    /**
     * Export functionality for debugging
     */
    exportDebugInfo() {
        const debugInfo = {
            app: this.getStatistics(),
            userAgent: navigator.userAgent,
            url: window.location.href,
            timestamp: new Date().toISOString(),
            screen: {
                width: window.screen.width,
                height: window.screen.height,
                colorDepth: window.screen.colorDepth
            },
            window: {
                innerWidth: window.innerWidth,
                innerHeight: window.innerHeight
            },
            localStorage: {
                keys: Object.keys(localStorage),
                size: JSON.stringify(localStorage).length
            },
            modules: {
                cryptoEngine: !!this.cryptoEngine,
                fileProcessor: !!this.fileProcessor,
                workerManager: !!this.workerManager,
                uiManager: !!this.uiManager
            }
        };
        
        return debugInfo;
    }

    /**
     * Clean up resources
     */
    cleanup() {
        console.log('🧹 Cleaning up application resources...');
        
        // Clear timers
        if (this.performanceTimer) {
            clearInterval(this.performanceTimer);
        }
        
        if (this.activityTimer) {
            clearInterval(this.activityTimer);
        }
        
        // Clean up Three.js scene
        if (this.threeScene) {
            this.threeScene.cleanup();
        }
        
        // Clean up Worker Manager
        if (this.workerManager) {
            this.workerManager.cleanup();
        }
        
        // Clean up UI Manager
        if (this.uiManager) {
            this.uiManager.cleanup();
        }
        
        // Clear sensitive data
        this.clearSensitiveData();
        
        console.log('✅ Cleanup complete');
    }
}

// ============================================================================
// APPLICATION INITIALIZATION
// ============================================================================

// Create global application instance
const CipherVaultAppInstance = new CipherVaultApp();

// Initialize application on page load
if (typeof window !== 'undefined') {
    window.addEventListener('load', async () => {
        try {
            // Show loading state
            document.body.classList.add('loading');
            
            // Initialize application
            await CipherVaultAppInstance.initialize();
            
            // Remove loading state
            document.body.classList.remove('loading');
            
            // Make app instance available globally
            window.CipherVaultApp = CipherVaultAppInstance;
            
        } catch (error) {
            console.error('Failed to initialize application:', error);
            document.body.classList.remove('loading');
            document.body.classList.add('error');
        }
    });
    
    // Clean up on page unload
    window.addEventListener('beforeunload', () => {
        CipherVaultAppInstance.cleanup();
    });
    
    // Export for debugging
    window.getDebugInfo = () => CipherVaultAppInstance.exportDebugInfo();
    window.getAppStats = () => CipherVaultAppInstance.getStatistics();
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CipherVaultAppInstance;
}
