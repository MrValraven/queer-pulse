import type { TFunction } from "../../../../../shared/i18n/types";
import {
  emptyMenuDraft,
  type ListingMenuFile,
  type ListingMenuItem,
  type ListingMenuSectionRow,
  type ListingMenuSubsectionRow,
} from "../../listingMenu.data";
import { menuCurrencyOf } from "../../listingMenuPrice.data";
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
 * Rows for the menu: sections, their sub-sections and their items matched by
 * position, then the menu link and the menu file. Every "changed" decision reads the raw fields,
 * so a change the trimmed summary cannot show (a price moved into the
 * description, a trailing space) still gets its row.
 */

const MENU_LINK_LABEL_KEY = "marketing:listBusiness.menu.linkLabel";
const MENU_CURRENCY_LABEL_KEY = "marketing:listBusiness.menu.currencyLabel";
const MENU_FILE_LABEL_KEY = "marketing:listBusiness.menu.fileHeading";

function isSameMenuItem(first: ListingMenuItem, second: ListingMenuItem) {
  return (
    first.name === second.name &&
    first.price === second.price &&
    (first.priceGlass ?? "") === (second.priceGlass ?? "") &&
    (first.priceBottle ?? "") === (second.priceBottle ?? "") &&
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
  // The slash keeps its place when one price is missing, so "/ 48.00" still
  // reads as a bottle price.
  const glass = item.priceGlass?.trim() ?? "";
  const bottle = item.priceBottle?.trim() ?? "";
  const glassAndBottle = glass || bottle ? `${glass} / ${bottle}`.trim() : "";
  return summaryOf([
    item.name,
    item.price,
    glassAndBottle,
    item.description,
    dietary,
  ]);
}

/** The rows of one list of items, matched by position. */
function menuItemListRows(
  t: TFunction,
  keyPrefix: string,
  labelFor: (itemName: string) => string,
  beforeItems: readonly ListingMenuItem[],
  afterItems: readonly ListingMenuItem[],
): RestoreRowChange[] {
  return pairsByPosition(beforeItems, afterItems).flatMap((pair) => {
    if (pair.before && pair.after && isSameMenuItem(pair.before, pair.after))
      return [];
    return [
      changedRow(
        `${keyPrefix}.item.${pair.position}`,
        labelFor(untitled(t, (pair.after ?? pair.before)!.name)),
        pair.before ? menuItemSummary(t, pair.before) : null,
        pair.after ? menuItemSummary(t, pair.after) : null,
      ),
    ];
  });
}

/** The sub-section rows of one section position: a title row, then the item
 *  rows, labelled "Section / Sub-section: Item". */
function menuSubsectionRows(
  t: TFunction,
  sectionPosition: number,
  sectionTitle: string,
  before: ListingMenuSectionRow | undefined,
  after: ListingMenuSectionRow | undefined,
): RestoreRowChange[] {
  return pairsByPosition<ListingMenuSubsectionRow>(
    before?.subsections ?? [],
    after?.subsections ?? [],
  ).flatMap((pair) => {
    const subsectionTitle = untitled(t, (pair.after ?? pair.before)!.title);
    const keyPrefix = `menu.section.${sectionPosition}.subsection.${pair.position}`;
    const titleRows =
      pair.before?.title === pair.after?.title
        ? []
        : [
            changedRow(
              keyPrefix,
              t(`${DIFF_KEY_PREFIX}.row.menuSubsection`, {
                section: sectionTitle,
                subsection: subsectionTitle,
              }),
              pair.before ? pair.before.title : null,
              pair.after ? pair.after.title : null,
            ),
          ];
    return [
      ...titleRows,
      ...menuItemListRows(
        t,
        keyPrefix,
        (itemName) =>
          t(`${DIFF_KEY_PREFIX}.row.menuSubsectionItem`, {
            section: sectionTitle,
            subsection: subsectionTitle,
            item: itemName,
          }),
        pair.before?.items ?? [],
        pair.after?.items ?? [],
      ),
    ];
  });
}

/** The item rows of one section position, labelled "Section: Item". */
function menuItemRows(
  t: TFunction,
  sectionPosition: number,
  sectionTitle: string,
  before: ListingMenuSectionRow | undefined,
  after: ListingMenuSectionRow | undefined,
): RestoreRowChange[] {
  return menuItemListRows(
    t,
    `menu.section.${sectionPosition}`,
    (itemName) =>
      t(`${DIFF_KEY_PREFIX}.row.menuItem`, {
        section: sectionTitle,
        item: itemName,
      }),
    before?.items ?? [],
    after?.items ?? [],
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
        ...menuSubsectionRows(t, pair.position, title, pair.before, pair.after),
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
  const beforeCurrency = menuCurrencyOf(before.currency);
  const afterCurrency = menuCurrencyOf(after.currency);
  if (beforeCurrency !== afterCurrency) {
    rows.push(
      changedRow(
        "menu.currency",
        t(MENU_CURRENCY_LABEL_KEY),
        beforeCurrency,
        afterCurrency,
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
