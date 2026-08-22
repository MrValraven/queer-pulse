import {
  apiDelete,
  apiGet,
  apiGetNullable,
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
  /** A curated ground (a pride flag), drawn by the client from this id. */
  backgroundPreset: string | null;
  /** An uploaded ground, already resolved to a fetchable URL. */
  backgroundUrl: string | null;
  cardName: string;
  validityMonths: number | null;
  allowsPrint: boolean;
  allowsWallet: boolean;
  allowsPublicBadge: boolean;
  /** Whether this programme's cards carry the holder's photo at all. */
  allowsMemberPhoto: boolean;
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
  /**
   * The face on the card, or null. The backend resolves this from the
   * holder's profile avatar and sends it ONLY when the programme allows
   * photos and the member has not hidden theirs, so a non-null value is
   * already permission to draw it — never re-derive that here.
   */
  holderAvatarUrl: string | null;
  /** The member's own veto, for the control that toggles it. */
  isPhotoHidden: boolean;
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
  /** Absent leaves the stored ground alone; null clears it. Writing either of
   *  these clears the other server-side: a card has one ground. */
  backgroundPreset?: string | null;
  backgroundMediaKey?: string | null;
  cardName: string;
  validityMonths: number | null;
  allowsPublicBadge: boolean;
  /** Absent leaves the stored setting alone, like the crest and the ground. */
  allowsMemberPhoto?: boolean;
}

export const getMyCards = () => apiGet<MyCardDTO[]>("/me/cards");

/** POST rather than GET on purpose: this mints a credential, so it must
 *  never be cached by a browser, a proxy, or the service worker. */
export const mintCardToken = (cardId: string) =>
  apiPost<CardTokenDTO>(`/me/cards/${cardId}/token`, {});

/** Destroys a card the member holds (spec §K.4: the member's right to have a
 *  card destroyed, not merely revoked). 404s, never 403s, for a card the
 *  caller does not hold. */
/** The settings the HOLDER controls on their own card. */
export const updateMyCard = (
  cardId: string,
  body: { isPhotoHidden: boolean },
) => apiPatch<{ ok: true }>(`/me/cards/${cardId}`, body);

export const deleteMyCard = (cardId: string) =>
  apiDelete<{ ok: true }>(`/me/cards/${cardId}`);

export const getCardProgram = (slug: string) =>
  apiGetNullable<CardProgramDTO>(`/communities/${slug}/card`);

export const putCardProgram = (slug: string, body: UpsertCardProgramBody) =>
  apiPut<CardProgramDTO>(`/communities/${slug}/card`, body);

/**
 * What one bulk roster issue actually did, broken down per member. A plain
 * total would count members whose card was already active and would hide the
 * suspended/revoked cards the backend deliberately leaves alone, so the UI
 * would be claiming work it did not do.
 */
export interface RosterIssueResult {
  /** Members who had no card at all and now hold one. */
  issued: number;
  /** Active cards whose expiry had already passed, put back in date. */
  renewed: number;
  /** Members holding a card an issuer suspended or revoked. Left untouched. */
  skipped: number;
  /** Members already holding a valid, in-date card. */
  unchanged: number;
}

export const issueAllCards = (slug: string) =>
  apiPost<RosterIssueResult>(`/communities/${slug}/card/issue-all`, {});

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
