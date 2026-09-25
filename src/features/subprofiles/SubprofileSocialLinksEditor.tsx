import { FiLink, FiPlus } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { SubprofileView } from "./api/subprofiles.adapters";
import { FIELD_ANCHOR_ID } from "./publishChecklist.data";
import {
  useSubprofileEditorContext,
  withSocialUid,
} from "./subprofileEditorContext";
import { SocialLinkEditorRow } from "./SocialLinkEditorRow";
import { useEditorRowList } from "./useEditorRowList";
import { useReorderableRows } from "./useReorderableRows";
import sharedStyles from "./SubprofileEditor.module.css";
import styles from "./SubprofileSocialLinksEditor.module.css";

/** Mirrors the backend `MAX_SOCIAL_LINKS` validator. */
const MAX_SOCIAL_LINKS = 20;

/**
 * Owner editor for a persona's social links: add, remove and reorder rows
 * (`SocialLinkEditorRow`: a grip drag, the grip's move menu, or Alt with an
 * arrow key in the handle field), each a platform select plus a handle/URL field with a live icon +
 * resolved-href preview via `socialHref`, capped at `MAX_SOCIAL_LINKS`. Rows
 * are CONTROLLED by `SubprofileEditorContext` (`socialRows`/`setSocialRows`):
 * no local state and no Save button; the global savebar's `saveAll()` PUTs
 * the whole list in row order, which the backend stores as each link's
 * `position`. Mirrors `members/SocialLinksEditor`'s add/remove UX.
 */
export function SubprofileSocialLinksEditor({
  subprofile: _subprofile,
}: {
  subprofile: SubprofileView;
}) {
  const { t } = useTranslation();
  const { socialRows: rows, setSocialRows } = useSubprofileEditorContext();

  const { patch, remove, add, move, atMax, isAddedRow } = useEditorRowList(
    rows,
    setSocialRows,
    {
      max: MAX_SOCIAL_LINKS,
      makeEmpty: () => withSocialUid({ platform: "website", urlOrHandle: "" }),
    },
  );
  const { containerRef, draggingIndex, gripHandlers, moveCount, moveRow } =
    useReorderableRows(move);
  const listLabel = t("subprofiles:socialEditor.title");

  return (
    <section id={FIELD_ANCHOR_ID.socialLinks} className={sharedStyles.card}>
      <div className={sharedStyles.cardHead}>
        <span className={sharedStyles.cardIcon}>
          <FiLink size={20} aria-hidden />
        </span>
        <h2 className={sharedStyles.cardTitle}>{listLabel}</h2>
      </div>

      <div className={styles.linksEditor} ref={containerRef}>
        {rows.map((row, index) => (
          <SocialLinkEditorRow
            key={row._uid}
            link={row}
            index={index}
            rowCount={rows.length}
            listLabel={listLabel}
            isDragging={draggingIndex === index}
            isEntering={isAddedRow(row._uid)}
            moveCount={moveCount}
            gripHandlers={gripHandlers(index)}
            onMove={(toIndex) => moveRow(index, toIndex)}
            onPatch={(patchValue) => patch(row._uid, patchValue)}
            onRemove={() => remove(row._uid)}
          />
        ))}
      </div>

      <div className={sharedStyles.sectionFoot}>
        <div>
          <button
            type="button"
            className={sharedStyles.addBtn}
            onClick={add}
            disabled={atMax}
          >
            <FiPlus size={18} aria-hidden /> {t("subprofiles:socialEditor.add")}
          </button>
          {atMax && (
            <p className={sharedStyles.capHint}>
              {t("subprofiles:socialEditor.capHint")}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
