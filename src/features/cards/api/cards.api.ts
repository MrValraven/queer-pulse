import {
  apiDelete,
  apiGet,
  apiPatch,
  apiPost,
  apiPut,
} from "../../../shared/api/client";

export type CardSkin = "plum" | "cream" | "jade" | "coral" | "ink";

/** The status a verifier sees: the card's own state combined with the
 *  issuing community's freeze/archive state and the expiry clock. */
export type EffectiveCardStatus =
  | "active"
  | "suspended"
  | "revoked"
  | "expired";

export interface CardProgramDTO {
  isEnabled: boolean;
  skin: CardSkin;
  accentToken: string;
  crestUrl: string | null;
  cardName: string;
  validityMonths: number | null;
  allowsPrint: boolean;
  allowsWallet: boolean;
  allowsPublicBadge: boolean;
  serialPrefix: string;
}

export interface MyCardDTO {
  id: string;
  serial: string;
  status: EffectiveCardStatus;
  issuedAt: string;
  expiresAt: string | null;
  communityName: string;
  communitySlug: string;
  role: string;
  holderName: string;
  program: CardProgramDTO;
}

export interface IssuerCardDTO {
  id: string;
  serial: string;
  status: EffectiveCardStatus;
  issuedAt: string;
  expiresAt: string | null;
  revokedAt: string | null;
  revokedReason: string | null;
  holderSlug: string;
  holderName: string;
  avatarUrl: string | null;
}

export interface CardVerificationDTO {
  status: EffectiveCardStatus;
  issuerName: string;
  holderName: string;
  role: string;
  serial: string;
  memberSince: string;
}

export interface CardTokenDTO {
  token: string;
  expiresAt: string;
}

export interface UpsertCardProgramBody {
  isEnabled: boolean;
  skin: CardSkin;
  accentToken: string;
  crestMediaKey?: string | null;
  cardName: string;
  validityMonths: number | null;
  allowsPublicBadge: boolean;
}

export const getMyCards = () => apiGet<MyCardDTO[]>("/me/cards");

/** POST rather than GET on purpose: this mints a credential, so it must
 *  never be cached by a browser, a proxy, or the service worker. */
export const mintCardToken = (cardId: string) =>
  apiPost<CardTokenDTO>(`/me/cards/${cardId}/token`, {});

/** Destroys a card the member holds (spec §K.4: the member's right to have a
 *  card destroyed, not merely revoked). 404s, never 403s, for a card the
 *  caller does not hold. */
export const deleteMyCard = (cardId: string) =>
  apiDelete<{ ok: true }>(`/me/cards/${cardId}`);

export const getCardProgram = (slug: string) =>
  apiGet<CardProgramDTO | null>(`/communities/${slug}/card`);

export const putCardProgram = (slug: string, body: UpsertCardProgramBody) =>
  apiPut<CardProgramDTO>(`/communities/${slug}/card`, body);

export const issueAllCards = (slug: string) =>
  apiPost<{ issued: number }>(`/communities/${slug}/card/issue-all`, {});

export const getCardHolders = (slug: string) =>
  apiGet<IssuerCardDTO[]>(`/communities/${slug}/card/holders`);

export const setCardHolderStatus = (
  slug: string,
  cardId: string,
  body: { status: "active" | "suspended" | "revoked"; reason?: string },
) => apiPatch<{ ok: true }>(`/communities/${slug}/card/holders/${cardId}`, body);

/** Public and unauthenticated: the point of a card is that a stranger can
 *  check it without a QueerPulse account. */
export const verifyCard = (token: string) =>
  apiGet<CardVerificationDTO>(`/cards/verify/${encodeURIComponent(token)}`);
