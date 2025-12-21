/**
 * CipherVault 3D Pro - Web Workers Manager
 * Version: 4.1.0
 * 
 * Manages Web Workers for parallel file processing
 */

// ============================================================================
// WORKER CONFIGURATION
// ============================================================================

const WORKER_CONFIG = {
    // Worker pool configuration
    pool: {
        maxWorkers: navigator.hardwareConcurrency || 4,
        minWorkers: 1,
        workerLifetime: 5 * 60 * 1000, // 5 minutes
        idleTimeout: 30 * 1000, // 30 seconds
        maxQueueSize: 100
    },
    
    // File processing configuration
    processing: {
        chunkSize: 10 * 1024 * 1024, // 10MB
        maxChunkSize: 100 * 1024 * 1024, // 100MB
        minChunkSize: 1 * 1024 * 1024, // 1MB
        parallelChunks: 2,
        memoryThreshold: 512 * 1024 * 1024 // 512MB
    },
    
    // Worker script configuration
    scripts: {
        cryptoWorker: '/assets/js/crypto-worker.js',
        fileWorker: '/assets/js/file-worker.js',
        compressionWorker: '/assets/js/compression-worker.js'
    },
    
    // Performance monitoring
    performance: {
        trackTaskTimes: true,
        maxTaskHistory: 100,
        slowTaskThreshold: 5000 // 5 seconds
    },
    
    // Error handling
    errors: {
        maxRetries: 3,
        retryDelay: 1000,
        fatalErrorThreshold: 5
    }
};

// ============================================================================
// WORKER MANAGER
// ============================================================================

class WorkerManager {
    constructor(config = WORKER_CONFIG) {
        this.config = config;
        
        // Worker pool
        this.workers = new Map(); // workerId -> { worker, busy, lastUsed, tasksCompleted }
        this.workerQueue = [];
        this.nextWorkerId = 1;
        
        // Task management
        this.tasks = new Map(); // taskId -> { promise, resolve, reject, workerId, startTime }
        this.taskQueue = [];
        this.nextTaskId = 1;
        
        // Performance tracking
        this.performance = {
            tasksCompleted: 0,
            tasksFailed: 0,
            totalProcessingTime: 0,
            taskHistory: [],
            workerStats: new Map()
        };
        
        // State
        this.initialized = false;
        this.enabled = true;
        this.cleanupInterval = null;
        
        // Error tracking
        this.errors = {
            workerErrors: 0,
            lastErrorTime: 0,
            fatalErrors: []
        };
        
        console.log('Worker Manager initialized');
    }
    
    // ============================================================================
    // INITIALIZATION
    // ============================================================================
    
    /**
     * Initialize worker manager
     */
    async init() {
        if (this.initialized) return;
        
        console.log('Initializing Worker Manager...');
        
        try {
            // Check if Workers are supported
            if (!this.isSupported()) {
                console.warn('Web Workers not supported, falling back to main thread');
                this.enabled = false;
                return;
            }
            
            // Create initial worker pool
            await this.createWorkerPool();
            
            // Start cleanup interval
            this.startCleanupInterval();
            
            // Setup error handling
            this.setupErrorHandling();
            
            this.initialized = true;
            console.log(`Worker Manager initialized with ${this.workers.size} workers`);
            
        } catch (error) {
            console.error('Failed to initialize Worker Manager:', error);
            this.enabled = false;
        }
    }
    
    /**
     * Check if Web Workers are supported
     */
    isSupported() {
        return typeof Worker !== 'undefined' && 
               typeof Blob !== 'undefined' &&
               typeof URL !== 'undefined';
    }
    
    /**
     * Create initial worker pool
     */
    async createWorkerPool() {
        const initialWorkers = Math.min(
            this.config.pool.minWorkers,
            this.config.pool.maxWorkers
        );
        
        for (let i = 0; i < initialWorkers; i++) {
            await this.createWorker();
        }
    }
    
