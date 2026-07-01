const STORAGE_KEY = "hawaiians-checklist-v1";
const THEME_KEY = "hawaiians-theme";
const MEMO_KEY = "hawaiians-memo";

const categoryNames = {
  papa: "👨 パパ",
  mama: "👩 ママ",
  kid: "👦 子ども",
  pool: "🏊 プール",
  car: "🚗 車"
};

const defaultItems = [
  { id: "wallet", text: "財布", category: "papa", done: false },
  { id: "phone", text: "スマホ", category: "papa", done: false },
  { id: "charger", text: "充電器", category: "papa", done: false },
  { id: "battery", text: "モバイルバッテリー", category: "papa", done: false },
  { id: "key", text: "車のキー", category: "papa", done: false },
  { id: "papa-swim", text: "水着", category: "papa", done: false },
  { id: "papa-crocs", text: "クロックス", category: "papa", done: false },

  { id: "mama-swim", text: "水着", category: "mama", done: false },
  { id: "mama-cosme", text: "化粧品", category: "mama", done: false },
  { id: "mama-sunscreen", text: "日焼け止め", category: "mama", done: false },
  { id: "mama-clothes", text: "着替え・下着", category: "mama", done: false },

  { id: "kid-swim", text: "子どもの水着", category: "kid", done: false },
  { id: "kid-rash", text: "子どものラッシュガード", category: "kid", done: false },
  { id: "kid-sandal", text: "子どものサンダル", category: "kid", done: false },
  { id: "kid-clothes", text: "子どもの着替え 2〜3セット", category: "kid", done: false },
  { id: "kid-snack", text: "おやつ", category: "kid", done: false },
  { id: "kid-bottle", text: "水筒", category: "kid", done: false },
  { id: "kid-toy", text: "移動中のおもちゃ・絵本", category: "kid", done: false },
  { id: "kid-insurance", text: "保険証・マイナ保険証", category: "kid", done: false },

  { id: "pool-rash", text: "ラッシュガード", category: "pool", done: false },
  { id: "pool-waterbag", text: "防水バッグ", category: "pool", done: false },
  { id: "pool-case", text: "スマホ防水ケース", category: "pool", done: false },
  { id: "pool-float", text: "浮き輪", category: "pool", done: false },
  { id: "pool-goggles", text: "ゴーグル", category: "pool", done: false },
  { id: "pool-bag", text: "濡れた水着用ビニール袋", category: "pool", done: false },
  { id: "pool-towel", text: "予備タオル", category: "pool", done: false },

  { id: "car-etc", text: "ETCカード", category: "car", done: false },
  { id: "car-drink", text: "車内用の飲み物", category: "car", done: false },
  { id: "car-tissue", text: "ティッシュ・ウェットティッシュ", category: "car", done: false },
  { id: "car-trash", text: "ゴミ袋", category: "car", done: false },
  { id: "car-change", text: "予備の着替え", category: "car", done: false }
];

let items = loadItems();
let currentFilter = "all";

function loadItems() {
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved ? JSON.parse(saved) : defaultItems;
}
function saveItems() { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); }
function uid() { return `${Date.now()}-${Math.random().toString(36).slice(2)}`; }

function render() {
  const list = document.getElementById("list");
  list.innerHTML = "";
  const filtered = currentFilter === "all" ? items : items.filter(i => i.category === currentFilter);
  const grouped = filtered.reduce((acc, item) => {
    (acc[item.category] ||= []).push(item);
    return acc;
  }, {});

  Object.keys(categoryNames).forEach(category => {
    if (!grouped[category]) return;
    const group = document.createElement("section");
    group.className = "group";
    group.innerHTML = `<h2>${categoryNames[category]}</h2>`;
    grouped[category].forEach(item => {
      const row = document.createElement("div");
      row.className = `item ${item.done ? "done" : ""}`;
      row.innerHTML = `
        <input type="checkbox" ${item.done ? "checked" : ""} aria-label="${item.text}" />
        <label>${item.text}</label>
        <button class="delete" aria-label="削除">×</button>
      `;
      row.querySelector("input").addEventListener("change", e => {
        item.done = e.target.checked;
        saveItems();
        render();
      });
      row.querySelector(".delete").addEventListener("click", () => {
        items = items.filter(i => i.id !== item.id);
        saveItems();
        render();
      });
      group.appendChild(row);
    });
    list.appendChild(group);
  });
  updateProgress();
}

function updateProgress() {
  const total = items.length;
  const done = items.filter(i => i.done).length;
  const pct = total ? Math.round(done / total * 100) : 0;
  document.getElementById("progressText").textContent = `${pct}%`;
  document.getElementById("progressBar").style.width = `${pct}%`;
  document.getElementById("countText").textContent = `${done} / ${total} 完了`;
}

document.querySelectorAll(".tab").forEach(tab => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
    tab.classList.add("active");
    currentFilter = tab.dataset.filter;
    render();
  });
});

document.getElementById("addButton").addEventListener("click", () => {
  const input = document.getElementById("newItemInput");
  const text = input.value.trim();
  if (!text) return;
  items.push({ id: uid(), text, category: document.getElementById("categorySelect").value, done: false });
  input.value = "";
  saveItems();
  render();
});

document.getElementById("newItemInput").addEventListener("keydown", e => {
  if (e.key === "Enter") document.getElementById("addButton").click();
});

document.getElementById("resetButton").addEventListener("click", () => {
  if (!confirm("チェック状態をすべて未完了に戻しますか？")) return;
  items = items.map(i => ({ ...i, done: false }));
  saveItems();
  render();
});

document.getElementById("shareButton").addEventListener("click", async () => {
  const done = items.filter(i => i.done).length;
  const total = items.length;
  const missing = items.filter(i => !i.done).map(i => `・${i.text}`).join("\n") || "なし";
  const text = `ハワイアンズ準備：${done}/${total}完了\n\n未完了\n${missing}`;
  try {
    if (navigator.share) {
      await navigator.share({ title: "ハワイアンズ準備", text });
    } else {
      await navigator.clipboard.writeText(text);
      alert("共有文をコピーしました。LINEに貼って送れます。");
    }
  } catch (_) {}
});

const memo = document.getElementById("memo");
memo.value = localStorage.getItem(MEMO_KEY) || "";
memo.addEventListener("input", () => localStorage.setItem(MEMO_KEY, memo.value));

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  document.getElementById("themeToggle").textContent = theme === "dark" ? "☀️" : "🌙";
  localStorage.setItem(THEME_KEY, theme);
}
applyTheme(localStorage.getItem(THEME_KEY) || "light");
document.getElementById("themeToggle").addEventListener("click", () => {
  applyTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark");
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => navigator.serviceWorker.register("service-worker.js"));
}

render();
