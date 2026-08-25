import {
  apiGet,
  apiPost,
  apiPatch,
  apiPut,
  apiDelete,
} from "../../../shared/api/client";
import type { PoemBlock, PoemVersion } from "../poem/poemModel";
import type { CropRect } from "../../../shared/components/ui/cropGeometry";

// ── Wire DTOs (contract C3) ──────────────────────────────────────────────────
// These types are IDENTICAL to the backend `subprofile-response.ts` views. Keep
// them verbatim so the API, the public view, and the owner editor never drift.

export type Visibility = "open" | "network" | "private";
export type LinkVisibility = "linked" | "unlinked";
export type SubprofileStatus = "draft" | "published";

/** Phase 1b Shared Contract: why a public read is unreachable for THIS
 *  viewer, distinct from a genuine 404. Carried on a 403 response body as
 *  `{ restrictedState }` — see `usePublicSubprofile`'s `PublicSubprofileResult`
 *  and the demo mirror `resolvePublicAccessDemo` (`data/subprofiles.data.ts`).
 *  Declared here (the wire-contract file) rather than in either consumer, so
 *  the live hook and the demo resolver both import ONE definition instead of
 *  drifting apart. */
export type RestrictedState = "private" | "members_only" | "removed";

export type AccentKey = "plum" | "coral" | "jade" | "amber" | "violet";
export type AvailabilityKey = "open_to_collabs" | "booking" | "not_available";

export interface SocialLinkDTO {
  platform: string;
  urlOrHandle: string;
}

/** One resolved persona→entity link ("Part of"). Dropped server-side (on read)
 *  when the target no longer resolves or is block-filtered against the viewer. */
export interface AffiliationDTO {
  targetType: "event" | "community";
  targetSlug: string;
  role: string;
  name: string;
  imageUrl: string | null;
}

/** Owner-authored input for `PUT /subprofiles/:id/affiliations` (replace-all). */
export interface AffiliationInputDTO {
  targetType: "event" | "community";
  targetSlug: string;
  role: string;
}

/** One member's endorsement of a persona (returned by the endorsers list). */
export interface EndorserDTO {
  slug: string;
  name: string;
  avatarUrl: string | null;
  note: string | null;
}

/** One follower of a persona (returned by the OWNER-only followers list — see
 *  `getFollowers`). Deliberately note-less: following is a one-tap, contextless
 *  signal, unlike an endorsement. */
export interface FollowerDTO {
  slug: string;
  name: string;
  avatarUrl: string | null;
}

/** One resolved collaboration credit on an item ("with @handle"). Resolved
 *  server-side from the persisted handle — dropped on read if the handle no
 *  longer resolves or is block-filtered against the viewer. */
export interface CollaboratorDTO {
  handle: string;
  type: "member" | "persona";
  name: string;
  avatarUrl: string | null;
  slug: string | null; // member profile slug for /members/:slug; null for personas
}

export type SubprofileKind =
  | "developer"
  | "writer"
  | "musician"
  | "visual_artist"
  | "filmmaker"
  | "designer"
  | "maker"
  | "drag"
  | "dj"
  | "dancer"
  | "performer"
  | "photographer"
  | "videomaker"
  | "chef"
  | "mixologist"
  | "therapist"
  | "astrologer"
  | "generic"
  // Personas expansion — stage (new kinds)
  | "comedian"
  | "vocalist"
  | "burlesque"
  | "circus"
  | "spoken_word"
  | "host"
  | "voguer"
  // studio (new kinds)
  | "illustrator"
  | "tattoo_artist"
  | "animator"
  | "comic_artist"
  | "game_designer"
  | "artist_3d"
  | "printmaker"
  // page (new kinds)
  | "journalist"
  | "poet"
  | "editor"
  | "screenwriter"
  | "translator"
  | "zinester"
  | "academic"
  // workshop (new kinds)
  | "ceramicist"
  | "jeweler"
  | "textile_artist"
  | "woodworker"
  | "florist"
  | "data_scientist"
  // practice (new kinds)
  | "coach"
  | "bodyworker"
  | "yoga_teacher"
  | "nutritionist"
  | "doula"
  | "personal_trainer"
  | "sex_educator"
  | "peer_support"
  // table (new kinds)
  | "baker"
  | "barista"
  | "brewer"
  | "sommelier"
  | "caterer"
  // chair (new family)
  | "hair_stylist"
  | "barber"
  | "makeup_artist"
  | "nail_artist"
  | "esthetician"
  | "piercer"
  // runway (new family)
  | "fashion_designer"
  | "stylist"
  | "model"
  | "costume_designer"
  // gallery (new family)
  | "curator"
  | "gallerist"
  | "art_dealer"
  | "archivist"
  | "conservator"
  | "registrar"
  | "exhibition_designer"
  | "art_critic"
  | "docent"
  | "preparator"
  // history (new family — display name "Record")
  | "historian"
  | "art_historian"
  | "oral_historian"
  | "genealogist"
  | "heritage"
  | "archival_researcher"
  | "memory_keeper"
  // collective (new family — display name "Poster")
  | "organizer"
  | "activist"
  | "event_producer"
  | "promoter"
  // classroom (new family)
  | "teacher"
  | "facilitator"
  | "tutor"
  | "lecturer"
  | "pole_dancer";

