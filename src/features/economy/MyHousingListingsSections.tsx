import { FiAlertCircle, FiHome } from "react-icons/fi";
import { Link } from "react-router-dom";
import { routes } from "../../app/routeMap";
import { Badge, Button, EmptyState, FadeIn, type BadgeTone } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { formatDate } from "../../shared/lib/date";
import { FILTERS } from "./housing.data";
import type { MyHousingListingRow } from "./myHousingListings.data";
import styles from "./MyHousingListingsPage.module.css";

/** Status pill shown on a row — filled/expired take priority over the raw
 * moderation `status` (a filled-but-still-"live" listing reads as "Filled",
 * not "Live", since that's the state that actually matters to the owner). */
function StatusPill({ listing }: { listing: MyHousingListingRow }) {
  const { t } = useTranslation();
  let labelKey = "economy:myHousingListings.status.live";
  let tone: BadgeTone = "jade";
  if (listing.filledAt !== null) {
    labelKey = "economy:myHousingListings.status.filled";
    tone = "plum";
  } else if (listing.expired) {
    labelKey = "economy:myHousingListings.status.expired";
    tone = "danger";
  } else if (listing.status === "review") {
    labelKey = "economy:myHousingListings.status.review";
    tone = "amber";
  } else if (listing.status === "question") {
    labelKey = "economy:myHousingListings.status.question";
    tone = "amber";
  }
  return <Badge tone={tone}>{t(labelKey)}</Badge>;
}

export function MyHousingListingCard({
  listing,
  onEdit,
  onMarkFilled,
  onMarkAvailable,
  onExtend,
  onDelete,
  busy,
}: {
  listing: MyHousingListingRow;
  onEdit: () => void;
  onMarkFilled: () => void;
  onMarkAvailable: () => void;
  onExtend: () => void;
  onDelete: () => void;
  busy: boolean;
}) {
  const { t, language } = useTranslation();
  const fmt = useFormat();
  const hidden = listing.filledAt !== null || listing.expired;
  const typeLabel = t(
    FILTERS.find((filterOption) => filterOption.value === listing.type)
      ?.labelKey ?? "economy:housing.filter.all",
  );

  return (
    <FadeIn className={styles.card}>
      <div className={styles.cardTop}>
        <span className={styles.type}>{typeLabel}</span>
        <StatusPill listing={listing} />
      </div>
      <h3 className={styles.cardTitle}>{listing.title}</h3>
      <div className={styles.cardMeta}>
        <span>
          {listing.area || listing.city} ·{" "}
          {t("economy:housing.fact.rentPerMonth", {
            amount: fmt.currency(listing.rentEuros, "EUR", {
              maximumFractionDigits: 0,
            }),
          })}
        </span>
        <span>
          {t("economy:myHousingListings.postedOn", {
            date: formatDate(listing.createdAt, language),
          })}
        </span>
      </div>
      {hidden ? (
        <p className={styles.cardHint}>
          {t(
            listing.expired
              ? "economy:myHousingListings.expiredHint"
              : "economy:myHousingListings.filledHint",
          )}
        </p>
      ) : (
        <p className={styles.cardHint}>
          {t("economy:myHousingListings.expiresOn", {
            date: formatDate(listing.expiresAt, language),
          })}
        </p>
      )}

      <div className={styles.cardActions}>
        <Button size="md" variant="ghost" onClick={onEdit} disabled={busy}>
          {t("economy:myHousingListings.actions.edit")}
        </Button>
        <Button size="md" variant="ghost" onClick={onExtend} disabled={busy}>
          {t("economy:myHousingListings.actions.extend")}
        </Button>
        {hidden ? (
          <Button size="md" variant="ghost" onClick={onMarkAvailable} disabled={busy}>
            {t("economy:myHousingListings.actions.markAvailable")}
          </Button>
        ) : (
          <Button size="md" variant="ghost" onClick={onMarkFilled} disabled={busy}>
            {t("economy:myHousingListings.actions.markFilled")}
          </Button>
        )}
        <Link
          to={`${routes.housing}/${listing.slug}`}
          className={styles.viewLink}
        >
          {t("economy:myHousingListings.actions.view")}
        </Link>
        <Button
          size="md"
          variant="danger"
          className={styles.deleteBtn}
          onClick={onDelete}
          disabled={busy}
        >
          {t("economy:myHousingListings.actions.delete")}
        </Button>
      </div>
    </FadeIn>
  );
}

export function MyHousingListingsEmpty({ onListSpace }: { onListSpace: () => void }) {
  const { t } = useTranslation();
  return (
    <EmptyState
      icon={<FiHome />}
      title={t("economy:myHousingListings.empty.title")}
      description={t("economy:myHousingListings.empty.description")}
      action={{
        label: t("economy:myHousingListings.empty.cta"),
        onClick: onListSpace,
      }}
    />
  );
}

export function MyHousingListingsError({ onRetry }: { onRetry: () => void }) {
  const { t } = useTranslation();
  return (
    <EmptyState
      icon={<FiAlertCircle />}
      title={t("economy:myHousingListings.error.title")}
      description={t("economy:myHousingListings.error.body")}
      action={{
        label: t("economy:myHousingListings.error.retry"),
        onClick: onRetry,
      }}
    />
  );
}
