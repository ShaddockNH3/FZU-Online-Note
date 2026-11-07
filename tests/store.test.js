const assert = require("node:assert/strict");
const { test } = require("node:test");

require("../assets/js/constants.js");
const { STORAGE_KEY } = global.NoteConfig;
const { createSeedNotes, loadNotes, saveNotes } = require("../assets/js/store.js");

/** 假 localStorage：只实现用到的两个方法。 */
function fakeStorage(initial = {}) {
  const data = new Map(Object.entries(initial));
  return {
    getItem: (key) => (data.has(key) ? data.get(key) : null),
    setItem: (key, value) => data.set(key, value),
    dump: () => Object.fromEntries(data),
  };
}

test("loadNotes 读到数组就用数组", () => {
  const storage = fakeStorage({ [STORAGE_KEY]: JSON.stringify([{ id: "a" }]) });
  assert.deepEqual(loadNotes(storage), [{ id: "a" }]);
});

test("loadNotes 没有数据时给示例笔记", () => {
  const notes = loadNotes(fakeStorage());
  assert.equal(notes.length, 5);
  assert.ok(notes.some((note) => note.pinned));
});

test("loadNotes 解析失败时回退示例", () => {
  const storage = fakeStorage({ [STORAGE_KEY]: "{坏掉的 json" });
  assert.equal(loadNotes(storage).length, 5);
});

test("loadNotes 存的不是数组也回退", () => {
  const storage = fakeStorage({ [STORAGE_KEY]: JSON.stringify({ a: 1 }) });
  assert.equal(loadNotes(storage).length, 5);
});

test("saveNotes 写回原键并返回时间文案", () => {
  const storage = fakeStorage();
  const savedAt = saveNotes([{ id: "a" }], storage);

  assert.deepEqual(JSON.parse(storage.dump()[STORAGE_KEY]), [{ id: "a" }]);
  assert.match(savedAt, /^\d{2}:\d{2}$/);
});

test("createSeedNotes 生成带时间差的示例", () => {
  const now = Date.parse("2026-05-01T12:00:00+08:00");
  const notes = createSeedNotes(now);

  assert.equal(notes.length, 5);
  for (const note of notes) {
    assert.ok(note.id);
    assert.ok(note.title);
    assert.ok(note.content.length > 5);
    assert.ok(Date.parse(note.createdAt) <= now);
  }
  assert.equal(notes[0].pinned, true);
});
