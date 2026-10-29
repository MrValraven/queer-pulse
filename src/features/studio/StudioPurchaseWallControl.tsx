import { useId } from "react";
import { Button, Collapse, Toggle } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioBuyerPurchaseView } from "./api/studioPurchases.adapters";
import { StudioLoadError } from "./StudioLoadStates";
import { StudioLine } from "./StudioSkeletons";
import { StudioSupporterIdentity } from "./StudioSupporterIdentity";
import { StudioSupporterPickerRegion } from "./StudioSupporterIdentityPicker";
import { useStudioPurchaseWallChoice } from "./useStudioPurchaseWallChoice";
import styles from "./StudioPurchasePieces.module.css";

function StudioPurchaseWallSwitch({
  purchase,
}: {
  purchase: StudioBuyerPurchaseView;
}) {
  const { t } = useTranslation();
  const switchId = useId();
  const bodyId = useId();
  const pickerId = useId();
  const choice = useStudioPurchaseWallChoice(purchase, switchId);
  const {
    isOn,
    isPickerShown,
    isWaiting,
    wall,
    pickerWall,
    shownPickerWall,
    loadState,
    shownIdentity,
    statusText,
    shownStatusText,
    failureKey,
    shownFailureKey,
  } = choice;

  return (
    <div className={styles.wall}>
      <div className={styles.wallRow}>
        <div className={styles.wallText}>
          <label htmlFor={switchId} className={styles.wallLabel}>
            {t("studio:purchase.wall.toggle")}
          </label>
          <p id={bodyId} className={styles.wallBody}>
            {t("studio:purchase.wall.body")}
          </p>
        </div>
        <Toggle
          id={switchId}
          label={t("studio:purchase.wall.toggle")}
          aria-describedby={bodyId}
          checked={isOn || isPickerShown}
          onChange={choice.changeSwitch}
        />
      </div>
      <Collapse isOpen={isOn}>
        <div className={styles.wallShown}>
          <Collapse isOpen={wall.shownAs !== null}>
            {shownIdentity && (
              <div>
                <span className="visuallyHidden">
                  {t("studio:purchase.wall.shownAs", {
                    name: shownIdentity.name,
                  })}
                </span>
                <div aria-hidden="true">
                  <StudioSupporterIdentity
                    identity={shownIdentity}
                    isLinked={false}
                  />
                </div>
              </div>
            )}
          </Collapse>
          <Button
            variant="quiet"
            size="sm"
            aria-expanded={isPickerShown}
            aria-controls={pickerId}
            onClick={choice.openPicker}
          >
            {t("studio:supporter.changeCta")}
          </Button>
        </div>
      </Collapse>
      <Collapse isOpen={isOn && wall.needsNewIdentity}>
        <p className={styles.wallNote}>{t("studio:purchase.wall.pickAgain")}</p>
      </Collapse>
      <Collapse isOpen={isOn && purchase.status === "pending"}>
        <p className={styles.wallNote}>
          {t("studio:purchase.wall.pendingNote", {
            artist: purchase.artist.name,
          })}
        </p>
      </Collapse>
      <Collapse isOpen={isWaiting && loadState.isLoading}>
        <div className={styles.wallSkeleton} aria-hidden="true">
          <StudioLine width="85%" height={12} />
          <StudioLine width="60%" height={12} />
        </div>
      </Collapse>
      <Collapse
        isOpen={isWaiting && (loadState.isError || loadState.isNotFound)}
      >
        {loadState.isNotFound ? (
          <p role="alert" className={styles.wallError}>
            {t("studio:errors.reason.studio_purchase_not_found")}
          </p>
        ) : (
          <StudioLoadError
            loadState={loadState}
            what="studio:errors.what.wall"
          />
        )}
      </Collapse>
      <StudioSupporterPickerRegion
        id={pickerId}
        isOpen={isPickerShown && pickerWall !== null}
        personaName={purchase.artist.name}
        legend={t("studio:purchase.sheet.wallLegend")}
        options={shownPickerWall?.options ?? []}
        initialShownAsSubprofileId={
          shownPickerWall?.shownAsSubprofileId ?? null
        }
        isSaving={choice.isSavingWall}
        shouldFocusOnOpen={choice.isOpenedByMember}
        saveError={null}
        isPickUnset={wall.shownAs === null}
        onSave={(shownAsSubprofileId) =>
          void choice.savePicked(shownAsSubprofileId)
        }
        onClose={() => {
          choice.closePicker();
          document.getElementById(switchId)?.focus();
        }}
      />
      <Collapse isOpen={failureKey !== null}>
        <p role="alert" className={styles.wallError}>
          {shownFailureKey !== null &&
            `${t("studio:purchase.wall.saveFailed")}. ${t(shownFailureKey)}`}
        </p>
      </Collapse>
      <div role="status">
        <Collapse isOpen={statusText !== null}>
          <p className={styles.wallStatus}>{shownStatusText}</p>
        </Collapse>
      </div>
    </div>
  );
}

/** The wall switch for one purchase: pending or confirmed with the artist
 *  still on Studio (contract 3.4), else nothing. */
export function StudioPurchaseWallControl({
  purchase,
}: {
  purchase: StudioBuyerPurchaseView;
}) {
  const isOpenToWall =
    (purchase.status === "pending" || purchase.status === "confirmed") &&
    purchase.artist.subprofileId !== null;
  return isOpenToWall ? <StudioPurchaseWallSwitch purchase={purchase} /> : null;
}
