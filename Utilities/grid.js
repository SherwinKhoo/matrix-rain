"use strict";
import { CONFIG } from "./config.js";

export function calculateGrid() {
  const fontSize = CONFIG.FONT_SIZE_DEFAULT;
  const fontBorderSize = CONFIG.FONT_BORDER_DEFAULT;
  const cellSize = CONFIG.FONT_SIZE_DEFAULT + 2 * CONFIG.FONT_BORDER_DEFAULT;
  const columns = Math.floor(window.innerWidth / cellSize);
  const rows = Math.floor(window.innerHeight / cellSize);
  const width = columns * cellSize;
  const height = rows * cellSize;
  return { columns, rows, fontSize, fontBorderSize, cellSize, width, height };
}