export type SubprofileSection =
  | "projects"
  | "open_source" // developer
  | "publications"
  | "readings" // writer
  | "discography"
  | "gigs" // musician + dj
  | "portfolio"
  | "exhibitions" // visual_artist + photographer
  | "filmography"
  | "screenings" // filmmaker + videomaker
  | "selected_work"
  | "clients" // designer
  | "collections"
  | "workshops" // maker
  | "shows"
  | "looks" // drag
  | "mixes" // dj
  | "performances"
  | "reel" // dancer + performer
  | "appearances" // performer
  | "series" // photographer
  | "videos" // videomaker
  | "menus" // chef
  | "residencies" // chef + mixologist
  | "cocktails" // mixologist
  | "specialisms"
  | "credentials" // therapist
  | "charts"
  | "sky" // astrologer
  | "showcase" // generic
  | "gallery" // every kind
  | "links" // every kind
  // Personas expansion — new content sections (shared ids listed once)
  | "sets"
  | "tour"
  | "recordings"
  | "acts"
  | "pieces"
  | "hosted"
  | "balls"
  | "flash"
  | "healed"
  | "books"
  | "strips"
  | "games"
  | "jams"
  | "models"
  | "editions"
  | "reporting"
  | "bylines"
  | "poems"
  | "edited"
  | "scripts"
  | "productions"
  | "translations"
  | "languages"
  | "zines"
  | "distros"
  | "papers"
  | "teaching"
  | "wares"
  | "firings"
  | "commissions"
  | "builds"
  | "arrangements"
  | "events"
  | "analyses"
  | "programmes"
  | "treatments"
  | "classes"
  | "trainings"
  | "support"
  | "training"
  | "resources"
  | "groups"
  | "bakes"
  | "markets"
  | "brews"
  | "releases"
  | "taprooms"
  | "lists"
  | "pairings"
  | "services"
  | "cuts"
  | "nail_sets"
  | "aftercare"
  | "piercings"
  | "editorials"
  | "book"
  | "campaigns"
  | "sketches"
  | "texts"
  | "programme"
  | "artists"
  | "available"
  | "advisory"
  | "finding_aids"
  | "loans"
  | "installations"
  | "reviews"
  | "tours"
  | "talks"
  | "installs"
  | "research"
  | "lectures"
  | "testimonies"
  | "findings"
  | "sites"
  | "actions"
  | "writing"
  | "nights"
  | "roster"
  | "courses"
  | "subjects";

export type GigState = "sold_out" | "cancelled" | "guest";
export type WorkState = "shipped" | "archived" | "in_progress";

export interface MenuDish {
  title: string;
  note?: string | null;
  marks?: string[] | null;
}
export interface MenuCourse {
  n: string;
  name: string;
  dishes: MenuDish[];
}
/** Poem block types (poet `poems` section). Single source of truth is
 *  `../poem/poemModel.ts` — re-exported here so wire-contract consumers keep
 *  importing from this file. Stored in the item's `structured` jsonb blob —
 *  no dedicated columns, no migration; round-trips untouched via
 *  `itemToView`/`itemsToInputDto` like `structured.snippet`. Each stanza/note
 *  is a `PoemLine[]` (`PoemSpan[]` with inline `em`/`strong` marks) rather
 *  than an HTML string, so a sanitizer can never flatten line breaks. */
