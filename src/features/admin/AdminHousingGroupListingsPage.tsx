import { useState } from "react";
import { routes } from "../../app/routeMap";
import { AdminShell } from "../../shared/components/layout/AdminShell";
import { FadeIn } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { GroupListingQueueFilter } from "./api/adminHousingGroupListings.api";
import { AdminHousingGroupListingsQueue } from "./AdminHousingGroupListingsQueue";
import { AdminPageHeader, AdminTabs } from "./ui";
import styles from "./AdminHousingGroupListingsPage.module.css";

const STATUS_TABS: GroupListingQueueFilter[] = [
  "review",
  "question",
  "live",
  "declined",
  "all",
];

/**
 * The group-listing review console (LOC-19).
 *
 * A member posts a room into a vetted housing group, it lands in `review`, and
 * the group page serves `live` only. Until this page existed nobody could move
 * it: the room sat unpublished, the poster was never told why, and the only
 * control any console offered was the post-publication hide, which is a
 * different decision entirely.
 *
 * Built as a queue somebody works through every morning. It opens on what is
 * still waiting, riskiest first, each card carries the whole decision including
 * who posted it and how long it has been sitting, and `J`/`K`/`P`/`Q`/`D`/`R`
 * move and decide from the keyboard.
 */
export function AdminHousingGroupListingsPage() {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<GroupListingQueueFilter>("review");
  const [groupSlug, setGroupSlug] = useState("");

  return (
    <AdminShell
      title={
        <Translation
          i18nKey="admin:groupListingQueue.title"
          components={{ em: <em /> }}
        />
      }
      breadcrumb={[
        { label: t("admin:common.adminBreadcrumb"), to: routes.admin },
      ]}
    >
      <FadeIn>
        <AdminPageHeader
          eyebrow={t("admin:groupListingQueue.eyebrow")}
          title={
            <Translation
              i18nKey="admin:groupListingQueue.header.title"
              components={{ em: <em /> }}
            />
          }
          sub={t("admin:groupListingQueue.header.sub")}
        />
      </FadeIn>

      <FadeIn delay={60}>
        <div className={styles.controls}>
          <AdminTabs
            tabs={STATUS_TABS.map((value) => ({
              id: value,
              label: t(`admin:groupListingQueue.tab.${value}`),
            }))}
            active={filter}
            onChange={(value) => setFilter(value as GroupListingQueueFilter)}
          />
          <div className={styles.groupField}>
            <label
              className={styles.groupLabel}
              htmlFor="group-listing-queue-group"
            >
              {t("admin:groupListingQueue.groupFilter.label")}
            </label>
            <input
              id="group-listing-queue-group"
              className={styles.groupInput}
              type="search"
              value={groupSlug}
              onChange={(event) => setGroupSlug(event.target.value.trim())}
              placeholder={t("admin:groupListingQueue.groupFilter.placeholder")}
            />
          </div>
        </div>
        <p className={styles.keyHint}>{t("admin:groupListingQueue.keyHint")}</p>
      </FadeIn>

      <FadeIn delay={80}>
        <AdminHousingGroupListingsQueue filter={filter} groupSlug={groupSlug} />
      </FadeIn>
    </AdminShell>
  );
}
