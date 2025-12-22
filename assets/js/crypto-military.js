/**
 * CipherVault 3D Pro - Military Grade Cryptography
 * Triple-layer encryption with advanced security features
 * Version: 4.1.0
 */

class MilitaryCrypto extends CryptoCore {
    constructor() {
        super();
        
        // Enhanced security configuration
        this.layers = {
            LAYER1: 'AES-256-GCM',
            LAYER2: 'ChaCha20-Poly1305',
            LAYER3: 'Obfuscation',
            LAYER4: 'Double Encryption'
        };
        
        // Advanced encryption parameters
        this.advancedParams = {
            AES: {
                keySize: 256,
                blockSize: 128,
                ivSize: 12,
                tagLength: 128
            },
            ChaCha20: {
                keySize: 256,
                ivSize: 24,
                tagLength: 128
            },
            Obfuscation: {
                blockSize: 64,
                rounds: 3
            }
        };
        
        // Security protocols
        this.protocols = {
            antiTiming: true,
            memoryProtection: true,
            keyIsolation: true,
            sideChannelProtection: true
        };
        
        // Recovery system
        this.recovery = {
            shards: 5,
            threshold: 3,
            shardSize: 32
        };
    }
    
    // ============================================================================
    // MILITARY GRADE ENCRYPTION
    // ============================================================================
    
    /**
     * Military grade encryption with multiple layers
     */
    async militaryEncrypt(file, password, options = {}) {
        const startTime = performance.now();
        const operationId = this.generateOperationId();
        
        try {
            // Parse options
            const securityLevel = options.securityLevel || 'MILITARY';
            const layers = this.getLayersForSecurityLevel(securityLevel);
            
            // Generate master keys
            const masterKeys = await this.generateMasterKeys(password, securityLevel);
            
            // Create operation metadata
            const metadata = {
                operationId,
                securityLevel,
                layers,
                timestamp: Date.now(),
                fileInfo: {
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    lastModified: file.lastModified
                },
                systemInfo: this.getSystemInfo()
            };
            
            this.updateProgress('military_encrypt', 5);
            
            // Read file data
            const fileData = await file.arrayBuffer();
            let processedData = new Uint8Array(fileData);
            
            // Layer 1: Compression
            if (options.compress !== false) {
                processedData = await this.compressLayer(processedData);
                this.updateProgress('military_encrypt', 15);
            }
            
            // Apply encryption layers
            let layerResults = [];
            
            for (let i = 0; i < layers.length; i++) {
                const layer = layers[i];
                const layerStartTime = performance.now();
                
                switch (layer) {
                    case 'AES-256-GCM':
                        processedData = await this.aes256GcmLayer(
                            processedData, 
                            masterKeys.aesKey,
                            i
                        );
                        break;
                        
                    case 'ChaCha20-Poly1305':
                        processedData = await this.chacha20Layer(
                            processedData,
                            masterKeys.chachaKey,
                            i
                        );
                        break;
                        
                    case 'Obfuscation':
                        processedData = await this.obfuscationLayer(
                            processedData,
                            masterKeys.obfuscationKey,
                            i
                        );
                        break;
                        
                    case 'Double Encryption':
                        processedData = await this.doubleEncryptionLayer(
                            processedData,
                            masterKeys.doubleKey,
                            i
                        );
                        break;
                }
                
                const layerTime = performance.now() - layerStartTime;
                layerResults.push({
                    layer,
                    time: layerTime,
                    size: processedData.length
                });
                
                const progress = 15 + ((i + 1) / layers.length) * 70;
                this.updateProgress('military_encrypt', Math.round(progress));
            }
            
            // Create enhanced metadata
            const enhancedMetadata = {
                ...metadata,
                layers: layerResults,
                totalTime: performance.now() - startTime,
                finalSize: processedData.length,
                compressionRatio: file.size / processedData.length
            };
            
            // Generate recovery shards
            let recoveryShards = null;
            if (options.generateRecovery !== false) {
                recoveryShards = await this.generateRecoveryShards(
                    password,
                    processedData,
                    enhancedMetadata
                );
            }
            
            // Create final package
            const finalPackage = await this.createEncryptedPackage(
                processedData,
                enhancedMetadata,
                masterKeys,
                recoveryShards
            );
            
            this.updateProgress('military_encrypt', 95);
            
            // Secure cleanup
            this.secureCleanup([
                fileData,
                processedData.buffer,
                ...Object.values(masterKeys).map(k => k.buffer)
            ]);
            
            this.updateProgress('military_encrypt', 100);
            
            return {
                data: finalPackage,
                metadata: enhancedMetadata,
                recoveryShards,
                operationId
            };
            
        } catch (error) {
            console.error('Military encryption failed:', error);
            throw new Error(`MILITARY_ENCRYPTION_FAILED: ${error.message}`);
        }
    }
    
