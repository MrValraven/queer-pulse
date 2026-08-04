import { useState } from "react";
import { Button } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  catLabel,
  DAYS,
  formatDayHours,
  goodForLabel,
  initials,
  langLabel,
  PRICES,
  type ListingDraft,
  type PhotoKey,
} from "./listBusiness.data";
import { ListBusinessFullPreview } from "./ListBusinessFullPreview";
import styles from "./ListBusinessPage.module.css";

function hoursLine(draft: ListingDraft): string | null {
  const open = DAYS.filter((d) => draft.hours[d.id]?.open);
  const first = open[0];
  if (!first) return null;
  const sample = formatDayHours(draft.hours[first.id]);
  return `${open.map((d) => d.id).join(", ")} · ${sample ?? ""}`;
}

/** Sticky directory-card + detail-page preview that mirrors the live form. */
export function ListBusinessPreview({
  draft,
  userName,
  photoPreviews,
}: {
  draft: ListingDraft;
  userName: string;
  photoPreviews: Record<PhotoKey, string>;
}) {
  const { t } = useTranslation();
  const [showFull, setShowFull] = useState(false);
  const hasCard = draft.name.trim().length > 0;
  const price = PRICES.find((p) => p.id === draft.price);
  const wit = draft.whatItIs.filter((w) => w.text.trim());
  const hrs = hoursLine(draft);
  const showOwner = draft.visibility !== "anon" && draft.ownerName.trim();

  return (
    <aside className={styles.previewCol}>
      <div className={styles.pvHead}>
        <span className={styles.dot} />
        {t("marketing:listBusiness.preview.head")}
      </div>

      <div
        className={[styles.dirCard, !hasCard && styles.dirCardEmpty]
          .filter(Boolean)
          .join(" ")}
      >
        <div className={styles.dirTop}>
          <span
            className={[styles.dirAv, !hasCard && styles.dirAvEmpty]
              .filter(Boolean)
              .join(" ")}
          >
            {hasCard ? initials(draft.name) : "+"}
          </span>
          <div>
            <div className={styles.dirName}>
              {hasCard ? (
                draft.name
              ) : (
                <span className={styles.dirNamePh}>
                  {t("marketing:listBusiness.preview.placeholderName")}
                </span>
              )}
            </div>
            <div className={styles.dirMeta}>
              {draft.cats.length || draft.hood
                ? [draft.cats.map((c) => catLabel(t, c)).join(", "), draft.hood]
                    .filter(Boolean)
                    .join(" · ")
                : t("marketing:listBusiness.preview.placeholderMeta")}
            </div>
          </div>
        </div>

        {(draft.badge || price) && (
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
        )}

        <div
          className={[styles.dirBlurb, !draft.blurb && styles.dirBlurbPh]
            .filter(Boolean)
            .join(" ")}
        >
          {draft.blurb || t("marketing:listBusiness.preview.placeholderBlurb")}
        </div>

        {draft.tags.length > 0 && (
          <div className={styles.dirTags}>
            {draft.tags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
        )}
      </div>

      <div className={styles.pvDetail}>
        <div
          className={[styles.pdTagline, !draft.tagline && styles.pdTaglinePh]
            .filter(Boolean)
            .join(" ")}
        >
          {draft.tagline ||
            t("marketing:listBusiness.preview.placeholderTagline")}
        </div>

        {wit.length > 0 && (
          <div className={styles.pdSec}>
            <h5>{t("marketing:listBusiness.preview.whatItIs")}</h5>
            <ul className={styles.pdWit}>
              {wit.map((w) => (
                <li key={w.id}>{w.text}</li>
              ))}
            </ul>
          </div>
        )}

        {draft.goodFor.length > 0 && (
          <div className={styles.pdSec}>
            <h5>{t("marketing:listBusiness.preview.goodFor")}</h5>
            <div className={styles.pdChips}>
              {draft.goodFor.map((g) => (
                <span key={g}>{goodForLabel(t, g)}</span>
              ))}
            </div>
          </div>
        )}

        {draft.langs.length > 0 && (
          <div className={styles.pdSec}>
            <h5>{t("marketing:listBusiness.preview.languages")}</h5>
            <div className={styles.pdChips}>
              {draft.langs.map((l) => (
                <span key={l}>{langLabel(t, l)}</span>
              ))}
            </div>
          </div>
        )}

        {hrs && (
          <div className={styles.pdSec}>
            <h5>{t("marketing:listBusiness.preview.hours")}</h5>
            <div className={styles.dirMeta}>{hrs}</div>
          </div>
        )}

        {showOwner && (
          <div className={styles.pdOwner}>
            <span className={styles.pdOwnerAv}>
              {initials(draft.ownerName)}
            </span>
            <div>
              <div className={styles.pdOwnerName}>
                {draft.visibility === "role"
                  ? draft.ownerRole
                  : draft.ownerName}
              </div>
              <div className={styles.pdOwnerRole}>
                {draft.visibility === "role"
                  ? t("marketing:listBusiness.preview.roleShown")
                  : draft.ownerRole ||
                    t("marketing:listBusiness.preview.yourRole")}
                {draft.linkToProfile ? ` · ${userName}` : ""}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className={styles.previewFullBtn}>
        <Button
          variant="ghost"
          onClick={() => setShowFull(true)}
          disabled={!hasCard}
          title={
            !hasCard
              ? t("marketing:listBusiness.preview.fullDisabledTitle")
              : undefined
          }
        >
          {t("marketing:listBusiness.preview.fullCta")}
        </Button>
      </div>

      <div className={styles.pvFoot}>
        {t("marketing:listBusiness.preview.foot")}
      </div>

      {showFull && (
        <ListBusinessFullPreview
          draft={draft}
          userName={userName}
          photoPreviews={photoPreviews}
          onClose={() => setShowFull(false)}
        />
      )}
    </aside>
  );
}
