import { FiInfo } from "react-icons/fi";
import type { TFunction } from "../../../../shared/i18n/types";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { websiteLabel } from "../../directoryPlaces";
import type { ListingDraft } from "../listBusiness.data";
import {
  FULFILMENT_LABEL_KEYS,
  isSellingOnline,
  MAIN_LINK_KIND_LABEL_KEYS,
  ONLINE_LINK_PLATFORM_DEFINITIONS,
  onlineDetailsForPayload,
  PAYMENT_LABEL_KEYS,
  REGISTRATION_BODY_LABEL_KEYS,
  REGISTRATION_DETAIL_KEYS,
  SESSION_FORMAT_LABEL_KEYS,
  SHIPS_FROM_DETAIL_KEYS,
  type ListingPublicOnlineDetails,
} from "../listingOnline.data";
import { ExcerptSection } from "./ListingLivePreviewSection";
import previewStyles from "./ListingLivePreview.module.css";

const ORDERING_KEY = "marketing:directory.detail.ordering";

interface OrderingPreviewLine {
  id: string;
  /** The detail page's label for the fact; none for a line that continues
   *  the one above it (the VAT sentence under "Shipping"). */
  label?: string;
  text: string;
  /** A quieter note led by the info icon, as the detail page draws it. */
  isNote?: boolean;
}

/** The VAT sentence the page shows under "ships from outside the EU". */
function vatSentence(details: ListingPublicOnlineDetails, t: TFunction) {
  if (details.shipsFrom !== "outsideEu") return "";
  return t(
    details.isVatIncluded
      ? `${ORDERING_KEY}.vatIncluded`
      : `${ORDERING_KEY}.vatExtra`,
  );
}

/** Every answer the block can hold, one labelled line each, in page order
 *  and as the save would send them, under the detail page's own labels.
 *  Keyed by what each line holds, so two lines reading alike never clash.
 *  Empty answers are left out. */
function orderingPreviewLines(
  details: ListingPublicOnlineDetails,
  t: TFunction,
): OrderingPreviewLine[] {
  const listOf = (labels: string[]) => labels.join(", ");
  const { body, number } = details.registration;
  const registration =
    body === ""
      ? ""
      : number.trim() === ""
        ? t(REGISTRATION_BODY_LABEL_KEYS[body])
        : t(REGISTRATION_DETAIL_KEYS[body], { number: number.trim() });
  // The page's sessions variant: formats picked and nothing to send.
  const isSessionsOnly =
    details.sessionFormats.length > 0 && details.fulfilment.length === 0;
  const lines: OrderingPreviewLine[] = [
    {
      id: "mainLink",
      label: details.mainLink
        ? t(MAIN_LINK_KIND_LABEL_KEYS[details.mainLink.kind])
        : undefined,
      text: details.mainLink ? websiteLabel(details.mainLink.url) : "",
    },
    {
      id: "moreLinks",
      label: t(`${ORDERING_KEY}.alsoOn`),
      text: listOf(
        details.moreLinks.map(
          (link) =>
            `${t(ONLINE_LINK_PLATFORM_DEFINITIONS[link.platform].labelKey)} · ${websiteLabel(link.url)}`,
        ),
      ),
    },
    {
      id: "fulfilment",
      label: t(`${ORDERING_KEY}.howGet`),
      text: listOf(
        details.fulfilment.map((option) => t(FULFILMENT_LABEL_KEYS[option])),
      ),
    },
    {
      id: "shipsFrom",
      label: t(`${ORDERING_KEY}.shipping`),
      text:
        details.shipsFrom === ""
          ? ""
          : t(SHIPS_FROM_DETAIL_KEYS[details.shipsFrom]),
    },
    { id: "vat", text: vatSentence(details, t), isNote: true },
    {
      id: "pickupNote",
      label: t(`${ORDERING_KEY}.pickup`),
      text: details.pickupNote,
    },
    {
      id: "payments",
      label: t(`${ORDERING_KEY}.payments`),
      text: listOf(
        details.payments.map((method) => t(PAYMENT_LABEL_KEYS[method])),
      ),
    },
    {
      id: "sessionFormats",
      label: t(`${ORDERING_KEY}.sessions`),
      text: listOf(
        details.sessionFormats.map((format) =>
          t(SESSION_FORMAT_LABEL_KEYS[format]),
        ),
      ),
    },
    {
      id: "registration",
      label: t(`${ORDERING_KEY}.registrationLabel`),
      text: registration,
    },
    {
      id: "replyNote",
      label: t(
        isSessionsOnly
          ? `${ORDERING_KEY}.replyNoteSessions`
          : `${ORDERING_KEY}.replyNote`,
      ),
      text: details.replyNote,
    },
  ];
  return lines.filter((line) => line.text !== "");
}

/** The excerpt's "Ordering & delivery" block for a listing that sells
 *  online: every answer of "How people buy from you", as the save would send
 *  them, so a filled field never leaves the placeholder showing. Nothing for
 *  a place that sells nothing online, as its page has no such block. */
export function ListingLivePreviewOrdering({
  draft,
  isHighlighted,
}: {
  draft: ListingDraft;
  isHighlighted: boolean;
}) {
  const { t } = useTranslation();
  if (!isSellingOnline(draft)) return null;
  const lines = orderingPreviewLines(
    onlineDetailsForPayload(draft.onlineDetails, draft),
    t,
  );
  return (
    <ExcerptSection
      region="ordering"
      title={t("marketing:listBusiness.preview.ordering")}
      isHighlighted={isHighlighted}
      placeholder={t("marketing:listBusiness.livePreview.placeholder.ordering")}
    >
      {lines.length > 0 ? (
        <ul className={previewStyles.orderingLines}>
          {lines.map((line) =>
            line.isNote ? (
              <li key={line.id} className={previewStyles.orderingNote}>
                <FiInfo aria-hidden />
                <span>{line.text}</span>
              </li>
            ) : (
              <li key={line.id}>
                {line.label && (
                  <span className={previewStyles.orderingLabel}>
                    {line.label}:{" "}
                  </span>
                )}
                {line.text}
              </li>
            ),
          )}
        </ul>
      ) : null}
    </ExcerptSection>
  );
}