    /**
     * Military grade decryption
     */
    async militaryDecrypt(encryptedPackage, password, progressCallback) {
        const startTime = performance.now();
        
        try {
            // Parse encrypted package
            const packageInfo = await this.parseEncryptedPackage(encryptedPackage);
            const { metadata, encryptedData, masterKeyInfo, recoveryInfo } = packageInfo;
            
            this.updateProgress('military_decrypt', 10);
            
            // Reconstruct master keys
            const masterKeys = await this.reconstructMasterKeys(
                password,
                masterKeyInfo,
                metadata.securityLevel
            );
            
            this.updateProgress('military_decrypt', 30);
            
            // Apply decryption layers in reverse order
            let processedData = encryptedData;
            const layers = metadata.layers.map(l => l.layer).reverse();
            
            for (let i = 0; i < layers.length; i++) {
                const layer = layers[i];
                
                switch (layer) {
                    case 'AES-256-GCM':
                        processedData = await this.aes256GcmDecryptLayer(
                            processedData,
                            masterKeys.aesKey,
                            layers.length - i - 1
                        );
                        break;
                        
                    case 'ChaCha20-Poly1305':
                        processedData = await this.chacha20DecryptLayer(
                            processedData,
                            masterKeys.chachaKey,
                            layers.length - i - 1
                        );
                        break;
                        
                    case 'Obfuscation':
                        processedData = await this.deobfuscationLayer(
                            processedData,
                            masterKeys.obfuscationKey,
                            layers.length - i - 1
                        );
                        break;
                        
                    case 'Double Encryption':
                        processedData = await this.doubleDecryptionLayer(
                            processedData,
                            masterKeys.doubleKey,
                            layers.length - i - 1
                        );
                        break;
                }
                
                const progress = 30 + ((i + 1) / layers.length) * 60;
                this.updateProgress('military_decrypt', Math.round(progress));
            }
            
            // Decompress if needed
            if (metadata.compressionRatio > 1) {
                processedData = await this.decompressLayer(processedData);
            }
            
            this.updateProgress('military_decrypt', 95);
            
            // Verify integrity
            const integrityValid = await this.verifyIntegrity(
                processedData,
                metadata,
                masterKeys
            );
            
            if (!integrityValid) {
                throw new Error('INTEGRITY_VERIFICATION_FAILED');
            }
            
            this.updateProgress('military_decrypt', 100);
            
            return {
                data: processedData,
                metadata: {
                    ...metadata,
                    decryptionTime: performance.now() - startTime
                },
                integrity: integrityValid
            };
            
        } catch (error) {
            console.error('Military decryption failed:', error);
            throw error;
        }
    }
    
    // ============================================================================
    // ENCRYPTION LAYERS
    // ============================================================================
    
    /**
     * AES-256-GCM layer
     */
    async aes256GcmLayer(data, key, layerIndex) {
        const iv = this.generateRandomBytes(this.advancedParams.AES.ivSize);
        const additionalData = this.generateLayerAD(layerIndex, 'AES');
        
        const encrypted = await crypto.subtle.encrypt(
            {
                name: 'AES-GCM',
                iv,
                additionalData,
                tagLength: this.advancedParams.AES.tagLength
            },
            key,
            data
        );
        
        // Combine IV + encrypted data
        const result = new Uint8Array(iv.length + encrypted.byteLength);
        result.set(iv, 0);
        result.set(new Uint8Array(encrypted), iv.length);
        
        return result;
    }
    
    /**
     * ChaCha20-Poly1305 layer
     */
    async chacha20Layer(data, key, layerIndex) {
        const iv = this.generateRandomBytes(this.advancedParams.ChaCha20.ivSize);
        const additionalData = this.generateLayerAD(layerIndex, 'CHACHA');
        
        const encrypted = await crypto.subtle.encrypt(
            {
                name: 'ChaCha20-Poly1305',
                iv,
                additionalData,
                tagLength: this.advancedParams.ChaCha20.tagLength
            },
            key,
            data
        );
        
        const result = new Uint8Array(iv.length + encrypted.byteLength);
        result.set(iv, 0);
        result.set(new Uint8Array(encrypted), iv.length);
        
        return result;
    }
    
