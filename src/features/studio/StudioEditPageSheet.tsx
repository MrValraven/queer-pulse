import { useId, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence } from "motion/react";
import { FiImage } from "react-icons/fi";
import { subprofileEditPath } from "../../app/routeMap";
import {
  Button,
  Collapse,
  RadioCardGroup,
  SideSheet,
} from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import type { TFunction } from "../../shared/i18n/types";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioArtistView } from "./api/studio.adapters";
import {
  studioHeroSaveFailureOf,
  useStudioHeroChoiceSave,
  type StudioHeroSaveFailure,
} from "./api/useStudioHeroChoiceSave";
import { STUDIO_HERO_CHOICES, type StudioHeroChoice } from "./studioHeroChoice";
import styles from "./StudioEditPageSheet.module.css";

interface StudioEditPageSheetProps {
  artist: StudioArtistView;
  /** The choice the hero behind the sheet should draw; null hands the hero
   *  back to the saved one. */
  onPreviewChange: (choice: StudioHeroChoice | null) => void;
  /** Runs once the sheet has finished leaving. */
  onClose: () => void;
}

/**
 * The owner's "Edit Studio page" sheet: what shows at the top of the page.
 * Owns its own presence, so Cancel, Escape, the scrim and a save all play
 * the sheet's exit before `onClose` runs, and each of them hands the hero
 * back to the saved choice as the exit starts.
 */
export function StudioEditPageSheet({
  artist,
  onPreviewChange,
  onClose,
}: StudioEditPageSheetProps) {
  const [isOpen, setIsOpen] = useState(true);
  function close() {
    onPreviewChange(null);
    setIsOpen(false);
  }
  return (
    <AnimatePresence onExitComplete={onClose}>
      {isOpen && (
        <StudioEditPageDialog
          artist={artist}
          onPreviewChange={onPreviewChange}
          onClose={close}
        />
      )}
    </AnimatePresence>
  );
}

function StudioEditPageDialog({
  artist,
  onPreviewChange,
  onClose,
}: StudioEditPageSheetProps) {
  const { t } = useTranslation();
  const introId = useId();
  const subprofileId = artist.artist.id;
  const hasCover = artist.coverUrl !== null;
  const [choice, setChoice] = useState<StudioHeroChoice>(artist.heroLayout);
  const [failure, setFailure] = useState<StudioHeroSaveFailure | null>(null);
  const { saveChoice, isSaving } = useStudioHeroChoiceSave(subprofileId);

  // A save on its way lands anyway, so Cancel, Escape, the scrim and the X
  // all wait for it.
  function closeUnlessSaving() {
    if (!isSaving) onClose();
  }

  function pickChoice(nextChoice: StudioHeroChoice) {
    if (isSaving) return;
    setChoice(nextChoice);
    setFailure(null);
    onPreviewChange(nextChoice);
  }

  async function save() {
    if (isSaving) return;
    // The saved choice stays as it was, so nothing is written: storing it
    // would freeze a default (a persona with no cover reads as Avatar, and
    // a cover added later should bring the default banner and avatar back).
    if (choice === artist.heroLayout) {
      onClose();
      return;
    }
    setFailure(null);
    try {
      await saveChoice(choice);
      onClose();
    } catch (error) {
      setFailure(studioHeroSaveFailureOf(error));
    }
  }

  const options = STUDIO_HERO_CHOICES.map((option) => {
    // A banner needs the cover photo, and without one the avatar is the only
    // top there is, so every card shows the choices and none can be picked.
    // RadioCardGroup skips a disabled option for clicks and arrow keys.
    const isBannerShut = !hasCover && option !== "portrait";
    return {
      id: option,
      isDisabled: !hasCover,
      render: (
        <span className={styles.choiceBody}>
          <span className={styles.choiceTitle}>
            {t(`studio:artistPage.editPage.choice.${option}.title`)}
          </span>
          <span className={styles.choiceEffect}>
            {t(`studio:artistPage.editPage.choice.${option}.effect`)}
          </span>
          {isBannerShut && (
            <span className="visuallyHidden">
              {t("studio:artistPage.editPage.needsCover")}
            </span>
          )}
        </span>
      ),
    };
  });

  return (
    <SideSheet
      title={t("studio:artistPage.editPage.title")}
      onClose={closeUnlessSaving}
      className={styles.sheet}
      footer={
        hasCover ? (
          <>
            <Button
              variant="quiet"
              onClick={closeUnlessSaving}
              aria-disabled={isSaving || undefined}
            >
              {t("studio:artistPage.editPage.cancel")}
            </Button>
            <Button
              variant="primary"
              onClick={() => void save()}
              aria-disabled={isSaving || undefined}
              aria-busy={isSaving || undefined}
            >
              {t(
                isSaving
                  ? "studio:artistPage.editPage.saving"
                  : "studio:artistPage.editPage.save",
              )}
            </Button>
          </>
        ) : (
          // Nothing can be picked without a cover, so there is nothing to
          // save: one button closes the sheet.
          <Button variant="primary" onClick={onClose}>
            {t("studio:artistPage.editPage.close")}
          </Button>
        )
      }
    >
      <div className={styles.body}>
        <p id={introId} className={styles.intro}>
          {t("studio:artistPage.editPage.intro")}
        </p>
        <RadioCardGroup
          value={choice}
          onChange={pickChoice}
          options={options}
          ariaLabel={t("studio:artistPage.editPage.choicesLabel")}
          ariaDescribedBy={introId}
          className={styles.choices}
          optionClassName={styles.choice}
          checkedClassName={styles.choiceChecked}
        />
        <Collapse isOpen={!hasCover}>
          <p className={styles.noCover}>
            <FiImage aria-hidden className={styles.noCoverIcon} />
            <span>
              <Translation
                i18nKey="studio:artistPage.editPage.noCover"
                components={{
                  a: (
                    <Link
                      to={`${subprofileEditPath(subprofileId)}?pane=presence&field=cover`}
                      className={styles.editorLink}
                    />
                  ),
                }}
              />
            </span>
          </p>
        </Collapse>
        <Collapse isOpen={failure !== null}>
          <p className={styles.error} role="alert">
            {failure ? failureLine(t, failure) : null}
          </p>
        </Collapse>
      </div>
    </SideSheet>
  );
}

/** The catalog line for a failed save. An "unexpected" failure with no HTTP
 *  status reads the line that names no status. */
function failureLine(t: TFunction, failure: StudioHeroSaveFailure): string {
  if (failure.reason === "unexpected" && failure.status === null)
    return t("studio:artistPage.editPage.error.unexpectedNoStatus");
  return t(`studio:artistPage.editPage.error.${failure.reason}`, {
    status: failure.status ?? "",
  });
}
