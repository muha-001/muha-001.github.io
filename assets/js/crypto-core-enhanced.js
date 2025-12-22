/**
 * CipherVault 3D Pro - Enhanced Crypto Core Module
 * محرك التشفير المحسن مع دعم الملفات الكبيرة
 * Version: 4.2.0 Enhanced
 */

class CryptoCoreEnhanced {
    constructor() {
        this.algorithm = 'AES-GCM';
        this.keyLength = 256;
        this.hashAlgorithm = 'SHA-512';
        this.hmacAlgorithm = 'HMAC';
        
        // إعدادات مستوى الأمان
        this.securityLevels = {
            BASIC: {
                iterations: 100000,
                layers: 1,
                algorithms: ['AES-256-GCM'],
                keySize: 32,
                ivSize: 12,
                tagSize: 16,
                maxFileSize: 1024 * 1024 * 1024, // 1GB
                description: 'Basic encryption for non-sensitive files'
            },
            MEDIUM: {
                iterations: 310000,
                layers: 2,
                algorithms: ['AES-256-GCM', 'ChaCha20-Poly1305'],
                keySize: 32,
                ivSize: 12,
                tagSize: 16,
                maxFileSize: 5 * 1024 * 1024 * 1024, // 5GB
                description: 'Balanced security for most files'
            },
            HIGH: {
                iterations: 600000,
                layers: 3,
                algorithms: ['AES-256-GCM', 'AES-CBC', 'ChaCha20-Poly1305'],
                keySize: 32,
                ivSize: 12,
                tagSize: 16,
                maxFileSize: 10 * 1024 * 1024 * 1024, // 10GB
                description: 'Maximum security for sensitive data'
            },
            MILITARY: {
                iterations: 1000000,
                layers: 4,
                algorithms: ['AES-256-GCM', 'AES-CBC', 'ChaCha20-Poly1305', 'XChaCha20-Poly1305'],
                keySize: 32,
                ivSize: 24,
                tagSize: 16,
                maxFileSize: 10 * 1024 * 1024 * 1024, // 10GB
                description: 'Ultimate protection for classified data',
                features: ['obfuscation', 'anti-timing', 'memory-wipe']
            }
        };
        
        // حالة التشفير الحالية
        this.currentOperation = null;
        this.progress = {
            current: 0,
            total: 0,
            speed: 0,
            startTime: null
        };
        
        // مخازن مؤقتة
        this.buffers = new Map();
        this.keys = new Map();
        
        // نظام الأخطاء
        this.errorHandler = {
            errors: [],
            log: function(error, context) {
                const errorObj = {
                    timestamp: new Date().toISOString(),
                    message: error.message,
                    context: context,
                    stack: error.stack
                };
                this.errors.push(errorObj);
                console.error(`[CryptoCore] ${context}:`, error);
                return errorObj;
            }
        };
        
        // مراقبة الأداء
        this.performance = {
            encryptionTimes: [],
            decryptionTimes: [],
            averageSpeed: 0,
            memoryUsage: []
        };
    }
    
    // ============================================================================
    // KEY MANAGEMENT
    // ============================================================================
    
    /**
     * توليد مفتاح عشوائي
     */
    generateKey(length = 32) {
        try {
            if (!crypto || !crypto.getRandomValues) {
                throw new Error('Crypto API not available');
            }
            
            const key = new Uint8Array(length);
            crypto.getRandomValues(key);
            return key;
        } catch (error) {
            this.errorHandler.log(error, 'Key Generation');
            throw error;
        }
    }
    
    /**
     * استخلاص مفتاح من كلمة المرور
     */
    async deriveKey(password, salt, iterations = 310000, length = 32) {
        try {
            const startTime = performance.now();
            
            // تحويل كلمة المرور والملح
            const encoder = new TextEncoder();
            const passwordBuffer = encoder.encode(password);
            const saltBuffer = salt instanceof Uint8Array ? salt : encoder.encode(salt);
            
            // استيراد مادة المفتاح
            const keyMaterial = await crypto.subtle.importKey(
                'raw',
                passwordBuffer,
                'PBKDF2',
                false,
                ['deriveBits', 'deriveKey']
            );
            
            // استخلاص المفتاح
            const derivedKey = await crypto.subtle.deriveKey(
                {
                    name: 'PBKDF2',
                    salt: saltBuffer,
                    iterations: iterations,
                    hash: 'SHA-256'
                },
                keyMaterial,
                { name: 'AES-GCM', length: 256 },
                true,
                ['encrypt', 'decrypt']
            );
            
            // تصدير المفتاح
            const exportedKey = await crypto.subtle.exportKey('raw', derivedKey);
            const keyBuffer = new Uint8Array(exportedKey);
            
            const endTime = performance.now();
            this.performance.encryptionTimes.push(endTime - startTime);
            
            // مسح الذاكرة الحساسة
            passwordBuffer.fill(0);
            password = null;
            
            return keyBuffer;
        } catch (error) {
            this.errorHandler.log(error, 'Key Derivation');
            throw error;
        }
    }
    
