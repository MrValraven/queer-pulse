import type { AvatarTint, ImageSlotTint } from "../../../shared/components/ui";
import { createFormatters, type Formatters } from "../../../shared/i18n/format";
import type { TFunction } from "../../../shared/i18n/types";
import type { Workshop, WorkshopTier } from "../workshops.data";
import type { WorkshopDraft } from "../addWorkshop.build";
import type {
  CreateWorkshopDto,
  WorkshopDTO,
  WorkshopTierDTO,
} from "./workshops.api";

// Same fallback shape jobs.adapters uses, for any caller not yet threading fmt.
const FALLBACK_FORMATTERS: Formatters = createFormatters("en");

const IMAGE_TINTS = new Set<string>(["default", "coral", "jade", "plum"]);
const AVATAR_TINTS = new Set<string>([
  "default",
  "coral",
  "jade",
  "plum",
  "auth",
]);

/**
 * How long a workshop still reads as "new" on the cards.
 *
 * DTO departure 3: `added` isn't stored, because every backend row is
 * member-posted — the flag would be true for all of them and mean nothing. The
 * backend stores `createdAt` instead and the client decides what counts as new,
 * which is a presentation question anyway.
 */
const NEW_FOR_DAYS = 14;

/** Was this posted recently enough to still carry the "New" badge? */
export function isRecentlyAdded(
  createdAt: string,
  now: number = Date.now(),
): boolean {
  const posted = new Date(createdAt).getTime();
  if (Number.isNaN(posted)) return false;
  return now - posted <= NEW_FOR_DAYS * 24 * 60 * 60 * 1000;
}

/**
 * Compose the one-line format summary ("Workshop · 6 weeks · group of 8").
 *
 * DTO departure 2: the backend does not store this sentence. It's chrome — a
 * translatable phrase assembled from `weeks` + `size` — and persisting the
 * rendered English would make it impossible to show a PT member a PT line. Both
 * the create flow (`addWorkshop.build.ts`) and the API adapter compose it here,
 * so the two can never drift.
 */
export function composeWorkshopFormat(
  weeks: number,
  size: number,
  t: TFunction,
): string {
  return t("economy:addWorkshop.build.format", {
    weeks: composeWeeksPhrase(weeks, t),
    size,
  });
}

/** "6 weeks" / "1 week" — pluralised through the catalog, reused for tags. */
export function composeWeeksPhrase(weeks: number, t: TFunction): string {
  return t("economy:addWorkshop.build.weeks", { count: weeks });
}

/** Numeric amount + currency → the display string. Zero reads as "Free". */
export function formatWorkshopAmount(
  amount: number,
  currency: string,
  t: TFunction,
  fmt: Formatters,
): string {
  if (!amount || amount <= 0) return t("economy:addWorkshop.build.free");
  return fmt.currency(amount, currency || "EUR");
}

function tierToTier(
  dto: WorkshopTierDTO,
  currency: string,
  t: TFunction,
  fmt: Formatters,
): WorkshopTier {
  return {
    label: dto.label,
    amount: formatWorkshopAmount(dto.amount, currency, t, fmt),
    ...(dto.sliding ? { sliding: true } : {}),
  };
}

/**
 * Map a `WorkshopDTO` onto the prototype's `Workshop` render shape.
 *
 * The three deliberate departures from the render shape are all handled here:
 *  1. `slug` becomes the FE's `id` — routes are `${routes.skills}/:id` and have
 *     always carried slug-shaped values, so nothing downstream changes.
 *  2. `format` is composed from `weeks`/`size` (see `composeWorkshopFormat`).
 *  3. `added` is derived from `createdAt` (see `isRecentlyAdded`).
 * Money (`price`, `tiers[].amount`) arrives numeric and is formatted here, the
 * same way `jobs.adapters.ts` formats pay.
 */