export type {
  PoemMark,
  PoemSpan,
  PoemLine,
  PoemBlock,
  PoemStanzaBlock,
  PoemBreakBlock,
  PoemNoteBlock,
  PoemVersion,
} from "../poem/poemModel";

/** Nested per-item data that doesn't fit flat columns (subprofile_items.structured). */
export interface ItemStructured {
  courses?: MenuCourse[] | null;
  snippet?: string[] | null;
  /** Per-item typed social links (e.g. a project's GitHub/website), stored in
   *  the `structured` jsonb blob — no dedicated column. Only surfaced in the
   *  editor + public render for the `projects`/`open_source` sections. Reuses
   *  the persona-level `SocialLinkDTO` shape so the icon row + platform picker
   *  are shared. Round-trips untouched via `itemToView`/`itemsToInputDto`. */
  links?: SocialLinkDTO[] | null;
  /** Poet `poems` section only: the poem body as an ordered block list.
   *  See `PoemBlock`. Absent on every other section/kind. When
   *  `poemVersions` is present this mirrors the first (default) version's
   *  blocks so pre-translation readers keep working (no migration). */
  poem?: PoemBlock[] | null;
  /** Poet `poems` section only: named translations/versions of the poem. The
   *  first entry is the default; readers cycle the rest via tabs. See
   *  `PoemVersion`. Absent for single-version poems saved before this existed
   *  (they read as one default version via `normalizePoemVersions`). */
  poemVersions?: PoemVersion[] | null;
}

/** Practice skin (therapist): tri-state for one availability slot. */
export type PracticeAvailState = "open" | "full" | "off";

/** Persona-level skin blocks (subprofiles.skin_data). Only the keys relevant to the
 *  persona's derived skin are populated. Display data — present on the public view too. */
export interface SkinData {
  /** Owner display preference: fade the cover banner into the page background
   *  at its bottom edge (see `.pp[data-cover-bleed]` in persona-skins.css). */
  coverBleed?: boolean;
  booker?: { fee: string; rider: string; press: string; contact: string } | null;
  excerpt?: { from: string; lines: string[] } | null;
  colophon?: string | null;
  menuMeta?: { no: string; when: string; practical: string[] } | null;
  practical?: {
    fee: string;
    sliding: string;
    length: string;
    languages: string;
    mode: string;
    next: string;
  } | null;
  firstSession?: { title: string; body: string }[] | null;
  access?: string[] | null;
  referrals?: { name: string; note: string }[] | null;
  /** Practice skin: how the therapist works, one prose paragraph per entry. */
  approach?: string[] | null;
  /** Practice skin: training / qualifications, most recent first. */
  training?: string[] | null;
  /** Practice skin: where they practise. `lines` = address lines.
   *  (Room/building accessibility lives in the existing `access` key.) */
  venue?: { name: string; lines: string[] } | null;
  /** Practice skin: a 4-week availability grid. `startDate` is the ISO date of
   *  the first cell (a Monday); `cells` is 28 tri-state slots in row-major order
   *  (4 weeks × 7 days). Day numbers + month labels derive from `startDate`. */
  availability?: {
    startDate: string;
    slotTime: string;
    cells: PracticeAvailState[];
  } | null;
  /** Practice skin (therapist): fee breakdown rows shown in the sidebar.
   *  Named `feeSchedule` (not `fees`) — `fees` is the Classroom skin's key. */
  feeSchedule?: { label: string; value: string }[] | null;
  /** Chart skin (astrologer): the live sky band shown in the hero. */
  sky?: { moon: string; phase: string; note: string } | null;
  /** Chart skin: what the astrologer needs from a querent before a reading. */
  birthData?: { date: string; time: string; place: string; note: string } | null;
  /** Chart skin: the "what a reading is not" boundary list. */
  ethics?: string[] | null;
  /** Chair skin: the price/booking band shown after the bio. */
  chair?: { rate: string; walkins: string; where: string; quiet: string } | null;
  /** Chair skin: the "before you sit down" list at the foot. */
  beforeYouSit?: string[] | null;
  /** Runway skin: the credits dl at the foot (press / stockists / made / direct). */
  credits?: { press: string; stockists: string; made: string; contact: string } | null;
  /** Gallery skin: the "now on view" band in the hero. */
  onView?: { title: string; artist: string; dates: string; room: string } | null;
  /** Gallery skin: the "visiting" dl at the foot (hours / address / access / admission). */
  visit?: { hours: string; address: string; access: string; admission: string } | null;
  /** Record (history) skin: "the record itself" dl + a gaps note at the foot. */
  record?: { held: string; access: string; consent: string; gaps: string } | null;
  /** Poster (collective) skin: the "next" action band in the hero. */
  nextAction?: { what: string; when: string; where: string } | null;
  /** Poster (collective) skin: the "how we work" ordered principles list at the foot. */
  principles?: string[] | null;
  /** Classroom skin: the fees dl after the bio (cost / materials / where / extras + note). */
  fees?: {
    cost: string;
    materials: string;
    where: string;
    extras: string;
    note?: string | null;
  } | null;
  /** Classroom skin: the "what you leave with" promises list at the foot. */
  promises?: string[] | null;
}

