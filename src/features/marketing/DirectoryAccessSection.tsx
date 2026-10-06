import { useTranslation } from "../../shared/i18n/useTranslation";
import { type DirectoryPlace } from "./directoryPlaces";
import { DirectoryAccess } from "./DirectoryAccess";
import { accessibilityLabelIds } from "./directoryAccessibilityLabels";
import { DirectoryAccessibilityAnswers } from "./DirectoryAccessibilityAnswers";
import { DirectoryLanguages } from "./DirectoryLanguages";
import s from "./DirectorySpacePage.module.css";

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
 * An online-only business (`place.online`) keeps the languages and drops
 * both accessibility parts. Every one of the six questions is about a
 * building (an entrance, a toilet, a room's noise). A listing with no building
 * has nothing to answer them about, and the wizard stores all six as
 * "unknown", so the page would show six "not yet told" rows that read as gaps
 * the owner left. Its heading narrows to match, asking only whether you will
 * be understood.
 *
 * Renders nothing at all when the listing declares none of the three, which is
 * most demo fixtures, and nothing for an online listing that names no
 * languages, whatever accessibility data it carries. An empty heading would
 * read as "we checked and there is nothing", which is a different and untrue
 * claim.
 */
export function DirectoryAccessSection({ place }: { place: DirectoryPlace }) {
  const { t } = useTranslation();
  const isOnline = place.online === true;
  // Read only for a physical listing, so an online one's stored answers (the
  // wizard saves all six as "unknown") can never hold the section open.
  const accessibility = isOnline ? undefined : place.accessibility;
  const hasAccessHighlights =
    !isOnline && accessibilityLabelIds(place).length > 0;
  const hasLanguages = (place.langs?.length ?? 0) > 0;
  if (!accessibility && !hasAccessHighlights && !hasLanguages) return null;

  return (
    <section className={s.sec}>
      <h2>
        {isOnline
          ? t("marketing:directory.detail.languagesTitle")
          : t("marketing:directory.detail.accessTitle")}
      </h2>
      <p className={s.subLine}>
        {t("marketing:directory.detail.accessSub", { name: place.owner.first })}
      </p>
      {accessibility && (
        <DirectoryAccessibilityAnswers
          accessibility={accessibility}
          ownerFirstName={place.owner.first}
        />
      )}
      <div className={s.accessRows}>
        {!isOnline && <DirectoryAccess place={place} />}
        <DirectoryLanguages langs={place.langs} />
      </div>
    </section>
  );
}
