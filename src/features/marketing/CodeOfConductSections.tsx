import { Link } from "react-router-dom";
import { Button } from "../../shared/components/ui";
import { PACT, LADDER } from "./codeOfConductPage.data";
import styles from "./CodeOfConductPage.module.css";

export function CocPactSection() {
  return (
    <>
      <section className={styles.sec} id="scope">
        <div className={styles.secNum}>
          §<em>01</em>
        </div>
        <h2>
          Where this <em>applies.</em>
        </h2>
        <p>
          This Code applies to <strong>every member</strong> across{" "}
          <strong>every QueerPulse space</strong>: the website, the app,
          gatherings, the magazine's contributor channels, direct messages, and
          any off-platform space the organisation hosts (Discord rooms,
          retreats, mailing lists).
        </p>
        <p>
          It also applies to <em>off-platform conduct</em> when that conduct
          materially affects QueerPulse members — see §06.
        </p>
        <p>
          It does <em>not</em> apply to your private life, your politics
          elsewhere, your other identities online, or anything you do
          off-platform that doesn't touch this community.
        </p>
      </section>

      <section className={styles.sec} id="pact">
        <div className={styles.secNum}>
          §<em>02</em>
        </div>
        <h2>
          The six things you <em>must not do.</em>
        </h2>
        <p>
          If you do any of these, expect a moderation action. We have removed
          people for each of these. We will remove people again.
        </p>
        <div className={styles.pactList}>
          {PACT.map((p) => (
            <div className={styles.pactRow} key={p.n}>
              <div className={styles.pactNum}>
                {p.n[0]}
                <em>{p.n[1]}</em>
              </div>
              <div>
                <b>{p.title}</b>
                <p>{p.body}</p>
              </div>
            </div>
          ))}
        </div>
        <p>
          The first five are obvious. The sixth is the one that catches the most
          thoughtful people — please read it carefully. The platform's value is
          built on members trusting each other; using your member access against
          another member is treated as a foundational violation.
        </p>
      </section>
    </>
  );
}

export function CocHarmSection() {
  return (
    <section className={styles.sec} id="harm">
      <div className={styles.secNum}>
        §<em>03</em>
      </div>
      <h2>
        What we mean by <em>harm</em>, and what we don't.
      </h2>
      <h3>Harm we will act on</h3>
      <ul className={styles.list}>
        <li>
          <b>Personal attacks</b> directed at individual members.
        </li>
        <li>
          <b>Sustained harassment</b> — three or more interactions a member has
          asked stop.
        </li>
        <li>
          <b>Doxxing</b> of any member, including by linking pseudonyms.
        </li>
        <li>
          <b>Intimidation</b> — threats, dog-whistles, mob tagging.
        </li>
        <li>
          <b>Bad-faith framing</b> of community members in external press
          without consent.
        </li>
      </ul>
      <h3>Friction we won't moderate</h3>
      <ul className={styles.list}>
        <li>
          <b>Disagreement.</b> Including loud, sharp, public disagreement.{" "}
          <em>We have removed posts for this and been wrong</em> — see our 2025
          transparency report.
        </li>
        <li>
          <b>Hurt feelings.</b> A post making you uncomfortable doesn't, on its
          own, breach this Code.
        </li>
        <li>
          <b>Criticism of QueerPulse</b> — the organisation, its decisions, its
          founders. Criticise away.
        </li>
        <li>
          <b>Different political views</b> within the broader queer movement.
          Coalition is not consensus.
        </li>
      </ul>
      <p>
        <em>We will get the line wrong sometimes.</em> When we do, our appeals
        process is fast and the next year's transparency report will name the
        mistake.
      </p>
    </section>
  );
}

