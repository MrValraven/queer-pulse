import { FiCheck } from "react-icons/fi";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  DAYS,
  goodForLabel,
  initials,
  langLabel,
  type ListingDraft,
} from "./listBusiness.data";
import styles from "./ListBusinessPage.module.css";

/**
 * The stacked detail sections of the full-page listing preview: what-it-is,
 * good-for, good-to-know, hours, find-it, and who-runs-it. Split out of
 * `ListBusinessFullPreview` so each component stays under the line limit.
 */
export function ListBusinessPreviewDetails({
  draft,
  userName,
}: {
  draft: ListingDraft;
  userName: string;
}) {
  const { t } = useTranslation();
  const whatItIsItems = draft.whatItIs.filter((item) => item.text.trim());
  const openDays = DAYS.filter((day) => draft.hours[day.id]?.open);
  const showName = draft.visibility !== "anon" && draft.ownerName.trim();
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
      {whatItIsItems.length > 0 && (
        <section className={styles.fpSec}>
          <h4>{t("marketing:listBusiness.fullPreview.whatItIs")}</h4>
          <ul className={styles.pdWit}>
            {whatItIsItems.map((item) => (
              <li key={item.id}>{item.text}</li>
            ))}
          </ul>
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
              <span key={`t-${tag}`}>{tag}</span>
            ))}
          </div>
        </section>
      )}

      {openDays.length > 0 && (
        <section className={styles.fpSec}>
          <h4>{t("marketing:listBusiness.fullPreview.hours")}</h4>
          <div className={styles.fpHours}>
            {DAYS.map((day) => {
              const hours = draft.hours[day.id]!;
              return (
                <div key={day.id} className={styles.fpHrow}>
                  <span>{t(day.labelKey)}</span>
                  <span>
                    {hours.open
                      ? `${hours.from}–${hours.to}`
                      : t("marketing:listBusiness.step3.closed")}
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

      {(draft.address || social.length > 0) && (
        <section className={styles.fpSec}>
          <h4>{t("marketing:listBusiness.fullPreview.findIt")}</h4>
          {draft.address && <p className={styles.fpAddr}>{draft.address}</p>}
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
            <span className={styles.pdOwnerAv}>{initials(draft.ownerName)}</span>
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
