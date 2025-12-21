/**
 * CipherVault 3D Pro - File Processing Engine
 * Handles chunked file processing and memory safety
 * Version: 4.2.0
 */

class FileProcessorSystem {
    constructor() {
        this.activeProcess = null;
        this.chunkSize = this.calculateOptimalChunkSize();
        this.maxFileSize = 5 * 1024 * 1024 * 1024; // 5GB limit
        this.workerManager = null;
        this.useWorkers = this.supportsWorkers();
    }

    /**
     * Calculate optimal chunk size based on device capabilities
     */
    calculateOptimalChunkSize() {
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
            navigator.userAgent
        );
        
        // Conservative chunk sizes for stability
        if (isMobile) {
            return 2 * 1024 * 1024; // 2MB for mobile
        } else {
            return 10 * 1024 * 1024; // 10MB for desktop
        }
    }

    /**
     * Check if Web Workers are supported
     */
    supportsWorkers() {
        return typeof Worker !== 'undefined';
    }

    /**
     * معالجة الملف (تشفير أو فك تشفير)
     */
    async processFile(file, password, operation, options = {}) {
        if (!this.validateFile(file)) {
            throw new Error('Invalid file');
        }

        const startTime = Date.now();
        const operationId = `OP_${startTime}_${Math.random().toString(36).substr(2, 9)}`;
        
        try {
            // Show busy state
            this.setBusyState(true, operation);
            
            // Determine processing strategy
            const strategy = this.determineProcessingStrategy(file, operation, options);
            
            let result;
            if (strategy.useWorkers && this.useWorkers) {
                result = await this.processWithWorkers(file, password, operation, options);
            } else {
                result = await this.processInMainThread(file, password, operation, options);
            }

            // Save file
            this.saveFile(result.data, file.name, operation);
            
            return result;
            
        } catch (error) {
            console.error('Processing failed:', error);
            throw error;
        } finally {
            this.setBusyState(false);
        }
    }

    validateFile(file) {
        if (!file) {
            throw new Error('No file selected');
        }
        if (file.size > this.maxFileSize) {
            throw new Error(`File too large (Max ${this.formatFileSize(this.maxFileSize)})`);
        }
        if (file.size === 0) {
            throw new Error('File is empty');
        }
        return true;
    }

    /**
     * Determine the best processing strategy
     */
    determineProcessingStrategy(file, operation, options) {
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
            navigator.userAgent
        );
        
        const memory = navigator.deviceMemory || 4; // GB
        const fileSizeMB = file.size / (1024 * 1024);
        
        // Strategy decisions
        const useWorkers = !isMobile && 
                          memory >= 4 && 
                          fileSizeMB > 50 && 
                          this.useWorkers &&
                          options.useWorkers !== false;
        
        const chunkSize = useWorkers ? 
            Math.min(this.chunkSize, 50 * 1024 * 1024) : // 50MB max for workers
            Math.min(this.chunkSize, 10 * 1024 * 1024);  // 10MB max for main thread
        
        return {
            useWorkers,
            chunkSize,
            compress: options.compress !== false && fileSizeMB > 1,
            securityLevel: options.securityLevel || 'MEDIUM'
        };
    }

    /**
     * Process file in main thread (for smaller files or mobile)
     */
    async processInMainThread(file, password, operation, options) {
        this.updateProgress(0, 'preparing', operation);
        
        // Read file
        const arrayBuffer = await file.arrayBuffer();
        this.updateProgress(10, 'reading', operation);
        
        let result;
        if (operation === 'encrypt') {
            result = await window.CryptoEngine.encryptFile(file, password, options);
        } else {
            result = await window.CryptoEngine.decryptFile(new Uint8Array(arrayBuffer), password);
        }
        
        this.updateProgress(90, 'finalizing', operation);
        return result;
    }

    /**
     * Process file using Web Workers (for larger files)
     */
    async processWithWorkers(file, password, operation, options) {
        // This is a placeholder - implement actual worker logic
        // For now, fall back to main thread
        console.log('Worker processing requested but using main thread fallback');
        return this.processInMainThread(file, password, operation, options);
    }

    /**
     * Process file in chunks (streaming approach)
     */
    async processFileStream(file, password, operation, options) {
        const totalChunks = Math.ceil(file.size / this.chunkSize);
        const processedChunks = [];
        
        this.updateProgress(0, 'starting', operation);
        
        for (let i = 0; i < totalChunks; i++) {
            const start = i * this.chunkSize;
            const end = Math.min(start + this.chunkSize, file.size);
            const chunk = file.slice(start, end);
            
            const arrayBuffer = await chunk.arrayBuffer();
            const chunkData = new Uint8Array(arrayBuffer);
            
            let processedChunk;
            if (operation === 'encrypt') {
                // Simulate encryption - replace with actual encryption
                processedChunk = chunkData; // Placeholder
            } else {
                // Simulate decryption - replace with actual decryption
                processedChunk = chunkData; // Placeholder
            }
            
            processedChunks.push(processedChunk);
            
            // Update progress
            const progress = ((i + 1) / totalChunks) * 100;
            this.updateProgress(progress, 'processing', operation);
            
            // Clean up
            chunkData.fill(0);
        }
        
        // Combine chunks
        const totalLength = processedChunks.reduce((sum, chunk) => sum + chunk.length, 0);
        const result = new Uint8Array(totalLength);
        
        let offset = 0;
        for (const chunk of processedChunks) {
            result.set(chunk, offset);
            offset += chunk.length;
            chunk.fill(0); // Clean up
        }
        
        return {
            data: result,
            metadata: {
                originalSize: file.size,
                processedSize: result.length,
                chunks: totalChunks
            }
        };
    }

    /**
     * Save file to disk
     */
    saveFile(data, originalName, operation) {
        try {
            const blob = data instanceof Blob ? data : new Blob([data]);
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            
            // Generate appropriate filename
            let fileName;
            if (operation === 'encrypt') {
                const baseName = originalName.lastIndexOf('.') > 0 ? 
                    originalName.substring(0, originalName.lastIndexOf('.')) : 
                    originalName;
                fileName = `${baseName}.cvault`;
            } else {
                if (originalName.endsWith('.cvault')) {
                    fileName = originalName.replace('.cvault', '');
                } else if (originalName.endsWith('.cvenc')) {
                    fileName = originalName.replace('.cvenc', '');
                } else {
                    fileName = `decrypted_${originalName}`;
                }
            }
            
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            
            // Clean up
            setTimeout(() => URL.revokeObjectURL(url), 1000);
            
            return fileName;
            
        } catch (error) {
            console.error('File save failed:', error);
            throw new Error('Failed to save file');
        }
    }

    /**
     * Format file size for display
     */
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    /**
     * Update progress display
     */
    updateProgress(percent, status, operation) {
        // Dispatch custom event for UI updates
        const event = new CustomEvent('fileprogress', {
            detail: {
                percent: Math.min(100, Math.max(0, percent)),
                status,
                operation
            }
        });
        window.dispatchEvent(event);
    }

    /**
     * Set busy state
     */
    setBusyState(busy, operation = null) {
        const event = new CustomEvent('busystate', {
            detail: { busy, operation }
        });
        window.dispatchEvent(event);
    }

    /**
     * Get file information
     */
    async getFileInfo(file) {
        return {
            name: file.name,
            size: file.size,
            formattedSize: this.formatFileSize(file.size),
            type: file.type || 'Unknown',
            lastModified: new Date(file.lastModified).toLocaleString()
        };
    }

    /**
     * Create a file from data
     */
    createFile(data, fileName, mimeType = 'application/octet-stream') {
        return new File([data], fileName, { type: mimeType });
    }

    /**
     * Clean up resources
     */
    cleanup() {
        if (this.workerManager) {
            this.workerManager.terminate();
            this.workerManager = null;
        }
        
        // Force garbage collection if available
        if (typeof window.gc === 'function') {
            window.gc();
        }
    }
}

// Create global instance
const FileProcessor = new FileProcessorSystem();

// Export for global use
if (typeof window !== 'undefined') {
    window.FileProcessor = FileProcessor;
    
    // Initialize on load
    window.addEventListener('load', () => {
        console.log('File Processor initialized');
    });
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FileProcessor;
}
