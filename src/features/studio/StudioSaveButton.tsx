import { FiCheck, FiPlus } from "react-icons/fi";
import { Button, IconButton } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioReleaseView } from "./api/studio.adapters";
import { StudioIconSwap } from "./player/ui/StudioIconSwap";
import { useStudioSaveToggle } from "./useStudioSaveToggle";
import css from "./StudioSaveButton.module.css";

/** Save's visible words, Save or Saved, in a box as wide as the longer of
 *  the two, so the pill keeps its width when the state flips. The hidden
 *  copies only size the box; the button's own name carries the meaning. */
function StudioSaveLabel({ isSaved }: { isSaved: boolean }) {
  const { t } = useTranslation();
  return (
    <span className={css.saveLabel}>
      <StudioIconSwap iconKey={isSaved ? "savedLabel" : "saveLabel"}>
        {t(isSaved ? "studio:save.savedLabel" : "studio:save.saveCta")}
      </StudioIconSwap>
      <span className={css.saveLabelSizer} aria-hidden="true">
        {t("studio:save.savedLabel")}
      </span>
      <span className={css.saveLabelSizer} aria-hidden="true">
        {t("studio:save.saveCta")}
      </span>
    </span>
  );
}

/** A hero's Save (release, show and playlist heroes). It keeps one name,
 *  `label` ("Save {title}"), and aria-pressed carries the state, so a screen
 *  reader hears it once; the icon swaps to a check and the visible words to
 *  Saved. Icon-only, it is the round button with a tooltip. */
export function StudioSaveToggleButton({
  save,
  label,
  isIconOnly,
}: {
  save: ReturnType<typeof useStudioSaveToggle>;
  label: string;
  isIconOnly: boolean;
}) {
  const { t } = useTranslation();
  const icon = (
    <StudioIconSwap iconKey={save.isSaved ? "saved" : "save"}>
      {save.isSaved ? <FiCheck aria-hidden /> : <FiPlus aria-hidden />}
    </StudioIconSwap>
  );
  if (isIconOnly)
    return (
      <IconButton
        aria-label={label}
        aria-pressed={save.isSaved}
        tooltip={t("studio:save.saveCta")}
        onClick={save.toggle}
      >
        {icon}
      </IconButton>
    );
  return (
    <Button
      variant="quiet"
      aria-label={label}
      aria-pressed={save.isSaved}
      onClick={save.toggle}
    >
      {icon}
      {/* The words follow the state; the name above stays "Save {title}". */}
      <StudioSaveLabel isSaved={save.isSaved} />
    </Button>
  );
}

/** A release's or a show's Save. `meta` is the saved snapshot's line, the
 *  artist unless the caller names another (a show's). */
export function StudioReleaseSaveButton({
  release,
  isIconOnly,
  meta,
}: {
  release: StudioReleaseView;
  isIconOnly: boolean;
  meta?: string;
}) {
  const { t } = useTranslation();
  const save = useStudioSaveToggle({
    savedId: release.savedId,
    kind: "studio_release",
    title: release.title,
    href: release.href,
    meta: meta ?? release.artist.name,
  });
  return (
    <StudioSaveToggleButton
      save={save}
      label={t("studio:save.saveReleaseCta", { title: release.title })}
      isIconOnly={isIconOnly}
    />
  );
}
