// 通用本地数据存储层。
// 现在基于 localStorage，但对外暴露的是「异步集合」接口，
// 将来想换成 IndexedDB / 云端，只要改这个文件，功能模块无需改动。

const PREFIX = 'hagd:';

function uid() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return 'id-' + Date.now() + '-' + Math.random().toString(16).slice(2);
}

function readRaw(key) {
  try {
    const v = JSON.parse(localStorage.getItem(PREFIX + key));
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

function writeRaw(key, val) {
  localStorage.setItem(PREFIX + key, JSON.stringify(val));
}

// 返回一个集合对象，支持 all / get / add / update / remove / clear
export function collection(name) {
  const key = 'col:' + name;
  return {
    async all() {
      return readRaw(key);
    },
    async get(id) {
      return readRaw(key).find((r) => r.id === id) || null;
    },
    async add(item) {
      const list = readRaw(key);
      const record = { ...item, id: item.id || uid(), createdAt: Date.now() };
      list.push(record);
      writeRaw(key, list);
      return record;
    },
    async update(id, patch) {
      const list = readRaw(key);
      const i = list.findIndex((r) => r.id === id);
      if (i < 0) return null;
      list[i] = { ...list[i], ...patch };
      writeRaw(key, list);
      return list[i];
    },
    async remove(id) {
      writeRaw(key, readRaw(key).filter((r) => r.id !== id));
      return true;
    },
    async clear() {
      writeRaw(key, []);
      return true;
    },
  };
}
