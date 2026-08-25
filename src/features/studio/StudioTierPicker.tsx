import { useState } from "react";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import {
  COOP_TIER_PRICE,
  STUDIO_SHARE_PERCENT,
  STUDIO_TIER_PRICE,
  type StudioTier,
} from "./studioSignIn.data";
import styles from "./StudioSignInPage.module.css";

/**
 * Paid-tier chooser for the Studio "Join" flow — self-contained: owns its own
 * selected-tier state. The selection is purely presentational for now (the
 * submit navigates to checkout regardless of the highlighted tier).
 */
export function StudioTierPicker() {
  const { t } = useTranslation();
  const format = useFormat();
  const [selectedTier, setSelectedTier] = useState<StudioTier>("studio");

  return (
    <>
      <div className={styles.tierLbl} style={{ marginTop: 22 }}>
        {t("studio:signin.join.chooseTier")}
      </div>

      {/* eslint-disable-next-line jsx-a11y/control-has-associated-label -- role="button" card is named by its visible <h4> tier title (rendered via <Translation>) and body, which the rule's child-depth limit can't see through. */}
      <div
        className={[styles.tier, selectedTier === "studio" ? styles.tierOn : ""]
          .filter(Boolean)
          .join(" ")}
        role="button"
        tabIndex={0}
        onClick={() => setSelectedTier("studio")}
        onKeyDown={(keyEvent) => {
          if (keyEvent.key === "Enter" || keyEvent.key === " ") {
            keyEvent.preventDefault();
            setSelectedTier("studio");
          }
        }}
      >
        <div className={styles.tierDot} />
        <div className={styles.tierInfo}>
          <div className={styles.tierTop}>
            <h4>
              <Translation
                i18nKey="studio:signin.join.tier.studio.title"
                components={{ em: <em /> }}
              />
            </h4>
            <div className={styles.tierPrice}>
              €<em>{STUDIO_TIER_PRICE}</em>
              <b>{t("studio:signin.perMonth")}</b>
            </div>
          </div>
          <p>{t("studio:signin.join.tier.studio.body")}</p>
          <div className={styles.tierIncl}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.4}
            >
              <path d="M20 6L9 17l-5-5" />
            </svg>
            {t("studio:signin.join.tier.studio.incl", {
              sharePercent: format.number(STUDIO_SHARE_PERCENT, {
                style: "percent",
              }),
            })}
          </div>
        </div>
      </div>

      {}
      <div
        className={[styles.tier, selectedTier === "coop" ? styles.tierOn : ""]
          .filter(Boolean)
          .join(" ")}
        style={{ position: "relative" }}
        role="button"
        tabIndex={0}
        onClick={() => setSelectedTier("coop")}
        onKeyDown={(keyEvent) => {
          if (keyEvent.key === "Enter" || keyEvent.key === " ") {
            keyEvent.preventDefault();
            setSelectedTier("coop");
          }
        }}
      >
        <div className={styles.tierDot} />
        <div className={styles.tierRec}>
          {t("studio:signin.join.tier.coop.badge")}
        </div>
        <div className={styles.tierInfo}>
          <div className={styles.tierTop}>
            <h4>
              <Translation
                i18nKey="studio:signin.join.tier.coop.title"
                components={{ em: <em /> }}
              />
            </h4>
            <div className={styles.tierPrice}>
              €<em>{COOP_TIER_PRICE}</em>
              <b>{t("studio:signin.perMonth")}</b>
            </div>
          </div>
          <p>
            <Translation
              i18nKey="studio:signin.join.tier.coop.body"
              components={{ em: <em /> }}
            />
          </p>
          <div className={styles.tierIncl}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.4}
            >
              <path d="M20 6L9 17l-5-5" />
            </svg>
            {t("studio:signin.join.tier.coop.incl")}
          </div>
        </div>
      </div>
    </>
  );
}
