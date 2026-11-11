# ClipVault — IPC Channel Documentation 📡

All communication between the Renderer and Main processes is strictly channeled through `ipcMain.handle` and `ipcRenderer.invoke` via the preload script (`src/preload/preload.js`).

| Channel | Direction | Payload | Return Value | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| `history:get` | Renderer ➔ Main | _None_ | `Array<Clip>` | Fetches the full list of saved clipboard snippets (newest first). |
| `history:delete` | Renderer ➔ Main | `id: string` | `{ success: boolean }` | Removes a specific clip by its unique timestamp ID. |
| `history:clear` | Renderer ➔ Main | _None_ | `{ success: boolean }` | Clears all clips from memory and disk. |
| `history:copy` | Renderer ➔ Main | `id: string` | `{ success: boolean }` | Writes the clip text back to the system clipboard and triggers a native notification (if enabled). |
| `history:export` | Renderer ➔ Main | _None_ | `{ success: boolean, filePath?: string }` | Opens the native save dialog (`dialog.showSaveDialog`) and exports history to a `.txt` file. |
| `settings:get` | Renderer ➔ Main | _None_ | `{ notifications: boolean }` | Retrieves the user's stored preferences. |
| `settings:set` | Renderer ➔ Main | `key: string, value: any` | `{ success: boolean }` | Updates a specific setting and persists to JSON. |
| `window:open-settings` | Renderer ➔ Main | _None_ | `{ success: boolean }` | Opens the secondary Settings `BrowserWindow`. |
| `clip:new` | Main ➔ Renderer | `newClip: Clip` | _None_ (Event push) | Pushes a notification event to the renderer when the background watcher captures a new snippet. |

