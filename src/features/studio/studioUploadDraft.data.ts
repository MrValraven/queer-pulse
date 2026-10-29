import type {
  StudioArtistRefView,
  StudioReleaseView,
} from "./api/studio.adapters";
import type { StudioPriceView } from "./api/studioPurchases.adapters";
import {
  centsFromEuroText,
  euroTextFromCents,
  isSellableReleaseType,
  priceErrorKeyOf,
} from "./studioPurchaseRules";
import { defaultGenresForKind, knownGenresOf } from "./studioUploadGenres.data";
import {
  STUDIO_BUY_URL_MAX,
  STUDIO_FORMAT_BY_KIND,
  STUDIO_LIMITS,
  STUDIO_RELEASE_TYPES_BY_KIND,
  type StudioArtistPersonaKind,
  type StudioFormat,
  type StudioGenre,
  type StudioMood,
  type StudioPriceInput,
  type StudioPriceMode,
  type StudioReleaseType,
  type UpdateStudioReleaseBody,
} from "./api/studio.types";

export type UploadStepId = "release" | "tracks" | "publish";

/** The price control's mode: the two sale modes, or no price. */
export type StudioPriceFormMode = "not_for_sale" | StudioPriceMode;

export interface ReleaseFormValues {
  subprofileId: string;
  type: StudioReleaseType;
  title: string;
  /** Up to STUDIO_RELEASE_GENRES_MAX, the first leads. */
  genres: StudioGenre[];
  /** Discovery: "" for none. */
  mood: StudioMood | "";
  /** Discovery: the scene id, "" for none. */
  sceneId: string;
  /** "" or YYYY-MM-DD. Empty defaults to the publish date server-side. */
  releasedOn: string;
  description: string;
  /** A cover picked this session; null keeps the saved one. */
  coverKey: string | null;
  /** Studio v3: "" or an https link to buy the release. */
  buyUrl: string;
  /** Play the tracks straight on, without a crossfade between them. */
  isGapless: boolean;
  /** Studio purchases: how the release sells; a new release is not for sale. */
  priceMode: StudioPriceFormMode;
  /** The fixed price or the minimum as typed; "" while not for sale. */
  priceText: string;
}

export { defaultGenresForKind };

export interface ReleaseFieldCopy {
  titleLabelKey: string;
  descriptionLabelKey: string;
  /** Genre, mood and scene; a show carries none (spec 6.1). */
  isGenreShown: boolean;
}

export function releaseFieldCopyOf(format: StudioFormat): ReleaseFieldCopy {
  return format === "podcast"
    ? {
        titleLabelKey: "studio:uploadFlow.release.showNameLabel",
        descriptionLabelKey: "studio:uploadFlow.release.showAboutLabel",
        isGenreShown: false,
      }
    : {
        titleLabelKey: "studio:upload.metadata.field.title",
        descriptionLabelKey: "studio:uploadFlow.release.descriptionLabel",
        isGenreShown: true,
      };
}

/** The fields a persona switch resets: its first type, its genre preset (a
 *  spoken word persona's, or none when leaving one), and an empty genre list,
 *  mood and scene for a show, which carries none of them. A show also
 *  plays with gaps between its episodes, so the gapless mark turns off. */
export function personaSwitchPatch(
  kind: StudioArtistPersonaKind,
  current: ReleaseFormValues,
): Pick<
  ReleaseFormValues,
  | "type"
  | "genres"
  | "mood"
  | "sceneId"
  | "isGapless"
  | "priceMode"
  | "priceText"
> {
  const isGenreShown = releaseFieldCopyOf(
    STUDIO_FORMAT_BY_KIND[kind],
  ).isGenreShown;
  const presetGenres = defaultGenresForKind(kind);
  let genres = current.genres;
  if (!isGenreShown) genres = [];
  else if (presetGenres.length > 0) genres = presetGenres;
  else genres = genres.filter((genre) => genre !== "spoken-word");
  const type = STUDIO_RELEASE_TYPES_BY_KIND[kind][0] ?? "album";
  return {
    type,
    genres,
    mood: isGenreShown ? current.mood : "",
    sceneId: isGenreShown ? current.sceneId : "",
    isGapless: isGenreShown ? current.isGapless : false,
    ...priceFieldsForType(type, current),
  };
}

/** A type with nothing to sell leaves no price behind: the price fields keep
 *  their values for a sellable type and reset to not for sale otherwise. */
export function priceFieldsForType(
  type: StudioReleaseType,
  current: Pick<ReleaseFormValues, "priceMode" | "priceText">,
): Pick<ReleaseFormValues, "priceMode" | "priceText"> {
  return isSellableReleaseType(type)
    ? { priceMode: current.priceMode, priceText: current.priceText }
    : { priceMode: "not_for_sale", priceText: "" };
}

export function defaultReleaseForm(
  persona: StudioArtistRefView | undefined,
): ReleaseFormValues {
  return {
    subprofileId: persona?.id ?? "",
    type: persona
      ? (STUDIO_RELEASE_TYPES_BY_KIND[persona.kind][0] ?? "album")
      : "album",
    title: "",
    genres: defaultGenresForKind(persona?.kind),
    mood: "",
    sceneId: "",
    releasedOn: "",
    description: "",
    coverKey: null,
    buyUrl: "",
    isGapless: false,
    priceMode: "not_for_sale",
    priceText: "",
  };
}

