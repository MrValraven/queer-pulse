import { useEffect, useRef, type Ref } from "react";
import { FiChevronDown, FiPlus, FiTrash2 } from "react-icons/fi";
import { Button, IconButton } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { AmountInput } from "./AdminGovernanceFinancesEditCells";
import {
  ITEM_NAME_MAX_LENGTH,
  ITEM_PERIOD_MAX_LENGTH,
  MAX_BREAKDOWN_ITEMS,
  emptyItemDraft,
  isReadAsGroupedThousands,
  itemAmountError,
  parseNumber,
  type ItemAmountError,
  type ItemDraft,
} from "./adminGovernanceFinancesEdit.utils";
import styles from "./AdminGovernanceFinancesEdit.module.css";

/** Where focus lands once the list has re-rendered at its new length. */
type PendingFocus = "lastName" | "add" | null;

/** The ledger columns the closing row spans after the empty Shown cell. */
const FOOT_COLUMN_SPAN = 5;

/** The message under an item amount the save would refuse. */
const AMOUNT_ERROR_KEYS: Record<ItemAmountError, string> = {
  required: "admin:governance.finances.edit.breakdown.amountRequired",
  invalid: "admin:governance.finances.edit.field.amountInvalid",
  negative: "admin:governance.finances.edit.breakdown.amountNegative",
  tooPrecise: "admin:governance.finances.edit.breakdown.amountTooPrecise",
};

function itemRowId(rowsId: string, index: number): string {
  return `${rowsId}-item-${index}`;
}

/** Every breakdown row a line renders, for the toggle's `aria-controls`. */
function breakdownRowIds(rowsId: string, itemCount: number): string {
  const itemIds = Array.from({ length: itemCount }, (_unused, index) =>
    itemRowId(rowsId, index),
  );
  const captionIds = itemCount > 0 ? [`${rowsId}-head`] : [];
  return [...captionIds, ...itemIds, `${rowsId}-foot`].join(" ");
}

/** An empty cell that keeps a breakdown row on the ledger's columns. */
function SpacerCell({ className }: { className?: string }) {
  // eslint-disable-next-line jsx-a11y/control-has-associated-label -- an empty layout cell holding no control; it only keeps the row on the ledger's columns.
  return <td className={className} />;
}

/**
 * The quiet text control under a spending line's name that shows or hides
 * its item rows. While an item is one the save refuses (`hasRejectedItem`)
 * it reads in the error colour, so a collapsed line with a problem is easy
 * to find.
 */
export function BreakdownToggle({
  rowsId,
  itemCount,
  isOpen,
  hasRejectedItem,
  onToggle,
}: {
  rowsId: string;
  itemCount: number;
  isOpen: boolean;
  hasRejectedItem: boolean;
  onToggle: () => void;
}) {
  const { t } = useTranslation();
  return (
    <Button
      variant="ghost"
      size="sm"
      className={[
        styles.breakdownToggle,
        hasRejectedItem && styles.breakdownToggleRejected,
      ]
        .filter(Boolean)
        .join(" ")}
      aria-expanded={isOpen}
      aria-controls={breakdownRowIds(rowsId, itemCount)}
      onClick={onToggle}
    >
      <FiChevronDown
        aria-hidden
        className={[
          styles.breakdownChevron,
          isOpen && styles.breakdownChevronOpen,
        ]
          .filter(Boolean)
          .join(" ")}
      />
      {itemCount > 0
        ? t("admin:governance.finances.edit.breakdown.toggleCount", {
            count: itemCount,
          })
        : t("admin:governance.finances.edit.breakdown.toggle")}
    </Button>
  );
}

/** One breakdown entry as a ledger row: name under Line, detail across Source
 *  and Current, amount under New amount, the remove button under Note. It
 *  stays editable on a switched-off line, which still saves its breakdown. */
function BreakdownItemRow({
  id,
  className,
  isHidden,
  item,
  position,
  isLoss,
  nameRef,
  onChange,
  onRemove,
}: {
  id: string;
  className: string;
  isHidden: boolean;
  item: ItemDraft;
  position: number;
  isLoss: boolean;
  nameRef?: Ref<HTMLInputElement>;
  onChange: (patch: Partial<ItemDraft>) => void;
  onRemove: () => void;
}) {
  const { t } = useTranslation();
  const format = useFormat();
  // Names the detail, amount and remove controls, including an entry that
  // has no name yet.
  const itemName =
    item.name.trim() ||
    t("admin:governance.finances.edit.breakdown.newItem", { position });
  const amountError = itemAmountError(item.amount);
  // "12.345" is stored as 12345; say so under the amount.
  const groupedAmount = isReadAsGroupedThousands(item.amount)
    ? parseNumber(item.amount)
    : undefined;
  return (
    <tr id={id} hidden={isHidden} className={className}>
      <SpacerCell className={styles.breakdownSpacer} />
      <th scope="row" className={styles.breakdownNameCell}>
        <input
          ref={nameRef}
          type="text"
          className={styles.noteInput}
          aria-label={t("admin:governance.finances.edit.breakdown.aria.name", {
            position,
          })}
          aria-invalid={!item.name.trim() || undefined}
          placeholder={t(
            "admin:governance.finances.edit.breakdown.namePlaceholder",
          )}
          value={item.name}
          maxLength={ITEM_NAME_MAX_LENGTH}
          onChange={(event) => onChange({ name: event.target.value })}
        />
      </th>
      <td colSpan={2}>
        <input
          type="text"
          className={styles.noteInput}
          aria-label={t(
            "admin:governance.finances.edit.breakdown.aria.period",
            { label: itemName },
          )}
          placeholder={t(
            "admin:governance.finances.edit.breakdown.periodPlaceholder",
          )}
          value={item.period}
          maxLength={ITEM_PERIOD_MAX_LENGTH}
          onChange={(event) => onChange({ period: event.target.value })}
        />
      </td>
      <td>
        <AmountInput
          ariaLabel={t("admin:governance.finances.edit.breakdown.aria.amount", {
            label: itemName,
          })}
          value={item.amount}
          isBlankAllowed={false}
          unit="currency"
          isLoss={isLoss}
          errorMessageKey={
            amountError === null ? null : AMOUNT_ERROR_KEYS[amountError]
          }
          onChange={(amount) => onChange({ amount })}
        />
        {groupedAmount !== undefined && (
          <span className={`${styles.rowHint} ${styles.breakdownReadsAs}`}>
            {t("admin:governance.finances.edit.breakdown.readsAs", {
              amount: format.currency(
                groupedAmount,
                "EUR",
                Number.isInteger(groupedAmount)
                  ? { maximumFractionDigits: 0 }
                  : undefined,
              ),
            })}
          </span>
        )}
      </td>
      <td>
        <IconButton
          size="sm"
          aria-label={t("admin:governance.finances.edit.breakdown.remove", {
            label: itemName,
          })}
          onClick={onRemove}
        >
          <FiTrash2 aria-hidden />
        </IconButton>
      </td>
    </tr>
  );
}

