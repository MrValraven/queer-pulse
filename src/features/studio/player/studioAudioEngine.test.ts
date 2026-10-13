import { describe, expect, it, vi } from "vitest";
import {
  createElementAudioEngine,
  type StudioAudioEvent,
} from "./studioAudioEngine";

/** Just enough of an <audio> element: real events, recorded calls. */
function createStubElement() {
  const element = Object.assign(new EventTarget(), {
    src: "",
    currentTime: 0,
    duration: Number.NaN,
    error: null as MediaError | null,
    playResult: Promise.resolve(),
    getAttribute: (name: string): string | null =>
      name === "src" && element.src ? element.src : null,
    removeAttribute: (name: string): void => {
      if (name === "src") element.src = "";
    },
    load: vi.fn(),
    pause: vi.fn(),
    play: vi.fn((): Promise<void> => element.playResult),
  });
  return element;
}

function setup() {
  const element = createStubElement();
  const engine = createElementAudioEngine(
    element as unknown as HTMLAudioElement,
  );
  const events: StudioAudioEvent[] = [];
  engine.subscribe((event) => events.push(event));
  return { element, engine, events };
}

describe("createElementAudioEngine", () => {
  it("applies only the latest load's start position", () => {
    const { element, engine } = setup();
    engine.load("https://stream.example/a", 42);
    engine.load("https://stream.example/b", 0);
    element.dispatchEvent(new Event("loadedmetadata"));
    expect(element.currentTime).toBe(0);
  });

  it("resumes a refreshed source at its start position", () => {
    const { element, engine } = setup();
    engine.load("https://stream.example/a", 42);
    element.dispatchEvent(new Event("loadedmetadata"));
    expect(element.currentTime).toBe(42);
  });

  it("drops a pending start position on reset", () => {
    const { element, engine } = setup();
    engine.load("https://stream.example/a", 42);
    engine.reset();
    element.dispatchEvent(new Event("loadedmetadata"));
    expect(element.currentTime).toBe(0);
  });

  it("reports a broken source once when play() rejects for it too", async () => {
    const { element, engine, events } = setup();
    engine.load("https://stream.example/a", 0);
    element.error = { code: 4 } as MediaError;
    element.playResult = Promise.reject(
      new DOMException("Unsupported source", "NotSupportedError"),
    );
    element.dispatchEvent(new Event("error"));
    await engine.play();
    expect(events.filter((event) => event.type === "failed")).toHaveLength(1);
  });

  it("reads a refused autoplay as blocked", async () => {
    const { element, engine, events } = setup();
    engine.load("https://stream.example/a", 0);
    element.playResult = Promise.reject(
      new DOMException("Needs a gesture", "NotAllowedError"),
    );
    await engine.play();
    expect(events).toEqual([{ type: "blocked" }]);
  });

  it("stays quiet when a newer load cuts a play short", async () => {
    const { element, engine, events } = setup();
    engine.load("https://stream.example/a", 0);
    element.playResult = Promise.reject(
      new DOMException("Replaced", "AbortError"),
    );
    await engine.play();
    expect(events).toEqual([]);
  });

  it("stops listening to the element once disposed", () => {
    const { element, engine, events } = setup();
    engine.dispose?.();
    element.dispatchEvent(new Event("ended"));
    element.dispatchEvent(new Event("timeupdate"));
    expect(events).toEqual([]);
  });
});
