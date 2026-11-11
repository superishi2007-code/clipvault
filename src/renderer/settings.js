/**
 * settings.js — Settings Window Controller
 * Reads and updates settings via settings:get and settings:set IPC channels
 */

const notifToggle = document.getElementById('notifToggle');
const closeBtn = document.getElementById('closeBtn');

async function init() {
  const settings = await window.api.invoke('settings:get');
  notifToggle.checked = !!settings.notifications;

  notifToggle.addEventListener('change', async () => {
    await window.api.invoke('settings:set', 'notifications', notifToggle.checked);
  });

  closeBtn.addEventListener('click', () => {
    window.close();
  });
}

init();

