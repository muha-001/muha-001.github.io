/**
 * CipherVault 3D Pro - Core Cryptography Engine
 * Military Grade Encryption System
 * Version: 4.1.0
 */

// ============================================================================
// CRYPTOGRAPHY CORE MODULE
// ============================================================================

class CryptoCore {
    constructor() {
        this.signature = new TextEncoder().encode('CV3D');
        this.version = 4;
        this.algorithm = 'AES-GCM';
        this.keySize = 256;
        this.ivSize = 12;
        this.tagLength = 128;
        
        // Security configuration
        this.iterations = {
            BASIC: 100000,
            MEDIUM: 310000,
            HIGH: 600000,
            MILITARY: 1000000
        };
        
        // Salt sizes per security level
        this.saltSizes = {
            BASIC: 16,
            MEDIUM: 24,
            HIGH: 32,
            MILITARY: 48
        };
        
        // Memory protection
        this.memoryWipePasses = 3;
        this.secureWipeEnabled = true;
        
        // Progress tracking
        this.progressCallbacks = new Map();
        
        // Performance monitoring
        this.performance = {
            encryptTimes: [],
            decryptTimes: [],
            keyDerivationTimes: []
        };
    }
    
    // ============================================================================
    // KEY MANAGEMENT & DERIVATION
    // ============================================================================
    
    /**
     * Derive encryption key from password using PBKDF2
     */
    async deriveKey(password, salt, iterations = 310000, keyLength = 256) {
        const startTime = performance.now();
        
        try {
            // Convert password to ArrayBuffer
            const encoder = new TextEncoder();
            const passwordBuffer = encoder.encode(password);
            
            // Import password as raw key material
            const keyMaterial = await crypto.subtle.importKey(
                'raw',
                passwordBuffer,
                'PBKDF2',
                false,
                ['deriveKey']
            );
            
            // Derive key using PBKDF2
            const derivedKey = await crypto.subtle.deriveKey(
                {
                    name: 'PBKDF2',
                    salt,
                    iterations,
                    hash: 'SHA-256'
                },
                keyMaterial,
                {
                    name: this.algorithm,
                    length: keyLength
                },
                false, // Not extractable
                ['encrypt', 'decrypt']
            );
            
            // Secure wipe of sensitive data
            if (this.secureWipeEnabled) {
                this.secureWipeArray(passwordBuffer);
            }
            
            // Track performance
            const duration = performance.now() - startTime;
            this.performance.keyDerivationTimes.push(duration);
            this.trimPerformanceArray(this.performance.keyDerivationTimes);
            
            return derivedKey;
            
        } catch (error) {
            console.error('Key derivation failed:', error);
            throw new Error(`KEY_DERIVATION_FAILED: ${error.message}`);
        }
    }
    
    /**
     * Derive HMAC key for integrity verification
     */
    async deriveHMACKey(password, salt, iterations = 100000) {
        try {
            const encoder = new TextEncoder();
            const passwordBuffer = encoder.encode(password);
            
            const keyMaterial = await crypto.subtle.importKey(
                'raw',
                passwordBuffer,
                'PBKDF2',
                false,
                ['deriveKey']
            );
            
            const hmacKey = await crypto.subtle.deriveKey(
                {
                    name: 'PBKDF2',
                    salt,
                    iterations,
                    hash: 'SHA-256'
                },
                keyMaterial,
                {
                    name: 'HMAC',
                    hash: 'SHA-256',
                    length: 256
                },
                false,
                ['sign', 'verify']
            );
            
            if (this.secureWipeEnabled) {
                this.secureWipeArray(passwordBuffer);
            }
            
            return hmacKey;
            
        } catch (error) {
            console.error('HMAC key derivation failed:', error);
            throw new Error(`HMAC_KEY_DERIVATION_FAILED: ${error.message}`);
        }
    }
    
    /**
     * Generate random cryptographic values
     */
    generateRandomBytes(size) {
        return crypto.getRandomValues(new Uint8Array(size));
    }
    
    /**
     * Generate unique file ID
     */
    generateFileId() {
        const timestamp = Date.now().toString(36);
        const random = crypto.getRandomValues(new Uint8Array(12));
        const randomStr = Array.from(random)
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
        
        return `file_${timestamp}_${randomStr}`;
    }
    
