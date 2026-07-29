import { FiCheck } from "react-icons/fi";
import { ImageSlot, Modal } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  catLabel,
  DAYS,
  goodForLabel,
  initials,
  langLabel,
  PRICES,
  type ListingDraft,
} from "./listBusiness.data";
import styles from "./ListBusinessPage.module.css";

/** Full-page preview of the listing as it will appear once live. */
export function ListBusinessFullPreview({
  draft,
  userName,
  onClose,
}: {
  draft: ListingDraft;
  userName: string;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const price = PRICES.find((p) => p.id === draft.price);
  const wit = draft.whatItIs.filter((w) => w.text.trim());
  const openDays = DAYS.filter((d) => draft.hours[d.id]?.open);
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
    <Modal
      wide
      eyebrow={t("marketing:listBusiness.fullPreview.eyebrow")}
      title={draft.name || t("marketing:listBusiness.preview.placeholderName")}
      sub={t("marketing:listBusiness.fullPreview.sub")}
      onClose={onClose}
    >
      <div className={styles.fp}>
        <div className={styles.fpHeadRow}>
          <span className={styles.dirAv}>
            {draft.name ? initials(draft.name) : "+"}
          </span>
          <div>
            <div className={styles.fpMeta}>
              {[
                draft.cats.map((c) => catLabel(t, c)).join(", "),
                draft.hood,
                price ? t(price.labelKey) : "",
              ]
                .filter(Boolean)
                .join(" · ") ||
                t("marketing:listBusiness.preview.placeholderMeta")}
            </div>
            <div className={styles.dirBadgeRow}>
              {draft.badge === "owned" && (
                <span className={`${styles.dirBadge} ${styles.dirBadgeJade}`}>
                  {t("marketing:listBusiness.step1.owned.tag")}
                </span>
              )}
              {draft.badge === "friendly" && (
                <span className={`${styles.dirBadge} ${styles.dirBadgeCoral}`}>
                  {t("marketing:listBusiness.step1.friendly.tag")}
                </span>
              )}
              {price && (
                <span className={`${styles.dirBadge} ${styles.dirBadgePrice}`}>
                  {price.sym}
                </span>
              )}
            </div>
          </div>
        </div>

        {draft.tagline && <p className={styles.fpTagline}>{draft.tagline}</p>}

        <div className={styles.fpGallery}>
          <ImageSlot
            className={styles.fpGalWide}
            tint="coral"
            radius={16}
            height={200}
            placeholder={t("marketing:listBusiness.step4.gallery.wide")}
            alt={draft.alt.wide}
          />
          <ImageSlot
            tint="jade"
            radius={16}
            height={120}
            placeholder={t("marketing:listBusiness.step4.gallery.detail")}
            alt={draft.alt.d1}
          />
          <ImageSlot
            tint="plum"
            radius={16}
            height={120}
            placeholder={t("marketing:listBusiness.step4.gallery.detail")}
            alt={draft.alt.d2}
          />
          <ImageSlot
            tint="coral"
            radius={16}
            height={120}
            placeholder={t("marketing:listBusiness.step4.gallery.vibe")}
            alt={draft.alt.vibe}
          />
        </div>

        {draft.blurb && <p className={styles.fpBlurb}>{draft.blurb}</p>}

        {wit.length > 0 && (
          <section className={styles.fpSec}>
            <h4>{t("marketing:listBusiness.fullPreview.whatItIs")}</h4>
            <ul className={styles.pdWit}>
              {wit.map((w) => (
                <li key={w.id}>{w.text}</li>
              ))}
            </ul>
          </section>
        )}

        {draft.goodFor.length > 0 && (
          <section className={styles.fpSec}>
            <h4>{t("marketing:listBusiness.fullPreview.goodFor")}</h4>
            <div className={styles.fpGoodFor}>
              {draft.goodFor.map((g) => (
                <span key={g} className={styles.fpGoodForRow}>
                  <FiCheck size={13} /> {goodForLabel(t, g)}
                </span>
              ))}
            </div>
          </section>
        )}

        {(draft.langs.length > 0 || draft.tags.length > 0) && (
          <section className={styles.fpSec}>
            <h4>{t("marketing:listBusiness.fullPreview.goodToKnow")}</h4>
            <div className={styles.pdChips}>
              {draft.langs.map((l) => (
                <span key={`l-${l}`}>{langLabel(t, l)}</span>
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
              {DAYS.map((d) => {
                const h = draft.hours[d.id]!;
                return (
                  <div key={d.id} className={styles.fpHrow}>
                    <span>{t(d.labelKey)}</span>
                    <span>
                      {h.open
                        ? `${h.from}–${h.to}`
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
                {social.map((s) => (
                  <span key={s}>{s}</span>
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
      </div>
    </Modal>
  );
}
