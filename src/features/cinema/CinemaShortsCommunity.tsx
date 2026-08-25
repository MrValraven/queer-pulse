import { useState } from "react";
import { FiCheck } from "react-icons/fi";
import { Button, SectionHead } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import {
  transparencyNums,
  voteOptions,
  watchParties,
} from "./cinemaShorts.data";
import styles from "./CinemaShortsPage.module.css";

/** Recurring watch-party calendar with RSVP. */
export function WatchParties({ notify }: { notify: (m: string) => void }) {
  const { t } = useTranslation();
  const [rsvped, setRsvped] = useState<Set<number>>(new Set());

  const rsvp = (i: number, title: string) => {
    if (rsvped.has(i)) return;
    setRsvped((prev) => new Set(prev).add(i));
    notify(t("cinema:shorts.watchParties.rsvpToast", { title }));
  };

  return (
    <>
      <SectionHead
        className={styles.shortsSectionHead}
        title={
          <Translation
            i18nKey="cinema:shorts.watchParties.title"
            components={{ em: <em /> }}
          />
        }
        subtitle={t("cinema:shorts.watchParties.sub")}
        linkTo={routes.studioCalls}
        linkLabel={t("cinema:shorts.watchParties.hostCta")}
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
                    {t("cinema:shorts.watchParties.nextBadge")}
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
                <span className={styles.wcGoing}>
                  {t("cinema:shorts.watchParties.goingCount", { count: going })}
                </span>
                <Button
                  variant={w.next ? "primary" : "ghost"}
                  onClick={() => rsvp(i, title)}
                >
                  {rsvped.has(i) ? (
                    <>
                      <FiCheck aria-hidden />{" "}
                      {t("cinema:shorts.watchParties.goingCta")}
                    </>
                  ) : w.next ? (
                    t("cinema:shorts.watchParties.rsvpFreeCta")
                  ) : (
                    t("cinema:live.rsvpCta")
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
  const { t } = useTranslation();
  const [voted, setVoted] = useState<string | null>(null);

  const vote = (id: string) => {
    if (voted) return;
    setVoted(id);
    notify(t("cinema:shorts.vote.countedToast"));
  };

  return (
    <div className={styles.voteCard}>
      <div className={styles.voteHead}>
        <h3>
          <Translation
            i18nKey="cinema:shorts.vote.title"
            components={{ em: <em /> }}
          />
        </h3>
        <span className={styles.vhSub}>{t("cinema:shorts.vote.window")}</span>
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
                      <FiCheck aria-hidden />{" "}
                      {t("cinema:shorts.vote.yourPickLabel")}
                    </>
                  ) : voted ? (
                    ""
                  ) : (
                    t("cinema:shorts.vote.voteCta")
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
  const { t } = useTranslation();
  return (
    <div className={styles.transp}>
      <div className={styles.trText}>
        <div className={styles.trEb}>
          {t("cinema:shorts.transparency.heading")}
        </div>
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
          {t("cinema:shorts.transparency.ledgerCta")}
        </Button>
      </div>
    </div>
  );
}

/** Closing "submit your film" plum CTA. */
export function SubmitCta() {
  const { t } = useTranslation();
  const fmt = useFormat();
  return (
    <div className={styles.submitCta}>
      <div className={styles.sctText}>
        <div className={styles.sctEb}>
          {t("cinema:shorts.submitCta.eyebrow")}
        </div>
        <div className={styles.sctTitle}>
          <Translation
            i18nKey="cinema:shorts.submitCta.title"
            components={{ em: <em /> }}
          />
        </div>
        <div className={styles.sctSub}>
          {t("cinema:shorts.submitCta.body", { amount: fmt.currency(2500) })}
        </div>
      </div>
      <div className={styles.sctActions}>
        <Button to={routes.cinemaSubmit}>
          {t("cinema:shorts.submitCta.cta")}
        </Button>
        <Button variant="ghost-dark" to={routes.studioCalls}>
          {t("cinema:shorts.submitCta.seeGrantsCta")}
        </Button>
      </div>
    </div>
  );
}