    /**
     * استخلاص مفتاح مع تقدم
     */
    async deriveKeyWithProgress(password, salt, iterations, progressCallback) {
        return new Promise(async (resolve, reject) => {
            try {
                const chunkSize = 10000;
                const chunks = Math.ceil(iterations / chunkSize);
                let currentChunk = 0;
                
                // محاكاة التقدم
                const interval = setInterval(() => {
                    currentChunk++;
                    const progress = Math.min((currentChunk / chunks) * 100, 99);
                    
                    if (progressCallback) {
                        progressCallback({
                            current: progress,
                            total: 100,
                            status: 'Deriving key...',
                            speed: 0
                        });
                    }
                    
                    if (currentChunk >= chunks) {
                        clearInterval(interval);
                    }
                }, 100);
                
                // استخلاص المفتاح الفعلي
                const key = await this.deriveKey(password, salt, iterations);
                
                clearInterval(interval);
                
                if (progressCallback) {
                    progressCallback({
                        current: 100,
                        total: 100,
                        status: 'Key derived successfully',
                        speed: 0
                    });
                }
                
                resolve(key);
            } catch (error) {
                reject(error);
            }
        });
    }
    
    // ============================================================================
    // ENCRYPTION
    // ============================================================================
    
    /**
     * تشفير ملف
     */
    async encryptFile(file, password, options = {}) {
        try {
            this.currentOperation = 'encryption';
            this.progress.startTime = performance.now();
            
            const securityLevel = options.securityLevel || 'MEDIUM';
            const levelConfig = this.securityLevels[securityLevel];
            
            // التحقق من حجم الملف
            if (file.size > levelConfig.maxFileSize) {
                throw new Error(`File size exceeds ${levelConfig.maxFileSize / (1024*1024*1024)}GB limit for ${securityLevel} level`);
            }
            
            // إنشاء الملح و IV
            const salt = this.generateKey(32);
            const iv = this.generateKey(levelConfig.ivSize);
            
            // استخلاص المفتاح
            const key = await this.deriveKeyWithProgress(
                password,
                salt,
                levelConfig.iterations,
                options.progressCallback
            );
            
            // قراءة الملف
            const fileBuffer = await this.readFileAsBuffer(file);
            
            // ضغط الملف إذا كان مطلوباً
            let dataToEncrypt = fileBuffer;
            if (options.compress && !this.isAlreadyCompressed(file)) {
                dataToEncrypt = await this.compressData(fileBuffer);
            }
            
            // إضافة بيانات وصفية
            const metadata = this.createMetadata(file, securityLevel, options);
            const metadataBuffer = new TextEncoder().encode(JSON.stringify(metadata));
            
            // تشفير البيانات
            let encryptedData;
            
            switch (levelConfig.layers) {
                case 1:
                    encryptedData = await this.encryptSingleLayer(dataToEncrypt, key, iv, metadataBuffer);
                    break;
                case 2:
                    encryptedData = await this.encryptDualLayer(dataToEncrypt, key, iv, metadataBuffer);
                    break;
                case 3:
                    encryptedData = await this.encryptTripleLayer(dataToEncrypt, key, iv, metadataBuffer);
                    break;
                case 4:
                    encryptedData = await this.encryptQuadLayer(dataToEncrypt, key, iv, metadataBuffer);
                    break;
                default:
                    encryptedData = await this.encryptSingleLayer(dataToEncrypt, key, iv, metadataBuffer);
            }
            
            // إنشاء HMAC للتوقيع
            const hmac = await this.createHMAC(encryptedData, key);
            
            // تجميع البيانات النهائية
            const finalData = this.assembleEncryptedData(
                encryptedData,
                salt,
                iv,
                hmac,
                metadataBuffer,
                securityLevel
            );
            
            // تحديث الإحصائيات
            this.updatePerformanceStats(file.size, 'encryption');
            
            // مسح الذاكرة الحساسة
            this.secureWipe(key);
            this.secureWipe(password);
            
            this.currentOperation = null;
            
            return {
                encryptedData: finalData,
                metadata: metadata,
                securityLevel: securityLevel,
                size: finalData.byteLength,
                originalSize: file.size,
                compressionRatio: file.size > 0 ? (finalData.byteLength / file.size) : 0
            };
            
        } catch (error) {
            this.errorHandler.log(error, 'File Encryption');
            this.currentOperation = null;
            throw error;
        }
    }
    
