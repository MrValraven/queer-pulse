import { FiCheck } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { DirectoryPlace } from "./directoryPlaces";
import { ACCESSIBILITY_QUESTIONS } from "./listBusiness/listingAccessibility.data";
import { useAccessFilter } from "./useDirectoryFilters";
import s from "./DirectoryPage.module.css";

/** Three keeps the card a card. The rest are one tap away on the listing. */
const MAX_SHOWN = 3;

/**
 * What this place has said YES to about getting in and being comfortable,
 * shown on the card so a member can rule places in and out without opening
 * each one.
 *
 * Only `yes` appears here, and that is the whole design. The card has room for
 * a few short claims, and the two answers it leaves out mean different things
 * that both need the space the detail page gives them: a `no` deserves the
 * plain, unapologetic row `DirectoryAccessibilityAnswers` gives it, and an
 * `unknown` deserves its own wording ("nobody has told us") rather than being
 * silently folded into either side. So the row is read as "here is some of
 * what this place says it has", never as a complete account, and the label
 * names it that way. A listing that has answered nothing shows nothing.
 *
 * The needs the member is currently filtering on come first, so the answer
 * they asked for is the one they see when only three fit.
 */
export function DirectoryCardAccess({ place }: { place: DirectoryPlace }) {
  const { t } = useTranslation();
  const asked = useAccessFilter();
  const answers = place.accessibility?.answers;
  if (!answers) return null;

  const met = ACCESSIBILITY_QUESTIONS.filter(
    (question) => answers[question.slug] === "yes",
  );
  if (met.length === 0) return null;

  // A stable sort, so the needs the member asked for move to the front and
  // everything else keeps the canonical question order behind them.
  const ordered = [...met].sort(
    (first, second) =>
      Number(asked.includes(second.slug)) - Number(asked.includes(first.slug)),
  );
  const shown = ordered.slice(0, MAX_SHOWN);
  const hiddenCount = ordered.length - shown.length;

  return (
    <ul
      className={s.accessRow}
      aria-label={t("marketing:directory.card.access")}
    >
      {shown.map((question) => (
        <li key={question.slug} className={s.accessPill}>
          <FiCheck aria-hidden />
          {t(question.labelKey)}
        </li>
      ))}
      {hiddenCount > 0 && (
        <li className={s.accessMore}>
          {t("marketing:directory.card.accessMore", { count: hiddenCount })}
        </li>
      )}
    </ul>
  );
}
