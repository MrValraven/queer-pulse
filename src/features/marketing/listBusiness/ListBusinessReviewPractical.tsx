import { type ReactNode } from "react";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { TFunction } from "../../../shared/i18n/types";
import { websiteLabel } from "../directoryPlaces";
import { DAYS, type ListingDraft } from "./listBusiness.data";
import {
  FULFILMENT_LABEL_KEYS,
  isSellingOnline,
  isShippingPicked,
  MAIN_LINK_KIND_LABEL_KEYS,
  ONLINE_LINK_PLATFORM_DEFINITIONS,
  onlineDetailsForPayload,
  PAYMENT_LABEL_KEYS,
  REGISTRATION_BODY_LABEL_KEYS,
  REGISTRATION_DETAIL_KEYS,
  SESSION_FORMAT_LABEL_KEYS,
  SHIPS_FROM_LABEL_KEYS,
  shouldAskRegistration,
  type ListingPublicOnlineDetails,
  type OnlineMainLink,
} from "./listingOnline.data";
import styles from "./ListBusinessPage.module.css";
import sellingStyles from "./fields/OnlineSelling.module.css";

function hoursSummary(draft: ListingDraft): string {
  const open = DAYS.filter((d) => draft.hours[d.id]?.open);
  if (!open.length) return "";
  // Day ids are the stable three-letter English keys; the summary is a
  // compact glance, so it reuses them in place of the long localized names.
  return open.map((d) => d.id).join(", ");
}

function onlineSummary(t: TFunction, draft: ListingDraft): string {
  const bits: string[] = [];
  if (draft.social.instagram)
    bits.push(t("marketing:listBusiness.step5.online.instagram"));
  if (draft.social.website)
    bits.push(t("marketing:listBusiness.step5.online.website"));
  if (draft.social.email)
    bits.push(t("marketing:listBusiness.step5.online.email"));
  if (draft.social.phone)
    bits.push(t("marketing:listBusiness.step5.online.phone"));
  return bits.join(" · ");
}

