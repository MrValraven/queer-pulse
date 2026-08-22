import { useState } from "react";
import { FiArrowRight, FiCheck } from "react-icons/fi";
import { ApiError } from "../../shared/api/client";
import { Button, Reveal, Select, Sending } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { CATS, type Barter } from "./barter.data";
import type { BarterCategoryKey } from "./api/barter.api";
import { useCreateBarterListing } from "./api/useBarter";
import styles from "./BarterPage.module.css";

/** The board's real categories: the leading `"all"` chip is a filter, never
 *  something a listing can be posted under. */
const POSTABLE_CATEGORIES = CATS.filter((category) => category.value !== "all");

/** Post-a-swap strip: a short offer/want form that puts a listing on the board,
 *  with an animated success state. Demo prepends a local card through `onPost`;
 *  live creates the listing and lets the board refetch. */
export function BarterPostStrip({
  onPost,
}: {
  onPost: (barter: Barter) => void;
}) {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const [offerText, setOfferText] = useState("");
  const [wantText, setWantText] = useState("");
  const [category, setCategory] = useState<string | null>(
    POSTABLE_CATEGORIES[0]?.value ?? null,
  );
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const createListing = useCreateBarterListing();

  const canPost =
    offerText.trim().length > 0 &&
    wantText.trim().length > 0 &&
    Boolean(category);

  const postSwap = async () => {
    if (!canPost || !category || createListing.isPending) return;
    const offer = offerText.trim();
    const want = wantText.trim();
    setErrorMessage(null);

    if (demoMode) {
      const detail = t("economy:barter.postStrip.detailPlaceholder");
      onPost({
        id: `posted-${Date.now()}`,
        name: t("economy:barter.postStrip.namePlaceholder"),
        initials: "Y",
        tint: "coral",
        hood: t("economy:barter.postStrip.hoodPlaceholder"),
        category,
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
      return;
    }

    try {
      await createListing.mutateAsync({
        category: category as BarterCategoryKey,
        mode: "both",
        offer,
        want,
      });
      // Confirmation comes from the resolved mutation, never from the click.
      setSubmitted(true);
    } catch (error) {
      setErrorMessage(
        error instanceof ApiError && error.status === 400
          ? t("economy:barter.postStrip.errorInvalid")
          : t("economy:barter.postStrip.errorFailed"),
      );
    }
  };

  const postAnother = () => {
    setOfferText("");
    setWantText("");
    setErrorMessage(null);
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
            {errorMessage && (
              <p className={styles.psError} role="alert">
                {errorMessage}
              </p>
            )}
          </div>
          <form
            className={styles.psForm}
            onSubmit={(e) => {
              e.preventDefault();
              void postSwap();
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
            <Select
              className={styles.psSelect}
              size="sm"
              label={t("economy:barter.postStrip.categoryLabel")}
              placeholder={t("economy:barter.postStrip.categoryPlaceholder")}
              options={POSTABLE_CATEGORIES.map((option) => ({
                value: option.value,
                label: t(option.labelKey),
              }))}
              value={category}
              onChange={setCategory}
            />
            <Button
              type="submit"
              disabled={!canPost || createListing.isPending}
            >
              {createListing.isPending ? (
                <Sending label={t("economy:barter.postStrip.submitting")} />
              ) : (
                <>
                  {t("economy:barter.postStrip.submitCta")}{" "}
                  <FiArrowRight aria-hidden />
                </>
              )}
            </Button>
          </form>
        </>
      )}
    </Reveal>
  );
}
