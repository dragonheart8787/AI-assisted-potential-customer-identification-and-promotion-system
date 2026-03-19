/**
 * 操作日誌 - 搜尋、報告、發信、錯誤紀錄
 * 供學習歷程展示「有驗證意識、有 log 機制」
 */
const OperationLogger = {
    key: 'operation_logs',
    maxItems: 500,

    log(type, data) {
        const entry = {
            ts: new Date().toISOString(),
            type,
            ...(typeof data === 'object' ? data : { message: String(data) })
        };
        const logs = this.getAll();
        logs.unshift(entry);
        try {
            localStorage.setItem(this.key, JSON.stringify(logs.slice(0, this.maxItems)));
        } catch (e) {
            console.warn('OperationLogger: storage full', e);
        }
        return entry;
    },

    getAll() {
        try {
            const s = localStorage.getItem(this.key);
            return s ? JSON.parse(s) : [];
        } catch {
            return [];
        }
    },

    getByType(type) {
        return this.getAll().filter(e => e.type === type);
    },

    getRecent(limit = 50) {
        return this.getAll().slice(0, limit);
    },

    clear() {
        localStorage.removeItem(this.key);
    }
};

window.operationLogger = OperationLogger;
