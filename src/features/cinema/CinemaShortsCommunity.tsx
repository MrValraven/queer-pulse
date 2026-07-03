import { useState } from "react";
import { FiCheck } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { routes } from "../../app/routeMap";
import {
  transparencyNums,
  voteOptions,
  watchParties,
} from "./cinemaShorts.data";
import { SecDiv } from "./CinemaShortsParts";
import styles from "./CinemaShortsPage.module.css";

/** Recurring watch-party calendar with RSVP. */
export function WatchParties({ notify }: { notify: (m: string) => void }) {
  const [rsvped, setRsvped] = useState<Set<number>>(new Set());

  const rsvp = (i: number, title: string) => {
    if (rsvped.has(i)) return;
    setRsvped((prev) => new Set(prev).add(i));
    notify(`You're going · ${title}`);
  };

  return (
    <>
      <SecDiv
        title={
          <>
            Watch <em>together</em>
          </>
        }
        sub="Live rooms where the whole set plays at once — makers in the chat"
        actionTo={routes.studioCalls}
        actionLabel="Host one →"
      />
      <div className={styles.wpCal}>
        {watchParties.map((w, i) => {
          const going = w.going + (rsvped.has(i) ? 1 : 0);
          const title = `${w.titlePre}${w.titleEm}${w.titlePost ?? ""}`;
          return (
            <div
              key={title}
              className={`${styles.wpCalRow} ${w.next ? styles.next : ""}`}
            >
              <div className={styles.wcDate}>
                <span className={styles.wcD}>{w.d}</span>
                <span className={styles.wcDm}>
                  {w.dm}
                  <small>{w.time}</small>
                </span>
              </div>
              <div>
                {w.next && (
                  <div className={styles.wcBadge}>
                    <span className={styles.live} aria-hidden />
                    Next up
                  </div>
                )}
                <div className={styles.wcTitle}>
                  {w.titlePre}
                  <em>{w.titleEm}</em>
                  {w.titlePost}
                </div>
                <div className={styles.wcSub}>{w.sub}</div>
              </div>
              <div className={styles.wcCta}>
                <span className={styles.wcGoing}>{going} going</span>
                <Button
                  variant={w.next ? "primary" : "ghost"}
                  onClick={() => rsvp(i, title)}
                >
                  {rsvped.has(i) ? (
                    <>
                      <FiCheck aria-hidden /> Going
                    </>
                  ) : w.next ? (
                    "RSVP · free"
                  ) : (
                    "RSVP"
                  )}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

/** Members vote on next month's programme theme; results reveal on vote. */
export function CommunityVote({ notify }: { notify: (m: string) => void }) {
  const [voted, setVoted] = useState<string | null>(null);

  const vote = (id: string) => {
    if (voted) return;
    setVoted(id);
    notify("Vote counted — thank you");
  };

  return (
    <div className={styles.voteCard}>
      <div className={styles.voteHead}>
        <h3>
          Programme the <em>next set</em>
        </h3>
        <span className={styles.vhSub}>
          Members choose August's theme · voting closes 20 Jul
        </span>
      </div>
      <div className={styles.voteOpts}>
        {voteOptions.map((o) => {
          const isVoted = voted === o.id;
          const cls = [
            styles.voteOpt,
            voted && styles.revealed,
            isVoted && styles.voted,
          ]
            .filter(Boolean)
            .join(" ");
          return (
            <button
              key={o.id}
              type="button"
              className={cls}
              disabled={!!voted}
              onClick={() => vote(o.id)}
            >
              <span
                className={styles.voFill}
                style={{ width: voted ? `${o.pct}%` : 0 }}
              />
              <span className={styles.voTitle}>
                {o.titlePre}
                <em>{o.titleEm}</em>
              </span>
              <span className={styles.voDesc}>{o.desc}</span>
              <span className={styles.voFoot}>
                <span className={styles.voPct}>{o.pct}%</span>
                <span className={styles.voCta}>
                  {isVoted ? (
                    <>
                      <FiCheck aria-hidden /> Your pick
                    </>
                  ) : voted ? (
                    ""
                  ) : (
                    "Vote"
                  )}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** "Where the money went" plum transparency panel. */
export function Transparency() {
  return (
    <div className={styles.transp}>
      <div className={styles.trText}>
        <div className={styles.trEb}>Where the money went · June</div>
        <div className={styles.trNums}>
          {transparencyNums.map((n) => (
            <div key={n.k} className={styles.trNum}>
              <div className={styles.v}>
                <em>{n.v}</em>
              </div>
              <div className={styles.k}>{n.k}</div>
            </div>
          ))}
        </div>
      </div>
      <div className={styles.trCta}>
        <Button variant="ghost-dark" to={routes.governance}>
          See the open ledger
        </Button>
      </div>
    </div>
  );
}

/** Closing "submit your film" plum CTA. */
export function SubmitCta() {
  return (
    <div className={styles.submitCta}>
      <div className={styles.sctText}>
        <div className={styles.sctEb}>Your film could be here</div>
        <div className={styles.sctTitle}>
          Made something? <em>Submit it.</em>
        </div>
        <div className={styles.sctSub}>
          Any QueerPulse member can submit to the Made Here track. Free to list,
          free to watch. You keep your rights. Tips go 100% to you. There's also
          a €2,500 commission closing 21 June.
        </div>
      </div>
      <div className={styles.sctActions}>
        <Button to={routes.cinemaSubmit}>Submit your film</Button>
        <Button variant="ghost-dark" to={routes.studioCalls}>
          See open grants
        </Button>
      </div>
    </div>
  );
}