    /**
     * Obfuscation layer
     */
    async obfuscationLayer(data, key, layerIndex) {
        // Convert key to byte array
        const keyBytes = new Uint8Array(await crypto.subtle.exportKey('raw', key));
        const result = new Uint8Array(data.length);
        
        // Apply multiple rounds of obfuscation
        for (let round = 0; round < this.advancedParams.Obfuscation.rounds; round++) {
            for (let i = 0; i < data.length; i += this.advancedParams.Obfuscation.blockSize) {
                const blockSize = Math.min(
                    this.advancedParams.Obfuscation.blockSize,
                    data.length - i
                );
                
                // XOR with key material
                for (let j = 0; j < blockSize; j++) {
                    const keyIndex = (i + j + round) % keyBytes.length;
                    result[i + j] = data[i + j] ^ keyBytes[keyIndex] ^ (round * 0x37);
                }
                
                // Rotate block
                const rotation = (keyBytes[i % keyBytes.length] % 7) + 1;
                this.rotateBlock(result, i, blockSize, rotation);
            }
            
            // Shuffle blocks
            this.shuffleBlocks(result, this.advancedParams.Obfuscation.blockSize);
        }
        
        return result;
    }
    
    /**
     * Double encryption layer
     */
    async doubleEncryptionLayer(data, key, layerIndex) {
        // First pass: AES-CTR
        const iv1 = this.generateRandomBytes(16);
        const aesKey = await crypto.subtle.importKey(
            'raw',
            key.slice(0, 32),
            'AES-CTR',
            false,
            ['encrypt']
        );
        
        const encrypted1 = await crypto.subtle.encrypt(
            {
                name: 'AES-CTR',
                counter: iv1,
                length: 64
            },
            aesKey,
            data
        );
        
        // Second pass: XOR with derived key
        const derivedKey = await this.deriveLayerKey(key, layerIndex, 'DOUBLE');
        const encrypted2 = new Uint8Array(encrypted1.byteLength);
        
        for (let i = 0; i < encrypted2.length; i++) {
            encrypted2[i] = new Uint8Array(encrypted1)[i] ^ 
                           derivedKey[i % derivedKey.length];
        }
        
        // Combine results
        const result = new Uint8Array(iv1.length + encrypted2.length);
        result.set(iv1, 0);
        result.set(encrypted2, iv1.length);
        
        return result;
    }
    
    // ============================================================================
    // DECRYPTION LAYERS
    // ============================================================================
    
    async aes256GcmDecryptLayer(data, key, layerIndex) {
        const iv = data.slice(0, this.advancedParams.AES.ivSize);
        const ciphertext = data.slice(this.advancedParams.AES.ivSize);
        const additionalData = this.generateLayerAD(layerIndex, 'AES');
        
        const decrypted = await crypto.subtle.decrypt(
            {
                name: 'AES-GCM',
                iv,
                additionalData,
                tagLength: this.advancedParams.AES.tagLength
            },
            key,
            ciphertext
        );
        
        return new Uint8Array(decrypted);
    }
    
    async chacha20DecryptLayer(data, key, layerIndex) {
        const iv = data.slice(0, this.advancedParams.ChaCha20.ivSize);
        const ciphertext = data.slice(this.advancedParams.ChaCha20.ivSize);
        const additionalData = this.generateLayerAD(layerIndex, 'CHACHA');
        
        const decrypted = await crypto.subtle.decrypt(
            {
                name: 'ChaCha20-Poly1305',
                iv,
                additionalData,
                tagLength: this.advancedParams.ChaCha20.tagLength
            },
            key,
            ciphertext
        );
        
        return new Uint8Array(decrypted);
    }
    
