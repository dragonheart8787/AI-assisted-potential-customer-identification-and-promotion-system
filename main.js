const { app, BrowserWindow, Menu, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require('url');

let mainWindow;
let isDev = process.argv.includes('--dev');
const useNewUI = process.argv.includes('--new-ui');

function createWindow() {
  const iconPath = path.join(__dirname, 'assets', 'icon.png');
  const hasIcon = fs.existsSync(iconPath);

  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: hasIcon ? iconPath : undefined,
    title: useNewUI ? '推廣中心' : 'AI 推銷助手',
    show: false,
    autoHideMenuBar: true
  });

  const htmlFile = useNewUI ? 'app-new.html' : 'index.html';
  const htmlPath = path.join(__dirname, htmlFile);
  mainWindow.loadFile(htmlPath).catch(err => {
    console.error('loadFile failed:', err);
    mainWindow.loadURL(pathToFileURL(htmlPath).href);
  });

  // 當窗口準備好顯示時才顯示
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    // 開發模式下打開開發者工具
    if (isDev) {
      mainWindow.webContents.openDevTools();
    }
  });

  // 處理窗口關閉
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // 處理外部鏈接
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

// 創建應用程式選單
function createMenu() {
  const template = [
    {
      label: '檔案',
      submenu: [
        {
          label: '開啟主系統',
          accelerator: 'CmdOrCtrl+1',
          click: () => {
            mainWindow.loadFile('index.html');
          }
        },
        {
          label: '開啟 AI 聊天',
          accelerator: 'CmdOrCtrl+2',
          click: () => {
            mainWindow.loadFile('ai-chat-test.html');
          }
        },
        {
          label: '開啟帳號管理',
          accelerator: 'CmdOrCtrl+3',
          click: () => {
            mainWindow.loadFile('secure-account-manager.html');
          }
        },
        {
          label: '開啟系統測試',
          accelerator: 'CmdOrCtrl+4',
          click: () => {
            mainWindow.loadFile('start-test.html');
          }
        },
        { type: 'separator' },
        {
          label: '匯出資料',
          accelerator: 'CmdOrCtrl+E',
          click: async () => {
            const result = await dialog.showSaveDialog(mainWindow, {
              title: '匯出資料',
              defaultPath: 'ai-marketing-data.json',
              filters: [
                { name: 'JSON 檔案', extensions: ['json'] },
                { name: '所有檔案', extensions: ['*'] }
              ]
            });
            
            if (!result.canceled) {
              mainWindow.webContents.send('export-data', result.filePath);
            }
          }
        },
        {
          label: '匯入資料',
          accelerator: 'CmdOrCtrl+I',
          click: async () => {
            const result = await dialog.showOpenDialog(mainWindow, {
              title: '匯入資料',
              properties: ['openFile'],
              filters: [
                { name: 'JSON 檔案', extensions: ['json'] },
                { name: '所有檔案', extensions: ['*'] }
              ]
            });
            
            if (!result.canceled) {
              mainWindow.webContents.send('import-data', result.filePaths[0]);
            }
          }
        },
        { type: 'separator' },
        {
          label: '退出',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: '工具',
      submenu: [
        {
          label: '系統設定',
          accelerator: 'CmdOrCtrl+,',
          click: () => {
            mainWindow.webContents.send('open-settings');
          }
        },
        {
          label: '清除快取',
          click: () => {
            mainWindow.webContents.send('clear-cache');
          }
        },
        {
          label: '重新整理',
          accelerator: 'CmdOrCtrl+R',
          click: () => {
            mainWindow.reload();
          }
        }
      ]
    },
    {
      label: '幫助',
      submenu: [
        {
          label: '使用指南',
          accelerator: 'F1',
          click: () => {
            mainWindow.loadFile('README.md');
          }
        },
        {
          label: '關於',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: '關於 AI 推銷助手',
              message: 'AI 推銷助手 v1.0.0',
              detail: '一個強大的 AI 驅動推銷自動化工具\n\n功能包括：\n• 智能訊息發送\n• 帳號管理\n• 自動化測試\n• 數據分析\n\n© 2024 AI Marketing Assistant'
            });
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// 應用程式事件處理
app.whenReady().then(() => {
  createWindow();
  createMenu();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC 事件處理
ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

ipcMain.handle('get-app-path', () => {
  return app.getAppPath();
});

ipcMain.handle('read-file', async (event, filePath) => {
  try {
    const data = await fs.promises.readFile(filePath, 'utf8');
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('write-file', async (event, filePath, data) => {
  try {
    await fs.promises.writeFile(filePath, data, 'utf8');
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('show-save-dialog', async (event, options) => {
  const result = await dialog.showSaveDialog(mainWindow, options);
  return result;
});

ipcMain.handle('show-open-dialog', async (event, options) => {
  const result = await dialog.showOpenDialog(mainWindow, options);
  return result;
});

ipcMain.handle('show-message-box', async (event, options) => {
  const result = await dialog.showMessageBox(mainWindow, options);
  return result;
});

// 開發模式檢測
if (isDev) {
  console.log('開發模式已啟用');
} 