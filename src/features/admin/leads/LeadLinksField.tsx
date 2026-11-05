import { useEffect, useId, useRef } from "react";
import { AnimatePresence, m, useIsPresent } from "motion/react";
import { FiExternalLink, FiLink, FiPlus, FiTrash2 } from "react-icons/fi";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { Button, Collapse, IconButton } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { LEAD_LINK_MAX, LEAD_LINKS_MAX } from "./api/leads.types";
import { leadLinkKey } from "./api/leadLinkKey";
import {
  newLeadLinkRow,
  withLinkScheme,
  type LeadFieldError,
  type LeadLinkRow,
} from "./leadForm.model";
import type { LeadFieldsProps } from "./LeadFormFields";
import { leadLinkPlatform } from "./leadLinkPlatform";
import { LeadRefusalLine } from "./LeadRefusalLine";
import styles from "./LeadForm.module.css";

/** Seconds a row takes to grow in or fold away. */
const LINK_ROW_DURATION_S = 0.2;
/** The app's front-loaded ease, the same curve `Collapse` folds with. */
const LINK_ROW_EASE = [0.22, 0.68, 0.16, 1] as const;
/** The open-link slot's width while it holds a link: one 44px target. */
const OPEN_SLOT_WIDTH = 44;

interface LeadLinkRowItemProps {
  row: LeadLinkRow;
  position: number;
  inputId: string;
  hintId: string;
  refusal: LeadFieldError | null;
  openLeadPath: (leadId: string) => string;
  isDisabled: boolean;
  registerInput: (rowKey: string, input: HTMLInputElement | null) => void;
  onTextChange: (text: string) => void;
  onRemove: () => void;
}

/**
 * One link row: the platform icon read live from what is typed, the input,
 * an "open in a new tab" link once the text is a real link, and Remove link.
 * The row grows in and folds away inside `AnimatePresence`, and turns inert
 * while it leaves, so focus never lands on a row on its way out.
 */
function LeadLinkRowItem({
  row,
  position,
  inputId,
  hintId,
  refusal,
  openLeadPath,
  isDisabled,
  registerInput,
  onTextChange,
  onRemove,
}: LeadLinkRowItemProps) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const isPresent = useIsPresent();
  const duration = reducedMotion ? 0 : LINK_ROW_DURATION_S;
  const link = withLinkScheme(row.text);
  const isEmpty = link === "";
  const PlatformIcon = isEmpty ? FiLink : leadLinkPlatform(link).icon;
  const iconKey = isEmpty ? "empty" : leadLinkPlatform(link).id;
  const isOpenable = !isEmpty && leadLinkKey(link) !== null;
  const refusalId = `${inputId}-refusal`;

  return (
    <m.li
      layout="position"
      className={styles.linkRow}
      inert={!isPresent}
      initial={{ height: 0, opacity: 0, overflow: "hidden" }}
      animate={{ height: "auto", opacity: 1, overflow: "visible" }}
      exit={{
        height: 0,
        opacity: 0,
        overflow: "hidden",
        transition: {
          duration,
          ease: LINK_ROW_EASE,
          overflow: { duration: 0 },
        },
      }}
      transition={{
        duration,
        ease: LINK_ROW_EASE,
        overflow: { duration: 0, delay: duration },
      }}
    >
      <div className={styles.linkRowInner}>
        <div className={styles.linkControls}>
          <div className={styles.linkInputShell}>
            <AnimatePresence initial={false}>
              <m.span
                key={iconKey}
                className={styles.linkPlatformIcon}
                aria-hidden
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration }}
              >
                <PlatformIcon />
              </m.span>
            </AnimatePresence>
            <input
              id={inputId}
              ref={(input) => registerInput(row.rowKey, input)}
              type="url"
              inputMode="url"
              className={styles.linkInput}
              value={row.text}
              maxLength={LEAD_LINK_MAX}
              placeholder={t("admin:leads.field.linkPlaceholder")}
              autoComplete="off"
              disabled={isDisabled}
              aria-label={t("admin:leads.field.linkLabel", { position })}
              aria-invalid={refusal !== null || undefined}
              aria-describedby={
                refusal !== null ? `${hintId} ${refusalId}` : hintId
              }
              onChange={(event) => onTextChange(event.target.value)}
            />
          </div>
          {/* The slot opens to 44px with the first real link and folds to
              nothing while there is none to open, so an empty row keeps its
              width for the input and typing never makes the input jump. */}
          <m.span
            className={styles.linkOpenSlot}
            initial={false}
            animate={{
              width: isOpenable ? OPEN_SLOT_WIDTH : 0,
              overflow: isOpenable ? "visible" : "hidden",
            }}
            transition={{
              duration,
              ease: LINK_ROW_EASE,
              overflow: { duration: 0, delay: isOpenable ? duration : 0 },
            }}
          >
            <AnimatePresence initial={false}>
              {isOpenable ? (
                <m.span
                  key="open"
                  className={styles.linkOpen}
                  initial={{ opacity: 0, scale: reducedMotion ? 1 : 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: reducedMotion ? 1 : 0.85 }}
                  transition={{ duration }}
                >
                  <Button
                    variant="icon"
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={t("admin:leads.field.openLinkAria", {
                      position,
                    })}
                  >
                    <FiExternalLink aria-hidden />
                  </Button>
                </m.span>
              ) : null}
            </AnimatePresence>
          </m.span>
          <IconButton
            aria-label={t("admin:leads.field.removeLinkAria", { position })}
            disabled={isDisabled}
            onClick={onRemove}
          >
            <FiTrash2 aria-hidden />
          </IconButton>
        </div>
        <LeadRefusalLine
          error={refusal}
          openLeadPath={openLeadPath}
          id={refusalId}
        />
      </div>
    </m.li>
  );
}

