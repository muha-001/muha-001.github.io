/**
 * CipherVault 3D Pro - Web Workers Manager
 * Version: 4.3.0
 * 
 * Manages Web Workers for parallel file processing and encryption/decryption
 * Handles chunking, task distribution, memory management, and error recovery.
 * Designed for processing large files (up to 10GB) efficiently.
 */

class CipherVaultWorkerManager {
    /**
     * Initializes the Worker Manager
     * @param {Object} config - Configuration object
     */
    constructor(config = {}) {
        this.config = {
            // Pool configuration
            maxWorkers: Math.min(navigator.hardwareConcurrency || 4, 8), // Cap at 8
            minWorkers: 1,
            workerLifetime: 5 * 60 * 1000, // 5 minutes
            idleTimeout: 30 * 1000, // 30 seconds
            maxQueueSize: 200,

            // File processing configuration
            processing: {
                chunkSize: 10 * 1024 * 1024, // 10MB
                maxChunkSize: 100 * 1024 * 1024, // 100MB
                minChunkSize: 1 * 1024 * 1024, // 1MB
                parallelChunks: 2,
                memoryThreshold: 512 * 1024 * 1024 // 512MB
            },

            // Worker script paths
            scripts: {
                cryptoWorker: '/assets/js/crypto-worker.js',
                fileWorker: '/assets/js/file-worker.js', // Placeholder
                compressionWorker: '/assets/js/compression-worker.js' // Placeholder
            },

            // Performance monitoring
            performance: {
                trackTaskTimes: true,
                maxTaskHistory: 200,
                slowTaskThreshold: 5000 // 5 seconds
            },

            // Error handling
            errors: {
                maxRetries: 3,
                retryDelay: 1000,
                fatalErrorThreshold: 5
            },
            ...config // Merge with passed config
        };

        // Worker pool
        this.workers = new Map(); // workerId -> { worker, busy, lastUsed, tasksCompleted, type }
        this.workerQueue = []; // Queue of available workers
        this.nextWorkerId = 1;

        // Task management
        this.tasks = new Map(); // taskId -> { promise, resolve, reject, workerId, startTime, progressCallback, operation, ... }
        this.taskQueue = []; // Queue of pending tasks
        this.nextTaskId = 1;

        // Performance tracking
        this.performance = {
            tasksCompleted: 0,
            tasksFailed: 0,
            totalProcessingTime: 0,
            taskHistory: [],
            workerStats: new Map() // workerId -> { tasksCompleted, tasksFailed, totalTime, lastTaskTime }
        };

        // State
        this.initialized = false;
        this.enabled = true;
        this.cleanupInterval = null;
        this.status = 'idle'; // idle, initializing, active, error

        // Error tracking
        this.errors = {
            workerErrors: 0,
            lastErrorTime: 0,
            fatalErrors: []
        };

        // Event system for UI updates
        this.eventHandlers = {
            onTaskStart: null,
            onTaskProgress: null,
            onTaskComplete: null,
            onTaskError: null,
            onWorkerChange: null
        };

        console.log('[WorkerManager] Initialized with config:', this.config);
    }

    /**
     * Initializes the worker manager
     */
    async init() {
        if (this.initialized) {
            console.warn('[WorkerManager] Already initialized.');
            return;
        }

        console.log('[WorkerManager] Initializing...');
        this.status = 'initializing';

        try {
            // Check if Workers are supported
            if (!this.isSupported()) {
                console.warn('[WorkerManager] Web Workers not supported, falling back to main thread.');
                this.enabled = false;
                this.status = 'error';
                return;
            }

            // Create initial worker pool
            await this.createWorkerPool();

            // Start cleanup interval
            this.startCleanupInterval();

            // Setup error handling
            this.setupErrorHandling();

            this.initialized = true;
            this.status = 'active';
            console.log(`[WorkerManager] Initialized with ${this.workers.size} workers. Status: ${this.status}`);

        } catch (error) {
            console.error('[WorkerManager] Initialization failed:', error);
            this.status = 'error';
            this.enabled = false;
            this.handleError('INITIALIZATION_ERROR', error);
        }
    }

    /**
     * Checks if Web Workers are supported
     */
    isSupported() {
        return typeof Worker !== 'undefined' && 
               typeof Blob !== 'undefined' &&
               typeof URL !== 'undefined';
    }

    /**
     * Creates the initial worker pool
     */
    async createWorkerPool() {
        const initialWorkers = Math.min(
            this.config.minWorkers,
            this.config.maxWorkers
        );

        console.log(`[WorkerManager] Creating initial pool of ${initialWorkers} workers.`);
        for (let i = 0; i < initialWorkers; i++) {
            await this.createWorker('crypto'); // Default type
        }
    }

