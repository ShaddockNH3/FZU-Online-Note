const assert = require("node:assert/strict");
const { test } = require("node:test");

require("../assets/js/constants.js");
const { LIMITS } = global.NoteConfig;
const {
  compareNotes,
  formatDate,
  isToday,
  matches,
  moodLabel,
  normalizeTags,
  statsOf,
  themeOf,
  validateDraft,
  visibleNotes,
} = require("../assets/js/logic.js");

const TODAY = new Date("2026-05-01T10:00:00+08:00").toDateString();

function note(overrides = {}) {
  return {
    id: "n1",
    title: "示例标题",
    content: "这是一段足够长的正文内容",
    tags: ["Web"],
    theme: "chieri",
    mood: "study",
    pinned: false,
    createdAt: new Date("2026-05-01T09:00:00+08:00").toISOString(),
    updatedAt: new Date("2026-05-01T09:30:00+08:00").toISOString(),
    ...overrides,
  };
}

test("normalizeTags 支持中英文逗号与空白", () => {
  assert.deepEqual(normalizeTags("Web, CSS，笔记  前端"), ["Web", "CSS", "笔记", "前端"]);
});

test("normalizeTags 丢掉空值并截断到上限", () => {
  assert.deepEqual(normalizeTags(",, ,"), []);
  const many = Array.from({ length: 10 }, (_, i) => `t${i}`).join(",");
  assert.equal(normalizeTags(many).length, LIMITS.tagMax);
});

test("validateDraft 拒绝空标题", () => {
  const result = validateDraft({ title: "  ", content: "够长的内容", tagsRaw: "" });
  assert.equal(result.valid, false);
  assert.equal(result.errors.title, "标题不能为空");
});

test("validateDraft 限制标题长度", () => {
  const result = validateDraft({ title: "字".repeat(LIMITS.titleMax + 1), content: "够长的内容", tagsRaw: "" });
  assert.equal(result.valid, false);
  assert.match(result.errors.title, /48/);
});

test("validateDraft 要求正文至少五个字", () => {
  const result = validateDraft({ title: "标题", content: "短", tagsRaw: "" });
  assert.equal(result.valid, false);
  assert.match(result.errors.content, /5/);
});

test("validateDraft 通过时返回规整后的字段", () => {
  const result = validateDraft({ title: "  标题  ", content: "  正文内容够长  ", tagsRaw: " a，b " });
  assert.equal(result.valid, true);
  assert.deepEqual(result.errors, {});
  assert.equal(result.value.title, "标题");
  assert.deepEqual(result.value.tags, ["a", "b"]);
});

test("isToday 按本地日期比较", () => {
  assert.equal(isToday(new Date("2026-05-01T09:00:00+08:00").toISOString(), TODAY), true);
  assert.equal(isToday(new Date("2026-04-30T09:00:00+08:00").toISOString(), TODAY), false);
});

test("matches 处理置顶与今日筛选", () => {
  assert.equal(matches(note({ pinned: true }), { filter: "pinned", today: TODAY }), true);
  assert.equal(matches(note({ pinned: false }), { filter: "pinned", today: TODAY }), false);
  assert.equal(matches(note(), { filter: "today", today: TODAY }), true);
  assert.equal(matches(note(), { filter: "all", keyword: "示例", today: TODAY }), true);
});

test("matches 搜标题、正文、标签和主题名", () => {
  assert.equal(matches(note(), { keyword: "足够长的正文", today: TODAY }), true);
  assert.equal(matches(note(), { keyword: "雪村千绘莉", today: TODAY }), true);
  assert.equal(matches(note(), { keyword: "不存在", today: TODAY }), false);
});

test("compareNotes 置顶永远在前", () => {
  const pinned = note({ id: "p", pinned: true, updatedAt: "2020-01-01T00:00:00+08:00" });
  const fresh = note({ id: "f", pinned: false });
  assert.ok(compareNotes("updated", pinned, fresh) < 0);
});

test("compareNotes 按标题与时间排序", () => {
  const a = note({ id: "a", title: "阿" });
  const b = note({ id: "b", title: "波" });
  assert.ok(compareNotes("title", a, b) < 0);

  const older = note({ id: "o", updatedAt: "2026-04-01T00:00:00+08:00" });
  const newer = note({ id: "n", updatedAt: "2026-05-01T00:00:00+08:00" });
  assert.ok(compareNotes("updated", older, newer) > 0);
});

test("visibleNotes 组合筛选、搜索与排序", () => {
  const notes = [
    note({ id: "a", title: "甲", pinned: true }),
    note({ id: "b", title: "乙", tags: ["CSS"] }),
    note({ id: "c", title: "丙", createdAt: "2026-04-01T00:00:00+08:00" }),
  ];

  assert.deepEqual(visibleNotes(notes, { filter: "all", today: TODAY }).map((item) => item.id), ["a", "b", "c"]);
  assert.deepEqual(visibleNotes(notes, { filter: "all", keyword: "CSS", today: TODAY }).map((item) => item.id), ["b"]);
  assert.deepEqual(visibleNotes(notes, { filter: "pinned", today: TODAY }).map((item) => item.id), ["a"]);
});

test("statsOf 统计总数、置顶、标签与今日", () => {
  const stats = statsOf(
    [note({ pinned: true, tags: ["a", "b"] }), note({ id: "n2", tags: ["b"], createdAt: "2026-04-01T00:00:00+08:00" })],
    TODAY,
  );
  assert.equal(stats.total, 2);
  assert.equal(stats.pinned, 1);
  assert.equal(stats.tags, 2);
  assert.equal(stats.today, 1);
});

test("themeOf 与 moodLabel 对未知值有兜底", () => {
  assert.equal(themeOf("chieri").label, "雪村千绘莉");
  assert.equal(themeOf("不存在").label, themeOf("chieri").label);
  assert.equal(moodLabel("study"), "学习");
  assert.equal(moodLabel("未知"), "笔记");
});

test("formatDate 输出中文月日时分", () => {
  assert.match(formatDate("2026-05-01T09:30:00+08:00"), /\d{2}.*\d{2}.*\d{2}:\d{2}/);
});
