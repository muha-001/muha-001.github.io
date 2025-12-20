/**
 * CipherVault 3D Pro - نظام تسجيل التدقيق المحسن
 * الإصدار: 4.2.0
 */

class EnhancedAuditLogger {
    constructor() {
        this.logs = [];
        this.maxLogs = 10000;
        this.encryptionKey = null;
        this.compressionEnabled = true;
        this.retentionDays = 30;
        this.autoExportInterval = 24 * 60 * 60 * 1000; // 24 ساعة
        
        this.init();
    }
    
    async init() {
        // إنشاء مفتاح تشفير للسجلات
        await this.generateEncryptionKey();
        
        // تحميل السجلات المحفوظة
        await this.loadSavedLogs();
        
        // بدء التصدير التلقائي
        this.startAutoExport();
        
        // بدء التنظيف التلقائي
        this.startAutoCleanup();
        
        this.log('SYSTEM_INITIALIZED', 'INFO', {
            version: '4.2.0',
            maxLogs: this.maxLogs,
            retentionDays: this.retentionDays
        });
    }
    
    async generateEncryptionKey() {
        try {
            this.encryptionKey = await crypto.subtle.generateKey(
                {
                    name: 'AES-GCM',
                    length: 256
                },
                true,
                ['encrypt', 'decrypt']
            );
            
            this.log('ENCRYPTION_KEY_GENERATED', 'INFO', {
                algorithm: 'AES-GCM-256',
                timestamp: Date.now()
            });
        } catch (error) {
            console.error('Failed to generate encryption key:', error);
            this.encryptionKey = null;
        }
    }
    
    async loadSavedLogs() {
        try {
            const saved = localStorage.getItem('ciphervault_audit_logs');
            if (saved) {
                const decrypted = await this.decryptLogs(saved);
                this.logs = decrypted.slice(-this.maxLogs);
                
                this.log('LOGS_LOADED', 'INFO', {
                    count: this.logs.length,
                    source: 'localStorage'
                });
            }
        } catch (error) {
            console.warn('Failed to load saved logs:', error);
            this.logs = [];
        }
    }
    
    async saveLogs() {
        try {
            const logsToSave = this.logs.slice(-this.maxLogs);
            const encrypted = await this.encryptLogs(logsToSave);
            localStorage.setItem('ciphervault_audit_logs', encrypted);
            
            this.log('LOGS_SAVED', 'DEBUG', {
                count: logsToSave.length,
                size: encrypted.length
            });
        } catch (error) {
            console.error('Failed to save logs:', error);
        }
    }
    
    async encryptLogs(logs) {
        if (!this.encryptionKey || logs.length === 0) {
            return JSON.stringify(logs);
        }
        
        try {
            const data = JSON.stringify(logs);
            const encoder = new TextEncoder();
            const dataBuffer = encoder.encode(data);
            
            // ضغط البيانات إذا كان مفعلاً
            let dataToEncrypt = dataBuffer;
            if (this.compressionEnabled) {
                try {
                    const compressed = pako.deflate(dataBuffer);
                    dataToEncrypt = new Uint8Array(compressed);
                } catch (error) {
                    console.warn('Log compression failed:', error);
                }
            }
            
            const iv = crypto.getRandomValues(new Uint8Array(12));
            const encrypted = await crypto.subtle.encrypt(
                {
                    name: 'AES-GCM',
                    iv
                },
                this.encryptionKey,
                dataToEncrypt
            );
            
            const result = {
                iv: Array.from(iv),
                data: Array.from(new Uint8Array(encrypted)),
                compressed: this.compressionEnabled,
                timestamp: Date.now(),
                version: '1.0'
            };
            
            return JSON.stringify(result);
        } catch (error) {
            console.error('Log encryption failed:', error);
            return JSON.stringify(logs);
        }
    }
    
    async decryptLogs(encryptedData) {
        try {
            const parsed = JSON.parse(encryptedData);
            
            // إذا لم تكن البيانات مشفرة، ارجعها كما هي
            if (!parsed.iv || !parsed.data) {
                return parsed;
            }
            
            const iv = new Uint8Array(parsed.iv);
            const encrypted = new Uint8Array(parsed.data);
            
            const decrypted = await crypto.subtle.decrypt(
                {
                    name: 'AES-GCM',
                    iv
                },
                this.encryptionKey,
                encrypted
            );
            
            let decryptedData = new Uint8Array(decrypted);
            
            // فك الضغط إذا كان مضغوطًا
            if (parsed.compressed) {
                try {
                    const decompressed = pako.inflate(decryptedData);
                    decryptedData = new Uint8Array(decompressed);
                } catch (error) {
                    console.warn('Log decompression failed:', error);
                }
            }
            
            const decoder = new TextDecoder();
            return JSON.parse(decoder.decode(decryptedData));
        } catch (error) {
            console.error('Log decryption failed:', error);
            return [];
        }
    }
    
