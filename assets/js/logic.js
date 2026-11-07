/**
 * 笔记的纯逻辑：校验、筛选、排序、统计、格式化。
 *
 * 这里不碰 DOM，也不碰 localStorage，所以能用 node --test 直接测。
 * 原来这些规则都长在 app.js 的事件回调里，只能靠手点验证。
 */


/** 按中英文逗号和空白拆分标签，去空并截断到上限。 */

(function (global) {
  "use strict";

  const { LIMITS, moodLabels, themes } = global.NoteConfig;

  function normalizeTags(value) {
    return String(value || "")
      .split(/[,，\s]+/)
      .map((tag) => tag.trim())
      .filter(Boolean)
      .slice(0, LIMITS.tagMax);
  }

  /**
   * 校验一份草稿，返回错误表与规整后的标签。
   * 错误键是字段名（title / content / tags），文案由这里给。
   */
  function validateDraft({ title, content, tagsRaw }) {
    const trimmedTitle = String(title || "").trim();
    const trimmedContent = String(content || "").trim();
    const tags = normalizeTags(tagsRaw);
    const errors = {};

    if (!trimmedTitle) {
      errors.title = "标题不能为空";
    } else if (trimmedTitle.length > LIMITS.titleMax) {
      errors.title = `标题不能超过 ${LIMITS.titleMax} 个字`;
    }

    if (!trimmedContent) {
      errors.content = "内容不能为空";
    } else if (trimmedContent.length < LIMITS.contentMin) {
      errors.content = `内容至少写 ${LIMITS.contentMin} 个字`;
    }

    if (tags.length > LIMITS.tagMax) {
      errors.tags = `标签最多 ${LIMITS.tagMax} 个`;
    }

    return {
      valid: Object.keys(errors).length === 0,
      errors,
      value: {
        title: trimmedTitle,
        content: trimmedContent,
        tags,
      },
    };
  }

  function themeOf(key) {
    return themes[key] ?? themes.chieri;
  }

  function moodLabel(key) {
    return moodLabels[key] ?? "笔记";
  }

  /** 是否是"今天"创建的。today 传参是为了测试可控。 */
  function isToday(isoString, today = new Date().toDateString()) {
    return new Date(isoString).toDateString() === today;
  }

  /** 一条笔记是否符合当前筛选与搜索条件。 */
  function matches(note, { filter = "all", keyword = "", today } = {}) {
    if (filter === "pinned" && !note.pinned) {
      return false;
    }
    if (filter === "today" && !isToday(note.createdAt, today)) {
      return false;
    }

    const needle = keyword.trim().toLowerCase();
    if (!needle) {
      return true;
    }

    return [note.title, note.content, (note.tags || []).join(" "), themeOf(note.theme).label]
      .join(" ")
      .toLowerCase()
      .includes(needle);
  }

  /** 置顶优先；其余按标题、创建时间或更新时间排序。 */
  function compareNotes(sort = "updated", left, right) {
    if (left.pinned !== right.pinned) {
      return Number(right.pinned) - Number(left.pinned);
    }

    if (sort === "title") {
      return left.title.localeCompare(right.title, "zh-CN");
    }

    const field = sort === "created" ? "createdAt" : "updatedAt";
    return new Date(right[field]).getTime() - new Date(left[field]).getTime();
  }

  /** 筛选 + 搜索 + 排序一次做完。 */
  function visibleNotes(notes, { filter = "all", keyword = "", sort = "updated", today } = {}) {
    return notes
      .filter((note) => matches(note, { filter, keyword, today }))
      .sort((left, right) => compareNotes(sort, left, right));
  }

  /** 统计面板用的四个数字。 */
  function statsOf(notes, today = new Date().toDateString()) {
    return {
      total: notes.length,
      pinned: notes.filter((note) => note.pinned).length,
      tags: new Set(notes.flatMap((note) => note.tags || [])).size,
      today: notes.filter((note) => isToday(note.createdAt, today)).length,
    };
  }

  /** ISO 时间 → 中文月日时分。 */
  function formatDate(value) {
    return new Intl.DateTimeFormat("zh-CN", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));
  }

  const api = { normalizeTags, validateDraft, themeOf, moodLabel, isToday, matches, compareNotes, visibleNotes, statsOf, formatDate };
  global.NoteLogic = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
