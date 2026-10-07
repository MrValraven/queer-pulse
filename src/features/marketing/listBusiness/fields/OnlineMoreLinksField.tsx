import { useId } from "react";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import {
  Button,
  FormField,
  IconButton,
  Select,
} from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { ANCHOR } from "../listBusiness.data";
import {
  isOnlineLinkValid,
  MAX_ONLINE_MORE_LINKS,
  ONLINE_LINK_MAX,
  ONLINE_LINK_PLATFORM_DEFINITIONS,
  ONLINE_LINK_PLATFORMS,
  type ListingOnlineDetailsDraft,
  type OnlineLinkPlatform,
  type OnlineMoreLinkRow,
} from "../listingOnline.data";
import type { ListingForm } from "../useListingForm";
import styles from "../ListBusinessPage.module.css";
import sellingStyles from "./OnlineSelling.module.css";

const KEY = "marketing:listBusiness.online.moreLinks";

/**
 * One "more links" row: a platform, the address and a remove button, each
 * named for the row's position. A row with one half filled marks the empty
 * half invalid and says so under the row, so the member sees which row the
 * missing-fields bar means.
 */
function OnlineMoreLinkRowFields({
  form,
  row,
  position,
  platformOptions,
  errorId,
}: {
  form: ListingForm;
  row: OnlineMoreLinkRow;
  position: number;
  platformOptions: { value: OnlineLinkPlatform; label: string }[];
  errorId: string;
}) {
  const { t } = useTranslation();
  const hasUrl = row.url.trim() !== "";
  const isPlatformMissing = hasUrl && row.platform === "";
  const isUrlMissing = !hasUrl && row.platform !== "";
  const isUrlFormatBad = !isOnlineLinkValid(row.url);
  const isUrlInvalid = isUrlFormatBad || isUrlMissing;
  const rowError = isUrlFormatBad
    ? t("marketing:listBusiness.social.website.err")
    : isPlatformMissing
      ? t(`${KEY}.rowPlatformMissing`)
      : isUrlMissing
        ? t(`${KEY}.rowUrlMissing`)
        : "";
  return (
    <div className={sellingStyles.linkRow}>
      <Select
        className={sellingStyles.platform}
        label={t(`${KEY}.platformLabelRow`, { position })}
        placeholder={t(`${KEY}.platformPlaceholder`)}
        options={platformOptions}
        value={row.platform || null}
        invalid={isPlatformMissing}
        aria-describedby={isPlatformMissing ? errorId : undefined}
        onChange={(value) =>
          form.setMoreLink(row.id, {
            platform: (value ?? "") as OnlineLinkPlatform | "",
          })
        }
      />
      <input
        type="url"
        inputMode="url"
        aria-label={t(`${KEY}.urlLabelRow`, { position })}
        aria-invalid={isUrlInvalid}
        aria-describedby={isUrlInvalid ? errorId : undefined}
        placeholder={t(`${KEY}.urlPlaceholder`)}
        maxLength={ONLINE_LINK_MAX}
        value={row.url}
        onChange={(event) =>
          form.setMoreLink(row.id, { url: event.target.value })
        }
      />
      <IconButton
        size="sm"
        aria-label={t(`${KEY}.remove`, { position })}
        onClick={() => form.removeMoreLink(row.id)}
      >
        <FiTrash2 aria-hidden />
      </IconButton>
      {rowError !== "" && (
        <p id={errorId} className={sellingStyles.rowError} role="alert">
          {rowError}
        </p>
      )}
    </div>
  );
}

/**
 * Up to four more places to find the business (Etsy, Bandcamp, Ko-fi and the
 * like): a platform, the address and a remove button per row. A row missing
 * either half holds the save back until it is finished or removed. Rows are
 * keyed and addressed by their client ids. The rows sit in a fragment so
 * `FormField` keeps its label unwired: each control names itself.
 */
export function OnlineMoreLinksField({
  form,
  details,
}: {
  form: ListingForm;
  details: ListingOnlineDetailsDraft;
}) {
  const { t } = useTranslation();
  const errorIdBase = useId();
  const rows = details.moreLinks;
  const isAtCeiling = rows.length >= MAX_ONLINE_MORE_LINKS;
  const platformOptions = ONLINE_LINK_PLATFORMS.map((platform) => ({
    value: platform,
    label: t(ONLINE_LINK_PLATFORM_DEFINITIONS[platform].labelKey),
  }));

  return (
    <FormField
      className={styles.lbField}
      id={ANCHOR.moreLinks}
      label={t(`${KEY}.label`)}
      helper={t(`${KEY}.helper`)}
    >
      <>
        {rows.length > 0 && (
          <div className={sellingStyles.linkRows}>
            {rows.map((row, index) => (
              <OnlineMoreLinkRowFields
                key={row.id}
                form={form}
                row={row}
                position={index + 1}
                platformOptions={platformOptions}
                errorId={`${errorIdBase}-${row.id}-error`}
              />
            ))}
          </div>
        )}
        <div className={sellingStyles.addRow}>
          <Button
            variant="ghost"
            onClick={form.addMoreLink}
            disabled={isAtCeiling}
          >
            <FiPlus aria-hidden /> {t(`${KEY}.addCta`)}
          </Button>
          {isAtCeiling && (
            <span className={sellingStyles.hint}>
              {t(`${KEY}.ceilingHint`, { count: MAX_ONLINE_MORE_LINKS })}
            </span>
          )}
        </div>
      </>
    </FormField>
  );
}
