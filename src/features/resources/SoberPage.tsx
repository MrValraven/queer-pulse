import { useState } from "react";
import { PageShell } from "../../shared/components/layout";
import { useToast } from "../../shared/components/feedback/useToast";
import { linkToPath } from "../../app/routeMap";
import styles from "./SoberPage.module.css";
import { Button } from "../../shared/components/ui";
import { REASONS, EVENTS, TYPE_CLASS } from "./soberPage.data";
import { SoberHonestSection, SoberVenuesSection, SoberVoicesSection, SoberRecoverySection } from "./SoberSections";

const SAFE_SPACES = linkToPath("QueerPulse Safe Spaces.html");
const COMMUNITIES = linkToPath("QueerPulse Communities.html");
const WELLBEING = linkToPath("QueerPulse Wellbeing.html");
const MENTORSHIP = linkToPath("QueerPulse Mentorship.html");
const RESOURCES = linkToPath("QueerPulse Resources.html");

const LINK_MAP: Record<string, string> = { COMMUNITIES, WELLBEING, MENTORSHIP, RESOURCES };

export function SoberPage() {
  const { showToast } = useToast();
  const [going, setGoing] = useState<Set<number>>(
    () => new Set(EVENTS.filter((e) => e.going).map((e) => e.id)),
  );

  return (
    <PageShell>
      <div className={styles.hero}>
        <div className="wrap">
          <div className={styles.label}>Sober &amp; social</div>
          <h1>
            A full social life, without <em>alcohol.</em>
          </h1>
          <p className={styles.lead}>
            Whether you're in recovery, sober-curious, on medication, or just don't
            drink — you shouldn't have to justify it. There's a vibrant queer social
            world that doesn't centre the bar.
          </p>
          <div className={styles.reasons}>
            {REASONS.map((r) => (
              <span key={r} className={styles.reason}>{r}</span>
            ))}
          </div>
        </div>
      </div>

      <SoberHonestSection />

      <div className={styles.sec}>
        <div className="wrap">
          <div className={styles.secHeadRow}>
            <div>
              <h2 className={styles.h}>
                Sober <em>gatherings.</em>
              </h2>
              <p className={styles.sub} style={{ marginBottom: 0 }}>
                Alcohol-free events, or events where alcohol is present but not the
                point. All QueerPulse gatherings are marked if they're alcohol-free.
              </p>
            </div>
            <button
              type="button"
              className={styles.primaryBtn}
              onClick={() => showToast("Opening host form…", "info")}
            >
              + Host a sober gathering
            </button>
          </div>
          <div className={styles.events}>
            {EVENTS.map((e) => {
              const isGoing = going.has(e.id);
              return (
                <div className={styles.event} key={e.id}>
                  <div className={styles.seDate}>
                    <span className={styles.d}>{e.d}</span>
                    <span className={styles.m}>{e.m}</span>
                  </div>
                  <div>
                    <div className={`${styles.seType} ${styles[TYPE_CLASS[e.type]]}`}>
                      {e.typeLabel}
                    </div>
                    <div className={styles.seName}>{e.name}</div>
                    <div className={styles.seMeta}>
                      {e.meta.map((m, i) => (
                        <span key={m}>{i > 0 && "· "}{m}</span>
                      ))}
                    </div>
                  </div>
                  <button
                    type="button"
                    className={[styles.seRsvp, isGoing && styles.going].filter(Boolean).join(" ")}
                    onClick={() =>
                      setGoing((prev) => {
                        const next = new Set(prev);
                        if (next.has(e.id)) next.delete(e.id);
                        else next.add(e.id);
                        return next;
                      })
                    }
                  >
                    {isGoing ? "Going ✓" : "RSVP"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <SoberVenuesSection safeSpacesPath={SAFE_SPACES} />
      <SoberVoicesSection />
      <SoberRecoverySection linkMap={LINK_MAP} />

      <section className={styles.outro}>
        <div className="wrap">
          <h2>
            You belong <em>here.</em>
          </h2>
          <p className={styles.outroSub}>
            Sober, curious, or somewhere in between. The community is big enough for
            all of it.
          </p>
          <div className={styles.outroBtns}>
            <Button to={SAFE_SPACES} variant="primary" size="lg">
              Find safe spaces
            </Button>
            <Button to={COMMUNITIES} variant="ghost-dark" size="lg">
              Browse communities
            </Button>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
