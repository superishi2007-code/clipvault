/**
 * renderer.js — Main Window Controller
 * Uses window.api exposed securely by preload.js
 */

const clipList = document.getElementById('clipList');
const emptyState = document.getElementById('emptyState');
const clearBtn = document.getElementById('clearBtn');
const exportBtn = document.getElementById('exportBtn');
const settingsBtn = document.getElementById('settingsBtn');

async function loadHistory() {
  const clips = await window.api.invoke('history:get');
  renderClips(clips);
}

function renderClips(clips) {
  if (!clips || clips.length === 0) {
    clipList.innerHTML = '';
    emptyState.style.display = 'block';
    return;
  }

  emptyState.style.display = 'none';
  clipList.innerHTML = clips.map(clip => `
    <div class="clip-item" data-id="${clip.id}">
      <div class="clip-main" title="Click to copy back to clipboard">
        <div class="clip-text">${escapeHtml(clip.text)}</div>
        <div class="clip-meta">${clip.timestamp}</div>
      </div>
      <div class="clip-actions">
        <button class="action-btn copy-btn" title="Copy">📋</button>
        <button class="action-btn delete-btn" title="Delete">✕</button>
      </div>
    </div>
  `).join('');

  // Attach handlers
  clipList.querySelectorAll('.clip-item').forEach(item => {
    const id = item.dataset.id;
    
    // Clicking body or copy button copies text back to system clipboard
    item.querySelector('.clip-main').addEventListener('click', () => copyClip(id));
    item.querySelector('.copy-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      copyClip(id);
    });

    // Delete button
    item.querySelector('.delete-btn').addEventListener('click', async (e) => {
      e.stopPropagation();
      await window.api.invoke('history:delete', id);
      loadHistory();
    });
  });
}

async function copyClip(id) {
  await window.api.invoke('history:copy', id);
}

// ── Controls ──────────────────────────────────────────────────
clearBtn.addEventListener('click', async () => {
  if (confirm('Clear all clipboard history?')) {
    await window.api.invoke('history:clear');
    loadHistory();
  }
});

exportBtn.addEventListener('click', async () => {
  await window.api.invoke('history:export');
});

settingsBtn.addEventListener('click', () => {
  window.api.invoke('window:open-settings');
});

// Real-time update when main process detects a new clipboard item
window.api.onClipNew(() => {
  loadHistory();
});

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// Initial load
loadHistory();