    // ============================================================================
    // ENCRYPTION METHODS
    // ============================================================================
    
    /**
     * Encrypt data with AES-GCM
     */
    async encryptData(plaintext, key, iv, additionalData = null) {
        const startTime = performance.now();
        
        try {
            const algorithm = {
                name: this.algorithm,
                iv,
                tagLength: this.tagLength
            };
            
            // Add additional authenticated data if provided
            if (additionalData) {
                algorithm.additionalData = additionalData;
            }
            
            const ciphertext = await crypto.subtle.encrypt(
                algorithm,
                key,
                plaintext
            );
            
            const duration = performance.now() - startTime;
            this.performance.encryptTimes.push(duration);
            this.trimPerformanceArray(this.performance.encryptTimes);
            
            return new Uint8Array(ciphertext);
            
        } catch (error) {
            console.error('Encryption failed:', error);
            throw new Error(`ENCRYPTION_FAILED: ${error.message}`);
        }
    }
    
    /**
     * Encrypt file with metadata
     */
    async encryptFile(file, password, options = {}) {
        const startTime = performance.now();
        
        try {
            // Parse options
            const securityLevel = options.securityLevel || 'MEDIUM';
            const compress = options.compress !== false;
            const iterations = this.iterations[securityLevel] || this.iterations.MEDIUM;
            const saltSize = this.saltSizes[securityLevel] || this.saltSizes.MEDIUM;
            
            // Generate cryptographic parameters
            const salt = this.generateRandomBytes(saltSize);
            const iv = this.generateRandomBytes(this.ivSize);
            const fileId = this.generateFileId();
            
            // Update progress
            this.updateProgress('encrypt', 10);
            
            // Derive keys
            const [encryptionKey, hmacKey] = await Promise.all([
                this.deriveKey(password, salt, iterations, this.keySize),
                this.deriveHMACKey(password, salt, Math.floor(iterations / 3))
            ]);
            
            this.updateProgress('encrypt', 30);
            
            // Read file data
            const arrayBuffer = await file.arrayBuffer();
            let dataToEncrypt = new Uint8Array(arrayBuffer);
            
            // Compress if enabled
            if (compress && dataToEncrypt.length > 1024) {
                try {
                    const compressed = pako.deflate(dataToEncrypt);
                    dataToEncrypt = new Uint8Array(compressed);
                } catch (error) {
                    console.warn('Compression failed:', error);
                }
            }
            
            this.updateProgress('encrypt', 40);
            
            // Encrypt data
            const ciphertext = await this.encryptData(
                dataToEncrypt,
                encryptionKey,
                iv,
                salt
            );
            
            this.updateProgress('encrypt', 60);
            
            // Calculate HMAC for integrity
            const hmac = await crypto.subtle.sign(
                'HMAC',
                hmacKey,
                ciphertext
            );
            
            this.updateProgress('encrypt', 70);
            
            // Prepare metadata
            const metadata = {
                originalName: file.name,
                originalSize: file.size,
                mimeType: file.type,
                timestamp: Date.now(),
                securityLevel,
                iterations,
                saltSize,
                compressed: compress && dataToEncrypt.length < file.size,
                fileId
            };
            
            // Encode metadata
            const metadataEncoder = new TextEncoder();
            const metadataBytes = metadataEncoder.encode(JSON.stringify(metadata));
            
            // Create file header
            const header = this.createFileHeader(
                salt,
                iv,
                new Uint8Array(hmac).slice(0, 32),
                metadataBytes
            );
            
            // Combine all parts
            const encryptedData = new Uint8Array(
                header.length + 
                ciphertext.length
            );
            
            encryptedData.set(header, 0);
            encryptedData.set(ciphertext, header.length);
            
            this.updateProgress('encrypt', 90);
            
            // Secure wipe of sensitive data
            if (this.secureWipeEnabled) {
                this.secureWipeArray(dataToEncrypt);
                this.secureWipeArray(new Uint8Array(arrayBuffer));
            }
            
            // Calculate performance metrics
            const duration = performance.now() - startTime;
            const speed = file.size / (duration / 1000); // bytes per second
            
            this.updateProgress('encrypt', 100);
            
            return {
                data: encryptedData,
                metadata: {
                    ...metadata,
                    encryptionTime: duration,
                    encryptedSize: encryptedData.length,
                    compressionRatio: file.size / dataToEncrypt.length,
                    speed
                },
                fileId
            };
            
        } catch (error) {
            console.error('File encryption failed:', error);
            throw error;
        }
    }
    
