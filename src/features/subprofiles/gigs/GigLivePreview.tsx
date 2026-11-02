import { useId, useMemo, useState } from "react";
import { FiChevronDown } from "react-icons/fi";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useMediaQuery } from "../../../shared/hooks/useMediaQuery";
import { Collapse } from "../../../shared/components/ui/Collapse";
import { Button } from "../../../shared/components/ui/Button";
import type { SubprofileItemView } from "../api/subprofiles.adapters";
import { DEFAULT_ACCENT, skinVars } from "../subprofilePresence.data";
import { SubprofileItemRow } from "../SubprofileItemRow";
import { useSubprofileEditorContext } from "../subprofileEditorContext";
import { GigRow } from "./GigRow";
import styles from "./GigLivePreview.module.css";

/** Below this width the drawer is one column and the preview folds. */
const WIDE_DRAWER_QUERY = "(min-width: 900px)";

const IGNORED_POINTER = { onPointerDown: () => undefined };
const IGNORED_ACTION = () => undefined;

/**
 * The drawer's live preview of the gig being edited: the editor list row
 * (`GigRow`, static) and the real public stage row, drawn inside the same
 * `.pp` skin wrapper the persona page uses so it follows the persona accent
 * and the app theme.
 *
 * The draft is a `SubprofileItemView` that may hold empty fields at any
 * moment, so every value is read defensively. On a one-column drawer the
 * whole preview sits in a `Collapse` behind a toggle and starts collapsed; on
 * the wide drawer it is always shown. The editor row never takes the Past
 * dimming (`isPast={false}`): the date block washes itself from the date, so
 * the preview reads at full strength for a past gig too.
 */
export function GigLivePreview({ draft }: { draft: SubprofileItemView }) {
  const { t } = useTranslation();
  const isWide = useMediaQuery(WIDE_DRAWER_QUERY);
  // One column opens collapsed so the form stays above the fold; the wide
  // drawer shows the preview without a toggle.
  const [isOpen, setIsOpen] = useState(isWide);
  const headingId = useId();
  const bodyId = useId();
  const {
    meta: { accent },
  } = useSubprofileEditorContext();
  const skinStyle = useMemo(() => skinVars(accent || DEFAULT_ACCENT), [accent]);
  const pageItem = useMemo(
    () => ({
      ...draft,
      title: draft.title.trim() || t("subprofiles:gigEditor.preview.untitled"),
    }),
    [draft, t],
  );

  const hasNoTitle = !draft.title.trim();
  const hasNoDate = !draft.date.trim();
  const hintKey = "subprofiles:gigEditor.preview.emptyHint";

  const body = (
    <div id={bodyId} className={styles.body}>
      <div className={styles.block}>
        <h4 className={styles.label}>
          {t("subprofiles:gigEditor.preview.editor")}
        </h4>
        <GigRow
          item={draft}
          rowUid="gig-preview"
          canFeature
          isFirst
          isLast
          gripHandlers={IGNORED_POINTER}
          isDragging={false}
          isPast={false}
          isStatic
          onEdit={IGNORED_ACTION}
          onMoveUp={IGNORED_ACTION}
          onMoveDown={IGNORED_ACTION}
          onToggleFeature={IGNORED_ACTION}
          onRemove={IGNORED_ACTION}
        />
      </div>
      <div className={styles.block}>
        <h4 className={styles.label}>
          {t("subprofiles:gigEditor.preview.page")}
        </h4>
        <div
          className={`pp ${styles.pageFrame}`}
          data-skin="stage"
          style={skinStyle}
        >
          <div className="pp-list">
            <SubprofileItemRow
              item={pageItem}
              skin="stage"
              interactive={false}
              accent={accent || DEFAULT_ACCENT}
            />
          </div>
        </div>
        <Collapse isOpen={hasNoTitle || hasNoDate}>
          <p className={styles.hint}>{t(hintKey)}</p>
        </Collapse>
      </div>
      <p className={styles.note}>
        {t("subprofiles:gigEditor.preview.venueNote")}
      </p>
    </div>
  );

  return (
    <section className={styles.preview} aria-labelledby={headingId}>
      <div className={styles.head}>
        <h3 id={headingId} className={styles.title}>
          {t("subprofiles:gigEditor.preview.title")}
        </h3>
        {!isWide && (
          <Button
            variant="quiet"
            size="sm"
            className={styles.toggle}
            aria-expanded={isOpen}
            aria-controls={bodyId}
            onClick={() => setIsOpen((wasOpen) => !wasOpen)}
          >
            {t(
              isOpen
                ? "subprofiles:gigEditor.preview.hide"
                : "subprofiles:gigEditor.preview.show",
            )}
            <FiChevronDown
              aria-hidden
              className={isOpen ? styles.chevronOpen : styles.chevron}
            />
          </Button>
        )}
      </div>
      {isWide ? body : <Collapse isOpen={isOpen}>{body}</Collapse>}
    </section>
  );
}
