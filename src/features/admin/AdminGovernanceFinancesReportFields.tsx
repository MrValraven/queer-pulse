import type { ReactNode } from "react";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import { Button, IconButton, Toggle } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { AmountInput } from "./AdminGovernanceFinancesEditCells";
import {
  patchRow,
  type NoteDraft,
  type PartnerDraft,
  type ReserveDraft,
  type StatDraft,
} from "./adminGovernanceFinancesReport.utils";
import styles from "./AdminGovernanceFinancesEdit.module.css";

/**
 * One editable list in the "Edit public report" dialog: a titled table, a row
 * per entry with a remove control, and an add button under it. `columns` are
 * the header labels; each row renders its own cells.
 */
function ListTable({
  title,
  columns,
  rowCount,
  addLabel,
  onAdd,
  children,
}: {
  title: string;
  columns: string[];
  rowCount: number;
  addLabel: string;
  onAdd: () => void;
  children: ReactNode;
}) {
  const { t } = useTranslation();
  return (
    <section className={styles.section}>
      <div className={styles.sectionHead}>
        <h4 className={styles.sectionTitle}>{title}</h4>
      </div>
      {rowCount === 0 ? (
        <p className={styles.rowHint}>
          {t("admin:governance.finances.report.empty")}
        </p>
      ) : (
        <div className={styles.tableWrap}>
          <table className={`${styles.table} ${styles.tableReport}`}>
            <thead>
              <tr>
                {columns.map((column) => (
                  <th key={column} scope="col">
                    {column}
                  </th>
                ))}
                <th scope="col" className={styles.colAction}>
                  <span className="visuallyHidden">
                    {t("admin:governance.finances.report.col.remove")}
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>{children}</tbody>
          </table>
        </div>
      )}
      <div>
        <Button variant="ghost" size="sm" onClick={onAdd}>
          <FiPlus aria-hidden />
          {addLabel}
        </Button>
      </div>
    </section>
  );
}

/** A plain text cell, named for assistive tech by column and row. */
function TextCell({
  column,
  position,
  value,
  maxLength,
  onChange,
}: {
  column: string;
  position: number;
  value: string;
  maxLength: number;
  onChange: (next: string) => void;
}) {
  const { t } = useTranslation();
  return (
    <td data-label={column}>
      <input
        type="text"
        className={styles.noteInput}
        aria-label={t("admin:governance.finances.report.aria.field", {
          column,
          position,
        })}
        value={value}
        maxLength={maxLength}
        onChange={(event) => onChange(event.target.value)}
      />
    </td>
  );
}

function RemoveCell({
  position,
  onRemove,
}: {
  position: number;
  onRemove: () => void;
}) {
  const { t } = useTranslation();
  return (
    <td className={styles.colAction}>
      <IconButton
        size="sm"
        aria-label={t("admin:governance.finances.report.remove", { position })}
        onClick={onRemove}
      >
        <FiTrash2 aria-hidden />
      </IconButton>
    </td>
  );
}

export function StatsFields({
  rows,
  onChange,
}: {
  rows: StatDraft[];
  onChange: (rows: StatDraft[]) => void;
}) {
  const { t } = useTranslation();
  const column = (key: string) =>
    t(`admin:governance.finances.report.col.${key}`);
  return (
    <ListTable
      title={t("admin:governance.finances.report.section.stats")}
      columns={[
        column("figure"),
        column("label"),
        column("trend"),
        column("rising"),
      ]}
      rowCount={rows.length}
      addLabel={t("admin:governance.finances.report.add.stat")}
      onAdd={() => onChange([...rows, { n: "", l: "", trend: "", up: false }])}
    >
      {rows.map((stat, index) => (
        <tr key={index}>
          <TextCell
            column={column("figure")}
            position={index + 1}
            value={stat.n}
            maxLength={40}
            onChange={(n) => onChange(patchRow(rows, index, { n }))}
          />
          <TextCell
            column={column("label")}
            position={index + 1}
            value={stat.l}
            maxLength={80}
            onChange={(l) => onChange(patchRow(rows, index, { l }))}
          />
          <TextCell
            column={column("trend")}
            position={index + 1}
            value={stat.trend}
            maxLength={80}
            onChange={(trend) => onChange(patchRow(rows, index, { trend }))}
          />
          <td data-label={column("rising")}>
            <Toggle
              checked={stat.up}
              onChange={(up) => onChange(patchRow(rows, index, { up }))}
              label={t("admin:governance.finances.report.aria.field", {
                column: column("rising"),
                position: index + 1,
              })}
            />
          </td>
          <RemoveCell
            position={index + 1}
            onRemove={() =>
              onChange(rows.filter((_, rowIndex) => rowIndex !== index))
            }
          />
        </tr>
      ))}
    </ListTable>
  );
}

