import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { useToast } from "../../shared/components/feedback/useToast";
import {
  AGENDA,
  RESOLUTIONS,
  MORE_RESOLUTIONS,
  HISTORY,
  type AssemblyVote,
  type Resolution,
} from "./annualAssembly.data";
import { LiveStreamModal } from "./LiveStreamModal";
import styles from "./AnnualAssemblyPage.module.css";

function ResolutionCard({ res }: { res: Resolution }) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [vote, setVote] = useState<AssemblyVote>(res.defaultVote ?? null);
  const cast = (v: AssemblyVote) => {
    setVote(v);
    showToast(t("marketing:annualAssembly.vote.recorded"), "success");
  };
  const cls = (v: AssemblyVote) =>
    [
      styles.voteBtn,
      vote === v &&
        styles[
          v === "yes" ? "votedYes" : v === "no" ? "votedNo" : "votedAbstain"
        ],
    ]
      .filter(Boolean)
      .join(" ");
  return (
    <div className={styles.resCard}>
      <div className={styles.resH}>
        <h3>{res.num}</h3>
        <span className={styles.resNum}>{res.threshold}</span>
      </div>
      <p className={styles.resDesc}>{res.desc}</p>
      <div className={styles.resVoteRow}>
        <button
          type="button"
          className={cls("yes")}
          onClick={() => cast("yes")}
        >
          {res.yesLabel}
        </button>
        <button type="button" className={cls("no")} onClick={() => cast("no")}>
          {t("marketing:annualAssembly.vote.noCta")}
        </button>
        <button
          type="button"
          className={cls("abstain")}
          onClick={() => cast("abstain")}
        >
          {t("marketing:annualAssembly.vote.abstainCta")}
        </button>
      </div>
      <div className={styles.resBar}>
        <span className={styles.y} style={{ width: `${res.bar.y}%` }} />
        <span className={styles.n} style={{ width: `${res.bar.n}%` }} />
        <span className={styles.a} style={{ width: `${res.bar.a}%` }} />
      </div>
      <div className={styles.resTally}>
        <span className={styles.jade}>
          {t("marketing:annualAssembly.vote.tallyYes")}{" "}
          <b>{res.tally.yes.split(" · ")[0]}</b> ·{" "}
          {res.tally.yes.split(" · ")[1]}
        </span>
        <span className={styles.accent}>
          {t("marketing:annualAssembly.vote.tallyNo")}{" "}
          <b>{res.tally.no.split(" · ")[0]}</b> · {res.tally.no.split(" · ")[1]}
        </span>
        <span>
          {t("marketing:annualAssembly.vote.tallyAbstain")}{" "}
          <b>{res.tally.abstain.split(" · ")[0]}</b> ·{" "}
          {res.tally.abstain.split(" · ")[1]}
        </span>
        {res.tally.extra}
      </div>
    </div>
  );
}

export function AgendaSection() {
  const { t } = useTranslation();
  return (
    <section className={styles.sec}>
      <h2>
        <Translation
          i18nKey="marketing:annualAssembly.agenda.title"
          components={{ em: <em /> }}
        />
      </h2>
      <p className={styles.subText}>
        {t("marketing:annualAssembly.agenda.sub")}
      </p>
      <div className={styles.agenda}>
        {AGENDA.map((a, i) => (
          <div className={styles.agRow} key={i}>
            <div className={styles.agTime}>
              {a.h}
              <em>{a.m}</em>
            </div>
            <div className={styles.agInfo}>
              <b>{a.title}</b>
              <span>{a.sub}</span>
            </div>
            <span className={`${styles.agTag} ${styles[a.tagClass]}`}>
              {a.tag}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

export function VoteSection() {
  const { t } = useTranslation();
  const [showAll, setShowAll] = useState(false);
  return (
    <section className={styles.sec} id="vote">
      <h2>
        <Translation
          i18nKey="marketing:annualAssembly.vote.title"
          components={{ em: <em /> }}
        />
      </h2>
      <p className={styles.subText}>
        <Translation
          i18nKey="marketing:annualAssembly.vote.sub"
          components={{ em: <em /> }}
        />
      </p>
      <div className={styles.quorumStrip}>
        <Translation
          i18nKey="marketing:annualAssembly.vote.quorumStrip"
          components={{ b: <b />, em: <em /> }}
        />
      </div>
      {RESOLUTIONS.map((r, i) => (
        <ResolutionCard res={r} key={i} />
      ))}
      {showAll &&
        MORE_RESOLUTIONS.map((r, i) => (
          <ResolutionCard res={r} key={`more-${i}`} />
        ))}
      {!showAll && (
        <p className={styles.showMore}>
          <button type="button" onClick={() => setShowAll(true)}>
            {t("marketing:annualAssembly.vote.showMore", {
              count: MORE_RESOLUTIONS.length,
            })}
          </button>
        </p>
      )}
    </section>
  );
}

export function AttendCard() {
  const { t } = useTranslation();
  const [stream, setStream] = useState(false);
  return (
    <div className={styles.attendCard}>
      <div>
        <h3>{t("marketing:annualAssembly.attend.title")}</h3>
        <p>{t("marketing:annualAssembly.attend.body")}</p>
      </div>
      <div className={styles.attendActions}>
        <Button href="#vote" variant="primary">
          {t("marketing:annualAssembly.attend.voteCta")}
        </Button>
        <Button
          type="button"
          variant="ghost-dark"
          onClick={() => setStream(true)}
        >
          {t("marketing:annualAssembly.attend.streamCta")}
        </Button>
      </div>
      {stream && <LiveStreamModal onClose={() => setStream(false)} />}
    </div>
  );
}

export function PastAssembliesSection() {
  const { t } = useTranslation();
  return (
    <section className={styles.sec}>
      <h2>
        <Translation
          i18nKey="marketing:annualAssembly.past.title"
          components={{ em: <em /> }}
        />
      </h2>
      <p className={styles.subText}>{t("marketing:annualAssembly.past.sub")}</p>
      {HISTORY.map((h) => (
        <div className={styles.historyRow} key={h.y}>
          <div className={styles.histY}>
            202<em>{h.y}</em>
          </div>
          <div className={styles.histInfo}>
            <b>{h.title}</b>
            <span>{h.sub}</span>
          </div>
          <Link
            className={styles.histLink}
            to={`${routes.annualAssembly}/minutes/202${h.y}`}
          >
            {t("marketing:annualAssembly.past.minutesCta")}
          </Link>
        </div>
      ))}
    </section>
  );
}
