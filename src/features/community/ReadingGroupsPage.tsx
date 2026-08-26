import { useMemo, useState } from "react";
import { FiAlertCircle, FiBookOpen } from "react-icons/fi";
import { PageShell } from "../../shared/components/layout";
import {
  Button,
  EmptyState,
  FadeIn,
  FilterChips,
  Outro,
  SkeletonLine,
} from "../../shared/components/ui";
import { useSimulatedLoad } from "../../shared/hooks";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Translation } from "../../shared/i18n/Translation";
import { routes } from "../../app/routeMap";
import { requestInvitePath } from "../auth/api/joinRequestSource";
import { useReadingGroups } from "./api/useReadingGroups";
import { communityCardToReadingGroup } from "./readingGroups.adapters";
import {
  FORMAT_FILTERS,
  GENRE_FILTERS,
  GROUPS,
  type Format,
  type Genre,
  type Group,
} from "./readingGroups.data";
import { ReadingGroupCard } from "./ReadingGroupCard";
import { ListGroupStrip } from "./ListGroupStrip";
import { WaitlistPanel } from "./WaitlistPanel";
import styles from "./ReadingGroupsPage.module.css";

function ReadingGroupCardSkeleton() {
  return (
    <article className={styles.gc} aria-hidden>
      <div className={styles.gcBook}>
        <SkeletonLine
          width={48}
          height={68}
          style={{ borderRadius: 6, flex: "none" }}
        />
        <div style={{ flex: 1 }}>
          <SkeletonLine width="80%" height={17} />
          <SkeletonLine width="50%" height={13} style={{ marginTop: 8 }} />
          <SkeletonLine
            width={90}
            height={20}
            style={{ marginTop: 10, borderRadius: 6 }}
          />
        </div>
      </div>
      <div className={styles.gcBody}>
        <SkeletonLine width="60%" height={18} />
        <SkeletonLine width="100%" height={13} />
        <SkeletonLine width="85%" height={13} />
      </div>
      <div className={styles.gcFoot}>
        <SkeletonLine width={80} height={14} />
        <SkeletonLine width={110} height={14} />
      </div>
    </article>
  );
}

/** A group posted as meeting "either" way matches BOTH format filters: it is
 *  one of the three answers the propose form offers, and hiding it from the
 *  two filters a member actually uses would bury it. */
function matchesFormat(group: Group, format: Format | "all"): boolean {
  if (format === "all") return true;
  return group.format === format || group.format === "either";
}

