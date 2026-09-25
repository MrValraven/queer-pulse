import type { PointerEvent as ReactPointerEvent } from "react";
import { FiX } from "react-icons/fi";
import { Select } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  SOCIAL_PLATFORMS,
  socialHref,
  socialPlatform,
} from "../../shared/social/socialPlatforms";
import type { SocialLinkDTO } from "./api/subprofiles.api";
import { ReorderRow } from "./ReorderRow";
import { SkinListGrip } from "./SkinListParts";
import { ROW_MOVE_KEY_SHORTCUTS } from "./useReorderableRows";
import reorderStyles from "./ReorderRow.module.css";
import styles from "./SubprofileSocialLinksEditor.module.css";

/** Every named platform is a brand noun and stays untranslated in every
 *  locale; only the generic "Other link" fallback is platform chrome.
 *  Mirrors `members/SocialLinksEditor`'s `platformLabel`. */
function platformLabel(
  key: string,
  label: string,
  t: (key: string) => string,
): string {
  return key === "other" ? t("subprofiles:socialEditor.other") : label;
}

interface SocialLinkEditorRowProps {
  link: SocialLinkDTO;
  /** 0-based position and the list's length, for the grip's move menu. */
  index: number;
  rowCount: number;
  /** Names the row in the grip's menu when its platform has no label. */
  listLabel: string;
  /** True while this row is held under the pointer. */
  isDragging: boolean;
  /** A row the person added in this session: eases in on mount. */
  isEntering?: boolean;
  /** From `useReorderableRows`, for the row's `ReorderRow`. */
  moveCount: number;
  /** From `useReorderableRows`: turns the grip into the drag handle. */
  gripHandlers: { onPointerDown: (event: ReactPointerEvent) => void };
  /** Moves this row to the 0-based `toIndex` (`useReorderableRows().moveRow`). */
  onMove: (toIndex: number) => void;
  onPatch: (patch: Partial<SocialLinkDTO>) => void;
  onRemove: () => void;
}

/**
 * One editable social link: a drag grip, the platform icon and select, the
 * handle/URL field with a live `socialHref` preview under it, and remove.
 * Shared by the persona's links (`SubprofileSocialLinksEditor`) and an item's
 * links (`SubprofileItemLinksField`). The grip drags the row, and a tap on it
 * opens a move menu (up, down, to top, to bottom); Alt with an arrow key in
 * the handle field moves it too. Must render as a direct child of the list's
 * `containerRef`.
 */
export function SocialLinkEditorRow({
  link,
  index,
  rowCount,
  listLabel,
  isDragging,
  isEntering = false,
  moveCount,
  gripHandlers,
  onMove,
  onPatch,
  onRemove,
}: SocialLinkEditorRowProps) {
  const { t } = useTranslation();
  const meta = socialPlatform(link.platform);
  const Icon = meta.icon;
  const href = socialHref(link.platform, link.urlOrHandle);
  const label = platformLabel(meta.key, meta.label, t);

  return (
    <ReorderRow
      className={isDragging ? reorderStyles.linkDragging : undefined}
      isDragging={isDragging}
      isEntering={isEntering}
      moveCount={moveCount}
    >
      <div className={styles.linkGroup}>
        <SkinListGrip
          onPointerDown={gripHandlers.onPointerDown}
          reorder={{
            rowLabel: label || listLabel,
            rowNumber: index + 1,
            rowCount,
            onMove,
          }}
        />
        <span className={styles.linkIcon} aria-hidden>
          <Icon size={16} />
        </span>
        <Select
          className={styles.linkPlatform}
          size="sm"
          label={t("subprofiles:socialEditor.platformLabel")}
          options={SOCIAL_PLATFORMS.map((platformOption) => ({
            value: platformOption.key,
            label: platformLabel(platformOption.key, platformOption.label, t),
          }))}
          value={link.platform}
          onChange={(value) => onPatch({ platform: value ?? "" })}
        />
        <input
          className={`${styles.inlineInput} ${styles.linkInput}`}
          value={link.urlOrHandle}
          placeholder={meta.placeholder}
          aria-label={t("subprofiles:socialEditor.linkFor", {
            platform: label,
          })}
          aria-keyshortcuts={ROW_MOVE_KEY_SHORTCUTS}
          onChange={(event) => onPatch({ urlOrHandle: event.target.value })}
        />
        <button
          type="button"
          className={styles.linkRemove}
          aria-label={t("subprofiles:socialEditor.removeLinkFor", {
            platform: label,
          })}
          onClick={onRemove}
        >
          <FiX size={15} />
        </button>
        {href && <p className={styles.preview}>{href}</p>}
      </div>
    </ReorderRow>
  );
}
