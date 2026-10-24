import { features } from './features/index.js';

const sidebar = document.getElementById('sidebar');
const content = document.getElementById('content');
const featureTitle = document.getElementById('feature-title');

function renderNav() {
  sidebar.innerHTML = '';
  features.forEach((f) => {
    const btn = document.createElement('button');
    btn.className = 'nav-item';
    btn.dataset.id = f.id;
    btn.innerHTML = `<span class="nav-icon">${f.icon}</span><span class="nav-label">${f.title}</span>`;
    btn.onclick = () => {
      location.hash = '/' + f.id;
    };
    sidebar.appendChild(btn);
  });
}

function render() {
  const id = location.hash.replace(/^#\/?/, '') || features[0].id;
  const f = features.find((x) => x.id === id) || features[0];
  featureTitle.textContent = f.title;
  content.innerHTML = '';
  f.render(content);
  document.querySelectorAll('.nav-item').forEach((b) => {
    b.classList.toggle('active', b.dataset.id === f.id);
  });
}

window.addEventListener('hashchange', render);
renderNav();
render();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  });
}

// 自定义「安装到主屏」按钮（利用 PWA 的 beforeinstallprompt）
let deferredInstall = null;
const installBar = document.getElementById('install-bar');
const installBtn = document.getElementById('install-btn');
const installDismiss = document.getElementById('install-dismiss');

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredInstall = e;
  if (installBar) installBar.hidden = false;
});
window.addEventListener('appinstalled', () => {
  deferredInstall = null;
  if (installBar) installBar.hidden = true;
});
if (installBtn) {
  installBtn.addEventListener('click', async () => {
    if (!deferredInstall) return;
    deferredInstall.prompt();
    await deferredInstall.userChoice;
    deferredInstall = null;
    if (installBar) installBar.hidden = true;
  });
}
if (installDismiss) {
  installDismiss.addEventListener('click', () => {
    if (installBar) installBar.hidden = true;
  });
}
