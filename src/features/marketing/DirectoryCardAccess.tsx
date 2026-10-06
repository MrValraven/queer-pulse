import { FiCheck } from "react-icons/fi";
import { useOneLineFit } from "../../shared/hooks";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  DirectoryCardHiddenItems,
  DirectoryCardMeasureLayer,
  DirectoryCardMoreChip,
  type DirectoryCardRowItem,
} from "./DirectoryCardOverflow";
import type { DirectoryPlace } from "./directoryPlaces";
import { ACCESSIBILITY_QUESTIONS } from "./listBusiness/listingAccessibility.data";
import { useAccessFilter } from "./useDirectoryFilters";
import s from "./DirectoryPage.module.css";

/** One accessibility pill; the visible row and its measuring copy share it. */
function AccessPill({
  label,
  isMeasureCopy = false,
}: {
  label: string;
  isMeasureCopy?: boolean;
}) {
  const content = (
    <>
      <FiCheck aria-hidden />
      <span className={s.accessLabel}>{label}</span>
    </>
  );
  return isMeasureCopy ? (
    <span className={s.accessPill} data-fit-item="">
      {content}
    </span>
  ) : (
    <li className={s.accessPill}>{content}</li>
  );
}

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
 * The row stays on one line so every card in a grid row keeps the same
 * height: it shows as many pills as the card's width holds and folds the rest
 * into a "+N" chip that names them on hover. The needs the member is currently
 * filtering on come first, so the answer they asked for is the one they see.
 */
export function DirectoryCardAccess({ place }: { place: DirectoryPlace }) {
  const { t } = useTranslation();
  const asked = useAccessFilter();
  const answers = place.accessibility?.answers;

  const met = answers
    ? ACCESSIBILITY_QUESTIONS.filter(
        (question) => answers[question.slug] === "yes",
      )
    : [];
  // A stable sort, so the needs the member asked for move to the front and
  // everything else keeps the canonical question order behind them.
  const orderedItems: DirectoryCardRowItem[] = [...met]
    .sort(
      (first, second) =>
        Number(asked.includes(second.slug)) -
        Number(asked.includes(first.slug)),
    )
    .map((question) => ({ slug: question.slug, label: t(question.labelKey) }));

  const { rowRef, measureLayerRef, visibleCount } =
    useOneLineFit<HTMLUListElement>(orderedItems.length);
  if (orderedItems.length === 0) return null;

  const hiddenItems = orderedItems.slice(visibleCount);
  return (
    <ul
      ref={rowRef}
      className={s.accessRow}
      aria-label={t("marketing:directory.card.access")}
      data-preview-region="access"
    >
      {orderedItems.slice(0, visibleCount).map((item) => (
        <AccessPill key={item.slug} label={item.label} />
      ))}
      <DirectoryCardHiddenItems items={hiddenItems} />
      <DirectoryCardMoreChip hiddenItems={hiddenItems} />
      <DirectoryCardMeasureLayer
        layerRef={measureLayerRef}
        itemCount={orderedItems.length}
      >
        {orderedItems.map((item) => (
          <AccessPill key={item.slug} label={item.label} isMeasureCopy />
        ))}
      </DirectoryCardMeasureLayer>
    </ul>
  );
}
