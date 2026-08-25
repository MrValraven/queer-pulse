import type { IconType } from "react-icons";
import type { CropRect } from "../../../shared/components/ui/cropGeometry";
import type {
  AccentKey,
  AffiliationDTO,
  AvailabilityKey,
  CollaboratorDTO,
  GigState,
  ItemStructured,
  LinkVisibility,
  SkinData,
  SocialLinkDTO,
  SubprofileDTO,
  SubprofileItemDTO,
  SubprofileItemInputDTO,
  SubprofileKind,
  SubprofilePublicDTO,
  SubprofileSection,
  SubprofileStatus,
  Visibility,
  WorkState,
} from "./subprofiles.api";
import { SECTION_META, sectionsForKind } from "../subprofile-kinds";
import {
  ACCENT_OPTIONS,
  AVAILABILITY_OPTIONS,
} from "../subprofilePresence.data";

// ── Wire-value guards ────────────────────────────────────────────────────────
// `accent`/`availability` arrive as raw `string | null` on the DTO. Narrow them
// against the known key sets so an unexpected wire value falls back to `null`
// (the "unset" state components already handle) instead of being blindly cast.

const AVAILABILITY_KEYS: AvailabilityKey[] = AVAILABILITY_OPTIONS.map(
  (option) => option.value,
);

function isAccentKey(value: string | null): value is AccentKey {
  return value !== null && (ACCENT_OPTIONS as string[]).includes(value);
}

function isAvailabilityKey(value: string | null): value is AvailabilityKey {
  return value !== null && (AVAILABILITY_KEYS as string[]).includes(value);
}

// ── View models (what the pages/editor hold) ─────────────────────────────────

/** One item with nulls normalized to "" / [] so components render without guards. */
export interface SubprofileItemView {
  id: string;
  section: SubprofileSection;
  title: string;
  /** ISO 8601 first-published timestamp (item row creation on QueerPulse). */
  createdAt: string;
  subtitle: string;
  description: string;
  url: string;
  imageUrl: string;
  date: string;
  meta: string;
  tags: string[];
  isFeatured: boolean;
  collaborators: CollaboratorDTO[];
  venue: string | null;
  doors: string | null;
  ticketUrl: string | null;
  gigState: GigState | null;
  medium: string | null;
  dimensions: string | null;
  edition: string | null;
  workState: WorkState | null;
  structured: ItemStructured | null;
}

/** A section grouped for rendering/editing: its metadata + ordered items.
 *  `labelKey` (not a resolved string) is i18n label-key indirection — `section`
 *  is the persisted canonical id, and the consuming component resolves the
 *  display label via `t(labelKey)`. */
export interface SubprofileSectionView {
  section: SubprofileSection;
  labelKey: string;
  icon: IconType;
  fields: Array<keyof SubprofileItemDTO>;
  items: SubprofileItemView[];
}

/** Owner-facing view model (from SubprofileDTO). */
export interface SubprofileView {
  id: string;
  kind: SubprofileKind;
  slug: string;
  handle: string | null;
  displayName: string;
  avatarUrl: string | null;
  /** Saved reframe crop for `avatarUrl` — the persona avatar editor's circle
   *  slot is a true square, so it's safe to render directly. */
  avatarCrop?: CropRect;
  tagline: string;
  bio: string;
  coverUrl: string | null;
  /** Saved reframe crop for `coverUrl`, passed to `ImageSlot`'s `focus` (never
   *  its `crop`): the banner's aspect changes per skin and per viewport, so the
   *  rect is honoured as a focal point rather than reproduced literally. */
  coverCrop?: CropRect;
  accent: AccentKey | null;
  availability: AvailabilityKey | null;
  ctaLabel: string;
  ctaUrl: string;
  socialLinks: SocialLinkDTO[];
  linkVisibility: LinkVisibility;
  visibility: Visibility;
  status: SubprofileStatus;
  position: number;
  sections: SubprofileSectionView[];
  featured: SubprofileItemView | null;
  affiliations: AffiliationDTO[];
  endorsementCount: number;
  followerCount: number;
  skinData: SkinData | null;
  /** Co-owner headcount (creator + accepted invitees) — see `SubprofileDTO.memberCount`.
   *  Never less than 1. Drives the dashboard `SideCard`'s co-owner meta, shown
   *  only when greater than 1. */
  memberCount: number;
}

