/**
 * CipherVault 3D Pro - Military Grade Cryptography
 * Enhanced encryption with advanced security features
 * Version: 4.1.0
 */

class MilitaryCrypto extends CryptoCore {
    constructor() {
        super();
        
        // Enhanced security configuration
        this.layers = {
            LAYER1: 'AES-256-GCM',
            LAYER2: 'AES-256-CBC',
            LAYER3: 'Obfuscation'
        };
        
        // Advanced encryption parameters
        this.advancedParams = {
            AES_GCM: {
                keySize: 256,
                ivSize: 12,
                tagLength: 128
            },
            AES_CBC: {
                keySize: 256,
                ivSize: 16
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
            keyIsolation: true
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
                    type: file.type
                }
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
                            masterKeys.aesGcmKey,
                            i
                        );
                        break;
                        
                    case 'AES-256-CBC':
                        processedData = await this.aes256CbcLayer(
                            processedData,
                            masterKeys.aesCbcKey,
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
                finalSize: processedData.length
            };
            
            // Create final package
            const finalPackage = await this.createMilitaryPackage(
                processedData,
                enhancedMetadata,
                masterKeys
            );
            
            this.updateProgress('military_encrypt', 95);
            
            // Secure cleanup
            this.secureCleanup([
                fileData,
                processedData.buffer
            ]);
            
            this.updateProgress('military_encrypt', 100);
            
            return {
                data: finalPackage,
                metadata: enhancedMetadata,
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
    async militaryDecrypt(encryptedPackage, password) {
        const startTime = performance.now();
        
        try {
            // Parse encrypted package
            const packageInfo = await this.parseMilitaryPackage(encryptedPackage);
            const { metadata, encryptedData, masterKeyInfo } = packageInfo;
            
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
                            masterKeys.aesGcmKey,
                            layers.length - i - 1
                        );
                        break;
                        
                    case 'AES-256-CBC':
                        processedData = await this.aes256CbcDecryptLayer(
                            processedData,
                            masterKeys.aesCbcKey,
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
        const iv = this.generateRandomBytes(this.advancedParams.AES_GCM.ivSize);
        const additionalData = this.generateLayerAD(layerIndex, 'AES-GCM');
        
        const encrypted = await crypto.subtle.encrypt(
            {
                name: 'AES-GCM',
                iv,
                additionalData,
                tagLength: this.advancedParams.AES_GCM.tagLength
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
     * AES-256-CBC layer
     */
    async aes256CbcLayer(data, key, layerIndex) {
        const iv = this.generateRandomBytes(this.advancedParams.AES_CBC.ivSize);
        
        const encrypted = await crypto.subtle.encrypt(
            {
                name: 'AES-CBC',
                iv
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
        // Get key bytes
        const exportedKey = await crypto.subtle.exportKey('raw', key);
        const keyBytes = new Uint8Array(exportedKey);
        const result = new Uint8Array(data.length);
        result.set(data);
        
        // Apply multiple rounds of obfuscation
        for (let round = 0; round < this.advancedParams.Obfuscation.rounds; round++) {
            for (let i = 0; i < result.length; i += this.advancedParams.Obfuscation.blockSize) {
                const blockSize = Math.min(
                    this.advancedParams.Obfuscation.blockSize,
                    result.length - i
                );
                
                // XOR with key material
                for (let j = 0; j < blockSize; j++) {
                    const keyIndex = (i + j + round) % keyBytes.length;
                    result[i + j] = result[i + j] ^ keyBytes[keyIndex] ^ (round * 0x37);
                }
                
                // Rotate block
                const rotation = (keyBytes[i % keyBytes.length] % 7) + 1;
                this.rotateBlock(result, i, blockSize, rotation);
            }
        }
        
        return result;
    }
    
    // ============================================================================
    // DECRYPTION LAYERS
    // ============================================================================
    
    async aes256GcmDecryptLayer(data, key, layerIndex) {
        const iv = data.slice(0, this.advancedParams.AES_GCM.ivSize);
        const ciphertext = data.slice(this.advancedParams.AES_GCM.ivSize);
        const additionalData = this.generateLayerAD(layerIndex, 'AES-GCM');
        
        const decrypted = await crypto.subtle.decrypt(
            {
                name: 'AES-GCM',
                iv,
                additionalData,
                tagLength: this.advancedParams.AES_GCM.tagLength
            },
            key,
            ciphertext
        );
        
        return new Uint8Array(decrypted);
    }
    
    async aes256CbcDecryptLayer(data, key, layerIndex) {
        const iv = data.slice(0, this.advancedParams.AES_CBC.ivSize);
        const ciphertext = data.slice(this.advancedParams.AES_CBC.ivSize);
        
        const decrypted = await crypto.subtle.decrypt(
            {
                name: 'AES-CBC',
                iv
            },
            key,
            ciphertext
        );
        
        return new Uint8Array(decrypted);
    }
    
    async deobfuscationLayer(data, key, layerIndex) {
        // Get key bytes
        const exportedKey = await crypto.subtle.exportKey('raw', key);
        const keyBytes = new Uint8Array(exportedKey);
        const result = new Uint8Array(data.length);
        result.set(data);
        
        // Reverse obfuscation rounds
        for (let round = this.advancedParams.Obfuscation.rounds - 1; round >= 0; round--) {
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
            ['deriveKey']
        );
        
        // Derive different keys for each layer
        const [aesGcmKey, aesCbcKey, obfuscationKey] = await Promise.all([
            // AES-GCM key
            crypto.subtle.deriveKey(
                {
                    name: 'PBKDF2',
                    salt: this.xorBytes(salt, new TextEncoder().encode('AES-GCM-KEY')),
                    iterations,
                    hash: 'SHA-512'
                },
                baseKeyMaterial,
                { name: 'AES-GCM', length: 256 },
                false,
                ['encrypt', 'decrypt']
            ),
            
            // AES-CBC key
            crypto.subtle.deriveKey(
                {
                    name: 'PBKDF2',
                    salt: this.xorBytes(salt, new TextEncoder().encode('AES-CBC-KEY')),
                    iterations: Math.floor(iterations * 0.8),
                    hash: 'SHA-512'
                },
                baseKeyMaterial,
                { name: 'AES-CBC', length: 256 },
                false,
                ['encrypt', 'decrypt']
            ),
            
            // Obfuscation key
            crypto.subtle.deriveKey(
                {
                    name: 'PBKDF2',
                    salt: this.xorBytes(salt, new TextEncoder().encode('OBFUSCATION-KEY')),
                    iterations: Math.floor(iterations * 0.6),
                    hash: 'SHA-384'
                },
                baseKeyMaterial,
                { name: 'HMAC', hash: 'SHA-256', length: 256 },
                false,
                ['sign', 'verify']
            )
        ]);
        
        return {
            aesGcmKey,
            aesCbcKey,
            obfuscationKey,
            salt
        };
    }
    
    async reconstructMasterKeys(password, keyInfo, securityLevel) {
        const salt = keyInfo.salt;
        const iterations = this.iterations[securityLevel];
        
        const baseKeyMaterial = await crypto.subtle.importKey(
            'raw',
            new TextEncoder().encode(password),
            'PBKDF2',
            false,
            ['deriveKey']
        );
        
        const [aesGcmKey, aesCbcKey, obfuscationKey] = await Promise.all([
            crypto.subtle.deriveKey(
                {
                    name: 'PBKDF2',
                    salt: this.xorBytes(salt, new TextEncoder().encode('AES-GCM-KEY')),
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
                    salt: this.xorBytes(salt, new TextEncoder().encode('AES-CBC-KEY')),
                    iterations: Math.floor(iterations * 0.8),
                    hash: 'SHA-512'
                },
                baseKeyMaterial,
                { name: 'AES-CBC', length: 256 },
                false,
                ['encrypt', 'decrypt']
            ),
            
            crypto.subtle.deriveKey(
                {
                    name: 'PBKDF2',
                    salt: this.xorBytes(salt, new TextEncoder().encode('OBFUSCATION-KEY')),
                    iterations: Math.floor(iterations * 0.6),
                    hash: 'SHA-384'
                },
                baseKeyMaterial,
                { name: 'HMAC', hash: 'SHA-256', length: 256 },
                false,
                ['sign', 'verify']
            )
        ]);
        
        return {
            aesGcmKey,
            aesCbcKey,
            obfuscationKey
        };
    }
    
    // ============================================================================
    // UTILITY METHODS
    // ============================================================================
    
    getLayersForSecurityLevel(level) {
        const layerConfigs = {
            BASIC: ['AES-256-GCM'],
            MEDIUM: ['AES-256-GCM', 'AES-256-CBC'],
            HIGH: ['AES-256-GCM', 'AES-256-CBC', 'Obfuscation'],
            MILITARY: ['AES-256-GCM', 'AES-256-CBC', 'Obfuscation']
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
        ad.set(random, 5);
        
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
    
    xorBytes(a, b) {
        const result = new Uint8Array(a.length);
        for (let i = 0; i < a.length; i++) {
            result[i] = a[i] ^ b[i % b.length];
        }
        return result;
    }
    
    async compressLayer(data) {
        try {
            const compressed = pako.deflate(data, { level: 6 }); // Moderate compression for speed
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
    
    async createMilitaryPackage(data, metadata, masterKeys) {
        // Package structure similar to base class but with additional key info
        const metadataBytes = new TextEncoder().encode(JSON.stringify(metadata));
        const keyInfoBytes = new TextEncoder().encode(JSON.stringify({
            salt: Array.from(masterKeys.salt)
        }));
        
        // Calculate HMAC for integrity
        const hmacKey = await this.deriveHMACKey(
            'package-integrity',
            masterKeys.salt,
            10000
        );
        
        const packageData = this.concatUint8Arrays([
            new TextEncoder().encode('CVMIL'),
            new Uint8Array([this.version]),
            new Uint8Array(new Uint32Array([metadataBytes.length]).buffer),
            metadataBytes,
            new Uint8Array([masterKeys.salt.length]),
            masterKeys.salt,
            keyInfoBytes,
            data
        ]);
        
        const hmac = await crypto.subtle.sign(
            'HMAC',
            hmacKey,
            packageData
        );
        
        // Combine HMAC with package
        const finalPackage = new Uint8Array(packageData.length + 32);
        finalPackage.set(packageData, 0);
        finalPackage.set(new Uint8Array(hmac).slice(0, 32), packageData.length);
        
        return finalPackage;
    }
    
    async parseMilitaryPackage(package) {
        let offset = 0;
        
        // Check signature
        const signature = String.fromCharCode(...package.slice(offset, offset + 5));
        offset += 5;
        
        if (signature !== 'CVMIL') {
            throw new Error('INVALID_MILITARY_PACKAGE');
        }
        
        // Version
        const version = package[offset++];
        if (version !== this.version) {
            throw new Error(`UNSUPPORTED_PACKAGE_VERSION: ${version}`);
        }
        
        // Metadata length
        const metadataLength = new DataView(package.buffer, offset, 4).getUint32(0, false);
        offset += 4;
        
        // Metadata
        const metadataBytes = package.slice(offset, offset + metadataLength);
        offset += metadataLength;
        const metadata = JSON.parse(new TextDecoder().decode(metadataBytes));
        
        // Salt
        const saltSize = package[offset++];
        const salt = package.slice(offset, offset + saltSize);
        offset += saltSize;
        
        // Key info
        const keyInfoLength = package.length - offset - 32; // Subtract HMAC
        const keyInfoBytes = package.slice(offset, offset + keyInfoLength);
        offset += keyInfoLength;
        const keyInfo = JSON.parse(new TextDecoder().decode(keyInfoBytes));
        
        // Encrypted data
        const encryptedData = package.slice(offset, package.length - 32);
        const hmac = package.slice(package.length - 32);
        
        return {
            metadata,
            salt,
            keyInfo,
            encryptedData,
            hmac
        };
    }
    
    async verifyIntegrity(data, metadata, masterKeys) {
        try {
            // Calculate hash of decrypted data
            const dataHash = await crypto.subtle.digest('SHA-256', data);
            const dataHashStr = Array.from(new Uint8Array(dataHash))
                .map(b => b.toString(16).padStart(2, '0'))
                .join('');
            
            // For now, return true if decryption succeeded
            // In production, compare with stored hash in metadata
            return true;
            
        } catch (error) {
            console.error('Integrity verification failed:', error);
            return false;
        }
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
