import type { IconType } from "react-icons";
import type {
  AccentKey,
  AffiliationDTO,
  AvailabilityKey,
  LinkVisibility,
  SocialLinkDTO,
  SubprofileDTO,
  SubprofileItemDTO,
  SubprofileItemInputDTO,
  SubprofileKind,
  SubprofilePublicDTO,
  SubprofileSection,
  SubprofileStatus,
  Visibility,
} from "./subprofiles.api";
import { SECTION_META, sectionsForKind } from "../subprofile-kinds";

// ── View models (what the pages/editor hold) ─────────────────────────────────

/** One item with nulls normalized to "" / [] so components render without guards. */
export interface SubprofileItemView {
  section: SubprofileSection;
  title: string;
  subtitle: string;
  description: string;
  url: string;
  imageUrl: string;
  date: string;
  meta: string;
  tags: string[];
  isFeatured: boolean;
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
  tagline: string;
  bio: string;
  coverUrl: string | null;
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
  accent: AccentKey | null;
  availability: AvailabilityKey | null;
  ctaLabel: string;
  ctaUrl: string;
  socialLinks: SocialLinkDTO[];
  linkVisibility: LinkVisibility;
  ownerSlug?: string;
  ownerName?: string;
  sections: SubprofileSectionView[];
  featured: SubprofileItemView | null;
  affiliations: AffiliationDTO[];
  endorsementCount: number;
  viewerEndorsed: boolean;
  followerCount: number;
  viewerFollowing: boolean;
}

// ── DTO → view model ─────────────────────────────────────────────────────────

function itemToView(dto: SubprofileItemDTO): SubprofileItemView {
  return {
    section: dto.section,
    title: dto.title,
    subtitle: dto.subtitle ?? "",
    description: dto.description ?? "",
    url: dto.url ?? "",
    imageUrl: dto.imageUrl ?? "",
    date: dto.date ?? "",
    meta: dto.meta ?? "",
    tags: dto.tags ?? [],
    isFeatured: dto.isFeatured ?? false,
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
    tagline: dto.tagline ?? "",
    bio: dto.bio ?? "",
    coverUrl: dto.coverUrl,
    accent: dto.accent as AccentKey | null,
    availability: dto.availability as AvailabilityKey | null,
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
    accent: dto.accent as AccentKey | null,
    availability: dto.availability as AvailabilityKey | null,
    ctaLabel: dto.ctaLabel ?? "",
    ctaUrl: dto.ctaUrl ?? "",
    socialLinks: dto.socialLinks,
    linkVisibility: dto.linkVisibility,
    ...(dto.ownerSlug !== undefined ? { ownerSlug: dto.ownerSlug } : {}),
    ...(dto.ownerName !== undefined ? { ownerName: dto.ownerName } : {}),
    sections: buildSections(dto.items, dto.kind),
    featured: findFeatured(dto.items),
    affiliations: dto.affiliations ?? [],
    endorsementCount: dto.endorsementCount,
    viewerEndorsed: dto.viewerEndorsed,
    followerCount: dto.followerCount,
    viewerFollowing: dto.viewerFollowing,
  };
}

// ── Editor view model → section-replace input DTOs ───────────────────────────

/** Map one section's edited items to the `PUT /subprofiles/:id/sections/:section`
 *  `items` payload. `section` travels in the URL, not the body; empty optional
 *  fields are omitted (mirrors `workToDto`). */
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
  }));
}
