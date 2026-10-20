import { hashKey, QueryClient } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import { findAutosaveMachine } from "./creatorDraftAutosave.machine";
import { creatorDraftQueryKey } from "./creatorDraftQueryKeys";
import {
  deleteCreatorDraft,
  getCreatorDraft,
  saveCreatorDraft,
} from "./creatorDrafts.api";
import type {
  CreatorDraftResponse,
  CreatorDraftSaved,
} from "./creatorDrafts.types";
import { useCreatorDraftAutosave } from "./useCreatorDraftAutosave";
import { useCreatorDraftResumeSource } from "./useCreatorDraftResumeSource";

const mockDemoMode = vi.hoisted(() => ({ current: false }));

vi.mock("../../../app/providers/DemoModeProvider", () => ({
  useDemoMode: () => ({ demoMode: mockDemoMode.current }),
}));
vi.mock("./creatorDrafts.api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./creatorDrafts.api")>()),
  getCreatorDraft: vi.fn(),
  saveCreatorDraft: vi.fn(),
  deleteCreatorDraft: vi.fn(),
}));

const COMMUNITY_SLOT = { kind: "community", listingRef: null } as const;
const STORED_DRAFT: CreatorDraftResponse = {
  payload: { draft: { name: "Before" }, step: 2 },
  payloadVersion: 1,
  revision: 3,
  savedAt: "2026-10-19T09:00:00.000Z",
};

function createClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } });
}

function wrapperFor(client: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <TestProviders queryClient={client}>{children}</TestProviders>;
  };
}

function renderEditor(client: QueryClient, initialPayload: unknown) {
  return renderHook(
    (props: { payload: Record<string, unknown> | null }) =>
      useCreatorDraftAutosave({
        slot: COMMUNITY_SLOT,
        payload: props.payload,
        progress: null,
        missing: null,
        isEnabled: true,
      }),
    {
      initialProps: {
        payload: initialPayload as Record<string, unknown> | null,
      },
      wrapper: wrapperFor(client),
    },
  );
}

function renderResumeSource(client: QueryClient) {
  return renderHook(() => useCreatorDraftResumeSource(COMMUNITY_SLOT), {
    wrapper: wrapperFor(client),
  });
}

function heldEngine(client: QueryClient) {
  return findAutosaveMachine(
    client,
    hashKey(creatorDraftQueryKey(COMMUNITY_SLOT, false)),
  );
}

/** A save that stays on the wire until the test answers it. */
function holdNextSave() {
  let answerSave: (saved: CreatorDraftSaved) => void = () => undefined;
  vi.mocked(saveCreatorDraft).mockImplementationOnce(
    () =>
      new Promise<CreatorDraftSaved>((resolve) => {
        answerSave = resolve;
      }),
  );
  return (saved: CreatorDraftSaved) => answerSave(saved);
}

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
  mockDemoMode.current = false;
  vi.mocked(getCreatorDraft).mockReset();
  vi.mocked(saveCreatorDraft).mockReset();
  vi.mocked(deleteCreatorDraft).mockReset();
  vi.mocked(deleteCreatorDraft).mockResolvedValue(undefined);
});

afterEach(() => {
  vi.useRealTimers();
});

describe("useCreatorDraftResumeSource", () => {
  it("falls back to the slot's query when no engine is held", async () => {
    vi.mocked(getCreatorDraft).mockResolvedValue(STORED_DRAFT);
    const client = createClient();
    const { result } = renderResumeSource(client);
    expect(result.current).toEqual({ draft: null, isSettled: false });
    await waitFor(() => expect(result.current.isSettled).toBe(true));
    expect(result.current.draft).toEqual(STORED_DRAFT);
    expect(heldEngine(client)).toBeUndefined();
  });

  it("waits for a closed editor's unmount flush to land and resumes from it", async () => {
    vi.mocked(getCreatorDraft).mockResolvedValue(STORED_DRAFT);
    const answerSave = holdNextSave();
    const client = createClient();
    const editor = renderEditor(client, null);
    await waitFor(() =>
      expect(editor.result.current.isServerDraftLoading).toBe(false),
    );
    const typed = { draft: { name: "Typed just before leaving" }, step: 4 };
    editor.rerender({ payload: typed });
    // The editor closes before its debounce, so the unmount flush sends it.
    editor.unmount();
    await waitFor(() => expect(saveCreatorDraft).toHaveBeenCalledTimes(1));

    const { result } = renderResumeSource(client);
    expect(result.current.isSettled).toBe(false);
    expect(heldEngine(client)).toBeDefined();

    await act(async () => {
      answerSave({ revision: 4, savedAt: "2026-10-19T10:00:00.000Z" });
      await Promise.resolve();
    });
    await waitFor(() => expect(result.current.isSettled).toBe(true));
    expect(result.current.draft).toMatchObject({
      payload: typed,
      revision: 4,
      savedAt: "2026-10-19T10:00:00.000Z",
    });
    // It never held the engine, so the engine let go once idle.
    expect(heldEngine(client)).toBeUndefined();
    expect(getCreatorDraft).toHaveBeenCalledTimes(1);
  });

  it("keeps the draft it settled on while the opened editor saves", async () => {
    vi.mocked(getCreatorDraft).mockResolvedValue(STORED_DRAFT);
    const answerSave = holdNextSave();
    const client = createClient();
    const { result } = renderResumeSource(client);
    await waitFor(() => expect(result.current.isSettled).toBe(true));
    const settledSource = result.current;

    const editor = renderEditor(client, STORED_DRAFT.payload);
    editor.rerender({ payload: { draft: { name: "After" }, step: 2 } });
    await act(() => vi.advanceTimersByTimeAsync(1600));
    await waitFor(() => expect(saveCreatorDraft).toHaveBeenCalledTimes(1));
    expect(result.current).toBe(settledSource);

    await act(async () => {
      answerSave({ revision: 4, savedAt: "2026-10-19T10:00:00.000Z" });
      await Promise.resolve();
    });
    await waitFor(() =>
      expect(editor.result.current.status.kind).toBe("saved"),
    );
    expect(result.current).toBe(settledSource);
    expect(result.current.draft).toEqual(STORED_DRAFT);
  });
});
