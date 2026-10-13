import { useTranslation } from "../../shared/i18n/useTranslation";
import { type DirectoryPlace } from "./directoryPlaces";
import { DirectoryAccessibilityAnswers } from "./DirectoryAccessibilityAnswers";
import {
  accessibilityQuestionsFor,
  listingAnswerOf,
  ONLINE_ACCESSIBILITY_QUESTION_SLUGS,
} from "./listBusiness/listingAccessibility.data";
import { listingKindOf } from "./listBusiness/listingMobile.data";
import s from "./DirectorySpacePage.module.css";

/**
 * "Can I get in": the venue's structured accessibility answers, with the
 * owner's own note above them. An online listing shows its four online
 * answers once it has given any. The languages moved to "Getting in" on
 * 2026-10-08. Renders nothing for a listing that has answered nothing: an
 * empty heading would read as "we checked and there is nothing".
 */
export function DirectoryAccessSection({ place }: { place: DirectoryPlace }) {
  const { t } = useTranslation();
  const kind = listingKindOf(place);
  const isOnline = kind === "online";
  // An online listing shows its four online answers once it has given any of
  // them (or a note); four "not told yet" rows would read as gaps the owner
  // left, so a silent one shows nothing here.
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
  if (!accessibility) return null;
  const headingKey = isOnline
    ? "marketing:directory.detail.accessTitleOnline"
    : kind === "mobile"
      ? "marketing:directory.detail.accessTitleMobile"
      : "marketing:directory.detail.accessTitle";

  return (
    <section className={s.sec}>
      <h2>{t(headingKey)}</h2>
      <p className={s.subLine}>
        {t("marketing:directory.detail.accessSub", { name: place.owner.first })}
      </p>
      <DirectoryAccessibilityAnswers
        accessibility={accessibility}
        ownerFirstName={place.owner.first}
        questions={accessibilityQuestionsFor(kind)}
      />
    </section>
  );
}
