import { FiCheck } from "react-icons/fi";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { MarkdownLite } from "../../../shared/markdown";
import {
  DAYS,
  formatDayHours,
  goodForLabel,
  initials,
  langLabel,
  type ListingDraft,
} from "./listBusiness.data";
import { listingTagLabel } from "./listingTags.data";
import { isSellingOnline, onlineDetailsForPayload } from "./listingOnline.data";
import { effectivePricingMode, shopItemsForPayload } from "./listingShop.data";
import { DirectoryOrderingBody } from "../DirectoryOrderingBody";
import { hasOrderingContent } from "../directoryOrdering.data";
import styles from "./ListBusinessPage.module.css";

/**
 * The stacked detail sections of the full-page listing preview: description,
 * good-for, good-to-know, hours (a place only), ordering and delivery (when it
 * sells online), the shop (when that is the priced list), find-it, and
 * who-runs-it. Split out of `ListBusinessFullPreview` so each component stays
 * under the line limit. The online block and the shop are cleaned the way a
 * save sends them, so the preview never shows a hidden sub-answer.
 */
export function ListBusinessPreviewDetails({
  draft,
  userName,
}: {
  draft: ListingDraft;
  userName: string;
}) {
  const { t } = useTranslation();
  const description = draft.whatItIs
    .map((paragraph) => paragraph.text)
    .filter((text) => text.trim())
    .join("\n\n");
  const openDays = DAYS.filter((day) => draft.hours[day.id]?.open);
  const shopItems = shopItemsForPayload(draft.shopItems ?? [], {
    shouldDropIncomplete: true,
  });
  const orderingDetails = isSellingOnline(draft)
    ? onlineDetailsForPayload(draft.onlineDetails, draft)
    : null;
  const showName = draft.visibility !== "anon" && draft.ownerName.trim();
  // An online-only listing has no address to show (`draftToDto` sends none).
  const address = draft.online ? "" : draft.address;
  const social = [
    draft.social.instagram &&
      t("marketing:listBusiness.fullPreview.instagramPrefix", {
        handle: draft.social.instagram,
      }),
    draft.social.website,
    draft.social.email,
    draft.social.phone,
  ].filter(Boolean);

  return (
    <>
      {description && (
        <section className={styles.fpSec}>
          <h4>{t("marketing:listBusiness.fullPreview.whatItIs")}</h4>
          <div className={styles.pdDescription}>
            <MarkdownLite text={description} />
          </div>
        </section>
      )}

      {draft.goodFor.length > 0 && (
        <section className={styles.fpSec}>
          <h4>{t("marketing:listBusiness.fullPreview.goodFor")}</h4>
          <div className={styles.fpGoodFor}>
            {draft.goodFor.map((good) => (
              <span key={good} className={styles.fpGoodForRow}>
                <FiCheck size={13} /> {goodForLabel(t, good)}
              </span>
            ))}
          </div>
        </section>
      )}

      {(draft.langs.length > 0 || draft.tags.length > 0) && (
        <section className={styles.fpSec}>
          <h4>{t("marketing:listBusiness.fullPreview.goodToKnow")}</h4>
          <div className={styles.pdChips}>
            {draft.langs.map((language) => (
              <span key={`l-${language}`}>{langLabel(t, language)}</span>
            ))}
            {draft.tags.map((tag) => (
              <span key={`t-${tag}`}>{listingTagLabel(t, tag)}</span>
            ))}
          </div>
        </section>
      )}

      {!draft.online && openDays.length > 0 && (
        <section className={styles.fpSec}>
          <h4>{t("marketing:listBusiness.fullPreview.hours")}</h4>
          <div className={styles.fpHours}>
            {DAYS.map((day) => {
              const dayLabel = formatDayHours(draft.hours[day.id]);
              return (
                <div key={day.id} className={styles.fpHrow}>
                  <span>{t(day.labelKey)}</span>
                  <span>
                    {dayLabel ?? t("marketing:listBusiness.step3.closed")}
                  </span>
                </div>
              );
            })}
          </div>
          {draft.hoursNote && (
            <p className={styles.fpHoursNote}>{draft.hoursNote}</p>
          )}
        </section>
      )}

      {orderingDetails && hasOrderingContent(orderingDetails) && (
        <section className={styles.fpSec}>
          <h4>{t("marketing:listBusiness.fullPreview.ordering")}</h4>
          <DirectoryOrderingBody details={orderingDetails} />
        </section>
      )}

      {effectivePricingMode(draft) === "shop" && shopItems.length > 0 && (
        <section className={styles.fpSec}>
          <h4>{t("marketing:listBusiness.fullPreview.shop")}</h4>
          <div className={styles.pdChips}>
            {shopItems.map((item) => (
              <span key={item.id}>
                {[item.name, item.price].filter(Boolean).join(" · ")}
              </span>
            ))}
          </div>
        </section>
      )}

      {(address || social.length > 0) && (
        <section className={styles.fpSec}>
          <h4>{t("marketing:listBusiness.fullPreview.findIt")}</h4>
          {address && <p className={styles.fpAddr}>{address}</p>}
          {social.length > 0 && (
            <div className={styles.pdChips}>
              {social.map((entry) => (
                <span key={entry}>{entry}</span>
              ))}
            </div>
          )}
        </section>
      )}

      {showName && (
        <section className={styles.fpSec}>
          <h4>{t("marketing:listBusiness.fullPreview.whoRunsIt")}</h4>
          <div className={styles.pdOwner}>
            <span className={styles.pdOwnerAv}>
              {initials(draft.ownerName)}
            </span>
            <div>
              <div className={styles.pdOwnerName}>
                {draft.visibility === "role"
                  ? draft.ownerRole
                  : draft.ownerName}
                {draft.linkToProfile ? ` · ${userName}` : ""}
              </div>
              <div className={styles.pdOwnerRole}>
                {draft.visibility === "role"
                  ? t("marketing:listBusiness.preview.roleShown")
                  : draft.ownerRole}
              </div>
            </div>
          </div>
          {draft.ownerBio && <p className={styles.fpBio}>{draft.ownerBio}</p>}
        </section>
      )}
    </>
  );
}