export interface SubprofileItemDTO {
  id: string;
  section: SubprofileSection;
  title: string;
  /** ISO 8601 first-published timestamp (item row creation on QueerPulse). */
  createdAt: string;
  subtitle?: string | null;
  description?: string | null;
  url?: string | null;
  imageUrl?: string | null;
  date?: string | null;
  meta?: string | null;
  tags: string[];
  isFeatured: boolean;
  collaborators: CollaboratorDTO[];
  venue?: string | null;
  doors?: string | null;
  ticketUrl?: string | null;
  gigState?: GigState | null;
  medium?: string | null;
  dimensions?: string | null;
  edition?: string | null;
  workState?: WorkState | null;
  structured?: ItemStructured | null;
}

/** Owner-facing (full), returned by GET /subprofiles/mine, GET /subprofiles/:id,
 *  and all mutations. */
export interface SubprofileDTO {
  id: string;
  kind: SubprofileKind;
  slug: string;
  handle: string | null;
  displayName: string;
  avatarUrl: string | null;
  /** Saved reframe crop for `avatarUrl` (fractions of the source image), when
   *  the owner cropped their persona avatar in the reframe editor. */
  avatarCrop?: CropRect | null;
  tagline: string | null;
  bio: string | null;
  coverUrl: string | null;
  /** Saved reframe crop for `coverUrl`. Rendered as a FOCAL POINT, not an
   *  exact frame — the banner's box aspect changes with the skin and the
   *  viewport, so no slot can reproduce the crop rect literally. */
  coverCrop?: CropRect | null;
  accent: string | null;
  availability: string | null;
  ctaLabel: string | null;
  ctaUrl: string | null;
  socialLinks: SocialLinkDTO[];
  linkVisibility: LinkVisibility;
  visibility: Visibility;
  status: SubprofileStatus;
  position: number;
  items: SubprofileItemDTO[]; // all sections, ordered by (section, position)
  affiliations: AffiliationDTO[]; // event/community links ("Part of")
  endorsementCount: number;
  followerCount: number;
  skinData?: SkinData | null;
  // Phase 1b: a moderator takedown timestamp. Nullable/optional — additive,
  // set by a separate (not-yet-built) admin moderation action; this column
  // only makes the resulting "removed" state display-ready end to end.
  removedAt?: string | null;
  // Personas redesign Phase 2 (dashboard plan Decision §5): the persona's
  // co-owner headcount (creator + accepted invitees), for the dashboard
  // `SideCard`'s "co-owned by N" meta line without an N+1 members fetch per
  // card. Optional (mirrors `skinData`'s pattern) so demo fixtures/tests that
  // predate this field keep compiling — `subprofileToView` defaults an absent
  // value to 1, same as the backend's own default.
  memberCount?: number;
}

