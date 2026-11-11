/**
 * ClipVault — Main Process
 * Demonstrates: Desktop APIs, Windows, IPC, and System-Level Interactions
 */
const { app, BrowserWindow, ipcMain, clipboard, Notification, dialog, Tray, Menu, globalShortcut } = require('electron');
const path = require('path');
const fs = require('fs');

// ── 1. Storage & State ──────────────────────────────────────────
const DATA_FILE = path.join(app.getPath('userData'), 'clipvault-data.json');
let state = {
  clips: [],
  settings: { notifications: true }
};

function loadData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const parsed = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
      state.clips = Array.isArray(parsed.clips) ? parsed.clips : [];
      state.settings = Object.assign({ notifications: true }, parsed.settings);
    }
  } catch (err) {
    console.error('Error loading data:', err.message);
  }
}

function saveData() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(state, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving data:', err.message);
  }
}

// ── 2. Windows & Tray Lifecycle ─────────────────────────────────
let mainWindow = null;
let settingsWindow = null;
let tray = null;
let isQuitting = false;

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 650,
    height: 600,
    minWidth: 400,
    minHeight: 400,
    title: 'ClipVault',
    icon: path.join(__dirname, '../../assets/icon.png'),
    webPreferences: {
      preload: path.join(__dirname, '../preload/preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));

  // Closing main window hides to tray instead of quitting
  mainWindow.on('close', (e) => {
    if (!isQuitting) {
      e.preventDefault();
      mainWindow.hide();
    }
  });
}

function openSettingsWindow() {
  if (settingsWindow && !settingsWindow.isDestroyed()) {
    settingsWindow.focus();
    return;
  }

  settingsWindow = new BrowserWindow({
    width: 360,
    height: 240,
    resizable: false,
    title: 'ClipVault Settings',
    parent: mainWindow,
    modal: true,
    webPreferences: {
      preload: path.join(__dirname, '../preload/preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  settingsWindow.loadFile(path.join(__dirname, '../renderer/settings.html'));
  settingsWindow.setMenuBarVisibility(false);
}

function setupTray() {
  const iconPath = path.join(__dirname, '../../assets/tray.png');
  tray = new Tray(iconPath);
  tray.setToolTip('ClipVault - Clipboard Manager');

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show ClipVault',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.focus();
        }
      }
    },
    {
      label: 'Settings',
      click: () => openSettingsWindow()
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        isQuitting = true;
        app.quit();
      }
    }
  ]);

  tray.setContextMenu(contextMenu);
  tray.on('click', () => {
    if (mainWindow.isVisible()) {
      mainWindow.hide();
    } else {
      mainWindow.show();
      mainWindow.focus();
    }
  });
}

// ── 3. Desktop APIs: Clipboard Watcher ──────────────────────────
let lastText = '';
function startClipboardWatcher() {
  lastText = clipboard.readText().trim();
  setInterval(() => {
    const current = clipboard.readText().trim();
    if (current && current !== lastText) {
      lastText = current;
      
      const newClip = {
        id: Date.now().toString(),
        text: current,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      // Add to beginning and cap at 50
      state.clips.unshift(newClip);
      if (state.clips.length > 50) state.clips.pop();
      saveData();

      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('clip:new', newClip);
      }
    }
  }, 1000);
}

// ── 4. IPC Handlers ─────────────────────────────────────────────
ipcMain.handle('history:get', () => state.clips);

ipcMain.handle('history:delete', (_e, id) => {
  state.clips = state.clips.filter(c => c.id !== id);
  saveData();
  return { success: true };
});

ipcMain.handle('history:clear', () => {
  state.clips = [];
  saveData();
  return { success: true };
});

ipcMain.handle('history:copy', (_e, id) => {
  const clip = state.clips.find(c => c.id === id);
  if (!clip) return { success: false };

  clipboard.writeText(clip.text);
  lastText = clip.text; // Avoid re-capturing what we just copied

  if (state.settings.notifications && Notification.isSupported()) {
    new Notification({
      title: 'ClipVault',
      body: `Copied: "${clip.text.slice(0, 40)}${clip.text.length > 40 ? '...' : ''}"`
    }).show();
  }
  return { success: true };
});

ipcMain.handle('history:export', async () => {
  const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
    title: 'Export Clipboard History',
    defaultPath: 'clipvault-history.txt',
    filters: [{ name: 'Text Files', extensions: ['txt'] }]
  });

  if (canceled || !filePath) return { success: false };

  const content = state.clips.map((c, i) => `[${i + 1}] (${c.timestamp})\n${c.text}\n`).join('\n---\n\n');
  fs.writeFileSync(filePath, content, 'utf-8');
  return { success: true, filePath };
});

ipcMain.handle('settings:get', () => state.settings);

ipcMain.handle('settings:set', (_e, key, value) => {
  state.settings[key] = value;
  saveData();
  return { success: true };
});

ipcMain.handle('window:open-settings', () => {
  openSettingsWindow();
  return { success: true };
});

// ── 5. App Ready & System Shortcuts ─────────────────────────────
app.whenReady().then(() => {
  loadData();
  createMainWindow();
  setupTray();
  startClipboardWatcher();

  // Global shortcut Cmd+Shift+V to toggle/focus main window
  globalShortcut.register('CommandOrControl+Shift+V', () => {
    if (mainWindow) {
      mainWindow.show();
      mainWindow.focus();
    }
  });
});

app.on('before-quit', () => {
  isQuitting = true;
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});
