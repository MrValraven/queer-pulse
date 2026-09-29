import type { ReactNode } from "react";
import { FiEdit3, FiEye } from "react-icons/fi";
import { Button, IconButton, Tooltip } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./ProfileHeroToolbar.module.css";

/**
 * The quiet action row at the top right of the desktop profile hero, on the
 * eyebrow's line. Same pattern as `GatheringHeaderToolbar`: secondary and
 * owner actions sit up here, Edit as a labelled ghost button and the rest as
 * icons named by an aria-label and a tooltip, so the hero body keeps only
 * the actions that are about the member.
 *
 * On your own profile it holds Edit (spelled out as a labelled ghost
 * button), View as visitor and the settings menu. On someone else's it
 * holds the safety menu. Previewing your own profile as a visitor leaves it
 * empty, and then it renders nothing. The Edit control carries
 * `id="profileEditCta"` because `useProfileEditGuard` refocuses that id when
 * edit mode closes.
 *
 * A `role="group"` with plain tab order, for the same reason as the gathering
 * toolbar: three buttons do not need a toolbar's roving focus.
 */
export function ProfileHeroToolbar({
  isOwnProfile,
  isSelf,
  onEdit,
  onPreview,
  menu,
}: {
  /** Raw `self`: your own profile, visitor preview or not. */
  isOwnProfile: boolean;
  /** Your own profile, outside the visitor preview. */
  isSelf: boolean;
  onEdit?: () => void;
  onPreview?: () => void;
  /** A `ProfileHeroOverflowMenu`, rendered last. */
  menu: ReactNode;
}) {
  const { t } = useTranslation();
  // The visitor preview: no owner buttons and no menu, so no group at all.
  if (isOwnProfile && !isSelf) return null;
  const editLabel = t("members:profile.hero.editCta");
  const previewLabel = t("members:profile.hero.previewCta");

  return (
    <div
      role="group"
      aria-label={t("members:profile.hero.toolbarAria")}
      className={styles.toolbar}
    >
      {isSelf && (
        <Button id="profileEditCta" variant="ghost" onClick={onEdit}>
          <FiEdit3 aria-hidden /> {editLabel}
        </Button>
      )}
      {isSelf && (
        <Tooltip label={previewLabel} placement="bottom">
          <IconButton aria-label={previewLabel} onClick={onPreview}>
            <FiEye aria-hidden />
          </IconButton>
        </Tooltip>
      )}
      {menu}
    </div>
  );
}
