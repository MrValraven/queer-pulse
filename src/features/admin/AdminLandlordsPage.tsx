import { useState } from "react";
import { routes } from "../../app/routeMap";
import { AdminShell } from "../../shared/components/layout/AdminShell";
import { FadeIn } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type {
  LandlordIntroFilter,
  LandlordStatusFilter,
} from "./api/adminLandlords.api";
import { AdminLandlordsDirectory } from "./AdminLandlordsDirectory";
import { AdminLandlordsIntroRequests } from "./AdminLandlordsIntroRequests";
import { AdminPageHeader, AdminTabs } from "./ui";
import styles from "./AdminLandlordsPage.module.css";

type Pane = "directory" | "introductions";

const PANES: Pane[] = ["directory", "introductions"];
const DIRECTORY_FILTERS: LandlordStatusFilter[] = ["review", "live", "all"];
const INTRO_FILTERS: LandlordIntroFilter[] = [
  "pending",
  "accepted",
  "declined",
  "all",
];

/**
 * The landlord directory console (LOC-19).
 *
 * Two things a member does here used to reach the database and stop: suggesting
 * a landlord worth knowing about, and asking to be introduced to one. Every
 * `admin/landlords` route existed and none of them had a caller, so a
 * suggestion sat unpublished and an introduction request was never answered.
 *
 * Both panes are queues: they open on what is still waiting, each row carries
 * who asked and how long ago, and every decision that goes against a member
 * carries the sentence they will read.
 */
export function AdminLandlordsPage() {
  const { t } = useTranslation();
  const [pane, setPane] = useState<Pane>("directory");
  const [directoryFilter, setDirectoryFilter] =
    useState<LandlordStatusFilter>("review");
  const [introFilter, setIntroFilter] =
    useState<LandlordIntroFilter>("pending");
  const [search, setSearch] = useState("");

  return (
    <AdminShell
      title={
        <Translation
          i18nKey="admin:landlords.title"
          components={{ em: <em /> }}
        />
      }
      breadcrumb={[
        { label: t("admin:common.adminBreadcrumb"), to: routes.admin },
      ]}
    >
      <FadeIn>
        <AdminPageHeader
          eyebrow={t("admin:landlords.eyebrow")}
          title={
            <Translation
              i18nKey="admin:landlords.header.title"
              components={{ em: <em /> }}
            />
          }
          sub={t("admin:landlords.header.sub")}
        />
      </FadeIn>

      <FadeIn delay={60}>
        <AdminTabs
          tabs={PANES.map((value) => ({
            id: value,
            label: t(`admin:landlords.pane.${value}`),
          }))}
          active={pane}
          onChange={(value) => setPane(value as Pane)}
        />
      </FadeIn>

      {pane === "directory" ? (
        <>
          <FadeIn delay={70}>
            <div className={styles.controls}>
              <AdminTabs
                tabs={DIRECTORY_FILTERS.map((value) => ({
                  id: value,
                  label: t(`admin:landlords.filter.${value}`),
                }))}
                active={directoryFilter}
                onChange={(value) =>
                  setDirectoryFilter(value as LandlordStatusFilter)
                }
              />
              <div className={styles.searchField}>
                <label
                  className={styles.searchLabel}
                  htmlFor="admin-landlords-search"
                >
                  {t("admin:landlords.search.label")}
                </label>
                <input
                  id="admin-landlords-search"
                  className={styles.searchInput}
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder={t("admin:landlords.search.placeholder")}
                />
              </div>
            </div>
          </FadeIn>
          <FadeIn delay={80}>
            <AdminLandlordsDirectory filter={directoryFilter} search={search} />
          </FadeIn>
        </>
      ) : (
        <>
          <FadeIn delay={70}>
            <div className={styles.controls}>
              <AdminTabs
                tabs={INTRO_FILTERS.map((value) => ({
                  id: value,
                  label: t(`admin:landlords.introFilter.${value}`),
                }))}
                active={introFilter}
                onChange={(value) =>
                  setIntroFilter(value as LandlordIntroFilter)
                }
              />
            </div>
          </FadeIn>
          <FadeIn delay={80}>
            <AdminLandlordsIntroRequests filter={introFilter} />
          </FadeIn>
        </>
      )}
    </AdminShell>
  );
}
