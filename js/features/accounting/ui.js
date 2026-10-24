import { collection } from '../../store.js';

const txns = collection('transactions');
const cats = collection('categories');
const DEFAULT_CATS = ['餐饮', '交通', '购物', '居住', '娱乐', '医疗', '学习', '工资', '其他'];

function fmt(n) {
  return '¥' + Number(n).toFixed(2);
}
function today() {
  const d = new Date();
  const p = (x) => String(x).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}
function monthKey(d) {
  return d.slice(0, 7);
}

export function renderAccounting(root) {
  root.innerHTML = `
    <div class="summary" id="summary"></div>

    <div class="card">
      <h3>记一笔</h3>
      <div class="type-toggle">
        <button data-type="expense" class="active">支出</button>
        <button data-type="income">收入</button>
      </div>
      <div class="field">
        <label>金额</label>
        <input id="amount" type="number" inputmode="decimal" placeholder="0.00" step="0.01" />
      </div>
      <div class="field">
        <label>类别</label>
        <div class="cat-row">
          <select id="category"></select>
          <button id="add-cat" class="link-btn" type="button">+ 新增</button>
        </div>
      </div>
      <div class="field">
        <label>备注</label>
        <input id="note" type="text" placeholder="可选" />
      </div>
      <div class="field">
        <label>日期</label>
        <input id="date" type="date" />
      </div>
      <button id="save" class="primary" type="button">保存</button>
    </div>

    <div class="card">
      <h3>最近记录</h3>
      <ul id="list" class="txn-list"></ul>
    </div>
  `;

  let type = 'expense';
  const toggle = root.querySelectorAll('.type-toggle button');
  toggle.forEach((b) => {
    b.onclick = () => {
      toggle.forEach((x) => x.classList.remove('active'));
      b.classList.add('active');
      type = b.dataset.type;
    };
  });

  root.querySelector('#date').value = today();

  const sel = root.querySelector('#category');
  async function fillCats() {
    const customs = (await cats.all()).map((c) => c.name);
    const all = [...DEFAULT_CATS, ...customs.filter((c) => !DEFAULT_CATS.includes(c))];
    sel.innerHTML = all.map((c) => `<option value="${c}">${c}</option>`).join('');
  }

  root.querySelector('#add-cat').onclick = async () => {
    const name = prompt('新类别名称');
    if (name && name.trim()) {
      await cats.add({ name: name.trim() });
      await fillCats();
      sel.value = name.trim();
    }
  };

  root.querySelector('#save').onclick = async () => {
    const amount = parseFloat(root.querySelector('#amount').value);
    if (!(amount > 0)) {
      alert('请输入有效金额');
      return;
    }
    await txns.add({
      type,
      amount,
      category: sel.value,
      note: root.querySelector('#note').value.trim(),
      date: root.querySelector('#date').value || today(),
    });
    root.querySelector('#amount').value = '';
    root.querySelector('#note').value = '';
    refresh();
  };

  async function refresh() {
    const all = await txns.all();
    all.sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt);

    const m = monthKey(today());
    const cur = all.filter((t) => monthKey(t.date) === m);
    const exp = cur.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const inc = cur.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);

    root.querySelector('#summary').innerHTML = `
      <div class="sum-card"><span>本月支出</span><b class="exp">${fmt(exp)}</b></div>
      <div class="sum-card"><span>本月收入</span><b class="inc">${fmt(inc)}</b></div>
      <div class="sum-card"><span>结余</span><b>${fmt(inc - exp)}</b></div>
    `;

    const list = root.querySelector('#list');
    if (all.length === 0) {
      list.innerHTML = '<li class="empty">还没有记录，记一笔吧～</li>';
      return;
    }
    list.innerHTML = all
      .slice(0, 50)
      .map(
        (t) => `
        <li class="txn">
          <div class="txn-main">
            <span class="cat">${t.category}</span>
            <span class="note">${t.note || ''}</span>
          </div>
          <div class="txn-side">
            <span class="amt ${t.type}">${t.type === 'income' ? '+' : '-'}${fmt(t.amount)}</span>
            <span class="date">${t.date}</span>
          </div>
          <button class="del" data-id="${t.id}" type="button">×</button>
        </li>`
      )
      .join('');
    list.querySelectorAll('.del').forEach((b) => {
      b.onclick = async () => {
        await txns.remove(b.dataset.id);
        refresh();
      };
    });
  }

  fillCats().then(refresh);
}
