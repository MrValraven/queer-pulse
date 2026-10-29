import type { CSSProperties } from "react";
import { useFormat } from "../../../../shared/i18n/format";
import { intlLocale } from "../../../../shared/i18n/locale";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import {
  canonicalMenuPrice,
  menuCurrencyAffix,
  menuPriceForInput,
  MENU_PRICE_INPUT_MAX,
  sanitizeMenuPriceInput,
  type ListingMenuCurrency,
} from "../listingMenuPrice.data";
import styles from "./ListingMenu.module.css";

interface ListingMenuPriceInputProps {
  /** The saved price text. Free text from before the numeric input shows empty. */
  value: string;
  onValueChange: (nextValue: string) => void;
  currency: ListingMenuCurrency;
  placeholder: string;
  /** A tighter box for a row with two prices side by side. The symbol also
   *  steps aside when the row's container is narrow. */
  isCompact?: boolean;
  // Injected by FormField (this component opts in with `formFieldControl`),
  // and forwarded onto the real input rather than the wrapper.
  id?: string;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean | "true" | "false";
  "aria-required"?: boolean | "true" | "false";
}

/**
 * A numbers-only price with the menu currency's symbol drawn inside the
 * field's box, before or after the digits as the language writes it. Typing
 * and pasting both pass through `sanitizeMenuPriceInput`, so only digits and
 * one decimal point reach the draft. A plain text input, since
 * `type="number"` mishandles the decimal comma and accepts "e".
 */
export function ListingMenuPriceInput({
  value,
  onValueChange,
  currency,
  placeholder,
  isCompact = false,
  id,
  "aria-describedby": ariaDescribedBy,
  "aria-invalid": ariaInvalid,
  "aria-required": ariaRequired,
}: ListingMenuPriceInputProps) {
  const { language } = useTranslation();
  const fmt = useFormat();
  const decimalSeparator = fmt.number(1.5).includes(",") ? "," : ".";
  const { symbol, isSymbolAfter } = menuCurrencyAffix(
    intlLocale(language),
    currency,
  );
  const symbolElement = (
    <span
      className={[
        styles.priceSymbol,
        isSymbolAfter ? styles.priceSymbolAfter : styles.priceSymbolBefore,
      ].join(" ")}
      aria-hidden
    >
      {symbol}
    </span>
  );

  return (
    <div
      className={[
        styles.priceControl,
        isCompact ? styles.priceControlCompact : "",
      ].join(" ")}
      style={{ "--price-symbol-chars": symbol.length } as CSSProperties}
    >
      {!isSymbolAfter && symbolElement}
      <input
        id={id}
        className={[
          styles.priceInput,
          isSymbolAfter ? styles.priceInputAfter : styles.priceInputBefore,
        ].join(" ")}
        type="text"
        inputMode="decimal"
        autoComplete="off"
        maxLength={MENU_PRICE_INPUT_MAX}
        placeholder={placeholder}
        aria-describedby={ariaDescribedBy}
        aria-invalid={ariaInvalid}
        aria-required={ariaRequired}
        value={menuPriceForInput(value, decimalSeparator)}
        onChange={(event) =>
          onValueChange(sanitizeMenuPriceInput(event.target.value))
        }
        onBlur={() => {
          // "2." and ".5" settle into "2" and "0.50" once the owner leaves.
          const tidyPrice = canonicalMenuPrice(value);
          if (tidyPrice !== null && tidyPrice !== value) {
            onValueChange(tidyPrice);
          }
        }}
      />
      {isSymbolAfter && symbolElement}
    </div>
  );
}

ListingMenuPriceInput.formFieldControl = true;
