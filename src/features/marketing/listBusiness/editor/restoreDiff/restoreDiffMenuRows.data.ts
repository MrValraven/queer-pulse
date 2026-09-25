import type { TFunction } from "../../../../../shared/i18n/types";
import {
  emptyMenuDraft,
  type ListingMenuFile,
  type ListingMenuItem,
  type ListingMenuSectionRow,
} from "../../listingMenu.data";
import {
  DIFF_KEY_PREFIX,
  LIST_SEPARATOR,
  type RestoreDiffContext,
} from "./restoreDiffFields.data";
import {
  changedRow,
  pairsByPosition,
  summaryOf,
  untitled,
} from "./restoreDiffRowParts.data";
import type { RestoreRowChange } from "./restoreDiff.types";

/**
 * Rows for the menu: sections and their items matched by position, then the
 * menu link and the menu file. Every "changed" decision reads the raw fields,
 * so a change the trimmed summary cannot show (a price moved into the
 * description, a trailing space) still gets its row.
 */

const MENU_LINK_LABEL_KEY = "marketing:listBusiness.menu.linkLabel";
const MENU_FILE_LABEL_KEY = "marketing:listBusiness.menu.fileHeading";

function isSameMenuItem(first: ListingMenuItem, second: ListingMenuItem) {
  return (
    first.name === second.name &&
    first.price === second.price &&
    first.description === second.description &&
    first.dietary.join("\n") === second.dietary.join("\n")
  );
}

function isSameMenuFile(
  first: ListingMenuFile | null,
  second: ListingMenuFile | null,
) {
  return (
    first?.url === second?.url &&
    first?.fileName === second?.fileName &&
    first?.contentType === second?.contentType
  );
}

function menuItemSummary(t: TFunction, item: ListingMenuItem): string {
  const dietary = item.dietary
    .map((label) => t(`marketing:listBusiness.menu.dietary.${label}`))
    .join(LIST_SEPARATOR);
  return summaryOf([item.name, item.price, item.description, dietary]);
}

/** The item rows of one section position, labelled "Section: Item". */
function menuItemRows(
  t: TFunction,
  sectionPosition: number,
  sectionTitle: string,
  before: ListingMenuSectionRow | undefined,
  after: ListingMenuSectionRow | undefined,
): RestoreRowChange[] {
  return pairsByPosition(before?.items ?? [], after?.items ?? []).flatMap(
    (pair) => {
      if (pair.before && pair.after && isSameMenuItem(pair.before, pair.after))
        return [];
      const label = t(`${DIFF_KEY_PREFIX}.row.menuItem`, {
        section: sectionTitle,
        item: untitled(t, (pair.after ?? pair.before)!.name),
      });
      return [
        changedRow(
          `menu.section.${sectionPosition}.item.${pair.position}`,
          label,
          pair.before ? menuItemSummary(t, pair.before) : null,
          pair.after ? menuItemSummary(t, pair.after) : null,
        ),
      ];
    },
  );
}

export function menuRows(context: RestoreDiffContext): RestoreRowChange[] {
  const { t } = context;
  const before = context.current.menu ?? emptyMenuDraft();
  const after = context.saved.menu ?? emptyMenuDraft();
  const rows = pairsByPosition(before.sections, after.sections).flatMap(
    (pair) => {
      const title = untitled(t, (pair.after ?? pair.before)!.title);
      const sectionRows =
        pair.before?.title === pair.after?.title
          ? []
          : [
              changedRow(
                `menu.section.${pair.position}`,
                title,
                pair.before ? pair.before.title : null,
                pair.after ? pair.after.title : null,
              ),
            ];
      return [
        ...sectionRows,
        ...menuItemRows(t, pair.position, title, pair.before, pair.after),
      ];
    },
  );
  if (before.link !== after.link) {
    rows.push(
      changedRow(
        "menu.link",
        t(MENU_LINK_LABEL_KEY),
        before.link || null,
        after.link || null,
      ),
    );
  }
  if (!isSameMenuFile(before.file, after.file)) {
    const fileName = (file: ListingMenuFile | null) =>
      file ? untitled(t, file.fileName) : null;
    rows.push(
      changedRow(
        "menu.file",
        t(MENU_FILE_LABEL_KEY),
        fileName(before.file),
        fileName(after.file),
      ),
    );
  }
  return rows;
}