/** Public view model (from SubprofilePublicDTO); owner fields only when linked. */
export interface PublicSubprofileView {
  id: string;
  kind: SubprofileKind;
  slug: string;
  handle: string | null;
  displayName: string;
  avatarUrl: string | null;
  tagline: string;
  bio: string;
  coverUrl: string | null;
  /** Saved reframe crop for `coverUrl`, passed to `ImageSlot`'s `focus` (never
   *  its `crop`): the banner's aspect changes per skin and per viewport, so the
   *  rect is honoured as a focal point rather than reproduced literally. */
  coverCrop?: CropRect;
  accent: AccentKey | null;
  availability: AvailabilityKey | null;
  ctaLabel: string;
  ctaUrl: string;
  socialLinks: SocialLinkDTO[];
  linkVisibility: LinkVisibility;
  /** Phase 1b: present on every public view now (mirrors the wire DTO).
   *  Only ever `"draft"` when the viewer is the owner/co-owner previewing
   *  their own unpublished persona — every other viewer only ever reaches
   *  an `"ok"` result with `status: "published"` (see `usePublicSubprofile`'s
   *  `resolvePublicAccess` mirroring). Drives `SubprofileDraftBanner`. */
  status: SubprofileStatus;
  ownerSlug?: string;
  ownerName?: string;
  sections: SubprofileSectionView[];
  featured: SubprofileItemView | null;
  affiliations: AffiliationDTO[];
  endorsementCount: number;
  viewerEndorsed: boolean;
  followerCount: number;
  viewerFollowing: boolean;
  /** Is the signed-in viewer a co-owner (creator or invited member) of THIS
   *  persona? Drives the "edit" affordance on a nested persona shown on a
   *  co-owner's profile (in addition to the owner's own `isSelf` view). */
  viewerIsMember: boolean;
  skinData: SkinData | null;
}

/** Per-persona owner-only metadata (status/visibility/position/id), threaded
 *  alongside a `PublicSubprofileView` in self view rather than merged into
 *  it — `PublicSubprofileView` has no `status`/`visibility`/`position` and
 *  giving it optional copies would blur which shape callers are holding.
 *  Built by `ProfileSubprofilesSection` from the raw owner `SubprofileView[]`
 *  and read by `SubprofileShowcase`/`SubprofileSwitchList`/`SubprofileFeatureCard`. */
export interface SubprofileOwnerMeta {
  id: string;
  status: SubprofileStatus;
  visibility: Visibility;
  position: number;
}

// ── DTO → view model ─────────────────────────────────────────────────────────

export function itemToView(dto: SubprofileItemDTO): SubprofileItemView {
  return {
    id: dto.id,
    section: dto.section,
    title: dto.title,
    createdAt: dto.createdAt,
    subtitle: dto.subtitle ?? "",
    description: dto.description ?? "",
    url: dto.url ?? "",
    imageUrl: dto.imageUrl ?? "",
    date: dto.date ?? "",
    meta: dto.meta ?? "",
    tags: dto.tags ?? [],
    isFeatured: dto.isFeatured ?? false,
    collaborators: dto.collaborators ?? [],
    venue: dto.venue ?? null,
    doors: dto.doors ?? null,
    ticketUrl: dto.ticketUrl ?? null,
    gigState: dto.gigState ?? null,
    medium: dto.medium ?? null,
    dimensions: dto.dimensions ?? null,
    edition: dto.edition ?? null,
    workState: dto.workState ?? null,
    structured: dto.structured ?? null,
  };
}

/** Find the single featured item across all sections (the backend enforces at
 *  most one); `null` when none. Not a wire field — computed from `items`. */
