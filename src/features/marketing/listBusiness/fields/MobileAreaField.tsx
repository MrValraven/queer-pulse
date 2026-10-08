import {
  FormField,
  RadioCardGroup,
  TagPicker,
} from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { ANCHOR } from "../listBusiness.data";
import {
  LISBON_PARISH_NAMES,
  NEARBY_MUNICIPALITIES,
  normalizeMobileDetails,
} from "../listingMobile.data";
import type { ListingForm } from "../useListingForm";
import styles from "../ListBusinessPage.module.css";
import mobileStyles from "./MobileFields.module.css";

const KEY = "marketing:listBusiness.step1.whereYouWork";
const TRAVELS_KEY = "marketing:listBusiness.step1.alsoTravelsTo";

type AreaChoice = "all" | "some";

/**
 * "Where you work", in Basics for an out-and-about listing: the whole city
 * or some parishes (the shared TagPicker over the 24, at least one), then
 * "Also travels to" over the eight nearby municipalities. No radius and no
 * home address, ever. The parishes picked stay in the draft while "All of
 * Lisbon" is on, so switching back brings them back.
 */
export function MobileAreaField({ form }: { form: ListingForm }) {
  const { t } = useTranslation();
  const {
    draft,
    setMobileAllOfCity,
    addMobileParish,
    removeMobileParish,
    toggleAlsoTravelsTo,
  } = form;
  const details = normalizeMobileDetails(draft.mobileDetails);

  return (
    <>
      <FormField
        className={styles.lbField}
        id={ANCHOR.whereYouWork}
        label={t(`${KEY}.label`)}
        required
        helper={t(`${KEY}.helper`)}
      >
        <RadioCardGroup<AreaChoice>
          className={styles.chipRow}
          optionClassName={styles.chip}
          checkedClassName={styles.chipOn}
          ariaLabel={t(`${KEY}.aria`)}
          value={details.allOfCity ? "all" : "some"}
          onChange={(choice) => setMobileAllOfCity(choice === "all")}
          options={[
            { id: "all", render: t(`${KEY}.allOfCity`) },
            { id: "some", render: t(`${KEY}.someParishes`) },
          ]}
        />
        {!details.allOfCity && (
          <TagPicker
            className={mobileStyles.parishPicker}
            frame="boxed"
            shouldFoldAccents
            tags={details.parishes}
            options={LISBON_PARISH_NAMES}
            onAdd={addMobileParish}
            onRemove={removeMobileParish}
            labels={{
              input: t(`${KEY}.parishesLabel`),
              placeholder: t(`${KEY}.parishesPlaceholder`),
              remove: (tag) => t(`${KEY}.parishRemove`, { tag }),
              noMatch: (query) => t(`${KEY}.parishNoMatch`, { query }),
            }}
          />
        )}
      </FormField>
      <FormField
        className={styles.lbField}
        label={t(`${TRAVELS_KEY}.label`)}
        helper={t(`${TRAVELS_KEY}.helper`)}
      >
        <div
          className={styles.chipRow}
          role="group"
          aria-label={t(`${TRAVELS_KEY}.aria`)}
        >
          {NEARBY_MUNICIPALITIES.map((municipality) => {
            const isOn = details.alsoTravelsTo.includes(municipality);
            return (
              <button
                key={municipality}
                type="button"
                aria-pressed={isOn}
                className={[styles.chip, isOn && styles.chipOn]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => toggleAlsoTravelsTo(municipality)}
              >
                {municipality}
              </button>
            );
          })}
        </div>
      </FormField>
    </>
  );
}
