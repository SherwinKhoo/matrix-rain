"use strict";
import { CONFIG } from "./config.js";
import { assert } from "./assert.js";

export function calculateGrid(
  fontSize = CONFIG.FONT_SIZE_DEFAULT,
  fontBorderSize = CONFIG.FONT_BORDER_DEFAULT
) {
  assert(
    Number.isInteger(fontSize) && fontSize > 0,
    '"fontSize" must be a positive integer'
  );
  assert(
    Number.isInteger(fontBorderSize) && fontBorderSize >= 0,
    '"fontBorderSize" must be a whole number'
  );

  const usableWidth =
    window.visualViewport.width ||
    window.innerWidth ||
    document.documentElement.clientWidth;
  const usableHeight =
    window.visualViewport.height ||
    window.innerHeight ||
    document.documentElement.clientHeight;

  const cellSize = fontSize + 2 * fontBorderSize;

  const numberOfColumns = Math.floor(usableWidth / cellSize);
  const numberOfRows = Math.floor(usableHeight / cellSize);

  return {
    columns: numberOfColumns,
    rows: numberOfRows,
    fontSize: fontSize,
    fontBorderSize: fontBorderSize,
    cellSize: cellSize,
    canvasWidth: usableWidth,
    canvasHeight: usableHeight,
  };
}
