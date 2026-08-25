import { useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FiCopy, FiLink, FiX } from "react-icons/fi";
import { SegmentedControl } from "../../../shared/components/ui";
import { useScrollLock, useShareLink } from "../../../shared/hooks";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useLightboxDialog } from "../useLightboxDialog";
import type { SubprofileItemView } from "../api/subprofiles.adapters";
import { WorkRightsFooter } from "../rights/WorkRightsFooter";
import { PoemBlocksView } from "./PoemBlocksView";
import { normalizePoemVersions, poemToPlainText } from "./poemModel";
import styles from "./PoemReaderModal.module.css";

const NO_MOVE = () => {};

export interface PoemReaderModalProps {
  item: SubprofileItemView;
  /** The persona's display name, shown in the copyright footer. */
  authorName: string;
  /** Absolute, deep-linkable URL for this exact poem (persona share URL +
   *  `?poem=<slug>`) — copied by the "Copy link" affordance below. */
  shareUrl: string;
  onClose: () => void;
}

/**
 * The centered, wider-than-tall poem reading modal. Portaled `role="dialog"`
 * with the shared focus-trap/Escape behaviour (`useLightboxDialog`); a
 * single-poem reader, so ←/→ move is a no-op. `prefers-reduced-motion` is
 * honoured in the CSS module's open transition.
 */
export function PoemReaderModal({
  item,
  authorName,
  shareUrl,
  onClose,
}: PoemReaderModalProps) {
  const { t } = useTranslation();
  useScrollLock();
  const dialogRef = useRef<HTMLDivElement>(null);
  useLightboxDialog(dialogRef, { onClose, onMove: NO_MOVE });
  const { share: copyShareLink } = useShareLink({
    copied: t("subprofiles:share.copied"),
  });
  const { share: copyPoemText } = useShareLink({
    copied: t("subprofiles:poem.reader.copied"),
  });

  const meta = [item.subtitle, item.date].filter(Boolean).join(" · ");

  // Named translations of this poem (always ≥1; a single-version poem reads as
  // one default version). Readers cycle the rest via the tab strip below.
  const versions = useMemo(
    () =>
      normalizePoemVersions(
        item.structured?.poemVersions ?? null,
        item.structured?.poem ?? null,
      ),
    [item.structured],
  );
  const [activeId, setActiveId] = useState<string>(() => versions[0]!.id);
  const activeIndex = Math.max(
    0,
    versions.findIndex((version) => version.id === activeId),
  );
  const activeVersion = versions[activeIndex]!;

  function versionLabel(
    version: (typeof versions)[number],
    index: number,
  ): string {
    return (
      version.label.trim() ||
      t("subprofiles:poem.versions.untitled", { index: index + 1 })
    );
  }

  const poemPlainText = poemToPlainText(activeVersion.blocks);

  return createPortal(
    <div
      className={styles.scrim}
      role="presentation"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        className={styles.panel}
        role="dialog"
        aria-modal="true"
        aria-label={item.title}
      >
        <button
          type="button"
          className={styles.close}
          onClick={onClose}
          aria-label={t("shared:modal.close")}
        >
          <FiX aria-hidden />
        </button>

        <header className={styles.head}>
          <h2 className={styles.title}>{item.title}</h2>
          {meta && <p className={styles.meta}>{meta}</p>}
          {item.collaborators.length > 0 && (
            <p className={styles.collab}>
              {t("subprofiles:poem.reader.withLabel", {
                names: item.collaborators
                  .map((collaborator) => collaborator.name)
                  .join(", "),
              })}
            </p>
          )}
          <div className={styles.actions}>
            <button
              type="button"
              className={styles.actionButton}
              onClick={() => void copyShareLink(shareUrl)}
              aria-label={t("subprofiles:poem.reader.copyLinkAria", {
                title: item.title,
              })}
            >
              <FiLink aria-hidden /> {t("subprofiles:poem.reader.copyLink")}
            </button>
            <button
              type="button"
              className={styles.actionButton}
              onClick={() =>
                void copyPoemText(poemPlainText || item.description || "")
              }
              aria-label={t("subprofiles:poem.reader.copy")}
            >
              <FiCopy aria-hidden /> {t("subprofiles:poem.reader.copy")}
            </button>
          </div>
        </header>

        <div className={styles.body}>
          {versions.length > 1 && (
            <SegmentedControl
              className={styles.versions}
              label={t("subprofiles:poem.versions.readerAria")}
              options={versions.map((version, index) => ({
                value: version.id,
                label: versionLabel(version, index),
              }))}
              value={activeVersion.id}
              onChange={setActiveId}
            />
          )}
          <PoemBlocksView
            blocks={activeVersion.blocks}
            description={activeIndex === 0 ? item.description : undefined}
          />
          <WorkRightsFooter
            authorName={authorName}
            createdAtISO={item.createdAt}
          />
        </div>
      </div>
    </div>,
    document.body,
  );
}
