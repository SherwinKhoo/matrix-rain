"use strict";

import { CONFIG } from "./Utilities/config.js";
import { Column } from "./Utilities/column.js";
import { calculateGrid } from "./Utilities/grid.js";
import { randomNumber } from "./Utilities/random.js";
import { glitchEffect } from "./Utilities/glitch.js";

// MARK: Worker
const worker = new Worker("./Utilities/textWorker.js", { type: "module" });

let characterBuffer = []; // rolling buffer of characters
let columns = [];
let gridParameters;
let ctx;
let requestAnimationFrameId = 0;

// Buffer management tuning
const refillThresholdMultiplier = 1.5;
const msBetweenBufferChecks = 1000;
let dynamicBuffer;

// Frame timing
const frameLimit = 1000 / CONFIG.FRAME_RATE_LIMIT;
let lastUpdateTime = 0;

// MARK: Worker Message Handler
function handleWorkerMessage(event) {
  const { type, data, message } = event.data;

  switch (type) {
    case "character":
      characterBuffer.push(...data);
      break;

    case "info":
      console.log(`Worker info: ${message}`);
      break;

    case "error":
      console.error("Worker error:", message);
      break;

    default:
      console.warn("Unhandled worker message:", type);
      break;
  }
}

// MARK: Character Supply Helper
function getNextCharacter(count) {
  if (characterBuffer.length < count) {
    return Array(count).fill("　"); // full-width space
  }
  return characterBuffer.splice(0, count);
}

// MARK: Column Creation
function resetColumn(columnIndex) {
  const character = getNextCharacter(gridParameters.rows);
  const xCoordinate = columnIndex * gridParameters.cellSize;
  const intervalMs = randomNumber(
    CONFIG.DROPLET_SPEED_MIN,
    CONFIG.DROPLET_SPEED_MAX
  );

  columns[columnIndex] = new Column(
    xCoordinate,
    character,
    gridParameters.cellSize,
    CONFIG.DECAY_RATE,
    intervalMs
  );

  columns[columnIndex].nextUpdate = performance.now() + intervalMs;
}

// MARK: Column Initialisation
function tryInitialiseColumns() {
  if (columns.length || !gridParameters) {
    return;
  }
  if (characterBuffer.length < gridParameters.rows) {
    return;
  }

  const availableCols = gridParameters.columns;

  console.log(`Initialising ${availableCols} columns`);
  for (let i = 0; i < availableCols; i++) {
    resetColumn(i);
  }
}

// MARK: Canvas Setup
function initialiseCanvas() {
  console.log("Initialising canvas...");

  gridParameters = calculateGrid(
    CONFIG.FONT_SIZE_DEFAULT,
    CONFIG.FONT_BORDER_DEFAULT
  );

  const canvas = document.querySelector("canvas");

  // Ensure full viewport coverage, not just computed grid width
  canvas.width = window.innerWidth * (window.devicePixelRatio || 1);
  canvas.height = window.innerHeight * (window.devicePixelRatio || 1);

  ctx = canvas.getContext("2d");
  ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);

  ctx.font = `${gridParameters.fontSize}px "Noto Sans TC", "Microsoft JhengHei", monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillStyle = CONFIG.FONT_COLOUR;
}

// MARK: Frame Loop
function update(now) {
  if (now - lastUpdateTime < frameLimit) {
    requestAnimationFrameId = requestAnimationFrame(update);
    return;
  }
  lastUpdateTime = now;

  // Fade the frame for trail effect
  ctx.fillStyle = CONFIG.BACKGROUND_COLOUR;
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  if (!columns.length) {
    tryInitialiseColumns();
  }

  for (let i = 0; i < columns.length; i++) {
    const column = columns[i];
    if (!column) continue;

    column.update(now);

    for (let row = 0; row < column.character.length; row++) {
      const brightness = column.brightnessAt(row);
      if (brightness <= 0.02) continue;

      ctx.fillStyle = `rgba(0,255,0,${brightness})`;

      const char = glitchEffect(column.character[row]); // apply glitch
      ctx.fillText(
        char,
        column.xCoordinate + gridParameters.fontSize / 2,
        column.yCoordinate(row)
      );
    }

    // Recycle columns that fall past bottom
    if (column.isComplete(gridParameters.rows, CONFIG.EXTRA_TAIL_TICKS)) {
      resetColumn(i);
    }
  }

  requestAnimationFrameId = requestAnimationFrame(update);
}

// MARK: Buffer Monitoring
function monitorBuffer() {
  if (!gridParameters) {
    setTimeout(monitorBuffer, msBetweenBufferChecks);
    return;
  }

  const refillThreshold =
    gridParameters.rows * gridParameters.columns * refillThresholdMultiplier;

  if (characterBuffer.length < refillThreshold) {
    worker.postMessage({
      command: "requestMore",
      batchSize: CONFIG.STREAM_BATCH_SIZE,
    });
  }

  setTimeout(monitorBuffer, msBetweenBufferChecks);
}

// MARK: Initialise Application
function initialise() {
  initialiseCanvas();

  worker.onmessage = handleWorkerMessage;

  worker.postMessage({
    command: "load",
    url: CONFIG.STREAM_URL,
    batchSize: CONFIG.STREAM_BATCH_SIZE,
  });

  monitorBuffer();

  requestAnimationFrameId = requestAnimationFrame(update);
}

window.addEventListener("load", initialise);

// MARK: Handle Viewport Changes
let orientationTimeoutId = null;
let lastOrientation = screen.orientation?.angle ?? window.orientation ?? 0;

function handleViewportChange() {
  clearTimeout(orientationTimeoutId);
  orientationTimeoutId = setTimeout(() => {
    const currentOrientation =
      screen.orientation?.angle ?? window.orientation ?? 0;

    if (
      currentOrientation !== lastOrientation ||
      ctx.canvas.width !== window.innerWidth * (window.devicePixelRatio || 1) ||
      ctx.canvas.height !== window.innerHeight * (window.devicePixelRatio || 1)
    ) {
      lastOrientation = currentOrientation;

      console.log(
        "[Matrix] Viewport or orientation changed, reinitialising..."
      );

      cancelAnimationFrame(requestAnimationFrameId);
      columns = [];
      characterBuffer = [];

      initialiseCanvas();

      worker.postMessage({
        command: "load",
        url: CONFIG.STREAM_URL,
        batchSize: CONFIG.STREAM_BATCH_SIZE,
      });

      requestAnimationFrameId = requestAnimationFrame(update);
    }
  }, 500); // debounce delay
}

window.addEventListener("resize", handleViewportChange);
window.addEventListener("orientationchange", handleViewportChange);

if (window.visualViewport) {
  window.visualViewport.addEventListener("resize", handleViewportChange);
}