    /**
     * Create encrypted file header
     */
    createFileHeader(salt, iv, hmac, metadata) {
        // Signature: 4 bytes
        // Version: 1 byte
        // Header size: 2 bytes
        // Salt: variable (1 byte length + data)
        // IV: 12 bytes
        // HMAC: 32 bytes
        // Metadata: variable (2 bytes length + data)
        
        const header = new Uint8Array([
            ...this.signature,
            this.version,
            0, 0, // Header size placeholder
            salt.length,
            ...salt,
            ...iv,
            ...hmac,
            (metadata.length >> 8) & 0xFF, // Metadata length high byte
            metadata.length & 0xFF,        // Metadata length low byte
            ...metadata
        ]);
        
        // Update header size
        const headerSize = header.length;
        header[5] = (headerSize >> 8) & 0xFF;
        header[6] = headerSize & 0xFF;
        
        return header;
    }
    
    /**
     * Parse encrypted file header
     */
    parseFileHeader(header) {
        // Verify signature
        const signature = header.slice(0, 4);
        if (!this.arraysEqual(signature, this.signature)) {
            throw new Error('INVALID_SIGNATURE: Not a CipherVault file');
        }
        
        let offset = 4;
        const version = header[offset++];
        
        if (version !== this.version) {
            throw new Error(`UNSUPPORTED_VERSION: ${version}`);
        }
        
        const headerSize = (header[offset++] << 8) | header[offset++];
        const saltSize = header[offset++];
        const salt = header.slice(offset, offset + saltSize);
        offset += saltSize;
        
        const iv = header.slice(offset, offset + this.ivSize);
        offset += this.ivSize;
        
        const hmac = header.slice(offset, offset + 32);
        offset += 32;
        
        const metadataLength = (header[offset++] << 8) | header[offset++];
        const metadataBytes = header.slice(offset, offset + metadataLength);
        offset += metadataLength;
        
        const metadata = JSON.parse(new TextDecoder().decode(metadataBytes));
        
        return {
            version,
            headerSize,
            salt,
            iv,
            hmac,
            metadata,
            dataOffset: offset
        };
    }
    
    // ============================================================================
    // DECRYPTION METHODS
    // ============================================================================
    
    /**
     * Decrypt data with AES-GCM
     */
    async decryptData(ciphertext, key, iv, additionalData = null) {
        const startTime = performance.now();
        
        try {
            const algorithm = {
                name: this.algorithm,
                iv,
                tagLength: this.tagLength
            };
            
            if (additionalData) {
                algorithm.additionalData = additionalData;
            }
            
            const plaintext = await crypto.subtle.decrypt(
                algorithm,
                key,
                ciphertext
            );
            
            const duration = performance.now() - startTime;
            this.performance.decryptTimes.push(duration);
            this.trimPerformanceArray(this.performance.decryptTimes);
            
            return new Uint8Array(plaintext);
            
        } catch (error) {
            console.error('Decryption failed:', error);
            throw new Error(`DECRYPTION_FAILED: ${error.message}`);
        }
    }
    