function findFeatured(items: SubprofileItemDTO[]): SubprofileItemView | null {
  const featured = items.find((item) => item.isFeatured);
  return featured ? itemToView(featured) : null;
}

/** Group a flat item list into per-section views, ordered by `sectionsForKind`.
 *  With `includeEmpty` (owner editor), every allowed section appears even with
 *  no items; without it (public view), empty sections are dropped. */
export function buildSections(
  items: SubprofileItemDTO[],
  kind: SubprofileKind,
  { includeEmpty = false }: { includeEmpty?: boolean } = {},
): SubprofileSectionView[] {
  return sectionsForKind(kind).flatMap((section) => {
    const meta = SECTION_META[section];
    const sectionItems = items
      .filter((i) => i.section === section)
      .map(itemToView);
    if (sectionItems.length === 0 && !includeEmpty) return [];
    return [
      {
        section,
        labelKey: meta.labelKey,
        icon: meta.icon,
        fields: meta.fields,
        items: sectionItems,
      },
    ];
  });
}

/** Map the owner-facing DTO to its view model (all allowed sections present). */
export function subprofileToView(dto: SubprofileDTO): SubprofileView {
  return {
    id: dto.id,
    kind: dto.kind,
    slug: dto.slug,
    handle: dto.handle,
    displayName: dto.displayName,
    avatarUrl: dto.avatarUrl,
    avatarCrop: dto.avatarCrop ?? undefined,
    tagline: dto.tagline ?? "",
    bio: dto.bio ?? "",
    coverUrl: dto.coverUrl,
    coverCrop: dto.coverCrop ?? undefined,
    accent: isAccentKey(dto.accent) ? dto.accent : null,
    availability: isAvailabilityKey(dto.availability) ? dto.availability : null,
    ctaLabel: dto.ctaLabel ?? "",
    ctaUrl: dto.ctaUrl ?? "",
    socialLinks: dto.socialLinks,
    linkVisibility: dto.linkVisibility,
    visibility: dto.visibility,
    status: dto.status,
    position: dto.position,
    sections: buildSections(dto.items, dto.kind, { includeEmpty: true }),
    featured: findFeatured(dto.items),
    affiliations: dto.affiliations ?? [],
    endorsementCount: dto.endorsementCount,
    followerCount: dto.followerCount,
    skinData: dto.skinData ?? null,
    memberCount: dto.memberCount ?? 1,
  };
}

/** Map the public DTO to its view model (empty sections dropped). */
export function publicSubprofileToView(
  dto: SubprofilePublicDTO,
): PublicSubprofileView {
  return {
    id: dto.id,
    kind: dto.kind,
    slug: dto.slug,
    handle: dto.handle,
    displayName: dto.displayName,
    avatarUrl: dto.avatarUrl,
    tagline: dto.tagline ?? "",
    bio: dto.bio ?? "",
    coverUrl: dto.coverUrl,
    coverCrop: dto.coverCrop ?? undefined,
    accent: isAccentKey(dto.accent) ? dto.accent : null,
    availability: isAvailabilityKey(dto.availability) ? dto.availability : null,
    ctaLabel: dto.ctaLabel ?? "",
    ctaUrl: dto.ctaUrl ?? "",
    socialLinks: dto.socialLinks,
    linkVisibility: dto.linkVisibility,
    status: dto.status,
    ...(dto.ownerSlug !== undefined ? { ownerSlug: dto.ownerSlug } : {}),
    ...(dto.ownerName !== undefined ? { ownerName: dto.ownerName } : {}),
    sections: buildSections(dto.items, dto.kind),
    featured: findFeatured(dto.items),
    affiliations: dto.affiliations ?? [],
    endorsementCount: dto.endorsementCount,
    viewerEndorsed: dto.viewerEndorsed,
    followerCount: dto.followerCount,
    viewerFollowing: dto.viewerFollowing,
    viewerIsMember: dto.viewerIsMember,
    skinData: dto.skinData ?? null,
  };
}

