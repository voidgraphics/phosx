import { app, BrowserWindow, TouchBar, ipcMain } from 'electron'
const { TouchBarColorPicker, TouchBarSlider } = TouchBar

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow, touchbar
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`


function createTouchbar() {
  let colorPicker = new TouchBarColorPicker({
    change(color) {
      mainWindow.webContents.send('color-picker', color)
    }
  })

  let brightnessSlider = new TouchBarSlider({
    label: 'Brightness',
    minValue: 0,
    maxValue: 100,
    change(brightness) {
      console.log(brightness)
      mainWindow.webContents.send('brightness', brightness / 100)
    }
  })
  touchbar = new TouchBar([
    colorPicker, brightnessSlider
  ])
}

function createWindow () {
  createTouchbar()
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    height: 580,
    useContentSize: true,
    titleBarStyle: 'hiddenInset',
    width: 1000
  })

  mainWindow.setTouchBar(touchbar)

  mainWindow.loadURL(winURL)

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */
