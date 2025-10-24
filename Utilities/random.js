"use strict";
import { assert } from "./assert.js";

export function randomNumber(start, end) {
  assert(
    Number.isInteger(start) && start > 0,
    '"start" must be a positive integer'
  );
  assert(Number.isInteger(end) && end > 0, '"end" must be a positive integer');

  if (start > end) {
    [start, end] = [end, start];
  }

  return Math.floor(Math.random() * (end - start + 1) + start);
}
