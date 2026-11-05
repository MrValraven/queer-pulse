import { afterEach, describe, expect, it, vi } from "vitest";
import {
  VJ_DEMO_TAB_ID,
  createVjDemoChannelHub,
  openVjDemoChannel,
  type VjDemoMessage,
} from "./vjDemoChannel";

const SAMPLE_MESSAGE: VjDemoMessage = {
  direction: "toServer",
  name: "library:changed",
  payload: { kind: "pack_created" },
  tabId: "tab-one",
};

async function flushMicrotasks(): Promise<void> {
  await new Promise<void>((resolve) => {
    setTimeout(resolve, 0);
  });
}

describe("createVjDemoChannelHub", () => {
  it("delivers to every other channel of the hub", async () => {
    const hub = createVjDemoChannelHub();
    const sender = hub.open();
    const firstReceiver = hub.open();
    const secondReceiver = hub.open();
    const senderMessages: VjDemoMessage[] = [];
    const firstMessages: VjDemoMessage[] = [];
    const secondMessages: VjDemoMessage[] = [];
    sender.subscribe((message) => senderMessages.push(message));
    firstReceiver.subscribe((message) => firstMessages.push(message));
    secondReceiver.subscribe((message) => secondMessages.push(message));

    sender.post(SAMPLE_MESSAGE);
    expect(firstMessages).toEqual([]);
    await flushMicrotasks();

    expect(firstMessages).toEqual([SAMPLE_MESSAGE]);
    expect(secondMessages).toEqual([SAMPLE_MESSAGE]);
    expect(senderMessages).toEqual([]);
    expect(firstMessages[0]).not.toBe(SAMPLE_MESSAGE);
  });

  it("stops delivering after close", async () => {
    const hub = createVjDemoChannelHub();
    const sender = hub.open();
    const closedReceiver = hub.open();
    const openReceiver = hub.open();
    const closedMessages: VjDemoMessage[] = [];
    const openMessages: VjDemoMessage[] = [];
    closedReceiver.subscribe((message) => closedMessages.push(message));
    openReceiver.subscribe((message) => openMessages.push(message));

    sender.post(SAMPLE_MESSAGE);
    closedReceiver.close();
    await flushMicrotasks();
    expect(closedMessages).toEqual([]);
    expect(openMessages).toHaveLength(1);

    sender.close();
    sender.post(SAMPLE_MESSAGE);
    await flushMicrotasks();
    expect(openMessages).toHaveLength(1);
  });

  it("stops calling a listener after it unsubscribes", async () => {
    const hub = createVjDemoChannelHub();
    const sender = hub.open();
    const receiver = hub.open();
    const listener = vi.fn();
    const unsubscribe = receiver.subscribe(listener);
    unsubscribe();

    sender.post(SAMPLE_MESSAGE);
    await flushMicrotasks();
    expect(listener).not.toHaveBeenCalled();
  });
});

describe("openVjDemoChannel", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("gives a silent channel when BroadcastChannel is missing", () => {
    vi.stubGlobal("BroadcastChannel", undefined);
    const channel = openVjDemoChannel();
    const unsubscribe = channel.subscribe(vi.fn());
    expect(() => {
      channel.post(SAMPLE_MESSAGE);
      unsubscribe();
      channel.close();
    }).not.toThrow();
  });

  it("gives a silent channel when the browser refuses to open one", () => {
    vi.stubGlobal(
      "BroadcastChannel",
      vi.fn(() => {
        throw new Error("blocked");
      }),
    );
    const channel = openVjDemoChannel();
    expect(() => {
      channel.post(SAMPLE_MESSAGE);
      channel.close();
    }).not.toThrow();
  });

  it("names this tab with a uuid", () => {
    expect(VJ_DEMO_TAB_ID).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    );
  });
});