export function CocEnforceSection() {
  return (
    <section className={styles.sec} id="enforce">
      <div className={styles.secNum}>
        §<em>04</em>
      </div>
      <h2>
        What happens if you <em>break this.</em>
      </h2>
      <p>
        Moderation is a ladder. We start at the lowest rung that fits the
        situation. We can skip rungs if the violation is severe (§02·03, §02·05
        typically skip directly to suspension).
      </p>
      <div className={styles.ladder}>
        {LADDER.map((l, i) => (
          <div className={styles.ladderStep} key={l.n}>
            <div
              className={[styles.ladderN, i >= 3 && styles.ladderNPlum]
                .filter(Boolean)
                .join(" ")}
            >
              {l.n}
            </div>
            <div>
              <b>{l.title}</b>
              <p>{l.body}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

interface CocReportCtaProps {
  reportPath: string;
  emergencyPath: string;
  onCrisisChat: () => void;
}

export function CocReportCta({
  reportPath,
  emergencyPath,
  onCrisisChat,
}: CocReportCtaProps) {
  return (
    <div className={styles.reportCta}>
      <h3>
        Something happened. <em>What do I do?</em>
      </h3>
      <p>
        Report it. Reports are read by a real human within 6 hours (median 4.2h
        in 2025). Anonymous reports are accepted; signed reports get a written
        response.
      </p>
      <div className={styles.reportActions}>
        <Button to={reportPath} variant="primary">
          File a report
        </Button>
        <Button type="button" variant="ghost-dark" onClick={onCrisisChat}>
          Or talk to crisis chat first
        </Button>
        <Button to={emergencyPath} variant="ghost-dark">
          Emergency · 112
        </Button>
      </div>
    </div>
  );
}

interface CocChangesProps {
  changelogPath: string;
  onDownload: () => void;
}

export function CocChangesSection({
  changelogPath,
  onDownload,
}: CocChangesProps) {
  return (
    <>
      <section className={styles.sec} id="appeal">
        <div className={styles.secNum}>
          §<em>05</em>
        </div>
        <h2>
          Appeals — <em>how to push back.</em>
        </h2>
        <p>
          Every action above rung 1 can be appealed. Appeals are read by a
          different moderator than the one who decided.{" "}
          <strong>
            Appeals overturn the original decision about 11% of the time
          </strong>{" "}
          — we publish that number annually.
        </p>
        <p>
          Appeals filed within <strong>7 days</strong> get a written response
          within <strong>5 working days</strong>. We do not "ghost" appeals.
        </p>
      </section>

      <section className={styles.sec} id="offplatform">
        <div className={styles.secNum}>
          §<em>06</em>
        </div>
        <h2>
          Off-platform <em>conduct.</em>
        </h2>
        <p>
          We are reluctant to police what members do elsewhere. But we will act
          on off-platform conduct in two cases:
        </p>
        <ul className={styles.list}>
          <li>
            <b>When it materially affects QueerPulse members.</b> Posting member
            photos publicly, doxxing on other platforms, real-world harassment
            of someone you met here.
          </li>
          <li>
            <b>
              When it reveals identity-level violations that would breach §02.
            </b>{" "}
            A member running, say, a public TERF account is welcome to disagree
            about gender publicly — but if that account has been targeting
            individual trans members, that is a §02 violation regardless of
            where it lives.
          </li>
        </ul>
        <p>
          We do not act on: your politics, your relationship history, your work,
          your other identities, things you said before joining, things adjacent
          to people you know. The bar is{" "}
          <em>material harm to QueerPulse members</em>, not "we read your other
          account and disagree".
        </p>
      </section>

      <section className={styles.sec} id="changes">
        <div className={styles.secNum}>
          §<em>07</em>
        </div>
        <h2>
          Changes &amp; <em>versioning.</em>
        </h2>
        <p>
          This Code is a v2.1 document, published 14 January 2026, ratified at
          the 2025 Annual Assembly. Substantive changes require a 14-day comment
          period and an Assembly vote. Editorial changes (clarifying wording,
          fixing typos) require only a moderator sign-off and are listed in the
          changelog.
        </p>
        <ul className={styles.list}>
          <li>
            <b>v2.1 · Jan 2026:</b> Added §06 (off-platform conduct) after the
            November 2025 assembly. Clarified §02·04 reclaimed-use exception.
          </li>
          <li>
            <b>v2.0 · Aug 2025:</b> Restructured into the current six-pact
            format. Renamed from "Member Agreement" to "Code of Conduct".
          </li>
          <li>
            <b>v1.4 · Mar 2025:</b> Added appeals SLA.
          </li>
          <li>
            <b>v1.0 · Mar 2024:</b> First version, drafted with eight founding
            members.
          </li>
        </ul>
        <p>
          For the full change history with marked-up diffs, see{" "}
          <Link to={changelogPath}>the Changelog</Link>.
        </p>
      </section>

      <div className={styles.version}>
        <b>Code of Conduct v2.1</b> · ratified at the 2025 Annual Assembly · 14
        Jan 2026 · <a onClick={onDownload}>Download PDF</a> · Read the Manifesto
      </div>
    </>
  );
}
