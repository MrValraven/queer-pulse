import type { MyCardDTO } from "./api/cards.api";
import { PrintableCard } from "./PrintableCard";
import styles from "./CardPrintSheet.module.css";

/** How many fold-over blanks fit one A4 page: 4 x 54mm plus 3 x 5mm of gutter
 *  is 231mm, inside the 277mm an A4 sheet leaves at a 10mm margin. */
const BLANKS_PER_SHEET = 4;

function toSheets(cards: MyCardDTO[]): MyCardDTO[][] {
  const sheets: MyCardDTO[][] = [];
  for (let index = 0; index < cards.length; index += BLANKS_PER_SHEET) {
    sheets.push(cards.slice(index, index + BLANKS_PER_SHEET));
  }
  return sheets;
}

/**
 * The cards laid out for paper: A4 sheets of fold-over blanks, with hairline
 * crop marks outside the trim so a cut never crosses artwork.
 *
 * Each sheet is its own block and breaks after itself, so a page break lands
 * between sheets rather than through the middle of a card.
 *
 * `data-print-root` is what the print stylesheet keys on to hide the rest of
 * the app, following the idiom already established in
 * `features/economy/tools/tools.print.css`.
 */
export function CardPrintSheet({ cards }: { cards: MyCardDTO[] }) {
  return (
    <div data-print-root className={styles.sheets}>
      {toSheets(cards).map((sheet, sheetIndex) => (
        // Keyed by position: `toSheets` only ever emits non-empty slices in
        // order, and reaching into `sheet[0]` for an id costs a non-null
        // assertion to say the same thing.
        <div key={sheetIndex} className={styles.sheet}>
          {sheet.map((card) => (
            <div key={card.id} className={styles.slot}>
              <span className={styles.cropTopLeft} aria-hidden="true" />
              <span className={styles.cropTopRight} aria-hidden="true" />
              <span className={styles.cropBottomLeft} aria-hidden="true" />
              <span className={styles.cropBottomRight} aria-hidden="true" />
              <PrintableCard card={card} />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
