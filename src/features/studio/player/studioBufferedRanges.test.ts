import { describe, expect, it } from "vitest";
import {
  areBufferedRangesEqual,
  readBufferedRanges,
} from "./studioBufferedRanges";

function timeRanges(spans: Array<[number, number]>): TimeRanges {
  return {
    length: spans.length,
    start: (index: number) => spans[index]?.[0] ?? 0,
    end: (index: number) => spans[index]?.[1] ?? 0,
  };
}

describe("readBufferedRanges", () => {
  it("reads every span in order", () => {
    expect(
      readBufferedRanges({
        buffered: timeRanges([
          [0, 12.5],
          [30, 41],
        ]),
      }),
    ).toEqual([
      { startSeconds: 0, endSeconds: 12.5 },
      { startSeconds: 30, endSeconds: 41 },
    ]);
  });

  it("returns an empty list when the element has no buffered property", () => {
    expect(readBufferedRanges({})).toEqual([]);
    expect(readBufferedRanges({ buffered: null })).toEqual([]);
  });

  it("returns an empty list when reading a span throws", () => {
    const throwing = {
      length: 1,
      start: () => {
        throw new DOMException("out of range", "IndexSizeError");
      },
      end: () => 1,
    } as unknown as TimeRanges;
    expect(readBufferedRanges({ buffered: throwing })).toEqual([]);
  });
});

describe("areBufferedRangesEqual", () => {
  const base = [{ startSeconds: 0, endSeconds: 10 }];

  it("treats growth inside the one second tolerance as equal", () => {
    expect(
      areBufferedRangesEqual(base, [{ startSeconds: 0, endSeconds: 10.8 }]),
    ).toBe(true);
  });

  it("treats growth past the tolerance as different", () => {
    expect(
      areBufferedRangesEqual(base, [{ startSeconds: 0, endSeconds: 11.5 }]),
    ).toBe(false);
  });

  it("treats a different span count as different", () => {
    expect(areBufferedRangesEqual(base, [])).toBe(false);
    expect(areBufferedRangesEqual([], [])).toBe(true);
  });

  it("accepts a custom tolerance", () => {
    expect(
      areBufferedRangesEqual(base, [{ startSeconds: 0, endSeconds: 12 }], 3),
    ).toBe(true);
  });
});