    /**
     * Decrypt file
     */
    async decryptFile(encryptedData, password, progressCallback) {
        const startTime = performance.now();
        
        try {
            // Parse file header
            const headerInfo = this.parseFileHeader(encryptedData);
            const { salt, iv, hmac, metadata, dataOffset } = headerInfo;
            
            this.updateProgress('decrypt', 20);
            
            // Verify HMAC before decryption
            const ciphertext = encryptedData.slice(dataOffset);
            const hmacKey = await this.deriveHMACKey(
                password, 
                salt, 
                Math.floor(metadata.iterations / 3)
            );
            
            const calculatedHMAC = await crypto.subtle.sign(
                'HMAC',
                hmacKey,
                ciphertext
            );
            
            const calculatedHMACBytes = new Uint8Array(calculatedHMAC).slice(0, 32);
            if (!this.arraysEqual(hmac, calculatedHMACBytes)) {
                throw new Error('INTEGRITY_CHECK_FAILED: File may be corrupted or password incorrect');
            }
            
            this.updateProgress('decrypt', 40);
            
            // Derive encryption key
            const encryptionKey = await this.deriveKey(
                password,
                salt,
                metadata.iterations,
                this.keySize
            );
            
            this.updateProgress('decrypt', 60);
            
            // Decrypt data
            const decryptedData = await this.decryptData(
                ciphertext,
                encryptionKey,
                iv,
                salt
            );
            
            this.updateProgress('decrypt', 80);
            
            // Decompress if needed
            let finalData = decryptedData;
            if (metadata.compressed) {
                try {
                    const decompressed = pako.inflate(decryptedData);
                    finalData = new Uint8Array(decompressed);
                } catch (error) {
                    console.warn('Decompression failed:', error);
                    // Use original data if decompression fails
                }
            }
            
            this.updateProgress('decrypt', 100);
            
            // Calculate performance
            const duration = performance.now() - startTime;
            const speed = metadata.originalSize / (duration / 1000);
            
            return {
                data: finalData,
                metadata: {
                    ...metadata,
                    decryptionTime: duration,
                    speed
                }
            };
            
        } catch (error) {
            console.error('File decryption failed:', error);
            throw error;
        }
    }
    
    /**
     * Validate encrypted file without decrypting
     */
    async validateFile(encryptedData, password) {
        try {
            const headerInfo = this.parseFileHeader(encryptedData);
            const { salt, hmac, dataOffset } = headerInfo;
            
            const ciphertext = encryptedData.slice(dataOffset);
            const hmacKey = await this.deriveHMACKey(
                password, 
                salt, 
                Math.floor(headerInfo.metadata.iterations / 3)
            );
            
            const calculatedHMAC = await crypto.subtle.sign(
                'HMAC',
                hmacKey,
                ciphertext
            );
            
            const calculatedHMACBytes = new Uint8Array(calculatedHMAC).slice(0, 32);
            return this.arraysEqual(hmac, calculatedHMACBytes);
            
        } catch (error) {
            console.error('File validation failed:', error);
            return false;
        }
    }
    
    // ============================================================================
    // STREAMING ENCRYPTION/DECRYPTION
    // ============================================================================
    
