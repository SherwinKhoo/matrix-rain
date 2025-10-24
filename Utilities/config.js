"use strict";

export const CONFIG = Object.freeze({
  // MARK: Environment
  DEBUG: true,
  LOG_LEVEL: "info", // "debug" | "info" | "warn" | "error"

  // MARK: Scheduler
  RESIZE_DEBOUNCE_TIMEOUT: 500,

  // MARK: Canvas
  FONT_SIZE_DEFAULT: 14,
  FONT_BORDER_DEFAULT: 0,

  FONT_COLOUR: "#00FF00",
  BACKGROUND_COLOUR: "rgba(0, 0, 0, 0.1)",

  // MARK: Animation
  FRAME_RATE_LIMIT: 60,

  DROPLET_SPEED_MIN: 1,
  DROPLET_SPEED_MAX: 40,
  DECAY_RATE: 0.5,
  EXTRA_TAIL_TICKS: 0,

  GLITCH_PROBABILITY: 0.5,
  GLITCH_INTERVAL_MIN_MS: 750,
  GLITCH_INTERVAL_MAX_MS: 1500,
  // GLITCH_FREQUENCY_OPTIONS: [750, 500, 750, 1000]

  // MARK: Text Worker
  BASE_TEXT_LOOP_MULITPLIER: 1,

  // MARK: Streaming
  STREAM_BATCH_SIZE: 1000,
  STREAM_URL: "../Text/matrix.json",
});