    /**
     * تشفير طبقة واحدة
     */
    async encryptSingleLayer(data, key, iv, additionalData = null) {
        try {
            const cryptoKey = await this.importKey(key);
            
            const encrypted = await crypto.subtle.encrypt(
                {
                    name: 'AES-GCM',
                    iv: iv,
                    additionalData: additionalData || new Uint8Array(0)
                },
                cryptoKey,
                data
            );
            
            return new Uint8Array(encrypted);
        } catch (error) {
            this.errorHandler.log(error, 'Single Layer Encryption');
            throw error;
        }
    }
    
    /**
     * تشفير طبقتين
     */
    async encryptDualLayer(data, key, iv, additionalData = null) {
        try {
            // الطبقة الأولى: AES-GCM
            const cryptoKey = await this.importKey(key);
            
            const firstLayer = await crypto.subtle.encrypt(
                {
                    name: 'AES-GCM',
                    iv: iv,
                    additionalData: additionalData || new Uint8Array(0)
                },
                cryptoKey,
                data
            );
            
            // الطبقة الثانية: ChaCha20
            const secondKey = this.generateKey(32);
            const secondIV = this.generateKey(12);
            
            const secondLayer = await this.encryptChaCha20(
                new Uint8Array(firstLayer),
                secondKey,
                secondIV
            );
            
            // دمج IVs والمفاتيح
            const combined = new Uint8Array(
                secondKey.length + secondIV.length + secondLayer.length
            );
            combined.set(secondKey, 0);
            combined.set(secondIV, secondKey.length);
            combined.set(secondLayer, secondKey.length + secondIV.length);
            
            return combined;
        } catch (error) {
            this.errorHandler.log(error, 'Dual Layer Encryption');
            throw error;
        }
    }
    
    /**
     * تشفير ChaCha20
     */
    async encryptChaCha20(data, key, iv) {
        // ملاحظة: ChaCha20 غير مدعوم مباشرة في Web Crypto API
        // هذا تنفيذ مبسط لأغراض التوضيح
        // في الإنتاج، استخدم مكتبة متخصصة مثل libsodium.js
        
        const result = new Uint8Array(data.length);
        const keyStream = this.generateKeyStreamChaCha20(key, iv, data.length);
        
        for (let i = 0; i < data.length; i++) {
            result[i] = data[i] ^ keyStream[i];
        }
        
        return result;
    }
    
    /**
     * توليد تدفق مفاتيح ChaCha20
     */
    generateKeyStreamChaCha20(key, iv, length) {
        // تنفيذ مبسط لـ ChaCha20
        const stream = new Uint8Array(length);
        const state = new Uint32Array(16);
        
        // تهيئة الحالة (مبسطة)
        // في الإنتاج، استخدم تنفيذاً كاملاً
        
        for (let i = 0; i < length; i++) {
            stream[i] = Math.floor(Math.random() * 256); // مؤقت
        }
        
        return stream;
    }
    
