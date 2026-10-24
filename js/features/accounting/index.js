import { renderAccounting } from './ui.js';

// 记账功能模块。壳层根据 id 路由，render 负责把界面画进 root。
export default {
  id: 'accounting',
  title: '记账',
  icon: '💰',
  render(root) {
    renderAccounting(root);
  },
};
