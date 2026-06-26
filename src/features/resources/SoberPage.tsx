import { useState } from "react";
import { FiCheck } from "react-icons/fi";
import { PageShell } from "../../shared/components/layout";
import { routes } from "../../app/routeMap";
import styles from "./SoberPage.module.css";
import { Button, Outro } from "../../shared/components/ui";
import { REASONS, EVENTS, TYPE_CLASS } from "./soberPage.data";
import { SoberHonestSection, SoberVenuesSection, SoberVoicesSection, SoberRecoverySection } from "./SoberSections";
import { SoberHostModal } from "./SoberHostModal";

const SAFE_SPACES = routes.safeSpaces;
const COMMUNITIES = routes.communities;
const WELLBEING = routes.wellbeing;
const MENTORSHIP = routes.mentorship;
const RESOURCES = routes.resources;

const LINK_MAP: Record<string, string> = { COMMUNITIES, WELLBEING, MENTORSHIP, RESOURCES };

export function SoberPage() {
  const [hostOpen, setHostOpen] = useState(false);
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
              onClick={() => setHostOpen(true)}
            >
              + Host or attend a meeting
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
                        <span key={m.text}>
                          {i > 0 && "· "}
                          {m.icon && <m.icon />} {m.text}
                        </span>
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
                    {isGoing ? <>Going <FiCheck /></> : "RSVP"}
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

      <Outro
        title={<>You belong <em>here.</em></>}
        sub="Sober, curious, or somewhere in between. The community is big enough for all of it."
      >
        <Button to={SAFE_SPACES} variant="primary" size="lg">
          Find safe spaces
        </Button>
        <Button to={COMMUNITIES} variant="ghost-dark" size="lg">
          Browse communities
        </Button>
      </Outro>

      {hostOpen && <SoberHostModal onClose={() => setHostOpen(false)} />}
    </PageShell>
  );
}