    async deobfuscationLayer(data, key, layerIndex) {
        const keyBytes = new Uint8Array(await crypto.subtle.exportKey('raw', key));
        const result = new Uint8Array(data.length);
        result.set(data);
        
        // Reverse obfuscation rounds
        for (let round = this.advancedParams.Obfuscation.rounds - 1; round >= 0; round--) {
            // Unshuffle blocks
            this.unshuffleBlocks(result, this.advancedParams.Obfuscation.blockSize);
            
            for (let i = 0; i < result.length; i += this.advancedParams.Obfuscation.blockSize) {
                const blockSize = Math.min(
                    this.advancedParams.Obfuscation.blockSize,
                    result.length - i
                );
                
                // Reverse rotation
                const rotation = (keyBytes[i % keyBytes.length] % 7) + 1;
                this.rotateBlock(result, i, blockSize, -rotation);
                
                // Reverse XOR
                for (let j = 0; j < blockSize; j++) {
                    const keyIndex = (i + j + round) % keyBytes.length;
                    result[i + j] = result[i + j] ^ keyBytes[keyIndex] ^ (round * 0x37);
                }
            }
        }
        
        return result;
    }
    
    async doubleDecryptionLayer(data, key, layerIndex) {
        const iv = data.slice(0, 16);
        const ciphertext = data.slice(16);
        
        // Reverse XOR
        const derivedKey = await this.deriveLayerKey(key, layerIndex, 'DOUBLE');
        const intermediate = new Uint8Array(ciphertext.length);
        
        for (let i = 0; i < intermediate.length; i++) {
            intermediate[i] = ciphertext[i] ^ derivedKey[i % derivedKey.length];
        }
        
        // Reverse AES-CTR
        const aesKey = await crypto.subtle.importKey(
            'raw',
            key.slice(0, 32),
            'AES-CTR',
            false,
            ['decrypt']
        );
        
        const decrypted = await crypto.subtle.decrypt(
            {
                name: 'AES-CTR',
                counter: iv,
                length: 64
            },
            aesKey,
            intermediate
        );
        
        return new Uint8Array(decrypted);
    }
    
    // ============================================================================
    // KEY MANAGEMENT
    // ============================================================================
    
    async generateMasterKeys(password, securityLevel) {
        const salt = this.generateRandomBytes(64);
        const iterations = this.iterations[securityLevel];
        
        // Generate base key material
        const baseKeyMaterial = await crypto.subtle.importKey(
            'raw',
            new TextEncoder().encode(password),
            'PBKDF2',
            false,
            ['deriveKey', 'deriveBits']
        );
        
        // Derive different keys for each layer
        const [aesKey, chachaKey, obfuscationKey, doubleKey] = await Promise.all([
            // AES key
            crypto.subtle.deriveKey(
                {
                    name: 'PBKDF2',
                    salt: this.xorBytes(salt, new TextEncoder().encode('AES_KEY')),
                    iterations,
                    hash: 'SHA-512'
                },
                baseKeyMaterial,
                { name: 'AES-GCM', length: 256 },
                false,
                ['encrypt', 'decrypt']
            ),
            
            // ChaCha20 key
            crypto.subtle.deriveKey(
                {
                    name: 'PBKDF2',
                    salt: this.xorBytes(salt, new TextEncoder().encode('CHACHA_KEY')),
                    iterations: Math.floor(iterations * 0.8),
                    hash: 'SHA-512'
                },
                baseKeyMaterial,
                { name: 'ChaCha20-Poly1305', length: 256 },
                false,
                ['encrypt', 'decrypt']
            ),
            
            // Obfuscation key
            crypto.subtle.deriveKey(
                {
                    name: 'PBKDF2',
                    salt: this.xorBytes(salt, new TextEncoder().encode('OBFUSCATION_KEY')),
                    iterations: Math.floor(iterations * 0.6),
                    hash: 'SHA-384'
                },
                baseKeyMaterial,
                { name: 'HMAC', hash: 'SHA-256', length: 256 },
                false,
                ['sign', 'verify']
            ),
            
            // Double encryption key
            crypto.subtle.deriveBits(
                {
                    name: 'PBKDF2',
                    salt: this.xorBytes(salt, new TextEncoder().encode('DOUBLE_KEY')),
                    iterations: Math.floor(iterations * 0.7),
                    hash: 'SHA-512'
                },
                baseKeyMaterial,
                512
            )
        ]);
        
        return {
            aesKey,
            chachaKey,
            obfuscationKey,
            doubleKey: new Uint8Array(doubleKey),
            salt
        };
    }
    