/**
 * The item editor under a spending line: the entries that make up its amount
 * ("Hosting", "€15/mo", 45), rendered as rows of the ledger table itself so
 * each value sits under its own column. While it holds any, the line's amount
 * is their sum. Adding an entry moves focus to its name; removing one moves
 * focus to "Add an item", so the keyboard never drops back to the top of the
 * dialog.
 */
export function BreakdownRows({
  rowsId,
  items,
  isOpen,
  isLoss,
  rowClassName,
  onChange,
}: {
  /** The prefix of every row id, matching the toggle's `aria-controls`. */
  rowsId: string;
  items: ItemDraft[];
  isOpen: boolean;
  isLoss: boolean;
  /** The line row's classes (changed tint, switched-off dimming). */
  rowClassName: string;
  onChange: (items: ItemDraft[]) => void;
}) {
  const { t } = useTranslation();
  const lastNameRef = useRef<HTMLInputElement>(null);
  const addButtonRef = useRef<HTMLButtonElement>(null);
  const pendingFocusRef = useRef<PendingFocus>(null);
  const isFull = items.length >= MAX_BREAKDOWN_ITEMS;

  useEffect(() => {
    const target = pendingFocusRef.current;
    pendingFocusRef.current = null;
    if (target === "lastName") lastNameRef.current?.focus();
    if (target === "add") addButtonRef.current?.focus();
  }, [items.length]);

  const patchItem = (index: number, patch: Partial<ItemDraft>): void => {
    onChange(
      items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...patch } : item,
      ),
    );
  };
  const addItem = (): void => {
    pendingFocusRef.current = "lastName";
    onChange([...items, emptyItemDraft()]);
  };
  const removeItem = (index: number): void => {
    pendingFocusRef.current = "add";
    onChange(items.filter((_item, itemIndex) => itemIndex !== index));
  };

  const rowClassNames = `${rowClassName} ${styles.breakdownRow}`;

  return (
    <>
      {items.length > 0 && (
        // Visible column captions; each input carries its own name.
        <tr
          id={`${rowsId}-head`}
          hidden={!isOpen}
          aria-hidden
          className={`${rowClassNames} ${styles.breakdownCaption}`}
        >
          <SpacerCell className={styles.breakdownSpacer} />
          <td className={styles.breakdownCaptionName}>
            {t("admin:governance.finances.edit.breakdown.col.name")}
          </td>
          <td colSpan={2}>
            {t("admin:governance.finances.edit.breakdown.col.period")}
          </td>
          <td className={styles.breakdownCaptionAmount}>
            {t("admin:governance.finances.edit.breakdown.col.amount")}
          </td>
          <SpacerCell />
        </tr>
      )}
      {items.map((item, index) => (
        <BreakdownItemRow
          key={index}
          id={itemRowId(rowsId, index)}
          className={`${rowClassNames} ${styles.breakdownItem}`}
          isHidden={!isOpen}
          item={item}
          position={index + 1}
          isLoss={isLoss}
          nameRef={index === items.length - 1 ? lastNameRef : undefined}
          onChange={(patch) => patchItem(index, patch)}
          onRemove={() => removeItem(index)}
        />
      ))}
      <tr
        id={`${rowsId}-foot`}
        hidden={!isOpen}
        className={`${rowClassNames} ${styles.breakdownFoot}`}
      >
        <SpacerCell className={styles.breakdownSpacer} />
        <td colSpan={FOOT_COLUMN_SPAN} className={styles.breakdownFootCell}>
          <div className={styles.breakdownFootBody}>
            {items.length === 0 && (
              <p className={styles.breakdownHint}>
                {t("admin:governance.finances.edit.breakdown.empty")}
              </p>
            )}
            {isFull ? (
              <p className={styles.breakdownHint}>
                {t("admin:governance.finances.edit.breakdown.full", {
                  max: MAX_BREAKDOWN_ITEMS,
                })}
              </p>
            ) : (
              <Button
                ref={addButtonRef}
                variant="ghost"
                size="sm"
                className={styles.breakdownAdd}
                onClick={addItem}
              >
                <FiPlus aria-hidden />
                {t("admin:governance.finances.edit.breakdown.add")}
              </Button>
            )}
          </div>
        </td>
      </tr>
    </>
  );
}