export function workshopDtoToWorkshop(
  dto: WorkshopDTO,
  t: TFunction,
  fmt: Formatters = FALLBACK_FORMATTERS,
  now: number = Date.now(),
): Workshop {
  const weeks = Math.max(1, dto.weeks || 1);
  const size = Math.max(1, dto.size || 1);
  const currency = dto.currency || "EUR";

  return {
    // Departure 1 — the backend's identifier is the slug.
    id: dto.slug,
    cat: dto.cat,
    title: dto.title,
    titleEm: dto.titleEm ?? "",
    // Departure 2 — composed, never stored.
    format: composeWorkshopFormat(weeks, size, t),
    mode: dto.mode,
    blurb: dto.blurb,
    heroPlaceholder:
      dto.heroPlaceholder ??
      t("economy:addWorkshop.build.heroPlaceholder", { title: dto.title }),
    heroTint:
      dto.heroTint && IMAGE_TINTS.has(dto.heroTint)
        ? (dto.heroTint as ImageSlotTint)
        : "default",
    spotsFilled: Math.max(0, dto.spotsFilled ?? 0),
    spotsTotal: size,
    price: formatWorkshopAmount(dto.price, currency, t, fmt),
    priceSub:
      dto.priceSub ??
      t("economy:addWorkshop.build.priceSub", {
        weeks: composeWeeksPhrase(weeks, t),
      }),
    startDate: dto.startDate ?? t("economy:addWorkshop.build.startDateTba"),
    cancellation:
      dto.cancellation ?? t("economy:addWorkshop.build.cancellation"),
    tiers: (dto.tiers ?? []).map((tier) => tierToTier(tier, currency, t, fmt)),
    about: dto.about ?? [],
    sessions: dto.sessions ?? [],
    needs: dto.needs ?? [],
    pastWork: dto.pastWork ?? [],
    tutor: {
      name: dto.tutor?.name ?? "",
      initials: dto.tutor?.initials ?? "",
      tint:
        dto.tutor?.tint && AVATAR_TINTS.has(dto.tutor.tint)
          ? (dto.tutor.tint as AvatarTint)
          : "default",
      role: dto.tutor?.role ?? "",
      ...(dto.tutor?.memberSlug ? { memberSlug: dto.tutor.memberSlug } : {}),
    },
    location: dto.location ?? { name: "", address: "", access: "" },
    tags: dto.tags ?? [],
    // Departure 3 — derived from createdAt, not read off the wire.
    added: isRecentlyAdded(dto.createdAt, now),
    // The editable truth behind the formatted strings above, so the edit form
    // can be seeded without re-parsing "€180" or "Workshop · 6 weeks · …".
    source: {
      weeks,
      size,
      price: dto.price ?? 0,
      currency,
      venue: dto.location?.name ?? "",
    },
    isHost: dto.isHost === true,
  };
}

/**
 * Map the "List a workshop" form draft onto the create DTO.
 *
 * Only the stored fields travel: no `format` sentence (composed client-side) and
 * no `added` flag (the server knows every row is member-posted). `price` goes as
 * a number with its currency, never as "€150". The same clamps the demo builder
 * applies are applied here, so a live listing and a demo one accept the same
 * inputs.
 */
export function workshopDraftToCreateDto(
  draft: WorkshopDraft,
  currency = "EUR",
): CreateWorkshopDto {
  const about = draft.about
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean);
  return {
    title: draft.title.trim(),
    blurb: draft.blurb.trim(),
    about: about.length > 0 ? about : [draft.about.trim()],
    cat: draft.cat,
    mode: draft.mode,
    weeks: Math.max(1, Math.min(52, Number(draft.weeks) || 1)),
    size: Math.max(2, Math.min(40, Number(draft.size) || 2)),
    price: Math.max(0, Number(draft.price) || 0),
    currency,
    venue: draft.venue.trim() || undefined,
  };
}

/**
 * The inverse of `workshopDraftToCreateDto`: seed the listing form from a
 * workshop that already exists, so "Edit" reuses `AddWorkshopModal` rather than
 * growing a second form.
 *
 * Everything numeric comes off `workshop.source` — never off the rendered
 * strings, which are translated and currency-formatted for the viewer and would
 * not survive a round trip. `titleEm` is deliberately left out: `CreateWorkshopDto`
 * has no field for it, so PATCH cannot change it and folding it into `title`
 * here would silently rewrite the headline on the first save.
 */
export function workshopToDraft(workshop: Workshop): WorkshopDraft {
  return {
    title: workshop.title,
    blurb: workshop.blurb,
    // `about` is stored as paragraphs and edited as one textarea — the exact
    // split `workshopDraftToCreateDto` performs, run backwards.
    about: workshop.about.join("\n\n"),
    cat: workshop.cat,
    mode: workshop.mode,
    weeks: String(workshop.source.weeks),
    size: String(workshop.source.size),
    price: String(workshop.source.price),
    venue: workshop.source.venue,
  };
}
