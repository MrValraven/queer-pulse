import { useState } from "react";
import { FiChevronDown, FiChevronUp, FiPlus, FiTrash2 } from "react-icons/fi";
import {
  Avatar,
  Button,
  ConfirmDialog,
  EmptyState,
  SkeletonLine,
} from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { initialsFromName } from "../../shared/lib/initials";
import { AdminChip, AdminToggle } from "./ui";
import { AdminPressKitFields } from "./AdminPressKitFields";
import {
  emptyPressKitValue,
  isPressKitValid,
  type PressKitFieldsValue,
  type PressKitKind,
} from "./adminPressKitFields.utils";
import styles from "./AdminPressKitPage.module.css";

/** One list row, flattened to what the presentational list needs — the raw
 *  DTO's display heading + sub line, its active flag, an optional avatar (only
 *  contacts carry one) and the seed value for its inline editor. */
export interface PressRowVM {
  id: string;
  active: boolean;
  title: string;
  sub: string;
  avatarUrl: string | null;
  seed: PressKitFieldsValue;
}

export interface AdminPressKitListProps {
  kind: PressKitKind;
  rows: PressRowVM[];
  isLoading: boolean;
  creating: boolean;
  deleting: boolean;
  onCreate: (value: PressKitFieldsValue, done: () => void) => void;
  onSaveEdit: (
    id: string,
    value: PressKitFieldsValue,
    done: () => void,
  ) => void;
  onToggleActive: (row: PressRowVM) => void;
  onReorder: (orderedIds: string[]) => void;
  onDelete: (id: string) => void;
}

/**
 * The ordered, currently-published rows for one press-kit tab: an add form up
 * top, then title + sub rows with up/down reorder, an active toggle, inline
 * edit and remove (behind a confirm). Adapts `AdminLandingFeatureList` to the
 * press-kit coverage/contact fields.
 */
export function AdminPressKitList({
  kind,
  rows,
  isLoading,
  creating,
  deleting,
  onCreate,
  onSaveEdit,
  onToggleActive,
  onReorder,
  onDelete,
}: AdminPressKitListProps) {
  const { t } = useTranslation();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [pendingRemoveId, setPendingRemoveId] = useState<string | null>(null);

  function moveRow(index: number, direction: -1 | 1) {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= rows.length) return;
    const orderedIds = rows.map((row) => row.id);
    const [movedId] = orderedIds.splice(index, 1);
    orderedIds.splice(targetIndex, 0, movedId!);
    onReorder(orderedIds);
  }

  const pendingRemoveRow = rows.find((row) => row.id === pendingRemoveId);

  return (
    <div className={styles.list}>
      <PressKitAddForm kind={kind} creating={creating} onCreate={onCreate} />

      {isLoading ? (
        <>
          <SkeletonLine height={84} style={{ borderRadius: 22 }} />
          <SkeletonLine height={84} style={{ borderRadius: 22 }} />
        </>
      ) : rows.length === 0 ? (
        <EmptyState
          title={t(`admin:pressKit.list.empty.${kind}.title`)}
          description={t(`admin:pressKit.list.empty.${kind}.body`)}
        />
      ) : (
        rows.map((row, index) => (
          <PressKitRow
            key={row.id}
            kind={kind}
            row={row}
            isFirst={index === 0}
            isLast={index === rows.length - 1}
            expanded={expandedId === row.id}
            onToggleExpand={() =>
              setExpandedId((current) => (current === row.id ? null : row.id))
            }
            onMoveUp={() => moveRow(index, -1)}
            onMoveDown={() => moveRow(index, 1)}
            onToggleActive={() => onToggleActive(row)}
            onRemove={() => setPendingRemoveId(row.id)}
            onSaveEdit={(value, done) => onSaveEdit(row.id, value, done)}
          />
        ))
      )}

      <ConfirmDialog
        open={pendingRemoveRow != null}
        onClose={() => setPendingRemoveId(null)}
        onConfirm={() => {
          if (!pendingRemoveRow) return;
          onDelete(pendingRemoveRow.id);
          setPendingRemoveId(null);
        }}
        title={t(`admin:pressKit.remove.${kind}.title`)}
        description={t(`admin:pressKit.remove.${kind}.body`)}
        tone="destructive"
        confirmLabel={t("admin:pressKit.remove.confirm")}
        loading={deleting}
      />
    </div>
  );
}