    /**
     * Create a new worker
     */
    async createWorker(type = 'crypto') {
        if (!this.enabled) return null;
        
        const workerId = this.nextWorkerId++;
        
        try {
            let workerScript;
            switch (type) {
                case 'crypto':
                    workerScript = this.config.scripts.cryptoWorker;
                    break;
                case 'file':
                    workerScript = this.config.scripts.fileWorker;
                    break;
                case 'compression':
                    workerScript = this.config.scripts.compressionWorker;
                    break;
                default:
                    workerScript = this.config.scripts.cryptoWorker;
            }
            
            // Create worker
            const worker = new Worker(workerScript);
            
            // Setup message handler
            worker.onmessage = (event) => this.handleWorkerMessage(workerId, event);
            
            // Setup error handler
            worker.onerror = (error) => this.handleWorkerError(workerId, error);
            
            // Setup messageerror handler
            worker.onmessageerror = (error) => this.handleWorkerMessageError(workerId, error);
            
            // Store worker
            this.workers.set(workerId, {
                worker,
                busy: false,
                lastUsed: Date.now(),
                tasksCompleted: 0,
                type,
                created: Date.now()
            });
            
            // Initialize worker stats
            this.performance.workerStats.set(workerId, {
                tasksCompleted: 0,
                tasksFailed: 0,
                totalTime: 0,
                lastTaskTime: 0
            });
            
            console.log(`Created worker ${workerId} (${type})`);
            
            return workerId;
            
        } catch (error) {
            console.error(`Failed to create worker ${workerId}:`, error);
            this.handleFatalError('WORKER_CREATION_FAILED', error);
            return null;
        }
    }
    
    // ============================================================================
    // TASK MANAGEMENT
    // ============================================================================
    
    /**
     * Process file using workers
     */
    async processFile(file, operation, password, options = {}) {
        if (!this.enabled || !this.initialized) {
            // Fall back to main thread processing
            return this.processInMainThread(file, operation, password, options);
        }
        
        const taskId = this.generateTaskId();
        console.log(`Starting task ${taskId}: ${operation} for ${file.name}`);
        
        return new Promise((resolve, reject) => {
            // Create task object
            const task = {
                id: taskId,
                operation,
                file,
                password,
                options,
                startTime: Date.now(),
                resolve,
                reject,
                status: 'queued',
                progress: 0,
                chunks: [],
                results: []
            };
            
            // Store task
            this.tasks.set(taskId, task);
            
            // Queue task
            this.queueTask(task);
            
            // Start processing if workers are available
            this.processNextTask();
        });
    }
    
    /**
     * Queue a task for processing
     */
    queueTask(task) {
        if (this.taskQueue.length >= this.config.pool.maxQueueSize) {
            throw new Error('Task queue is full');
        }
        
        this.taskQueue.push(task);
        
        // Update task status
        task.status = 'queued';
        this.emitTaskUpdate(task.id, 'queued', 0);
    }
    
    /**
     * Process next task in queue
     */
    async processNextTask() {
        if (this.taskQueue.length === 0) return;
        
        // Find available worker
        const workerId = await this.getAvailableWorker();
        if (!workerId) return; // No workers available
        
        // Get next task
        const task = this.taskQueue.shift();
        if (!task) return;
        
        // Update task status
        task.status = 'processing';
        task.workerId = workerId;
        this.emitTaskUpdate(task.id, 'processing', 0);
        
        // Mark worker as busy
        this.markWorkerBusy(workerId, true);
        
        // Process task based on file size
        if (task.file.size > this.config.processing.memoryThreshold) {
            await this.processLargeFile(task, workerId);
        } else {
            await this.processSmallFile(task, workerId);
        }
    }
    
    /**
     * Process small file (single chunk)
     */
    async processSmallFile(task, workerId) {
        try {
            // Read entire file
            const arrayBuffer = await task.file.arrayBuffer();
            
            // Send to worker
            this.sendToWorker(workerId, {
                type: 'PROCESS_FILE',
                taskId: task.id,
                operation: task.operation,
                data: arrayBuffer,
                password: task.password,
                options: task.options
            }, [arrayBuffer]);
            
        } catch (error) {
            this.handleTaskError(task.id, error);
        }
    }
    
