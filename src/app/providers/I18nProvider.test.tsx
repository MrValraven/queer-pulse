import { act, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { I18nProvider } from "./I18nProvider";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { logWarn } from "../../shared/observability/logger";
import { STORAGE_KEY } from "../../shared/i18n/locale";
import type { Catalog, Language, Namespace } from "../../shared/i18n/types";

/**
 * Chunk loads the test controls by hand. Each language/namespace pair gets one
 * deferred promise, shared by the on-demand queue and the idle EN prefetch, so
 * a test decides when (and whether) a chunk arrives.
 */
const chunkLoads = vi.hoisted(() => {
  interface Deferred {
    promise: Promise<unknown>;
    resolve: (catalog: unknown) => void;
    reject: (error: unknown) => void;
  }
  const deferredByPair = new Map<string, Deferred>();
  const deferredFor = (language: string, namespace: string): Deferred => {
    const pairKey = `${language}:${namespace}`;
    const existing = deferredByPair.get(pairKey);
    if (existing) return existing;
    let resolve!: (catalog: unknown) => void;
    let reject!: (error: unknown) => void;
    const promise = new Promise<unknown>((resolvePromise, rejectPromise) => {
      resolve = resolvePromise;
      reject = rejectPromise;
    });
    // A rejection a test never awaits must not surface as unhandled.
    promise.catch(() => {});
    const created = { promise, resolve, reject };
    deferredByPair.set(pairKey, created);
    return created;
  };
  return { deferredByPair, deferredFor };
});

vi.mock("../../shared/i18n/catalogs", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("../../shared/i18n/catalogs")>();
  return {
    ...actual,
    loadNamespace: (language: Language, namespace: Namespace) =>
      chunkLoads.deferredFor(language, namespace).promise,
  };
});

vi.mock("../../shared/observability/logger", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("../../shared/observability/logger")>();
  return { ...actual, logWarn: vi.fn() };
});

const VJ_KEY = "vj:probe.hello";
const VJ_CATALOG: Catalog = { "probe.hello": "Hello from the vj chunk" };

function Probe({ translationKey }: { translationKey: string }) {
  const { t } = useTranslation();
  return <p data-testid="line">{t(translationKey)}</p>;
}

function renderProbe(translationKey: string) {
  return render(
    <I18nProvider>
      <Probe translationKey={translationKey} />
    </I18nProvider>,
  );
}

function missingKeyWarnings() {
  return vi
    .mocked(logWarn)
    .mock.calls.filter(
      ([message]) => message === "i18n: missing translation key",
    );
}

async function settleChunk(
  language: Language,
  namespace: Namespace,
  outcome: "resolve" | "reject",
) {
  const deferred = chunkLoads.deferredFor(language, namespace);
  await act(async () => {
    if (outcome === "resolve") deferred.resolve(VJ_CATALOG);
    else deferred.reject(new Error("chunk failed"));
    await deferred.promise.catch(() => {});
  });
}

describe("I18nProvider pending and failed chunks", () => {
  beforeEach(() => {
    chunkLoads.deferredByPair.clear();
    vi.mocked(logWarn).mockClear();
    window.localStorage.removeItem(STORAGE_KEY);
  });

  afterEach(() => {
    window.localStorage.removeItem(STORAGE_KEY);
  });

  it("renders nothing for an English key while its chunk loads, then the string", async () => {
    renderProbe(VJ_KEY);

    expect(screen.getByTestId("line")).toHaveTextContent("");
    expect(missingKeyWarnings()).toHaveLength(0);

    await settleChunk("en", "vj", "resolve");

    await waitFor(() =>
      expect(screen.getByTestId("line")).toHaveTextContent(
        "Hello from the vj chunk",
      ),
    );
    expect(missingKeyWarnings()).toHaveLength(0);
  });

  it("still names a key missing from a loaded English catalog", async () => {
    renderProbe("vj:probe.absent");

    await settleChunk("en", "vj", "resolve");

    await waitFor(() =>
      expect(screen.getByTestId("line")).toHaveTextContent("vj:probe.absent"),
    );
    expect(logWarn).toHaveBeenCalledWith("i18n: missing translation key", {
      key: "vj:probe.absent",
      language: "en",
    });
  });

  it("falls back to the raw key and logs once an English chunk has failed to load", async () => {
    renderProbe(VJ_KEY);
    expect(screen.getByTestId("line")).toHaveTextContent("");

    await settleChunk("en", "vj", "reject");

    await waitFor(() =>
      expect(screen.getByTestId("line")).toHaveTextContent(VJ_KEY),
    );
    expect(logWarn).toHaveBeenCalledWith("i18n: missing translation key", {
      key: VJ_KEY,
      language: "en",
    });
    expect(logWarn).toHaveBeenCalledWith(
      "i18n: failed to load namespace",
      expect.objectContaining({ namespace: "vj", language: "en" }),
    );
  });

  it("returns an unknown-namespace key verbatim in English and logs it", () => {
    renderProbe("Note: free text");

    expect(screen.getByTestId("line")).toHaveTextContent("Note: free text");
    expect(missingKeyWarnings()).toHaveLength(1);
  });

  it("keeps a Portuguese key blank while its own chunk loads", async () => {
    window.localStorage.setItem(STORAGE_KEY, "pt");
    renderProbe(VJ_KEY);

    expect(screen.getByTestId("line")).toHaveTextContent("");
    expect(missingKeyWarnings()).toHaveLength(0);

    await settleChunk("pt", "vj", "resolve");

    await waitFor(() =>
      expect(screen.getByTestId("line")).toHaveTextContent(
        "Hello from the vj chunk",
      ),
    );
  });
});
