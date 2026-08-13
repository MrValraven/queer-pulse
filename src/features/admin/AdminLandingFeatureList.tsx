import { useState } from "react";
import { AnimatePresence, m } from "motion/react";
import { FiChevronUp, FiChevronDown, FiTrash2 } from "react-icons/fi";
import { useMotionPrefs } from "../../app/providers/MotionProvider";
import {
  Avatar,
  Button,
  ConfirmDialog,
  EmptyState,
  SkeletonLine,
} from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { initialsFromName, leadingInitials } from "../../shared/lib/initials";
import { AdminChip, AdminToggle } from "./ui";
import { AdminLandingFeatureEditor } from "./AdminLandingFeatureEditor";
import {
  useLandingFeatures,
  useReorderLandingFeatures,
  useUpdateLandingFeature,
  useDeleteLandingFeature,
} from "./api/useLandingFeatures";
import type { LandingFeatureVM } from "./api/landingFeatures.adapters";
import type { LandingSection } from "./api/landingFeatures.api";
import styles from "./AdminLandingPage.module.css";

/** A short human-readable preview of a feature's copy, so a row is scannable
 *  without opening its editor — the field that reads back best per section. */
function copyPreview(section: LandingSection, copy: Record<string, unknown>) {
  const text =
    section === "member"
      ? copy.quote
      : section === "community"
        ? copy.blurb
        : copy.blurb || copy.cause;
  return typeof text === "string" && text.trim() ? text.trim() : null;
}

/**
 * The ordered, currently-featured slots for `section`: Avatar + name +
 * copy-preview rows with up/down reorder, an active toggle, and remove
 * (behind a confirm). Each row's editor is collapsed by default — clicking
 * "Edit copy" expands `AdminLandingFeatureEditor` inline, and only one row's
 * editor is open at a time so the list stays scannable.
 */
export function AdminLandingFeatureList({
  section,
}: {
  section: LandingSection;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { features, isLoading } = useLandingFeatures(section);
  const reorderFeatures = useReorderLandingFeatures();
  const updateFeature = useUpdateLandingFeature();
  const deleteFeature = useDeleteLandingFeature();

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [pendingRemoveId, setPendingRemoveId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className={styles.list}>
        <SkeletonLine height={84} style={{ borderRadius: 22 }} />
        <SkeletonLine height={84} style={{ borderRadius: 22 }} />
      </div>
    );
  }

  if (features.length === 0) {
    return (
      <EmptyState
        title={t(`admin:landing.list.empty.${section}.title`)}
        description={t(`admin:landing.list.empty.${section}.body`)}
      />
    );
  }

  function moveFeature(index: number, direction: -1 | 1) {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= features.length) return;
    const orderedIds = features.map((feature) => feature.id);
    const [movedId] = orderedIds.splice(index, 1);
    orderedIds.splice(targetIndex, 0, movedId!);
    reorderFeatures.mutate(
      { section, orderedIds },
      { onError: () => showToast(t("admin:landing.list.reorderError")) },
    );
  }

  const pendingRemoveFeature = features.find(
    (feature) => feature.id === pendingRemoveId,
  );

  return (
    <div className={styles.list}>
      {features.map((feature, index) => (
        <AdminLandingFeatureRow
          key={feature.id}
          section={section}
          feature={feature}
          isFirst={index === 0}
          isLast={index === features.length - 1}
          expanded={expandedId === feature.id}
          onToggleExpand={() =>
            setExpandedId((current) =>
              current === feature.id ? null : feature.id,
            )
          }
          onMoveUp={() => moveFeature(index, -1)}
          onMoveDown={() => moveFeature(index, 1)}
          onToggleActive={() =>
            updateFeature.mutate(
              { id: feature.id, active: !feature.active },
              {
                onError: () =>
                  showToast(t("admin:landing.list.activeToggleError")),
              },
            )
          }
          onRemove={() => setPendingRemoveId(feature.id)}
        />
      ))}

      <ConfirmDialog
        open={pendingRemoveFeature != null}
        onClose={() => setPendingRemoveId(null)}
        onConfirm={() => {
          if (!pendingRemoveFeature) return;
          deleteFeature.mutate(
            { id: pendingRemoveFeature.id },
            {
              onSuccess: () => showToast(t("admin:landing.remove.toast")),
              onError: () => showToast(t("admin:landing.remove.error")),
            },
          );
          setPendingRemoveId(null);
        }}
        title={t("admin:landing.remove.title")}
        description={t("admin:landing.remove.body")}
        tone="destructive"
        confirmLabel={t("admin:landing.remove.confirm")}
        loading={deleteFeature.isPending}
      />
    </div>
  );
}

function AdminLandingFeatureRow({
  section,
  feature,
  isFirst,
  isLast,
  expanded,
  onToggleExpand,
  onMoveUp,
  onMoveDown,
  onToggleActive,
  onRemove,
}: {
  section: LandingSection;
  feature: LandingFeatureVM;
  isFirst: boolean;
  isLast: boolean;
  expanded: boolean;
  onToggleExpand: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onToggleActive: () => void;
  onRemove: () => void;
}) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const name = feature.target?.name ?? t("admin:landing.list.unknownTarget");
  const preview = copyPreview(section, feature.copy);

  return (
    <div className={styles.featureRow}>
      <div className={styles.featureRowMain}>
        <Avatar
          initials={
            section === "community"
              ? leadingInitials(name)
              : initialsFromName(name)
          }
          src={feature.target?.avatarUrl ?? undefined}
          name={feature.target?.name ?? undefined}
          size={44}
        />
        <div className={styles.featureRowText}>
          <div className={styles.featureRowTop}>
            <span className={styles.featureRowName}>{name}</span>
            {!feature.active && (
              <AdminChip tone="ghost">
                {t("admin:landing.list.inactivePill")}
              </AdminChip>
            )}
            {!feature.eligible && feature.hiddenLabel && (
              <AdminChip tone="warn" dot>
                {feature.hiddenLabel}
              </AdminChip>
            )}
          </div>
          <p className={styles.featureRowPreview}>
            {preview ?? t("admin:landing.list.previewEmpty")}
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
            aria-label={t("admin:landing.list.moveUpAria", { name })}
          >
            <FiChevronUp aria-hidden />
          </button>
          <button
            type="button"
            className={styles.orderBtn}
            onClick={onMoveDown}
            disabled={isLast}
            aria-label={t("admin:landing.list.moveDownAria", { name })}
          >
            <FiChevronDown aria-hidden />
          </button>
        </div>

        <div className={styles.rowRightActions}>
          <Button
            variant="ghost"
            size="md"
            onClick={onToggleExpand}
            aria-expanded={expanded}
          >
            {t(
              expanded
                ? "admin:landing.editor.collapseCta"
                : "admin:landing.editor.editCta",
            )}
          </Button>
          <div className={styles.activeToggleGroup}>
            <AdminToggle
              checked={feature.active}
              onChange={onToggleActive}
              label={t("admin:landing.list.activeToggleAria", { name })}
            />
            {t("admin:landing.list.activeToggleLabel")}
          </div>
          <button
            type="button"
            className={styles.orderBtn}
            onClick={onRemove}
            aria-label={t("admin:landing.remove.cta")}
          >
            <FiTrash2 aria-hidden />
          </button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {expanded && (
          <m.div
            key="editor"
            className={styles.editorReveal}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{
              duration: reducedMotion ? 0 : 0.24,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <div className={styles.editorWrap}>
              <AdminLandingFeatureEditor
                section={section}
                feature={feature}
                onSaved={onToggleExpand}
              />
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}
