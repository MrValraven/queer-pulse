import { useState } from "react";
import { routes } from "../../app/routeMap";
import { AdminShell } from "../../shared/components/layout/AdminShell";
import { FadeIn, SegmentedControl } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type {
  HousingReviewQueueSort,
  HousingReviewQueueStatus,
} from "./api/adminHousingListings.api";
import { AdminHousingListingsQueue } from "./AdminHousingListingsQueue";
import { AdminPageHeader, AdminTabs } from "./ui";
import styles from "./AdminHousingListingsPage.module.css";

const STATUS_TABS: HousingReviewQueueStatus[] = [
  "review",
  "question",
  "live",
  "rejected",
  "taken_down",
  "all",
];

const SORTS: HousingReviewQueueSort[] = ["risk", "oldest", "newest"];

/**
 * The housing review console (LOC-01).
 *
 * Every member listing lands in `review` and public browse serves `live` only,
 * so until this page existed a member could post their home, see "in review",
 * and stay there forever: the board was permanently empty in production, and
 * everything downstream of a listing going live (saved-search alerts, viewings,
 * address privacy, the verified chip) could never fire.
 *
 * Built as a queue somebody works through every morning. It opens on the
 * pending set sorted riskiest-first, each row carries the whole decision, and
 * `J`/`K`/`A`/`C`/`R`/`D` move and decide from the keyboard.
 */
export function AdminHousingListingsPage() {
  const { t } = useTranslation();
  const [status, setStatus] = useState<HousingReviewQueueStatus>("review");
  const [sort, setSort] = useState<HousingReviewQueueSort>("risk");

  return (
    <AdminShell
      title={
        <Translation
          i18nKey="admin:housingListings.title"
          components={{ em: <em /> }}
        />
      }
      breadcrumb={[
        { label: t("admin:common.adminBreadcrumb"), to: routes.admin },
      ]}
    >
      <FadeIn>
        <AdminPageHeader
          eyebrow={t("admin:housingListings.eyebrow")}
          title={
            <Translation
              i18nKey="admin:housingListings.header.title"
              components={{ em: <em /> }}
            />
          }
          sub={t("admin:housingListings.header.sub")}
        />
      </FadeIn>

      <FadeIn delay={60}>
        <div className={styles.controls}>
          <AdminTabs
            tabs={STATUS_TABS.map((value) => ({
              id: value,
              label: t(`admin:housingListings.tab.${value}`),
            }))}
            active={status}
            onChange={(value) => setStatus(value as HousingReviewQueueStatus)}
          />
          <div className={styles.sortField}>
            <span className={styles.sortLabel} aria-hidden>
              {t("admin:housingListings.sort.label")}
            </span>
            <SegmentedControl
              label={t("admin:housingListings.sort.label")}
              options={SORTS.map((value) => ({
                value,
                label: t(`admin:housingListings.sort.${value}`),
              }))}
              value={sort}
              onChange={(value) => setSort(value as HousingReviewQueueSort)}
            />
          </div>
        </div>
        <p className={styles.keyHint}>{t("admin:housingListings.keyHint")}</p>
      </FadeIn>

      <FadeIn delay={80}>
        <AdminHousingListingsQueue status={status} sort={sort} />
      </FadeIn>
    </AdminShell>
  );
}
