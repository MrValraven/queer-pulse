import type { KeyboardEvent, ReactNode, RefObject } from "react";
import type { GatheringDetailsDraft } from "./editDetailsDraft";
import { EditDetailsNav } from "./EditDetailsNav";
import { EditDetailsPreview } from "./EditDetailsPreview";
import type { EditSectionKey } from "./editDetailsSections";
import styles from "./EditDetailsLayout.module.css";

/**
 * The edit-details modal's body: the rail (the section map and the live card
 * preview) beside the scrolling form on a wide dialog, the section strip
 * above it on a narrow one. The form column is the one thing that scrolls.
 *
 * Cmd/Ctrl + Enter anywhere in the form saves, through the modal's own
 * `save` gate. A key a field already used (an open Select panel or a mention
 * list taking Enter as a pick calls `preventDefault`), an Enter that ends an
 * IME composition, and a key from a layer portalled out of the form (a date
 * picker's calendar, the mention menu, a confirm dialog on top) all pass by.
 */
export function EditDetailsLayout({
  draft,
  activeKey,
  editedKeys,
  needsFixKey,
  onSelectSection,
  onSaveShortcut,
  columnRef,
  bottomSentinelRef,
  children,
}: {
  draft: GatheringDetailsDraft;
  activeKey: EditSectionKey;
  editedKeys: readonly EditSectionKey[];
  needsFixKey: EditSectionKey | null;
  onSelectSection: (key: EditSectionKey) => void;
  onSaveShortcut: () => void;
  columnRef: RefObject<HTMLDivElement | null>;
  bottomSentinelRef: RefObject<HTMLDivElement | null>;
  children: ReactNode;
}) {
  const navProps = {
    activeKey,
    editedKeys,
    needsFixKey,
    onSelect: onSelectSection,
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Enter" || !(event.metaKey || event.ctrlKey)) return;
    if (event.nativeEvent.isComposing || event.defaultPrevented) return;
    if (
      !(event.target instanceof Node) ||
      !event.currentTarget.contains(event.target)
    ) {
      return;
    }
    event.preventDefault();
    onSaveShortcut();
  };

  return (
    // A key listener on the form's wrapper, which holds only real controls:
    // it reads a shortcut as it bubbles up from them and owns no focus of
    // its own.
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <div className={styles.layout} onKeyDown={handleKeyDown}>
      <div className={styles.rail}>
        <EditDetailsNav variant="rail" {...navProps} />
        <div className={styles.railPreview}>
          <EditDetailsPreview draft={draft} />
        </div>
      </div>
      <div className={styles.strip}>
        <EditDetailsNav variant="strip" {...navProps} />
      </div>
      <div ref={columnRef} className={styles.column}>
        <div className={styles.columnInner}>
          {children}
          <div ref={bottomSentinelRef} className={styles.bottomSentinel} />
        </div>
      </div>
    </div>
  );
}
