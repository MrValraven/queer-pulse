import { useSearchParams } from "react-router-dom";
import { routes } from "../../../app/routeMap";
import { AdminShell } from "../../../shared/components/layout/AdminShell";
import { Button, FadeIn } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  MUSIC_EVENT_BUCKETS,
  type MusicEventBucket,
} from "./api/musicEvents.types";
import { AdminPageHeader, AdminTabs } from "../ui";
import { AdminMusicEventsAttention } from "./AdminMusicEventsAttention";
import { AdminMusicEventsList } from "./AdminMusicEventsList";
import { BUCKET_TAB_KEYS } from "./musicEventList.data";
import styles from "./AdminMusicEvents.module.css";

const BUCKET_SEARCH_PARAM = "bucket";
const DEFAULT_BUCKET: MusicEventBucket = "upcoming";
const TABS_ID_PREFIX = "music-events";

function isMusicEventBucket(value: string | null): value is MusicEventBucket {
  return MUSIC_EVENT_BUCKETS.some((bucket) => bucket === value);
}

/**
 * The music events console: every event QueerPulse hosts in the Music
 * family, split into Upcoming, Past and Cancelled. The tab lives in
 * `?bucket=` so a link can land on one; an unknown value reads as Upcoming.
 * What waits on the team sits above the tabs.
 */
export function AdminMusicEventsPage() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const bucketParam = searchParams.get(BUCKET_SEARCH_PARAM);
  const activeBucket = isMusicEventBucket(bucketParam)
    ? bucketParam
    : DEFAULT_BUCKET;

  const selectBucket = (tabId: string) => {
    setSearchParams((previousParams) => {
      const nextParams = new URLSearchParams(previousParams);
      if (isMusicEventBucket(tabId) && tabId !== DEFAULT_BUCKET) {
        nextParams.set(BUCKET_SEARCH_PARAM, tabId);
      } else {
        nextParams.delete(BUCKET_SEARCH_PARAM);
      }
      return nextParams;
    });
  };

  return (
    <AdminShell
      title={t("admin:musicEvents.title")}
      breadcrumb={[
        { label: t("admin:common.adminBreadcrumb"), to: routes.admin },
      ]}
    >
      <FadeIn>
        <AdminPageHeader
          eyebrow={t("admin:musicEvents.eyebrow")}
          title={t("admin:musicEvents.title")}
          sub={t("admin:musicEvents.sub")}
          actions={
            <Button to={routes.adminMusicEventNew}>
              {t("admin:musicEvents.createCta")}
            </Button>
          }
        />
      </FadeIn>

      <AdminMusicEventsAttention />

      <FadeIn delay={60}>
        <AdminTabs
          idPrefix={TABS_ID_PREFIX}
          tabs={MUSIC_EVENT_BUCKETS.map((bucket) => ({
            id: bucket,
            label: t(BUCKET_TAB_KEYS[bucket]),
          }))}
          active={activeBucket}
          onChange={selectBucket}
        />
      </FadeIn>

      <FadeIn delay={80}>
        <div
          className={styles.panel}
          role="tabpanel"
          id={`${TABS_ID_PREFIX}-panel-${activeBucket}`}
          aria-labelledby={`${TABS_ID_PREFIX}-tab-${activeBucket}`}
        >
          <AdminMusicEventsList bucket={activeBucket} />
        </div>
      </FadeIn>
    </AdminShell>
  );
}
