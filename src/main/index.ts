import { app, shell, BrowserWindow, ipcMain, dialog, session } from 'electron'
import { join } from 'path'
import { readFile, writeFile } from 'fs/promises'

const isDev = !app.isPackaged

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 940,
    minHeight: 600,
    show: false,
    backgroundColor: '#0f1117',
    autoHideMenuBar: true,
    title: 'StoryCraft',
    webPreferences: {
      // Security hardening: keep the renderer fully isolated from Node.
      preload: join(__dirname, '../preload/index.js'),
      sandbox: true,
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: true,
      allowRunningInsecureContent: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  // Open external links in the user's browser, never inside the app.
  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // Block in-app navigation to any external origin.
  mainWindow.webContents.on('will-navigate', (event, url) => {
    const devUrl = process.env['ELECTRON_RENDERER_URL']
    if (devUrl && url.startsWith(devUrl)) return
    if (url.startsWith('file://')) return
    event.preventDefault()
  })

  const rendererUrl = process.env['ELECTRON_RENDERER_URL']
  if (isDev && rendererUrl) {
    mainWindow.loadURL(rendererUrl)
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// IPC: save the current project (a JSON graph) to a user-chosen file.
ipcMain.handle('project:save', async (_event, payload: string) => {
  if (typeof payload !== 'string') {
    return { ok: false, error: 'Invalid payload' }
  }
  const result = await dialog.showSaveDialog({
    title: 'Save World',
    defaultPath: 'world.storycraft.json',
    filters: [{ name: 'StoryCraft World', extensions: ['json'] }]
  })
  if (result.canceled || !result.filePath) {
    return { ok: false, canceled: true }
  }
  try {
    await writeFile(result.filePath, payload, 'utf-8')
    return { ok: true, filePath: result.filePath }
  } catch (err) {
    return { ok: false, error: (err as Error).message }
  }
})

// IPC: load a project (a JSON graph) from a user-chosen file.
ipcMain.handle('project:load', async () => {
  const result = await dialog.showOpenDialog({
    title: 'Open World',
    properties: ['openFile'],
    filters: [{ name: 'StoryCraft World', extensions: ['json'] }]
  })
  if (result.canceled || result.filePaths.length === 0) {
    return { ok: false, canceled: true }
  }
  try {
    const data = await readFile(result.filePaths[0], 'utf-8')
    return { ok: true, data, filePath: result.filePaths[0] }
  } catch (err) {
    return { ok: false, error: (err as Error).message }
  }
})

app.whenReady().then(() => {
  // Deny all permission requests the app does not need.
  session.defaultSession.setPermissionRequestHandler((_wc, _permission, callback) => {
    callback(false)
  })

  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// Prevent the creation of additional renderers from untrusted content.
app.on('web-contents-created', (_event, contents) => {
  contents.setWindowOpenHandler(() => ({ action: 'deny' }))
})
