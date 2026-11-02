import { useId, useRef } from "react";
import { Collapse, Toggle } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioArtistView } from "./api/studio.adapters";
import { useStudioSupporterState } from "./api/useStudioSupporter";
import { useStudioListeningHistorySwitch } from "./api/useStudioListeningHistorySwitch";
import {
  StudioArtistSupporterConfirmation,
  StudioArtistSupporterStates,
  StudioArtistSupporterStatus,
} from "./StudioArtistSupporterStates";
import { StudioSupporterPickerRegion } from "./StudioSupporterIdentityPicker";
import { StudioInertSupporterCard } from "./StudioArtistVisitorPreviewControls";
import { useStudioArtistSupporterSwitch } from "./useStudioArtistSupporterSwitch";
import { useStudioVisitorPreview } from "./studioVisitorPreview";
import studioStyles from "./studio.module.css";
import styles from "./StudioSupporter.module.css";

/** "Show me among the top listeners" on an artist page, for anyone who is not one of
 *  its owners. It is on by default, shown as "Your account", and the member
 *  can turn it off. Turning it back on restores the identity they last
 *  picked; "Change how you appear" opens the identity picker, which previews
 *  the exact name and photo the artist will see. The picker also opens on its
 *  own when the stored identity can no longer be read. While the owner views
 *  the page as a visitor, the card keeps its shape with the switch on and
 *  disabled, and reads nothing. */
export function StudioArtistSupporterCard({
  artist,
}: {
  artist: StudioArtistView;
}) {
  const { t } = useTranslation();
  const subprofileId = artist.artist.id;
  const personaName = artist.artist.name;
  const { isVisitorPreview } = useStudioVisitorPreview();
  const { state, loadState } = useStudioSupporterState(
    subprofileId,
    !artist.isOwner && !isVisitorPreview,
  );
  const historySwitch = useStudioListeningHistorySwitch();
  const isHistoryPaused = !historySwitch.isOn && !historySwitch.isAwaitingRow;
  const headingId = useId();
  const switchId = useId();
  const bodyId = useId();
  const pickerId = useId();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const supporterSwitch = useStudioArtistSupporterSwitch({
    subprofileId,
    state,
    switchId,
    headingRef,
  });
  const { saver, remover, status, shownState, isSupporting, isPickerShown } =
    supporterSwitch;
  if (artist.isOwner) return null;
  if (isVisitorPreview)
    return <StudioInertSupporterCard personaName={personaName} />;

  // A member of this artist (403 `studio_supporter_own_persona`) cannot
  // support it, so the card folds away.
  const isOwnPersona = loadState.isError && loadState.reason === "forbidden";

  return (
    <Collapse isOpen={!isOwnPersona}>
      <section
        className={`${studioStyles.sideCard} ${styles.card}`}
        aria-labelledby={headingId}
      >
        <h2
          ref={headingRef}
          id={headingId}
          tabIndex={-1}
          className={styles.heading}
        >
          {t("studio:supporter.heading", { persona: personaName })}
        </h2>
        <StudioArtistSupporterStates
          loadState={
            isOwnPersona ? { ...loadState, isError: false } : loadState
          }
          hasState={state !== null}
        />
        <Collapse isOpen={state !== null}>
          <div className={styles.switchRow}>
            <p id={bodyId} className={styles.body}>
              {t("studio:supporter.body", { persona: personaName })}
            </p>
            <Toggle
              id={switchId}
              label={t("studio:supporter.heading", { persona: personaName })}
              aria-describedby={bodyId}
              checked={supporterSwitch.isSwitchOn}
              onChange={supporterSwitch.changeSwitch}
            />
          </div>
          <Collapse isOpen={isHistoryPaused}>
            <p className={styles.pausedNote}>
              {t("studio:supporter.pausedNote")}
            </p>
          </Collapse>
          <StudioArtistSupporterConfirmation
            personaName={personaName}
            isSupporting={isSupporting}
            shownAs={state?.shownAs ?? null}
            pickerId={pickerId}
            isPickerShown={isPickerShown}
            onChange={supporterSwitch.openPicker}
          />
          <StudioSupporterPickerRegion
            id={pickerId}
            isOpen={isPickerShown}
            personaName={personaName}
            options={shownState?.options ?? []}
            initialShownAsSubprofileId={shownState?.shownAsSubprofileId ?? null}
            isSaving={saver.isSaving}
            shouldFocusOnOpen={supporterSwitch.isOpenedByMember}
            saveError={supporterSwitch.hasSaveFailed ? saver.error : null}
            onSave={(shownAsSubprofileId) => {
              void supporterSwitch.saveIdentity(shownAsSubprofileId);
            }}
            onClose={supporterSwitch.closePickerToSwitch}
          />
        </Collapse>
        {/* A turn-on that found the artist gone leaves the not-available
            line above to name it. */}
        <StudioArtistSupporterStatus
          status={state === null && status === "turnOnFailed" ? null : status}
          personaName={personaName}
          shownAsName={state?.shownAs?.name ?? null}
          removeError={remover.error}
          saveError={saver.error}
        />
      </section>
    </Collapse>
  );
}
