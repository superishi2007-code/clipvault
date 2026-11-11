# ClipVault 📋

ClipVault is a lightweight macOS clipboard history manager built with Electron and vanilla HTML/CSS/JavaScript for an Application Development course.

## Features
- **Automatic Clipboard Polling**: Watches the system clipboard every 1s, captures new text snippets (max 50, newest first), and ignores duplicates.
- **Copy Back & Manage**: Click any item to copy it back to your system clipboard; individual delete and "Clear All" buttons.
- **Persistent Storage**: Saves history and preferences in a JSON file in `app.getPath('userData')`.
- **Settings Window**: Dedicated secondary window to toggle native OS notifications on/off.
- **Export History**: Native OS file save dialog (`dialog.showSaveDialog`) to export your clips to a `.txt` file.
- **System Tray & Global Shortcut**: Lives in the macOS menu bar tray (closing the window hides to tray) and responds to `Cmd+Shift+V` from any application to bring ClipVault to the front.

## How This Meets the Course Requirements

The project addresses the four core evaluation areas with clean, simple code:

| Focus Area | Implementation Details | Key Files |
| :--- | :--- | :--- |
| **1. Desktop APIs** | `clipboard.readText()` & `clipboard.writeText()` for clipboard management; `new Notification()` for macOS banners; `dialog.showSaveDialog()` for file export. | `src/main/main.js` |
| **2. Windows** | Multi-window architecture: Main window (`BrowserWindow`) and modal Settings window; window lifecycle with hide-to-tray on close. | `src/main/main.js`, `src/renderer/index.html`, `src/renderer/settings.html` |
| **3. IPC** | Strict separation with `contextBridge` in preload script (`contextIsolation: true`, `nodeIntegration: false`). Uses `ipcMain.handle` and `ipcRenderer.invoke` (`history:get`, `history:delete`, `history:clear`, `history:copy`, `history:export`, `settings:get`, `settings:set`). | `src/preload/preload.js`, `src/main/main.js`, `src/renderer/renderer.js` |
| **4. System-Level Interactions** | System tray menu via `Tray` and `Menu`; OS-wide global shortcut `Cmd+Shift+V` via `globalShortcut`; local JSON storage in OS user data directory via `app.getPath('userData')`. | `src/main/main.js` |

## Getting Started

### Prerequisites
- Node.js (v18+)
- macOS

### Installation & Run
```bash
# 1. Install dependencies
npm install

# 2. Start the application
npm start
```

> **Note on macOS Permissions**: When running for the first time, macOS may request notification or accessibility permissions for clipboard monitoring and global keyboard shortcuts.