    /**
     * Creates a new worker
     * @param {string} type - Type of worker ('crypto', 'file', 'compression')
     */
    async createWorker(type = 'crypto') {
        if (!this.enabled) return null;

        const workerId = this.nextWorkerId++;
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

        try {
            console.log(`[WorkerManager] Creating worker ${workerId} (${type}) using script: ${workerScript}`);
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

            // Add to queue
            this.workerQueue.push(workerId);

            console.log(`[WorkerManager] Created worker ${workerId} (${type}) successfully.`);

            // Emit event
            if (this.eventHandlers.onWorkerChange) {
                this.eventHandlers.onWorkerChange({ type: 'add', workerId, count: this.workers.size });
            }

            return workerId;

        } catch (error) {
            console.error(`[WorkerManager] Failed to create worker ${workerId}:`, error);
            this.handleError('WORKER_CREATION_FAILED', error);
            return null;
        }
    }

    /**
     * Processes a file using workers
     * @param {File} file - The file to process
     * @param {string} operation - 'encrypt' or 'decrypt'
     * @param {string} password - The password for encryption/decryption
     * @param {Object} options - Processing options
     * @param {function} progressCallback - Callback for progress updates
     */
    async processFile(file, operation, password, options = {}, progressCallback = null) {
        if (!this.enabled || !this.initialized) {
            console.warn('[WorkerManager] Not enabled or not initialized, falling back to main thread processing.');
            // Fallback to main thread processing if needed
            // This should be handled by the caller (e.g., in main.js or file-processor.js)
            throw new Error('WorkerManager not ready for processing.');
        }

        const taskId = this.generateTaskId();
        console.log(`[WorkerManager] Starting task ${taskId}: ${operation} for ${file.name}`);

        // Emit task start event
        if (this.eventHandlers.onTaskStart) {
            this.eventHandlers.onTaskStart({ taskId, fileName: file.name, operation });
        }

        return new Promise((resolve, reject) => {
            const task = {
                id: taskId,
                operation,
                file,
                password,
                options,
                progressCallback,
                startTime: Date.now(),
                resolve,
                reject,
                status: 'queued',
                progress: 0,
                chunks: [], // For large files
                results: [] // For large files
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
     * Queues a task for processing
     */
    queueTask(task) {
        if (this.taskQueue.length >= this.config.maxQueueSize) {
            console.warn('[WorkerManager] Task queue is full.');
            task.reject(new Error('Task queue is full'));
            this.tasks.delete(task.id);
            return;
        }

        this.taskQueue.push(task);
        task.status = 'queued';

        // Emit progress event
        this.emitTaskProgress(task.id, 0, 'Queued');
    }

    /**
     * Processes the next task in the queue
     */
    async processNextTask() {
        if (this.taskQueue.length === 0 || this.status !== 'active') return;

        const workerId = await this.getAvailableWorker();
        if (!workerId) {
            // console.log('[WorkerManager] No available workers, waiting...');
            return; // No workers available, will retry when one becomes free
        }

        const task = this.taskQueue.shift();
        if (!task) return; // Should not happen if queue is checked

        task.status = 'processing';
        task.workerId = workerId;
        this.markWorkerBusy(workerId, true);

        // Emit progress event
        this.emitTaskProgress(task.id, 0, 'Processing');

        console.log(`[WorkerManager] Assigning task ${task.id} to worker ${workerId}`);

        // Determine processing method based on file size
        if (task.file.size > this.config.processing.memoryThreshold) {
            await this.processLargeFile(task, workerId);
        } else {
            await this.processSmallFile(task, workerId);
        }
    }

    /**
     * Processes a small file (single chunk)
     */
    async processSmallFile(task, workerId) {
        try {
            const arrayBuffer = await task.file.arrayBuffer();

            // Send to worker
            this.sendToWorker(workerId, {
                type: 'PROCESS_FILE',
                taskId: task.id,
                operation: task.operation,
                data: arrayBuffer,
                password: task.password,
                options: task.options
            }, [arrayBuffer]); // Transfer arrayBuffer

        } catch (error) {
            this.handleTaskError(task.id, error);
        }
    }

    /**
     * Processes a large file (multiple chunks)
     */
    async processLargeFile(task, workerId) {
        const fileSize = task.file.size;
        const chunkSize = this.calculateOptimalChunkSize(fileSize);
        const totalChunks = Math.ceil(fileSize / chunkSize);

        console.log(`[WorkerManager] Processing large file in ${totalChunks} chunks of ${this.formatBytes(chunkSize)} each.`);

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

            try {
                await Promise.all(chunkPromises);
            } catch (error) {
                console.error(`[WorkerManager] Error in chunk batch starting at ${i}:`, error);
                this.handleTaskError(task.id, error);
                return;
            }

            // Update progress
            const progress = Math.round(((i + parallelChunks) / totalChunks) * 100);
            this.emitTaskProgress(task.id, progress, `Processing Chunks ${Math.min(i + parallelChunks, totalChunks)}/${totalChunks}`);
        }
    }

    /**
     * Processes a single chunk
     */
    async processChunk(task, workerId, chunkIndex, start, end) {
        return new Promise((resolve, reject) => {
            const chunk = task.file.slice(start, end);
            const chunkId = `${task.id}_${chunkIndex}`;

            chunk.arrayBuffer().then(arrayBuffer => {
                // Send chunk to worker
                this.sendToWorker(workerId, {
                    type: 'PROCESS_CHUNK',
                    taskId: task.id,
                    chunkId,
                    chunkIndex,
                    totalChunks: task.totalChunks,
                     arrayBuffer,
                    operation: task.operation,
                    password: task.password,
                    options: task.options
                }, [arrayBuffer]); // Transfer arrayBuffer

                // Store chunk promise
                task.chunks[chunkIndex] = { resolve, reject, processed: false };

            }).catch(error => {
                console.error(`[WorkerManager] Error reading chunk ${chunkIndex}:`, error);
                reject(error);
            });
        });
    }

    /**
     * Calculates optimal chunk size based on file size and available workers
     */
    calculateOptimalChunkSize(fileSize) {
        let chunkSize = this.config.processing.chunkSize;

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
    // COMMUNICATION
    // ============================================================================

    /**
     * Handles messages from workers
     */
    handleWorkerMessage(workerId, event) {
        const data = event.data;
        const worker = this.workers.get(workerId);

        if (!worker || !data) {
            console.warn('[WorkerManager] Received invalid message or worker not found.');
            return;
        }

        worker.lastUsed = Date.now();

        switch (data.type) {
            case 'READY':
                console.log(`[WorkerManager] Worker ${workerId} is ready.`);
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
                console.log(`[WorkerManager] Worker ${workerId} status:`, data.status);
                break;

            default:
                console.warn(`[WorkerManager] Unknown message type from worker ${workerId}:`, data.type);
        }
    }

    /**
     * Handles task progress updates
     */
    handleTaskProgress(taskId, progress) {
        const task = this.tasks.get(taskId);
        if (!task) return;

        task.progress = progress;
        this.emitTaskProgress(taskId, progress, `Processing... ${progress}%`);
    }

    /**
     * Emits task progress event
     */
    emitTaskProgress(taskId, progress, statusMessage) {
        const task = this.tasks.get(taskId);
        if (!task) return;

        if (task.progressCallback) {
            task.progressCallback(progress, statusMessage);
        }

        // Emit event
        if (this.eventHandlers.onTaskProgress) {
            this.eventHandlers.onTaskProgress({ taskId, progress, statusMessage });
        }
    }

    /**
     * Handles chunk completion
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
     * Combines chunk results for large files
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
                 combinedData.buffer,
                meta {
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
     * Handles task completion
     */
    handleTaskComplete(taskId, result) {
        this.completeTask(taskId, result);
    }

    /**
     * Completes a task
     */
    completeTask(taskId, result) {
        const task = this.tasks.get(taskId);
        if (!task) return;

        const workerId = task.workerId;
        const taskTime = Date.now() - task.startTime;

        try {
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
            task.status = 'completed';
            task.progress = 100;

            console.log(`[WorkerManager] Task ${taskId} completed in ${taskTime}ms.`);

            // Emit event
            if (this.eventHandlers.onTaskComplete) {
                this.eventHandlers.onTaskComplete({ taskId, result, time: taskTime });
            }

            // Remove task after a delay to allow for debugging
            setTimeout(() => {
                this.tasks.delete(taskId);
            }, 5000);

            // Process next task
            this.processNextTask();

        } catch (error) {
            console.error(`[WorkerManager] Error completing task ${taskId}:`, error);
            task.reject(error);
            this.tasks.delete(taskId);
        }
    }

    /**
     * Sends a message to a worker
     */
    sendToWorker(workerId, message, transfer = []) {
        const worker = this.workers.get(workerId);
        if (!worker || !worker.worker) {
            console.error(`[WorkerManager] Worker ${workerId} not found or not active.`);
            return;
        }

        try {
            worker.worker.postMessage(message, transfer);
        } catch (error) {
            console.error(`[WorkerManager] Failed to send message to worker ${workerId}:`, error);
            this.handleWorkerError(workerId, error);
            throw error;
        }
    }

    // ============================================================================
    // WORKER MANAGEMENT
    // ============================================================================

    /**
     * Gets an available worker
     */
    async getAvailableWorker() {
        // Find idle worker in queue
        for (const workerId of this.workerQueue) {
            const worker = this.workers.get(workerId);
            if (worker && !worker.busy) {
                return workerId;
            }
        }

        // Create new worker if under limit
        if (this.workers.size < this.config.maxWorkers) {
            const workerId = await this.createWorker();
            return workerId;
        }

        // No workers available
        return null;
    }

    /**
     * Gets available worker count
     */
    getAvailableWorkerCount() {
        let count = 0;
        for (const worker of this.workers.values()) {
            if (!worker.busy) count++;
        }
        return count;
    }

    /**
     * Marks a worker as busy or available
     */
    markWorkerBusy(workerId, busy) {
        const worker = this.workers.get(workerId);
        if (worker) {
            worker.busy = busy;
            worker.lastUsed = Date.now();

            if (busy) {
                worker.tasksCompleted++;
            } else {
                // Add back to queue if available
                if (!this.workerQueue.includes(workerId)) {
                    this.workerQueue.push(workerId);
                }
            }
        }
    }

    /**
     * Starts cleanup interval
     */
    startCleanupInterval() {
        this.cleanupInterval = setInterval(() => {
            this.cleanupIdleWorkers();
        }, 30000); // Every 30 seconds
    }

    /**
     * Cleans up idle workers
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
            console.log(`[WorkerManager] Cleaned up ${workersToRemove.length} idle workers.`);
        }
    }

    /**
     * Destroys a worker
     */
    destroyWorker(workerId) {
        const worker = this.workers.get(workerId);
        if (!worker) return;

        try {
            // Terminate worker
            if (worker.worker) {
                worker.worker.terminate();
            }

            // Remove from maps
            this.workers.delete(workerId);
            this.performance.workerStats.delete(workerId);

            // Remove from queue
            const queueIndex = this.workerQueue.indexOf(workerId);
            if (queueIndex > -1) {
                this.workerQueue.splice(queueIndex, 1);
            }

            console.log(`[WorkerManager] Destroyed worker ${workerId}`);

            // Emit event
            if (this.eventHandlers.onWorkerChange) {
                this.eventHandlers.onWorkerChange({ type: 'remove', workerId, count: this.workers.size });
            }

        } catch (error) {
            console.error(`[WorkerManager] Error destroying worker ${workerId}:`, error);
        }
    }

    /**
     * Terminates all workers
     */
    terminateAll() {
        console.log('[WorkerManager] Terminating all workers...');

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

        this.status = 'terminated';
        console.log('[WorkerManager] All workers terminated.');
    }

    // ============================================================================
    // ERROR HANDLING
    // ============================================================================

    /**
     * Handles worker error
     */
    handleWorkerError(workerId, error) {
        console.error(`[WorkerManager] Worker ${workerId} error:`, error);
        this.errors.workerErrors++;
        this.errors.lastErrorTime = Date.now();

        // Check for fatal error threshold
        if (this.errors.workerErrors > this.config.errors.fatalErrorThreshold) {
            this.handleError('WORKER_ERROR_THRESHOLD_EXCEEDED', error);
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
     * Handles worker message error
     */
    handleWorkerMessageError(workerId, error) {
        console.error(`[WorkerManager] Worker ${workerId} message error:`, error);
        this.handleWorkerError(workerId, error);
    }

    /**
     * Handles worker task error
     */
    handleWorkerTaskError(workerId, taskId, error) {
        console.error(`[WorkerManager] Worker ${workerId} task ${taskId} error:`, error);

        const task = this.tasks.get(taskId);
        if (!task) return;

        // Retry logic
        task.retries = (task.retries || 0) + 1;

        if (task.retries <= this.config.errors.maxRetries) {
            console.log(`[WorkerManager] Retrying task ${taskId} (attempt ${task.retries})`);
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
     * Handles task error
     */
    handleTaskError(taskId, error) {
        const task = this.tasks.get(taskId);
        if (!task) return;

        console.error(`[WorkerManager] Task ${taskId} failed:`, error);

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
        task.status = 'failed';

        // Emit event
        if (this.eventHandlers.onTaskError) {
            this.eventHandlers.onTaskError({ taskId, error: error.message });
        }

        // Remove task
        setTimeout(() => {
            this.tasks.delete(taskId);
        }, 5000);

        // Process next task
        this.processNextTask();
    }

    /**
     * Handles a general error
     */
    handleError(type, error) {
        console.error(`[WorkerManager] FATAL ERROR (${type}):`, error);

        this.errors.fatalErrors.push({
            type,
            error: error.message,
            timestamp: Date.now(),
            workerCount: this.workers.size,
            taskCount: this.tasks.size
        });

        // Disable manager
        this.enabled = false;
        this.status = 'error';

        // Terminate all workers
        this.terminateAll();

        // Log error for UI
        console.error('[WorkerManager] Manager disabled due to fatal error.');
    }

    /**
     * Sets up error handling
     */
    setupErrorHandling() {
        // Global error handler for unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            console.error('[WorkerManager] Unhandled promise rejection in WorkerManager:', event.reason);
        });

        // Error event listener
        window.addEventListener('error', (event) => {
            if (event.filename && event.filename.includes('worker')) {
                console.error('[WorkerManager] Worker script error:', event.error);
            }
        });
    }

    // ============================================================================
    // UTILITY METHODS
    // ============================================================================

    /**
     * Generates a task ID
     */
    generateTaskId() {
        return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Formats bytes to human readable format
     */
    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';

        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    /**
     * Gets worker manager statistics
     */
    getStatistics() {
        const activeWorkers = Array.from(this.workers.values()).filter(w => !w.busy).length;
        const busyWorkers = Array.from(this.workers.values()).filter(w => w.busy).length;

        const avgTaskTime = this.performance.tasksCompleted > 0 
            ? this.performance.totalProcessingTime / this.performance.tasksCompleted 
            : 0;

        const workerDetails = Array.from(this.performance.workerStats.entries()).map(([id, stats]) => ({
            workerId: id,
            tasksCompleted: stats.tasksCompleted,
            tasksFailed: stats.tasksFailed,
            totalTime: stats.totalTime,
            avgTimePerTask: stats.tasksCompleted > 0 ? stats.totalTime / stats.tasksCompleted : 0
        }));

        return {
            status: this.status,
            workers: {
                total: this.workers.size,
                active: activeWorkers,
                busy: busyWorkers,
                details: workerDetails
            },
            tasks: {
                completed: this.performance.tasksCompleted,
                failed: this.performance.tasksFailed,
                pending: this.tasks.size,
                queued: this.taskQueue.length,
                successRate: this.performance.tasksCompleted > 0 
                    ? (this.performance.tasksCompleted / (this.performance.tasksCompleted + this.performance.tasksFailed)) * 100 
                    : 0
            },
            performance: {
                avgTaskTime: avgTaskTime,
                totalProcessingTime: this.performance.totalProcessingTime,
                recentTasks: this.performance.taskHistory.slice(-10)
            },
            errors: {
                workerErrors: this.errors.workerErrors,
                fatalErrors: this.errors.fatalErrors.length,
                lastErrorTime: this.errors.lastErrorTime
            },
            config: {
                maxWorkers: this.config.maxWorkers,
                memoryThreshold: this.config.processing.memoryThreshold,
                chunkSize: this.config.processing.chunkSize
            }
        };
    }

    /**
     * Resets statistics
     */
    resetStatistics() {
        this.performance.tasksCompleted = 0;
        this.performance.tasksFailed = 0;
        this.performance.totalProcessingTime = 0;
        this.performance.taskHistory = [];

        for (const [workerId, stats] of this.performance.workerStats.entries()) {
            stats.tasksCompleted = 0;
            stats.tasksFailed = 0;
            stats.totalTime = 0;
            stats.lastTaskTime = 0;
        }

        this.errors.workerErrors = 0;
        this.errors.lastErrorTime = 0;
        this.errors.fatalErrors = [];

        console.log('[WorkerManager] Statistics reset.');
    }

    /**
     * Sets an event handler
     */
    setEventHandler(event, handler) {
        if (this.eventHandlers.hasOwnProperty(event)) {
            this.eventHandlers[event] = handler;
        } else {
            console.warn(`[WorkerManager] Unknown event: ${event}`);
        }
    }

    /**
     * Gets the current status
     */
    getStatus() {
        return this.status;
    }
}

// Export for module systems or make available globally
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CipherVaultWorkerManager;
} else if (typeof window !== 'undefined') {
    window.CipherVaultWorkerManager = CipherVaultWorkerManager;
    // For backward compatibility, if main.js expects WorkerManager
    window.WorkerManager = CipherVaultWorkerManager;
}

console.log('[WorkerManager] CipherVaultWorkerManager loaded successfully.');
