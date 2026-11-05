import { AnimatePresence } from "motion/react";
import { FiLayers } from "react-icons/fi";
import type { VjPackDTO } from "../../../shared/contracts/vj";
import { Collapse } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { VjReasonLine } from "../VjReasonLine";
import { VjPackCreateForm } from "./VjPackCreateForm";
import { VjPackRow } from "./VjPackRow";
import { useVjPackOrder } from "./useVjPackOrder";
import styles from "./VjPacks.module.css";

export interface VjPackListProps {
  packs: VjPackDTO[];
  /** The pack on show; null is All clips. */
  selectedPackId: string | null;
  /** How many clips the library holds; null while it is still loading. */
  libraryClipCount: number | null;
  onSelect: (packId: string | null) => void;
}

/** The first row: every clip in the library, outside any pack order. */
function AllClipsRow({
  isSelected,
  libraryClipCount,
  onSelect,
}: {
  isSelected: boolean;
  libraryClipCount: number | null;
  onSelect: () => void;
}) {
  const { t } = useTranslation();
  return (
    <button
      type="button"
      className={styles.allRow}
      aria-current={isSelected ? "page" : undefined}
      onClick={onSelect}
    >
      <span className={styles.cover} aria-hidden="true">
        <FiLayers fill="none" focusable="false" />
      </span>
      <span className={styles.text}>
        <span className={styles.name}>{t("vj:packs.allClips")}</span>
        <span
          className={styles.meta}
          data-ready={libraryClipCount === null ? undefined : "true"}
        >
          {libraryClipCount === null
            ? ""
            : t("vj:packs.clipCount", { count: libraryClipCount })}
        </span>
      </span>
    </button>
  );
}

/**
 * The packs rail: All clips, then each pack in its saved order (drag the grip
 * or use the up and down buttons), then New pack. A move is announced in a
 * status line and a refused save is named under the list.
 */
export function VjPackList({
  packs,
  selectedPackId,
  libraryClipCount,
  onSelect,
}: VjPackListProps) {
  const { t } = useTranslation();
  const {
    orderedPacks,
    status,
    error,
    moveBy,
    draggingIndex,
    gripHandlers,
    listRef,
  } = useVjPackOrder(packs);
  const total = orderedPacks.length;

  return (
    <nav className={styles.list} aria-label={t("vj:packs.heading")}>
      <h2 className={styles.heading}>{t("vj:packs.heading")}</h2>
      <AllClipsRow
        isSelected={selectedPackId === null}
        libraryClipCount={libraryClipCount}
        onSelect={() => onSelect(null)}
      />
      <ol ref={listRef} className={styles.rows}>
        <AnimatePresence initial={false}>
          {orderedPacks.map((pack, packIndex) => (
            <VjPackRow
              key={pack.id}
              pack={pack}
              position={packIndex}
              total={total}
              isSelected={pack.id === selectedPackId}
              isDragging={draggingIndex === packIndex}
              onSelect={() => onSelect(pack.id)}
              onMove={(direction) => moveBy(packIndex, direction)}
              gripProps={gripHandlers(packIndex)}
            />
          ))}
        </AnimatePresence>
      </ol>
      <Collapse isOpen={packs.length === 0}>
        <p className={styles.empty}>{t("vj:packs.empty")}</p>
      </Collapse>
      <p role="status" className="visuallyHidden">
        {status ?? ""}
      </p>
      <VjReasonLine error={error} />
      <VjPackCreateForm onCreated={(pack) => onSelect(pack.id)} />
    </nav>
  );
}
