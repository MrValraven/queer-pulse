import {
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { AnimatePresence } from "motion/react";
import {
  FiAperture,
  FiEdit2,
  FiFilm,
  FiLayers,
  FiTrash2,
} from "react-icons/fi";
import type {
  VjClipDTO,
  VjPackDTO,
  VjSceneDTO,
} from "../../../../shared/contracts/vj";
import { Collapse, IconButton, Tag } from "../../../../shared/components/ui";
import { intlLocale } from "../../../../shared/i18n/locale";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { VjOrderRow } from "./VjOrderRow";
import { VjSceneDeleteDialog } from "./VjSceneDeleteDialog";
import { VjSceneEditForm } from "./VjSceneEditForm";
import {
  vjSceneSummaryOf,
  type VjSceneSourceSummary,
  type VjSceneSummary,
} from "./vjSceneSummary";
import styles from "./VjScenes.module.css";

const THUMB_SIZE = 40;

export interface VjSceneRowProps {
  scene: VjSceneDTO;
  packs: readonly VjPackDTO[];
  clipsById: ReadonlyMap<string, VjClipDTO>;
  /** The row's index in the list, from 0. */
  position: number;
  total: number;
  isDragging: boolean;
  gripProps: { onPointerDown: (event: ReactPointerEvent) => void };
  onMove: (direction: -1 | 1) => void;
}

/** The source clip's thumbnail, or a quiet mark for what the scene plays. */
function SceneThumb({ source }: { source: VjSceneSourceSummary }) {
  const thumbnailUrl = source.kind === "clip" ? source.thumbnailUrl : null;
  return (
    <span className={styles.thumb} aria-hidden="true">
      {thumbnailUrl !== null ? (
        <img
          src={thumbnailUrl}
          width={THUMB_SIZE}
          height={THUMB_SIZE}
          alt=""
          loading="lazy"
          decoding="async"
        />
      ) : source.kind === "generator" ? (
        <FiAperture fill="none" focusable="false" />
      ) : source.kind === "keepsLive" ? (
        <FiLayers fill="none" focusable="false" />
      ) : (
        <FiFilm fill="none" focusable="false" />
      )}
    </span>
  );
}

/** The two meta lines: what plays, then the effects and extra layers. */
function SceneMeta({ summary }: { summary: VjSceneSummary }) {
  const { t, language } = useTranslation();
  const { source } = summary;
  const sourceText =
    source.kind === "clip"
      ? source.title === null
        ? t("vj:libraryScenes.sourceClipGone")
        : t("vj:libraryScenes.sourceClip", { title: source.title })
      : source.kind === "generator"
        ? t("vj:libraryScenes.sourceGenerator", {
            name: t(`vj:generator.name.${source.generatorId}`),
          })
        : t("vj:libraryScenes.sourceKeepsLive");
  const effectsText =
    summary.effectIds.length === 0
      ? t("vj:libraryScenes.effectsNone")
      : new Intl.ListFormat(intlLocale(language), {
          style: "long",
          type: "conjunction",
        }).format(
          summary.effectIds.map((effectId) => t(`vj:effect.name.${effectId}`)),
        );
  const extraParts = [
    summary.hasText ? t("vj:libraryScenes.withText") : null,
    summary.hasMix ? t("vj:libraryScenes.withMix") : null,
  ].filter((part): part is string => part !== null);

  return (
    <>
      <p className={styles.meta}>
        <span className={styles.metaPart}>{sourceText}</span>
      </p>
      <p className={styles.meta}>
        {[effectsText, ...extraParts].map((part) => (
          <span key={part} className={styles.metaPart}>
            {part}
          </span>
        ))}
      </p>
    </>
  );
}

/**
 * One saved scene: its thumbnail, name, what it plays, its effects and its
 * pack, with "Edit scene" (name and pack, folding under the row) and "Delete
 * scene" (a confirm dialog). The grip and the up and down buttons come from
 * `VjOrderRow`.
 */
export function VjSceneRow({
  scene,
  packs,
  clipsById,
  position,
  total,
  isDragging,
  gripProps,
  onMove,
}: VjSceneRowProps) {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const editButtonRef = useRef<HTMLButtonElement>(null);
  const summary = vjSceneSummaryOf(scene.look, clipsById);
  const packName =
    packs.find((pack) => pack.id === scene.packId)?.name ??
    t("vj:libraryScenes.packNone");

  const closeEdit = () => {
    setIsEditing(false);
    editButtonRef.current?.focus();
  };

  return (
    <VjOrderRow
      position={position}
      total={total}
      isDragging={isDragging}
      gripProps={gripProps}
      moveUpLabel={t("vj:libraryScenes.moveUp", { name: scene.name })}
      moveDownLabel={t("vj:libraryScenes.moveDown", { name: scene.name })}
      onMove={onMove}
      below={
        <Collapse isOpen={isEditing}>
          <div className={styles.below}>
            <VjSceneEditForm scene={scene} packs={packs} onDone={closeEdit} />
          </div>
        </Collapse>
      }
    >
      <div className={styles.scene}>
        <SceneThumb source={summary.source} />
        <div className={styles.text}>
          <span className={styles.name}>{scene.name}</span>
          <SceneMeta summary={summary} />
        </div>
        <Tag className={styles.tag}>{packName}</Tag>
        <div className={styles.actions}>
          <IconButton
            ref={editButtonRef}
            className={styles.action}
            aria-label={t("vj:libraryScenes.editAria", { name: scene.name })}
            aria-expanded={isEditing}
            tooltip
            onClick={() => setIsEditing((wasEditing) => !wasEditing)}
          >
            <FiEdit2 aria-hidden="true" fill="none" focusable="false" />
          </IconButton>
          <IconButton
            className={styles.action}
            aria-label={t("vj:libraryScenes.deleteAria", { name: scene.name })}
            tooltip={t("vj:libraryScenes.deleteConfirm")}
            onClick={() => setIsDeleteOpen(true)}
          >
            <FiTrash2 aria-hidden="true" fill="none" focusable="false" />
          </IconButton>
        </div>
      </div>
      <AnimatePresence>
        {isDeleteOpen && (
          <VjSceneDeleteDialog
            scene={scene}
            onClose={() => setIsDeleteOpen(false)}
            onDeleted={() => setIsDeleteOpen(false)}
          />
        )}
      </AnimatePresence>
    </VjOrderRow>
  );
}
