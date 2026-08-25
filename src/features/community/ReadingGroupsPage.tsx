import { useState } from "react";
import { FiBookOpen } from "react-icons/fi";
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

export function ReadingGroupsPage() {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  // The skeleton delay is the prototype's fake fetch. Live mode has nothing to
  // wait for here (the only groups are the ones this member proposed, held in
  // local state), so a live visit would pay 600ms of placeholder for nothing.
  const isSimulatedLoading = useSimulatedLoad();
  const isLoading = demoMode && isSimulatedLoading;
  const { showToast } = useToast();
  const [genre, setGenre] = useState<Genre | "all">("all");
  const [format, setFormat] = useState<Format | "all">("all");
  /** Map of group id → the user's position on that group's waitlist. */
  const [waitlist, setWaitlist] = useState<Record<string, number>>({});
  /** Groups the user has listed this session, prepended to the directory. */
  const [myGroups, setMyGroups] = useState<Group[]>([]);
  // "Request to join" needs somebody to reach. A Group carries no lister
  // account, so live has no recipient and linking to the inbox would land the
  // member on an empty conversation list; the card falls back to an honest
  // disabled state. The prototype keeps its inbox link.
  const messagesPath = demoMode ? routes.messages : undefined;

  // The curated GROUPS directory is prototype-only editorial content with no
  // server listing. In live mode only the groups the member proposes this
  // session appear; the propose flow (ListGroupStrip) works in both modes.
  const allGroups = demoMode ? [...myGroups, ...GROUPS] : myGroups;
  const items = allGroups.filter(
    (g) =>
      (genre === "all" || g.genre === genre) &&
      (format === "all" || g.format === format),
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
          <span className={styles.fbLabel} id="rg-genre-label">
            {t("community:readingGroups.filterBar.genreLabel")}
          </span>
          <FilterChips
            labelledBy="rg-genre-label"
            options={GENRE_FILTERS.map((f) => ({
              value: f.id,
              label: t(`community:${f.labelKey}`),
            }))}
            value={genre}
            onChange={(v) => setGenre(v as Genre | "all")}
          />
          <div className={styles.fbSep} />
          <span className={styles.fbLabel} id="rg-format-label">
            {t("community:readingGroups.filterBar.formatLabel")}
          </span>
          <FilterChips
            labelledBy="rg-format-label"
            options={FORMAT_FILTERS.map((f) => ({
              value: f.id,
              label: t(`community:${f.labelKey}`),
            }))}
            value={format}
            onChange={(v) => setFormat(v as Format | "all")}
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
              Array.from({ length: 4 }).map((_, i) => (
                <ReadingGroupCardSkeleton key={i} />
              ))}
            {!isLoading &&
              items.length === 0 &&
              (!demoMode && allGroups.length === 0 ? (
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
              items.map((g, i) => (
                <FadeIn key={g.id} delay={Math.min(i, 8) * 60}>
                  <ReadingGroupCard
                    g={g}
                    messagesPath={messagesPath}
                    onWaitlist={() => joinWaitlist(g.id, g.name)}
                    waitlistPosition={waitlist[g.id]}
                    isWaitlistEnabled={demoMode}
                  />
                </FadeIn>
              ))}
          </div>

          <WaitlistPanel waitlist={waitlist} />

          <ListGroupStrip
            onListed={(g) => setMyGroups((prev) => [g, ...prev])}
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