    /**
     * Process large file (multiple chunks)
     */
    async processLargeFile(task, workerId) {
        const fileSize = task.file.size;
        const chunkSize = this.calculateOptimalChunkSize(fileSize);
        const totalChunks = Math.ceil(fileSize / chunkSize);
        
        console.log(`Processing large file in ${totalChunks} chunks of ${this.formatBytes(chunkSize)} each`);
        
        task.totalChunks = totalChunks;
        task.chunksProcessed = 0;
        
        // Process chunks in parallel
        const parallelChunks = Math.min(
            this.config.processing.parallelChunks,
            totalChunks
        );
        
        for (let i = 0; i < totalChunks; i += parallelChunks) {
            const chunkPromises = [];
            
            for (let j = 0; j < parallelChunks && (i + j) < totalChunks; j++) {
                const chunkIndex = i + j;
                const start = chunkIndex * chunkSize;
                const end = Math.min(start + chunkSize, fileSize);
                
                chunkPromises.push(this.processChunk(task, workerId, chunkIndex, start, end));
            }
            
            // Wait for this batch to complete
            try {
                await Promise.all(chunkPromises);
            } catch (error) {
                this.handleTaskError(task.id, error);
                return;
            }
            
            // Update progress
            const progress = Math.round(((i + parallelChunks) / totalChunks) * 100);
            this.emitTaskUpdate(task.id, 'processing', progress);
        }
    }
    
    /**
     * Process a single chunk
     */
    async processChunk(task, workerId, chunkIndex, start, end) {
        return new Promise((resolve, reject) => {
            const chunk = task.file.slice(start, end);
            const chunkId = `${task.id}_${chunkIndex}`;
            
            // Read chunk
            chunk.arrayBuffer().then(arrayBuffer => {
                // Send chunk to worker
                this.sendToWorker(workerId, {
                    type: 'PROCESS_CHUNK',
                    taskId: task.id,
                    chunkId,
                    chunkIndex,
                    totalChunks: task.totalChunks,
                    data: arrayBuffer,
                    operation: task.operation,
                    password: task.password,
                    options: task.options
                }, [arrayBuffer]);
                
                // Store chunk promise
                task.chunks[chunkIndex] = { resolve, reject, processed: false };
                
            }).catch(error => {
                reject(error);
            });
        });
    }
    
    /**
     * Calculate optimal chunk size
     */
    calculateOptimalChunkSize(fileSize) {
        let chunkSize = this.config.processing.chunkSize;
        
        // Adjust based on file size
        if (fileSize > 1 * 1024 * 1024 * 1024) { // > 1GB
            chunkSize = this.config.processing.maxChunkSize;
        } else if (fileSize < 10 * 1024 * 1024) { // < 10MB
            chunkSize = this.config.processing.minChunkSize;
        }
        
        // Adjust based on available workers
        const availableWorkers = this.getAvailableWorkerCount();
        if (availableWorkers > 4) {
            chunkSize = Math.min(chunkSize * 2, this.config.processing.maxChunkSize);
        }
        
        return chunkSize;
    }
    
    // ============================================================================
    // WORKER COMMUNICATION
    // ============================================================================
    
    /**
     * Handle worker message
     */
    handleWorkerMessage(workerId, event) {
        const data = event.data;
        const worker = this.workers.get(workerId);
        
        if (!worker || !data) return;
        
        worker.lastUsed = Date.now();
        
        switch (data.type) {
            case 'READY':
                console.log(`Worker ${workerId} is ready`);
                break;
                
            case 'PROGRESS':
                this.handleTaskProgress(data.taskId, data.progress);
                break;
                
            case 'CHUNK_COMPLETE':
                this.handleChunkComplete(data.taskId, data.chunkIndex, data.result);
                break;
                
            case 'TASK_COMPLETE':
                this.handleTaskComplete(data.taskId, data.result);
                break;
                
            case 'ERROR':
                this.handleWorkerTaskError(workerId, data.taskId, data.error);
                break;
                
            case 'STATUS':
                // Worker status update
                console.log(`Worker ${workerId} status:`, data.status);
                break;
        }
    }
    
    /**
     * Handle task progress update
     */
    handleTaskProgress(taskId, progress) {
        const task = this.tasks.get(taskId);
        if (!task) return;
        
        task.progress = progress;
        this.emitTaskUpdate(taskId, 'processing', progress);
    }
    
