import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "../../shared/api/client";
import { emptyDraft } from "./deckDraft";
import { DECK_PUBLISH_VIA_PIECE_CODE } from "./api/useLinkedDeckPublish";
import {
  useDeckPublishAction,
  type UseDeckPublishActionArgs,
} from "./useDeckPublishAction";

/**
 * The deck editor's publish act, driven with the two mutations mocked so the
 * call sequence is visible: which endpoint a click reaches, what happens on
 * the deck endpoint's "publish this from its piece" 409, and that a second
 * click while the first act is still running publishes nothing.
 */

const mocks = vi.hoisted(() => ({
  publishDeck: vi.fn(),
  linkedPublish: vi.fn(),
  showToast: vi.fn(),
}));

vi.mock("../../shared/components/feedback/useToast", () => ({
  useToast: () => ({ showToast: mocks.showToast }),
}));
vi.mock("../../shared/i18n/useTranslation", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
vi.mock("./api/useDeckMutations", () => ({
  usePublishDeck: () => ({ mutateAsync: mocks.publishDeck, isPending: false }),
}));
vi.mock("./api/useLinkedDeckPublish", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./api/useLinkedDeckPublish")>()),
  useLinkedDeckPublish: () => ({
    mutateAsync: mocks.linkedPublish,
    isPending: false,
  }),
}));

afterEach(() => {
  vi.clearAllMocks();
});

function renderPublishAction(overrides: Partial<UseDeckPublishActionArgs>) {
  const args: UseDeckPublishActionArgs = {
    id: "deck-1",
    draft: emptyDraft(),
    published: false,
    linkedPieceId: null,
    saveDraft: vi.fn(() => Promise.resolve()),
    onSaved: vi.fn(),
    onPublishedChange: vi.fn(),
    ...overrides,
  };
  const rendered = renderHook(() => useDeckPublishAction(args));
  return { ...rendered, args };
}

describe("useDeckPublishAction", () => {
  it("publishes a standalone deck with its own PATCH", async () => {
    mocks.publishDeck.mockResolvedValue({
      id: "deck-1",
      publishedAt: "2026-09-29T10:00:00.000Z",
    });
    const { result, args } = renderPublishAction({});

    await act(() => result.current.handlePublish("now", null));

    expect(mocks.publishDeck).toHaveBeenCalledTimes(1);
    expect(mocks.linkedPublish).not.toHaveBeenCalled();
    expect(args.onPublishedChange).toHaveBeenCalledWith(
      "2026-09-29T10:00:00.000Z",
    );
  });

  it("publishes a linked deck through its piece after saving the draft", async () => {
    mocks.linkedPublish.mockResolvedValue("2026-09-29T10:00:00.000Z");
    const { result, args } = renderPublishAction({ linkedPieceId: "piece-1" });

    await act(() => result.current.handlePublish("now", null));

    expect(mocks.publishDeck).not.toHaveBeenCalled();
    expect(args.saveDraft).toHaveBeenCalledTimes(1);
    expect(mocks.linkedPublish).toHaveBeenCalledWith({
      pieceId: "piece-1",
      timing: { published: true },
    });
    expect(args.onPublishedChange).toHaveBeenCalledWith(
      "2026-09-29T10:00:00.000Z",
    );
  });

  it("takes a linked deck down without waiting on a draft save", async () => {
    mocks.linkedPublish.mockResolvedValue(null);
    const { result, args } = renderPublishAction({
      linkedPieceId: "piece-1",
      published: true,
    });

    await act(() => result.current.handlePublish("now", null));

    expect(args.saveDraft).not.toHaveBeenCalled();
    expect(mocks.linkedPublish).toHaveBeenCalledWith({
      pieceId: "piece-1",
      timing: { publishedAt: null },
    });
    expect(args.onPublishedChange).toHaveBeenCalledWith(null);
  });

  it("reroutes through the piece when the deck PATCH answers the 409", async () => {
    mocks.publishDeck.mockRejectedValue(
      new ApiError(409, "Publish this deck from its piece.", {
        code: DECK_PUBLISH_VIA_PIECE_CODE,
        pieceId: "piece-1",
      }),
    );
    mocks.linkedPublish.mockResolvedValue("2026-09-29T10:00:00.000Z");
    const { result } = renderPublishAction({});

    await act(() => result.current.handlePublish("now", null));

    expect(mocks.publishDeck).toHaveBeenCalledTimes(1);
    expect(mocks.linkedPublish).toHaveBeenCalledTimes(1);
    expect(mocks.linkedPublish).toHaveBeenCalledWith(
      expect.objectContaining({ pieceId: "piece-1" }),
    );
  });

  it("ignores a second click while the first publish is still saving", async () => {
    let finishSave: () => void = () => undefined;
    const saveDraft = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          finishSave = resolve;
        }),
    );
    mocks.linkedPublish.mockResolvedValue("2026-09-29T10:00:00.000Z");
    const { result } = renderPublishAction({
      linkedPieceId: "piece-1",
      saveDraft,
    });

    let firstClick: Promise<void> = Promise.resolve();
    act(() => {
      firstClick = result.current.handlePublish("now", null);
    });
    expect(result.current.isPublishPending).toBe(true);

    await act(() => result.current.handlePublish("now", null));
    expect(saveDraft).toHaveBeenCalledTimes(1);

    await act(async () => {
      finishSave();
      await firstClick;
    });

    expect(mocks.linkedPublish).toHaveBeenCalledTimes(1);
    expect(result.current.isPublishPending).toBe(false);
  });
});
