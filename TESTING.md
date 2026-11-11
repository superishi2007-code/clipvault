# ClipVault — Verification & Test Results 🧪

All features were manually verified on macOS using Electron.

| Area | Feature | Test Performed | Result |
| :--- | :--- | :--- | :--- |
| **Desktop APIs** | Clipboard Polling | Copied text from external apps (browser, terminal); verified polling interval captures text and ignores consecutive duplicates. | ✅ PASSED |
| **Desktop APIs** | Copy Back | Clicked a clip item; verified system clipboard receives the text and pasting into another app outputs the snippet. | ✅ PASSED |
| **Desktop APIs** | Native Notifications | Enabled notifications in Settings; copied clip back; confirmed native macOS notification banner displays preview. | ✅ PASSED |
| **Desktop APIs** | File Export | Clicked "Export"; picked destination via `dialog.showSaveDialog`; checked exported `.txt` content matches history. | ✅ PASSED |
| **Windows** | Main Window | Verified window opens, renders clip items, adjusts responsively, and displays empty state when history is cleared. | ✅ PASSED |
| **Windows** | Settings Window | Clicked ⚙️; confirmed separate modal window appears, loads current notification setting, and updates store on toggle. | ✅ PASSED |
| **Windows** | Hide to Tray Lifecycle | Clicked the red 'X' close button on main window; confirmed window hides instead of quitting process. | ✅ PASSED |
| **IPC** | Security Boundaries | Verified `contextIsolation: true` and `nodeIntegration: false`. Ensured `window.require` is undefined in DevTools. | ✅ PASSED |
| **IPC** | Channel Validation | Verified all 8 IPC handlers execute and return expected Promise values without unhandled rejections. | ✅ PASSED |
| **System** | Global Shortcut | Pressed `Cmd+Shift+V` while another application was active; confirmed ClipVault brought itself to foreground. | ✅ PASSED |
| **System** | System Tray | Clicked menu bar tray icon; verified context menu (`Show ClipVault`, `Settings`, `Quit`) functions correctly. | ✅ PASSED |
| **Persistence** | Data Survival | Copied clips, quit app completely, reopened via `npm start`; confirmed all history and preferences survived. | ✅ PASSED |
