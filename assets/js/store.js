/**
 * 持久化：localStorage 读写、id 生成、首次使用的示例数据。
 *
 * storage 作为参数传入（默认取 localStorage），测试里塞个假对象就行。
 */


/** 生成笔记 id：优先用浏览器 UUID，不支持时用时间戳 + 随机数兜底。 */

(function (global) {
  "use strict";

  const { STORAGE_KEY } = global.NoteConfig;

  function createId() {
    return globalThis.crypto?.randomUUID?.() ?? `note-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  /** 首次打开页面时的示例笔记，方便直接演示完整交互。 */
  function createSeedNotes(now = Date.now()) {
    const minutesAgo = (minutes) => new Date(now - minutes * 60 * 1000).toISOString();

    return [
      {
        id: createId(),
        title: "Web 作业需求拆解",
        content: "完成在线笔记：需要语义化 HTML、响应式 CSS、原生 JavaScript 交互、增删改查和 localStorage 持久化。",
        tags: ["Web", "需求"],
        theme: "chieri",
        mood: "study",
        pinned: true,
        createdAt: minutesAgo(20 * 60),
        updatedAt: minutesAgo(20),
      },
      {
        id: createId(),
        title: "笔记卡片交互",
        content: "卡片支持编辑、复制、删除、置顶，筛选区支持全部、置顶和今日新增。",
        tags: ["JavaScript", "CRUD"],
        theme: "mikuri",
        mood: "task",
        pinned: false,
        createdAt: minutesAgo(5 * 60),
        updatedAt: minutesAgo(2 * 60),
      },
      {
        id: createId(),
        title: "视觉主题记录",
        content: "主题角色参考萌娘百科《巧克甜恋》条目，图片使用网页直链；如果外链失败，会回退到本地缓存原图。",
        tags: ["CSS", "素材"],
        theme: "ichika",
        mood: "idea",
        pinned: false,
        createdAt: minutesAgo(2 * 60),
        updatedAt: minutesAgo(50),
      },
      {
        id: createId(),
        title: "角色图库校准",
        content: "图库主题覆盖千绘莉、美久栗、莓华、娜娜、辉夜、美月和小花，便于给每条笔记设置不同角色气质。",
        tags: ["图库", "主题"],
        theme: "kaguya",
        mood: "idea",
        pinned: false,
        createdAt: minutesAgo(55),
        updatedAt: minutesAgo(30),
      },
      {
        id: createId(),
        title: "答辩准备",
        content: "展示时按新增、搜索、编辑、删除、刷新后数据仍存在的顺序演示，能覆盖课程基本要求。",
        tags: ["答辩", "演示"],
        theme: "nana",
        mood: "review",
        pinned: false,
        createdAt: minutesAgo(40),
        updatedAt: minutesAgo(10),
      },
    ];
  }

  /** 读笔记：没有数据、解析失败、不是数组，都回退到示例数据。 */
  function loadNotes(storage = globalThis.localStorage) {
    try {
      const stored = JSON.parse(storage.getItem(STORAGE_KEY) || "null");
      return Array.isArray(stored) ? stored : createSeedNotes();
    } catch {
      return createSeedNotes();
    }
  }

  /** 写笔记，返回保存时刻的本地时间字符串，给状态条用。 */
  function saveNotes(notes, storage = globalThis.localStorage) {
    storage.setItem(STORAGE_KEY, JSON.stringify(notes));
    return new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });
  }

  const api = { createId, createSeedNotes, loadNotes, saveNotes };
  global.NoteStore = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
