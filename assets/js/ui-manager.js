/**
 * CipherVault 3D Pro - UI Manager System
 * Manages DOM interactions, notifications, and 3D scene integration
 * Version: 4.2.0
 */

class UIManagerSystem {
    constructor() {
        this.elements = {};
        this.activeModals = new Set();
        this.notifications = [];
        this.isDarkParams = true; // Default
        
        // ربط الحالة بألوان المشهد ثلاثي الأبعاد
        this.statusColors = {
            IDLE: 0x00d4ff,    // Cyan
            PROCESSING: 0xffaa00, // Orange
            SUCCESS: 0x00ff88, // Green
            ERROR: 0xff4757,   // Red
            LOCKED: 0xff0080   // Pink
        };

        this.init();
    }

    init() {
        this.cacheDOM();
        this.bindGlobalEvents();
        this.setupDragAndDrop();
        console.log('UI Manager initialized successfully');
    }

    cacheDOM() {
        // تخزين العناصر الهامة لتحسين الأداء
        this.elements = {
            dropZone: document.getElementById('drop-zone'),
            progressBar: document.getElementById('progress-bar'),
            progressText: document.getElementById('progress-text'),
            statusText: document.getElementById('status-text'),
            fileInput: document.getElementById('file-input'),
            appContainer: document.querySelector('.app-container'),
            notificationsArea: document.getElementById('notifications-area') || this.createNotificationsArea()
        };
    }

    createNotificationsArea() {
        const div = document.createElement('div');
        div.id = 'notifications-area';
        div.className = 'notifications-container-3d';
        document.body.appendChild(div);
        return div;
    }

    bindGlobalEvents() {
        // منع السلوك الافتراضي للمتصفح عند سحب الملفات
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            document.body.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
            }, false);
        });
    }

    setupDragAndDrop() {
        if (!this.elements.dropZone) return;

        ['dragenter', 'dragover'].forEach(eventName => {
            this.elements.dropZone.addEventListener(eventName, () => {
                this.elements.dropZone.classList.add('drag-active');
                // تأثير ثلاثي الأبعاد: تكبير بسيط
                if (window.ThreeScene) window.ThreeScene.triggerInteraction('hover', true);
            }, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            this.elements.dropZone.addEventListener(eventName, () => {
                this.elements.dropZone.classList.remove('drag-active');
                if (window.ThreeScene) window.ThreeScene.triggerInteraction('hover', false);
            }, false);
        });
    }

    /**
     * تحديث شريط التقدم والحالة
     * @param {number} percent - نسبة التقدم (0-100)
     * @param {string} statusKey - مفتاح الترجمة للحالة
     * @param {string} mode - 'encrypt' | 'decrypt'
     */
    updateProgress(percent, statusKey, mode = 'IDLE') {
        const safePercent = Math.min(100, Math.max(0, percent));
        
        if (this.elements.progressBar) {
            this.elements.progressBar.style.width = `${safePercent}%`;
            this.elements.progressBar.setAttribute('aria-valuenow', safePercent);
        }

        if (this.elements.progressText) {
            this.elements.progressText.textContent = `${Math.round(safePercent)}%`;
        }

        if (statusKey && this.elements.statusText && window.t) {
            this.elements.statusText.textContent = window.t(statusKey);
        }

        // تحديث إضاءة المشهد ثلاثي الأبعاد بناءً على الحالة
        this.updateSceneLighting(mode, safePercent);
    }

    updateSceneLighting(mode, intensity) {
        if (!window.ThreeScene) return;

        let color = this.statusColors.IDLE;
        if (mode === 'ENCRYPTING') color = this.statusColors.PROCESSING;
        if (mode === 'DECRYPTING') color = this.statusColors.LOCKED;
        if (mode === 'COMPLETED') color = this.statusColors.SUCCESS;
        if (mode === 'ERROR') color = this.statusColors.ERROR;

        // إرسال تحديث للمشهد (يفترض وجود دالة updateMood في three-scene.js)
        // إذا لم تكن موجودة، نستخدم الـ logic العام
        if (window.ThreeScene.updateAmbientLight) {
            window.ThreeScene.updateAmbientLight(color, 0.5 + (intensity / 200));
        }
    }

    /**
     * إظهار إشعار للمستخدم
     * @param {string} messageKey - مفتاح الترجمة أو النص
     * @param {string} type - 'success', 'error', 'warning', 'info'
     */
    showNotification(messageKey, type = 'info') {
        const message = window.t ? window.t(messageKey) : messageKey;
        const id = Date.now();
        
        const notification = document.createElement('div');
        notification.className = `notification-3d notification-${type} slide-in`;
        notification.innerHTML = `
            <div class="notification-icon">${this.getIconForType(type)}</div>
            <div class="notification-content">${message}</div>
            <div class="notification-close" onclick="this.parentElement.remove()">×</div>
        `;

        this.elements.notificationsArea.appendChild(notification);

        // تشغيل صوت (اختياري)
        this.playFeedbackSound(type);

        // إزالة تلقائية
        setTimeout(() => {
            notification.classList.add('slide-out');
            setTimeout(() => notification.remove(), 500);
        }, 5000);
        
        // تسجيل في Audit Log
        if (window.AuditLogger) {
            window.AuditLogger.log('UI_NOTIFICATION', type.toUpperCase(), { message });
        }
    }

    getIconForType(type) {
        switch(type) {
            case 'success': return '✓';
            case 'error': return '⚠';
            case 'warning': return '!';
            default: return 'i';
        }
    }

    playFeedbackSound(type) {
        // Placeholder for sound effects logic
        // يمكن إضافة Web Audio API هنا لاحقاً
    }

    /**
     * تفعيل أو تعطيل عناصر التحكم أثناء المعالجة
     */
    setBusyState(isBusy) {
        const buttons = document.querySelectorAll('button, input');
        buttons.forEach(btn => {
            if (isBusy) btn.setAttribute('disabled', 'true');
            else btn.removeAttribute('disabled');
        });
        
        this.elements.appContainer.classList.toggle('processing-mode', isBusy);
    }
}

// Global Initialization
const UIManager = new UIManagerSystem();

if (typeof window !== 'undefined') {
    window.UIManager = UIManager;
}