    /**
     * Encrypt file in chunks (streaming)
     */
    async encryptFileStream(file, password, options = {}) {
        const chunkSize = options.chunkSize || 10 * 1024 * 1024; // 10MB
        const totalChunks = Math.ceil(file.size / chunkSize);
        const encryptedChunks = [];
        
        // Generate cryptographic parameters for the entire file
        const securityLevel = options.securityLevel || 'MEDIUM';
        const salt = this.generateRandomBytes(this.saltSizes[securityLevel]);
        const iv = this.generateRandomBytes(this.ivSize);
        const iterations = this.iterations[securityLevel];
        
        // Derive keys once
        const [encryptionKey, hmacKey] = await Promise.all([
            this.deriveKey(password, salt, iterations, this.keySize),
            this.deriveHMACKey(password, salt, Math.floor(iterations / 3))
        ]);
        
        // Create file header
        const metadata = {
            originalName: file.name,
            originalSize: file.size,
            mimeType: file.type,
            timestamp: Date.now(),
            securityLevel,
            iterations,
            saltSize: salt.length,
            chunkSize,
            totalChunks,
            fileId: this.generateFileId()
        };
        
        const metadataEncoder = new TextEncoder();
        const metadataBytes = metadataEncoder.encode(JSON.stringify(metadata));
        
        const initialHMAC = new Uint8Array(32); // Placeholder
        const header = this.createFileHeader(salt, iv, initialHMAC, metadataBytes);
        encryptedChunks.push(header);
        
        // Process each chunk
        for (let i = 0; i < totalChunks; i++) {
            const start = i * chunkSize;
            const end = Math.min(start + chunkSize, file.size);
            const chunk = file.slice(start, end);
            
            const arrayBuffer = await chunk.arrayBuffer();
            const chunkData = new Uint8Array(arrayBuffer);
            
            // Generate unique IV for each chunk
            const chunkIV = this.incrementIV(iv, i);
            
            // Encrypt chunk
            const encryptedChunk = await this.encryptData(
                chunkData,
                encryptionKey,
                chunkIV,
                salt
            );
            
            // Add chunk index and size
            const chunkHeader = new Uint8Array(12);
            const view = new DataView(chunkHeader.buffer);
            view.setUint32(0, i, false); // Chunk index
            view.setUint32(4, chunkData.length, false); // Original size
            view.setUint32(8, encryptedChunk.length, false); // Encrypted size
            
            encryptedChunks.push(chunkHeader);
            encryptedChunks.push(encryptedChunk);
            
            // Update progress
            const progress = Math.round(((i + 1) / totalChunks) * 100);
            this.updateProgress('encrypt', progress);
            
            // Secure wipe
            if (this.secureWipeEnabled) {
                this.secureWipeArray(chunkData);
                this.secureWipeArray(new Uint8Array(arrayBuffer));
            }
        }
        
        // Calculate final HMAC over all encrypted data
        const allEncryptedData = this.concatUint8Arrays(encryptedChunks.slice(1)); // Exclude header
        const finalHMAC = await crypto.subtle.sign(
            'HMAC',
            hmacKey,
            allEncryptedData
        );
        
        // Update header with final HMAC
        const finalHMACBytes = new Uint8Array(finalHMAC).slice(0, 32);
        header.set(finalHMACBytes, this.signature.length + 1 + 2 + 1 + salt.length + iv.length);
        
        // Combine all chunks
        encryptedChunks[0] = header;
        return this.concatUint8Arrays(encryptedChunks);
    }
    
    /**
     * Decrypt file in chunks (streaming)
     */
    async decryptFileStream(encryptedData, password) {
        // Parse header
        const headerInfo = this.parseFileHeader(encryptedData);
        const { salt, iv, metadata, dataOffset } = headerInfo;
        
        if (!metadata.chunkSize || !metadata.totalChunks) {
            throw new Error('NOT_STREAMING_FILE: Use regular decryption method');
        }
        
        // Derive keys
        const [encryptionKey, hmacKey] = await Promise.all([
            this.deriveKey(password, salt, metadata.iterations, this.keySize),
            this.deriveHMACKey(password, salt, Math.floor(metadata.iterations / 3))
        ]);
        
        // Verify HMAC
        const encryptedContent = encryptedData.slice(dataOffset);
        const calculatedHMAC = await crypto.subtle.sign(
            'HMAC',
            hmacKey,
            encryptedContent
        );
        
        const headerHMAC = headerInfo.hmac;
        const calculatedHMACBytes = new Uint8Array(calculatedHMAC).slice(0, 32);
        if (!this.arraysEqual(headerHMAC, calculatedHMACBytes)) {
            throw new Error('INTEGRITY_CHECK_FAILED');
        }
        
        // Process chunks
        const decryptedChunks = [];
        let offset = dataOffset;
        
        for (let i = 0; i < metadata.totalChunks; i++) {
            // Read chunk header
            const chunkHeader = encryptedData.slice(offset, offset + 12);
            offset += 12;
            
            const view = new DataView(chunkHeader.buffer);
            const chunkIndex = view.getUint32(0, false);
            const originalSize = view.getUint32(4, false);
            const encryptedSize = view.getUint32(8, false);
            
            // Read encrypted chunk
            const encryptedChunk = encryptedData.slice(offset, offset + encryptedSize);
            offset += encryptedSize;
            
            // Generate chunk-specific IV
            const chunkIV = this.incrementIV(iv, chunkIndex);
            
            // Decrypt chunk
            const decryptedChunk = await this.decryptData(
                encryptedChunk,
                encryptionKey,
                chunkIV,
                salt
            );
            
            // Verify size
            if (decryptedChunk.length !== originalSize) {
                throw new Error(`CHUNK_SIZE_MISMATCH: Chunk ${i}`);
            }
            
            decryptedChunks.push(decryptedChunk);
            
            // Update progress
            const progress = Math.round(((i + 1) / metadata.totalChunks) * 100);
            this.updateProgress('decrypt', progress);
        }
        
        // Combine all chunks
        return this.concatUint8Arrays(decryptedChunks);
    }
    