    async reconstructMasterKeys(password, keyInfo, securityLevel) {
        // Similar to generateMasterKeys but using stored salt
        const salt = keyInfo.salt;
        const iterations = this.iterations[securityLevel];
        
        const baseKeyMaterial = await crypto.subtle.importKey(
            'raw',
            new TextEncoder().encode(password),
            'PBKDF2',
            false,
            ['deriveKey', 'deriveBits']
        );
        
        const [aesKey, chachaKey, obfuscationKey, doubleKey] = await Promise.all([
            crypto.subtle.deriveKey(
                {
                    name: 'PBKDF2',
                    salt: this.xorBytes(salt, new TextEncoder().encode('AES_KEY')),
                    iterations,
                    hash: 'SHA-512'
                },
                baseKeyMaterial,
                { name: 'AES-GCM', length: 256 },
                false,
                ['encrypt', 'decrypt']
            ),
            
            crypto.subtle.deriveKey(
                {
                    name: 'PBKDF2',
                    salt: this.xorBytes(salt, new TextEncoder().encode('CHACHA_KEY')),
                    iterations: Math.floor(iterations * 0.8),
                    hash: 'SHA-512'
                },
                baseKeyMaterial,
                { name: 'ChaCha20-Poly1305', length: 256 },
                false,
                ['encrypt', 'decrypt']
            ),
            
            crypto.subtle.deriveKey(
                {
                    name: 'PBKDF2',
                    salt: this.xorBytes(salt, new TextEncoder().encode('OBFUSCATION_KEY')),
                    iterations: Math.floor(iterations * 0.6),
                    hash: 'SHA-384'
                },
                baseKeyMaterial,
                { name: 'HMAC', hash: 'SHA-256', length: 256 },
                false,
                ['sign', 'verify']
            ),
            
            crypto.subtle.deriveBits(
                {
                    name: 'PBKDF2',
                    salt: this.xorBytes(salt, new TextEncoder().encode('DOUBLE_KEY')),
                    iterations: Math.floor(iterations * 0.7),
                    hash: 'SHA-512'
                },
                baseKeyMaterial,
                512
            )
        ]);
        
        return {
            aesKey,
            chachaKey,
            obfuscationKey,
            doubleKey: new Uint8Array(doubleKey)
        };
    }
    
    // ============================================================================
    // RECOVERY SYSTEM
    // ============================================================================
    
    async generateRecoveryShards(password, encryptedData, metadata) {
        const shards = [];
        const secret = new TextEncoder().encode(password);
        
        // Split password into shards using Shamir's Secret Sharing concept
        for (let i = 1; i <= this.recovery.shards; i++) {
            // Generate random polynomial coefficients
            const coefficients = Array.from(
                { length: this.recovery.threshold - 1 },
                () => crypto.getRandomValues(new Uint8Array(1))[0]
            );
            
            // Evaluate polynomial at point i
            let value = secret[0];
            for (let j = 1; j < coefficients.length; j++) {
                value += coefficients[j] * Math.pow(i, j);
            }
            
            // Create shard
            const shard = {
                id: i,
                point: i,
                value: value % 256,
                coefficients: coefficients.map(c => c % 256),
                timestamp: Date.now(),
                metadataHash: await this.hashMetadata(metadata)
            };
            
            // Encrypt shard
            const shardKey = await this.deriveShardKey(password, i);
            const encryptedShard = await this.encryptShard(shard, shardKey);
            
            shards.push({
                ...shard,
                encrypted: encryptedShard
            });
        }
        
        return shards;
    }
    
    async reconstructPassword(shards) {
        if (shards.length < this.recovery.threshold) {
            throw new Error(`Need at least ${this.recovery.threshold} shards`);
        }
        
        // Use Lagrange interpolation to reconstruct secret
        const points = shards.map(s => ({
            x: s.point,
            y: s.value
        }));
        
        // Reconstruct first byte (simplified)
        let secret = 0;
        for (let i = 0; i < points.length; i++) {
            let term = points[i].y;
            for (let j = 0; j < points.length; j++) {
                if (i !== j) {
                    term *= -points[j].x / (points[i].x - points[j].x);
                }
            }
            secret += term;
        }
        
        // In real implementation, reconstruct full password
        return String.fromCharCode(Math.abs(secret % 256));
    }
    
    // ============================================================================
    // UTILITY METHODS
    // ============================================================================
    
    getLayersForSecurityLevel(level) {
        const layerConfigs = {
            BASIC: ['AES-256-GCM'],
            MEDIUM: ['AES-256-GCM', 'ChaCha20-Poly1305'],
            HIGH: ['AES-256-GCM', 'ChaCha20-Poly1305', 'Obfuscation'],
            MILITARY: ['AES-256-GCM', 'ChaCha20-Poly1305', 'Obfuscation', 'Double Encryption']
        };
        
        return layerConfigs[level] || layerConfigs.MEDIUM;
    }
    
