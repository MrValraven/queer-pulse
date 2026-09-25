import { useLayoutEffect, useRef } from "react";
import { FiPlus } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { SocialLinkDTO } from "./api/subprofiles.api";
import { MAX_ITEM_LINKS } from "./subprofileEditor.data";
import { SocialLinkEditorRow } from "./SocialLinkEditorRow";
import { usePositionalRowKeys } from "./usePositionalRowKeys";
import { useReorderableRows } from "./useReorderableRows";
import sharedStyles from "./SubprofileEditor.module.css";
import styles from "./SubprofileSocialLinksEditor.module.css";

/**
 * Controlled editor for an item's typed social links (e.g. a project's GitHub /
 * demo / docs). Each row (`SocialLinkEditorRow`) is a platform select plus a
 * handle/URL field with a live `socialHref` preview, capped at
 * `MAX_ITEM_LINKS`, and reorders by a grip drag, the grip's move menu, or Alt
 * with an arrow key in the handle field. Every edit calls `onChange` with the
 * whole next array: no local state, no save button; the owning drawer persists
 * it into the item's `structured.links`, a jsonb array the backend stores and
 * returns in order. A row added here eases in; rows it opened with do not.
 * The links carry no id and are saved verbatim, so row keys live beside them
 * (`usePositionalRowKeys`) and are permuted with every move and removal.
 */
export function SubprofileItemLinksField({
  links,
  onChange,
}: {
  links: SocialLinkDTO[];
  onChange: (links: SocialLinkDTO[]) => void;
}) {
  const { t } = useTranslation();
  const atMax = links.length >= MAX_ITEM_LINKS;
  const rowKeys = usePositionalRowKeys(links.length);
  const listLabel = t("subprofiles:itemLinks.label");
  // The newest list, advanced synchronously by every write, so a second write
  // fired before the re-render (a fast drag's next swap, an edit right after a
  // move) builds on the first.
  const latestLinksRef = useRef(links);
  useLayoutEffect(() => {
    latestLinksRef.current = links;
  });

  function write(next: SocialLinkDTO[]) {
    latestLinksRef.current = next;
    onChange(next);
  }
  function patch(index: number, patchValue: Partial<SocialLinkDTO>) {
    write(
      latestLinksRef.current.map((link, linkIndex) =>
        linkIndex === index ? { ...link, ...patchValue } : link,
      ),
    );
  }
  function remove(index: number) {
    rowKeys.removeAt(index);
    write(latestLinksRef.current.filter((_, linkIndex) => linkIndex !== index));
  }
  function add() {
    const current = latestLinksRef.current;
    if (current.length >= MAX_ITEM_LINKS) return;
    rowKeys.insertAt(current.length);
    write([...current, { platform: "website", urlOrHandle: "" }]);
  }
  /** Lifts the row out and inserts it at `to`. The keys follow as a run of
   *  neighbour swaps, which is the same permutation. */
  function move(from: number, to: number) {
    const current = latestLinksRef.current;
    const isInRange = (index: number) => index >= 0 && index < current.length;
    if (from === to || !isInRange(from) || !isInRange(to)) return;
    const next = [...current];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved!);
    const step = to > from ? 1 : -1;
    for (let at = from; at !== to; at += step) rowKeys.swap(at, at + step);
    write(next);
  }

  const { containerRef, draggingIndex, gripHandlers, moveCount, moveRow } =
    useReorderableRows(move);

  return (
    <div className={styles.fieldWrap}>
      <span className={styles.fieldLabel}>{listLabel}</span>
      <div className={styles.linksEditor} ref={containerRef}>
        {links.map((link, index) => (
          <SocialLinkEditorRow
            key={rowKeys.keys[index]}
            link={link}
            index={index}
            rowCount={links.length}
            listLabel={listLabel}
            isDragging={draggingIndex === index}
            isEntering={rowKeys.insertedKeys.has(rowKeys.keys[index] ?? "")}
            moveCount={moveCount}
            gripHandlers={gripHandlers(index)}
            onMove={(toIndex) => moveRow(index, toIndex)}
            onPatch={(patchValue) => patch(index, patchValue)}
            onRemove={() => remove(index)}
          />
        ))}
      </div>

      <div>
        <button
          type="button"
          className={sharedStyles.addBtn}
          onClick={add}
          disabled={atMax}
        >
          <FiPlus size={18} aria-hidden /> {t("subprofiles:itemLinks.add")}
        </button>
        {atMax && (
          <p className={sharedStyles.capHint}>
            {t("subprofiles:socialEditor.capHint")}
          </p>
        )}
      </div>

      <span className={styles.fieldHelper}>
        {t("subprofiles:itemLinks.helper")}
      </span>
      {links.length > 1 && (
        <span className={styles.fieldHelper}>
          {t("subprofiles:skinList.reorderHint")}
        </span>
      )}
    </div>
  );
}