/** Adapt an owner (self-view) `SubprofileView` into the `PublicSubprofileView`
 *  shape `SubprofileShowcase`/`SubprofileFeatureCard` already know how to
 *  render, so self and public views share one rendering pipeline instead of
 *  a messy type merge. Owner-only fields (`status`/`visibility`/`position`)
 *  don't carry across here — they travel separately as `SubprofileOwnerMeta`
 *  (see `ProfileSubprofilesSection`). Viewer-relative fields the owner has no
 *  concept of *as a visitor* (endorsed/following) default to `false`; the
 *  card renders `isOwnerViewing` instead of reading these when self. */
export function ownerViewToShowcaseView(
  view: SubprofileView,
  selfOwnerSlug: string,
): PublicSubprofileView {
  return {
    id: view.id,
    kind: view.kind,
    slug: view.slug,
    handle: view.handle,
    displayName: view.displayName,
    avatarUrl: view.avatarUrl,
    tagline: view.tagline,
    bio: view.bio,
    coverUrl: view.coverUrl,
    coverCrop: view.coverCrop,
    accent: view.accent,
    availability: view.availability,
    ctaLabel: view.ctaLabel,
    ctaUrl: view.ctaUrl,
    socialLinks: view.socialLinks,
    linkVisibility: view.linkVisibility,
    status: view.status,
    ownerSlug: selfOwnerSlug,
    sections: view.sections,
    featured: view.featured,
    affiliations: view.affiliations,
    endorsementCount: view.endorsementCount,
    viewerEndorsed: false,
    followerCount: view.followerCount,
    viewerFollowing: false,
    // The signed-in owner is trivially a member of their own persona; the
    // showcase already renders edit controls via `isSelf` here, but keeping
    // this accurate avoids a silently-wrong flag on the shared view model.
    viewerIsMember: true,
    skinData: view.skinData,
  };
}

// ── Editor view model → section-replace input DTOs ───────────────────────────

/** Map one section's edited items to the `PUT /subprofiles/:id/sections/:section`
 *  `items` payload. `section` travels in the URL, not the body; empty optional
 *  fields are omitted (mirrors `workToDto`). Forwards the Phase-0 rich fields
 *  (venue/doors/ticketUrl/gigState/medium/dimensions/edition/workState/
 *  structured) unchanged so a section resave never silently drops them —
 *  the editor drawer (Phase 3) only sets a subset per section via
 *  `richFields.data.ts`, but every rich field a view item carries (incl. the
 *  nested `structured.courses`, not yet editable) round-trips here. */
export function itemsToInputDto(
  items: SubprofileItemView[],
): SubprofileItemInputDTO[] {
  return items.map((i) => ({
    title: i.title,
    ...(i.subtitle ? { subtitle: i.subtitle } : {}),
    ...(i.description ? { description: i.description } : {}),
    ...(i.url ? { url: i.url } : {}),
    ...(i.imageUrl ? { imageUrl: i.imageUrl } : {}),
    ...(i.date ? { date: i.date } : {}),
    ...(i.meta ? { meta: i.meta } : {}),
    ...(i.tags.length ? { tags: i.tags } : {}),
    ...(i.isFeatured ? { isFeatured: true } : {}),
    ...(i.collaborators.length
      ? {
          collaborators: i.collaborators.map(
            (collaborator) => collaborator.handle,
          ),
        }
      : {}),
    ...(i.venue ? { venue: i.venue } : {}),
    ...(i.doors ? { doors: i.doors } : {}),
    ...(i.ticketUrl ? { ticketUrl: i.ticketUrl } : {}),
    ...(i.gigState ? { gigState: i.gigState } : {}),
    ...(i.medium ? { medium: i.medium } : {}),
    ...(i.dimensions ? { dimensions: i.dimensions } : {}),
    ...(i.edition ? { edition: i.edition } : {}),
    ...(i.workState ? { workState: i.workState } : {}),
    ...(i.structured ? { structured: i.structured } : {}),
  }));
}
