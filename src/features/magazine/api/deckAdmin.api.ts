import { apiGet, apiPatch } from "../../../shared/api/client";
import type { DeckDTO, UpdateDeckDto } from "./magazine.api";

/**
 * The deck-editor half of the admin decks API that the reader-facing
 * `magazine.api.ts` has no business knowing about: publishing with a real
 * instant, and resolving which issue a deck ships with (PRD-131).
 *
 * `updateDeck` in `magazine.api.ts` stays exactly as it was and still serves
 * every plain save. What is here is the publish call, which needs a field
 * that file's `UpdateDeckDto` does not carry.
 */

/**
 * `PATCH /magazine/admin/decks/:id` with the richer publish control. Mirrors
 * `queerpulse-backend/src/magazine/dto/update-deck.dto.ts`: `publishedAt` set
 * to an ISO instant publishes at that moment (a FUTURE one schedules the
 * deck, because the public deck reads already require `published_at <= now`),
 * and `null` pulls it back to draft. It wins over the older `published`
 * boolean when both are sent.
 */
export type PublishDeckDto = UpdateDeckDto & {
  publishedAt?: string | null;
};

export const publishDeck = (id: string, dto: PublishDeckDto) =>
  apiPatch<DeckDTO>(`/magazine/admin/decks/${id}`, dto);

/**
 * What the editor's "With issue" publish timing resolves to for this deck:
 * the desk piece that owns it and the issue that piece is filed under, each
 * `null` when the link does not exist yet. `MagazinePieceService.shipIssue`
 * publishes the deck of every past-gate piece in an issue, so this is what
 * makes that timing a real promise the rail can name.
 */
export interface DeckIssueLinkDTO {
  pieceId: string | null;
  issueNumber: string | null;
  issueTitle: string | null;
}

export const getDeckIssueLink = (id: string) =>
  apiGet<DeckIssueLinkDTO>(`/magazine/admin/decks/${id}/issue-link`);
