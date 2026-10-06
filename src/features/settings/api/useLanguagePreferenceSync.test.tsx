import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Language } from "../../../shared/i18n/types";
import type { LanguagePreferenceDTO } from "./languagePreference.api";
import { useLanguagePreferenceSync } from "./useLanguagePreferenceSync";

/**
 * Every server call returns a promise the test settles by hand, so each case
 * decides exactly when the read and each write land.
 */
const harness = vi.hoisted(() => {
  interface Deferred<Value> {
    promise: Promise<Value>;
    resolve: (value: Value) => void;
    reject: (reason: unknown) => void;
  }
  function createDeferred<Value>(): Deferred<Value> {
    let resolve: (value: Value) => void = () => {};
    let reject: (reason: unknown) => void = () => {};
    const promise = new Promise<Value>((resolvePromise, rejectPromise) => {
      resolve = resolvePromise;
      reject = rejectPromise;
    });
    return { promise, resolve, reject };
  }
  // Annotated so the fields keep their wide types (a member or null, either
  // language) when the cases below reassign them.
  interface HarnessState {
    createDeferred: typeof createDeferred;
    isDemoMode: boolean;
    auth: {
      loggedIn: boolean;
      checking: boolean;
      user: { id: string } | null;
    };
    initialLanguage: Language;
    currentLanguage: Language;
    switchLanguage: (language: Language) => void;
    reads: Array<Deferred<LanguagePreferenceDTO>>;
    writes: Array<{
      language: Language;
      deferred: Deferred<LanguagePreferenceDTO>;
    }>;
  }
  const state: HarnessState = {
    createDeferred,
    isDemoMode: false,
    auth: {
      loggedIn: true,
      checking: false,
      user: { id: "member-1" },
    },
    initialLanguage: "en",
    currentLanguage: "en",
    switchLanguage: () => {},
    reads: [],
    writes: [],
  };
  return state;
});

vi.mock("../../../app/providers/DemoModeProvider", () => ({
  useDemoMode: () => ({
    demoMode: harness.isDemoMode,
    available: true,
    setDemoMode: () => {},
    toggle: () => {},
  }),
}));

vi.mock("../../../app/providers/authContext", () => ({
  useAuth: () => harness.auth,
}));

// A real piece of React state, so a switch re-renders the hook the way the
// I18nProvider would.
vi.mock("../../../shared/i18n/useTranslation", async () => {
  const { useState } = await import("react");
  return {
    useTranslation: () => {
      const [language, setLanguage] = useState<Language>(
        harness.initialLanguage,
      );
      harness.currentLanguage = language;
      harness.switchLanguage = setLanguage;
      return { language, setLanguage };
    },
  };
});

vi.mock("./languagePreference.api", () => ({
  getLanguagePreference: () => {
    const deferred = harness.createDeferred<LanguagePreferenceDTO>();
    harness.reads.push(deferred);
    return deferred.promise;
  },
  putLanguagePreference: (language: Language) => {
    const deferred = harness.createDeferred<LanguagePreferenceDTO>();
    harness.writes.push({ language, deferred });
    return deferred.promise;
  },
}));

vi.mock("../../../shared/observability/logger", () => ({
  logWarn: vi.fn(),
}));

/** Runs `action` inside act, then drains every queued promise callback. */
async function settle(action: () => void = () => {}): Promise<void> {
  await act(async () => {
    action();
    await new Promise<void>((resolve) => setTimeout(resolve, 0));
  });
}

/** The call recorded at `index`, failing loudly when it never happened. */
function itemAt<Item>(items: readonly Item[], index: number): Item {
  const item = items[index];
  if (item === undefined) throw new Error(`No call recorded at ${index}`);
  return item;
}

function writtenLanguages(): Language[] {
  return harness.writes.map((write) => write.language);
}

beforeEach(() => {
  harness.isDemoMode = false;
  harness.auth = {
    loggedIn: true,
    checking: false,
    user: { id: "member-1" },
  };
  harness.initialLanguage = "en";
  harness.reads = [];
  harness.writes = [];
});

describe("useLanguagePreferenceSync", () => {
  it("adopts the server's language without writing it back", async () => {
    renderHook(() => useLanguagePreferenceSync());
    expect(harness.reads).toHaveLength(1);

    await settle(() => itemAt(harness.reads, 0).resolve({ language: "pt" }));

    expect(harness.currentLanguage).toBe("pt");
    expect(harness.writes).toHaveLength(0);
  });

  it("writes this device's language up when the server holds none", async () => {
    renderHook(() => useLanguagePreferenceSync());

    await settle(() => itemAt(harness.reads, 0).resolve({ language: null }));

    expect(writtenLanguages()).toEqual(["en"]);
    expect(harness.currentLanguage).toBe("en");
  });

  it("writes a switch made after the read settles", async () => {
    renderHook(() => useLanguagePreferenceSync());
    await settle(() => itemAt(harness.reads, 0).resolve({ language: "en" }));
    expect(harness.writes).toHaveLength(0);

    await settle(() => harness.switchLanguage("pt"));

    expect(writtenLanguages()).toEqual(["pt"]);
  });

  it("still writes a switch back after a failed write", async () => {
    renderHook(() => useLanguagePreferenceSync());
    await settle(() => itemAt(harness.reads, 0).resolve({ language: "en" }));

    await settle(() => harness.switchLanguage("pt"));
    // A client timeout: the server may have stored "pt" all the same.
    await settle(() =>
      itemAt(harness.writes, 0).deferred.reject(new Error("timeout")),
    );

    await settle(() => harness.switchLanguage("en"));

    expect(writtenLanguages()).toEqual(["pt", "en"]);
  });

  it("makes no server calls in demo mode", async () => {
    harness.isDemoMode = true;
    renderHook(() => useLanguagePreferenceSync());

    await settle(() => harness.switchLanguage("pt"));

    expect(harness.reads).toHaveLength(0);
    expect(harness.writes).toHaveLength(0);
  });

  it("makes no server calls while signed out", async () => {
    harness.auth = { loggedIn: false, checking: false, user: null };
    renderHook(() => useLanguagePreferenceSync());

    await settle(() => harness.switchLanguage("pt"));

    expect(harness.reads).toHaveLength(0);
    expect(harness.writes).toHaveLength(0);
  });
});
