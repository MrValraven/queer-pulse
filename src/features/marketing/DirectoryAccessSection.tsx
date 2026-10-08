import { useTranslation } from "../../shared/i18n/useTranslation";
import { type DirectoryPlace } from "./directoryPlaces";
import { DirectoryAccess } from "./DirectoryAccess";
import { accessibilityLabelIds } from "./directoryAccessibilityLabels";
import { DirectoryAccessibilityAnswers } from "./DirectoryAccessibilityAnswers";
import { DirectoryLanguages } from "./DirectoryLanguages";
import {
  accessibilityQuestionsFor,
  listingAnswerOf,
  ONLINE_ACCESSIBILITY_QUESTION_SLUGS,
} from "./listBusiness/listingAccessibility.data";
import { listingKindOf } from "./listBusiness/listingMobile.data";
import s from "./DirectorySpacePage.module.css";

// A listing that switched from place to out-and-about keeps its stored toilet
// chips; they stay stored and stay out of the legacy row.
const TOILET_CHIP_IDS = ["Gender-neutral toilets", "Accessible bathroom"];

function withoutToiletChips(place: DirectoryPlace): DirectoryPlace {
  return {
    ...place,
    goodFor: place.goodFor.filter(
      (item) => !TOILET_CHIP_IDS.includes(item.label),
    ),
  };
}

/**
 * "Can I get in, and can I be understood": the venue's accessibility answers,
 * plus the languages spoken.
 *
 * Both facts used to be single grey rows buried at the bottom of the aside's
 * contact card, below the phone number. For a wheelchair user, or someone who
 * needs to know a place is quiet, that is not a footnote: it decides whether
 * the rest of the page is worth reading. They get a heading of their own here,
 * directly after the description.
 *
 * The structured answers (`place.accessibility`) are the section's real
 * content and lead it: six fixed questions, each answered yes, no, or not yet
 * told, with the owner's own note above them. They are kept apart from the
 * atmosphere tags in `goodFor` (dog-friendly, solo-friendly and the like),
 * which stay in "What this place offers" where every entry is a positive
 * claim. `DirectoryAccess` below is the legacy row, still rendered for a row
 * written before the structured answers existed.
 *
 * An online-only business (`place.online`) answers the four online questions
 * (image descriptions, captions, size-inclusive ranges, plain language),
 * since the six above are all about a building, and it never shows the
 * legacy row. Once it has answered any of the four, or written a note, the
 * section shows those four answers under an "online access" heading. Until
 * then it shows its languages alone under a languages heading: four "not yet
 * told" rows would read as gaps the owner left.
 *
 * An out-and-about business (`place.mobile`) has no building either, so it
 * shows four of the place answers worded for a route and a meeting spot
 * (`MOBILE_ACCESSIBILITY_QUESTIONS`), under a "joining in" heading. The
 * toilet answers stay stored and stay out of view.
 *
 * Renders nothing at all when the listing declares none of the three, which is
 * most demo fixtures, and nothing for an online listing that has answered no
 * online question and names no languages. An empty heading would read as "we
 * checked and there is nothing", which is a different and untrue claim.
 */
export function DirectoryAccessSection({ place }: { place: DirectoryPlace }) {
  const { t } = useTranslation();
  const kind = listingKindOf(place);
  const isOnline = kind === "online";
  // An online listing shows its four online answers once it has given any of
  // them (or a note); four "not told yet" rows would read as gaps the owner
  // left, so a silent one shows its languages alone.
  const onlineAnswers = ONLINE_ACCESSIBILITY_QUESTION_SLUGS.map((slug) =>
    place.accessibility
      ? listingAnswerOf(place.accessibility.answers, slug)
      : "unknown",
  );
  const hasOnlineAccessibility =
    isOnline &&
    place.accessibility !== undefined &&
    (onlineAnswers.some((answer) => answer !== "unknown") ||
      (place.accessibility.note ?? "").trim() !== "");
  const accessibility = isOnline
    ? hasOnlineAccessibility
      ? place.accessibility
      : undefined
    : place.accessibility;
  const hasAccessHighlights =
    !isOnline && accessibilityLabelIds(place).length > 0;
  const hasLanguages = (place.langs?.length ?? 0) > 0;
  if (!accessibility && !hasAccessHighlights && !hasLanguages) return null;
  const headingKey = isOnline
    ? hasOnlineAccessibility
      ? "marketing:directory.detail.accessTitleOnline"
      : "marketing:directory.detail.languagesTitle"
    : kind === "mobile"
      ? "marketing:directory.detail.accessTitleMobile"
      : "marketing:directory.detail.accessTitle";

  return (
    <section className={s.sec}>
      <h2>{t(headingKey)}</h2>
      <p className={s.subLine}>
        {t("marketing:directory.detail.accessSub", { name: place.owner.first })}
      </p>
      {accessibility && (
        <DirectoryAccessibilityAnswers
          accessibility={accessibility}
          ownerFirstName={place.owner.first}
          questions={accessibilityQuestionsFor(kind)}
        />
      )}
      <div className={s.accessRows}>
        {!isOnline && (
          <DirectoryAccess
            place={kind === "mobile" ? withoutToiletChips(place) : place}
          />
        )}
        <DirectoryLanguages langs={place.langs} />
      </div>
    </section>
  );
}