/**
 * The links of a lead, one input per row. Add link appends an empty row and
 * moves focus to it, up to {@link LEAD_LINKS_MAX} rows; Remove link takes a
 * row out and hands focus to the row now in its place (removing the only
 * row empties it). A link refusal shows under the row it names, or under
 * the whole list when it names no row.
 */
export function LeadLinksField({
  idPrefix,
  values,
  onChange,
  fieldError,
  openLeadPath,
  isDisabled = false,
}: LeadFieldsProps) {
  const { t } = useTranslation();
  const labelId = useId();
  const hintId = useId();
  const fullId = useId();
  const inputsRef = useRef(new Map<string, HTMLInputElement>());
  const pendingFocusKeyRef = useRef<string | null>(null);
  const rows = values.links;
  const isFull = rows.length >= LEAD_LINKS_MAX;
  const linksRefusal = fieldError?.field === "links" ? fieldError : null;
  const refusedRowIndex = linksRefusal?.rowIndex ?? null;
  const isRowRefusal =
    refusedRowIndex !== null && refusedRowIndex < rows.length;
  const listRefusal = isRowRefusal ? null : linksRefusal;
  const listRefusalId = `${idPrefix}-links-refusal`;

  // Focus follows an add or a remove once the new rows are on the page.
  useEffect(() => {
    const rowKey = pendingFocusKeyRef.current;
    if (rowKey === null) return;
    pendingFocusKeyRef.current = null;
    inputsRef.current.get(rowKey)?.focus();
  }, [rows]);

  function registerInput(rowKey: string, input: HTMLInputElement | null) {
    if (input === null) inputsRef.current.delete(rowKey);
    else inputsRef.current.set(rowKey, input);
  }

  function setRows(links: LeadLinkRow[], focusRowKey: string | null) {
    pendingFocusKeyRef.current = focusRowKey;
    onChange({ ...values, links });
  }

  function addRow() {
    if (isFull || isDisabled) return;
    const row = newLeadLinkRow();
    setRows([...rows, row], row.rowKey);
  }

  function removeRow(rowIndex: number) {
    if (rows.length <= 1) {
      const onlyRow = rows[0] ?? newLeadLinkRow();
      setRows([{ ...onlyRow, text: "" }], onlyRow.rowKey);
      return;
    }
    const remaining = rows.filter((_row, index) => index !== rowIndex);
    const focusRow = remaining[Math.min(rowIndex, remaining.length - 1)];
    setRows(remaining, focusRow?.rowKey ?? null);
  }

  function changeText(rowIndex: number, text: string) {
    const links = rows.map((row, index) =>
      index === rowIndex ? { ...row, text } : row,
    );
    onChange({ ...values, links });
  }

  return (
    <div
      className={styles.fieldBlock}
      role="group"
      aria-labelledby={labelId}
      aria-describedby={listRefusal !== null ? listRefusalId : undefined}
    >
      <span id={labelId} className={styles.groupLabel}>
        {t("admin:leads.field.links")}
      </span>
      <p id={hintId} className={styles.groupHint}>
        {t("admin:leads.field.linksHint")}
      </p>
      <ul className={styles.linkList}>
        <AnimatePresence initial={false}>
          {rows.map((row, rowIndex) => (
            <LeadLinkRowItem
              key={row.rowKey}
              row={row}
              position={rowIndex + 1}
              inputId={`${idPrefix}-link-${row.rowKey}`}
              hintId={hintId}
              refusal={
                isRowRefusal && refusedRowIndex === rowIndex
                  ? linksRefusal
                  : null
              }
              openLeadPath={openLeadPath}
              isDisabled={isDisabled}
              registerInput={registerInput}
              onTextChange={(text) => changeText(rowIndex, text)}
              onRemove={() => removeRow(rowIndex)}
            />
          ))}
        </AnimatePresence>
      </ul>
      <LeadRefusalLine
        error={listRefusal}
        openLeadPath={openLeadPath}
        id={listRefusalId}
      />
      <div className={styles.linkAddRow}>
        <Button
          variant="ghost"
          size="sm"
          aria-disabled={isFull || isDisabled || undefined}
          aria-describedby={isFull ? fullId : undefined}
          onClick={addRow}
        >
          <FiPlus aria-hidden />
          {t("admin:leads.field.addLink")}
        </Button>
      </div>
      <Collapse isOpen={isFull}>
        <p id={fullId} className={styles.groupHint}>
          {t("admin:leads.field.linksFull", { max: LEAD_LINKS_MAX })}
        </p>
      </Collapse>
    </div>
  );
}
