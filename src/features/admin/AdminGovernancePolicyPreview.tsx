import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { FiChevronsLeft, FiChevronsRight, FiEye } from "react-icons/fi";
import { Tooltip } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type {
  PolicyDraft,
  PolicySectionId,
} from "./adminGovernancePolicyDraft";
import { AdminGovernancePolicyPreviewPage } from "./AdminGovernancePolicyPreviewPage";
import styles from "./AdminGovernancePolicy.module.css";

/** The width the public Governance page is drawn at before it is scaled down. */
const PAGE_WIDTH = 900;

type PreviewZoom = "fit" | "full";

/**
 * The live preview panel: browser chrome, a zoom control, and the public page
 * inside it, scaled to whatever width the panel has.
 *
 * The scale is a CSS `transform`, so the page inside keeps its real 900px
 * layout and its real type scale rather than being re-laid-out at column width.
 * A preview that reflowed would answer a question nobody asked (what does this
 * look like at 420px) instead of the one they did (what will members read).
 *
 * The `transform` also means the scaled element no longer contributes its
 * shrunken height to the scroll box, so the holder around it is given that
 * height explicitly. Note this transform establishes a containing block: any
 * `position: fixed` inside would anchor to it, which is why nothing in the
 * preview is fixed and why modals portal to `<body>`.
 */
export function AdminGovernancePolicyPreview({
  draft,
  activeSectionId,
  isInDrawer = false,
  isCollapsed = false,
  onToggleCollapse,
}: {
  draft: PolicyDraft;
  activeSectionId: PolicySectionId;
  /** Inside the drawer the frame scrolls with the drawer, not with itself. */
  isInDrawer?: boolean;
  /** Folded to a hairline tab, so the editors get the 420px back. The panel is
   * unmounted rather than hidden: a scaled 900px page nobody can see is a
   * ResizeObserver and a re-measure on every keystroke for nothing. */
  isCollapsed?: boolean;
  /** Absent in the drawer, where the drawer's own close is the way out. */
  onToggleCollapse?: () => void;
}) {
  const { t, language } = useTranslation();
  const [zoom, setZoom] = useState<PreviewZoom>("fit");
  const scrollRef = useRef<HTMLDivElement>(null);
  const holderRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);

  const rescale = useCallback(() => {
    const scrollBox = scrollRef.current;
    const holder = holderRef.current;
    const page = pageRef.current;
    if (!scrollBox || !holder || !page) return;
    // The column copy of this panel is `display: none` at the widths where the
    // drawer copy is the one on screen, so its box measures 0. Measuring on
    // would give a negative scale and a mirrored page.
    if (scrollBox.clientWidth === 0) return;
    const scale =
      zoom === "fit"
        ? Math.min(1, (scrollBox.clientWidth - 2) / PAGE_WIDTH)
        : 1;
    page.style.transform = `scale(${scale})`;
    holder.style.width = `${PAGE_WIDTH * scale}px`;
    holder.style.height = `${page.offsetHeight * scale}px`;
  }, [zoom]);

  // Re-measure on zoom, on any draft edit (the page gets taller or shorter),
  // and whenever the panel itself is resized — including the window resize a
  // ResizeObserver on the scroll box already covers.
  useLayoutEffect(() => {
    rescale();
    const scrollBox = scrollRef.current;
    if (!scrollBox) return;
    const observer = new ResizeObserver(rescale);
    observer.observe(scrollBox);
    return () => observer.disconnect();
  }, [rescale, draft]);

  const panelLabel = t("admin:governance.policy.preview.label");
  const collapseLabel = t("admin:governance.policy.preview.collapse");
  const expandLabel = t("admin:governance.policy.preview.expand");

  if (isCollapsed && onToggleCollapse) {
    return (
      <div className={styles.previewTabDock}>
        <Tooltip
          label={`${panelLabel} \u00b7 ${expandLabel}`}
          placement="right"
        >
          <button
            type="button"
            className={styles.previewTab}
            onClick={onToggleCollapse}
            aria-label={expandLabel}
          >
            <FiChevronsLeft aria-hidden />
            <FiEye aria-hidden />
            <span className="visuallyHidden">{panelLabel}</span>
          </button>
        </Tooltip>
      </div>
    );
  }

  return (
    <div
      className={[styles.preview, isInDrawer && styles.previewInDrawer]
        .filter(Boolean)
        .join(" ")}
    >
      <div className={styles.previewHead}>
        <span className={styles.previewDot} aria-hidden />
        <span className={styles.previewHeadLabel}>{panelLabel}</span>
        <div
          className={styles.previewZoom}
          role="group"
          aria-label={t("admin:governance.policy.preview.zoomLabel")}
        >
          <button
            type="button"
            className={[
              styles.previewZoomBtn,
              zoom === "fit" && styles.previewZoomBtnOn,
            ]
              .filter(Boolean)
              .join(" ")}
            aria-pressed={zoom === "fit"}
            onClick={() => setZoom("fit")}
          >
            {t("admin:governance.policy.preview.zoomFit")}
          </button>
          <button
            type="button"
            className={[
              styles.previewZoomBtn,
              zoom === "full" && styles.previewZoomBtnOn,
            ]
              .filter(Boolean)
              .join(" ")}
            aria-pressed={zoom === "full"}
            onClick={() => setZoom("full")}
          >
            {t("admin:governance.policy.preview.zoomFull")}
          </button>
        </div>
        {onToggleCollapse && (
          <button
            type="button"
            className={styles.previewCollapseBtn}
            onClick={onToggleCollapse}
            aria-label={collapseLabel}
            title={collapseLabel}
          >
            <FiChevronsRight aria-hidden />
          </button>
        )}
      </div>

      <div className={styles.previewFrame}>
        <div className={styles.previewBar}>
          <span className={styles.previewUrl}>
            {t("admin:governance.policy.preview.url")}
          </span>
          {/* The preview shares this console's i18n instance, so it can only
              render the language the console is in. Stated as a fact rather
              than offered as a switch that would show English under a PT
              label. */}
          <span
            className={styles.previewLang}
            title={t("admin:governance.policy.preview.languageHint")}
          >
            {language}
          </span>
        </div>
        <div className={styles.previewScroll} ref={scrollRef}>
          <div className={styles.previewHolder} ref={holderRef}>
            <div className={styles.previewScale} ref={pageRef}>
              <AdminGovernancePolicyPreviewPage
                draft={draft}
                activeSectionId={activeSectionId}
              />
            </div>
          </div>
        </div>
        <p className={styles.previewNote}>
          {t("admin:governance.policy.preview.editing", {
            section: t(`admin:governance.policy.section.${activeSectionId}`),
          })}
        </p>
      </div>
    </div>
  );
}