/** Public view: owner-stripped when linkVisibility === 'unlinked'.
 *  ownerSlug/ownerName present only when linkVisibility === 'linked'.
 *
 *  Phase 1b (Shared Contract): the public single-fetch routes
 *  (`GET /subprofiles/by-handle/:handle` and the nested owner-slug+subslug
 *  read) now resolve regardless of status/visibility and apply
 *  `resolvePublicAccess` — owner/co-owner always gets the full DTO (so
 *  `status` may legitimately be `"draft"` here, unlike every other public
 *  read which only ever returns `published`); everyone else gets either the
 *  full DTO (open, or network+authenticated) or a 403
 *  `{ restrictedState }` the caller never sees as a DTO at all (see
 *  `usePublicSubprofile`'s `PublicSubprofileResult`). */
export interface SubprofilePublicDTO {
  id: string;
  kind: SubprofileKind;
  slug: string;
  handle: string | null;
  displayName: string;
  avatarUrl: string | null;
  tagline: string | null;
  bio: string | null;
  coverUrl: string | null;
  /** Saved reframe crop for `coverUrl`. Rendered as a FOCAL POINT, not an
   *  exact frame — the banner's box aspect changes with the skin and the
   *  viewport, so no slot can reproduce the crop rect literally. */
  coverCrop?: CropRect | null;
  accent: string | null;
  availability: string | null;
  ctaLabel: string | null;
  ctaUrl: string | null;
  socialLinks: SocialLinkDTO[];
  linkVisibility: LinkVisibility;
  status: SubprofileStatus;
  items: SubprofileItemDTO[];
  affiliations: AffiliationDTO[]; // event/community links ("Part of")
  ownerSlug?: string; // linked only
  ownerName?: string; // linked only
  endorsementCount: number;
  viewerEndorsed: boolean;
  followerCount: number;
  viewerFollowing: boolean;
  // Is the current viewer a co-owner (creator or invited member) of THIS
  // persona? Drives the "edit" affordance on a nested persona shown on a
  // co-owner's profile.
  viewerIsMember: boolean;
  skinData?: SkinData | null;
  // Phase 1b: mirrors `SubprofileDTO.removedAt`. Only ever populated for an
  // owner/co-owner viewing their own removed persona (a non-owner gets the
  // 403 `{restrictedState:"removed"}` instead of a DTO at all).
  removedAt?: string | null;
}

/** Directory / list card. */
export interface SubprofileCardDTO {
  handle: string;
  /** Linked personas live under their owner's member profile; unlinked at /p/:handle. */
  linkVisibility: LinkVisibility;
  /** The owner member's profile slug — LINKED personas only, else null (anonymity). */
  ownerSlug: string | null;
  /** The persona's per-owner slug (for the /members/:ownerSlug/:slug route). */
  slug: string;
  kind: SubprofileKind;
  displayName: string;
  avatarUrl: string | null;
  tagline: string | null;
  accent: string | null;
  availability: string | null;
  socialCount: number;
  tags: string[];
  // Personas redesign Phase 4 (design plan Decision §3): batched from the
  // backend's `SubprofileFollowersService.loadFollowerCountsFor` in the
  // directory list path (ONE grouped query, never per-card) — mirrors
  // `socialCount`/`tags`.
  followerCount: number;
}

/** Publish failure body (HTTP 422). */
export interface PublishUnmetDTO {
  unmet: string[];
}

export interface CreateSubprofileDTO {
  // kind + displayName required. The backend derives the slug server-side (it
  // rejects a `slug` on create); rename the address afterwards via PATCH.
  kind: SubprofileKind;
  displayName: string; // 1–120 chars; callers fall back to the kind label
}

export interface UpdateSubprofileDTO {
  // all optional; PATCH semantics
  displayName?: string;
  slug?: string; // per-owner unique (linked URL)
  handle?: string | null; // desired handle, or null to clear (validated on publish)
  avatarUrl?: string | null;
  tagline?: string | null;
  bio?: string | null;
  coverUrl?: string | null;
  skinData?: SkinData | null;
  accent?: string | null;
  availability?: string | null;
  ctaLabel?: string | null;
  ctaUrl?: string | null;
  linkVisibility?: LinkVisibility;
  visibility?: Visibility;
  position?: number;
}

