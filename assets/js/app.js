const STORAGE_KEY = "fzu-online-note:v1";

const themes = {
  chieri: {
    label: "雪村千绘莉",
    roman: "Yukimura Chieri",
    species: "俄罗斯蓝猫",
    favorite: "巧克力",
    source: "https://moegirl.uk/%E9%9B%AA%E6%9D%91%E5%8D%83%E7%BB%98%E8%8E%89",
    image: "https://moegirl.uk/images/8/89/Chara_chieri_std1-pc.png",
    fallbackImage: "assets/local-fallback/chieri.png",
    accent: "#7f90aa",
  },
  mikuri: {
    label: "天宫美久栗",
    roman: "Amamiya Mikuri",
    species: "博美犬",
    favorite: "栗子、肉类、巧克力咖啡",
    source: "https://moegirl.uk/%E5%A4%A9%E5%AE%AB%E7%BE%8E%E4%B9%85%E6%A0%97",
    image: "https://moegirl.uk/images/9/92/Chara_mikuri.png",
    fallbackImage: "assets/local-fallback/mikuri.png",
    accent: "#f0bd59",
  },
  ichika: {
    label: "御园莓华",
    roman: "Misono Ichika",
    species: "贵宾犬",
    favorite: "咖啡与甜食、草莓巧克力",
    source: "https://moegirl.uk/%E5%BE%A1%E5%9B%AD%E8%8E%93%E5%8D%8E",
    image: "https://moegirl.uk/images/b/b5/Chara_ichika.png",
    fallbackImage: "assets/local-fallback/ichika.png",
    accent: "#e96f8c",
  },
  nana: {
    label: "舞羽娜娜",
    roman: "Maiba Nana",
    species: "美国短毛猫",
    favorite: "零食、黑巧克力",
    source: "https://moegirl.uk/%E8%88%9E%E7%BE%BD%E5%A8%9C%E5%A8%9C",
    image: "https://moegirl.uk/images/f/fa/Chara_nana_std1-pc.png",
    fallbackImage: "assets/local-fallback/nana.png",
    accent: "#7bcbb7",
  },
  kaguya: {
    label: "百濑辉夜",
    roman: "Momose Kaguya",
    species: "荷兰垂耳兔",
    favorite: "姐姐做的日式点心、西式点心、野菜",
    source: "https://moegirl.uk/%E7%99%BE%E6%BF%91%E8%BE%89%E5%A4%9C",
    image: "https://moegirl.uk/images/6/62/%E7%99%BE%E6%BF%91%E8%BE%89%E5%A4%9C.png",
    fallbackImage: "assets/local-fallback/kaguya.png",
    accent: "#9fb8ea",
  },
  mitsuki: {
    label: "百濑美月",
    roman: "Momose Mitsuki",
    species: "荷兰垂耳兔",
    favorite: "日式点心、酒",
    source: "https://moegirl.uk/%E7%99%BE%E6%BF%91%E7%BE%8E%E6%9C%88",
    image: "https://moegirl.uk/images/d/df/%E7%99%BE%E6%BF%91%E7%BE%8E%E6%9C%88.png",
    fallbackImage: "assets/local-fallback/mitsuki.png",
    accent: "#e5be66",
  },
  kohana: {
    label: "小花",
    roman: "Kohana",
    species: "北极狼",
    favorite: "巧克力、烧制巧克力、日式饭团",
    source: "https://moegirl.uk/index.php?title=%E5%B7%A7%E5%85%8B%E7%94%9C%E6%81%8B&variant=zh-cn",
    image: "https://moegirl.uk/images/d/de/%E5%B0%8F%E8%8A%B1%28%E5%B7%A7%E5%85%8B%E7%94%9C%E6%81%8B%29.png",
    fallbackImage: "assets/local-fallback/kohana.png",
    accent: "#c5b7df",
  },
};

const moodLabels = {
  study: "学习",
  idea: "灵感",
  task: "待办",
  review: "复盘",
};

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

let notes = loadNotes();
let activeFilter = "all";

render();
updateThemePreview();
renderCharacterGallery();

form.addEventListener("submit", handleSubmit);
resetButton.addEventListener("click", resetForm);
themeInput.addEventListener("change", updateThemePreview);
searchInput.addEventListener("input", renderNotes);
sortInput.addEventListener("change", renderNotes);

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;
    filterButtons.forEach((item) => item.classList.toggle("is-active", item === button));
    renderNotes();
  });
});

function handleSubmit(event) {
  event.preventDefault();

  const validation = validateForm();
  if (!validation.valid) {
    return;
  }

  const now = new Date().toISOString();
  const existingId = noteIdInput.value;

  if (existingId) {
    notes = notes.map((note) =>
      note.id === existingId
        ? {
            ...note,
            ...validation.value,
            updatedAt: now,
          }
        : note,
    );
  } else {
    notes.unshift({
      id: createId(),
      ...validation.value,
      createdAt: now,
      updatedAt: now,
    });
  }

  persist();
  resetForm();
  render();
}

