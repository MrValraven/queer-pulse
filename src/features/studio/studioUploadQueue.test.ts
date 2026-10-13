import { describe, expect, it, vi } from "vitest";
import {
  createLatestSender,
  createProgressReporter,
  createSerialChain,
  createSlotQueue,
} from "./studioUploadQueue";

const flush = async () => {
  for (let round = 0; round < 5; round += 1) await Promise.resolve();
};

describe("createSlotQueue", () => {
  it("grants the limit at once and hands each freed slot to the next waiter", async () => {
    const queue = createSlotQueue(2);
    const granted: string[] = [];
    const releases = new Map<string, () => void>();
    for (const name of ["a", "b", "c"]) {
      void queue.acquire().then((release) => {
        granted.push(name);
        releases.set(name, release);
      });
    }
    await flush();
    expect(granted).toEqual(["a", "b"]);
    releases.get("a")?.();
    releases.get("a")?.();
    await flush();
    expect(granted).toEqual(["a", "b", "c"]);
  });
});

describe("createSerialChain", () => {
  it("starts each task after the one before settles, failed or not", async () => {
    const chain = createSerialChain();
    const started: number[] = [];
    let failFirst: (reason: unknown) => void = () => undefined;
    const first = chain.run(() => {
      started.push(1);
      return new Promise<void>((_resolve, reject) => {
        failFirst = reject;
      });
    });
    const second = chain.run(() => {
      started.push(2);
      return Promise.resolve("second");
    });
    await flush();
    expect(started).toEqual([1]);
    failFirst(new Error("create refused"));
    await expect(first).rejects.toThrow("create refused");
    await expect(second).resolves.toBe("second");
    expect(started).toEqual([1, 2]);
  });
});

describe("createProgressReporter", () => {
  it("reports whole percents at most once per interval, and 100 always", () => {
    let clock = 0;
    const report = vi.fn<(percent: number) => void>();
    const onProgress = createProgressReporter(report, 250, () => clock);
    onProgress(10.4);
    onProgress(10.9);
    clock = 100;
    onProgress(40);
    clock = 300;
    onProgress(55);
    clock = 310;
    onProgress(100);
    expect(report.mock.calls.map(([percent]) => percent)).toEqual([
      10, 55, 100,
    ]);
  });
});

describe("createLatestSender", () => {
  it("sends one at a time, collapsing waiting values into the newest", async () => {
    let finishFirst: (shouldContinue: boolean) => void = () => undefined;
    const send = vi
      .fn<(value: string) => Promise<boolean>>()
      .mockReturnValueOnce(
        new Promise<boolean>((resolve) => {
          finishFirst = resolve;
        }),
      )
      .mockResolvedValue(true);
    const sender = createLatestSender(send);
    sender.submit("one");
    sender.submit("two");
    sender.submit("three");
    expect(send.mock.calls).toEqual([["one"]]);
    finishFirst(true);
    await flush();
    expect(send.mock.calls).toEqual([["one"], ["three"]]);
  });

  it("drops the waiting value when a send fails", async () => {
    let finishFirst: (shouldContinue: boolean) => void = () => undefined;
    const send = vi
      .fn<(value: string) => Promise<boolean>>()
      .mockReturnValueOnce(
        new Promise<boolean>((resolve) => {
          finishFirst = resolve;
        }),
      )
      .mockResolvedValue(true);
    const sender = createLatestSender(send);
    sender.submit("one");
    sender.submit("two");
    finishFirst(false);
    await flush();
    expect(send.mock.calls).toEqual([["one"]]);
  });
});
