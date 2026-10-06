import { useOneLineFit } from "../../shared/hooks";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  DirectoryCardHiddenItems,
  DirectoryCardMeasureLayer,
  DirectoryCardMoreChip,
  type DirectoryCardRowItem,
} from "./DirectoryCardOverflow";
import type { DirectoryPlace } from "./directoryPlaces";
import { ownerIdentityLabelKey } from "./listBusiness/listingOwnerIdentities.data";
import s from "./DirectoryPage.module.css";

/** Every tag after the first carries its own middle dot, so a row cut short
 *  after any tag still reads cleanly. */
const SEPARATOR = " · ";

/**
 * The card's "who runs it" line: the tags the owner picked, joined by a middle
 * dot on one line. As many as the card's width holds show, the rest fold into
 * a "+N" chip that names them on hover, and screen readers hear the full list.
 * Nothing renders when there are none.
 */
export function DirectoryCardOwners({ place }: { place: DirectoryPlace }) {
  const { t } = useTranslation();
  const items: DirectoryCardRowItem[] = (place.ownerIdentities ?? []).map(
    (slug) => ({ slug, label: t(ownerIdentityLabelKey(slug)) }),
  );
  const { rowRef, measureLayerRef, visibleCount } =
    useOneLineFit<HTMLUListElement>(items.length);
  if (items.length === 0) return null;

  const hiddenItems = items.slice(visibleCount);
  const withSeparator = (label: string, index: number) =>
    index === 0 ? label : `${SEPARATOR}${label}`;
  return (
    <ul ref={rowRef} className={s.ownersRow} data-preview-region="owners">
      {items.slice(0, visibleCount).map((item, index) => (
        <li key={item.slug} className={s.ownersItem}>
          {withSeparator(item.label, index)}
        </li>
      ))}
      <DirectoryCardHiddenItems items={hiddenItems} />
      <DirectoryCardMoreChip hiddenItems={hiddenItems} />
      <DirectoryCardMeasureLayer
        layerRef={measureLayerRef}
        itemCount={items.length}
      >
        {items.map((item, index) => (
          <span key={item.slug} className={s.ownersItem} data-fit-item="">
            {withSeparator(item.label, index)}
          </span>
        ))}
      </DirectoryCardMeasureLayer>
    </ul>
  );
}
