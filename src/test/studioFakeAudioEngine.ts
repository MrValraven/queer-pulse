import { vi } from "vitest";
import type {
  StudioAudioEngine,
  StudioAudioEvent,
} from "../features/studio/player/studioAudioEngine";

/** A stand-in engine for provider and hook tests: every method records its
 *  calls, `emit` plays an engine event, and the preload and plain flags behave
 *  like the real engine's. */
export function createFakeAudioEngine() {
  const listeners = new Set<(event: StudioAudioEvent) => void>();
  let hasPreloaded = false;
  let isPlain = false;
  const engine = {
    load: vi.fn(),
    play: vi.fn(() => Promise.resolve()),
    pause: vi.fn(),
    seek: vi.fn(),
    reset: vi.fn(() => {
      hasPreloaded = false;
    }),
    unlock: vi.fn(),
    preload: vi.fn(() => {
      hasPreloaded = true;
    }),
    cancelPreload: vi.fn(() => {
      hasPreloaded = false;
    }),
    hasPreload: vi.fn(() => hasPreloaded),
    handover: vi.fn(() => {
      hasPreloaded = false;
    }),
    setVolume: vi.fn(),
    setMuted: vi.fn(),
    setLoudnessEven: vi.fn(),
    fadeOut: vi.fn(() => Promise.resolve(true)),
    cancelFadeOut: vi.fn(),
    enterPlainMode: vi.fn(() => {
      if (isPlain) return false;
      isPlain = true;
      return true;
    }),
    isPlainMode: vi.fn(() => isPlain),
    remote: null,
    subscribe: (listener: (event: StudioAudioEvent) => void) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    emit: (event: StudioAudioEvent) =>
      listeners.forEach((listener) => listener(event)),
  } satisfies StudioAudioEngine & { emit: (event: StudioAudioEvent) => void };
  return engine;
}

export type FakeAudioEngine = ReturnType<typeof createFakeAudioEngine>;
