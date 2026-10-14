import { ApiError } from "../../../shared/api/client";
import {
  ACCOUNT_RESTRICTED_COPY,
  isAccountRestricted,
} from "../../../shared/api/errorMessage";
import {
  PERSONA_POST,
  PERSONA_POST_ERROR_CODES,
  type CreatePersonaPostBody,
  type PersonaPostDTO,
  type PersonaPostErrorCode,
  type UpdatePersonaPostBody,
} from "./personaPosts.types";

export interface PersonaPostLinkView {
  href: string;
  /** The bare host, shown on the link card. */
  host: string;
}

export interface PersonaPostView {
  id: string;
  /** As written; links inside it stay plain text. */
  body: string;
  linkUrl: string | null;
  link: PersonaPostLinkView | null;
  imageUrl: string | null;
  createdAt: string;
  editedAt: string | null;
  isEdited: boolean;
  canEdit: boolean;
}

/** An https link as a card (the server stores https only); anything else
 *  is dropped. */
export function toPersonaPostLinkView(
  url: string | null,
): PersonaPostLinkView | null {
  const value = url?.trim() ?? "";
  if (!/^https:\/\//i.test(value)) return null;
  try {
    return {
      href: value,
      host: new URL(value).hostname.replace(/^www\./i, ""),
    };
  } catch {
    return null;
  }
}

export function toPersonaPostView(dto: PersonaPostDTO): PersonaPostView {
  return {
    id: dto.id,
    body: dto.body,
    linkUrl: dto.linkUrl,
    link: toPersonaPostLinkView(dto.linkUrl),
    imageUrl: dto.imageUrl,
    createdAt: dto.createdAt,
    editedAt: dto.editedAt,
    isEdited: dto.editedAt !== null,
    canEdit: dto.canEdit,
  };
}

/** What the composer holds while the owner types. */
export interface PersonaPostDraft {
  body: string;
  linkUrl: string;
  /** A key picked this session; null keeps the saved photo (or none). */
  imageKey: string | null;
  /** What the photo slot shows: the saved photo or the fresh pick. */
  imagePreviewUrl: string | null;
}

export const EMPTY_PERSONA_POST_DRAFT: PersonaPostDraft = {
  body: "",
  linkUrl: "",
  imageKey: null,
  imagePreviewUrl: null,
};

export function draftFromPost(post: PersonaPostView): PersonaPostDraft {
  return {
    body: post.body,
    linkUrl: post.linkUrl ?? "",
    imageKey: null,
    imagePreviewUrl: post.imageUrl,
  };
}

/** https only, as the server takes for a post link (http and mailto
 *  answer 400). */
const isWebLink = (value: string) => {
  if (!/^https:\/\//i.test(value)) return false;
  try {
    return Boolean(new URL(value).hostname);
  } catch {
    return false;
  }
};

export function personaPostDraftErrors(draft: PersonaPostDraft): {
  body?: string;
  linkUrl?: string;
} {
  const errors: { body?: string; linkUrl?: string } = {};
  const body = draft.body.trim();
  if (!body) errors.body = "subprofiles:updates.composer.bodyRequired";
  else if (body.length > PERSONA_POST.bodyMax)
    errors.body = "subprofiles:updates.composer.bodyTooLong";
  const link = draft.linkUrl.trim();
  if (link.length > PERSONA_POST.linkMax)
    errors.linkUrl = "subprofiles:updates.composer.linkTooLong";
  else if (link && !isWebLink(link))
    errors.linkUrl = "subprofiles:updates.composer.linkInvalid";
  return errors;
}

export function createBodyFromDraft(
  draft: PersonaPostDraft,
): CreatePersonaPostBody {
  const link = draft.linkUrl.trim();
  return {
    body: draft.body.trim(),
    ...(link ? { linkUrl: link } : {}),
    ...(draft.imageKey ? { imageKey: draft.imageKey } : {}),
  };
}

/** Only what changed; null clears the link or the photo. The wire never
 *  carries the stored photo's key, so keeping the photo leaves `imageKey`
 *  out of the body; a fresh pick sends its key. */
export function updateBodyFromDraft(
  draft: PersonaPostDraft,
  post: PersonaPostView,
): UpdatePersonaPostBody {
  const body: UpdatePersonaPostBody = {};
  const text = draft.body.trim();
  if (text !== post.body) body.body = text;
  const link = draft.linkUrl.trim() || null;
  if (link !== post.linkUrl) body.linkUrl = link;
  if (draft.imageKey) body.imageKey = draft.imageKey;
  else if (draft.imagePreviewUrl === null && post.imageUrl !== null)
    body.imageKey = null;
  return body;
}

/** True when an edit body changes at least one field. The server stamps
 *  "Edited" on every PATCH, so an edit with no change stays unsent. */
export function hasPersonaPostChanges(body: UpdatePersonaPostBody): boolean {
  return (
    body.body !== undefined ||
    body.linkUrl !== undefined ||
    body.imageKey !== undefined
  );
}

const ERROR_KEY: Record<PersonaPostErrorCode, string> = {
  persona_posts_not_available: "subprofiles:updates.errors.notAvailable",
  persona_post_image_not_allowed: "subprofiles:updates.errors.imageNotAllowed",
  persona_post_daily_limit: "subprofiles:updates.errors.dailyLimit",
};
const KNOWN_CODES: ReadonlySet<string> = new Set(PERSONA_POST_ERROR_CODES);

/** A refused write as a catalog key. */
export function personaPostErrorKeyOf(error: unknown): string {
  if (isAccountRestricted(error)) return ACCOUNT_RESTRICTED_COPY.key;
  if (!(error instanceof ApiError)) return "subprofiles:updates.errors.generic";
  const code = (error.data as { code?: unknown } | null | undefined)?.code;
  if (typeof code === "string" && KNOWN_CODES.has(code))
    return ERROR_KEY[code as PersonaPostErrorCode];
  if (error.status === 404) return "subprofiles:updates.errors.gone";
  return "subprofiles:updates.errors.generic";
}
