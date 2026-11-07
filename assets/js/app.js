/**
 * 入口：抓节点、管状态、绑事件。
 *
 * 规则在 logic.js，读写在 store.js，画 DOM 在 ui.js。这里只负责把它们串起来。
 */

(function (global) {
  "use strict";

  const { createId, loadNotes, saveNotes } = global.NoteStore;
  const { statsOf, validateDraft, visibleNotes } = global.NoteLogic;
  const { paintCharacterGallery, paintNotes, paintStats, paintThemePreview } = global.NoteView;

  // 页面节点：表单、列表、状态条。集中查一次，避免后续反复 querySelector。
  const form = document.querySelector("#note-form");
  const noteIdInput = document.querySelector("#note-id");
  const titleInput = document.querySelector("#title");
  const contentInput = document.querySelector("#content");
  const tagsInput = document.querySelector("#tags");
  const themeInput = document.querySelector("#theme");
  const moodInput = document.querySelector("#mood");
  const pinnedInput = document.querySelector("#pinned");
  const titleError = document.querySelector("#title-error");
  const contentError = document.querySelector("#content-error");
  const saveButton = document.querySelector("#save-button");
  const resetButton = document.querySelector("#reset-button");
  const themePreview = document.querySelector("#theme-preview");
  const themeCaption = document.querySelector("#theme-caption");
  const searchInput = document.querySelector("#search");
  const sortInput = document.querySelector("#sort");
  const notesList = document.querySelector("#notes-list");
  const emptyState = document.querySelector("#empty-state");
  const cardTemplate = document.querySelector("#note-card-template");
  const characterGallery = document.querySelector("#character-gallery");
  const filterButtons = [...document.querySelectorAll("[data-filter]")];
  const storageStatus = document.querySelector("#storage-status");

  const counters = {
    total: document.querySelector("#total-count"),
    pinned: document.querySelector("#pinned-count"),
    tags: document.querySelector("#tag-count"),
    today: document.querySelector("#today-count"),
  };

  // 内存里的全部笔记与当前筛选页签。
  let notes = loadNotes();
  let activeFilter = "all";

  // 首次渲染。
  render();
  paintThemePreview({ image: themePreview, caption: themeCaption }, themeInput.value);
  paintCharacterGallery(characterGallery);

  // 页面级事件。
  form.addEventListener("submit", handleSubmit);
  resetButton.addEventListener("click", resetForm);
  themeInput.addEventListener("change", () => {
    paintThemePreview({ image: themePreview, caption: themeCaption }, themeInput.value);
  });
  searchInput.addEventListener("input", renderNotes);
  sortInput.addEventListener("change", renderNotes);

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      activeFilter = button.dataset.filter;
      filterButtons.forEach((item) => item.classList.toggle("is-active", item === button));
      renderNotes();
    });
  });

  // --- 提交与校验 -----------------------------------------------------

  function handleSubmit(event) {
    event.preventDefault();

    const draft = validateDraft({
      title: titleInput.value,
      content: contentInput.value,
      tagsRaw: tagsInput.value,
    });
    showErrors(draft.errors);
    if (!draft.valid) {
      return;
    }

    const now = new Date().toISOString();
    const existingId = noteIdInput.value;

    if (existingId) {
      notes = notes.map((note) =>
        note.id === existingId ? { ...note, ...draft.value, updatedAt: now } : note,
      );
    } else {
      notes = [
        { id: createId(), ...draft.value, theme: themeInput.value, mood: moodInput.value, pinned: pinnedInput.checked, createdAt: now, updatedAt: now },
        ...notes,
      ];
    }

    persist();
    resetForm();
    render();
  }

  /** 把校验错误挂到对应字段上；标签错误沿用内容区的提示位。 */
  function showErrors(errors) {
    clearErrors();

    if (errors.title) {
      titleInput.closest(".field")?.classList.add("is-invalid");
      titleError.textContent = errors.title;
    }

    if (errors.content) {
      contentInput.closest(".field")?.classList.add("is-invalid");
      contentError.textContent = errors.content;
    }

    if (errors.tags) {
      tagsInput.closest(".field")?.classList.add("is-invalid");
      contentError.textContent = errors.tags;
    }
  }

  function clearErrors() {
    document.querySelectorAll(".field.is-invalid").forEach((field) => field.classList.remove("is-invalid"));
    titleError.textContent = "";
    contentError.textContent = "";
  }

  // --- 渲染 -----------------------------------------------------------

  function currentQuery() {
    return {
      filter: activeFilter,
      keyword: searchInput.value,
      sort: sortInput.value,
    };
  }

  function render() {
    renderNotes();
    paintStats(counters, statsOf(notes));
  }

  function renderNotes() {
    paintNotes({
      list: notesList,
      emptyState,
      template: cardTemplate,
      notes: visibleNotes(notes, currentQuery()),
      handlers: {
        onTogglePin: togglePinned,
        onEdit: editNote,
        onDuplicate: duplicateNote,
        onDelete: deleteNote,
      },
    });
  }

  // --- 单条笔记操作 ---------------------------------------------------

  function editNote(id) {
    const note = notes.find((item) => item.id === id);
    if (!note) {
      return;
    }

    noteIdInput.value = note.id;
    titleInput.value = note.title;
    contentInput.value = note.content;
    tagsInput.value = (note.tags || []).join(", ");
    themeInput.value = note.theme;
    moodInput.value = note.mood;
    pinnedInput.checked = Boolean(note.pinned);
    saveButton.lastChild.textContent = "更新笔记";
    paintThemePreview({ image: themePreview, caption: themeCaption }, themeInput.value);
    clearErrors();
    titleInput.focus();
  }

  function duplicateNote(id) {
    const note = notes.find((item) => item.id === id);
    if (!note) {
      return;
    }

    const now = new Date().toISOString();
    notes = [
      { ...note, id: createId(), title: `${note.title} 副本`, pinned: false, createdAt: now, updatedAt: now },
      ...notes,
    ];

    persist();
    render();
  }

  function deleteNote(id) {
    const note = notes.find((item) => item.id === id);
    if (!note || !confirm(`删除「${note.title}」？`)) {
      return;
    }

    notes = notes.filter((item) => item.id !== id);
    persist();

    if (noteIdInput.value === id) {
      resetForm();
    }

    render();
  }

  function togglePinned(id) {
    notes = notes.map((note) =>
      note.id === id ? { ...note, pinned: !note.pinned, updatedAt: new Date().toISOString() } : note,
    );
    persist();
    render();
  }

  function resetForm() {
    form.reset();
    noteIdInput.value = "";
    saveButton.lastChild.textContent = "保存笔记";
    paintThemePreview({ image: themePreview, caption: themeCaption }, themeInput.value);
    clearErrors();
  }

  // --- 持久化 ---------------------------------------------------------

  function persist() {
    const savedAt = saveNotes(notes);
    storageStatus.textContent = `已保存 ${savedAt}`;
  }

})(typeof globalThis !== "undefined" ? globalThis : this);