    /**
     * Handle chunk complete
     */
    handleChunkComplete(taskId, chunkIndex, result) {
        const task = this.tasks.get(taskId);
        if (!task) return;
        
        // Store chunk result
        task.results[chunkIndex] = result;
        task.chunksProcessed = (task.chunksProcessed || 0) + 1;
        
        // Resolve chunk promise
        if (task.chunks[chunkIndex]) {
            task.chunks[chunkIndex].resolve(result);
            task.chunks[chunkIndex].processed = true;
        }
        
        // Check if all chunks are complete
        if (task.chunksProcessed === task.totalChunks) {
            this.combineChunkResults(task);
        }
    }
    
    /**
     * Combine chunk results
     */
    combineChunkResults(task) {
        try {
            // Sort results by chunk index
            const sortedResults = task.results
                .filter(r => r !== undefined)
                .sort((a, b) => a.chunkIndex - b.chunkIndex);
            
            // Combine all data
            const totalSize = sortedResults.reduce((sum, result) => sum + result.data.byteLength, 0);
            const combinedData = new Uint8Array(totalSize);
            
            let offset = 0;
            sortedResults.forEach(result => {
                combinedData.set(new Uint8Array(result.data), offset);
                offset += result.data.byteLength;
            });
            
            // Complete task
            this.completeTask(task.id, {
                data: combinedData.buffer,
                metadata: {
                    originalSize: task.file.size,
                    processedSize: totalSize,
                    chunks: sortedResults.length
                }
            });
            
        } catch (error) {
            this.handleTaskError(task.id, error);
        }
    }
    
    /**
     * Handle task complete
     */
    handleTaskComplete(taskId, result) {
        this.completeTask(taskId, result);
    }
    
    /**
     * Complete a task
     */
    completeTask(taskId, result) {
        const task = this.tasks.get(taskId);
        if (!task) return;
        
        const workerId = task.workerId;
        
        try {
            // Calculate task time
            const taskTime = Date.now() - task.startTime;
            
            // Update performance stats
            this.performance.tasksCompleted++;
            this.performance.totalProcessingTime += taskTime;
            
            if (this.config.performance.trackTaskTimes) {
                this.performance.taskHistory.push({
                    taskId,
                    operation: task.operation,
                    fileSize: task.file.size,
                    time: taskTime,
                    workerId
                });
                
                if (this.performance.taskHistory.length > this.config.performance.maxTaskHistory) {
                    this.performance.taskHistory.shift();
                }
            }
            
            // Update worker stats
            if (workerId) {
                const workerStats = this.performance.workerStats.get(workerId);
                if (workerStats) {
                    workerStats.tasksCompleted++;
                    workerStats.totalTime += taskTime;
                    workerStats.lastTaskTime = taskTime;
                }
                
                // Mark worker as available
                this.markWorkerBusy(workerId, false);
            }
            
            // Resolve task promise
            task.resolve(result);
            
            // Update task status
            task.status = 'completed';
            task.progress = 100;
            
            // Emit completion event
            this.emitTaskUpdate(taskId, 'completed', 100, result);
            
            console.log(`Task ${taskId} completed in ${taskTime}ms`);
            
            // Remove task from map
            setTimeout(() => {
                this.tasks.delete(taskId);
            }, 5000); // Keep for 5 seconds for debugging
            
            // Process next task
            this.processNextTask();
            
        } catch (error) {
            console.error(`Error completing task ${taskId}:`, error);
            task.reject(error);
            this.tasks.delete(taskId);
        }
    }
    
    /**
     * Send message to worker
     */
    sendToWorker(workerId, message, transfer = []) {
        const worker = this.workers.get(workerId);
        if (!worker || !worker.worker) {
            throw new Error(`Worker ${workerId} not found`);
        }
        
        try {
            worker.worker.postMessage(message, transfer);
        } catch (error) {
            console.error(`Failed to send message to worker ${workerId}:`, error);
            throw error;
        }
    }
    
    // ============================================================================
    // WORKER POOL MANAGEMENT
    // ============================================================================
    
    /**
     * Get available worker
     */
    async getAvailableWorker() {
        // Find idle worker
        for (const [workerId, worker] of this.workers.entries()) {
            if (!worker.busy && worker.worker) {
                return workerId;
            }
        }
        
        // Create new worker if under limit
        if (this.workers.size < this.config.pool.maxWorkers) {
            const workerId = await this.createWorker();
            return workerId;
        }
        
        // No workers available
        return null;
    }
    