/** A stored price as the form shows it: the amount reads back with the
 *  member's own separator. */
export function priceFormOf(
  price: StudioPriceView | null,
  decimalSeparator: "." | ",",
): { priceMode: StudioPriceFormMode; priceText: string } {
  if (!price) return { priceMode: "not_for_sale", priceText: "" };
  return {
    priceMode: price.mode,
    priceText: euroTextFromCents(price.amountCents, decimalSeparator),
  };
}

/** The form's price as the PATCH body carries it: null takes the release off
 *  sale, "invalid" when the typed amount is unreadable. */
export function priceInputOf(
  priceMode: StudioPriceFormMode,
  priceText: string,
): StudioPriceInput | null | "invalid" {
  if (priceMode === "not_for_sale") return null;
  const amountCents = centsFromEuroText(priceText);
  return amountCents === null ? "invalid" : { mode: priceMode, amountCents };
}

export function formFromRelease(release: StudioReleaseView): ReleaseFormValues {
  return {
    subprofileId: release.artist.id,
    type: release.type,
    title: release.title,
    genres: knownGenresOf(release),
    mood: release.mood ?? "",
    sceneId: release.sceneId ?? "",
    releasedOn: release.releasedOn ?? "",
    description: release.description ?? "",
    coverKey: null,
    buyUrl: release.buyUrl ?? "",
    isGapless: release.isGapless,
    ...priceFormOf(release.price, "."),
  };
}

const isHttpsLink = (value: string) => {
  if (!/^https:\/\//i.test(value)) return false;
  try {
    return Boolean(new URL(value).hostname);
  } catch {
    return false;
  }
};

export function releaseFormErrors(form: ReleaseFormValues): {
  title?: string;
  description?: string;
  buyUrl?: string;
  price?: string;
} {
  const errors: {
    title?: string;
    description?: string;
    buyUrl?: string;
    price?: string;
  } = {};
  const title = form.title.trim();
  if (title.length === 0)
    errors.title = "studio:uploadFlow.release.titleRequired";
  else if (title.length > STUDIO_LIMITS.titleMax)
    errors.title = "studio:uploadFlow.release.titleTooLong";
  if (form.description.length > STUDIO_LIMITS.descriptionMax) {
    errors.description = "studio:uploadFlow.release.descriptionTooLong";
  }
  const buyUrl = form.buyUrl.trim();
  if (buyUrl.length > STUDIO_BUY_URL_MAX)
    errors.buyUrl = "studio:uploadFlow.v3.buyUrlTooLong";
  else if (buyUrl && !isHttpsLink(buyUrl))
    errors.buyUrl = "studio:uploadFlow.v3.buyUrlHttpsOnly";
  if (form.priceMode !== "not_for_sale") {
    // An unreadable amount always names its reason, whatever the mode.
    const priceErrorKey = isSellableReleaseType(form.type)
      ? (priceErrorKeyOf(form.priceMode, centsFromEuroText(form.priceText)) ??
        (centsFromEuroText(form.priceText) === null
          ? "studio:purchase.price.amountRequired"
          : null))
      : "studio:errors.reason.studio_release_type_not_for_sale";
    if (priceErrorKey) errors.price = priceErrorKey;
  }
  return errors;
}

/** Only what changed since the last save, trimmed, empties as null. Saved
 *  genres outside STUDIO_GENRES stay out of the form and stay saved until
 *  the list is edited; an edit sends the picked list alone. */
export function patchFromForm(
  form: ReleaseFormValues,
  release: StudioReleaseView,
): UpdateStudioReleaseBody {
  const body: UpdateStudioReleaseBody = {};
  const title = form.title.trim();
  if (title && title !== release.title) body.title = title;
  if (form.type !== release.type) body.type = form.type;
  const savedGenres = knownGenresOf(release);
  const hasGenresChanged =
    form.genres.length !== savedGenres.length ||
    form.genres.some((genre, index) => genre !== savedGenres[index]);
  if (hasGenresChanged) body.genres = form.genres;
  const mood = form.mood || null;
  if (mood !== release.mood) body.mood = mood;
  const sceneId = form.sceneId || null;
  if (sceneId !== release.sceneId) body.sceneId = sceneId;
  const releasedOn = form.releasedOn || null;
  if (releasedOn !== release.releasedOn) body.releasedOn = releasedOn;
  const description = form.description.trim() || null;
  const savedDescription = release.description?.trim() || null;
  if (description !== savedDescription) body.description = description;
  const trimmedBuyUrl = form.buyUrl.trim();
  const buyUrl = trimmedBuyUrl
    ? trimmedBuyUrl.replace(/^https:\/\//i, "https://")
    : null;
  if (buyUrl !== release.buyUrl) body.buyUrl = buyUrl;
  if (form.isGapless !== release.isGapless) body.isGapless = form.isGapless;
  const price = priceInputOf(form.priceMode, form.priceText);
  if (price !== "invalid") {
    const savedPrice = release.price ?? null;
    const isPriceChanged =
      price === null || savedPrice === null
        ? price !== savedPrice
        : price.mode !== savedPrice.mode ||
          price.amountCents !== savedPrice.amountCents;
    if (isPriceChanged) body.price = price;
  }
  if (form.coverKey) body.coverKey = form.coverKey;
  return body;
}
