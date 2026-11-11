# ClipVault — Viva / Exam Preparation Q&A 🎓

Quick revision sheet covering the architecture and core concepts for your evaluation.

---

### Q1: What is the difference between the Main Process and the Renderer Process in Electron?
**A:**
- **Main Process** (`src/main/main.js`): Runs in a full Node.js environment. Manages the app lifecycle, creates and controls native GUI windows (`BrowserWindow`), accesses OS APIs (`clipboard`, `Notification`, `dialog`, `Tray`, `globalShortcut`), and performs file I/O.
- **Renderer Process** (`src/renderer/*`): Runs inside a Chromium web page displaying HTML/CSS/JS. For security, it has no direct Node.js or OS access and can only communicate with the Main process through IPC.

---

### Q2: What is `contextIsolation` and why should it always be set to `true`?
**A:**
`contextIsolation` ensures that your preload script and Electron internals run in an isolated JavaScript context separate from the website/renderer context. This prevents scripts running in the renderer (or malicious injected code) from modifying Electron APIs or prototype-polluting the bridge to gain unauthorized system access.

---

### Q3: What is `nodeIntegration` and why is it set to `false`?
**A:**
When `nodeIntegration: false`, the renderer cannot use Node.js primitives like `require('fs')` or `process`. Disabling it prevents Remote Code Execution (RCE) vulnerabilities in case untrusted content or XSS enters the UI.

---

### Q4: Why is `ipcRenderer.invoke` / `ipcMain.handle` preferred over `send` / `on`?
**A:**
`invoke` / `handle` is a modern **request-response** pattern that returns a Promise. It avoids callback spaghetti, prevents mismatched event listeners, supports clean `async/await` syntax, and handles errors gracefully across process boundaries.

---

### Q5: What does `contextBridge.exposeInMainWorld` do?
**A:**
It securely exposes an explicit, sanitized API from the preload script into the renderer's global `window` object (`window.api`). The renderer only sees the functions you whitelist, without getting access to raw `ipcRenderer` or Node internals.

---

### Q6: How does ClipVault watch the system clipboard?
**A:**
The main process uses a 1-second `setInterval` with `clipboard.readText()`. It compares the current string with `lastText` to skip duplicates. When new text is found, it adds it to the in-memory array (capped at 50), persists to disk, and pushes the event to the renderer via `mainWindow.webContents.send('clip:new')`.

---

### Q7: Where and how is user data persisted across app restarts?
**A:**
Data is saved in a JSON file at `app.getPath('userData')/clipvault-data.json`. `app.getPath('userData')` is an Electron API that resolves to the standard OS application data directory (e.g., `~/Library/Application Support/clipvault` on macOS), ensuring data survives app updates and restarts without needing an external database.

---

### Q8: How does the window lifecycle work with the System Tray?
**A:**
Instead of quitting when the main window's close button is clicked, an event handler catches `'close'` on `mainWindow`, calls `e.preventDefault()`, and executes `mainWindow.hide()`. The app remains active in the macOS menu bar tray. The user can restore the window by clicking the tray icon or selecting "Quit" from the tray menu to set `isQuitting = true` and call `app.quit()`.

---

### Q9: How does the global shortcut `Cmd+Shift+V` work?
**A:**
`globalShortcut.register('CommandOrControl+Shift+V', ...)` registers an OS-level keyboard hook through Electron. It triggers even when ClipVault is not the active/focused window, bringing the app to the foreground. On exit, `globalShortcut.unregisterAll()` cleans up the hook.

---

### Q10: How are native file dialogs used for export?
**A:**
`dialog.showSaveDialog(mainWindow, { ... })` opens the macOS file chooser sheet. Once the user picks a location, `fs.writeFileSync` saves the formatted clips as a `.txt` file, demonstrating secure system file-system interactions initiated via IPC.