    log(type, severity, data, userId = 'system') {
        const logEntry = {
            id: this.generateLogId(),
            type,
            severity,
            timestamp: Date.now(),
            timestampISO: new Date().toISOString(),
            userId,
            sessionId: window.sessionId || 'unknown',
            userAgent: navigator.userAgent.substring(0, 200),
            ip: this.getClientIP(),
            data: this.sanitizeData(data)
        };
        
        this.logs.push(logEntry);
        
        // الحفاظ على الحد الأقصى للسجلات
        if (this.logs.length > this.maxLogs) {
            this.logs.shift();
        }
        
        // حفظ السجلات بشكل غير متزامن
        setTimeout(() => this.saveLogs(), 100);
        
        // تسجيل في وحدة التحكم للتطوير
        if (process.env.NODE_ENV === 'development') {
            console.log(`[Audit] ${severity}: ${type}`, data);
        }
        
        return logEntry;
    }
    
    generateLogId() {
        return `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}_${crypto.getRandomValues(new Uint8Array(2))
            .reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '')}`;
    }
    
    getClientIP() {
        // هذه وظيفة زائفة - في بيئة حقيقية، ستحتاج إلى خادم back-end
        // للوصول إلى عنوان IP الحقيقي للعميل
        return 'client-side-unknown';
    }
    
    sanitizeData(data) {
        if (typeof data !== 'object' || data === null) {
            return data;
        }
        
        const sanitized = { ...data };
        
        // إزالة البيانات الحساسة
        const sensitiveFields = ['password', 'key', 'secret', 'token', 'credit', 'ssn', 'cvv'];
        
        Object.keys(sanitized).forEach(key => {
            const lowerKey = key.toLowerCase();
            
            // إذا كان الحقل حساسًا، استبدله بقناع
            if (sensitiveFields.some(field => lowerKey.includes(field))) {
                sanitized[key] = '***REDACTED***';
            }
            
            // إذا كانت القيمة كائن، تعقيمها بشكل متكرر
            if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
                sanitized[key] = this.sanitizeData(sanitized[key]);
            }
        });
        