export interface SubprofileItemInputDTO {
  // section comes from the URL, not the body
  title: string;
  subtitle?: string;
  description?: string;
  url?: string;
  imageUrl?: string;
  date?: string;
  meta?: string;
  tags?: string[];
  isFeatured?: boolean;
  collaborators?: string[]; // handles, resolved server-side on read
  venue?: string;
  doors?: string;
  ticketUrl?: string;
  gigState?: GigState;
  medium?: string;
  dimensions?: string;
  edition?: string;
  workState?: WorkState;
  structured?: ItemStructured;
}

/** One co-owner of a shared persona. Identical to the backend `MemberView`
 *  (`GET /subprofiles/:id/members`). */
export interface MemberDTO {
  userId: string;
  name: string;
  slug: string;
  avatarUrl: string | null;
  joinedAt: string;
  isCreator: boolean;
}

/** A pending/resolved co-owner invite, keyed to the persona ("outgoing" from the
 *  persona's side). Identical to the backend `InviteView`
 *  (`GET /subprofiles/:id/invites`, `POST /subprofiles/:id/invites`). */
export interface PersonaInviteDTO {
  id: string;
  subprofileId: string;
  invitedUserId: string;
  invitedByUserId: string;
  status: "pending" | "accepted" | "declined" | "revoked";
  createdAt: string;
  invitedName: string;
  invitedSlug: string;
  invitedAvatarUrl: string | null;
}

/** A pending invite from the invited member's own side ("incoming"). Identical
 *  to the backend `MyInviteView` (`GET /subprofiles/invites/mine`). */
export interface MyInviteDTO {
  id: string;
  subprofileId: string;
  personaName: string;
  personaAvatarUrl: string | null;
  invitedByName: string;
  createdAt: string;
  /** Drives the accept-confirmation disclosure (IDN-2): an Unlinked persona
   *  is pseudonymous, so accepting is the moment the invitee's real identity
   *  first becomes visible to its other co-owners. */
  linkVisibility: LinkVisibility;
}

// ── Endpoint fns (contract C4) ───────────────────────────────────────────────

// Read helpers below accept an optional trailing `signal`, forwarded to
// `apiGet`'s 4th positional arg (`apiGet(path, timeoutMs?, validate?, signal?)`).
// React Query passes a `signal` into every `queryFn` that fires on unmount /
// query-key change / navigation, so wiring it through cancels the underlying
// fetch (not just react-query's bookkeeping) when a user walks away mid-flight.

/** Linked + published personas of a member (their public main-profile "Also as…"). */
export const getProfileSubprofiles = (slug: string, signal?: AbortSignal) =>
  apiGet<SubprofilePublicDTO[]>(
    `/profiles/${slug}/subprofiles`,
    undefined,
    undefined,
    signal,
  );

/** Single-item public fetch of a linked persona by owner slug + persona slug
 *  (the nested `/members/:slug/:subslug` route) — Phase 1b. Unlike the bulk
 *  `getProfileSubprofiles` list above (which can only ever return personas
 *  that are already viewable, with no room to carry one item's restricted
 *  signal), this resolves the SAME `resolvePublicAccess` contract as
 *  `getSubprofileByHandle`: 200 full DTO / 403 `{restrictedState}` / 404. */
export const getSubprofileBySlugForProfile = (
  slug: string,
  subslug: string,
  signal?: AbortSignal,
) =>
  apiGet<SubprofilePublicDTO>(
    `/profiles/${slug}/subprofiles/${subslug}`,
    undefined,
    undefined,
    signal,
  );

/** The current owner's subprofiles, all statuses. */
export const getMySubprofiles = (signal?: AbortSignal) =>
  apiGet<SubprofileDTO[]>("/subprofiles/mine", undefined, undefined, signal);

/** Create a draft subprofile. */
export const createSubprofile = (dto: CreateSubprofileDTO) =>
  apiPost<SubprofileDTO>("/subprofiles", dto);

/** Owner fetch of a single subprofile (for editing). */
export const getSubprofile = (id: string, signal?: AbortSignal) =>
  apiGet<SubprofileDTO>(`/subprofiles/${id}`, undefined, undefined, signal);

/** Update subprofile meta (PATCH semantics). */
export const updateSubprofile = (id: string, dto: UpdateSubprofileDTO) =>
  apiPatch<SubprofileDTO>(`/subprofiles/${id}`, dto);