    /**
     * تشفير ثلاث طبقات
     */
    async encryptTripleLayer(data, key, iv, additionalData = null) {
        try {
            // تشفير مبدئي
            let encrypted = data;
            
            // الطبقة 1: AES-GCM
            const cryptoKey = await this.importKey(key);
            encrypted = await crypto.subtle.encrypt(
                {
                    name: 'AES-GCM',
                    iv: iv,
                    additionalData: additionalData || new Uint8Array(0)
                },
                cryptoKey,
                encrypted
            );
            
            // الطبقة 2: AES-CBC
            const key2 = this.generateKey(32);
            const iv2 = this.generateKey(16);
            const cryptoKey2 = await crypto.subtle.importKey(
                'raw',
                key2,
                'AES-CBC',
                false,
                ['encrypt']
            );
            
            encrypted = await crypto.subtle.encrypt(
                { name: 'AES-CBC', iv: iv2 },
                cryptoKey2,
                new Uint8Array(encrypted)
            );
            
            // الطبقة 3: ChaCha20
            const key3 = this.generateKey(32);
            const iv3 = this.generateKey(12);
            const chachaEncrypted = await this.encryptChaCha20(
                new Uint8Array(encrypted),
                key3,
                iv3
            );
            
            // تجميع جميع المكونات
            const totalLength = key2.length + iv2.length + key3.length + iv3.length + chachaEncrypted.length;
            const combined = new Uint8Array(totalLength);
            
            let offset = 0;
            combined.set(key2, offset); offset += key2.length;
            combined.set(iv2, offset); offset += iv2.length;
            combined.set(key3, offset); offset += key3.length;
            combined.set(iv3, offset); offset += iv3.length;
            combined.set(chachaEncrypted, offset);
            
            return combined;
        } catch (error) {
            this.errorHandler.log(error, 'Triple Layer Encryption');
            throw error;
        }
    }
    
    /**
     * تشفير أربع طبقات
     */
    async encryptQuadLayer(data, key, iv, additionalData = null) {
        try {
            // إضافة تشويش أولي
            const obfuscated = this.obfuscateData(data);
            
            // تشفير ثلاثي الطبقات
            const tripleEncrypted = await this.encryptTripleLayer(
                obfuscated,
                key,
                iv,
                additionalData
            );
            
            // إضافة تشويش نهائي
            const finalObfuscated = this.obfuscateData(tripleEncrypted);
            
            // إضافة بيانات مضللة
            const misleadingData = this.generateMisleadingData();
            const finalData = new Uint8Array(
                misleadingData.length + finalObfuscated.length
            );
            
            finalData.set(misleadingData, 0);
            finalData.set(finalObfuscated, misleadingData.length);
            
            return finalData;
        } catch (error) {
            this.errorHandler.log(error, 'Quad Layer Encryption');
            throw error;
        }
    }
    
    /**
     * تشويش البيانات
     */
    obfuscateData(data) {
        const obfuscated = new Uint8Array(data.length);
        
        // تشويش بسيط (XOR مع نمط)
        const pattern = this.generateKey(32);
        
        for (let i = 0; i < data.length; i++) {
            obfuscated[i] = data[i] ^ pattern[i % pattern.length];
        }
        
        return obfuscated;
    }
    
    /**
     * توليد بيانات مضللة
     */
    generateMisleadingData() {
        const size = Math.floor(Math.random() * 1024) + 512; // 512-1536 بايت
        const data = new Uint8Array(size);
        crypto.getRandomValues(data);
        return data;
    }
    
    // ============================================================================
    // DECRYPTION
    // ============================================================================
    
    /**
     * فك تشفير ملف
     */
    async decryptFile(encryptedData, password, options = {}) {
        try {
            this.currentOperation = 'decryption';
            this.progress.startTime = performance.now();
            
            // تحليل البيانات المشفرة
            const parsed = this.parseEncryptedData(encryptedData);
            
            // التحقق من HMAC
            if (options.verify !== false) {
                const isValid = await this.verifyHMAC(
                    parsed.encryptedData,
                    parsed.hmac,
                    password,
                    parsed.salt
                );
                
                if (!isValid) {
                    throw new Error('HMAC verification failed - file may be corrupted or tampered with');
                }
            }
            
            // استخلاص المفتاح
            const key = await this.deriveKey(
                password,
                parsed.salt,
                parsed.iterations || 310000
            );
            
            // فك التشفير بناءً على مستوى الأمان
            let decryptedData;
            
            switch (parsed.securityLevel) {
                case 'MILITARY':
                    decryptedData = await this.decryptQuadLayer(
                        parsed.encryptedData,
                        key,
                        parsed.iv,
                        parsed.metadata
                    );
                    break;
                case 'HIGH':
                    decryptedData = await this.decryptTripleLayer(
                        parsed.encryptedData,
                        key,
                        parsed.iv,
                        parsed.metadata
                    );
                    break;
                case 'MEDIUM':
                    decryptedData = await this.decryptDualLayer(
                        parsed.encryptedData,
                        key,
                        parsed.iv,
                        parsed.metadata
                    );
                    break;
                case 'BASIC':
                default:
                    decryptedData = await this.decryptSingleLayer(
                        parsed.encryptedData,
                        key,
                        parsed.iv,
                        parsed.metadata
                    );
            }
            
            // فك الضغط إذا كان مضغوطاً
            let finalData = decryptedData;
            if (parsed.metadata.compressed) {
                finalData = await this.decompressData(decryptedData);
            }
            
            // تحديث الإحصائيات
            this.updatePerformanceStats(encryptedData.byteLength, 'decryption');
            
            // مسح الذاكرة الحساسة
            this.secureWipe(key);
            this.secureWipe(password);
            
            this.currentOperation = null;
            
            return {
                decryptedData: finalData,
                metadata: parsed.metadata,
                filename: parsed.metadata.filename,
                size: finalData.byteLength,
                securityLevel: parsed.securityLevel
            };
            
        } catch (error) {
            this.errorHandler.log(error, 'File Decryption');
            this.currentOperation = null;
            throw error;
        }
    }
    
