import { FiCheck } from "react-icons/fi";
import {
  CheckLine,
  ChipSelect,
  FormField,
  RadioCardGroup,
} from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { ANCHOR } from "../listBusiness.data";
import {
  FULFILMENT_LABEL_KEYS,
  isShippingPicked,
  ONLINE_FULFILMENT_OPTIONS,
  ONLINE_NOTE_MAX,
  ONLINE_SHIPS_FROM_OPTIONS,
  SHIPS_FROM_LABEL_KEYS,
  shouldAskSessionFormats,
  type ListingOnlineDetailsDraft,
  type OnlineFulfilment,
  type OnlineShipsFrom,
} from "../listingOnline.data";
import type { ListingForm } from "../useListingForm";
import styles from "../ListBusinessPage.module.css";
import sellingStyles from "./OnlineSelling.module.css";

const KEY = "marketing:listBusiness.online";

/**
 * How people get it, then the reveals it drives: the pick-up note once
 * pick-up is picked (online only: a place has an address), "ships from" once
 * any shipping answer is, and the IOSS box once that is outside the EU.
 * Required on a claimed online listing, where a session format also counts
 * (contract amendment 1); optional on a suggestion and for a place.
 */
export function OnlineFulfilmentFields({
  form,
  details,
  variant,
}: {
  form: ListingForm;
  details: ListingOnlineDetailsDraft;
  variant: "online" | "place";
}) {
  const { t } = useTranslation();
  const options = ONLINE_FULFILMENT_OPTIONS.filter(
    (option) => variant === "online" || option !== "pickupLisbon",
  );
  const isClaimOnline = variant === "online" && form.draft.path === "claim";
  const helperKey =
    variant === "place"
      ? `${KEY}.fulfilment.helperPlace`
      : isClaimOnline
        ? // A session format counts only where the categories ask for one.
          shouldAskSessionFormats(form.draft.cats)
          ? `${KEY}.fulfilment.helperClaim`
          : `${KEY}.fulfilment.helperClaimNoSessions`
        : `${KEY}.fulfilment.helperSuggest`;
  const isPickupPicked =
    variant === "online" && details.fulfilment.includes("pickupLisbon");
  const isShipping = isShippingPicked(details.fulfilment);

  return (
    <>
      <FormField
        className={styles.lbField}
        id={ANCHOR.fulfilment}
        label={t(`${KEY}.fulfilment.label`)}
        required={isClaimOnline}
        helper={t(helperKey)}
      >
        <ChipSelect
          label={t(`${KEY}.fulfilment.label`)}
          options={options.map((option) => ({
            value: option,
            label: t(FULFILMENT_LABEL_KEYS[option]),
          }))}
          selected={new Set(details.fulfilment)}
          onToggle={(value) => form.toggleFulfilment(value as OnlineFulfilment)}
        />
      </FormField>
      {isPickupPicked && (
        <FormField
          className={styles.lbField}
          id={ANCHOR.pickupNote}
          label={t(`${KEY}.pickupNote.label`)}
          labelAside={`${details.pickupNote.length} / ${ONLINE_NOTE_MAX}`}
        >
          <textarea
            rows={2}
            maxLength={ONLINE_NOTE_MAX}
            placeholder={t(`${KEY}.pickupNote.placeholder`)}
            value={details.pickupNote}
            onChange={(event) =>
              form.setOnlineDetail({ pickupNote: event.target.value })
            }
          />
        </FormField>
      )}
      {isShipping && (
        <FormField
          className={styles.lbField}
          id={ANCHOR.shipsFrom}
          label={t(`${KEY}.shipsFrom.label`)}
        >
          <RadioCardGroup<OnlineShipsFrom>
            className={styles.chipRow}
            optionClassName={`${styles.chip} ${sellingStyles.shipsChip}`}
            checkedClassName={styles.chipOn}
            ariaLabel={t(`${KEY}.shipsFrom.label`)}
            value={details.shipsFrom}
            onChange={(shipsFrom) =>
              form.setOnlineDetail({
                shipsFrom,
                ...(shipsFrom === "outsideEu" ? {} : { isVatIncluded: false }),
              })
            }
            options={ONLINE_SHIPS_FROM_OPTIONS.map((option) => ({
              id: option,
              render: (
                <>
                  {details.shipsFrom === option && <FiCheck aria-hidden />}
                  <span>{t(SHIPS_FROM_LABEL_KEYS[option])}</span>
                </>
              ),
            }))}
          />
        </FormField>
      )}
      {isShipping && details.shipsFrom === "outsideEu" && (
        <div className={sellingStyles.vatRow}>
          <CheckLine
            checked={details.isVatIncluded}
            onChange={(isVatIncluded) =>
              form.setOnlineDetail({ isVatIncluded })
            }
            title={t(`${KEY}.vat.title`)}
            sub={t(`${KEY}.vat.sub`)}
          />
        </div>
      )}
    </>
  );
}
