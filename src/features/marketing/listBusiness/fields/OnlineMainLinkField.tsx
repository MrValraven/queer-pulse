import { FormField, Select } from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { ANCHOR } from "../listBusiness.data";
import {
  isOnlineLinkValid,
  MAIN_LINK_KIND_LABEL_KEYS,
  ONLINE_LINK_MAX,
  ONLINE_MAIN_LINK_KINDS,
  type ListingOnlineDetailsDraft,
  type OnlineMainLinkKind,
} from "../listingOnline.data";
import type { ListingForm } from "../useListingForm";
import styles from "../ListBusinessPage.module.css";

const KEY = "marketing:listBusiness.online.mainLink";

/** The main link and what it opens. Required for anything that sells online,
 *  on both paths; the card's Visit opens it for an online-only listing. */
export function OnlineMainLinkField({
  form,
  details,
  variant,
}: {
  form: ListingForm;
  details: ListingOnlineDetailsDraft;
  /** "place": the link sits under the page's Ordering & delivery block. */
  variant: "online" | "place";
}) {
  const { t } = useTranslation();
  const isValid = isOnlineLinkValid(details.mainLink.url);
  return (
    <div className={styles.twoCol}>
      <FormField
        className={styles.lbField}
        id={ANCHOR.mainLink}
        label={t(`${KEY}.label`)}
        required
        helper={t(variant === "place" ? `${KEY}.helperPlace` : `${KEY}.helper`)}
        error={
          isValid ? undefined : t("marketing:listBusiness.social.website.err")
        }
      >
        <input
          type="url"
          inputMode="url"
          maxLength={ONLINE_LINK_MAX}
          aria-invalid={!isValid}
          placeholder={t(`${KEY}.placeholder`)}
          value={details.mainLink.url}
          onChange={(event) => form.setMainLink({ url: event.target.value })}
        />
      </FormField>
      <FormField className={styles.lbField} label={t(`${KEY}.kindLabel`)}>
        <Select
          options={ONLINE_MAIN_LINK_KINDS.map((kind) => ({
            value: kind,
            label: t(MAIN_LINK_KIND_LABEL_KEYS[kind]),
          }))}
          value={details.mainLink.kind}
          onChange={(value) => {
            if (value) form.setMainLink({ kind: value as OnlineMainLinkKind });
          }}
        />
      </FormField>
    </div>
  );
}
