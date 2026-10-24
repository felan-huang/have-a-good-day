// 功能注册表：所有「功能模块」在这里汇总。
// 以后要加新功能，只需：
//   1) 在 features/ 下新建一个文件夹（参考 accounting/）
//   2) 导出一个 { id, title, icon, render(root) } 对象
//   3) 在下面 import 并加入数组即可，壳层会自动生成导航与路由。
import accounting from './accounting/index.js';
import about from './about/index.js';

export const features = [
  accounting,
  about,
  // 未来新功能加在这一行下面，例如：
  // habit,
  // notes,
];
