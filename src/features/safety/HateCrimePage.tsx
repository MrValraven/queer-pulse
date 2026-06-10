import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { PageShell } from "../../shared/components/layout";
import { linkToPath } from "../../app/routeMap";
import styles from "./HateCrimePage.module.css";
import { Button } from '../../shared/components/ui'

type TabId = "immediate" | "document" | "report" | "support" | "law";
type TagKind = "immediate" | "optional" | "recommended";

type Block =
  | { kind: "preamble"; text: ReactNode }
  | { kind: "sectionHead"; node: ReactNode }
  | { kind: "note"; text: string }
  | { kind: "step"; num: number; title: string; desc: string; tag?: { label: string; kind: TagKind }; link?: { label: string; href: string } }
  | { kind: "def"; h4: string; paras: string[] };

const MENTAL = linkToPath("QueerPulse Mental Health.html");
const FORUM = linkToPath("QueerPulse Forum.html");
const LEGAL = linkToPath("QueerPulse Legal.html");

const TABS: { id: TabId; label: string }[] = [
  { id: "immediate", label: "Right now" },
  { id: "document", label: "Document it" },
  { id: "report", label: "Report formally" },
  { id: "support", label: "Get support" },
  { id: "law", label: "Portuguese law" },
];

const TAG_CLASS: Record<TagKind, string> = {
  immediate: "tagImmediate",
  optional: "tagOptional",
  recommended: "tagRecommended",
};

