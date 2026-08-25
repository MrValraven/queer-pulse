import {
  apiDelete,
  apiGet,
  apiGetNullable,
  apiPatch,
  apiPost,
  apiPut,
} from "../../../shared/api/client";

export type CardSkin = "plum" | "cream" | "jade" | "coral" | "ink";

/** How a photo card prints the faces it carries. Mirrors the backend's
 *  closed list (`CARD_PHOTO_STYLES` in `community-card.entity.ts`). */
export type CardPhotoStyle = "color" | "mono";

/** How a card with a flag or photo ground keeps its own text readable.
 *  Mirrors the backend's closed list (`CARD_TEXT_BACKDROPS`). Never a switch
 *  for turning protection OFF: each value is a different treatment, because a
 *  card that cannot be read at a door is not a card. */
export type CardTextBackdrop = "shade" | "panel" | "veil";

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
  /** How those photos are printed: in colour, or desaturated. */
  photoStyle: CardPhotoStyle;
  /** Whether this programme's cards print the holder's pronouns. */
  allowsPronouns: boolean;
  /** Which legibility treatment a flag or photo ground carries. Ignored by
   *  the five flat skins, which carry their own curated contrast. */
  textBackdrop: CardTextBackdrop;
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
  /**
   * The pronouns printed on the card, or null. Resolved server-side from the
   * holder's profile and sent ONLY when the programme prints pronouns, the
   * member has not hidden theirs, and they have any set. A non-null value is
   * already permission to draw it — never re-derive that here.
   */
  holderPronouns: string | null;
  /** The member's own veto, for the control that toggles it. */
  isPronounsHidden: boolean;
  /**
   * The card's permanent scannable code, or null when the platform has no
   * signing key. It arrives with the card, so nothing mints on demand and an
   * issuer reading a member's card sees the same code that member shows.
   */
  token: string | null;
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
  /** The holder's PROFILE picture, for the roster row. */
  avatarUrl: string | null;
  /** The holder's role in the issuing community, as printed on the card. */
  role: string;
  /**
   * The face the card actually prints, or null. The backend applies the same
   * two switches it applies to `MyCardDTO.holderAvatarUrl` (the programme's
   * photo setting and the holder's own veto), so a non-null value is already
   * permission to draw it and a null one means the card carries no photo.
   * Never substitute `avatarUrl` for it: they answer different questions.
   */
  cardPhotoUrl: string | null;
  /**
   * The pronouns the card actually prints, or null. Gated by the same pair of
   * switches as `cardPhotoUrl`, so an issuer reading a member's card sees what
   * that card says rather than what the holder's profile says.
   */
  cardPronouns: string | null;
  /**
   * The card's permanent scannable code, or null when the platform has no
   * signing key. It arrives with the card, so nothing mints on demand and an
   * issuer reading a member's card sees the same code that member shows.
   */
  token: string | null;
}

export interface CardVerificationDTO {
  status: EffectiveCardStatus;
  issuerName: string;
  holderName: string;
  role: string;
  serial: string;
  memberSince: string;
  /** Whether the card carries the holder's face, so a door knows whether it
   *  has anything to check the person in front of it against. */
  hasPhoto: boolean;
  /** The pronouns the card prints, or null, so whoever scanned it can address
   *  the holder correctly. Present only when the card itself carries them. */
  holderPronouns: string | null;
  /**
   * The face the card prints, served by the ISSUER rather than by the object
   * being shown, so a door compares the person in front of it against a copy
   * nobody at the door could have edited. Null unless the card both carries a
   * face and is currently active. */
  holderPhotoUrl: string | null;
  /** How the card itself renders that face, so the portrait a verifier
   *  compares against matches the one printed on the card in their hand. */
  photoStyle: CardPhotoStyle;
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
  allowsPrint?: boolean;
  /** Same absent-leaves-it-alone contract as the switch above. */
  allowsMemberPhoto?: boolean;
  /** Same absent-leaves-it-alone contract as the switch above. */
  photoStyle?: CardPhotoStyle;
  /** Whether these cards print each holder's pronouns. Same
   *  absent-leaves-it-alone contract as the switches above. */
  allowsPronouns?: boolean;
  /** Which legibility treatment the ground carries. Same
   *  absent-leaves-it-alone contract as the switches above. */
  textBackdrop?: CardTextBackdrop;
}

export const getMyCards = () => apiGet<MyCardDTO[]>("/me/cards");

/** Destroys a card the member holds (spec §K.4: the member's right to have a
 *  card destroyed, not merely revoked). 404s, never 403s, for a card the
 *  caller does not hold. */
/**
 * The settings the HOLDER controls on their own card. Every field is optional
 * and absent leaves the stored value alone, so toggling one veto never
 * rewrites the other.
 */
export const updateMyCard = (
  cardId: string,
  body: { isPhotoHidden?: boolean; isPronounsHidden?: boolean },
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

/**
 * Voids every printed copy of one card by moving its code to a new generation.
 * The holder's digital card is unaffected: it simply starts showing the new
 * code. This is the remedy for a lost or stolen physical card, as against
 * revoking, which takes the member's membership proof away entirely.
 */
export const replaceCardCode = (slug: string, cardId: string) =>
  apiPost<{ ok: true }>(
    `/communities/${slug}/card/holders/${cardId}/replace`,
    {},
  );

/** Public and unauthenticated: the point of a card is that a stranger can
 *  check it without a QueerPulse account. */
export const verifyCard = (token: string) =>
  apiGet<CardVerificationDTO>(`/cards/verify/${encodeURIComponent(token)}`);
