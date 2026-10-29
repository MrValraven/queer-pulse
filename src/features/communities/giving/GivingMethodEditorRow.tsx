import { useId, type InputHTMLAttributes, type Ref } from "react";
import {
  FiArrowDown,
  FiArrowUp,
  FiCreditCard,
  FiLink,
  FiSmartphone,
  FiTrash2,
} from "react-icons/fi";
import type { IconType } from "react-icons";
import {
  FormField,
  IconButton,
  SegmentedControl,
} from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  COMMUNITY_GIVING_KINDS,
  type CommunityGivingKind,
} from "../api/communityGiving.api";
import { GIVING_LIMITS } from "./givingConstants";
import type { GivingDraftRow, GivingRowErrors } from "./givingDraft";
import { givingMethodTitle } from "./givingPlatforms";
import { normalizeGivingValue, type GivingFieldError } from "./givingValue";
import type { GivingDraftRowPatch } from "./useGivingDraft";
import styles from "./GivingEditor.module.css";

const ERROR_KEY_BY_CODE: Record<GivingFieldError, string> = {
  required: "communities:detail.giving.error.required",
  invalidLink: "communities:detail.giving.error.link",
  invalidMbway: "communities:detail.giving.error.mbway",
  invalidIban: "communities:detail.giving.error.iban",
  tooLong: "communities:detail.giving.error.tooLong",
};

const KIND_ICON: Record<CommunityGivingKind, IconType> = {
  link: FiLink,
  mbway: FiSmartphone,
  iban: FiCreditCard,
};

/** The longest MB WAY number the server accepts: the `00351` prefix, 9
 *  digits in the 2-3-2-2 grouping, and up to three separators after the
 *  prefix and in each of the three gaps (`00351 - 91 - 234 - 56 - 78`, 26 characters).
 *  The input cap matches it so the client is never stricter than the API. */
const MBWAY_MAX_LENGTH = "00351".length + 9 + 4 * 3;

/** Keyboard and autofill hints per kind. The IBAN cap leaves room for a
 *  pasted `IBAN: ` prefix and spaces between the groups of four. */
const VALUE_INPUT_PROPS: Record<
  CommunityGivingKind,
  InputHTMLAttributes<HTMLInputElement>
> = {
  link: { type: "url", inputMode: "url", maxLength: GIVING_LIMITS.valueMax },
  mbway: { type: "tel", inputMode: "tel", maxLength: MBWAY_MAX_LENGTH },
  iban: {
    type: "text",
    autoCapitalize: "characters",
    spellCheck: false,
    maxLength: 48,
  },
};

interface GivingMethodEditorRowProps {
  row: GivingDraftRow;
  /** 1-based place in the list. */
  position: number;
  total: number;
  errors: GivingRowErrors;
  isErrorVisible: boolean;
  isBusy: boolean;
  /** Catalog key of the fieldset legend ("... {count}"); defaults to the
   *  community support copy. */
  legendKey?: string;
  valueInputRef?: Ref<HTMLInputElement>;
  onChange: (patch: GivingDraftRowPatch) => void;
  onBlurField: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
}

/** One way to support in the editor: kind, value, optional name and note,
 *  with move and remove controls. */
export function GivingMethodEditorRow({
  row,
  position,
  total,
  errors,
  isErrorVisible,
  isBusy,
  legendKey = "communities:detail.giving.editor.rowLegend",
  valueInputRef,
  onChange,
  onBlurField,
  onMoveUp,
  onMoveDown,
  onRemove,
}: GivingMethodEditorRowProps) {
  const { t } = useTranslation();
  const kindLabelId = useId();
  const kindName = (kind: CommunityGivingKind) =>
    t(`communities:detail.giving.kind.${kind}`);
  const errorText = (code: GivingFieldError | undefined, max: number) =>
    isErrorVisible && code ? t(ERROR_KEY_BY_CODE[code], { max }) : undefined;
  const rowTitle =
    givingMethodTitle({
      kind: row.kind,
      label: row.label,
      value: normalizeGivingValue(row.kind, row.value) ?? "",
    }) || kindName(row.kind);
  const kindOptions = COMMUNITY_GIVING_KINDS.map((kind) => {
    const KindIcon = KIND_ICON[kind];
    return { value: kind, label: kindName(kind), icon: <KindIcon /> };
  });

  return (
    <fieldset
      className={styles.row}
      disabled={isBusy}
      data-giving-row={row.draftId}
    >
      <legend className="visuallyHidden">
        {t(legendKey, { count: position })}
      </legend>
      {/* The "Kind" label shares its line with the move and remove actions,
       *  so the kind picker below takes the card's full width at any size. */}
      <div className={styles.kindField}>
        <div className={styles.rowHead}>
          <p id={kindLabelId} className={styles.groupLabel}>
            {t("communities:detail.giving.editor.kindLabel")}
          </p>
          <div className={styles.rowActions}>
            <IconButton
              aria-label={t("communities:detail.giving.editor.moveUpAria", {
                label: rowTitle,
              })}
              data-giving-move="up"
              disabled={position <= 1}
              onClick={onMoveUp}
            >
              <FiArrowUp aria-hidden />
            </IconButton>
            <IconButton
              aria-label={t("communities:detail.giving.editor.moveDownAria", {
                label: rowTitle,
              })}
              data-giving-move="down"
              disabled={position >= total}
              onClick={onMoveDown}
            >
              <FiArrowDown aria-hidden />
            </IconButton>
            <IconButton
              aria-label={t("communities:detail.giving.editor.removeAria", {
                label: rowTitle,
              })}
              onClick={onRemove}
            >
              <FiTrash2 aria-hidden />
            </IconButton>
          </div>
        </div>
        <SegmentedControl
          fullWidth
          labelledBy={kindLabelId}
          options={kindOptions}
          value={row.kind}
          onChange={(kind) => onChange({ kind: kind as CommunityGivingKind })}
        />
      </div>
      <FormField
        label={t(`communities:detail.giving.editor.valueLabel.${row.kind}`)}
        error={errorText(errors.value, GIVING_LIMITS.valueMax)}
      >
        <input
          ref={valueInputRef}
          {...VALUE_INPUT_PROPS[row.kind]}
          autoComplete="off"
          placeholder={t(
            `communities:detail.giving.editor.valuePlaceholder.${row.kind}`,
          )}
          value={row.value}
          onChange={(event) => onChange({ value: event.target.value })}
          onBlur={onBlurField}
        />
      </FormField>
      <div className={styles.optionalFields}>
        <FormField
          label={t("communities:detail.giving.editor.labelLabel")}
          helper={t("communities:detail.giving.editor.labelHelper")}
          error={errorText(errors.label, GIVING_LIMITS.labelMax)}
        >
          <input
            type="text"
            autoComplete="off"
            maxLength={GIVING_LIMITS.labelMax}
            value={row.label}
            onChange={(event) => onChange({ label: event.target.value })}
            onBlur={onBlurField}
          />
        </FormField>
        <FormField
          label={t("communities:detail.giving.editor.noteLabel")}
          helper={t("communities:detail.giving.editor.noteHelper")}
          error={errorText(errors.note, GIVING_LIMITS.noteMax)}
        >
          <input
            type="text"
            autoComplete="off"
            maxLength={GIVING_LIMITS.noteMax}
            value={row.note}
            onChange={(event) => onChange({ note: event.target.value })}
            onBlur={onBlurField}
          />
        </FormField>
      </div>
    </fieldset>
  );
}
