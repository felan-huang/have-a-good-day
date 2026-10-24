import { collection } from '../../store.js';

const COLLECTIONS = ['transactions', 'categories'];

// 关于 / 数据管理：演示「导出备份」与「清除数据」，也方便你验证扩展机制。
export default {
  id: 'about',
  title: '关于',
  icon: '⚙️',
  render(root) {
    root.innerHTML = `
      <div class="card about">
        <h3>have a good day</h3>
        <p>你的私人小助理 · v1.0</p>
        <p class="muted">所有数据都只保存在这台手机本地，不会上传到任何服务器。</p>
        <button id="export" class="primary" type="button">导出全部数据 (JSON)</button>
        <button id="clear" class="danger" type="button">清除全部数据</button>
        <p class="muted small">加新功能？在 js/features/ 下新建一个模块，再到 features/index.js 注册即可。</p>
      </div>
    `;

    root.querySelector('#export').onclick = async () => {
      const data = {};
      for (const n of COLLECTIONS) {
        const c = collection(n);
        data[n] = await c.all();
      }
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'hagd-backup.json';
      a.click();
    };

    root.querySelector('#clear').onclick = async () => {
      if (confirm('确定清除全部数据？此操作不可恢复。')) {
        for (const n of COLLECTIONS) await collection(n).clear();
        alert('已清除');
        location.reload();
      }
    };
  },
};
