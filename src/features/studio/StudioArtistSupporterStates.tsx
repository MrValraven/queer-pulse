import { useState } from "react";
import { Button, Collapse, LoadErrorState } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioSupporterIdentityView } from "./api/studioListening.adapters";
import type { StudioLoadState } from "./api/studioLoadState";
import { StudioLoadError } from "./StudioLoadStates";
import { StudioLine } from "./StudioSkeletons";
import { StudioSupporterIdentity } from "./StudioSupporterIdentity";
import { studioReasonCopyKey, studioReasonOf } from "./studioReason";
import styles from "./StudioSupporter.module.css";
import kit from "./studioKit.module.css";

/** What the card's live region last reported. */
export type StudioSupporterStatus = "saved" | "removed" | "removeFailed";

const SUPPORTER_WHAT_KEY = "studio:errors.what.supporter";

function StudioArtistSupporterSkeleton() {
  return (
    <div className={styles.skeleton} aria-hidden="true">
      <StudioLine width="85%" height={12} />
      <StudioLine width="60%" height={12} />
    </div>
  );
}

/** The artist cannot be supported: unknown, no longer listenable, behind a
 *  block either way, or identity-blocked by the member. The server answers
 *  every case with one 404, and a Retry cannot change it, so this panel
 *  offers none (Part 1's not-found shape). */
function StudioArtistSupporterNotFound() {
  const { t } = useTranslation();
  return (
    <LoadErrorState
      title={
        <Translation
          i18nKey="studio:errors.load.title"
          components={{ em: <em /> }}
          values={{ what: t(SUPPORTER_WHAT_KEY) }}
        />
      }
      description={t("studio:errors.reason.studio_supporter_artist_not_found")}
      compact
      className={kit.loadError}
    />
  );
}

/** The card's loading, not-found and error blocks, each in its own Collapse.
 *  The own-persona 403 never reaches here: the card folds away on it. */
export function StudioArtistSupporterStates({
  loadState,
  hasState,
}: {
  loadState: StudioLoadState;
  hasState: boolean;
}) {
  return (
    <>
      <Collapse isOpen={!hasState && loadState.isLoading}>
        <StudioArtistSupporterSkeleton />
      </Collapse>
      <Collapse isOpen={!hasState && loadState.isNotFound}>
        <StudioArtistSupporterNotFound />
      </Collapse>
      <Collapse isOpen={!hasState && loadState.isError}>
        <StudioLoadError loadState={loadState} what={SUPPORTER_WHAT_KEY} />
      </Collapse>
    </>
  );
}

/** The last value that was present, so a block keeps its words while it
 *  folds away after the value turns null. */
function useLastPresent<Value>(value: Value | null): Value | null {
  const [lastValue, setLastValue] = useState(value);
  if (value !== null && value !== lastValue) setLastValue(value);
  return value ?? lastValue;
}

/** "This is how {persona} sees you" with the identity beneath it, and the
 *  button that reopens the picker. An identity the server could no longer
 *  read shows no line (never an empty name); the picker opens instead. */
export function StudioArtistSupporterConfirmation({
  personaName,
  isSupporting,
  shownAs,
  pickerId,
  isPickerShown,
  onChange,
}: {
  personaName: string;
  isSupporting: boolean;
  shownAs: StudioSupporterIdentityView | null;
  pickerId: string;
  isPickerShown: boolean;
  onChange: () => void;
}) {
  const { t } = useTranslation();
  const lastShownAs = useLastPresent(shownAs);
  return (
    <Collapse isOpen={isSupporting}>
      <div className={styles.supporting}>
        <Collapse isOpen={shownAs !== null}>
          {lastShownAs && (
            <div className={styles.confirmation}>
              <p className={styles.confirmationLine}>
                {t("studio:supporter.confirmationLead", {
                  persona: personaName,
                })}
              </p>
              <StudioSupporterIdentity identity={lastShownAs} />
            </div>
          )}
        </Collapse>
        <Button
          variant="quiet"
          size="sm"
          aria-expanded={isPickerShown}
          aria-controls={pickerId}
          onClick={onChange}
        >
          {t("studio:supporter.changeCta")}
        </Button>
      </div>
    </Collapse>
  );
}

/** One live region for the card. A removal (or a failed one) shows its
 *  line; a saved identity is announced only, since the confirmation line
 *  above already shows it. */
export function StudioArtistSupporterStatus({
  status,
  personaName,
  shownAsName,
  removeError,
}: {
  status: StudioSupporterStatus | null;
  personaName: string;
  /** The name the artist sees now; null when none can be read. */
  shownAsName: string | null;
  removeError: unknown;
}) {
  const { t } = useTranslation();
  const statusText =
    status === "removed"
      ? t("studio:supporter.removed", { persona: personaName })
      : status === "removeFailed"
        ? `${t("studio:supporter.removeFailed")}. ${t(studioReasonCopyKey(studioReasonOf(removeError), "save"))}`
        : null;
  const announcedText =
    status === "saved" && shownAsName !== null
      ? t("studio:supporter.confirmation", {
          persona: personaName,
          name: shownAsName,
        })
      : null;
  const lastStatusText = useLastPresent(statusText);
  return (
    <div role="status">
      <Collapse isOpen={statusText !== null}>
        <p className={styles.status}>{lastStatusText}</p>
      </Collapse>
      {announcedText !== null && (
        <span className="visuallyHidden">{announcedText}</span>
      )}
    </div>
  );
}
