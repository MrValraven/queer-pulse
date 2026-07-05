import { Link } from "react-router-dom";
import { Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { routes } from "../../app/routeMap";
import { StudioShell } from "./StudioShell";
import { DEALS, LICENCES } from "./studioTerms.data";
import s from "./studioTerms.module.css";

const checkIcon = (
  <svg
    viewBox="0 0 20 20"
    fill="none"
    stroke="currentColor"
    strokeWidth={2.4}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <path d="M4 10.5l4 4 8-9" />
  </svg>
);

const xIcon = (
  <svg
    viewBox="0 0 20 20"
    fill="none"
    stroke="currentColor"
    strokeWidth={2.4}
    strokeLinecap="round"
    aria-hidden
  >
    <path d="M5 5l10 10M15 5L5 15" />
  </svg>
);

export function StudioTermsPage() {
  const { showToast } = useToast();

  return (
    <StudioShell hidePlayer>
      <div className={s.wrap}>
        <div className={s.pageH}>
          <div className={s.eb}>
            The fine print, in plain Portuguese-English
          </div>
        </div>

        <div className={s.hero}>
          <div className={s.eb}>Trust &amp; terms</div>
          <h1>
            The deal, written so you can <em>actually read it</em>.
          </h1>
          <p className={s.lede}>
            The full legal terms exist and a lawyer wrote them. But here&rsquo;s
            the whole thing in plain language first —{" "}
            <em>
              because a co-op you can&rsquo;t understand isn&rsquo;t really
              yours
            </em>
            .
          </p>
        </div>

        <div className={s.deal}>
          {DEALS.map((d, i) => (
            <div key={i} className={s.dealCard}>
              <div className={s.ic}>{d.icon}</div>
              <h4>{d.title}</h4>
              <p>{d.body}</p>
            </div>
          ))}
        </div>

        <section className={s.sec}>
          <div className={s.num}>01 — the co-op deed</div>
          <h2>
            What it means that you <em>own</em> this.
          </h2>
          <p>
            QueerPulse Studio is a registered co-operative. Members — listeners
            and artists — are the owners, not the customers. That isn&rsquo;t
            branding: it&rsquo;s a legal structure with a deed you can read,
            that binds the people running it.
          </p>
          <p>
            The deed fixes three things the people in charge{" "}
            <strong>cannot quietly change</strong>: the 80% artist floor, the
            100% tip pass-through, and the public ledger. Altering the floor
            downward needs a two-thirds supermajority of the whole membership.
            The council is{" "}
            <em>elected, term-limited, and paid on the ledger</em>. There are no
            founder shares and no investor veto.
          </p>
          <div className={s.pull}>
            If we ever start acting like a company that happens to have nice
            values, the deed is what you hold us to.
          </div>
          <p className={s.muted}>
            The full deed and the co-op&rsquo;s annual accounts are published
            every year alongside the{" "}
            <Link to={routes.governance}>transparency report</Link>.
          </p>
        </section>

        <section className={s.sec}>
          <div className={s.num}>02 — licences</div>
          <h2>
            What you can <em>do</em> with the music.
          </h2>
          <p>
            Every release names its licence, picked by the artist. Here&rsquo;s
            what each one means for you as a listener — and for anyone who wants
            to reuse the work in a set, a film, or a remix.
          </p>
          <div className={s.licGrid}>
            {LICENCES.map((lic) => (
              <div key={lic.code} className={s.lic}>
                <div className={s.code}>{lic.code}</div>
                <h4>{lic.title}</h4>
                <ul>
                  {lic.rows.map((row, i) => (
                    <li key={i} className={row.ok ? s.yes : s.no}>
                      {row.ok ? checkIcon : xIcon}
                      <span>{row.label}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className={s.muted}>
            DJ sets are special: a set can include tracks under different
            licences, and our matcher routes each track&rsquo;s payout to its
            own artist. <em>Covers are allowed</em>; mechanical royalties are
            handled through a Portuguese collecting partner, and we don&rsquo;t
            pay synchronisation — so clearing a cover for film use is on you.
          </p>
        </section>

        <section className={s.sec}>
          <div className={s.num}>03 — privacy, briefly</div>
          <h2>
            What we <em>hold</em>, and what we don&rsquo;t.
          </h2>
          <p>
            We hold your account, your saves, your receipts, and whatever you
            explicitly turn on. We do <strong>not</strong> hold a profile of
            your taste to sell, a history you didn&rsquo;t ask us to keep, or
            anything we&rsquo;d hand to an advertiser — because we don&rsquo;t
            have advertisers.
          </p>
          <p className={s.muted}>
            Aggregate, de-identified play counts feed the public ledger so
            artists get paid and the numbers are auditable. You can export
            everything we hold, or erase it, from{" "}
            <Link to="/studio/settings">Settings → Erase &amp; exit</Link> —
            instantly, no modal, no undo needed because we mean it.
          </p>
        </section>

        <div className={s.meta}>
          <div className={s.mt}>
            <h4>The long versions</h4>
            <p>
              terms v3.2 · privacy v2.1 · co-op deed 2024 · last updated 2 Jun
              2026
            </p>
          </div>
          <Button
            variant="ghost-dark"
            onClick={() => showToast("Opening the full legal terms…", "info")}
          >
            Read full terms
          </Button>
          <Button
            variant="ghost-dark"
            onClick={() => showToast("Opening the co-op deed…", "info")}
          >
            Read the deed
          </Button>
        </div>
      </div>
    </StudioShell>
  );
}
