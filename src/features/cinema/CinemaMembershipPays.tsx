import { Link } from "react-router-dom";
import { Button } from "../../shared/components/ui";
import { routes } from "../../app/routeMap";
import { TIERS, LEDGER } from "./cinemaMembership.data";
import styles from "./CinemaMembershipPage.module.css";

function Check() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.6}
      strokeLinecap="round"
      aria-hidden
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
function Cross() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.6}
      strokeLinecap="round"
      aria-hidden
    >
      <line x1={18} y1={6} x2={6} y2={18} />
      <line x1={6} y1={6} x2={18} y2={18} />
    </svg>
  );
}

export function CinemaMembershipTiers() {
  return (
    <section className={styles.tiers}>
      <div className="wrap">
        <div className={styles.tiersGrid}>
          {TIERS.map((tier) => (
            <div
              key={tier.nameEm}
              className={[styles.tier, tier.featured && styles.featured]
                .filter(Boolean)
                .join(" ")}
            >
              {tier.badge && (
                <div className={styles.tierBadge}>{tier.badge}</div>
              )}
              <div className={styles.tierTag}>{tier.tag}</div>
              <div className={styles.tierName}>
                {tier.namePre}
                <em>{tier.nameEm}</em>
              </div>
              <div className={styles.tierPrice}>
                <span className={styles.amount}>{tier.amount}</span>
                <span className={styles.per}>{tier.per}</span>
              </div>
              <div className={styles.tierDesc}>{tier.desc}</div>
              <div className={styles.features}>
                {tier.features.map((f) => (
                  <div
                    key={f.text}
                    className={[styles.tf, f.yes ? styles.yes : styles.no].join(
                      " ",
                    )}
                  >
                    {f.yes ? <Check /> : <Cross />}
                    <span>{f.text}</span>
                  </div>
                ))}
              </div>
              <div className={styles.tierAction}>
                <Button variant={tier.ctaVariant} to={tier.ctaTo}>
                  {tier.cta}
                </Button>
                {tier.note && (
                  <div className={styles.tierNote}>{tier.note}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function CinemaMembershipPays() {
  return (
    <section className={styles.pays}>
      <div className="wrap">
        <div className={styles.paysH}>
          <h2>
            Where the money <em>actually</em> goes
          </h2>
          <p className="sub">
            We publish the full breakdown quarterly. Here's the headline version
            — honest numbers, updated monthly.
          </p>
        </div>
        <div className={styles.paysGrid}>
          <div className={styles.payCard}>
            <div className={`${styles.pcIcon} coral`}>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.2}
                strokeLinecap="round"
              >
                <rect x={2} y={3} width={20} height={14} rx={2} />
                <polyline points="8 21 12 17 16 21" />
              </svg>
            </div>
            <div className={styles.pcTitle}>
              Paid to <em>filmmakers</em>
            </div>
            <div className={styles.pcBody}>
              80% of every rent or buy goes directly to the filmmaker. Tips are
              100% theirs. The sustainer pool is distributed monthly by
              per-minute-watched.
            </div>
            <div className={styles.pcNum}>
              €<em>8,420</em>
            </div>
            <div className={styles.pcNumSub}>This month · to filmmakers</div>
          </div>
          <div className={styles.payCard}>
            <div className={`${styles.pcIcon} jade`}>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.2}
                strokeLinecap="round"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <div className={styles.pcTitle}>
              Commissioning <em>fund</em>
            </div>
            <div className={styles.pcBody}>
              ~20% of sustainer subscriptions goes into the commissioning pool —
              open calls, residencies, and captioning support for community
              filmmakers.
            </div>
            <div className={styles.pcNum}>
              €<em>13.2k</em>
            </div>
            <div className={styles.pcNumSub}>Available this season</div>
          </div>
          <div className={styles.payCard}>
            <div className={`${styles.pcIcon} plum`}>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.2}
                strokeLinecap="round"
              >
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx={9} cy={7} r={4} />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              </svg>
            </div>
            <div className={styles.pcTitle}>
              Curators &amp; <em>captions</em>
            </div>
            <div className={styles.pcBody}>
              The curators' council receives a quarterly stipend voted on by
              patrons. A separate captioning fund supports filmmakers who can't
              afford captioning.
            </div>
            <div className={styles.pcNum}>
              <em>6</em>
            </div>
            <div className={styles.pcNumSub}>Curators on the council</div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function CinemaMembershipLedger() {
  return (
    <section className={styles.ledger}>
      <div className="wrap">
        <div className={styles.ledgerLabel}>
          Public ledger · June 2026 · updated Monday
        </div>
        <div className={styles.ledgerInner}>
          {LEDGER.map((l) => (
            <div key={l.k} className={styles.ls}>
              <div className="k">{l.k}</div>
              <div className="v">
                {l.v.includes("€") ? (
                  <>
                    €<em>{l.v.replace("€", "")}</em>
                  </>
                ) : (
                  <em>{l.v}</em>
                )}
              </div>
              <div className="note">{l.note}</div>
            </div>
          ))}
        </div>
        <div className={styles.ledgerFoot}>
          <Link to={routes.governance}>Full public accounts →</Link>
        </div>
      </div>
    </section>
  );
}
