import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { ApiError } from "../../../shared/api/client";
import type { TranslateOptions } from "../../../shared/i18n/types";
import type { PublishDeckDto } from "./deckAdmin.api";
import {
  CARE_GATE_OPEN_CODE,
  publishPiece,
  readPublishRefusal,
  unpublishPiece,
  type PieceRecordPublishFields,
  type PublishPieceDto,
} from "./piecePublish.api";

/**
 * The 409 `code` `MagazineService.updateDeck` answers when a publish, schedule
 * or unpublish targets a deck a desk piece links to. Mirrors the backend's
 * `DECK_PUBLISH_VIA_PIECE_CODE`; the body also carries the `pieceId`.
 */
export const DECK_PUBLISH_VIA_PIECE_CODE = "magazine_deck_publish_via_piece";

/** The two piece endpoints a linked deck publishes through, injectable so the
 *  routing can be tested without a network. */
export interface PiecePublishCalls {
  publish: (
    pieceId: string,
    body: PublishPieceDto,
  ) => Promise<PieceRecordPublishFields | null>;
  unpublish: (pieceId: string) => Promise<PieceRecordPublishFields | null>;
}

/**
 * Sends one deck-editor publish click through the piece that owns the deck,
 * so the care gate, the stage move, the audit event and the writer's bell all
 * run exactly as they do from the piece record. Takes the same timing body the
 * standalone path sends (`buildDeckPublishTiming`): `publishedAt: null`
 * unpublishes, an ISO `publishedAt` schedules, and `published: true` publishes
 * now. Resolves to the deck's `publishedAt` afterwards.
 */
export async function publishDeckThroughPiece(
  pieceId: string,
  timing: PublishDeckDto,
  calls: PiecePublishCalls,
): Promise<string | null> {
  if (timing.publishedAt === null) {
    await calls.unpublish(pieceId);
    return null;
  }
  const body: PublishPieceDto = timing.publishedAt
    ? { publishedAt: timing.publishedAt }
    : {};
  const record = await calls.publish(pieceId, body);
  return record?.publishedAt ?? timing.publishedAt ?? new Date().toISOString();
}

/**
 * The piece id from the server's "publish this deck from its piece" 409, or
 * `null` for any other failure. Lets a click that raced the deck's link
 * lookup still reach the piece path.
 */
export function readDeckPublishViaPiece(error: unknown): string | null {
  if (!(error instanceof ApiError) || error.status !== 409) return null;
  const body = error.data;
  if (typeof body !== "object" || body === null) return null;
  const { code, pieceId } = body as Record<string, unknown>;
  return code === DECK_PUBLISH_VIA_PIECE_CODE && typeof pieceId === "string"
    ? pieceId
    : null;
}

/** An i18n key plus its values, ready for `t(key, values)`. */
export interface LinkedDeckPublishFailure {
  key: string;
  values?: TranslateOptions;
}

/**
 * What the deck editor says when the piece path refuses. The piece record
 * lists every open item on its gate card; the deck editor has no card, so the
 * toast names them instead. The server's items are the ones that count: the
 * editor's local checklist knows nothing about consent or sensitivity reads.
 */
export function linkedDeckPublishFailure(
  error: unknown,
): LinkedDeckPublishFailure {
  const refusal = readPublishRefusal(error);
  if (refusal === null) return { key: "magazine:deck.editor.saveError" };
  const hasItems = refusal.openGateItems.length > 0;
  if (refusal.code === CARE_GATE_OPEN_CODE) {
    return hasItems
      ? {
          key: "magazine:deck.editor.piecePublish.careGateToast",
          values: { items: refusal.openGateItems.join("; ") },
        }
      : { key: "magazine:piece.publish.refusedCareGateToast" };
  }
  return hasItems
    ? {
        key: "magazine:deck.editor.piecePublish.notReadyToast",
        values: { items: refusal.openGateItems.join(" ") },
      }
    : { key: "magazine:deck.editor.publishNotReadyError" };
}

const DEMO_CALLS: PiecePublishCalls = {
  publish: () => Promise.resolve(null),
  unpublish: () => Promise.resolve(null),
};

/**
 * The deck editor's publish act for a deck a desk piece owns. Silent by
 * contract (`meta.silentError`): `useDeckPublishAction` toasts the result,
 * including the care gate's open items. Demo mode never links a deck to a
 * piece (`useDeckIssueLink` answers no link), and stays off the network here
 * too.
 */
export function useLinkedDeckPublish() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<
    string | null,
    Error,
    { pieceId: string; timing: PublishDeckDto }
  >({
    meta: { silentError: true },
    mutationFn: ({ pieceId, timing }) =>
      publishDeckThroughPiece(
        pieceId,
        timing,
        demoMode
          ? DEMO_CALLS
          : { publish: publishPiece, unpublish: unpublishPiece },
      ),
    onSuccess: (_publishedAt, { pieceId }) => {
      // The deck, its piece record and every desk view holding the piece's
      // stage all moved together.
      for (const queryKey of [
        ["magazine-admin-decks"],
        ["magazine-deck"],
        ["magazine-piece", pieceId],
        ["magazine-pieces"],
        ["magazine-desk-summary"],
        ["magazine-issue-production"],
      ]) {
        void queryClient.invalidateQueries({ queryKey });
      }
    },
  });
}