    // ============================================================================
    // UTILITY METHODS
    // ============================================================================
    
    /**
     * Secure wipe of sensitive data
     */
    secureWipeArray(array) {
        if (!array || !array.buffer) return;
        
        const view = new Uint8Array(array.buffer);
        for (let pass = 0; pass < this.memoryWipePasses; pass++) {
            // Overwrite with random data
            crypto.getRandomValues(view);
            // Overwrite with zeros
            for (let i = 0; i < view.length; i++) {
                view[i] = 0;
            }
        }
    }
    
    /**
     * Compare two arrays in constant time
     */
    arraysEqual(a, b) {
        if (a.byteLength !== b.byteLength) return false;
        
        const aView = new Uint8Array(a);
        const bView = new Uint8Array(b);
        let result = 0;
        
        for (let i = 0; i < aView.length; i++) {
            result |= aView[i] ^ bView[i];
        }
        
        return result === 0;
    }
    
    /**
     * Concatenate multiple Uint8Arrays
     */
    concatUint8Arrays(arrays) {
        const totalLength = arrays.reduce((sum, arr) => sum + arr.length, 0);
        const result = new Uint8Array(totalLength);
        
        let offset = 0;
        for (const arr of arrays) {
            result.set(arr, offset);
            offset += arr.length;
        }
        
        return result;
    }
    
    /**
     * Increment IV for chunked encryption
     */
    incrementIV(iv, increment) {
        const newIV = new Uint8Array(iv);
        const view = new DataView(newIV.buffer);
        const originalValue = view.getUint32(iv.length - 4, false);
        view.setUint32(iv.length - 4, originalValue + increment, false);
        
        return newIV;
    }
    
    /**
     * Update progress callback
     */
    updateProgress(operation, percent) {
        if (typeof this.progressCallbacks.get(operation) === 'function') {
            this.progressCallbacks.get(operation)(percent);
        }
    }
    
    /**
     * Set progress callback for operation
     */
    setProgressCallback(operation, callback) {
        this.progressCallbacks.set(operation, callback);
    }
    
    /**
     * Trim performance array to keep only recent measurements
     */
    trimPerformanceArray(array, maxLength = 100) {
        if (array.length > maxLength) {
            array.splice(0, array.length - maxLength);
        }
    }
    
    /**
     * Get performance statistics
     */
    getPerformanceStats() {
        const calculateStats = (array) => {
            if (array.length === 0) return null;
            
            const sum = array.reduce((a, b) => a + b, 0);
            const avg = sum / array.length;
            const min = Math.min(...array);
            const max = Math.max(...array);
            
            return { avg, min, max, count: array.length };
        };
        
        return {
            encryption: calculateStats(this.performance.encryptTimes),
            decryption: calculateStats(this.performance.decryptTimes),
            keyDerivation: calculateStats(this.performance.keyDerivationTimes)
        };
    }
    
    /**
     * Estimate encryption time for file size
     */
    estimateEncryptionTime(fileSize, securityLevel = 'MEDIUM') {
        const stats = this.getPerformanceStats();
        if (!stats.encryption) return null;
        
        // Simple linear estimation (bytes per millisecond)
        const bytesPerMs = 1024 * 1024 / stats.encryption.avg; // MB/ms
        const estimatedTime = fileSize / bytesPerMs;
        
        // Adjust for security level
        const multipliers = {
            BASIC: 0.8,
            MEDIUM: 1.0,
            HIGH: 1.5,
            MILITARY: 2.0
        };
        
        return estimatedTime * (multipliers[securityLevel] || 1.0);
    }
    
