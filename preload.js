const { contextBridge, ipcRenderer } = require('electron');

// 暴露安全的 API 給渲染進程
contextBridge.exposeInMainWorld('electronAPI', {
  // 應用程式資訊
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  getAppPath: () => ipcRenderer.invoke('get-app-path'),
  
  // 檔案操作
  readFile: (filePath) => ipcRenderer.invoke('read-file', filePath),
  writeFile: (filePath, data) => ipcRenderer.invoke('write-file', filePath, data),
  
  // 對話框
  showSaveDialog: (options) => ipcRenderer.invoke('show-save-dialog', options),
  showOpenDialog: (options) => ipcRenderer.invoke('show-open-dialog', options),
  showMessageBox: (options) => ipcRenderer.invoke('show-message-box', options),
  
  // 事件監聽
  onExportData: (callback) => ipcRenderer.on('export-data', callback),
  onImportData: (callback) => ipcRenderer.on('import-data', callback),
  onOpenSettings: (callback) => ipcRenderer.on('open-settings', callback),
  onClearCache: (callback) => ipcRenderer.on('clear-cache', callback),
  
  // 移除事件監聽
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel)
});

// 全域變數和工具函數
contextBridge.exposeInMainWorld('appUtils', {
  // 本地儲存增強
  storage: {
    get: (key) => {
      try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
      } catch (error) {
        console.error('讀取本地儲存失敗:', error);
        return null;
      }
    },
    
    set: (key, value) => {
      try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
      } catch (error) {
        console.error('寫入本地儲存失敗:', error);
        return false;
      }
    },
    
    remove: (key) => {
      try {
        localStorage.removeItem(key);
        return true;
      } catch (error) {
        console.error('移除本地儲存失敗:', error);
        return false;
      }
    },
    
    clear: () => {
      try {
        localStorage.clear();
        return true;
      } catch (error) {
        console.error('清除本地儲存失敗:', error);
        return false;
      }
    }
  },
  
  // 通知系統
  notification: {
    show: (title, message, type = 'info') => {
      const notification = document.createElement('div');
      notification.className = `notification notification-${type}`;
      notification.innerHTML = `
        <div class="notification-header">
          <span class="notification-title">${title}</span>
          <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
        <div class="notification-message">${message}</div>
      `;
      
      // 添加到頁面
      let container = document.getElementById('notification-container');
      if (!container) {
        container = document.createElement('div');
        container.id = 'notification-container';
        container.style.cssText = `
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 10000;
          max-width: 400px;
        `;
        document.body.appendChild(container);
      }
      
      container.appendChild(notification);
      
      // 自動移除
      setTimeout(() => {
        if (notification.parentElement) {
          notification.remove();
        }
      }, 5000);
    }
  },
  
  // 數據匯出/匯入
  dataManager: {
    exportData: async () => {
      const data = {
        profiles: appUtils.storage.get('userProfiles') || [],
        messages: appUtils.storage.get('sentMessages') || [],
        accounts: appUtils.storage.get('authenticatedAccounts') || [],
        settings: appUtils.storage.get('appSettings') || {},
        timestamp: new Date().toISOString()
      };
      
      const result = await window.electronAPI.showSaveDialog({
        title: '匯出資料',
        defaultPath: `ai-marketing-data-${new Date().toISOString().split('T')[0]}.json`,
        filters: [
          { name: 'JSON 檔案', extensions: ['json'] },
          { name: '所有檔案', extensions: ['*'] }
        ]
      });
      
      if (!result.canceled) {
        const success = await window.electronAPI.writeFile(result.filePath, JSON.stringify(data, null, 2));
        if (success.success) {
          appUtils.notification.show('匯出成功', '資料已成功匯出到指定位置', 'success');
        } else {
          appUtils.notification.show('匯出失敗', '無法寫入檔案: ' + success.error, 'error');
        }
      }
    },
    
    importData: async () => {
      const result = await window.electronAPI.showOpenDialog({
        title: '匯入資料',
        properties: ['openFile'],
        filters: [
          { name: 'JSON 檔案', extensions: ['json'] },
          { name: '所有檔案', extensions: ['*'] }
        ]
      });
      
      if (!result.canceled) {
        const fileResult = await window.electronAPI.readFile(result.filePaths[0]);
        if (fileResult.success) {
          try {
            const data = JSON.parse(fileResult.data);
            
            // 驗證數據格式
            if (data.profiles && data.messages && data.accounts) {
              appUtils.storage.set('userProfiles', data.profiles);
              appUtils.storage.set('sentMessages', data.messages);
              appUtils.storage.set('authenticatedAccounts', data.accounts);
              if (data.settings) {
                appUtils.storage.set('appSettings', data.settings);
              }
              
              appUtils.notification.show('匯入成功', '資料已成功匯入', 'success');
              
              // 重新載入頁面以更新顯示
              setTimeout(() => {
                window.location.reload();
              }, 1000);
            } else {
              appUtils.notification.show('匯入失敗', '檔案格式不正確', 'error');
            }
          } catch (error) {
            appUtils.notification.show('匯入失敗', '無法解析檔案: ' + error.message, 'error');
          }
        } else {
          appUtils.notification.show('匯入失敗', '無法讀取檔案: ' + fileResult.error, 'error');
        }
      }
    }
  },
  
  // 系統工具
  system: {
    isElectron: true,
    isDev: process.env.NODE_ENV === 'development',
    
    // 清除快取
    clearCache: () => {
      appUtils.storage.clear();
      appUtils.notification.show('快取已清除', '所有本地儲存資料已清除', 'info');
    },
    
    // 重新整理
    reload: () => {
      window.location.reload();
    }
  }
});

// 初始化事件監聽
window.addEventListener('DOMContentLoaded', () => {
  // 監聽匯出資料事件
  window.electronAPI.onExportData(() => {
    appUtils.dataManager.exportData();
  });
  
  // 監聽匯入資料事件
  window.electronAPI.onImportData((event, filePath) => {
    appUtils.dataManager.importData();
  });
  
  // 監聽開啟設定事件
  window.electronAPI.onOpenSettings(() => {
    appUtils.notification.show('設定', '設定功能開發中...', 'info');
  });
  
  // 監聽清除快取事件
  window.electronAPI.onClearCache(() => {
    appUtils.system.clearCache();
  });
  
  // 添加通知樣式
  if (!document.getElementById('notification-styles')) {
    const style = document.createElement('style');
    style.id = 'notification-styles';
    style.textContent = `
      .notification {
        background: white;
        border: 1px solid #ddd;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        margin-bottom: 10px;
        overflow: hidden;
        animation: slideIn 0.3s ease-out;
      }
      
      .notification-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 16px;
        background: #f8f9fa;
        border-bottom: 1px solid #eee;
      }
      
      .notification-title {
        font-weight: 600;
        color: #333;
      }
      
      .notification-close {
        background: none;
        border: none;
        font-size: 18px;
        cursor: pointer;
        color: #666;
        padding: 0;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .notification-close:hover {
        color: #333;
      }
      
      .notification-message {
        padding: 12px 16px;
        color: #555;
        line-height: 1.4;
      }
      
      .notification-success {
        border-left: 4px solid #28a745;
      }
      
      .notification-error {
        border-left: 4px solid #dc3545;
      }
      
      .notification-info {
        border-left: 4px solid #17a2b8;
      }
      
      .notification-warning {
        border-left: 4px solid #ffc107;
      }
      
      @keyframes slideIn {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
    `;
    document.head.appendChild(style);
  }
}); 