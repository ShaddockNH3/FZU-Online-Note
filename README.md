# FZU Online Note

原生 HTML + CSS + JavaScript 写的在线笔记：增删改查、置顶、搜索、筛选、排序，数据存在浏览器 `localStorage`。不需要后端，也不需要构建。

## 运行

方式一，直接双击 `index.html`。脚本用的是经典 `<script>`，没有 `type="module"`，`file://` 下也能跑。

方式二，起个静态服务（想换端口就改数字）：

```bash
python3 -m http.server 4173     # 或 npm run serve
```

然后访问 <http://127.0.0.1:4173/index.html>。

## 功能

| 操作 | 说明 |
| --- | --- |
| 新建 / 编辑 | 标题不超过 48 字，正文至少 5 字，标签最多 6 个（中英文逗号都认） |
| 置顶 | 置顶笔记始终排在最前 |
| 搜索 | 同时匹配标题、正文、标签和主题角色名 |
| 筛选 | 全部 / 置顶 / 今日新增 |
| 排序 | 最近更新（默认）、创建时间、标题 |
| 复制 / 删除 | 复制会加「副本」后缀并取消置顶；删除有确认框 |
| 主题 | 每个主题对应一个角色配色，卡片顶部色条跟主题走 |

## 项目结构

```
index.html                 页面骨架 + 卡片模板 <template>
assets/css/styles.css      样式
assets/js/constants.js     存储键、主题角色表、心情标签、表单限制
assets/js/logic.js         校验、筛选、排序、统计、格式化（不碰 DOM）
assets/js/store.js         localStorage 读写、id 生成、示例数据
assets/js/ui.js            渲染卡片、列表、统计与图库
assets/js/app.js           入口：抓节点、管状态、绑事件
tests/                     logic 与 store 的单测
```

四个模块通过 `global.NoteConfig` / `NoteLogic` / `NoteStore` / `NoteView` 暴露，`index.html` 按依赖顺序加载。同一个函数在 Node 里也能 `require` 出来测，所以不用打包工具。

## 测试

```bash
npm test          # 等价于 node --test tests/*.test.js
```

21 个用例覆盖标签拆分、表单校验、筛选搜索排序、统计口径、localStorage 容错（缺数据 / 坏 JSON / 不是数组）。

## 已知问题

- 主题图片是萌娘百科外链，对方有防盗链，直连常失败；`assets/local-fallback/` 里的本地兜底图没随仓库提交，所以现在图片位置是空白的。代码会先退到本地图，再退到隐藏。
- 数据只存本地，换浏览器或清缓存就没了，没有导出 / 导入。
- 搜索是逐个 `includes` 的线性匹配，几百条以内没感觉，再多需要建索引。
- 没有富文本，正文按纯文本渲染（这也是 XSS 面最小的做法）。

## 更多

重构说明见 [docs/DESIGN.md](docs/DESIGN.md)。

## License

MIT，见 [LICENSE](LICENSE)。
