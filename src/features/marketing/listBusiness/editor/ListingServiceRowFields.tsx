import { FiArrowDown, FiArrowUp, FiTrash2 } from "react-icons/fi";
import { FormField, IconButton } from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import {
  serviceRowProblem,
  SERVICE_NAME_MAX,
  SERVICE_NOTE_MAX,
  SERVICE_PRICE_MAX,
  type ListingServiceRow,
} from "../listingServices.data";
import styles from "./ListingServices.module.css";

/**
 * One service: what it is, what it costs, and an optional line of detail.
 *
 * `price` is free text and required once the row has been started, because a
 * service row with no price is the exact gap this list exists to close. "From
 * 25 EUR", "sliding scale" and "by quote" are all valid and all honest, so the
 * field never tries to be a number. A row with neither a name nor a price is
 * simply a blank line the owner has not filled in yet: it never errors and it
 * is never sent.
 *
 * Reordering is two arrow buttons rather than a drag handle. It is the cheap,
 * keyboard-operable version of the same capability, and a short menu rarely
 * needs more.
 */
export function ListingServiceRowFields({
  row,
  position,
  total,
  onChange,
  onRemove,
  onMove,
}: {
  row: ListingServiceRow;
  /** 1-based position, for the buttons' accessible names. */
  position: number;
  total: number;
  onChange: (id: string, patch: Partial<Omit<ListingServiceRow, "id">>) => void;
  onRemove: (id: string) => void;
  onMove: (id: string, direction: -1 | 1) => void;
}) {
  const { t } = useTranslation();
  const problem = serviceRowProblem(row);
  // A row's own name is the clearest way to say WHICH row a button acts on;
  // an unnamed row falls back to its position.
  const rowName =
    row.name.trim() ||
    t("marketing:listBusiness.services.unnamedRow", { position });

  return (
    <div className={styles.row}>
      <FormField
        className={styles.field}
        label={t("marketing:listBusiness.services.nameLabel")}
        error={
          problem === "name"
            ? t("marketing:listBusiness.services.nameError")
            : undefined
        }
      >
        <input
          type="text"
          maxLength={SERVICE_NAME_MAX}
          placeholder={t("marketing:listBusiness.services.namePlaceholder")}
          value={row.name}
          onChange={(event) => onChange(row.id, { name: event.target.value })}
        />
      </FormField>

      <FormField
        className={styles.field}
        label={t("marketing:listBusiness.services.priceLabel")}
        error={
          problem === "price"
            ? t("marketing:listBusiness.services.priceError")
            : undefined
        }
      >
        <input
          type="text"
          maxLength={SERVICE_PRICE_MAX}
          placeholder={t("marketing:listBusiness.services.pricePlaceholder")}
          value={row.price}
          onChange={(event) => onChange(row.id, { price: event.target.value })}
        />
      </FormField>

      <div className={styles.controls}>
        <IconButton
          size="sm"
          aria-label={t("marketing:listBusiness.services.moveUp", {
            name: rowName,
          })}
          disabled={position === 1}
          onClick={() => onMove(row.id, -1)}
        >
          <FiArrowUp aria-hidden />
        </IconButton>
        <IconButton
          size="sm"
          aria-label={t("marketing:listBusiness.services.moveDown", {
            name: rowName,
          })}
          disabled={position === total}
          onClick={() => onMove(row.id, 1)}
        >
          <FiArrowDown aria-hidden />
        </IconButton>
        <IconButton
          size="sm"
          aria-label={t("marketing:listBusiness.services.remove", {
            name: rowName,
          })}
          onClick={() => onRemove(row.id)}
        >
          <FiTrash2 aria-hidden />
        </IconButton>
      </div>

      <FormField
        className={[styles.field, styles.noteCell].join(" ")}
        label={t("marketing:listBusiness.services.noteLabel")}
        helper={t("marketing:listBusiness.services.noteHint")}
      >
        <input
          type="text"
          maxLength={SERVICE_NOTE_MAX}
          placeholder={t("marketing:listBusiness.services.notePlaceholder")}
          value={row.note}
          onChange={(event) => onChange(row.id, { note: event.target.value })}
        />
      </FormField>
    </div>
  );
}
