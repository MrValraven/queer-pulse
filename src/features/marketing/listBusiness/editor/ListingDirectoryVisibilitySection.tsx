import { useState } from "react";
import { FiCheck, FiEye, FiEyeOff, FiInfo } from "react-icons/fi";
import { Button } from "../../../../shared/components/ui";
import { useToast } from "../../../../shared/components/feedback/useToast";
import { useFormat } from "../../../../shared/i18n/format";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { relativeAgo } from "../../../../shared/lib/relativeAgo";
import type { ManagedListingDTO } from "../api/listings.api";
import { useSetDirectoryVisibility } from "../api/useListingOwnerState";
import { VISIBILITY_KEPT_KEYS } from "./listingVisibility.data";
import styles from "./ListingVisibility.module.css";

/**
 * "Is this listing showing in the directory?": the owner's pause switch.
 *
 * Kept deliberately apart from the trading controls directly above it, and
 * placed under them so the choice between the two is explicit:
 *
 * - Temporarily closed says THE BUSINESS is not trading right now. The listing
 *   stays in the directory and carries that message to anyone who finds it.
 * - Paused says THE LISTING is not showing. It leaves browse, search and map
 *   results entirely, and says nothing about whether the business is open.
 *
 * A pause keeps everything: reviews, photos, badges, history. Owners were
 * deleting listings to get this effect, and a delete takes the reviews with
 * it, so the copy leads with what is kept rather than with what stops.
 *
 * Applied immediately on press, like the trading controls beside it, so it is
 * never one of the fields the save bar is waiting on.
 */
export function ListingDirectoryVisibilitySection({
  listing,
}: {
  listing: ManagedListingDTO;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { showToast } = useToast();
  const setVisibility = useSetDirectoryVisibility(listing.ref);
  const [failure, setFailure] = useState<string | null>(null);

  const isHidden = listing.directoryVisibility?.isHiddenByOwner === true;
  const hiddenAt = listing.directoryVisibility?.hiddenAt ?? null;

  const toggle = () => {
    setFailure(null);
    setVisibility.mutate(
      { isHiddenByOwner: !isHidden },
      {
        onSuccess: () => {
          showToast(
            t(
              isHidden
                ? "marketing:listBusiness.visibility.saved.shown"
                : "marketing:listBusiness.visibility.saved.hidden",
            ),
            "success",
          );
        },
        onError: (error) => {
          setFailure(
            error.message || t("marketing:listBusiness.visibility.saveError"),
          );
        },
      },
    );
  };

  return (
    <div className={styles.block}>
      <h3 className={styles.heading}>
        {t("marketing:listBusiness.visibility.heading")}
      </h3>
      <p className={styles.intro}>
        {t("marketing:listBusiness.visibility.intro")}
      </p>

      <p className={styles.distinction}>
        <span className={styles.distinctionIcon} aria-hidden>
          <FiInfo />
        </span>
        <span>{t("marketing:listBusiness.visibility.distinction")}</span>
      </p>

      <div
        className={[styles.state, isHidden && styles.stateHidden]
          .filter(Boolean)
          .join(" ")}
      >
        <span className={styles.stateIcon} aria-hidden>
          {isHidden ? <FiEyeOff /> : <FiEye />}
        </span>
        <span className={styles.stateText}>
          <strong className={styles.stateTitle}>
            {t(
              isHidden
                ? "marketing:listBusiness.visibility.state.hidden.title"
                : "marketing:listBusiness.visibility.state.showing.title",
            )}
          </strong>
          <span className={styles.stateSub}>
            {t(
              isHidden
                ? "marketing:listBusiness.visibility.state.hidden.sub"
                : "marketing:listBusiness.visibility.state.showing.sub",
            )}
          </span>
          {isHidden && hiddenAt && (
            <span className={styles.stateSince}>
              {t("marketing:listBusiness.visibility.hiddenSince", {
                when: relativeAgo(hiddenAt, t, fmt, {
                  justNow: "marketing:listBusiness.trading.justNow",
                  unknown: "marketing:listBusiness.trading.unknownWhen",
                }),
              })}
            </span>
          )}
        </span>
      </div>

      <ul className={styles.keptList}>
        {VISIBILITY_KEPT_KEYS.map((keptKey) => (
          <li key={keptKey}>
            <span className={styles.keptIcon} aria-hidden>
              <FiCheck />
            </span>
            <span>{t(keptKey)}</span>
          </li>
        ))}
      </ul>

      {failure && (
        <p role="alert" className={styles.failure}>
          {failure}
        </p>
      )}

      <div className={styles.actionRow}>
        <Button
          variant={isHidden ? "primary" : "ghost"}
          onClick={toggle}
          disabled={setVisibility.isPending}
        >
          {setVisibility.isPending
            ? t("marketing:listBusiness.visibility.applying")
            : t(
                isHidden
                  ? "marketing:listBusiness.visibility.showCta"
                  : "marketing:listBusiness.visibility.hideCta",
              )}
        </Button>
      </div>
    </div>
  );
}
