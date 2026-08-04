import { useState } from "react";
import { FiArrowRight, FiCheck } from "react-icons/fi";
import { Button, Reveal } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { Barter } from "./barter.data";
import styles from "./BarterPage.module.css";

/** Post-a-swap strip: a short offer/want form that prepends a live post, with an animated success state. */
export function BarterPostStrip({
  onPost,
}: {
  onPost: (barter: Barter) => void;
}) {
  const { t } = useTranslation();
  const [offerText, setOfferText] = useState("");
  const [wantText, setWantText] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const canPost = offerText.trim().length > 0 && wantText.trim().length > 0;

  const postSwap = () => {
    if (!canPost) return;
    const offer = offerText.trim();
    const want = wantText.trim();
    const detail = t("economy:barter.postStrip.detailPlaceholder");
    onPost({
      id: `posted-${Date.now()}`,
      name: t("economy:barter.postStrip.namePlaceholder"),
      initials: "Y",
      tint: "coral",
      hood: t("economy:barter.postStrip.hoodPlaceholder"),
      category: "all",
      mode: "both",
      offer,
      want,
      offerDetail: detail,
      wantDetail: detail,
      tags: [
        t("economy:barter.postStrip.tagNew"),
        t("economy:barter.postStrip.tagYourPost"),
      ],
      days: 1,
    });
    setSubmitted(true);
  };

  const postAnother = () => {
    setOfferText("");
    setWantText("");
    setSubmitted(false);
  };

  return (
    <Reveal className={styles.postStrip}>
      {submitted ? (
        <div className={`${styles.psSuccess} ${styles.screenIn}`} key="success">
          <div className={styles.psSuccessIcon}>
            <FiCheck size={24} aria-hidden />
          </div>
          <h3>
            <Translation
              i18nKey="economy:barter.postStrip.success.title"
              components={{ em: <em /> }}
            />
          </h3>
          <p>{t("economy:barter.postStrip.success.body")}</p>
          <Button variant="ghost-dark" onClick={postAnother}>
            {t("economy:barter.postStrip.success.postAnother")}{" "}
            <FiArrowRight aria-hidden />
          </Button>
        </div>
      ) : (
        <>
          <div>
            <h3>
              <Translation
                i18nKey="economy:barter.postStrip.title"
                components={{ em: <em /> }}
              />
            </h3>
            <p>{t("economy:barter.postStrip.body")}</p>
          </div>
          <form
            className={styles.psForm}
            onSubmit={(e) => {
              e.preventDefault();
              postSwap();
            }}
          >
            <input
              className={styles.psInput}
              aria-label={t("economy:barter.postStrip.offerPlaceholder")}
              placeholder={t("economy:barter.postStrip.offerPlaceholder")}
              value={offerText}
              onChange={(e) => setOfferText(e.target.value)}
            />
            <input
              className={styles.psInput}
              aria-label={t("economy:barter.postStrip.wantPlaceholder")}
              placeholder={t("economy:barter.postStrip.wantPlaceholder")}
              value={wantText}
              onChange={(e) => setWantText(e.target.value)}
            />
            <Button type="submit" disabled={!canPost}>
              {t("economy:barter.postStrip.submitCta")}{" "}
              <FiArrowRight aria-hidden />
            </Button>
          </form>
        </>
      )}
    </Reveal>
  );
}
