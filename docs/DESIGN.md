# 代码结构

技术栈没动：原生 HTML/CSS/JS + localStorage，不引入框架、不加构建步骤。动的是 app.js 那 576 行怎么拆。

## 原来什么样

| 位置 | 问题 |
| --- | --- |
| `app.js` | 单个文件 576 行：常量、DOM 查询、状态、校验、渲染、持久化全在一起 |
| 校验 | 规则（标题 48 字、正文 5 字、标签 6 个）写在 `validateForm()` 里，和 DOM 读写缠在一起，只能靠手点验证 |
| 筛选排序 | 逻辑直接读 `searchInput.value` / `sortInput.value`，函数不可复用也不可测 |
| 空状态 | `emptyState.hidden = true` 无效——CSS 给 `.empty-state` 设了 `display: grid`，盖掉了浏览器对 `[hidden]` 的默认 `display: none`，于是列表有内容时空提示也一直挂在下面 |
| 图片兜底 | 只往本地图退一次，而 `assets/local-fallback/` 并不存在，于是每次都留一个破图标 |

## 现在怎么分

```
constants.js  纯数据：存储键、主题角色、心情、限制
logic.js      纯函数：校验 / 筛选 / 排序 / 统计 / 格式化
store.js      localStorage 读写 + id + 示例数据（storage 可注入）
ui.js         渲染：卡片、列表、统计、图库
app.js        入口：抓节点、管状态、绑事件
```

依赖方向是单向的：`app → ui → logic → constants`，`app → store → constants`。`logic.js` 一行 DOM 代码都没有，所以能直接跑 Node 测试。

## 为什么不用 ES module

试过 `type="module"` + `import`，结构更干净，但 `file://` 下 Chrome 会以 CORS 为由拒绝加载模块脚本，而 README 里"双击 index.html"是主要使用方式。

所以退回经典脚本 + 一个显式命名空间：

```js
(function (global) {
  "use strict";
  // ...实现
  const api = { normalizeTags, validateDraft };
  global.NoteLogic = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(globalThis);
```

浏览器按 `<script>` 顺序加载即可；Node 里 `require` 同一个文件就能拿到同一份函数。代价是每个文件多六行包装。

## 顺手修的两个显示问题

- **空状态常显**：补 `.empty-state[hidden] { display: none; }`。`display: grid` 的优先级高于浏览器默认的 `[hidden]`，必须显式声明。
- **破图标**：图片兜底改成两级（外链 → 本地 → 隐藏），本地图缺失时把 `img` 加上 `is-missing` 而不是留个破图标。

## 测试怎么跑

`logic.js` 与 `store.js` 不碰 DOM，用 Node 自带测试运行器直接测：

```bash
node --test tests/*.test.js
```

`store.js` 的 `loadNotes(storage)` / `saveNotes(notes, storage)` 把 localStorage 作为参数，测试塞个 `Map` 假对象就能覆盖"坏 JSON / 不是数组 / 没数据"三种情况。UI 层没有自动化测试，靠浏览器手动验证（我在 Chrome 里跑过新增、编辑、校验三条路径）。

## 代价

- 五个文件替代一个文件，读代码要在 5 个文件之间跳。
- 命名空间挂在 `global` 上，靠 `<script>` 顺序保证依赖就绪；顺序写错会静默拿到 `undefined`。
- `ui.js` 仍然直接操作 DOM，没有测试；这部分只能靠手点。
