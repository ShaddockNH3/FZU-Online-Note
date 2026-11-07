/**
 * 渲染：把数据画成 DOM。只接收节点引用和回调，不持有全局状态。
 */


/**
 * 外链图片统一挂兜底：先试本地缓存，本地也没有就把图藏起来。
 * 原来只退一次，本地兜底图缺失时浏览器会一直显示破图标。
 */

(function (global) {
  "use strict";

  const { themes } = global.NoteConfig;
  const { formatDate, moodLabel, themeOf } = global.NoteLogic;

  function withFallback(image, theme, alt) {
    image.src = theme.image;
    image.alt = alt;
    image.onerror = () => {
      if (!image.dataset.fallbackTried) {
        image.dataset.fallbackTried = "1";
        image.src = theme.fallbackImage;
        return;
      }
      image.onerror = null;
      image.classList.add("is-missing");
      image.removeAttribute("src");
    };
  }

  /** 克隆卡片模板并填充内容。手写 DOM 而不是 innerHTML，避免把用户输入当 HTML 解析。 */
  function createNoteCard(template, note, handlers) {
    const card = template.content.firstElementChild.cloneNode(true);
    const theme = themeOf(note.theme);
    const title = card.querySelector("h3");
    const image = card.querySelector(".note-card-art");
    const excerpt = card.querySelector(".note-excerpt");
    const tagList = card.querySelector(".tag-list");
    const meta = card.querySelector(".note-meta");
    const pinButton = card.querySelector(".pin-button");

    card.dataset.id = note.id;
    card.classList.toggle("is-pinned", Boolean(note.pinned));
    card.style.borderTop = `4px solid ${theme.accent}`;
    title.textContent = note.title;
    withFallback(image, theme, `${theme.label}主题`);
    excerpt.textContent = note.content;
    meta.textContent = `${theme.label} / ${theme.species} / ${moodLabel(note.mood)} / 更新于 ${formatDate(note.updatedAt)}`;
    pinButton.classList.toggle("is-active", Boolean(note.pinned));

    const tags = (note.tags || []).length > 0 ? note.tags : ["未分类"];
    tags.forEach((value) => {
      const tag = document.createElement("span");
      tag.textContent = value;
      tagList.appendChild(tag);
    });

    pinButton.addEventListener("click", () => handlers.onTogglePin(note.id));
    card.querySelector('[data-action="edit"]').addEventListener("click", () => handlers.onEdit(note.id));
    card.querySelector('[data-action="duplicate"]').addEventListener("click", () => handlers.onDuplicate(note.id));
    card.querySelector('[data-action="delete"]').addEventListener("click", () => handlers.onDelete(note.id));

    return card;
  }

  /** 重画笔记列表。空列表时显示空状态。 */
  function paintNotes({ list, emptyState, template, notes, handlers }) {
    list.textContent = "";
    emptyState.hidden = notes.length > 0;

    const fragment = document.createDocumentFragment();
    notes.forEach((note) => fragment.appendChild(createNoteCard(template, note, handlers)));
    list.appendChild(fragment);
  }

  /** 刷新四个统计数字。 */
  function paintStats(counters, stats) {
    counters.total.textContent = stats.total;
    counters.pinned.textContent = stats.pinned;
    counters.tags.textContent = stats.tags;
    counters.today.textContent = stats.today;
  }

  /** 表单旁的角色预览。 */
  function paintThemePreview({ image, caption }, themeKey) {
    const theme = themeOf(themeKey);
    withFallback(image, theme, `${theme.label}预览`);
    caption.textContent = theme.label;
  }

  /** 一次性生成角色图库。 */
  function paintCharacterGallery(container) {
    const fragment = document.createDocumentFragment();

    Object.values(themes).forEach((theme) => {
      const figure = document.createElement("figure");
      const image = document.createElement("img");
      const caption = document.createElement("figcaption");
      const name = document.createElement("strong");
      const meta = document.createElement("span");
      const source = document.createElement("a");

      withFallback(image, theme, `${theme.label}角色图`);
      image.loading = "lazy";
      name.textContent = theme.label;
      meta.textContent = `${theme.roman} / ${theme.species} / 喜欢：${theme.favorite}`;
      source.href = theme.source;
      source.target = "_blank";
      source.rel = "noreferrer";
      source.textContent = "萌娘百科资料";

      caption.append(name, meta, source);
      figure.style.borderTop = `4px solid ${theme.accent}`;
      figure.append(image, caption);
      fragment.append(figure);
    });

    container.append(fragment);
  }

  const api = { createNoteCard, paintNotes, paintStats, paintThemePreview, paintCharacterGallery };
  global.NoteView = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
