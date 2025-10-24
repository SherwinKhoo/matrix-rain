"use strict";
import { CONFIG } from "./config.js";

// Global variables
let textArray = [];
let index = 0;
let isLoaded = false;

// Configurable parameters
const loopMultiplier = 5; // How many times to repeat the base text
const maxStreamBatchSize = 50000; // Safety cap

// Utility: load and prepare text once
async function loadText(url) {
  const response = await fetch(url);
  const data = await response.json();

  if (
    !data ||
    !data.content ||
    typeof data.content.text !== "string" ||
    data.content.text.length === 0
  ) {
    throw new Error("Invalid JSON structure or empty text");
  }

  const baseChars = Array.from(data.content.text);

  // Loop the text multiple times to ensure enough characters for 4K displays
  while (textArray.length < baseChars.length * loopMultiplier) {
    textArray = textArray.concat(baseChars);
  }

  isLoaded = true;
  self.postMessage({
    type: "info",
    message: `Loaded ${textArray.length} characters`,
  });
}

// Send a batch to the main thread
function streamBatch(batchSize) {
  if (!isLoaded) {
    return;
  }

  const safeBatchSize = Math.min(batchSize, maxStreamBatchSize);
  const end = index + safeBatchSize;

  const batch =
    end <= textArray.length
      ? textArray.slice(index, end)
      : [
          ...textArray.slice(index),
          ...textArray.slice(0, end % textArray.length),
        ];

  index = end % textArray.length;

  self.postMessage({ type: "character", data: batch });
}

// Periodic automatic streaming loop (optional)
function continuousStream(batchSize, intervalMs = 1000) {
  const sendLoop = () => {
    streamBatch(batchSize);
    setTimeout(sendLoop, intervalMs);
  };
  sendLoop();
}

// Handle commands from the main thread
self.onmessage = async (event) => {
  const {
    command,
    url = CONFIG.STREAM_URL,
    batchSize = CONFIG.STREAM_BATCH_SIZE,
  } = event.data;

  switch (command) {
    case "load":
      if (!isLoaded) {
        try {
          await loadText(url);
          // Start background continuous streaming
          continuousStream(batchSize, 1000);
        } catch (error) {
          self.postMessage({ type: "error", message: error.message });
        }
      }
      break;

    case "requestMore":
      streamBatch(batchSize);
      break;

    default:
      self.postMessage({
        type: "error",
        message: `Unknown command: ${command}`,
      });
  }
};