export function NotesFields({
  rows,
  onChange,
}: {
  rows: NoteDraft[];
  onChange: (rows: NoteDraft[]) => void;
}) {
  const { t } = useTranslation();
  const column = (key: string) =>
    t(`admin:governance.finances.report.col.${key}`);
  return (
    <ListTable
      title={t("admin:governance.finances.report.section.notes")}
      columns={[column("lead"), column("text")]}
      rowCount={rows.length}
      addLabel={t("admin:governance.finances.report.add.note")}
      onAdd={() => onChange([...rows, { title: "", body: "" }])}
    >
      {rows.map((note, index) => (
        <tr key={index}>
          <TextCell
            column={column("lead")}
            position={index + 1}
            value={note.title}
            maxLength={120}
            onChange={(title) => onChange(patchRow(rows, index, { title }))}
          />
          <TextCell
            column={column("text")}
            position={index + 1}
            value={note.body}
            maxLength={400}
            onChange={(body) => onChange(patchRow(rows, index, { body }))}
          />
          <RemoveCell
            position={index + 1}
            onRemove={() =>
              onChange(rows.filter((_, rowIndex) => rowIndex !== index))
            }
          />
        </tr>
      ))}
    </ListTable>
  );
}

export function PartnersFields({
  rows,
  onChange,
}: {
  rows: PartnerDraft[];
  onChange: (rows: PartnerDraft[]) => void;
}) {
  const { t } = useTranslation();
  const column = (key: string) =>
    t(`admin:governance.finances.report.col.${key}`);
  return (
    <ListTable
      title={t("admin:governance.finances.report.section.partners")}
      columns={[column("name"), column("amount"), column("scope")]}
      rowCount={rows.length}
      addLabel={t("admin:governance.finances.report.add.partner")}
      onAdd={() => onChange([...rows, { name: "", amount: "", scope: "" }])}
    >
      {rows.map((partner, index) => (
        <tr key={index}>
          <TextCell
            column={column("name")}
            position={index + 1}
            value={partner.name}
            maxLength={120}
            onChange={(name) => onChange(patchRow(rows, index, { name }))}
          />
          <td data-label={column("amount")}>
            <AmountInput
              ariaLabel={t("admin:governance.finances.report.aria.field", {
                column: column("amount"),
                position: index + 1,
              })}
              value={partner.amount}
              isBlankAllowed={false}
              unit="currency"
              onChange={(amount) => onChange(patchRow(rows, index, { amount }))}
            />
          </td>
          <TextCell
            column={column("scope")}
            position={index + 1}
            value={partner.scope}
            maxLength={120}
            onChange={(scope) => onChange(patchRow(rows, index, { scope }))}
          />
          <RemoveCell
            position={index + 1}
            onRemove={() =>
              onChange(rows.filter((_, rowIndex) => rowIndex !== index))
            }
          />
        </tr>
      ))}
    </ListTable>
  );
}

/** The operational reserve: what is held and the target. Both empty hides the
 *  reserve from the public report. */
export function ReserveFields({
  reserve,
  onChange,
}: {
  reserve: ReserveDraft;
  onChange: (reserve: ReserveDraft) => void;
}) {
  const { t } = useTranslation();
  return (
    <section className={styles.section}>
      <div className={styles.sectionHead}>
        <h4 className={styles.sectionTitle}>
          {t("admin:governance.finances.report.section.reserve")}
        </h4>
        <span className={styles.sectionMeta}>
          {t("admin:governance.finances.report.reserveHint")}
        </span>
      </div>
      <div className={styles.reserveFields}>
        {(["current", "target"] as const).map((field) => {
          const label = t(
            `admin:governance.finances.report.col.${field === "current" ? "held" : "target"}`,
          );
          return (
            <div key={field} className={styles.reserveField}>
              <span className={styles.reserveLabel} aria-hidden>
                {label}
              </span>
              <AmountInput
                ariaLabel={label}
                value={reserve[field]}
                isBlankAllowed
                unit="currency"
                onChange={(value) => onChange({ ...reserve, [field]: value })}
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}