const PANELS: Record<TabId, Block[]> = {
  immediate: [
    { kind: "preamble", text: "The moments after an incident are disorienting. These steps help you protect yourself and preserve your options — without committing to anything yet." },
    { kind: "step", num: 1, title: "Get to safety", desc: "Leave the location if you can. Find a public space, a shop, a café, or somewhere you know. Do not feel obligated to confront the perpetrator or wait for anyone.", tag: { label: "Immediate", kind: "immediate" } },
    { kind: "step", num: 2, title: "Contact someone you trust", desc: "Call or message a friend, partner, or community member. You should not be alone right now. If no one is available, APAV's victim support line (116 006) is staffed 24 hours.", tag: { label: "Immediate", kind: "immediate" } },
    { kind: "step", num: 3, title: "Get medical attention if needed", desc: "If you were physically assaulted, go to the nearest hospital emergency room. Ask them to document your injuries — this documentation is evidence, even if you do not report to police.", tag: { label: "If physically hurt", kind: "immediate" } },
    { kind: "step", num: 4, title: "Write down what happened — now", desc: "While it is fresh: time, location, what was said or done, description of the perpetrator(s), any witnesses. Do this before you sleep. Memory degrades quickly after trauma. Use your phone notes if that is easiest.", tag: { label: "Recommended", kind: "recommended" } },
    { kind: "step", num: 5, title: "Preserve any evidence", desc: "Screenshots of messages. Photographs of damage or injuries. Do not wash clothes worn during the incident. Back up your phone if messages were involved.", tag: { label: "Recommended", kind: "recommended" } },
  ],
  document: [
    { kind: "preamble", text: "Good documentation gives you options. You can decide later whether to report formally — but the evidence will only exist if you collect it now." },
    { kind: "sectionHead", node: <>What to <em>collect</em></> },
    { kind: "step", num: 1, title: "Written account", desc: "Date, time, exact location. What was said or done, in as much detail as you remember. The perpetrator's appearance and any distinguishing features. Whether there were witnesses and who they were." },
    { kind: "step", num: 2, title: "Photographs", desc: "Injuries (dated photographs from multiple angles). Damage to property. The location itself. Any graffiti or materials left behind. Turn on location tagging in your phone camera before you take them." },
    { kind: "step", num: 3, title: "Digital evidence", desc: "Screenshots of messages, social media posts, or emails — including the URL, username, and timestamp visible. Screenshot the profile too, not just the message. Save locally and to cloud storage." },
    { kind: "step", num: 4, title: "CCTV", desc: "If the incident happened in a commercial area, there may be CCTV footage. Act quickly — most systems overwrite after 72 hours. You can request the footage yourself or ask police to do so when you report." },
    { kind: "step", num: 5, title: "Witness information", desc: "If there were witnesses, ask for their contact details. Even a name and phone number helps. You do not need to pressure anyone — just ask.", tag: { label: "If applicable", kind: "optional" } },
    { kind: "sectionHead", node: <>Where to <em>keep it</em></> },
    { kind: "note", text: "Store everything in at least two places — your phone and a cloud service (email to yourself works). If you contact ILGA Portugal or APAV, they can help you organise your evidence file." },
  ],
  report: [
    { kind: "preamble", text: "You have options. Formal police reporting is one path — but not the only one. You can also report anonymously through civil society organisations, or choose not to report at all. Your choice is valid regardless." },
    { kind: "sectionHead", node: <>Option 1: <em>PSP / GNR (Police)</em></> },
    { kind: "step", num: 1, title: "Go to your nearest police station", desc: "For hate crimes in Lisbon, the PSP (Polícia de Segurança Pública) has jurisdiction. You can report in person or online at queixaselectronicas.mai.gov.pt for less serious offences." },
    { kind: "step", num: 2, title: "Ask for hate crime classification", desc: "Explicitly state that the crime was motivated by your sexual orientation or gender identity. Ask for it to be recorded as a hate crime (crime de ódio) under Article 132 of the Penal Code. Police may not do this automatically.", tag: { label: "Important", kind: "immediate" } },
    { kind: "step", num: 3, title: "Take accompaniment", desc: "You are allowed to bring a support person. ILGA Portugal offers free legal accompaniment for hate crime reports. Contact them before you go — even 30 minutes of preparation helps.", tag: { label: "Strongly recommended", kind: "recommended" } },
    { kind: "sectionHead", node: <>Option 2: <em>ILGA Portugal</em></> },
    { kind: "step", num: 1, title: "Report directly to ILGA", desc: "ILGA maintains its own hate crime monitoring system (independently of police). Reporting here is confidential and does not trigger automatic police contact. Your report contributes to advocacy and data.", tag: { label: "Anonymous option available", kind: "recommended" } },
    { kind: "step", num: 2, title: "Legal support and accompaniment", desc: "If you want to report to police, ILGA can provide a volunteer or staff member to accompany you. They also offer legal guidance on what to expect from the process and how to assert your rights." },
    { kind: "sectionHead", node: <>Option 3: <em>EU mechanisms</em></> },
    { kind: "step", num: 1, title: "Provedor de Justiça (Ombudsman)", desc: "If you believe authorities have failed to act on your report, you can complain to Portugal's Ombudsman (Provedor de Justiça) at provedor-jus.pt. Free, independent, and available to residents." },
    { kind: "step", num: 2, title: "European Court of Human Rights", desc: "For serious cases where all domestic remedies are exhausted, the ECHR at Strasbourg can be petitioned. This is a long process — ILGA Europe provides guidance and in some cases legal support.", tag: { label: "After domestic process", kind: "optional" } },
  ],
  support: [
    { kind: "preamble", text: "Reporting is not the only thing you need. Being the target of hate is traumatic — and that trauma is real regardless of whether a crime can be proven." },
    { kind: "sectionHead", node: <>Immediate <em>support</em></> },
    { kind: "step", num: 1, title: "APAV — Victim Support", desc: "Free, confidential support for crime victims. Emotional support, practical help navigating the system, and legal information. 116 006 — available nationally. Online support at apav.pt." },
    { kind: "step", num: 2, title: "ILGA Portugal — Community support", desc: "Beyond legal help, ILGA connects you with peer support and counselling. They understand the specific dimensions of LGBTQ+ hate crime. 213 887 615 · ilga-portugal.pt." },
    { kind: "step", num: 3, title: "QueerPulse Mental Health directory", desc: "Sliding-scale therapists with experience in trauma and identity-based violence. You do not have to wait to feel better — early support makes a real difference.", link: { label: "See the directory →", href: MENTAL } },
    { kind: "sectionHead", node: <>Longer <em>term</em></> },
    { kind: "step", num: 4, title: "Peer support groups", desc: "ILGA Portugal runs monthly peer groups for people who have experienced hate crime. Sharing with others who have been through similar experiences is often the most useful thing. Ask ILGA for the current schedule." },
    { kind: "step", num: 5, title: "You do not have to process it alone", desc: "The QueerPulse forum has a private, moderated space for people who have experienced discrimination or violence. You can share as much or as little as you want.", link: { label: "Go to the forum →", href: FORUM } },
  ],
  law: [
    { kind: "preamble", text: "Understanding what the law actually says helps you assert your rights — and know when they are being violated." },
    { kind: "def", h4: "What is a hate crime under Portuguese law?", paras: ["Under Article 132 of the Penal Code (Código Penal), a crime committed with hate motivation — including sexual orientation and gender identity — is an aggravating circumstance. This means the same act (assault, damage, harassment) carries a higher sentence when proven to be motivated by hatred of the victim's identity.", "Additionally, the Lei contra a discriminação (Law 93/2017) prohibits discrimination based on sexual orientation and gender identity in access to goods, services, housing, and employment."] },
    { kind: "def", h4: "What counts as a hate crime?", paras: ["Physical assault, threats, harassment, intimidation, property damage, incitement to hatred, and online abuse can all be hate crimes when motivated by the victim's sexual orientation or gender identity. The motivation must be established — which is why documentation and the way you frame your report matter."] },
    { kind: "def", h4: "Online hate crimes", paras: ["Threats and harassment online are crimes in Portugal. Report to the platform AND to police. Preserve screenshots immediately — platforms delete reported content and perpetrators can delete their accounts. You can also report to the Autoridade Nacional de Comunicações (ANACOM) for persistent platform inaction."] },
    { kind: "def", h4: "If the police don't take it seriously", paras: ["You have the right to ask for a different officer. You can escalate within the PSP to a supervisor. You can contact the Inspeção-Geral da Administração Interna (IGAI) to complain about police conduct. ILGA Portugal accompaniment helps prevent this situation. Your report cannot be refused — you are entitled to a receipt (NUIPC number) when you make a formal complaint."] },
  ],
};