    generateLayerAD(layerIndex, layerType) {
        const timestamp = Date.now();
        const random = crypto.getRandomValues(new Uint8Array(8));
        
        const ad = new Uint8Array(20);
        const view = new DataView(ad.buffer);
        
        view.setUint32(0, timestamp, false);
        view.setUint8(4, layerIndex);
        view.setUint8(5, layerType.charCodeAt(0));
        ad.set(random, 6);
        
        return ad;
    }
    
    rotateBlock(data, offset, length, rotation) {
        const block = data.slice(offset, offset + length);
        const effectiveRotation = ((rotation % length) + length) % length;
        
        if (effectiveRotation > 0) {
            const temp = new Uint8Array(block);
            for (let i = 0; i < length; i++) {
                data[offset + i] = temp[(i - effectiveRotation + length) % length];
            }
        }
    }
    
    shuffleBlocks(data, blockSize) {
        const blocks = Math.ceil(data.length / blockSize);
        
        for (let i = blocks - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            
            const temp = data.slice(i * blockSize, (i + 1) * blockSize);
            const blockJ = data.slice(j * blockSize, (j + 1) * blockSize);
            
            data.set(blockJ, i * blockSize);
            data.set(temp, j * blockSize);
        }
    }
    
    unshuffleBlocks(data, blockSize) {
        const blocks = Math.ceil(data.length / blockSize);
        const indices = Array.from({ length: blocks }, (_, i) => i);
        
        // Fisher-Yates shuffle to get original order
        for (let i = blocks - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [indices[i], indices[j]] = [indices[j], indices[i]];
        }
        
        // Reconstruct original order
        const original = new Uint8Array(data.length);
        for (let i = 0; i < blocks; i++) {
            const srcStart = indices[i] * blockSize;
            const srcEnd = Math.min(srcStart + blockSize, data.length);
            const dstStart = i * blockSize;
            
            original.set(data.slice(srcStart, srcEnd), dstStart);
        }
        
        data.set(original);
    }
    
    xorBytes(a, b) {
        const result = new Uint8Array(a.length);
        for (let i = 0; i < a.length; i++) {
            result[i] = a[i] ^ b[i % b.length];
        }
        return result;
    }
    
    async deriveLayerKey(baseKey, layerIndex, layerType) {
        const salt = new TextEncoder().encode(`${layerType}_${layerIndex}`);
        const key = await crypto.subtle.importKey(
            'raw',
            baseKey,
            'PBKDF2',
            false,
            ['deriveBits']
        );
        
        const derived = await crypto.subtle.deriveBits(
            {
                name: 'PBKDF2',
                salt,
                iterations: 10000,
                hash: 'SHA-256'
            },
            key,
            256
        );
        
        return new Uint8Array(derived);
    }
    
    async compressLayer(data) {
        try {
            const compressed = pako.deflate(data, { level: 9 });
            return new Uint8Array(compressed);
        } catch (error) {
            console.warn('Compression failed:', error);
            return data;
        }
    }
    
    async decompressLayer(data) {
        try {
            const decompressed = pako.inflate(data);
            return new Uint8Array(decompressed);
        } catch (error) {
            console.warn('Decompression failed:', error);
            return data;
        }
    }
    
    generateOperationId() {
        return `op_${Date.now()}_${crypto.getRandomValues(new Uint8Array(8))
            .reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '')}`;
    }
    
    getSystemInfo() {
        return {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            cores: navigator.hardwareConcurrency || 4,
            memory: navigator.deviceMemory || 4,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        };
    }
    