/** Fully replace the items of one section (section comes from the URL). */
export const replaceSubprofileSection = (
  id: string,
  section: SubprofileSection,
  items: SubprofileItemInputDTO[],
) => apiPut<SubprofileDTO>(`/subprofiles/${id}/sections/${section}`, { items });

/** Fully replace a persona's social links. */
export const replaceSocialLinks = (id: string, items: SocialLinkDTO[]) =>
  apiPut<SubprofileDTO>(`/subprofiles/${id}/social-links`, { items });

/** Fully replace a persona's event/community affiliations ("Part of"). */
export const replaceAffiliations = (id: string, items: AffiliationInputDTO[]) =>
  apiPut<SubprofileDTO>(`/subprofiles/${id}/affiliations`, { items });

/** Validate + publish. Rejects with an ApiError(422) whose body is PublishUnmetDTO. */
export const publishSubprofile = (id: string) =>
  apiPost<SubprofileDTO>(`/subprofiles/${id}/publish`);

/** Revert to draft (nulls the handle when unlinked). */
export const unpublishSubprofile = (id: string) =>
  apiPost<SubprofileDTO>(`/subprofiles/${id}/unpublish`);

/** Delete a subprofile. */
export const deleteSubprofile = (id: string) =>
  apiDelete<{ ok: true }>(`/subprofiles/${id}`);

/** Public fetch of a standalone (unlinked) persona by its global handle. */
export const getSubprofileByHandle = (handle: string, signal?: AbortSignal) =>
  apiGet<SubprofilePublicDTO>(
    `/subprofiles/by-handle/${handle}`,
    undefined,
    undefined,
    signal,
  );

/** One page of the standalone-persona directory. The backend defaults `limit`
 *  to 40 and caps it at 100, and returns `total` (the full standalone count)
 *  alongside the page slice — so a caller can reconstruct the COMPLETE set by
 *  walking pages until it has `total` rows (see `useSubprofileDirectory`). */
export interface SubprofileDirectoryPage {
  items: SubprofileCardDTO[];
  total: number;
  page: number;
  limit: number;
}

/** One page of the standalone-persona directory. Personas redesign Phase 4
 *  filters family/tags/search CLIENT-SIDE, so this sends no `query` param —
 *  only paging (`page`/`limit`), which `useSubprofileDirectory` uses to pull
 *  the whole set at `limit=100`. Optionally forwards `kind` for kind-scoped
 *  directories (e.g. the therapist directory), so the server can filter. */
export const getSubprofileDirectory = (
  params: { page?: number; limit?: number; kind?: string } = {},
  signal?: AbortSignal,
) => {
  const q = new URLSearchParams();
  if (params.page !== undefined) q.set("page", String(params.page));
  if (params.limit !== undefined) q.set("limit", String(params.limit));
  if (params.kind) q.set("kind", params.kind);
  const qs = q.toString();
  return apiGet<SubprofileDirectoryPage>(
    `/subprofiles/directory${qs ? `?${qs}` : ""}`,
    undefined,
    undefined,
    signal,
  );
};

/** Endorse a published persona (one-tap + optional note). Keyed on the
 *  persona's non-identifying `id`, not its slug/handle. */
export const endorseSubprofile = (id: string, note?: string) =>
  apiPost<{ endorsementCount: number; viewerEndorsed: boolean }>(
    `/subprofiles/${id}/endorse`,
    note ? { note } : {},
  );

/** Withdraw the current member's endorsement of a persona. */
export const withdrawEndorsement = (id: string) =>
  apiDelete<{ endorsementCount: number; viewerEndorsed: boolean }>(
    `/subprofiles/${id}/endorse`,
  );

/** List a persona's active endorsers (newest first, capped server-side). */
export const getEndorsers = (id: string, signal?: AbortSignal) =>
  apiGet<{ count: number; endorsers: EndorserDTO[] }>(
    `/subprofiles/${id}/endorsements`,
    undefined,
    undefined,
    signal,
  );

/** The current viewer's own endorsement of a persona — the lazy prefill for the
 *  edit-mode endorse modal (`viewerEndorsed` + the note they last saved). Keyed
 *  on the persona's non-identifying `id`, never slug/handle. */