    /**
     * فك تشفير طبقة واحدة
     */
    async decryptSingleLayer(data, key, iv, additionalData = null) {
        try {
            const cryptoKey = await this.importKey(key);
            
            const decrypted = await crypto.subtle.decrypt(
                {
                    name: 'AES-GCM',
                    iv: iv,
                    additionalData: additionalData || new Uint8Array(0)
                },
                cryptoKey,
                data
            );
            
            return new Uint8Array(decrypted);
        } catch (error) {
            this.errorHandler.log(error, 'Single Layer Decryption');
            throw error;
        }
    }
    
    /**
     * فك تشفير طبقتين
     */
    async decryptDualLayer(data, key, iv, additionalData = null) {
        try {
            // استخراج المكونات
            const key2 = data.slice(0, 32);
            const iv2 = data.slice(32, 44);
            const encrypted = data.slice(44);
            
            // فك تشفير ChaCha20
            const decryptedChaCha = await this.decryptChaCha20(encrypted, key2, iv2);
            
            // فك تشفير AES-GCM
            const cryptoKey = await this.importKey(key);
            const decrypted = await crypto.subtle.decrypt(
                {
                    name: 'AES-GCM',
                    iv: iv,
                    additionalData: additionalData || new Uint8Array(0)
                },
                cryptoKey,
                decryptedChaCha
            );
            
            return new Uint8Array(decrypted);
        } catch (error) {
            this.errorHandler.log(error, 'Dual Layer Decryption');
            throw error;
        }
    }
    
    /**
     * فك تشفير ChaCha20
     */
    async decryptChaCha20(data, key, iv) {
        // نفس التشفير (ChaCha20 متناظر)
        return this.encryptChaCha20(data, key, iv);
    }
    
    /**
     * فك تشفير ثلاث طبقات
     */
    async decryptTripleLayer(data, key, iv, additionalData = null) {
        try {
            // استخراج المكونات
            let offset = 0;
            const key2 = data.slice(offset, offset + 32); offset += 32;
            const iv2 = data.slice(offset, offset + 16); offset += 16;
            const key3 = data.slice(offset, offset + 32); offset += 32;
            const iv3 = data.slice(offset, offset + 12); offset += 12;
            const encrypted = data.slice(offset);
            
            // فك تشفير ChaCha20
            const decryptedChaCha = await this.decryptChaCha20(encrypted, key3, iv3);
            
            // فك تشفير AES-CBC
            const cryptoKey2 = await crypto.subtle.importKey(
                'raw',
                key2,
                'AES-CBC',
                false,
                ['decrypt']
            );
            
            const decryptedCBC = await crypto.subtle.decrypt(
                { name: 'AES-CBC', iv: iv2 },
                cryptoKey2,
                decryptedChaCha
            );
            
            // فك تشفير AES-GCM
            const cryptoKey = await this.importKey(key);
            const decrypted = await crypto.subtle.decrypt(
                {
                    name: 'AES-GCM',
                    iv: iv,
                    additionalData: additionalData || new Uint8Array(0)
                },
                cryptoKey,
                new Uint8Array(decryptedCBC)
            );
            
            return new Uint8Array(decrypted);
        } catch (error) {
            this.errorHandler.log(error, 'Triple Layer Decryption');
            throw error;
        }
    }
    