export function ReadingGroupsPage() {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const { showToast } = useToast();

  // LIVE: the directory is `GET /communities?tags=book-club` — a reading group
  // IS a community, so an approved proposal produces a real, refresh-surviving
  // row here. This replaced a `useState` list seeded from nothing and lost on
  // every reload, whose one visible outcome was whatever the member had typed
  // into the propose form that session.
  const readingGroupsQuery = useReadingGroups();
  const liveGroups = useMemo(
    () =>
      (readingGroupsQuery.data?.items ?? []).map(communityCardToReadingGroup),
    [readingGroupsQuery.data],
  );

  // The skeleton delay is the prototype's fake fetch; live has a real one.
  const isSimulatedLoading = useSimulatedLoad();
  const isLoading = demoMode
    ? isSimulatedLoading
    : readingGroupsQuery.isLoading;

  const [genre, setGenre] = useState<Genre | "all">("all");
  const [format, setFormat] = useState<Format | "all">("all");
  /** Map of group id → the user's position on that group's waitlist. */
  const [waitlist, setWaitlist] = useState<Record<string, number>>({});
  /** Groups the user has listed this session. DEMO ONLY: the prototype's
   *  propose form lists instantly, while a live proposal goes to an admin for
   *  review and appears here only once it is approved into a real group. */
  const [myGroups, setMyGroups] = useState<Group[]>([]);
  // The prototype's curated groups carry no lister account, so its card points
  // at the inbox. A live card does not need this: it has a real owner and a
  // real join flow (see `ReadingGroupJoinButton`).
  const messagesPath = demoMode ? routes.messages : undefined;

  // Genre is a demo-only facet: nothing asks a proposer for one, so every live
  // group has none, and offering the filter would only ever empty the grid.
  const isGenreFilterShown = demoMode;

  const allGroups = demoMode ? [...myGroups, ...GROUPS] : liveGroups;
  const items = allGroups.filter(
    (group) =>
      (!isGenreFilterShown || genre === "all" || group.genre === genre) &&
      matchesFormat(group, format),
  );

  function joinWaitlist(id: string, name: string) {
    // Waitlists have no backend yet (Phase 2). Only the prototype fabricates a
    // position + success toast; live never calls this (the card hides the
    // affordance), but we guard here too so a stray call can't fake success.
    if (!demoMode) return;
    setWaitlist((prev) => {
      if (prev[id]) return prev;
      // Deterministic-but-plausible position for this prototype.
      const position = 2 + (id.charCodeAt(id.length - 1) % 5);
      showToast(
        t("community:readingGroups.joinedWaitlistToast", { position, name }),
        "success",
      );
      return { ...prev, [id]: position };
    });
  }

  return (
    <PageShell>
      <header className={styles.hero} data-plum>
        <div className="wrap">
          <div className={styles.eye}>
            {t("community:readingGroups.hero.eye")}
          </div>
          <h1 className={styles.title}>
            {t("community:readingGroups.hero.titleLine1")}
            <br />
            <Translation
              i18nKey="community:readingGroups.hero.titleLine2"
              components={{ em: <em /> }}
            />
          </h1>
          <p className={styles.sub}>{t("community:readingGroups.hero.sub")}</p>
          <div className={styles.why}>
            <div className={styles.w}>
              <strong>{t("community:readingGroups.why.curated.title")}</strong>
              <span>{t("community:readingGroups.why.curated.desc")}</span>
            </div>
            <div className={styles.w}>
              <strong>{t("community:readingGroups.why.small.title")}</strong>
              <span>{t("community:readingGroups.why.small.desc")}</span>
            </div>
            <div className={styles.w}>
              <strong>{t("community:readingGroups.why.mixed.title")}</strong>
              <span>{t("community:readingGroups.why.mixed.desc")}</span>
            </div>
          </div>
        </div>
      </header>

      <div className={styles.filterBar}>
        <div className={styles.fbInner}>
          {isGenreFilterShown && (
            <>
              <span className={styles.fbLabel} id="rg-genre-label">
                {t("community:readingGroups.filterBar.genreLabel")}
              </span>
              <FilterChips
                labelledBy="rg-genre-label"
                options={GENRE_FILTERS.map((filter) => ({
                  value: filter.id,
                  label: t(`community:${filter.labelKey}`),
                }))}
                value={genre}
                onChange={(value) => setGenre(value as Genre | "all")}
              />
              <div className={styles.fbSep} />
            </>
          )}
          <span className={styles.fbLabel} id="rg-format-label">
            {t("community:readingGroups.filterBar.formatLabel")}
          </span>
          <FilterChips
            labelledBy="rg-format-label"
            options={FORMAT_FILTERS.map((filter) => ({
              value: filter.id,
              label: t(`community:${filter.labelKey}`),
            }))}
            value={format}
            onChange={(value) => setFormat(value as Format | "all")}
          />
          <div className={styles.fbSep} />
          <div className={styles.count}>
            {t("community:readingGroups.filterBar.count", {
              count: items.length,
            })}
          </div>
        </div>
      </div>

      <div className={styles.body}>
        <div className="wrap">
          <div className={styles.grid}>
            {isLoading &&
              Array.from({ length: 4 }).map((_, index) => (
                <ReadingGroupCardSkeleton key={index} />
              ))}
            {!isLoading && readingGroupsQuery.isError && (
              <EmptyState
                className={styles.empty}
                icon={<FiAlertCircle />}
                title={t("community:readingGroups.liveError.title")}
                description={t("community:readingGroups.liveError.description")}
                action={{
                  label: t("community:readingGroups.liveError.retryCta"),
                  onClick: () => void readingGroupsQuery.refetch(),
                }}
              />
            )}
            {!isLoading &&
              !readingGroupsQuery.isError &&
              items.length === 0 &&
              (allGroups.length === 0 ? (
                <EmptyState
                  className={styles.empty}
                  icon={<FiBookOpen />}
                  title={t("community:readingGroups.liveEmpty.title")}
                  description={t(
                    "community:readingGroups.liveEmpty.description",
                  )}
                />
              ) : (
                <EmptyState
                  className={styles.empty}
                  icon={<FiBookOpen />}
                  title={t("community:readingGroups.empty.title")}
                  description={t("community:readingGroups.empty.description")}
                  action={{
                    label: t("community:readingGroups.empty.clearFiltersCta"),
                    onClick: () => {
                      setGenre("all");
                      setFormat("all");
                    },
                  }}
                />
              ))}
            {!isLoading &&
              !readingGroupsQuery.isError &&
              items.map((group, index) => (
                <FadeIn key={group.id} delay={Math.min(index, 8) * 60}>
                  <ReadingGroupCard
                    group={group}
                    messagesPath={messagesPath}
                    onWaitlist={() =>
                      joinWaitlist(group.id, group.name ?? group.book)
                    }
                    waitlistPosition={waitlist[group.id]}
                    isWaitlistEnabled={demoMode}
                  />
                </FadeIn>
              ))}
          </div>

          <WaitlistPanel waitlist={waitlist} />

          <ListGroupStrip
            onListed={(group) => setMyGroups((prev) => [group, ...prev])}
          />
        </div>
      </div>

      <Outro
        title={
          <Translation
            i18nKey="community:readingGroups.outro.title"
            components={{ em: <em /> }}
          />
        }
        sub={t("community:readingGroups.outro.sub")}
      >
        <Button
          to={requestInvitePath("reading_groups")}
          variant="primary"
          size="lg"
        >
          {t("community:readingGroups.outro.cta")}
        </Button>
      </Outro>
    </PageShell>
  );
}
