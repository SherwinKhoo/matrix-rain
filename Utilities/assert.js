"use strict";

import { CONFIG } from "./config.js";

export function assert(condition, message = "Assertion failed") {
  if (!condition) {
    console.assert(false, message);

    if (CONFIG.DEBUG) {
      throw new Error(message);
    }
  }
}
