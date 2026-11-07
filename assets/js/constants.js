/**
 * 静态配置：存储键、主题角色、心情标签，以及表单的长度限制。
 * 原来这些常量散在 app.js 顶部，被五个函数同时引用。
 */

(function (global) {
  "use strict";

  const STORAGE_KEY = "fzu-online-note:v1";

  /** 表单约束，校验与提示文案都从这里取。 */
  const LIMITS = {
    titleMax: 48,
    contentMin: 5,
    tagMax: 6,
  };

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

  // 心情枚举的中文显示文本，用于笔记卡片的元信息。

  const moodLabels = {
    study: "学习",
    idea: "灵感",
    task: "待办",
    review: "复盘",
  };

  const api = { STORAGE_KEY, LIMITS, themes, moodLabels };
  global.NoteConfig = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
