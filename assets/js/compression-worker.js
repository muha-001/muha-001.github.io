/**
 * CipherVault 3D Pro - Compression Worker
 * Handles heavy compression/decompression operations in a background thread
 * Version: 4.3.0
 */

// Import pako library for compression/decompression
importScripts('https://cdn.jsdelivr.net/npm/pako@2.0.4/dist/pako.min.js');

self.onmessage = async function(e) {
    const { type, data, taskId } = e.data;

    try {
        let result;

        switch (type) {
            case 'COMPRESS_DATA':
                result = await compressData(data);
                break;
            case 'DECOMPRESS_DATA':
                result = await decompressData(data);
                break;
            case 'GET_COMPRESSION_INFO':
                result = await getCompressionInfo(data);
                break;
            case 'TEST_COMPRESSION_ALGORITHM':
                result = await testCompressionAlgorithm(data);
                break;
            // Add other compression-related operations as needed
            default:
                throw new Error(`Unknown compression operation: ${type}`);
        }

        // Send success result
        self.postMessage({
            type: 'SUCCESS',
            taskId: taskId,
            result
        }, [result.buffer].filter(b => b)); // Transferable objects for performance

    } catch (error) {
        self.postMessage({
            type: 'ERROR',
            taskId: taskId,
            error: error.message
        });
    }
};

// ==========================================
// Compression Operations (using pako in Worker)
// ==========================================

async function compressData({ data, algorithm = 'deflate', options = { level: 6 } }) {
    const uint8Array = new Uint8Array(data);

    let compressedArray;
    switch (algorithm) {
        case 'deflate':
            compressedArray = pako.deflate(uint8Array, options);
            break;
        case 'gzip':
            compressedArray = pako.gzip(uint8Array, options);
            break;
        case 'inflateRaw': // For raw deflate
            compressedArray = pako.deflateRaw(uint8Array, options);
            break;
        default:
            throw new Error(`Unsupported compression algorithm: ${algorithm}`);
    }

    return compressedArray.buffer;
}

async function decompressData({ data, algorithm = 'inflate' }) {
    const uint8Array = new Uint8Array(data);

    let decompressedArray;
    switch (algorithm) {
        case 'inflate':
            // For standard deflate-compressed data
            decompressedArray = pako.inflate(uint8Array);
            break;
        case 'gunzip':
            // For gzip-compressed data
            decompressedArray = pako.ungzip(uint8Array);
            break;
        case 'inflateRaw': // For raw deflate-compressed data
            decompressedArray = pako.inflateRaw(uint8Array);
            break;
        default:
            throw new Error(`Unsupported decompression algorithm: ${algorithm}`);
    }

    return decompressedArray.buffer;
}

async function getCompressionInfo({ originalSize, compressedSize }) {
    const ratio = originalSize > 0 ? (compressedSize / originalSize) : 0;
    const saved = originalSize - compressedSize;
    const savedPercentage = originalSize > 0 ? ((saved / originalSize) * 100) : 0;

    return {
        originalSize,
        compressedSize,
        ratio: parseFloat(ratio.toFixed(4)),
        saved,
        savedPercentage: parseFloat(savedPercentage.toFixed(2))
    };
}

async function testCompressionAlgorithm({ data, algorithm, options }) {
    try {
        const startTime = performance.now();
        const compressed = await compressData({ data, algorithm, options });
        const endTime = performance.now();
        const compressionTime = endTime - startTime;

        const info = await getCompressionInfo({
            originalSize: data.byteLength,
            compressedSize: compressed.byteLength
        });

        return {
            algorithm,
            success: true,
            compressionTime, // in milliseconds
            info
        };
    } catch (error) {
        return {
            algorithm,
            success: false,
            error: error.message
        };
    }
}

// Add more compression operations as needed...

console.log('[CompressionWorker] Compression Worker initialized with pako.');
