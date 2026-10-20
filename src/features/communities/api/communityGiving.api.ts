import { apiGet, apiPut } from "../../../shared/api/client";

/**
 * A community's support section: `GET/PUT /communities/:slug/giving`.
 *
 * Its own module mirroring the backend's standalone giving controller. GET is
 * readable by anyone who can open the hub. PUT replaces the whole set and is
 * owner and co-owner only. Giving values are never logged anywhere on the
 * client.
 */

/** How a way to support is reached: an outbound link, an MB WAY number or an
 *  IBAN. */
export type CommunityGivingKind = "link" | "mbway" | "iban";

export const COMMUNITY_GIVING_KINDS: CommunityGivingKind[] = [
  "link",
  "mbway",
  "iban",
];

export interface CommunityGivingMethodDTO {
  /** Regenerated on every effective PUT, so use it as a render key only. */
  id: string;
  kind: CommunityGivingKind;
  /** Null when the owner left it empty; the row falls back to the platform
   *  name, "MB WAY" or "IBAN". */
  label: string | null;
  /** Canonical form: links trimmed as entered, MB WAY as 9 digits, IBAN
   *  uppercase without spaces. */
  value: string;
  note: string | null;
  /** 0 to n-1, the order the owner chose. */
  position: number;
}

export interface CommunityGivingDTO {
  intro: string | null;
  /** Sorted by `position` ascending. */
  methods: CommunityGivingMethodDTO[];
  /** Time of the last effective PUT. Null when `methods` is empty. */
  updatedAt: string | null;
}

/** One row of the PUT body. Carries no `id` and no `position`: the server
 *  refuses any extra key, and the array order becomes the position. */
export interface UpdateCommunityGivingMethodBody {
  kind: CommunityGivingKind;
  label: string | null;
  value: string;
  note: string | null;
}

export interface UpdateCommunityGivingBody {
  intro: string | null;
  methods: UpdateCommunityGivingMethodBody[];
}

export const getCommunityGiving = (slug: string) =>
  apiGet<CommunityGivingDTO>(`/communities/${slug}/giving`);

export const putCommunityGiving = (
  slug: string,
  body: UpdateCommunityGivingBody,
) => apiPut<CommunityGivingDTO>(`/communities/${slug}/giving`, body);
