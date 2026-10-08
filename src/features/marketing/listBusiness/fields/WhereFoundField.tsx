import { FiGlobe, FiMapPin, FiNavigation } from "react-icons/fi";
import {
  FormField,
  RadioCardGroup,
  type RadioCardOption,
} from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { ANCHOR } from "../listBusiness.data";
import { whereFoundChoiceOf, type WhereFoundChoice } from "../listingKind";
import type { ListingForm } from "../useListingForm";
import styles from "../ListBusinessPage.module.css";
import mobileStyles from "./MobileFields.module.css";

const KEY = "marketing:listBusiness.step0.whereFound";

/**
 * "Where do people find it?": a place people visit, online only, or out and
 * about. Required before Next on step 0, for staff drafts too. The answer
 * picks the category list in Basics and the practical step's fields.
 * Switching later keeps the other kinds' answers in the draft (`withKind`).
 *
 * An edit has no step 0, so Basics renders this same field at its top with
 * `anchorId={ANCHOR.online}` and the edit helper, so a listing can move
 * between all three kinds after creation.
 */
export function WhereFoundField({
  form,
  anchorId = ANCHOR.whereFound,
  helperKey = `${KEY}.helper`,
}: {
  form: ListingForm;
  anchorId?: string;
  helperKey?: string;
}) {
  const { t } = useTranslation();
  const { draft, chooseWhereFound } = form;
  const options: RadioCardOption<WhereFoundChoice>[] = [
    {
      id: "place",
      render: (
        <>
          <span className={`${styles.pcIc} ${styles.pcIcOwn}`}>
            <FiMapPin />
          </span>
          <b>{t(`${KEY}.place.title`)}</b>
          <span>{t(`${KEY}.place.desc`)}</span>
        </>
      ),
    },
    {
      id: "online",
      render: (
        <>
          <span className={`${styles.pcIc} ${styles.pcIcSug}`}>
            <FiGlobe />
          </span>
          <b>{t(`${KEY}.online.title`)}</b>
          <span>{t(`${KEY}.online.desc`)}</span>
        </>
      ),
    },
    {
      id: "mobile",
      render: (
        <>
          <span className={`${styles.pcIc} ${mobileStyles.pcIcMobile}`}>
            <FiNavigation />
          </span>
          <b>{t(`${KEY}.mobile.title`)}</b>
          <span>{t(`${KEY}.mobile.desc`)}</span>
        </>
      ),
    },
  ];
  return (
    <FormField
      className={`${styles.lbField} ${mobileStyles.kindField}`}
      id={anchorId}
      label={t(`${KEY}.label`)}
      required
      helper={t(helperKey)}
    >
      <RadioCardGroup<WhereFoundChoice>
        className={mobileStyles.kindGrid}
        optionClassName={styles.pathCard}
        checkedClassName={styles.pathCardOn}
        ariaLabel={t(`${KEY}.aria`)}
        value={whereFoundChoiceOf(draft)}
        onChange={chooseWhereFound}
        options={options}
      />
    </FormField>
  );
}
