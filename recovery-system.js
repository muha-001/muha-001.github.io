/**
 * CipherVault 3D Pro - Recovery System
 * Implementation of Shamir's Secret Sharing for key recovery
 * Version: 4.2.0
 */

class RecoverySystem {
    constructor() {
        this.config = {
            bits: 8, // GF(2^8)
            primitive: 0x11b, // Primitive polynomial for AES GF(2^8)
            defaultShards: 5,
            defaultThreshold: 3
        };
        
        // جداول اللوغاريتمات لتسريع العمليات الحسابية في الحقل المحدود
        this.logs = new Uint8Array(256);
        this.exps = new Uint8Array(256);
        this.initGaloisField();
    }

    initGaloisField() {
        let x = 1;
        for (let i = 0; i < 255; i++) {
            this.exps[i] = x;
            this.logs[x] = i;
            x = x << 1;
            if (x & 0x100) x ^= this.config.primitive;
        }
        // log(0) غير معرف، لكن نتركه 0 للسهولة مع التحقق
    }

    /**
     * تقسيم السر (المفتاح) إلى أجزاء
     * @param {Uint8Array} secret - المفتاح المراد حمايته
     * @param {number} n - عدد الأجزاء الكلي (مثلاً 5)
     * @param {number} k - الحد الأدنى للاستعادة (مثلاً 3)
     */
    splitSecret(secret, n = 5, k = 3) {
        if (k > n) throw new Error('Threshold cannot be greater than total shards');
        
        // تسجيل العملية
        if (window.AuditLogger) {
            window.AuditLogger.log('RECOVERY_SPLIT_START', 'WARNING', { n, k });
        }

        const shards = Array(n).fill(null).map((_, i) => ({
            id: i + 1,
            data: new Uint8Array(secret.length)
        }));

        // لكل بايت في السر
        for (let i = 0; i < secret.length; i++) {
            // توليد معاملات كثيرة الحدود عشوائياً: f(x) = a0 + a1*x + ... + ak-1*x^(k-1)
            // حيث a0 هو البايت السري
            const coeffs = [secret[i]];
            for (let j = 1; j < k; j++) {
                coeffs.push(crypto.getRandomValues(new Uint8Array(1))[0]);
            }

            // حساب قيمة f(x) لكل shard ID
            for (let s = 0; s < n; s++) {
                const x = shards[s].id;
                shards[s].data[i] = this.evaluatePolynomial(coeffs, x);
            }
        }

        return shards;
    }

    /**
     * استعادة السر من الأجزاء
     * @param {Array} shards - مصفوفة من الأجزاء {id, data}
     */
    combineShards(shards) {
        if (!shards || shards.length === 0) throw new Error('No shards provided');
        
        const secretLength = shards[0].data.length;
        const secret = new Uint8Array(secretLength);
        
        // استخدام استيفاء لاغرانج (Lagrange Interpolation) عند x=0
        for (let i = 0; i < secretLength; i++) {
            // تجميع النقاط (x, y) لهذا البايت
            const points = shards.map(s => [s.id, s.data[i]]);
            secret[i] = this.interpolate(points, 0);
        }

        if (window.AuditLogger) {
            window.AuditLogger.log('RECOVERY_COMBINE_SUCCESS', 'CRITICAL', { shardsUsed: shards.length });
        }

        return secret;
    }

    // ==========================================
    // GF(2^8) Math Helpers
    // ==========================================

    add(a, b) { return a ^ b; }
    
    sub(a, b) { return a ^ b; } // In GF(2^n), addition is subtraction

    mul(a, b) {
        if (a === 0 || b === 0) return 0;
        const logA = this.logs[a];
        const logB = this.logs[b];
        return this.exps[(logA + logB) % 255];
    }

    div(a, b) {
        if (b === 0) throw new Error('Division by zero');
        if (a === 0) return 0;
        const logA = this.logs[a];
        const logB = this.logs[b];
        return this.exps[(logA - logB + 255) % 255];
    }

    evaluatePolynomial(coeffs, x) {
        let result = 0;
        for (let i = coeffs.length - 1; i >= 0; i--) {
            result = this.add(this.mul(result, x), coeffs[i]);
        }
        return result;
    }

    interpolate(points, x) {
        let result = 0;
        for (let i = 0; i < points.length; i++) {
            const [xi, yi] = points[i];
            let term = yi;
            
            for (let j = 0; j < points.length; j++) {
                if (i !== j) {
                    const [xj] = points[j];
                    const numerator = this.sub(x, xj);
                    const denominator = this.sub(xi, xj);
                    term = this.mul(term, this.div(numerator, denominator));
                }
            }
            result = this.add(result, term);
        }
        return result;
    }
    
    // تصدير ملف الاستعادة للمستخدم
    downloadRecoveryKit(shards) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const content = JSON.stringify({
            version: '4.2.0',
            created: timestamp,
            shards: shards.map(s => ({
                id: s.id,
                data: Array.from(s.data) // تحويل لـ Array للحفظ في JSON
            }))
        }, null, 2);
        
        const blob = new Blob([content], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `CipherVault-Recovery-Kit-${timestamp}.json`;
        a.click();
        
        if (window.UIManager) {
            window.UIManager.showNotification('recovery-kit-downloaded', 'success');
        }
    }
}

const RecoveryManager = new RecoverySystem();
if (typeof window !== 'undefined') {
    window.RecoveryManager = RecoveryManager;
}
