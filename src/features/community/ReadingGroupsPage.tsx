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
import { useToast } from "../../shared/components/feedback/useToast";
import { routes } from "../../app/routeMap";
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
  const loading = useSimulatedLoad();
  const { showToast } = useToast();
  const [genre, setGenre] = useState<Genre | "all">("all");
  const [format, setFormat] = useState<Format | "all">("all");
  /** Map of group id → the user's position on that group's waitlist. */
  const [waitlist, setWaitlist] = useState<Record<string, number>>({});
  /** Groups the user has listed this session, prepended to the directory. */
  const [myGroups, setMyGroups] = useState<Group[]>([]);
  const messages = routes.messages;

  const allGroups = [...myGroups, ...GROUPS];
  const items = allGroups.filter(
    (g) =>
      (genre === "all" || g.genre === genre) &&
      (format === "all" || g.format === format),
  );

  function joinWaitlist(id: string, name: string) {
    setWaitlist((prev) => {
      if (prev[id]) return prev;
      // Deterministic-but-plausible position for this prototype.
      const position = 2 + (id.charCodeAt(id.length - 1) % 5);
      showToast(`You're #${position} on the waitlist for ${name}`, "success");
      return { ...prev, [id]: position };
    });
  }

  return (
    <PageShell>
      <header className={styles.hero}>
        <div className="wrap">
          <div className={styles.eye}>Community · Reading</div>
          <h1 className={styles.title}>
            Read together.
            <br />
            <em>Trust faster.</em>
          </h1>
          <p className={styles.sub}>
            Small groups, one book, one month. No homework anxiety, no
            gatekeeping. The best way to find your people in a new city is to
            argue about a book with them.
          </p>
          <div className={styles.why}>
            <div className={styles.w}>
              <strong>Queer-curated books</strong>
              <span>
                Every group chooses its own reading. We do not tell you what
                matters.
              </span>
            </div>
            <div className={styles.w}>
              <strong>Small by design</strong>
              <span>
                Groups cap at 6–8 people. Real conversations, not lectures.
              </span>
            </div>
            <div className={styles.w}>
              <strong>Mixed formats</strong>
              <span>
                In-person in cafés and homes. Online for those outside Lisbon or
                with access needs.
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className={styles.filterBar}>
        <div className={styles.fbInner}>
          <span className={styles.fbLabel}>Genre</span>
          <FilterChips
            options={GENRE_FILTERS.map((f) => ({
              value: f.id,
              label: f.label,
            }))}
            value={genre}
            onChange={(v) => setGenre(v as Genre | "all")}
          />
          <div className={styles.fbSep} />
          <span className={styles.fbLabel}>Format</span>
          <FilterChips
            options={FORMAT_FILTERS.map((f) => ({
              value: f.id,
              label: f.label,
            }))}
            value={format}
            onChange={(v) => setFormat(v as Format | "all")}
          />
          <div className={styles.fbSep} />
          <div className={styles.count}>
            <b>{items.length}</b> group{items.length !== 1 ? "s" : ""}
          </div>
        </div>
      </div>

      <main className={styles.body}>
        <div className="wrap">
          <div className={styles.grid}>
            {loading &&
              Array.from({ length: 4 }).map((_, i) => (
                <ReadingGroupCardSkeleton key={i} />
              ))}
            {!loading && items.length === 0 && (
              <EmptyState
                className={styles.empty}
                icon={<FiBookOpen />}
                title="No groups match those filters"
                description="Nothing fits this genre and format combination yet — try widening your filters, or start a group around the book you want to read."
                action={{
                  label: "Clear filters",
                  onClick: () => {
                    setGenre("all");
                    setFormat("all");
                  },
                }}
              />
            )}
            {!loading &&
              items.map((g, i) => (
                <FadeIn key={g.id} delay={Math.min(i, 8) * 60}>
                  <ReadingGroupCard
                    g={g}
                    messagesPath={messages}
                    onWaitlist={() => joinWaitlist(g.id, g.name)}
                    waitlistPosition={waitlist[g.id]}
                  />
                </FadeIn>
              ))}
          </div>

          <WaitlistPanel waitlist={waitlist} />

          <ListGroupStrip
            onListed={(g) => setMyGroups((prev) => [g, ...prev])}
          />
        </div>
      </main>

      <Outro
        title={
          <>
            Books build <em>community.</em>
          </>
        }
        sub="QueerPulse reading groups have been running since 2024. Some have turned into friendships, some into collaborations, two into bands."
      >
        <Button to={routes.requestInvite} variant="primary" size="lg">
          Join the network
        </Button>
      </Outro>
    </PageShell>
  );
}
