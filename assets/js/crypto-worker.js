/**
 * CipherVault 3D Pro - Crypto Worker
 * Handles heavy encryption operations in a background thread
 * Version: 4.2.0
 */

self.onmessage = async function(e) {
    const { type, data, taskId } = e.data;
    
    try {
        let result;
        
        switch (type) {
            case 'ENCRYPT_CHUNK':
                result = await encryptChunk(data);
                break;
            case 'DECRYPT_CHUNK':
                result = await decryptChunk(data);
                break;
            case 'DERIVE_KEY':
                result = await deriveKey(data);
                break;
            default:
                throw new Error(`Unknown operation: ${type}`);
        }
        
        // إرسال النتيجة بنجاح
        self.postMessage({
            type: 'SUCCESS',
            taskId: taskId,
            data: result
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
// Core Operations
// ==========================================

async function encryptChunk({ chunk, key, iv, additionalData }) {
    // استيراد المفتاح الخام
    const cryptoKey = await self.crypto.subtle.importKey(
        'raw', 
        key, 
        { name: 'AES-GCM' }, 
        false, 
        ['encrypt']
    );

    // التشفير
    const encrypted = await self.crypto.subtle.encrypt(
        {
            name: 'AES-GCM',
            iv: iv,
            additionalData: additionalData ? new TextEncoder().encode(additionalData) : new Uint8Array(0)
        },
        cryptoKey,
        chunk
    );

    return new Uint8Array(encrypted);
}

async function decryptChunk({ chunk, key, iv, additionalData }) {
    const cryptoKey = await self.crypto.subtle.importKey(
        'raw', 
        key, 
        { name: 'AES-GCM' }, 
        false, 
        ['decrypt']
    );

    const decrypted = await self.crypto.subtle.decrypt(
        {
            name: 'AES-GCM',
            iv: iv,
            additionalData: additionalData ? new TextEncoder().encode(additionalData) : new Uint8Array(0)
        },
        cryptoKey,
        chunk
    );

    return new Uint8Array(decrypted);
}

async function deriveKey({ password, salt, iterations }) {
    const textEncoder = new TextEncoder();
    const keyMaterial = await self.crypto.subtle.importKey(
        'raw',
        textEncoder.encode(password),
        { name: 'PBKDF2' },
        false,
        ['deriveBits', 'deriveKey']
    );

    const key = await self.crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt: salt,
            iterations: iterations,
            hash: 'SHA-256'
        },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
    );

    // تصدير المفتاح لإعادته للخيط الرئيسي (Main Thread)
    const exportedKey = await self.crypto.subtle.exportKey('raw', key);
    return new Uint8Array(exportedKey);
}