export interface MyEndorsementDTO {
  viewerEndorsed: boolean;
  note: string | null;
}
export const getMyEndorsement = (id: string, signal?: AbortSignal) =>
  apiGet<MyEndorsementDTO>(
    `/subprofiles/${id}/endorsement/mine`,
    undefined,
    undefined,
    signal,
  );

/** Follow a published persona (one-way, instant, count-only). Keyed on the
 *  persona's non-identifying `id`, not its slug/handle. */
export const followSubprofile = (id: string) =>
  apiPost<{ followerCount: number; viewerFollowing: boolean }>(
    `/subprofiles/${id}/follow`,
    {},
  );

/** Unfollow a persona the current member is following. */
export const unfollowSubprofile = (id: string) =>
  apiDelete<{ followerCount: number; viewerFollowing: boolean }>(
    `/subprofiles/${id}/follow`,
  );

/** List a persona's followers (newest first, capped server-side). OWNER-ONLY:
 *  the backend returns 403 for anyone who isn't a co-owner, so this must never
 *  be called unless the viewer is a member (`SubprofilePublicDTO.viewerIsMember`).
 *  Following is otherwise anonymity-preserving — everyone else only ever sees
 *  the count + their own following toggle, never who else is here. Keyed on the
 *  persona's non-identifying `id`, never slug/handle. */
export const getFollowers = (id: string, signal?: AbortSignal) =>
  apiGet<{ count: number; followers: FollowerDTO[] }>(
    `/subprofiles/${id}/followers`,
    undefined,
    undefined,
    signal,
  );

// ── Co-ownership (contract C6) ───────────────────────────────────────────────

/** List a persona's co-owners (creator + accepted invitees). */
export const listSubprofileMembers = (id: string, signal?: AbortSignal) =>
  apiGet<MemberDTO[]>(`/subprofiles/${id}/members`, undefined, undefined, signal);

/** Invite another member to co-own this persona. Addressed by the invitee's
 *  profile SLUG (the repo convention — mirrors `recipientHandle` /
 *  `memberHandles` in messaging), resolved to a userId server-side. */
export const inviteCoOwner = (id: string, slug: string) =>
  apiPost<PersonaInviteDTO>(`/subprofiles/${id}/invites`, { slug });

/** List a persona's outstanding/resolved co-owner invites. */
export const listSubprofileInvites = (id: string, signal?: AbortSignal) =>
  apiGet<PersonaInviteDTO[]>(
    `/subprofiles/${id}/invites`,
    undefined,
    undefined,
    signal,
  );

/** Revoke a pending co-owner invite. */
export const revokeSubprofileInvite = (id: string, inviteId: string) =>
  apiDelete<{ ok: true }>(`/subprofiles/${id}/invites/${inviteId}`);

/** Leave a persona the current member co-owns (never the sole creator). */
export const leaveSubprofile = (id: string) =>
  apiDelete<{ ok: true }>(`/subprofiles/${id}/members/me`);

/**
 * Remove another co-owner from a persona, addressed by their profile SLUG
 * (the repo convention for member-addressed routes). Creator-only server-side;
 * the creator can't remove themselves this way (that's delete, or leave).
 * Without this the creator's only recourse against a co-owner who turned
 * hostile was deleting the whole persona.
 */
export const removeSubprofileMember = (id: string, slug: string) =>
  apiDelete<{ ok: true }>(
    `/subprofiles/${id}/members/${encodeURIComponent(slug)}`,
  );

/** The current member's own incoming co-owner invites, across all personas. */
export const listMyPersonaInvites = (signal?: AbortSignal) =>
  apiGet<MyInviteDTO[]>(
    "/subprofiles/invites/mine",
    undefined,
    undefined,
    signal,
  );

/** Accept an incoming co-owner invite. */
export const acceptPersonaInvite = (inviteId: string) =>
  apiPost<{ ok: true }>(`/subprofiles/invites/${inviteId}/accept`);

/** Decline an incoming co-owner invite. */
export const declinePersonaInvite = (inviteId: string) =>
  apiPost<{ ok: true }>(`/subprofiles/invites/${inviteId}/decline`);
