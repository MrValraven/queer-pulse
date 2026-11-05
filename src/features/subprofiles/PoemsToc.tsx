import { useTranslation } from "../../shared/i18n/useTranslation";
import { groupPoemsByYear, poemMonthLabel } from "./poemYearGroups";
import { SubprofileItemRow } from "./SubprofileItemRow";
import type { SubprofileItemView } from "./api/subprofiles.adapters";
import type { AccentKey, SubprofileKind } from "./api/subprofiles.api";
import type { SkinFamily } from "./subprofile-skins";

/**
 * The poems section as a table of contents: one group per year, newest first,
 * each under its own year heading (an h3, one level below the section's h2),
 * with the poems that carry no usable date gathered last under "Undated". A
 * row shows the poem's title, its subtitle when it has one, and a short month
 * on the right, since the year heading already carries the year.
 */
export function PoemsToc({
  items,
  skin,
  interactive,
  accent,
  kind,
  onOpenPoem,
}: {
  items: SubprofileItemView[];
  skin: SkinFamily;
  interactive: boolean;
  accent?: AccentKey;
  kind?: SubprofileKind;
  /** Opens the poem reader on a clicked row. Only wired when `interactive`. */
  onOpenPoem?: (item: SubprofileItemView) => void;
}) {
  const { t, language } = useTranslation();
  const groups = groupPoemsByYear(items);

  return (
    <div className="pp-toc">
      {groups.map((group) => (
        <div className="pp-toc-group" key={group.year ?? "undated"}>
          <h3 className="pp-toc-year">
            {group.year ?? t("subprofiles:section.poemsUndated")}
          </h3>
          <div className="pp-list">
            {group.items.map((item, index) => (
              <SubprofileItemRow
                key={`${item.title}::${item.date}::${index}`}
                item={item}
                skin={skin}
                interactive={interactive}
                accent={accent}
                kind={kind}
                onOpen={interactive ? onOpenPoem : undefined}
                hideBody
                dateLabel={poemMonthLabel(item.date, language)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
