import { FormField } from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { ANCHOR } from "../listBusiness.data";
import { normalizeOnlineDetails, ONLINE_NOTE_MAX } from "../listingOnline.data";
import type { ListingForm } from "../useListingForm";
import { OnlineFulfilmentFields } from "./OnlineFulfilmentFields";
import { OnlineMainLinkField } from "./OnlineMainLinkField";
import { OnlineMoreLinksField } from "./OnlineMoreLinksField";
import { OnlinePaymentFields } from "./OnlinePaymentFields";
import styles from "../ListBusinessPage.module.css";

/**
 * "How people buy from you", in the spec's order: main link, more links, how
 * people get it (with its reveals), payments, session formats and
 * registration when the categories ask, then the reply and dispatch note,
 * which replaces the hours editor. `variant` "place" is the "We also sell
 * online" section: the same fields minus pick-up and the in-person session
 * format, with its own main link helper. Fragment, so each field
 * stays a direct child of the caller's `.stepBody` column.
 */
export function OnlineSellingFields({
  form,
  variant,
}: {
  form: ListingForm;
  variant: "online" | "place";
}) {
  const { t } = useTranslation();
  const details = normalizeOnlineDetails(form.draft.onlineDetails);
  return (
    <>
      <OnlineMainLinkField form={form} details={details} variant={variant} />
      <OnlineMoreLinksField form={form} details={details} />
      <OnlineFulfilmentFields form={form} details={details} variant={variant} />
      <OnlinePaymentFields form={form} details={details} variant={variant} />
      <FormField
        className={styles.lbField}
        id={ANCHOR.replyNote}
        label={t("marketing:listBusiness.online.replyNote.label")}
        labelAside={`${details.replyNote.length} / ${ONLINE_NOTE_MAX}`}
      >
        <textarea
          rows={3}
          maxLength={ONLINE_NOTE_MAX}
          placeholder={t("marketing:listBusiness.online.replyNote.placeholder")}
          value={details.replyNote}
          onChange={(event) =>
            form.setOnlineDetail({ replyNote: event.target.value })
          }
        />
      </FormField>
    </>
  );
}
