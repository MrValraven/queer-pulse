import type { KeyboardEvent, SyntheticEvent } from "react";
import { FiBookmark, FiHome } from "react-icons/fi";
import { Link } from "react-router-dom";
import { useSaved } from "../../app/providers/useSaved";
import { routes } from "../../app/routeMap";
import {
  Avatar,
  EmptyState,
  FadeIn,
  ImageSlot,
  SkeletonLine,
} from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { FILTERS } from "./housing.data";
import type { HOUSING_LISTINGS } from "./housingListings";
import styles from "./HousingPage.module.css";

type Listing = (typeof HOUSING_LISTINGS)[number];

/**
 * Floating save/bookmark toggle overlaid on a listing card's photo. The card
 * itself is a router `<Link>` (see HousingListingGrid below), so this is a
 * `span[role="button"]` rather than a nested `<button>` — a real `<button>`
 * inside a `<Link>` is invalid HTML and unreachable by some AT.
 */
function ListingSaveToggle({ listing }: { listing: Listing }) {
  const { t } = useTranslation();
  const { isSaved, toggleSave } = useSaved();
  const { showToast } = useToast();
  const savedId = `housing:${listing.slug}`;
  const saved = isSaved(savedId);

  function handleSave(event: SyntheticEvent) {
    event.preventDefault();
    event.stopPropagation();
    const now = toggleSave({
      id: savedId,
      kind: "housing",
      title: listing.title,
      href: `${routes.housing}/${listing.slug}`,
      meta: listing.hood,
    });
    showToast(
      t(
        now
          ? "economy:housing.card.savedToast"
          : "economy:housing.card.unsavedToast",
        { title: listing.title },
      ),
      now ? "success" : "info",
    );
  }

  function handleKeyDown(event: KeyboardEvent<HTMLSpanElement>) {
    if (event.key === "Enter" || event.key === " ") handleSave(event);
  }

  return (
    <span
      role="button"
      tabIndex={0}
      aria-pressed={saved}
      aria-label={t(
        saved
          ? "economy:housing.card.unsaveAriaLabel"
          : "economy:housing.card.saveAriaLabel",
        { title: listing.title },
      )}
      className={[styles.saveBtn, saved && styles.saveBtnOn]
        .filter(Boolean)
        .join(" ")}
      onClick={handleSave}
      onKeyDown={handleKeyDown}
    >
      <FiBookmark aria-hidden style={{ fill: saved ? "currentColor" : "none" }} />
    </span>
  );
}

function ListingSkeleton() {
  return (
    <div className={styles.card} aria-hidden>
      <SkeletonLine width="100%" height={150} style={{ borderRadius: 0 }} />
      <div className={styles.cardBody}>
        <SkeletonLine width={88} height={20} style={{ borderRadius: 6 }} />
        <SkeletonLine width="80%" height={19} style={{ marginTop: 4 }} />
        <SkeletonLine width="60%" height={13} style={{ marginTop: 4 }} />
        <SkeletonLine width="95%" height={13} style={{ marginTop: 4 }} />
        <div className={styles.foot}>
          <SkeletonLine width={70} height={20} />
          <SkeletonLine width={90} height={13} />
        </div>
      </div>
    </div>
  );
}

export function HousingListingGrid({
  loading,
  visible,
  filtered,
  onClearFilter,
  onListSpace,
}: {
  loading: boolean;
  visible: Listing[];
  filtered?: boolean;
  onClearFilter: () => void;
  onListSpace: () => void;
}) {
  const { t } = useTranslation();
  return (
    <div className={styles.grid}>
      {loading ? (
        Array.from({ length: 6 }).map((_, skeletonIndex) => (
          <ListingSkeleton key={skeletonIndex} />
        ))
      ) : visible.length === 0 ? (
        <EmptyState
          className={styles.empty}
          icon={<FiHome />}
          title={t(
            filtered
              ? "economy:housing.empty.filteredTitle"
              : "economy:housing.empty.title",
          )}
          description={t(
            filtered
              ? "economy:housing.empty.filteredDescription"
              : "economy:housing.empty.description",
          )}
          action={
            filtered
              ? {
                  label: t("economy:housing.empty.clearFilters"),
                  onClick: onClearFilter,
                }
              : {
                  label: t("economy:housing.empty.listSpace"),
                  onClick: onListSpace,
                }
          }
        />
      ) : (
        visible.map((listing, listingIndex) => (
          <FadeIn
            key={listing.title}
            as={Link}
            to={`${routes.housing}/${listing.slug}`}
            className={styles.card}
            delay={Math.min(listingIndex, 8) * 60}
          >
            <div className={styles.thumbWrap}>
              <ImageSlot
                tint={listing.tint}
                src={listing.image}
                height={150}
                radius={0}
                placeholder={t("economy:housing.listing.photoAlt", {
                  hood: listing.hood,
                })}
              />
              <ListingSaveToggle listing={listing} />
            </div>
            <div className={styles.cardBody}>
              <span
                className={styles.type}
                style={{
                  background: listing.typeColor,
                  color: listing.typeText,
                }}
              >
                {t(
                  FILTERS.find(
                    (filterOption) => filterOption.value === listing.type,
                  )?.labelKey ?? "economy:housing.filter.all",
                )}
              </span>
              <div className={styles.cardTitle}>{listing.title}</div>
              <div className={styles.details}>
                <span className={styles.detail}>{listing.hood}</span>
                {listing.beds && (
                  <span className={styles.detail}>{listing.beds}</span>
                )}
                <span className={styles.detail}>
                  {t("economy:housing.listing.from", { date: listing.avail })}
                </span>
              </div>
              <p className={styles.cardDesc}>{listing.description}</p>
              <div className={styles.foot}>
                <div className={styles.price}>
                  {listing.price} <span>/ {listing.period}</span>
                </div>
                <div className={styles.poster}>
                  <Avatar
                    initials={listing.poster.initials}
                    tint={listing.poster.tint}
                    size={26}
                  />
                  {listing.poster.name}
                </div>
              </div>
            </div>
          </FadeIn>
        ))
      )}
    </div>
  );
}
