import { useId } from "react";
import { FormField, RadioCardGroup } from "../../shared/components/ui";
import type { RadioCardOption } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { ListingPublishState } from "./api/adminListingCreate.api";
import styles from "./AdminListingNewPage.module.css";

/**
 * The DOM id `listing422.ts` routes a `publishState` or `ownerOffer`
 * validation error to. Those two fields belong to no wizard step, so the
 * router sends them to step 0 and flashes this block at the top of the form.
 * Without the id on a rendered element `flashField` silently does nothing,
 * and a 422 on an admin field looks almost right while highlighting nothing.
 */
export const ADMIN_LISTING_FIELDS_ANCHOR = "lb-admin-fields";

/** Server ceilings, mirrored so the console can stop an admin before the API
 *  has to (`CreateListingOwnerOfferDto`). */
const MEMBER_SLUG_MAX_LENGTH = 120;
const OFFER_NOTE_MAX_LENGTH = 1000;

const PUBLISH_STATES: ListingPublishState[] = ["review", "live"];

export interface AdminListingNewFieldsProps {
  publishState: ListingPublishState;
  onPublishStateChange: (publishState: ListingPublishState) => void;
  /** The member being offered the listing, by public profile slug. Empty
   *  means the listing stays in the team's hands for now. */
  ownerSlug: string;
  onOwnerSlugChange: (ownerSlug: string) => void;
  ownerNote: string;
  onOwnerNoteChange: (ownerNote: string) => void;
}

/**
 * The two questions the shared wizard has no step for: how the listing should
 * go out, and who is being offered it.
 *
 * Rendered above the wizard on `/admin/listings/new`. Every value is lifted to
 * the page, which builds them into the POST body alongside the wizard's own
 * draft.
 */
export function AdminListingNewFields({
  publishState,
  onPublishStateChange,
  ownerSlug,
  onOwnerSlugChange,
  ownerNote,
  onOwnerNoteChange,
}: AdminListingNewFieldsProps) {
  const { t } = useTranslation();
  const publishLabelId = useId();
  const publishHintId = useId();
  const hasOwnerSlug = ownerSlug.trim() !== "";

  const publishOptions: RadioCardOption<ListingPublishState>[] =
    PUBLISH_STATES.map((state) => ({
      id: state,
      render: (
        <>
          <span className={styles.stateTitle}>
            {t(`admin:listingNew.publishState.${state}.title`)}
          </span>
          <span className={styles.stateDesc}>
            {t(`admin:listingNew.publishState.${state}.desc`)}
          </span>
        </>
      ),
    }));

  return (
    <section
      id={ADMIN_LISTING_FIELDS_ANCHOR}
      className={styles.adminBlock}
      aria-label={t("admin:listingNew.fields.aria")}
    >
      <div className={styles.group}>
        <div className={styles.label} id={publishLabelId}>
          {t("admin:listingNew.publishState.label")}
        </div>
        <p className={styles.hint} id={publishHintId}>
          {t("admin:listingNew.publishState.hint")}
        </p>
        <RadioCardGroup<ListingPublishState>
          className={styles.stateGrid}
          optionClassName={styles.stateCard}
          checkedClassName={styles.stateCardOn}
          ariaLabel={t("admin:listingNew.publishState.label")}
          ariaLabelledBy={publishLabelId}
          ariaDescribedBy={publishHintId}
          value={publishState}
          onChange={onPublishStateChange}
          options={publishOptions}
        />
      </div>

      <div className={styles.group}>
        <div className={styles.label}>{t("admin:listingNew.owner.label")}</div>
        <p className={styles.hint}>{t("admin:listingNew.owner.hint")}</p>
        <FormField
          label={t("admin:listingNew.owner.slugLabel")}
          helper={t("admin:listingNew.owner.slugHelper")}
        >
          <input
            value={ownerSlug}
            maxLength={MEMBER_SLUG_MAX_LENGTH}
            autoComplete="off"
            onChange={(event) => onOwnerSlugChange(event.target.value)}
          />
        </FormField>
        {/* The note rides with the offer, so it only has somewhere to go once
            a member is named. */}
        {hasOwnerSlug && (
          <FormField
            label={t("admin:listingNew.owner.noteLabel")}
            helper={t("admin:listingNew.owner.noteHelper")}
          >
            <textarea
              rows={3}
              value={ownerNote}
              maxLength={OFFER_NOTE_MAX_LENGTH}
              onChange={(event) => onOwnerNoteChange(event.target.value)}
            />
          </FormField>
        )}
      </div>
    </section>
  );
}
