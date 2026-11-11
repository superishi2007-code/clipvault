# ClipVault — Requirements & Grading Alignment

Official Problem Statement: *"Build a desktop application using Electron, focusing on desktop APIs, windows, IPC, and system-level interactions."*

---

### 1. Desktop APIs
- **Clipboard**: `clipboard.readText()`, `clipboard.writeText()` in `src/main/main.js` to poll and restore clips.
- **Notification**: `new Notification({ title, body })` in `src/main/main.js` when copying a clip back.
- **Dialogs**: `dialog.showSaveDialog()` in `src/main/main.js` to prompt user for `.txt` export destination.

### 2. Windows
- **Main Window**: Primary `BrowserWindow` hosting `index.html` with clipboard list and controls.
- **Settings Window**: Secondary modal `BrowserWindow` hosting `settings.html` to toggle notifications.
- **Lifecycle Management**: Closing the main window hides it to the system tray instead of destroying the process.

### 3. IPC (Inter-Process Communication)
- **Security**: `contextIsolation: true`, `nodeIntegration: false`. No direct Node access in renderer.
- **Preload Bridge**: `src/preload/preload.js` exposes `window.api` via `contextBridge`.
- **Channels**:
  - `history:get`: Retrieve all clips.
  - `history:delete`: Remove a single clip by id.
  - `history:clear`: Wipe non-pinned clips.
  - `history:copy`: Copy a clip back to system clipboard.
  - `history:export`: Export clips to `.txt` file via save dialog.
  - `settings:get`: Fetch notification preferences.
  - `settings:set`: Save notification preferences.
  - `window:open-settings`: Open secondary settings window.

### 4. System-Level Interactions
- **System Tray**: Menu bar icon with context menu (`Show ClipVault`, `Settings`, `Quit`).
- **Global Shortcut**: `Cmd+Shift+V` registered via `globalShortcut.register` to focus ClipVault from anywhere.
- **JSON Persistence**: `app.getPath('userData')/clipvault-data.json` persists history across restarts.
