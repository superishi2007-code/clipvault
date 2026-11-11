/**
 * preload.js — Secure Bridge between Main and Renderer processes
 * Using contextBridge to maintain contextIsolation: true and nodeIntegration: false.
 */
const { contextBridge, ipcRenderer } = require('electron');

const ALLOWED_CHANNELS = [
  'history:get',
  'history:delete',
  'history:clear',
  'history:copy',
  'history:export',
  'settings:get',
  'settings:set',
  'window:open-settings'
];

contextBridge.exposeInMainWorld('api', {
  // Send request to main process and await response
  invoke: (channel, ...args) => {
    if (!ALLOWED_CHANNELS.includes(channel)) {
      throw new Error(`Unauthorized IPC channel: ${channel}`);
    }
    return ipcRenderer.invoke(channel, ...args);
  },

  // Listen for real-time clipboard updates from main
  onClipNew: (callback) => {
    ipcRenderer.on('clip:new', (_event, clip) => callback(clip));
  }
});