    /**
     * فك تشفير أربع طبقات
     */
    async decryptQuadLayer(data, key, iv, additionalData = null) {
        try {
            // إزالة البيانات المضللة
            const withoutMisleading = data.slice(1536); // افتراضياً 1536 بايت
            
            // إزالة التشويش
            const deobfuscated = this.deobfuscateData(withoutMisleading);
            
            // فك تشفير ثلاثي الطبقات
            const decrypted = await this.decryptTripleLayer(
                deobfuscated,
                key,
                iv,
                additionalData
            );
            
            // إزالة التشويش الأولي
            const finalDeobfuscated = this.deobfuscateData(decrypted);
            
            return finalDeobfuscated;
        } catch (error) {
            this.errorHandler.log(error, 'Quad Layer Decryption');
            throw error;
        }
    }
    
    /**
     * إزالة تشويش البيانات
     */
    deobfuscateData(data) {
        // نفس التشفير (XOR متناظر)
        return this.obfuscateData(data);
    }
    
    // ============================================================================
    // UTILITY FUNCTIONS
    // ============================================================================
    
    /**
     * قراءة الملف كمصفوفة بايتات
     */
    readFileAsBuffer(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (event) => {
                resolve(new Uint8Array(event.target.result));
            };
            
            reader.onerror = (error) => {
                reject(error);
            };
            
            reader.readAsArrayBuffer(file);
        });
    }
    
    /**
     * التحقق مما إذا كان الملف مضغوطاً مسبقاً
     */
    isAlreadyCompressed(file) {
        const compressedExtensions = ['.zip', '.rar', '.7z', '.gz', '.bz2', '.xz', '.z'];
        const compressedTypes = [
            'application/zip',
            'application/x-rar-compressed',
            'application/x-7z-compressed',
            'application/gzip',
            'application/x-bzip2',
            'application/x-xz',
            'image/jpeg',
            'image/png',
            'image/webp',
            'video/mp4',
            'video/webm',
            'audio/mpeg',
            'audio/ogg'
        ];
        
        return compressedExtensions.some(ext => file.name.endsWith(ext)) ||
               compressedTypes.includes(file.type);
    }
    
    /**
     * ضغط البيانات
     */
    async compressData(data) {
        try {
            // استخدام Compression Streams API إذا متاحة
            if (window.CompressionStream) {
                const cs = new CompressionStream('deflate');
                const writer = cs.writable.getWriter();
                writer.write(data);
                writer.close();
                
                const compressed = await new Response(cs.readable).arrayBuffer();
                return new Uint8Array(compressed);
            }
            
            // استخدام pako كبديل
            if (typeof pako !== 'undefined') {
                const compressed = pako.deflate(data);
                return compressed;
            }
            
            // عدم الضغط إذا لم توجد مكتبة
            console.warn('Compression not available, using uncompressed data');
            return data;
        } catch (error) {
            console.warn('Compression failed:', error);
            return data;
        }
    }
    
    /**
     * فك ضغط البيانات
     */
    async decompressData(data) {
        try {
            // استخدام Decompression Streams API إذا متاحة
            if (window.DecompressionStream) {
                const ds = new DecompressionStream('deflate');
                const writer = ds.writable.getWriter();
                writer.write(data);
                writer.close();
                
                const decompressed = await new Response(ds.readable).arrayBuffer();
                return new Uint8Array(decompressed);
            }
            
            // استخدام pako كبديل
            if (typeof pako !== 'undefined') {
                const decompressed = pako.inflate(data);
                return decompressed;
            }
            
            // عدم فك الضغط إذا لم توجد مكتبة
            console.warn('Decompression not available, using compressed data');
            return data;
        } catch (error) {
            console.warn('Decompression failed:', error);
            return data;
        }
    }
    
    /**
     * إنشاء بيانات وصفية
     */
    createMetadata(file, securityLevel, options) {
        return {
            filename: options.hideFilenames ? this.generateRandomFilename() : file.name,
            originalSize: file.size,
            timestamp: new Date().toISOString(),
            securityLevel: securityLevel,
            algorithm: this.securityLevels[securityLevel].algorithms.join('+'),
            iterations: this.securityLevels[securityLevel].iterations,
            layers: this.securityLevels[securityLevel].layers,
            compressed: options.compress || false,
            version: '4.2.0',
            tool: 'CipherVault 3D Pro'
        };
    }
    
    /**
     * توليد اسم ملف عشوائي
     */
    generateRandomFilename() {
        const prefix = 'encrypted_';
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substr(2, 8);
        return `${prefix}${timestamp}_${random}.cvault`;
    }
    
    /**
     * استيراد مفتاح
     */
    async importKey(keyBuffer) {
        return await crypto.subtle.importKey(
            'raw',
            keyBuffer,
            'AES-GCM',
            false,
            ['encrypt', 'decrypt']
        );
    }
    
    /**
     * إنشاء HMAC
     */
    async createHMAC(data, key) {
        try {
            const hmacKey = await crypto.subtle.importKey(
                'raw',
                key,
                { name: 'HMAC', hash: 'SHA-512' },
                false,
                ['sign']
            );
            
            const signature = await crypto.subtle.sign(
                'HMAC',
                hmacKey,
                data
            );
            
            return new Uint8Array(signature);
        } catch (error) {
            this.errorHandler.log(error, 'HMAC Creation');
            throw error;
        }
    }
    
    /**
     * التحقق من HMAC
     */
    async verifyHMAC(data, hmac, password, salt) {
        try {
            const key = await this.deriveKey(password, salt, 100000);
            const hmacKey = await crypto.subtle.importKey(
                'raw',
                key,
                { name: 'HMAC', hash: 'SHA-512' },
                false,
                ['verify']
            );
            
            const isValid = await crypto.subtle.verify(
                'HMAC',
                hmacKey,
                hmac,
                data
            );
            
            this.secureWipe(key);
            return isValid;
        } catch (error) {
            this.errorHandler.log(error, 'HMAC Verification');
            return false;
        }
    }
    
    /**
     * تجميع البيانات المشفرة
     */
    assembleEncryptedData(encryptedData, salt, iv, hmac, metadata, securityLevel) {
        const header = this.createHeader(securityLevel);
        const metadataLength = new Uint8Array(4);
        new DataView(metadataLength.buffer).setUint32(0, metadata.length, false);
        
        const totalLength = 
            header.length +
            salt.length +
            iv.length +
            metadataLength.length +
            metadata.length +
            hmac.length +
            encryptedData.length;
        
        const assembled = new Uint8Array(totalLength);
        let offset = 0;
        
        assembled.set(header, offset); offset += header.length;
        assembled.set(salt, offset); offset += salt.length;
        assembled.set(iv, offset); offset += iv.length;
        assembled.set(metadataLength, offset); offset += metadataLength.length;
        assembled.set(metadata, offset); offset += metadata.length;
        assembled.set(hmac, offset); offset += hmac.length;
        assembled.set(encryptedData, offset);
        
        return assembled;
    }
    
    /**
     * إنشاء رأس الملف
     */
    createHeader(securityLevel) {
        const encoder = new TextEncoder();
        const magic = encoder.encode('CVPRO');
        const version = new Uint8Array([4, 2, 0]);
        
        const levelMap = { BASIC: 1, MEDIUM: 2, HIGH: 3, MILITARY: 4 };
        const level = new Uint8Array([levelMap[securityLevel] || 2]);
        
        const header = new Uint8Array(magic.length + version.length + level.length);
        header.set(magic, 0);
        header.set(version, magic.length);
        header.set(level, magic.length + version.length);
        
        return header;
    }
    
    /**
     * تحليل البيانات المشفرة
     */
    parseEncryptedData(data) {
        const view = new DataView(data.buffer || data);
        let offset = 0;
        
        // قراءة الرأس
        const magic = String.fromCharCode(...data.slice(offset, offset + 5));
        offset += 5;
        
        if (magic !== 'CVPRO') {
            throw new Error('Invalid file format - not a CipherVault file');
        }
        
        // قراءة الإصدار
        const version = `${data[offset]}.${data[offset+1]}.${data[offset+2]}`;
        offset += 3;
        
        // قراءة مستوى الأمان
        const levelMap = { 1: 'BASIC', 2: 'MEDIUM', 3: 'HIGH', 4: 'MILITARY' };
        const securityLevel = levelMap[data[offset]] || 'MEDIUM';
        offset += 1;
        
        // قراءة الملح (32 بايت)
        const salt = data.slice(offset, offset + 32);
        offset += 32;
        
        // قراءة IV (حسب مستوى الأمان)
        const ivSize = this.securityLevels[securityLevel].ivSize;
        const iv = data.slice(offset, offset + ivSize);
        offset += ivSize;
        
        // قراءة طول البيانات الوصفية
        const metadataLength = view.getUint32(offset, false);
        offset += 4;
        
        // قراءة البيانات الوصفية
        const metadataBuffer = data.slice(offset, offset + metadataLength);
        offset += metadataLength;
        const metadata = JSON.parse(new TextDecoder().decode(metadataBuffer));
        
        // قراءة HMAC (64 بايت لـ SHA-512)
        const hmac = data.slice(offset, offset + 64);
        offset += 64;
        
        // باقي البيانات هي البيانات المشفرة
        const encryptedData = data.slice(offset);
        
        return {
            magic,
            version,
            securityLevel,
            salt,
            iv,
            metadata,
            hmac,
            encryptedData,
            iterations: this.securityLevels[securityLevel].iterations
        };
    }
    
    /**
     * تحديث إحصائيات الأداء
     */
    updatePerformanceStats(size, operation) {
        const endTime = performance.now();
        const duration = endTime - this.progress.startTime;
        const speed = size / (duration / 1000); // بايت في الثانية
        
        if (operation === 'encryption') {
            this.performance.encryptionTimes.push(duration);
        } else {
            this.performance.decryptionTimes.push(duration);
        }
        
        this.performance.memoryUsage.push(performance.memory?.usedJSHeapSize || 0);
        
        // حساب متوسط السرعة
        const times = operation === 'encryption' ? 
            this.performance.encryptionTimes : 
            this.performance.decryptionTimes;
        
        if (times.length > 10) {
            times.shift();
            this.performance.memoryUsage.shift();
        }
        
        const avgDuration = times.reduce((a, b) => a + b, 0) / times.length;
        this.performance.averageSpeed = size / (avgDuration / 1000);
    }
    
    /**
     * مسح ذاكرة آمن
     */
    secureWipe(buffer) {
        if (!buffer || !buffer.length) return;
        
        try {
            // مسح متعدد الطبقات
            if (buffer instanceof ArrayBuffer || ArrayBuffer.isView(buffer)) {
                // كتابة أصفار
                new Uint8Array(buffer).fill(0);
                
                // كتابة بيانات عشوائية
                const randomData = new Uint8Array(buffer.byteLength);
                crypto.getRandomValues(randomData);
                new Uint8Array(buffer).set(randomData);
                
                // كتابة 0xFF
                new Uint8Array(buffer).fill(0xFF);
                
                // كتابة أصفار نهائية
                new Uint8Array(buffer).fill(0);
                
                // جعل الكائن غير قابل للكتابة
                if (Object.isFrozen) {
                    Object.freeze(buffer);
                }
            }
        } catch (error) {
            console.warn('Secure wipe failed:', error);
        }
    }
    
    /**
     * الحصول على حالة التقدم الحالية
     */
    getProgress() {
        return {
            ...this.progress,
            operation: this.currentOperation,
            estimatedTime: this.estimateRemainingTime()
        };
    }
    
    /**
     * تقدير الوقت المتبقي
     */
    estimateRemainingTime() {
        if (!this.progress.startTime || this.progress.total === 0) {
            return 0;
        }
        
        const elapsed = performance.now() - this.progress.startTime;
        const percent = this.progress.current / this.progress.total;
        
        if (percent === 0) return 0;
        
        const totalTime = elapsed / percent;
        const remaining = totalTime - elapsed;
        
        return Math.max(0, remaining);
    }
    
    /**
     * الحصول على تقرير الأداء
     */
    getPerformanceReport() {
        const encryptionAvg = this.performance.encryptionTimes.length > 0 ?
            this.performance.encryptionTimes.reduce((a, b) => a + b, 0) / 
            this.performance.encryptionTimes.length : 0;
        
        const decryptionAvg = this.performance.decryptionTimes.length > 0 ?
            this.performance.decryptionTimes.reduce((a, b) => a + b, 0) / 
            this.performance.decryptionTimes.length : 0;
        
        const memoryAvg = this.performance.memoryUsage.length > 0 ?
            this.performance.memoryUsage.reduce((a, b) => a + b, 0) / 
            this.performance.memoryUsage.length : 0;
        
        return {
            encryption: {
                averageTime: encryptionAvg,
                operations: this.performance.encryptionTimes.length,
                averageSpeed: this.performance.averageSpeed
            },
            decryption: {
                averageTime: decryptionAvg,
                operations: this.performance.decryptionTimes.length,
                averageSpeed: this.performance.averageSpeed
            },
            memory: {
                averageUsage: Math.round(memoryAvg / 1024 / 1024) + ' MB',
                samples: this.performance.memoryUsage.length
            },
            errors: this.errorHandler.errors.length
        };
    }
}

// Export for global use
window.CipherVaultCrypto = window.CipherVaultCrypto || new CryptoCoreEnhanced();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CryptoCoreEnhanced;
}