/** One recap line: a label and its value, or "Not added" while empty. */
export function Row({
  k,
  children,
  quote,
  isMultiline,
}: {
  k: string;
  children: ReactNode;
  quote?: boolean;
  /** Keeps the value's line breaks as the owner typed them. */
  isMultiline?: boolean;
}) {
  const { t } = useTranslation();
  const empty = children === "" || children === null || children === undefined;
  return (
    <div className={styles.recapRow}>
      <span className={styles.rk}>{k}</span>
      <span
        className={[
          styles.rv,
          quote && styles.rvQuote,
          isMultiline && styles.rvMultiline,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {empty ? (
          <span className={styles.rvMiss}>
            {t("marketing:listBusiness.step5.notAdded")}
          </span>
        ) : (
          children
        )}
      </span>
    </div>
  );
}

/** A titled recap group whose edit link jumps back to its step. */
export function Group({
  title,
  onEdit,
  children,
}: {
  title: string;
  onEdit: () => void;
  children: ReactNode;
}) {
  const { t } = useTranslation();
  return (
    <div className={styles.recapGroup}>
      <div className={styles.recapHead}>
        <span>{title}</span>
        <button type="button" className={styles.recapEdit} onClick={onEdit}>
          {t("marketing:listBusiness.step5.editCta")}
        </button>
      </div>
      {children}
    </div>
  );
}

/** A link as the owner typed it, minus the scheme and "www.", so the review
 *  shows the shop path they need to check ("etsy.com/shop/name"). */
function linkLabel(raw: string): string {
  return raw
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/^www\./i, "")
    .replace(/\/$/, "");
}

/** "Shop · yourshop.pt/booking", or "" while there is no main link. */
function mainLinkSummary(t: TFunction, mainLink: OnlineMainLink | null) {
  if (!mainLink) return "";
  return `${t(MAIN_LINK_KIND_LABEL_KEYS[mainLink.kind])} · ${linkLabel(mainLink.url)}`;
}

/** The registration as the page states it, or "" when none was given. */
function registrationSummary(
  t: TFunction,
  registration: ListingPublicOnlineDetails["registration"],
) {
  const { body, number } = registration;
  if (body === "") return "";
  return number === ""
    ? t(REGISTRATION_BODY_LABEL_KEYS[body])
    : t(REGISTRATION_DETAIL_KEYS[body], { number });
}

/** Where it ships from, then under it, as a quieter note, the VAT sentence
 *  the page shows for a shop outside the EU. */
function shipsFromSummary(
  t: TFunction,
  details: ListingPublicOnlineDetails,
): ReactNode {
  if (details.shipsFrom === "") return "";
  const shipsFrom = t(SHIPS_FROM_LABEL_KEYS[details.shipsFrom]);
  if (details.shipsFrom !== "outsideEu") return shipsFrom;
  const vatKey = details.isVatIncluded
    ? "marketing:directory.detail.ordering.vatIncluded"
    : "marketing:directory.detail.ordering.vatExtra";
  return (
    <>
      {shipsFrom}
      <span className={sellingStyles.recapNote}>{t(vatKey)}</span>
    </>
  );
}

/** "How people buy from you", as the save would send it. More links read
 *  "Platform · hostname", the preview's form, so a long shop path never
 *  breaks mid-word in the narrow value column. A place shows its
 *  main link in the "Also sells online" row above these, so it is left out
 *  here for a place. Ships from, pick-up and registration show only where
 *  the form asked for them. */
function OnlineSellingRows({ draft }: { draft: ListingDraft }) {
  const { t } = useTranslation();
  const details = onlineDetailsForPayload(draft.onlineDetails, draft);
  return (
    <>
      {draft.online && (
        <Row k={t("marketing:listBusiness.step5.row.mainLink")}>
          {mainLinkSummary(t, details.mainLink)}
        </Row>
      )}
      <Row k={t("marketing:listBusiness.online.moreLinks.label")} isMultiline>
        {details.moreLinks
          .map(
            (link) =>
              `${t(ONLINE_LINK_PLATFORM_DEFINITIONS[link.platform].labelKey)} · ${websiteLabel(link.url)}`,
          )
          .join("\n")}
      </Row>
      <Row k={t("marketing:listBusiness.step5.row.howGet")}>
        {details.fulfilment
          .map((option) => t(FULFILMENT_LABEL_KEYS[option]))
          .join(", ")}
      </Row>
      {isShippingPicked(details.fulfilment) && (
        <Row k={t("marketing:listBusiness.online.shipsFrom.label")}>
          {shipsFromSummary(t, details)}
        </Row>
      )}
      {draft.online && details.fulfilment.includes("pickupLisbon") && (
        <Row k={t("marketing:listBusiness.online.pickupNote.label")}>
          {details.pickupNote}
        </Row>
      )}
      <Row k={t("marketing:listBusiness.step5.row.payments")}>
        {details.payments
          .map((method) => t(PAYMENT_LABEL_KEYS[method]))
          .join(", ")}
      </Row>
      {details.sessionFormats.length > 0 && (
        <Row k={t("marketing:listBusiness.step5.row.sessions")}>
          {details.sessionFormats
            .map((format) => t(SESSION_FORMAT_LABEL_KEYS[format]))
            .join(", ")}
        </Row>
      )}
      {shouldAskRegistration(draft.cats) && (
        <Row k={t("marketing:listBusiness.online.registration.label")}>
          {registrationSummary(t, details.registration)}
        </Row>
      )}
      <Row k={t("marketing:listBusiness.step5.row.replyNote")}>
        {details.replyNote}
      </Row>
    </>
  );
}

/** Recaps the practical step: where and when for a place, how people buy
 *  for anything that sells online, then the contact links. */
export function ReviewPracticalGroup({
  draft,
  onEdit,
}: {
  draft: ListingDraft;
  onEdit: () => void;
}) {
  const { t } = useTranslation();
  const mainLink = onlineDetailsForPayload(draft.onlineDetails, draft).mainLink;
  return (
    <Group
      title={t("marketing:listBusiness.step5.group.practical")}
      onEdit={onEdit}
    >
      {!draft.online && (
        <>
          <Row k={t("marketing:listBusiness.step5.row.address")}>
            {draft.address}
          </Row>
          <Row k={t("marketing:listBusiness.step5.row.hours")}>
            {hoursSummary(draft)}
          </Row>
          {draft.hasOnlineShop === true && (
            <Row k={t("marketing:listBusiness.step5.row.alsoOnline")}>
              {mainLinkSummary(t, mainLink)}
            </Row>
          )}
        </>
      )}
      {isSellingOnline(draft) && <OnlineSellingRows draft={draft} />}
      <Row k={t("marketing:listBusiness.step5.row.online")}>
        {onlineSummary(t, draft)}
      </Row>
    </Group>
  );
}