function validateForm() {
  const title = titleInput.value.trim();
  const content = contentInput.value.trim();
  const tags = normalizeTags(tagsInput.value);
  let valid = true;

  clearErrors();

  if (!title) {
    setFieldError(titleInput, titleError, "标题不能为空");
    valid = false;
  } else if (title.length > 48) {
    setFieldError(titleInput, titleError, "标题不能超过 48 个字");
    valid = false;
  }

  if (!content) {
    setFieldError(contentInput, contentError, "内容不能为空");
    valid = false;
  } else if (content.length < 5) {
    setFieldError(contentInput, contentError, "内容至少写 5 个字");
    valid = false;
  }

  if (tags.length > 6) {
    setFieldError(tagsInput, contentError, "标签最多 6 个");
    valid = false;
  }

  return {
    valid,
    value: {
      title,
      content,
      tags,
      theme: themeInput.value,
      mood: moodInput.value,
      pinned: pinnedInput.checked,
    },
  };
}

function setFieldError(input, target, message) {
  input.closest(".field")?.classList.add("is-invalid");
  target.textContent = message;
}

function clearErrors() {
  document.querySelectorAll(".field.is-invalid").forEach((field) => field.classList.remove("is-invalid"));
  titleError.textContent = "";
  contentError.textContent = "";
}

function normalizeTags(value) {
  return value
    .split(/[,，\s]+/)
    .map((tag) => tag.trim())
    .filter(Boolean)
    .slice(0, 6);
}

function render() {
  renderNotes();
  renderStats();
}

function renderNotes() {
  const visibleNotes = getVisibleNotes();
  notesList.textContent = "";
  emptyState.hidden = visibleNotes.length > 0;

  const fragment = document.createDocumentFragment();
  visibleNotes.forEach((note) => fragment.appendChild(createNoteCard(note)));
  notesList.appendChild(fragment);
}

function createNoteCard(note) {
  const card = cardTemplate.content.firstElementChild.cloneNode(true);
  const theme = themes[note.theme] ?? themes.chieri;
  const title = card.querySelector("h3");
  const image = card.querySelector(".note-card-art");
  const excerpt = card.querySelector(".note-excerpt");
  const tagList = card.querySelector(".tag-list");
  const meta = card.querySelector(".note-meta");
  const pinButton = card.querySelector(".pin-button");

  card.dataset.id = note.id;
  card.classList.toggle("is-pinned", note.pinned);
  card.style.borderTop = `4px solid ${theme.accent}`;
  title.textContent = note.title;
  image.src = theme.image;
  image.alt = `${theme.label}主题`;
  image.onerror = () => {
    image.onerror = null;
    image.src = theme.fallbackImage;
  };
  excerpt.textContent = note.content;
  meta.textContent = `${theme.label} / ${theme.species} / ${moodLabels[note.mood] ?? "笔记"} / 更新于 ${formatDate(note.updatedAt)}`;
  pinButton.classList.toggle("is-active", note.pinned);

  if (note.tags.length === 0) {
    const tag = document.createElement("span");
    tag.textContent = "未分类";
    tagList.appendChild(tag);
  } else {
    note.tags.forEach((value) => {
      const tag = document.createElement("span");
      tag.textContent = value;
      tagList.appendChild(tag);
    });
  }

  pinButton.addEventListener("click", () => togglePinned(note.id));
  card.querySelector('[data-action="edit"]').addEventListener("click", () => editNote(note.id));
  card.querySelector('[data-action="duplicate"]').addEventListener("click", () => duplicateNote(note.id));
  card.querySelector('[data-action="delete"]').addEventListener("click", () => deleteNote(note.id));

  return card;
}

function getVisibleNotes() {
  const keyword = searchInput.value.trim().toLowerCase();
  const today = new Date().toDateString();

  return notes
    .filter((note) => {
      if (activeFilter === "pinned" && !note.pinned) {
        return false;
      }

      if (activeFilter === "today" && new Date(note.createdAt).toDateString() !== today) {
        return false;
      }

      if (!keyword) {
        return true;
      }

      return [note.title, note.content, note.tags.join(" "), themes[note.theme]?.label]
        .join(" ")
        .toLowerCase()
        .includes(keyword);
    })
    .sort(sortNotes);
}

function sortNotes(a, b) {
  if (a.pinned !== b.pinned) {
    return Number(b.pinned) - Number(a.pinned);
  }

  if (sortInput.value === "title") {
    return a.title.localeCompare(b.title, "zh-CN");
  }

  const field = sortInput.value === "created" ? "createdAt" : "updatedAt";
  return new Date(b[field]).getTime() - new Date(a[field]).getTime();
}

function editNote(id) {
  const note = notes.find((item) => item.id === id);
  if (!note) {
    return;
  }

  noteIdInput.value = note.id;
  titleInput.value = note.title;
  contentInput.value = note.content;
  tagsInput.value = note.tags.join(", ");
  themeInput.value = note.theme;
  moodInput.value = note.mood;
  pinnedInput.checked = note.pinned;
  saveButton.lastChild.textContent = "更新笔记";
  updateThemePreview();
  clearErrors();
  titleInput.focus();
}