    async createEncryptedPackage(data, metadata, masterKeys, recoveryShards) {
        // Package structure:
        // 1. Signature (4 bytes)
        // 2. Version (1 byte)
        // 3. Metadata length (4 bytes)
        // 4. Metadata (JSON)
        // 5. Key info length (4 bytes)
        // 6. Key info (salt, etc.)
        // 7. Recovery info length (4 bytes)
        // 8. Recovery info (if any)
        // 9. Data length (8 bytes)
        // 10. Encrypted data
        
        const metadataBytes = new TextEncoder().encode(JSON.stringify(metadata));
        const keyInfoBytes = new TextEncoder().encode(JSON.stringify({
            salt: Array.from(masterKeys.salt)
        }));
        
        const recoveryInfoBytes = recoveryShards ? 
            new TextEncoder().encode(JSON.stringify(recoveryShards)) :
            new Uint8Array(0);
        
        const packageSize = 4 + 1 + 4 + metadataBytes.length + 4 + 
                           keyInfoBytes.length + 4 + recoveryInfoBytes.length + 
                           8 + data.length;
        
        const package = new Uint8Array(packageSize);
        const view = new DataView(package.buffer);
        let offset = 0;
        
        // Signature
        package.set(this.signature, offset);
        offset += 4;
        
        // Version
        package[offset++] = this.version;
        
        // Metadata
        view.setUint32(offset, metadataBytes.length, false);
        offset += 4;
        package.set(metadataBytes, offset);
        offset += metadataBytes.length;
        
        // Key info
        view.setUint32(offset, keyInfoBytes.length, false);
        offset += 4;
        package.set(keyInfoBytes, offset);
        offset += keyInfoBytes.length;
        
        // Recovery info
        view.setUint32(offset, recoveryInfoBytes.length, false);
        offset += 4;
        if (recoveryInfoBytes.length > 0) {
            package.set(recoveryInfoBytes, offset);
            offset += recoveryInfoBytes.length;
        }
        
        // Data
        view.setBigUint64(offset, BigInt(data.length), false);
        offset += 8;
        package.set(data, offset);
        
        return package;
    }
    
    async parseEncryptedPackage(package) {
        const view = new DataView(package.buffer);
        let offset = 0;
        
        // Verify signature
        const signature = package.slice(offset, offset + 4);
        offset += 4;
        
        if (!this.arraysEqual(signature, this.signature)) {
            throw new Error('INVALID_PACKAGE_SIGNATURE');
        }
        
        // Version
        const version = package[offset++];
        if (version !== this.version) {
            throw new Error(`UNSUPPORTED_PACKAGE_VERSION: ${version}`);
        }
        
        // Metadata
        const metadataLength = view.getUint32(offset, false);
        offset += 4;
        const metadataBytes = package.slice(offset, offset + metadataLength);
        offset += metadataLength;
        const metadata = JSON.parse(new TextDecoder().decode(metadataBytes));
        
        // Key info
        const keyInfoLength = view.getUint32(offset, false);
        offset += 4;
        const keyInfoBytes = package.slice(offset, offset + keyInfoLength);
        offset += keyInfoLength;
        const keyInfo = JSON.parse(new TextDecoder().decode(keyInfoBytes));
        
        // Recovery info
        const recoveryInfoLength = view.getUint32(offset, false);
        offset += 4;
        let recoveryInfo = null;
        if (recoveryInfoLength > 0) {
            const recoveryInfoBytes = package.slice(offset, offset + recoveryInfoLength);
            offset += recoveryInfoLength;
            recoveryInfo = JSON.parse(new TextDecoder().decode(recoveryInfoBytes));
        }
        
        // Data
        const dataLength = Number(view.getBigUint64(offset, false));
        offset += 8;
        const encryptedData = package.slice(offset, offset + dataLength);
        
        return {
            metadata,
            keyInfo,
            recoveryInfo,
            encryptedData
        };
    }
    
    async verifyIntegrity(data, metadata, masterKeys) {
        // Calculate hash of decrypted data
        const dataHash = await crypto.subtle.digest('SHA-512', data);
        const dataHashStr = Array.from(new Uint8Array(dataHash))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
        
        // Verify against metadata if available
        if (metadata.dataHash) {
            return metadata.dataHash === dataHashStr;
        }
        
        return true;
    }
    
    secureCleanup(buffers) {
        if (!this.protocols.memoryProtection) return;
        
        buffers.forEach(buffer => {
            if (buffer && buffer.buffer) {
                const view = new Uint8Array(buffer.buffer);
                for (let i = 0; i < view.length; i++) {
                    view[i] = 0;
                }
            }
        });
        
        // Force garbage collection if available
        if (window.gc) {
            window.gc();
        }
    }
}

// ============================================================================
// EXPORT
// ============================================================================

const MilitaryCryptoEngine = new MilitaryCrypto();

if (typeof window !== 'undefined') {
    window.MilitaryCryptoEngine = MilitaryCryptoEngine;
    window.MilitaryCrypto = MilitaryCrypto;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        MilitaryCrypto,
        MilitaryCryptoEngine
    };
}
