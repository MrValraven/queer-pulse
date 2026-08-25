import { FormField, RadioCardGroup } from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import type { ListingOperatingState } from "../api/listings.api";
import {
  MOVED_ADDRESS_MAX,
  OPERATING_STATE_NOTE_MAX,
  OPERATING_STATE_OPTIONS,
} from "./listingOperatingState.data";
import styles from "./ListingTrading.module.css";

/**
 * The choice itself: four state cards, the owner's public explanation, and the
 * forwarding address a moved business owes its readers.
 *
 * Nothing here commits anything. The parent section holds the staged choice and
 * only sends it when the owner presses the button, which is what lets
 * "permanently closed" open a confirmation instead of taking effect the instant
 * a card is clicked.
 */
export function ListingOperatingStateFields({
  chosenState,
  note,
  movedToAddress,
  onChangeState,
  onChangeNote,
  onChangeMovedToAddress,
}: {
  chosenState: ListingOperatingState;
  note: string;
  movedToAddress: string;
  onChangeState: (state: ListingOperatingState) => void;
  onChangeNote: (note: string) => void;
  onChangeMovedToAddress: (address: string) => void;
}) {
  const { t } = useTranslation();
  const isMoved = chosenState === "moved";
  const isOpen = chosenState === "open";

  return (
    <>
      <RadioCardGroup<ListingOperatingState>
        value={chosenState}
        onChange={onChangeState}
        ariaLabel={t("marketing:listBusiness.trading.groupAria")}
        className={styles.stateGrid}
        optionClassName={styles.stateCard}
        checkedClassName={styles.stateCardOn}
        options={OPERATING_STATE_OPTIONS.map((option) => {
          const OptionIcon = option.icon;
          return {
            id: option.id,
            render: (
              <>
                <span
                  className={[
                    styles.stateIcon,
                    option.id === "permanently_closed" && styles.stateIconGrave,
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  <OptionIcon aria-hidden />
                </span>
                <span className={styles.stateLabel}>{t(option.labelKey)}</span>
                <span className={styles.stateDesc}>{t(option.descKey)}</span>
              </>
            ),
          };
        })}
      />

      {!isOpen && (
        <FormField
          className={styles.field}
          label={t("marketing:listBusiness.trading.noteLabel")}
          helper={t("marketing:listBusiness.trading.noteHint")}
          labelAside={
            <span aria-hidden>
              {note.length}/{OPERATING_STATE_NOTE_MAX}
            </span>
          }
        >
          <textarea
            rows={2}
            maxLength={OPERATING_STATE_NOTE_MAX}
            placeholder={t("marketing:listBusiness.trading.notePlaceholder")}
            value={note}
            onChange={(event) => onChangeNote(event.target.value)}
          />
        </FormField>
      )}

      {isMoved && (
        <FormField
          className={styles.field}
          required
          label={t("marketing:listBusiness.trading.movedToLabel")}
          helper={t("marketing:listBusiness.trading.movedToHint")}
        >
          <input
            type="text"
            maxLength={MOVED_ADDRESS_MAX}
            placeholder={t("marketing:listBusiness.trading.movedToPlaceholder")}
            value={movedToAddress}
            onChange={(event) => onChangeMovedToAddress(event.target.value)}
          />
        </FormField>
      )}
    </>
  );
}