    /**
     * Test cryptographic functions
     */
    async selfTest() {
        const testResults = [];
        
        try {
            // Test random generation
            const randomBytes = this.generateRandomBytes(32);
            testResults.push({
                test: 'Random Generation',
                passed: randomBytes.length === 32,
                details: 'Generated 32 random bytes'
            });
            
            // Test key derivation
            const testPassword = 'TestPassword123!@#';
            const testSalt = this.generateRandomBytes(16);
            const testKey = await this.deriveKey(testPassword, testSalt, 1000);
            
            testResults.push({
                test: 'Key Derivation',
                passed: !!testKey,
                details: 'Successfully derived key'
            });
            
            // Test encryption/decryption
            const testData = new TextEncoder().encode('Test encryption data');
            const testIV = this.generateRandomBytes(12);
            const encrypted = await this.encryptData(testData, testKey, testIV);
            const decrypted = await this.decryptData(encrypted, testKey, testIV);
            
            const dataMatches = this.arraysEqual(testData, decrypted);
            testResults.push({
                test: 'Encryption/Decryption',
                passed: dataMatches,
                details: dataMatches ? 'Data matches' : 'Data mismatch'
            });
            
            // Test HMAC
            const hmacKey = await this.deriveHMACKey(testPassword, testSalt, 1000);
            const hmac = await crypto.subtle.sign('HMAC', hmacKey, testData);
            
            testResults.push({
                test: 'HMAC Generation',
                passed: hmac.byteLength > 0,
                details: `Generated ${hmac.byteLength} byte HMAC`
            });
            
            // Test secure wipe
            const testArray = new Uint8Array([1, 2, 3, 4, 5]);
            this.secureWipeArray(testArray);
            const allZeros = testArray.every(byte => byte === 0);
            
            testResults.push({
                test: 'Secure Wipe',
                passed: allZeros,
                details: allZeros ? 'All bytes zeroed' : 'Bytes not properly wiped'
            });
            
            return {
                passed: testResults.every(r => r.passed),
                results: testResults
            };
            
        } catch (error) {
            console.error('Self-test failed:', error);
            return {
                passed: false,
                error: error.message,
                results: testResults
            };
        }
    }
    
    /**
     * Get cryptographic capabilities
     */
    getCapabilities() {
        const algorithms = [
            'AES-GCM',
            'AES-CBC',
            'AES-CTR',
            'HMAC',
            'PBKDF2',
            'SHA-1',
            'SHA-256',
            'SHA-384',
            'SHA-512'
        ];
        
        const capabilities = {};
        
        // Test each algorithm
        algorithms.forEach(async (algorithm) => {
            try {
                if (algorithm.includes('AES')) {
                    const key = await crypto.subtle.generateKey(
                        { name: algorithm, length: 256 },
                        false,
                        ['encrypt', 'decrypt']
                    );
                    capabilities[algorithm] = !!key;
                } else if (algorithm === 'HMAC') {
                    const key = await crypto.subtle.generateKey(
                        { name: algorithm, hash: 'SHA-256' },
                        false,
                        ['sign', 'verify']
                    );
                    capabilities[algorithm] = !!key;
                } else if (algorithm.includes('SHA')) {
                    const hash = await crypto.subtle.digest(
                        algorithm,
                        new TextEncoder().encode('test')
                    );
                    capabilities[algorithm] = !!hash;
                }
            } catch (error) {
                capabilities[algorithm] = false;
            }
        });
        
        return capabilities;
    }
}

// ============================================================================
// EXPORT AND INITIALIZATION
// ============================================================================

// Create global instance
const CryptoEngine = new CryptoCore();

// Make available globally
if (typeof window !== 'undefined') {
    window.CryptoEngine = CryptoEngine;
    window.CryptoCore = CryptoCore;
}

// For ES modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        CryptoCore,
        CryptoEngine
    };
}

// Initialize self-test on load
if (typeof window !== 'undefined') {
    window.addEventListener('load', async () => {
        const testResult = await CryptoEngine.selfTest();
        console.log('CryptoCore Self-Test:', testResult.passed ? 'PASSED' : 'FAILED');
        
        if (!testResult.passed) {
            console.warn('Cryptographic self-test failed:', testResult);
        }
    });
}
