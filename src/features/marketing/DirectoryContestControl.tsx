import { useState } from "react";
import { Link } from "react-router-dom";
import { FiChevronRight } from "react-icons/fi";
import { useAuth } from "../../app/providers/authContext";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Modal } from "../../shared/components/ui/Modal";
import { routes } from "../../app/routeMap";
import { type DirectoryPlace } from "./directoryPlaces";
import { DirectorySuggestEditModal } from "./DirectorySuggestEditModal";
import { DirectoryDisputeModal } from "./DirectoryDisputeModal";
import { DirectoryClaimModal } from "./DirectoryClaimModal";
import styles from "./DirectoryContestControl.module.css";

interface Props {
  place: DirectoryPlace;
  /** The viewer's own ref for this listing, present only when they own it —
   * owners get "Edit this listing" instead, so the whole control hides. */
  ownerRef?: string;
}

type Active = "menu" | "suggest" | "dispute" | "claim";

/**
 * "Report / claim this listing" — the single member-facing entry, tucked in the
 * detail aside footer, for contesting or claiming a directory listing. Opening
 * it offers three paths: (a) suggest an edit (the existing `DirectorySuggestEdit`
 * flow, reused verbatim), (b) report/dispute the listing (`DirectoryDisputeModal`
 * → shared moderation pipeline), and (c) claim it — a real ownership request
 * (`DirectoryClaimModal` → `POST /listings/:ref/claim`), reviewed by a
 * moderator, NOT a bounce into the "list your business" create wizard (that
 * would make a duplicate listing rather than claim the existing one). Critical
 * for a queer platform: a venue can be tagged "queer-friendly" via the suggest
 * path WITHOUT its knowledge, so it needs a way to contest or take ownership.
 * Member-gated (dispute + claim both require an account; suggest-edit already
 * did) and hidden for owners.
 */
export function DirectoryContestControl({ place, ownerRef }: Props) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { demoMode } = useDemoMode();
  const [active, setActive] = useState<Active | null>(null);

  if (ownerRef || !user) return null;

  const close = () => setActive(null);
  // A live dispute/claim must be addressable by the listing's `ref`; demo
  // never hits the network. Hide both paths when live and the detail DTO
  // hasn't carried a ref (see useDisputeListing/useClaimListing,
  // DirectoryDetailDTO.ref) — for a synthetic demo-only entry with no real
  // ref, "claim" falls back to the create wizard below instead.
  const listingRef = place.ref ?? undefined;
  const canFileAgainstListing = demoMode || Boolean(listingRef);

  return (
    <div className={styles.wrap}>
      <button
        type="button"
        className={styles.trigger}
        onClick={() => setActive("menu")}
        aria-label={t("marketing:directory.detail.contest.ariaLabel", {
          name: place.name,
        })}
      >
        {t("marketing:directory.detail.contest.cta")}
      </button>

      {active === "menu" && (
        <Modal
          title={t("marketing:directory.detail.contest.title")}
          sub={t("marketing:directory.detail.contest.sub", {
            name: place.name,
          })}
          onClose={close}
        >
          <div className={styles.options}>
            <button
              type="button"
              className={styles.option}
              onClick={() => setActive("suggest")}
            >
              <span className={styles.optionText}>
                <span className={styles.optionTitle}>
                  {t("marketing:directory.detail.contest.suggest.title")}
                </span>
                <span className={styles.optionDesc}>
                  {t("marketing:directory.detail.contest.suggest.desc")}
                </span>
              </span>
              <FiChevronRight className={styles.optionChevron} aria-hidden />
            </button>

            {canFileAgainstListing && (
              <button
                type="button"
                className={styles.option}
                onClick={() => setActive("dispute")}
              >
                <span className={styles.optionText}>
                  <span className={styles.optionTitle}>
                    {t("marketing:directory.detail.contest.dispute.title")}
                  </span>
                  <span className={styles.optionDesc}>
                    {t("marketing:directory.detail.contest.dispute.desc")}
                  </span>
                </span>
                <FiChevronRight className={styles.optionChevron} aria-hidden />
              </button>
            )}

            {canFileAgainstListing ? (
              <button
                type="button"
                className={styles.option}
                onClick={() => setActive("claim")}
              >
                <span className={styles.optionText}>
                  <span className={styles.optionTitle}>
                    {t("marketing:directory.detail.contest.claim.title")}
                  </span>
                  <span className={styles.optionDesc}>
                    {t("marketing:directory.detail.contest.claim.desc")}
                  </span>
                </span>
                <FiChevronRight className={styles.optionChevron} aria-hidden />
              </button>
            ) : (
              <Link
                to={routes.listBusiness}
                className={styles.option}
                onClick={close}
              >
                <span className={styles.optionText}>
                  <span className={styles.optionTitle}>
                    {t("marketing:directory.detail.contest.claim.title")}
                  </span>
                  <span className={styles.optionDesc}>
                    {t("marketing:directory.detail.contest.claim.desc")}
                  </span>
                </span>
                <FiChevronRight className={styles.optionChevron} aria-hidden />
              </Link>
            )}
          </div>
        </Modal>
      )}

      {active === "suggest" && (
        <DirectorySuggestEditModal
          slug={place.slug}
          placeName={place.name}
          onClose={close}
        />
      )}

      {active === "dispute" && (
        <DirectoryDisputeModal
          listingRef={listingRef ?? place.slug}
          placeName={place.name}
          onClose={close}
        />
      )}

      {active === "claim" && (
        <DirectoryClaimModal
          listingRef={listingRef ?? place.slug}
          placeName={place.name}
          onClose={close}
        />
      )}
    </div>
  );
}
