"use strict";
import { CONFIG } from "./config.js";

export class Column {
  constructor(xCoordinate, character, cellSize, decay, intervalMS) {
    this.xCoordinate = xCoordinate; // x-position in canvas
    this.character = character; // static characters for column
    this.cellSize = cellSize; // pixel size for spacing
    this.decay = decay; // brightness falloff factor

    this.tick = -this.character.length; // start head above the screen
    this.intervalMS = intervalMS;
    this.nextUpdate = 0; // scheduled by main loop
  }

  // Map distance d (>=0) to brightness group n:
  // smallest n such that T_n > d, where T_n = n(n+1)/2.
  // n = ceil( (sqrt(1 + 8*(d+1)) - 1) / 2 )
  brightnessAt(rowIndex) {
    const headRow = this.tick; // conceptual head position
    const distance = headRow - rowIndex;

    if (distance < 0) {
      return 0;
    }

    const n = Math.ceil((Math.sqrt(1 + 8 * (distance + 1)) - 1) / 2);
    return Math.pow(this.decay, Math.max(0, n - 1));
  }

  update(now) {
    if (now >= this.nextUpdate) {
      this.tick += 1;
      this.nextUpdate = now + this.intervalMS;
    }
  }

  isComplete(totalRows, extraTailTicks = CONFIG.EXTRA_TAIL_TICKS) {
    return this.tick > totalRows + extraTailTicks;
  }

  yCoordinate(rowIndex) {
    return rowIndex * this.cellSize;
  }
}