    /**
     * Get available worker count
     */
    getAvailableWorkerCount() {
        let count = 0;
        for (const worker of this.workers.values()) {
            if (!worker.busy) count++;
        }
        return count;
    }
    
    /**
     * Get total worker count
     */
    getWorkerCount() {
        return this.workers.size;
    }
    
    /**
     * Mark worker as busy/available
     */
    markWorkerBusy(workerId, busy) {
        const worker = this.workers.get(workerId);
        if (worker) {
            worker.busy = busy;
            worker.lastUsed = Date.now();
            
            if (busy) {
                worker.tasksCompleted++;
            }
        }
    }
    
    /**
     * Start cleanup interval
     */
    startCleanupInterval() {
        this.cleanupInterval = setInterval(() => {
            this.cleanupIdleWorkers();
        }, 30000); // Every 30 seconds
    }
    
    /**
     * Cleanup idle workers
     */
    cleanupIdleWorkers() {
        const now = Date.now();
        const workersToRemove = [];
        
        for (const [workerId, worker] of this.workers.entries()) {
            // Skip if worker is busy
            if (worker.busy) continue;
            
            // Check if worker has been idle too long
            const idleTime = now - worker.lastUsed;
            if (idleTime > this.config.pool.idleTimeout) {
                workersToRemove.push(workerId);
            }
            
            // Check if worker is too old
            const age = now - worker.created;
            if (age > this.config.pool.workerLifetime) {
                workersToRemove.push(workerId);
            }
        }
        
        // Remove workers
        workersToRemove.forEach(workerId => {
            this.destroyWorker(workerId);
        });
        
        if (workersToRemove.length > 0) {
            console.log(`Cleaned up ${workersToRemove.length} idle workers`);
        }
    }
    
    /**
     * Destroy worker
     */
    destroyWorker(workerId) {
        const worker = this.workers.get(workerId);
        if (!worker) return;
        
        try {
            // Terminate worker
            if (worker.worker) {
                worker.worker.terminate();
            }
            
            // Remove from map
            this.workers.delete(workerId);
            this.performance.workerStats.delete(workerId);
            
            console.log(`Destroyed worker ${workerId}`);
            
        } catch (error) {
            console.error(`Error destroying worker ${workerId}:`, error);
        }
    }
    
    /**
     * Terminate all workers
     */
    terminateAll() {
        console.log('Terminating all workers...');
        
        // Clear cleanup interval
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
            this.cleanupInterval = null;
        }
        
        // Terminate all workers
        for (const [workerId] of this.workers.entries()) {
            this.destroyWorker(workerId);
        }
        
        // Clear task queue
        this.taskQueue = [];
        
        // Reject all pending tasks
        for (const [taskId, task] of this.tasks.entries()) {
            if (task.status === 'queued' || task.status === 'processing') {
                task.reject(new Error('Worker manager terminated'));
                this.tasks.delete(taskId);
            }
        }
        
