import { Link } from "react-router-dom";
import { STATS, VENUES, VOICES, RECOVERY_OPTS } from "./soberPage.data";
import styles from "./SoberPage.module.css";

interface SoberHonestSectionProps {
  children?: never;
}

export function SoberHonestSection(_props: SoberHonestSectionProps) {
  return (
    <div className={styles.honest}>
      <div className="wrap">
        <div className={styles.honestInner}>
          <div>
            <h2>
              The queer scene and <em>alcohol.</em>
            </h2>
            <p>
              Queer social life has long been organised around bars — partly for
              historical reasons (bars were where it was safe to be visible),
              partly because nightlife is genuinely important to queer culture.
              That's real and worth holding.
            </p>
            <p>
              But queer people also have significantly higher rates of harmful
              substance use than the general population — and that's not
              incidental. It's connected to minority stress, limited safe social
              spaces, and a culture that sometimes makes sobriety feel like
              opting out.
            </p>
            <p>
              This space is for people who want community and joy without alcohol
              at the centre — for any reason, no explanation required.
            </p>
          </div>
          <div className={styles.stats}>
            {STATS.map((s) => (
              <div className={styles.stat} key={s.n}>
                <div className={styles.n}>{s.n}</div>
                <div className={styles.l}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

interface SoberVenuesSectionProps {
  safeSpacesPath: string;
}

export function SoberVenuesSection({ safeSpacesPath }: SoberVenuesSectionProps) {
  return (
    <div className={`${styles.sec} ${styles.secCream}`}>
      <div className="wrap">
        <h2 className={styles.h}>
          Sober-friendly <em>spaces.</em>
        </h2>
        <p className={styles.sub}>
          Places where you can have a genuinely good time without alcohol — and
          where the staff won't make it weird. All are also on the Safe Spaces
          verified list.
        </p>
        <div className={styles.venueGrid}>
          {VENUES.map((v) => (
            <div className={styles.venueCard} key={v.name}>
              <div className={styles.vcHood}>{v.hood}</div>
              <div className={styles.vcName}>{v.name}</div>
              <div className={styles.vcDesc}>{v.desc}</div>
              <div className={styles.vcTags}>
                {v.tags.map((t) => (
                  <span key={t} className={styles.vcTag}>{t}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className={styles.seeAll}>
          <Link to={safeSpacesPath} className={styles.seeAllLink}>
            See all verified safe spaces →
          </Link>
        </div>
      </div>
    </div>
  );
}

export function SoberVoicesSection() {
  return (
    <div className={styles.sec}>
      <div className="wrap">
        <h2 className={styles.h}>
          In their <em>words.</em>
        </h2>
        <p className={styles.sub}>
          Community members on what sober queer social life actually looks like.
        </p>
        <div className={styles.voicesGrid}>
          {VOICES.map((v) => (
            <div className={styles.voiceCard} key={v.name}>
              <div className={styles.voiceQuote}>{v.quote}</div>
              <div className={styles.voiceWho}>
                <div className={styles.voiceAv} style={{ background: v.avBg, color: v.avCol }}>
                  {v.av}
                </div>
                <div>
                  <div className={styles.voiceName}>{v.name}</div>
                  <div className={styles.voiceRole}>{v.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface SoberRecoverySectionProps {
  linkMap: Record<string, string>;
}

export function SoberRecoverySection({ linkMap }: SoberRecoverySectionProps) {
  return (
    <div className={`${styles.sec} ${styles.secCream}`}>
      <div className="wrap">
        <div className={styles.recoveryBox}>
          <h3>
            If you're navigating <em>recovery.</em>
          </h3>
          <p>
            This isn't only about lifestyle preference. If you're in recovery —
            from alcohol, substances, or anything else — there are people here who
            understand. No advice unless you ask for it.
          </p>
          <div className={styles.recoveryOpts}>
            {RECOVERY_OPTS.map((o) => (
              <div className={styles.recOpt} key={o.title}>
                <div className={styles.recTitle}>{o.title}</div>
                <div className={styles.recDesc}>{o.desc}</div>
                <Link to={linkMap[o.linkKey]} className={styles.recLink}>
                  {o.linkLabel}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
