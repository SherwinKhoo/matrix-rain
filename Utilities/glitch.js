"use strict";

import { CONFIG } from "./config.js";
import { randomNumber } from "./random.js";

// Partial for testing
const glitchMap = {
  體: "体",
  靈: "灵",
  愛: "爱",
  學: "学",
  覺: "觉",
  見: "见",
  書: "书",
  夢: "梦",
  氣: "气",
  話: "话",
  難: "难",
  廣: "广",
  國: "国",
  電: "电",
  網: "网",
  進: "进",
  圖: "图",
  時: "时",
  畫: "画",
  幹: "干",
  線: "线",
  陰: "阴",
  陽: "阳",
  體: "体",
  龍: "龙",
  門: "门",
  風: "风",
  師: "师",
  學: "学",
  國: "国",
};

// Reverse lookup
const reverseMap = Object.fromEntries(
  Object.entries(glitchMap).map(([trad, simp]) => [simp, trad])
);

// Random glitch
export function glitchEffect(character) {
  if (Math.random() >= CONFIG.GLITCH_PROBABILITY) {
    return character;
  }

  // Traditional to Simplified
  if (glitchMap[character]) {
    return glitchMap[character];
  }

  // Simplified to Traditional
  if (reverseMap[character]) {
    return reverseMap[character];
  }

  // Inject noise
  if (Math.random() < 0.1) {
    return character + "";
  }

  return character;
}

// Async glitch effect
export function glitchInterval() {
  return randomNumber(
    CONFIG.GLITCH_INTERVAL_MIN_MS,
    CONFIG.GLITCH_INTERVAL_MAX_MS
  );
}
