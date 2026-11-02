import { useState } from "react";
import { DatePicker, FormField } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { SubprofileItemView } from "../api/subprofiles.adapters";
import { ImageUploadField } from "../ImageUploadField";
import { SECTION_IMAGE_PLACEHOLDER_KEYS } from "../subprofileEditor.data";
import { toGigDayValue } from "./gigDate";
import { GigStatusField } from "./GigStatusField";
import { isGigTicketLinkInvalid } from "./useGigDrawerDraft";
import styles from "./GigDrawer.module.css";

interface GigFieldsProps {
  draft: SubprofileItemView;
  onPatch: (patch: Partial<SubprofileItemView>) => void;
}

/** The two time-and-place rows: date with doors, then venue with city. Each
 *  pair sits side by side from 560px and stacks below it. */
function GigWhenAndWhere({ draft, onPatch }: GigFieldsProps) {
  const { t } = useTranslation();
  const doorsValue = /^\d{2}:\d{2}$/.test(draft.doors ?? "")
    ? draft.doors
    : null;
  return (
    <>
      <div className={styles.pair}>
        <FormField label={t("subprofiles:gigEditor.field.date.label")} required>
          <DatePicker
            mode="date"
            label={t("subprofiles:gigEditor.field.date.label")}
            value={toGigDayValue(draft.date) || null}
            onChange={(picked) => onPatch({ date: picked ?? "" })}
          />
        </FormField>
        <FormField
          label={t("subprofiles:gigEditor.field.doors.label")}
          className={styles.doorsField}
        >
          <DatePicker
            mode="time"
            label={t("subprofiles:gigEditor.field.doors.label")}
            value={doorsValue}
            clearable
            onChange={(time) => onPatch({ doors: time || null })}
          />
        </FormField>
      </div>
      <div className={styles.pair}>
        <FormField label={t("subprofiles:gigEditor.field.venue.label")}>
          <input
            value={draft.venue ?? ""}
            placeholder={t("subprofiles:gigEditor.field.venue.placeholder")}
            onChange={(event) => onPatch({ venue: event.target.value || null })}
          />
        </FormField>
        <FormField label={t("subprofiles:gigEditor.field.city.label")}>
          <input
            value={draft.subtitle}
            placeholder={t("subprofiles:gigEditor.field.city.placeholder")}
            onChange={(event) => onPatch({ subtitle: event.target.value })}
          />
        </FormField>
      </div>
    </>
  );
}

/** Ticket and event page links. The ticket link names its problem inline
 *  once the member leaves the field, and the footer names it as well. */
function GigLinkFields({ draft, onPatch }: GigFieldsProps) {
  const { t } = useTranslation();
  // A stored link that is already invalid names its problem on open; text the
  // person is typing waits for the blur.
  const [hasLeftTicketField, setHasLeftTicketField] = useState(() =>
    isGigTicketLinkInvalid(draft.ticketUrl),
  );
  const isTicketInvalid = isGigTicketLinkInvalid(draft.ticketUrl);
  return (
    <>
      <FormField
        label={t("subprofiles:gigEditor.field.ticket.label")}
        helper={t("subprofiles:gigEditor.field.ticket.helper")}
        error={
          isTicketInvalid && hasLeftTicketField
            ? t("subprofiles:gigEditor.field.ticket.error")
            : undefined
        }
      >
        <input
          type="url"
          inputMode="url"
          autoComplete="off"
          value={draft.ticketUrl ?? ""}
          placeholder={t("subprofiles:richField.ticketUrl.placeholder")}
          onBlur={() => setHasLeftTicketField(true)}
          onChange={(event) =>
            onPatch({ ticketUrl: event.target.value || null })
          }
        />
      </FormField>
      <FormField
        label={t("subprofiles:gigEditor.field.eventLink.label")}
        helper={t("subprofiles:gigEditor.field.eventLink.helper")}
      >
        <input
          type="url"
          inputMode="url"
          autoComplete="off"
          value={draft.url}
          placeholder={t("subprofiles:richField.ticketUrl.placeholder")}
          onChange={(event) => onPatch({ url: event.target.value })}
        />
      </FormField>
    </>
  );
}

/** The poster picker, poster-aware so a tall flyer shows whole. */
function GigPosterField({ draft, onPatch }: GigFieldsProps) {
  const { t } = useTranslation();
  const placeholderKey = SECTION_IMAGE_PLACEHOLDER_KEYS.gigs;
  return (
    <div className={`${styles.group} ${styles.posterGroup}`}>
      <span className={styles.groupLabel}>
        {t("subprofiles:gigEditor.field.poster.label")}
      </span>
      <ImageUploadField
        value={draft.imageUrl}
        kind="work-image"
        isPosterAware
        addLabel={t("subprofiles:gigEditor.field.poster.add")}
        changeLabel={t("subprofiles:gigEditor.field.poster.change")}
        placeholder={placeholderKey ? t(placeholderKey) : undefined}
        onChange={(imageUrl) => onPatch({ imageUrl })}
      />
      <p className={styles.helper}>
        {t("subprofiles:gigEditor.field.poster.helper")}
      </p>
    </div>
  );
}

/**
 * The gig drawer's content column: name, date and doors, venue and city,
 * status, ticket and event links, poster. The city is the item's `subtitle`
 * and the event page link is its `url`, which the spotlight strip reads.
 */
export function GigDrawerFields({ draft, onPatch }: GigFieldsProps) {
  const { t } = useTranslation();
  return (
    <>
      <FormField label={t("subprofiles:gigEditor.field.name.label")} required>
        <input
          value={draft.title}
          placeholder={t("subprofiles:gigEditor.field.name.placeholder")}
          onChange={(event) => onPatch({ title: event.target.value })}
        />
      </FormField>
      <GigWhenAndWhere draft={draft} onPatch={onPatch} />
      <GigStatusField
        gigState={draft.gigState}
        onChange={(gigState) => onPatch({ gigState })}
      />
      <GigLinkFields draft={draft} onPatch={onPatch} />
      <GigPosterField draft={draft} onPatch={onPatch} />
    </>
  );
}
