import { useState } from "react";
import { Link } from "react-router-dom";
import { PageShell } from "../../shared/components/layout";
import { useToast } from "../../shared/components/feedback/useToast";
import { linkToPath } from "../../app/routeMap";
import styles from "./SoberPage.module.css";
import { Button } from '../../shared/components/ui'

const SAFE_SPACES = linkToPath("QueerPulse Safe Spaces.html");
const COMMUNITIES = linkToPath("QueerPulse Communities.html");
const WELLBEING = linkToPath("QueerPulse Wellbeing.html");
const MENTORSHIP = linkToPath("QueerPulse Mentorship.html");
const RESOURCES = linkToPath("QueerPulse Resources.html");

const REASONS = ["In recovery", "Sober-curious", "Medication", "Health reasons", "Religious practice", "Personal preference", "Just don't feel like it"];

type EventType = "Social" | "Support" | "Outdoors" | "Culture";
interface SoberEvent {
  id: number;
  d: string;
  m: string;
  type: EventType;
  typeLabel: string;
  name: string;
  meta: string[];
  going?: boolean;
}
const EVENTS: SoberEvent[] = [
  { id: 1, d: "08", m: "Jun", type: "Social", typeLabel: "Alcohol-free", name: "Morning walk — Monsanto Forest Park", meta: ["🌲 Monsanto", "9:00am", "14 going"], going: true },
  { id: 2, d: "14", m: "Jun", type: "Culture", typeLabel: "Alcohol-free", name: "Book club meetup — Giovanni's Room", meta: ["☕ Linha d'Água café, Príncipe Real", "18:30", "11 going"] },
  { id: 3, d: "21", m: "Jun", type: "Support", typeLabel: "Support group", name: "Sober & Queer — weekly peer support", meta: ["📍 Online (private link sent on RSVP)", "19:00", "Recurring"] },
  { id: 4, d: "28", m: "Jun", type: "Outdoors", typeLabel: "Alcohol-free", name: "Pride picnic — alcohol-free zone", meta: ["🌳 Jardim da Estrela", "14:00–18:00", "38 going"] },
  { id: 5, d: "05", m: "Jul", type: "Social", typeLabel: "Alcohol-free", name: "Film night — Portrait of a Lady on Fire", meta: ["📍 Member's flat, Mouraria", "20:00", "8 spots left"] },
];
const TYPE_CLASS: Record<EventType, string> = {
  Social: "typeSocial",
  Support: "typeSupport",
  Outdoors: "typeOutdoors",
  Culture: "typeCulture",
};

const STATS = [
  { n: "2–3×", l: "LGBTQ+ people are 2–3x more likely to experience alcohol dependency than the general population (Public Health England, 2017)" },
  { n: "Very few", l: "queer social spaces are alcohol-free or actively sober-welcoming — despite the need" },
  { n: "This changes", l: "when community spaces deliberately include sober options — and when sober people don't have to be invisible" },
];

const VENUES = [
  { hood: "Príncipe Real", name: "Linha d'Água", desc: "A calm, queer-owned café. Excellent coffee and non-alcoholic options. Community notice board, good for a long conversation or quiet work. Fully accessible.", tags: ["Queer-owned", "No alcohol", "Accessible"] },
  { hood: "Cais do Sodré", name: "Copenhagen Coffee Lab", desc: "Speciality coffee, relaxed atmosphere, queer-staffed. A go-to for a first meeting or first date that doesn't involve alcohol. Gender-neutral bathroom.", tags: ["No alcohol", "Gender-neutral bathroom"] },
  { hood: "Bairro Alto", name: "ZDB — Zé dos Bois", desc: "Arts venue with exhibitions, performances, and events. Alcohol is served but never the focus — many events are entirely sober in practice. Consistently queer-safe.", tags: ["Alcohol present", "Never the focus", "Arts-led"] },
  { hood: "Mouraria", name: "Chapitô", desc: "Restaurant and cultural space with terrace views. Good non-alcoholic drinks menu, not just water and Coke. Staff don't push alcohol. Popular for community dinners.", tags: ["Good NA menu", "Community dinners"] },
];

const VOICES = [
  { quote: '"I thought getting sober would mean losing the community. It turned out I found a deeper one — people who show up because they want to, not because the bar is there."', av: "ML", avBg: "rgba(232,119,90,.15)", avCol: "var(--accent-ink)", name: "Mariana Loução", role: "3 years sober · Clinical Psychologist" },
  { quote: '"I don\'t drink for health reasons, not recovery — but the reaction is often the same. Having spaces where it just isn\'t the question is a relief I can\'t fully describe."', av: "RP", avBg: "rgba(74,140,111,.15)", avCol: "var(--jade)", name: "Rafael Pinto", role: "Illustrator · Graça" },
  { quote: '"The morning walk group changed things for me. I\'d been so isolated — not because I didn\'t want connection, but because every social option seemed to start at midnight in a bar."', av: "CF", avBg: "rgba(45,27,61,.1)", avCol: "var(--plum)", name: "Catarina Faria", role: "Architect · Estrela" },
];

const RECOVERY_OPTS = [
  { title: "Sober & Queer peer group", desc: "A private, moderated space within QueerPulse for people in recovery. Weekly online meeting, text channel, and occasional in-person gatherings. No particular programme — all approaches welcome.", link: { label: "Join the group →", href: COMMUNITIES } },
  { title: "One-to-one — talk to a peer", desc: "Request a conversation with a community member who has offered to talk to people navigating sobriety. No counsellors — just someone who's been through something similar.", link: { label: "Find a peer →", href: MENTORSHIP } },
  { title: "Queer-affirming therapists", desc: "The wellbeing directory includes therapists who specialise in addiction and queer identity — because those two things aren't separate.", link: { label: "Find a therapist →", href: WELLBEING } },
  { title: "External resources", desc: "APDES (harm reduction), AAPT (AA Portugal), SMART Recovery Portugal — for when community support isn't enough on its own.", link: { label: "See resources →", href: RESOURCES } },
];

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
              <span key={r} className={styles.reason}>
                {r}
              </span>
            ))}
          </div>
        </div>
      </div>

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
                        <span key={m}>
                          {i > 0 && "· "}
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button
                    type="button"
                    className={[styles.seRsvp, isGoing && styles.going]
                      .filter(Boolean)
                      .join(" ")}
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
                    <span key={t} className={styles.vcTag}>
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className={styles.seeAll}>
            <Link to={SAFE_SPACES} className={styles.seeAllLink}>
              See all verified safe spaces →
            </Link>
          </div>
        </div>
      </div>

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
                  <Link to={o.link.href} className={styles.recLink}>
                    {o.link.label}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

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