export function HateCrimePage() {
  const [tab, setTab] = useState<TabId>("immediate");

  return (
    <PageShell>
      <header className={styles.hero}>
        <div className="wrap">
          <div className={styles.eye}>Reporting guide · Portugal</div>
          <h1 className={styles.title}>
            How to report
            <br />
            <em>a hate crime.</em>
          </h1>
          <p className={styles.sub}>
            Step-by-step — from the moment it happens to formal reporting, community
            support, and legal follow-up. Most people don't report because they
            don't know how. This guide removes that barrier.
          </p>
          <div className={styles.important}>
            <p>
              <strong>Your safety comes first.</strong> If you are in immediate
              danger, call <strong>112</strong> now. This guide is for after you are
              safe.
            </p>
          </div>
        </div>
      </header>

      <div className={styles.tabBar}>
        <div className={styles.tbInner}>
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              className={[styles.tabBtn, tab === t.id && styles.tabBtnActive]
                .filter(Boolean)
                .join(" ")}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <main className={styles.body}>
        <div className="wrap">
          <div className={styles.layout}>
            <div>
              {PANELS[tab].map((b, i) => {
                if (b.kind === "preamble")
                  return (
                    <p className={styles.preamble} key={i}>
                      {b.text}
                    </p>
                  );
                if (b.kind === "sectionHead")
                  return (
                    <div className={styles.sectionHead} key={i}>
                      {b.node}
                    </div>
                  );
                if (b.kind === "note")
                  return (
                    <p className={styles.note} key={i}>
                      {b.text}
                    </p>
                  );
                if (b.kind === "def")
                  return (
                    <div className={styles.defBox} key={i}>
                      <h4>{b.h4}</h4>
                      {b.paras.map((p, j) => (
                        <p key={j}>{p}</p>
                      ))}
                    </div>
                  );
                return (
                  <div className={styles.hcs} key={i}>
                    <div className={styles.hcsNum}>{b.num}</div>
                    <div className={styles.hcsBody}>
                      <div className={styles.hcsTitle}>{b.title}</div>
                      <div className={styles.hcsDesc}>{b.desc}</div>
                      {b.tag && (
                        <span className={`${styles.hcsTag} ${styles[TAG_CLASS[b.tag.kind]]}`}>
                          {b.tag.label}
                        </span>
                      )}
                      {b.link && (
                        <Link to={b.link.href} className={styles.hcsLink}>
                          {b.link.label}
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <aside className={styles.sidebar}>
              <div className={styles.sbCard}>
                <div className={styles.sbcTitle}>Emergency &amp; immediate</div>
                <div className={styles.sbcItem}>
                  <div className={styles.sbcOrg}>Emergency services</div>
                  <div className={styles.sbcNum}>112</div>
                </div>
                <div className={styles.sbcItem}>
                  <div className={styles.sbcOrg}>APAV Victim Support</div>
                  <div className={styles.sbcRole}>24h confidential</div>
                  <div className={styles.sbcNum}>116 006</div>
                </div>
                <div className={styles.sbcItem}>
                  <div className={styles.sbcOrg}>SOS Racismo (also covers identity)</div>
                  <div className={styles.sbcNum}>21 314 85 82</div>
                </div>
              </div>
              <div className={styles.sbCard}>
                <div className={styles.sbcTitle}>Legal &amp; advocacy</div>
                <div className={styles.sbcItem}>
                  <div className={styles.sbcOrg}>ILGA Portugal</div>
                  <div className={styles.sbcRole}>Free legal accompaniment, hate crime monitoring</div>
                  <div className={styles.sbcNum}>213 887 615</div>
                  <span className={styles.sbcAnon}>Anonymous reporting</span>
                </div>
                <div className={styles.sbcItem}>
                  <div className={styles.sbcOrg}>Provedor de Justiça</div>
                  <div className={styles.sbcRole}>Ombudsman — if authorities fail to act</div>
                  <div className={styles.sbcNum}>provedor-jus.pt</div>
                </div>
                <div className={styles.sbcItem}>
                  <div className={styles.sbcOrg}>ILGA Europe</div>
                  <div className={styles.sbcRole}>EU-level legal support</div>
                  <div className={styles.sbcNum}>ilga-europe.org</div>
                </div>
              </div>
              <div className={styles.sbCard}>
                <div className={styles.sbcTitle}>On QueerPulse</div>
                <div className={styles.sbcItem}>
                  <Link to={LEGAL} className={styles.sbcLink}>Legal Resources →</Link>
                </div>
                <div className={styles.sbcItem}>
                  <Link to={MENTAL} className={styles.sbcLink}>Mental Health →</Link>
                </div>
                <div className={styles.sbcItem}>
                  <Link to={linkToPath("QueerPulse Solidarity.html")} className={styles.sbcLink}>
                    Solidarity Pricing →
                  </Link>
                </div>
                <div className={styles.sbcItem}>
                  <Link to={linkToPath("QueerPulse Report.html")} className={styles.sbcLink}>
                    Report to QueerPulse →
                  </Link>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>

      <section className={styles.outro}>
        <div className="wrap">
          <h2>
            You have <em>rights.</em>
          </h2>
          <p className={styles.outroSub}>
            The QueerPulse community includes lawyers, legal professionals, and
            people who have been through this process. You do not have to navigate
            it alone.
          </p>
          <Button to={LEGAL} variant="primary" size="lg">
            Legal resources
          </Button>
        </div>
      </section>
    </PageShell>
  );
}