        return sanitized;
    }
    
    startAutoExport() {
        setInterval(async () => {
            await this.exportLogs('auto-backup');
        }, this.autoExportInterval);
    }
    
    startAutoCleanup() {
        setInterval(() => {
            this.cleanupOldLogs();
        }, 60 * 60 * 1000); // كل ساعة
    }
    
    cleanupOldLogs() {
        const cutoffDate = Date.now() - (this.retentionDays * 24 * 60 * 60 * 1000);
        const initialCount = this.logs.length;
        
        this.logs = this.logs.filter(log => log.timestamp > cutoffDate);
        
        const removedCount = initialCount - this.logs.length;
        if (removedCount > 0) {
            this.log('LOGS_CLEANUP', 'INFO', {
                removedCount,
                retentionDays: this.retentionDays,
                remainingCount: this.logs.length
            });
            
            this.saveLogs();
        }
    }
    
    async exportLogs(reason = 'manual') {
        try {
            const exportData = {
                metadata: {
                    exportDate: new Date().toISOString(),
                    reason,
                    version: '4.2.0',
                    totalLogs: this.logs.length
                },
                logs: this.logs
            };
            
            const filename = `audit_logs_${Date.now()}_${reason}.json`;
            const dataStr = JSON.stringify(exportData, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            
            // إنشاء رابط تنزيل
            const url = URL.createObjectURL(dataBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.log('LOGS_EXPORTED', 'INFO', {
                filename,
                logCount: this.logs.length,
                reason
            });
            
            return true;
        } catch (error) {
            console.error('Failed to export logs:', error);
            this.log('LOG_EXPORT_FAILED', 'ERROR', {
                error: error.message,
                reason
            });
            
            return false;
        }
    }
    
    searchLogs(query, filters = {}) {
        let results = [...this.logs];
        
        // تطبيق الفلاتر
        if (filters.severity) {
            results = results.filter(log => 
                filters.severity.includes(log.severity)
            );
        }
        
        if (filters.type) {
            results = results.filter(log => 
                filters.type.includes(log.type)
            );
        }
        
        if (filters.startDate) {
            const startTimestamp = new Date(filters.startDate).getTime();
            results = results.filter(log => log.timestamp >= startTimestamp);
        }
        
        if (filters.endDate) {
            const endTimestamp = new Date(filters.endDate).getTime();
            results = results.filter(log => log.timestamp <= endTimestamp);
        }
        
        if (filters.userId) {
            results = results.filter(log => 
                log.userId.toLowerCase().includes(filters.userId.toLowerCase())
            );
        }
        
        // البحث النصي
        if (query) {
            const searchTerm = query.toLowerCase();
            results = results.filter(log => {
                return (
                    log.type.toLowerCase().includes(searchTerm) ||
                    log.severity.toLowerCase().includes(searchTerm) ||
                    log.userId.toLowerCase().includes(searchTerm) ||
                    JSON.stringify(log.data).toLowerCase().includes(searchTerm)
                );
            });
        }
        
        // الفرز حسب التاريخ (الأحدث أولاً)
        results.sort((a, b) => b.timestamp - a.timestamp);
        
        return {
            query,
            filters,
            totalResults: results.length,
            results: results.slice(0, filters.limit || 100)
        };
    }
    
    getStatistics(timeRange = 'all') {
        const now = Date.now();
        let timeFilteredLogs = this.logs;
        
        // تطبيق نطاق الوقت
        switch (timeRange) {
            case 'day':
                timeFilteredLogs = this.logs.filter(log => 
                    log.timestamp > now - (24 * 60 * 60 * 1000)
                );
                break;
            case 'week':
                timeFilteredLogs = this.logs.filter(log => 
                    log.timestamp > now - (7 * 24 * 60 * 60 * 1000)
                );
                break;
            case 'month':
                timeFilteredLogs = this.logs.filter(log => 
                    log.timestamp > now - (30 * 24 * 60 * 60 * 1000)
                );
                break;
        }
        
        const stats = {
            timeRange,
            totalLogs: timeFilteredLogs.length,
            bySeverity: {},
            byType: {},
            byHour: {},
            byDay: {},
            trends: []
        };
        
        // إحصائيات حسب الشدة
        timeFilteredLogs.forEach(log => {
            stats.bySeverity[log.severity] = (stats.bySeverity[log.severity] || 0) + 1;
        });
        
        // إحصائيات حسب النوع (أعلى 20 نوعًا)
        timeFilteredLogs.forEach(log => {
            stats.byType[log.type] = (stats.byType[log.type] || 0) + 1;
        });
        
        // تحويل إحصائيات النوع إلى مصفوفة وفرزها
        stats.byType = Object.entries(stats.byType)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 20)
            .reduce((obj, [key, value]) => {
                obj[key] = value;
                return obj;
            }, {});
        
        // إحصائيات حسب الساعة
        timeFilteredLogs.forEach(log => {
            const hour = new Date(log.timestamp).getHours();
            stats.byHour[hour] = (stats.byHour[hour] || 0) + 1;
        });
        
        // إحصائيات حسب اليوم
        timeFilteredLogs.forEach(log => {
            const day = new Date(log.timestamp).toLocaleDateString('en-US', { weekday: 'short' });
            stats.byDay[day] = (stats.byDay[day] || 0) + 1;
        });
        
        // حساب الاتجاهات (آخر 7 أيام)
        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const date = new Date(now - (i * 24 * 60 * 60 * 1000));
            return date.toISOString().split('T')[0];
        }).reverse();
        
        last7Days.forEach(date => {
            const dateLogs = timeFilteredLogs.filter(log => 
                new Date(log.timestamp).toISOString().split('T')[0] === date
            );
            
            stats.trends.push({
                date,
                count: dateLogs.length,
                critical: dateLogs.filter(log => log.severity === 'CRITICAL').length,
                errors: dateLogs.filter(log => log.severity === 'HIGH').length
            });
        });
        
        return stats;
    }
    
    generateReport(format = 'html') {
        const stats = this.getStatistics('month');
        const recentCritical = this.searchLogs('', {
            severity: ['CRITICAL', 'HIGH'],
            limit: 10
        });
        
        switch (format) {
            case 'html':
                return this.generateHTMLReport(stats, recentCritical);
            case 'pdf':
                return this.generatePDFReport(stats, recentCritical);
            case 'json':
                return JSON.stringify({
                    statistics: stats,
                    recentCritical: recentCritical.results,
                    summary: {
                        generated: new Date().toISOString(),
                        totalLogs: this.logs.length
                    }
                }, null, 2);
            default:
                return this.generateTextReport(stats, recentCritical);
        }
    }
    
    generateHTMLReport(stats, recentCritical) {
        const criticalCount = stats.bySeverity.CRITICAL || 0;
        const highCount = stats.bySeverity.HIGH || 0;
        
        return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Audit Log Report</title>
                <style>
                    body {
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                        line-height: 1.6;
                        color: #333;
                        max-width: 1200px;
                        margin: 0 auto;
                        padding: 20px;
                        background: #f5f5f5;
                    }
                    
                    .header {
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: white;
                        padding: 30px;
                        border-radius: 10px;
                        margin-bottom: 30px;
                        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                    }
                    
                    .header h1 {
                        margin: 0;
                        font-size: 2.5em;
                    }
                    
                    .header .subtitle {
                        opacity: 0.9;
                        margin-top: 10px;
                    }
                    
                    .stats-grid {
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                        gap: 20px;
                        margin-bottom: 30px;
                    }
                    
                    .stat-card {
                        background: white;
                        padding: 20px;
                        border-radius: 8px;
                        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                    }
                    
                    .stat-card.critical {
                        border-left: 4px solid #dc3545;
                    }
                    
                    .stat-card.warning {
                        border-left: 4px solid #ffc107;
                    }
                    
                    .stat-card.success {
                        border-left: 4px solid #28a745;
                    }
                    
                    .stat-card.info {
                        border-left: 4px solid #17a2b8;
                    }
                    
                    .stat-value {
                        font-size: 2em;
                        font-weight: bold;
                        margin: 10px 0;
                    }
                    
                    .stat-label {
                        color: #666;
                        font-size: 0.9em;
                        text-transform: uppercase;
                        letter-spacing: 1px;
                    }
                    
                    table {
                        width: 100%;
                        background: white;
                        border-radius: 8px;
                        overflow: hidden;
                        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                        margin-bottom: 30px;
                    }
                    
                    th {
                        background: #667eea;
                        color: white;
                        padding: 15px;
                        text-align: left;
                    }
                    
                    td {
                        padding: 15px;
                        border-bottom: 1px solid #eee;
                    }
                    
                    tr:last-child td {
                        border-bottom: none;
                    }
                    
                    .severity-critical {
                        background: #ffe6e6;
                        color: #dc3545;
                        padding: 3px 8px;
                        border-radius: 4px;
                        font-weight: bold;
                    }
                    
                    .severity-high {
                        background: #fff3cd;
                        color: #856404;
                        padding: 3px 8px;
                        border-radius: 4px;
                        font-weight: bold;
                    }
                    
                    .footer {
                        text-align: center;
                        margin-top: 40px;
                        padding-top: 20px;
                        border-top: 1px solid #ddd;
                        color: #666;
                        font-size: 0.9em;
                    }
                    
                    .chart-container {
                        background: white;
                        padding: 20px;
                        border-radius: 8px;
                        margin-bottom: 30px;
                        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                    }
                    
                    @media print {
                        body {
                            background: white;
                            padding: 0;
                        }
                        
                        .header {
                            box-shadow: none;
                            border-radius: 0;
                        }
                        
                        .stat-card, table, .chart-container {
                            box-shadow: none;
                            border: 1px solid #ddd;
                        }
                    }
                </style>
                <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
            </head>
            <body>
                <div class="header">
                    <h1>Audit Log Report</h1>
                    <div class="subtitle">
                        Generated: ${new Date().toLocaleString()} | 
                        Total Logs: ${stats.totalLogs.toLocaleString()} | 
                        Time Range: Last 30 days
                    </div>
                </div>
                
                <div class="stats-grid">
                    <div class="stat-card critical">
                        <div class="stat-label">Critical Events</div>
                        <div class="stat-value">${criticalCount}</div>
                    </div>
                    
                    <div class="stat-card warning">
                        <div class="stat-label">High Severity</div>
                        <div class="stat-value">${highCount}</div>
                    </div>
                    
                    <div class="stat-card success">
                        <div class="stat-label">Total Events</div>
                        <div class="stat-value">${stats.totalLogs.toLocaleString()}</div>
                    </div>
                    
                    <div class="stat-card info">
                        <div class="stat-label">Time Period</div>
                        <div class="stat-value">30 days</div>
                    </div>
                </div>
                
                <div class="chart-container">
                    <h3>Events by Severity</h3>
                    <canvas id="severityChart" width="400" height="200"></canvas>
                </div>
                
                <h2>Recent Critical Events (Last 10)</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Time</th>
                            <th>Type</th>
                            <th>Severity</th>
                            <th>User</th>
                            <th>Details</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${recentCritical.results.map(log => `
                            <tr>
                                <td>${new Date(log.timestamp).toLocaleString()}</td>
                                <td>${log.type}</td>
                                <td>
                                    <span class="severity-${log.severity.toLowerCase()}">
                                        ${log.severity}
                                    </span>
                                </td>
                                <td>${log.userId}</td>
                                <td>
                                    <details>
                                        <summary>View Details</summary>
                                        <pre>${JSON.stringify(log.data, null, 2)}</pre>
                                    </details>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                
                <div class="footer">
                    <p>Report generated by CipherVault 3D Pro Audit System v4.2.0</p>
                    <p>Confidential - For authorized personnel only</p>
                </div>
                
                <script>
                    // رسم مخطط الشدة
                    const severityCtx = document.getElementById('severityChart').getContext('2d');
                    const severityData = {
                        labels: ${JSON.stringify(Object.keys(stats.bySeverity))},
                        datasets: [{
                            data: ${JSON.stringify(Object.values(stats.bySeverity))},
                            backgroundColor: [
                                '#dc3545', // CRITICAL
                                '#ffc107', // HIGH
                                '#17a2b8', // MEDIUM
                                '#28a745', // LOW
                                '#6c757d'  // INFO
                            ]
                        }]
                    };
                    
                    new Chart(severityCtx, {
                        type: 'doughnut',
                        data: severityData,
                        options: {
                            responsive: true,
                            plugins: {
                                legend: {
                                    position: 'bottom'
                                }
                            }
                        }
                    });
                </script>
            </body>
            </html>
        `;
    }
    
    generateTextReport(stats, recentCritical) {
        let report = `AUDIT LOG REPORT\n`;
        report += `Generated: ${new Date().toLocaleString()}\n`;
        report += `Time Range: Last 30 days\n`;
        report += `Total Logs: ${stats.totalLogs}\n\n`;
        
        report += `STATISTICS BY SEVERITY:\n`;
        report += `=====================\n`;
        Object.entries(stats.bySeverity).forEach(([severity, count]) => {
            report += `${severity.padEnd(10)}: ${count}\n`;
        });
        
        report += `\nRECENT CRITICAL EVENTS:\n`;
        report += `=====================\n`;
        recentCritical.results.forEach(log => {
            report += `[${new Date(log.timestamp).toLocaleString()}] ${log.type} (${log.severity})\n`;
            report += `User: ${log.userId}\n`;
            report += `Data: ${JSON.stringify(log.data)}\n`;
            report += `---\n`;
        });
        
        return report;
    }
    
    async generatePDFReport(stats, recentCritical) {
        // في تطبيق حقيقي، استخدم مكتبة مثل jsPDF
        // هذا مثال مبسط
        const htmlContent = this.generateHTMLReport(stats, recentCritical);
        
        // إنشاء نافذة جديدة للطباعة
        const printWindow = window.open('', '_blank');
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        printWindow.print();
        
        return true;
    }
    
    clearLogs(confirm = true) {
        if (confirm && !window.confirm('Are you sure you want to clear all audit logs? This action cannot be undone.')) {
            return false;
        }
        
        const count = this.logs.length;
        this.logs = [];
        localStorage.removeItem('ciphervault_audit_logs');
        
        this.log('LOGS_CLEARED', 'WARNING', {
            clearedCount: count,
            clearedBy: 'user',
            timestamp: Date.now()
        });
        
        return count;
    }
    
    getLogCount() {
        return this.logs.length;
    }
    
    getOldestLog() {
        return this.logs.length > 0 ? this.logs[0] : null;
    }
    
    getNewestLog() {
        return this.logs.length > 0 ? this.logs[this.logs.length - 1] : null;
    }
}

// إنشاء نسخة عامة
const AuditLogger = new EnhancedAuditLogger();

// التصدير للاستخدام العام
if (typeof window !== 'undefined') {
    window.AuditLogger = AuditLogger;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        EnhancedAuditLogger,
        AuditLogger
    };
}
