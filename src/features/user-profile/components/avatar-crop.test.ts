// Avatars render in a circle everywhere, but the upload used to store an image scaled to
// fit 512 on its LONGEST side — a wide photo was saved as a letterbox strip and each
// consumer cropped a different part of it. The crop is now decided once, here.

import { describe, it, expect } from "vitest";
import { squareCrop } from "./avatar-upload-modal";

describe("squareCrop", () => {
  it("takes the full frame of an already-square image", () => {
    expect(squareCrop(512, 512)).toEqual({ sx: 0, sy: 0, side: 512 });
  });

  it("centres the crop horizontally on a landscape photo", () => {
    // 1200x400 used to become 512x171 — a sliver. Now it is the middle 400x400.
    expect(squareCrop(1200, 400)).toEqual({ sx: 400, sy: 0, side: 400 });
  });

  it("centres the crop vertically on a portrait photo", () => {
    expect(squareCrop(400, 1200)).toEqual({ sx: 0, sy: 400, side: 400 });
  });

  it("rounds to whole pixels on an odd offset", () => {
    const { sx, sy, side } = squareCrop(101, 50);
    expect(Number.isInteger(sx)).toBe(true);
    expect(Number.isInteger(sy)).toBe(true);
    expect({ sx, sy, side }).toEqual({ sx: 26, sy: 0, side: 50 });
  });

  it("never reads outside the source image", () => {
    for (const [w, h] of [[1200, 400], [400, 1200], [999, 1000], [1, 4000]]) {
      const { sx, sy, side } = squareCrop(w, h);
      expect(sx + side).toBeLessThanOrEqual(w);
      expect(sy + side).toBeLessThanOrEqual(h);
    }
  });
});