        console.log('All workers terminated');
    }
    
    // ============================================================================
    // ERROR HANDLING
    // ============================================================================
    
    /**
     * Handle worker error
     */
    handleWorkerError(workerId, error) {
        console.error(`Worker ${workerId} error:`, error);
        
        this.errors.workerErrors++;
        this.errors.lastErrorTime = Date.now();
        
        // Check for fatal error threshold
        if (this.errors.workerErrors > this.config.errors.fatalErrorThreshold) {
            this.handleFatalError('WORKER_ERROR_THRESHOLD_EXCEEDED', error);
            return;
        }
        
        // Destroy faulty worker
        this.destroyWorker(workerId);
        
        // Create replacement worker
        setTimeout(() => {
            this.createWorker();
        }, this.config.errors.retryDelay);
    }
    
    /**
     * Handle worker message error
     */
    handleWorkerMessageError(workerId, error) {
        console.error(`Worker ${workerId} message error:`, error);
        this.handleWorkerError(workerId, error);
    }
    
    /**
     * Handle worker task error
     */
    handleWorkerTaskError(workerId, taskId, error) {
        console.error(`Worker ${workerId} task ${taskId} error:`, error);
        
        const task = this.tasks.get(taskId);
        if (!task) return;
        
        // Retry logic
        task.retries = (task.retries || 0) + 1;
        
        if (task.retries <= this.config.errors.maxRetries) {
            console.log(`Retrying task ${taskId} (attempt ${task.retries})`);
            
            // Delay before retry
            setTimeout(() => {
                if (this.tasks.has(taskId)) {
                    this.queueTask(task);
                    this.processNextTask();
                }
            }, this.config.errors.retryDelay * task.retries);
            
        } else {
            // Max retries exceeded
            this.handleTaskError(taskId, new Error(`Task failed after ${task.retries} retries: ${error.message}`));
        }
    }
    
    /**
     * Handle task error
     */
    handleTaskError(taskId, error) {
        const task = this.tasks.get(taskId);
        if (!task) return;
        
        console.error(`Task ${taskId} failed:`, error);
        
        // Update performance stats
        this.performance.tasksFailed++;
        
        // Update worker stats
        if (task.workerId) {
            const workerStats = this.performance.workerStats.get(task.workerId);
            if (workerStats) {
                workerStats.tasksFailed++;
            }
            
            // Mark worker as available
            this.markWorkerBusy(task.workerId, false);
        }
        
        // Reject task promise
        task.reject(error);
        
        // Update task status
        task.status = 'failed';
        this.emitTaskUpdate(taskId, 'failed', task.progress, error);
        
        // Remove task
        setTimeout(() => {
            this.tasks.delete(taskId);
        }, 5000);
        
        // Process next task
        this.processNextTask();
    }
    
    /**
     * Handle fatal error
     */
    handleFatalError(type, error) {
        console.error(`FATAL ERROR (${type}):`, error);
        
        this.errors.fatalErrors.push({
            type,
            error: error.message,
            timestamp: Date.now(),
            workerCount: this.workers.size,
            taskCount: this.tasks.size
        });
        
        // Disable worker manager
        this.enabled = false;
        
        // Terminate all workers
        this.terminateAll();
        
        // Emit fatal error event
        this.emitFatalError(type, error);
    }
    
    /**
     * Setup error handling
     */
    setupErrorHandling() {
        // Global error handler for unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            console.error('Unhandled promise rejection in WorkerManager:', event.reason);
        });
        
        // Error event listener
        window.addEventListener('error', (event) => {
            if (event.filename && event.filename.includes('worker')) {
                console.error('Worker script error:', event.error);
            }
        });
    }
    
    // ============================================================================
    // FALLBACK METHODS
    // ============================================================================
    
    /**
     * Process in main thread (fallback)
     */
    async processInMainThread(file, operation, password, options) {
        console.log('Processing in main thread (Web Workers not available)');
        
        // Import crypto engine
        if (typeof window.CryptoEngine === 'undefined') {
            throw new Error('Crypto engine not available');
        }
        
        try {
            let result;
            
            if (operation === 'encrypt') {
                result = await window.CryptoEngine.encryptFile(file, password, options);
            } else if (operation === 'decrypt') {
                const arrayBuffer = await file.arrayBuffer();
                result = await window.CryptoEngine.decryptFile(
                    new Uint8Array(arrayBuffer),
                    password,
                    (progress) => {
                        this.emitTaskUpdate('main_thread', 'processing', progress);
                    }
                );
            } else {
                throw new Error(`Unknown operation: ${operation}`);
            }
            
            return result;
            
        } catch (error) {
            console.error('Main thread processing failed:', error);
            throw error;
        }
    }
    
    // ============================================================================
    // UTILITY METHODS
    // ============================================================================
    
    /**
     * Generate task ID
     */
    generateTaskId() {
        return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    /**
     * Format bytes to human readable
     */
    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    /**
     * Emit task update event
     */
    emitTaskUpdate(taskId, status, progress, data = null) {
        const event = new CustomEvent('workermanager:taskupdate', {
            detail: { taskId, status, progress, data }
        });
        window.dispatchEvent(event);
    }
    
    /**
     * Emit fatal error event
     */
    emitFatalError(type, error) {
        const event = new CustomEvent('workermanager:fatalerror', {
            detail: { type, error: error.message }
        });
        window.dispatchEvent(event);
    }
    
    /**
     * Get statistics
     */
    getStatistics