function duplicateNote(id) {
  const note = notes.find((item) => item.id === id);
  if (!note) {
    return;
  }

  const now = new Date().toISOString();
  notes.unshift({
    ...note,
    id: createId(),
    title: `${note.title} 副本`,
    pinned: false,
    createdAt: now,
    updatedAt: now,
  });

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
    note.id === id
      ? {
          ...note,
          pinned: !note.pinned,
          updatedAt: new Date().toISOString(),
        }
      : note,
  );
  persist();
  render();
}

function resetForm() {
  form.reset();
  noteIdInput.value = "";
  saveButton.lastChild.textContent = "保存笔记";
  updateThemePreview();
  clearErrors();
}

function renderStats() {
  const today = new Date().toDateString();
  const uniqueTags = new Set(notes.flatMap((note) => note.tags));

  counters.total.textContent = notes.length;
  counters.pinned.textContent = notes.filter((note) => note.pinned).length;
  counters.tags.textContent = uniqueTags.size;
  counters.today.textContent = notes.filter((note) => new Date(note.createdAt).toDateString() === today).length;
}

function updateThemePreview() {
  const theme = themes[themeInput.value] ?? themes.chieri;
  themePreview.src = theme.image;
  themePreview.onerror = () => {
    themePreview.onerror = null;
    themePreview.src = theme.fallbackImage;
  };
  themeCaption.textContent = theme.label;
}

function renderCharacterGallery() {
  const fragment = document.createDocumentFragment();

  Object.values(themes).forEach((theme) => {
    const figure = document.createElement("figure");
    const image = document.createElement("img");
    const caption = document.createElement("figcaption");
    const name = document.createElement("strong");
    const meta = document.createElement("span");
    const source = document.createElement("a");

    image.src = theme.image;
    image.alt = `${theme.label}角色图`;
    image.loading = "lazy";
    image.onerror = () => {
      image.onerror = null;
      image.src = theme.fallbackImage;
    };
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

  characterGallery.append(fragment);
}

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  storageStatus.textContent = `已保存 ${new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}`;
}

function loadNotes() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    return Array.isArray(stored) ? stored : createSeedNotes();
  } catch {
    return createSeedNotes();
  }
}

function createId() {
  return globalThis.crypto?.randomUUID?.() ?? `note-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function createSeedNotes() {
  const now = Date.now();
  return [
    {
      id: createId(),
      title: "Web 作业需求拆解",
      content: "完成在线笔记：需要语义化 HTML、响应式 CSS、原生 JavaScript 交互、增删改查和 localStorage 持久化。",
      tags: ["Web", "需求"],
      theme: "chieri",
      mood: "study",
      pinned: true,
      createdAt: new Date(now - 1000 * 60 * 60 * 20).toISOString(),
      updatedAt: new Date(now - 1000 * 60 * 20).toISOString(),
    },
    {
      id: createId(),
      title: "笔记卡片交互",
      content: "卡片支持编辑、复制、删除、置顶，筛选区支持全部、置顶和今日新增。",
      tags: ["JavaScript", "CRUD"],
      theme: "mikuri",
      mood: "task",
      pinned: false,
      createdAt: new Date(now - 1000 * 60 * 60 * 5).toISOString(),
      updatedAt: new Date(now - 1000 * 60 * 60 * 2).toISOString(),
    },
    {
      id: createId(),
      title: "视觉主题记录",
      content: "主题角色参考萌娘百科《巧克甜恋》条目，图片使用网页直链；如果外链失败，会回退到本地缓存原图。",
      tags: ["CSS", "素材"],
      theme: "ichika",
      mood: "idea",
      pinned: false,
      createdAt: new Date(now - 1000 * 60 * 60 * 2).toISOString(),
      updatedAt: new Date(now - 1000 * 60 * 50).toISOString(),
    },
    {
      id: createId(),
      title: "角色图库校准",
      content: "图库主题覆盖千绘莉、美久栗、莓华、娜娜、辉夜、美月和小花，便于给每条笔记设置不同角色气质。",
      tags: ["图库", "主题"],
      theme: "kaguya",
      mood: "idea",
      pinned: false,
      createdAt: new Date(now - 1000 * 60 * 55).toISOString(),
      updatedAt: new Date(now - 1000 * 60 * 30).toISOString(),
    },
    {
      id: createId(),
      title: "答辩准备",
      content: "展示时按新增、搜索、编辑、删除、刷新后数据仍存在的顺序演示，能覆盖课程基本要求。",
      tags: ["答辩", "演示"],
      theme: "nana",
      mood: "review",
      pinned: false,
      createdAt: new Date(now - 1000 * 60 * 40).toISOString(),
      updatedAt: new Date(now - 1000 * 60 * 10).toISOString(),
    },
  ];
}

function formatDate(value) {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}
