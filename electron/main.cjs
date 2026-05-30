const { app, BrowserWindow, Menu, shell, ipcMain, dialog } = require('electron')
const path = require('path')
const isDev = !app.isPackaged

let mainWindow

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    title: 'بيرق العرب — منصة التوظيف بالخارج',
    icon: path.join(__dirname, '../public/logo.jpg'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.cjs'),
    },
    backgroundColor: '#060d1a',
    show: false,
    autoHideMenuBar: false,
  })

  // تحميل التطبيق — يجرب عدة منافذ
  if (isDev) {
    const ports = [5173, 5174, 5175, 5176]
    const tryLoad = (index) => {
      if (index >= ports.length) {
        mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
        return
      }
      mainWindow.loadURL(`http://localhost:${ports[index]}`).catch(() => {
        tryLoad(index + 1)
      })
    }
    tryLoad(0)
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
    mainWindow.focus()
  })

  mainWindow.on('closed', () => { mainWindow = null })

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })
}

function createMenu() {
  const template = [
    {
      label: 'بيرق العرب',
      submenu: [
        { label: 'حول التطبيق', click: () => {
          dialog.showMessageBox(mainWindow, {
            type: 'info',
            title: 'بيرق العرب',
            message: 'بيرق العرب للتوظيف بالخارج',
            detail: 'الإصدار 2.0.0\n© 2025 جميع الحقوق محفوظة',
          })
        }},
        { type: 'separator' },
        { label: 'إعادة التحميل', accelerator: 'CmdOrCtrl+R', click: () => mainWindow.reload() },
        { label: 'تصغير', accelerator: 'CmdOrCtrl+M', click: () => mainWindow.minimize() },
        { label: 'تكبير', click: () => {
          mainWindow.isMaximized() ? mainWindow.unmaximize() : mainWindow.maximize()
        }},
        { type: 'separator' },
        { label: 'إغلاق', accelerator: 'CmdOrCtrl+Q', click: () => app.quit() },
      ]
    },
    {
      label: 'تحرير',
      submenu: [
        { label: 'نسخ',  accelerator: 'CmdOrCtrl+C', role: 'copy' },
        { label: 'لصق',  accelerator: 'CmdOrCtrl+V', role: 'paste' },
        { label: 'قص',   accelerator: 'CmdOrCtrl+X', role: 'cut' },
        { label: 'تحديد الكل', accelerator: 'CmdOrCtrl+A', role: 'selectAll' },
      ]
    },
    {
      label: 'عرض',
      submenu: [
        { label: 'شاشة كاملة', accelerator: 'F11', click: () => {
          mainWindow.setFullScreen(!mainWindow.isFullScreen())
        }},
        { label: 'تكبير النص', accelerator: 'CmdOrCtrl+=', role: 'zoomIn' },
        { label: 'تصغير النص', accelerator: 'CmdOrCtrl+-', role: 'zoomOut' },
        { label: 'الحجم الأصلي', accelerator: 'CmdOrCtrl+0', role: 'resetZoom' },
      ]
    },
  ]
  Menu.setApplicationMenu(Menu.buildFromTemplate(template))
}

app.whenReady().then(() => {
  createWindow()
  createMenu()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

const gotTheLock = app.requestSingleInstanceLock()
if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
    }
  })
}