function PressKitAddForm({
  kind,
  creating,
  onCreate,
}: {
  kind: PressKitKind;
  creating: boolean;
  onCreate: (value: PressKitFieldsValue, done: () => void) => void;
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState<PressKitFieldsValue>(emptyPressKitValue());

  if (!open) {
    return (
      <div className={styles.addBar}>
        <Button variant="ghost" size="md" onClick={() => setOpen(true)}>
          <FiPlus aria-hidden /> {t(`admin:pressKit.add.${kind}.cta`)}
        </Button>
      </div>
    );
  }

  return (
    <div className={styles.addCard}>
      <AdminPressKitFields
        kind={kind}
        value={value}
        onChange={(patch) => setValue((current) => ({ ...current, ...patch }))}
      />
      <div className={styles.editorActions}>
        <Button
          variant="ghost"
          size="md"
          onClick={() => {
            setOpen(false);
            setValue(emptyPressKitValue());
          }}
        >
          {t("admin:common.cancel")}
        </Button>
        <Button
          variant="primary"
          size="md"
          disabled={!isPressKitValid(kind, value) || creating}
          onClick={() =>
            onCreate(value, () => {
              setOpen(false);
              setValue(emptyPressKitValue());
            })
          }
        >
          {t(`admin:pressKit.add.${kind}.submit`)}
        </Button>
      </div>
    </div>
  );
}

function PressKitRow({
  kind,
  row,
  isFirst,
  isLast,
  expanded,
  onToggleExpand,
  onMoveUp,
  onMoveDown,
  onToggleActive,
  onRemove,
  onSaveEdit,
}: {
  kind: PressKitKind;
  row: PressRowVM;
  isFirst: boolean;
  isLast: boolean;
  expanded: boolean;
  onToggleExpand: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onToggleActive: () => void;
  onRemove: () => void;
  onSaveEdit: (value: PressKitFieldsValue, done: () => void) => void;
}) {
  const { t } = useTranslation();
  const [editValue, setEditValue] = useState<PressKitFieldsValue>(row.seed);
  const [saving, setSaving] = useState(false);

  function beginEdit() {
    if (!expanded) setEditValue(row.seed);
    onToggleExpand();
  }

  return (
    <div className={styles.featureRow}>
      <div className={styles.featureRowMain}>
        {kind === "team" && (
          <Avatar
            initials={initialsFromName(row.title)}
            src={row.avatarUrl ?? undefined}
            name={row.title}
            size={44}
          />
        )}
        <div className={styles.featureRowText}>
          <div className={styles.featureRowTop}>
            <span className={styles.featureRowName}>{row.title}</span>
            {!row.active && (
              <AdminChip tone="ghost">
                {t("admin:pressKit.list.inactivePill")}
              </AdminChip>
            )}
          </div>
          <p className={styles.featureRowPreview}>
            {row.sub || t("admin:pressKit.list.previewEmpty")}
          </p>
        </div>
      </div>

      <div className={styles.featureRowActions}>
        <div className={styles.orderBtns}>
          <button
            type="button"
            className={styles.orderBtn}
            onClick={onMoveUp}
            disabled={isFirst}
            aria-label={t("admin:pressKit.list.moveUpAria", {
              name: row.title,
            })}
          >
            <FiChevronUp aria-hidden />
          </button>
          <button
            type="button"
            className={styles.orderBtn}
            onClick={onMoveDown}
            disabled={isLast}
            aria-label={t("admin:pressKit.list.moveDownAria", {
              name: row.title,
            })}
          >
            <FiChevronDown aria-hidden />
          </button>
        </div>

        <div className={styles.rowRightActions}>
          <Button
            variant="ghost"
            size="md"
            onClick={beginEdit}
            aria-expanded={expanded}
          >
            {t(
              expanded
                ? "admin:pressKit.editor.close"
                : "admin:pressKit.editor.edit",
            )}
          </Button>
          <div className={styles.activeToggleGroup}>
            <AdminToggle
              checked={row.active}
              onChange={onToggleActive}
              label={t("admin:pressKit.list.activeToggleAria", {
                name: row.title,
              })}
            />
            {t("admin:pressKit.list.activeToggleLabel")}
          </div>
          <button
            type="button"
            className={styles.orderBtn}
            onClick={onRemove}
            aria-label={t("admin:pressKit.remove.cta")}
          >
            <FiTrash2 aria-hidden />
          </button>
        </div>
      </div>

      {expanded && (
        <div className={styles.editorWrap}>
          <AdminPressKitFields
            kind={kind}
            value={editValue}
            onChange={(patch) =>
              setEditValue((current) => ({ ...current, ...patch }))
            }
          />
          <div className={styles.editorActions}>
            <Button
              variant="primary"
              size="md"
              disabled={!isPressKitValid(kind, editValue) || saving}
              onClick={() => {
                setSaving(true);
                onSaveEdit(editValue, () => {
                  setSaving(false);
                  onToggleExpand();
                });
              }}
            >
              {t("admin:pressKit.editor.save")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
