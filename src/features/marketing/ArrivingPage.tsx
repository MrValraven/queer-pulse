import { Link } from "react-router-dom";
import { PageShell } from "../../shared/components/layout";
import { linkToPath } from "../../app/routeMap";
import styles from "./ArrivingPage.module.css";
import { Button } from '../../shared/components/ui'

const CHANGEMAKERS = linkToPath("QueerPulse Changemakers.html");
const VOLUNTEER = linkToPath("QueerPulse Volunteer.html");
const PLATFORMS = linkToPath("QueerPulse Platforms.html");
const COMMUNITIES = linkToPath("QueerPulse Communities.html");

interface Hood {
  tag: string;
  tagColor: string;
  tagBg: string;
  name: string;
  desc: string;
  note: string;
}
const HOODS: Hood[] = [
  { tag: "Social · Creative", tagColor: "var(--accent-ink)", tagBg: "rgba(232,119,90,.1)", name: "Príncipe Real", desc: "The heart of queer social life in Lisbon. Beautiful garden square, wine bars, independent bookshops, and a high concentration of queer creatives. Most visible, most welcoming. Start here.", note: "QueerPulse members here: Inês Tavares (designer), among others" },
  { tag: "Activism · Community", tagColor: "var(--plum)", tagBg: "rgba(45,27,61,.08)", name: "Mouraria", desc: "A neighbourhood that has always welcomed the outsider. Fado roots, immigrant community, and the most active queer community organising in the city. Home to the Housing Justice Network.", note: "Where the Queer Supper Club runs, and where Catarina Vaz organises" },
  { tag: "Nightlife · Arts", tagColor: "var(--jade)", tagBg: "rgba(74,140,111,.1)", name: "Bairro Alto", desc: "The nightlife neighbourhood. Small bars, independent music venues, late nights, and a long queer history. Where queer Lisbon goes to dance. Lively after 10pm, quiet in the morning.", note: "Diogo Vasques (music producer) is based here" },
  { tag: "Creative · Riverside", tagColor: "var(--accent-ink)", tagBg: "rgba(232,119,90,.1)", name: "Cais do Sodré", desc: "Creative energy by the river. Formerly the rough end of the city, now full of independent studios, cultural spaces, and the Pink Street. Where new Lisbon meets old Lisbon. André's darkroom is here.", note: "Home to the Pink Street — Lisbon's most famous queer bar strip" },
  { tag: "Growing · Affordable", tagColor: "var(--jade)", tagBg: "rgba(74,140,111,.1)", name: "Arroios", desc: "More affordable, more diverse, and rapidly growing as a hub for queer newcomers and creatives priced out of Príncipe Real. Excellent food, tight community. If you're just arriving, look here for housing.", note: "One of the most diverse neighbourhoods in the city" },
  { tag: "Industrial · New Lisbon", tagColor: "var(--plum)", tagBg: "rgba(45,27,61,.08)", name: "Marvila", desc: "Warehouses, studios, and a quieter kind of creative life. Further out but increasingly the home of people who want space to make things. Rui Marçal runs his infrastructure studio here.", note: "Good for studios and larger living spaces at lower cost" },
];

interface InfoCard {
  icon: string;
  iconBg: string;
  title: string;
  body: string;
  link?: { label: string; href: string; external?: boolean };
}
const HEALTH: InfoCard[] = [
  { icon: "🏥", iconBg: "rgba(74,140,111,.1)", title: "Registering with SNS", body: "Register with the Serviço Nacional de Saúde (SNS) as soon as you have a NIF. You're entitled to a GP (médico de família). Ask at your local health centre (Centro de Saúde) — Arroios, Mouraria, and Príncipe Real all have active centres.", link: { label: "sns.gov.pt →", href: "https://www.sns.gov.pt", external: true } },
  { icon: "🏳️‍⚧️", iconBg: "rgba(232,119,90,.1)", title: "Trans-affirming care", body: "Portugal's Gender Identity Law is one of Europe's most progressive. The SNS provides trans healthcare including hormones. The Saúde Trans project (run by QueerPulse member Jonas Ferreira) trains GPs. Ask ILGA Portugal for a referral to an affirming GP.", link: { label: "About Jonas's work →", href: CHANGEMAKERS } },
  { icon: "🧠", iconBg: "rgba(122,82,184,.1)", title: "Mental health support", body: "Opus Diversus provides peer support and mental health resources specifically for LGBTQ+ people in Lisbon. Mariana Loução (QueerPulse member) runs a monthly peer support group for queer professionals. ILGA Portugal also has a support line.", link: { label: "Opus Diversus →", href: VOLUNTEER } },
  { icon: "📞", iconBg: "rgba(74,140,111,.1)", title: "Crisis support", body: "ILGA Portugal runs a support line for LGBTQ+ people facing crisis, discrimination, or violence. They can also help connect you with legal aid if needed. The line is Portuguese-language with limited English support — bring a friend if needed.", link: { label: "ILGA Portugal →", href: PLATFORMS } },
];
const HOUSING: InfoCard[] = [
  { icon: "📊", iconBg: "rgba(232,119,90,.1)", title: "The reality of the market", body: "Lisbon rents have increased significantly over the past five years. Budget €800–1100 for a room in central neighbourhoods. Arroios and Mouraria offer better value. Move fast — good listings go in days. Airbnb has reduced long-term rental stock dramatically." },
  { icon: "🤝", iconBg: "rgba(74,140,111,.1)", title: "Community housing network", body: "The Queer Housing Justice Network (run by Catarina Vaz) tracks queer-safe sublets and short-term shares within the community. Check the QueerPulse board — several members post housing regularly. The best leads come through the network, not portals.", link: { label: "Queer Housing Network →", href: CHANGEMAKERS } },
  { icon: "🌍", iconBg: "rgba(45,27,61,.08)", title: "Queer immigrant support", body: "If you're new to Portugal and navigating residency alongside housing, the Queer Immigrant Support Network (founded by Fátima Mendes) connects LGBTQ+ newcomers with legal aid, housing leads, and practical help getting settled.", link: { label: "Find support →", href: VOLUNTEER } },
  { icon: "💬", iconBg: "rgba(232,119,90,.1)", title: "Ask on the board", body: '"Looking for a room or short-term sublet — arriving in June" is a completely valid post. The community is genuinely helpful about this. Someone will know someone.', link: { label: "Go to the board →", href: "/#board" } },
];

interface Org {
  initials: string;
  bg: string;
  color: string;
  name: string;
  desc: string;
  url: string;
}
const ORGS: Org[] = [
  { initials: "IL", bg: "rgba(74,140,111,.12)", color: "var(--jade)", name: "ILGA Portugal", desc: "Portugal's leading LGBTQ+ rights organisation. Legal support, anti-discrimination advice, housing referrals, a crisis support line, and community programming. Your first call for anything serious.", url: "↗ ilga-portugal.pt" },
  { initials: "OD", bg: "rgba(232,119,90,.1)", color: "var(--accent-ink)", name: "Opus Diversus", desc: "Mental health and peer support for LGBTQ+ people. Runs training for allied health professionals. If you're struggling with the move or with visibility in a new city, this is where to go.", url: "↗ opusdiversus.org" },
  { initials: "Re", bg: "rgba(45,27,61,.08)", color: "var(--plum)", name: "Rede ex aequo", desc: "Youth-focused LGBTQ+ association with active groups in Lisbon. Peer support, advocacy, and a welcoming environment for people who are younger or who are still figuring things out.", url: "↗ ex-aequo.pt" },
];

interface CommQuick {
  type: string;
  typeColor: string;
  typeBg: string;
  name: string;
  reason: string;
}
const COMM_QUICK: CommQuick[] = [
  { type: "Social", typeColor: "var(--jade)", typeBg: "rgba(74,140,111,.1)", name: "Queer Social Lisbon", reason: "No agenda, no pressure. The best room for a first social step in the city." },
  { type: "Support", typeColor: "#7A52B8", typeBg: "rgba(122,82,184,.1)", name: "Queer Immigrant Support", reason: "Specifically for LGBTQ+ people who have recently arrived. Community, resources, practical help." },
  { type: "Sports", typeColor: "var(--jade)", typeBg: "rgba(74,140,111,.1)", name: "Queer Runners Lisboa", reason: "Weekly runs along the Tejo. All paces welcome. A surprisingly easy way to meet people." },
];

function InfoCards({ cards }: { cards: InfoCard[] }) {
  return (
    <div className={styles.infoGrid}>
      {cards.map((c) => (
        <div className={styles.infoCard} key={c.title}>
          <div className={styles.icHead}>
            <div className={styles.icIcon} style={{ background: c.iconBg }}>
              {c.icon}
            </div>
            <div className={styles.icTitle}>{c.title}</div>
          </div>
          <p className={styles.icBody}>{c.body}</p>
          {c.link &&
            (c.link.external ? (
              <a
                href={c.link.href}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.icLink}
              >
                {c.link.label}
              </a>
            ) : (
              <Link to={c.link.href} className={styles.icLink}>
                {c.link.label}
              </Link>
            ))}
        </div>
      ))}
    </div>
  );
}

export function ArrivingPage() {
  return (
    <PageShell>
      <div className={styles.hero}>
        <div className="wrap">
          <div className={styles.cat}>New to Lisbon</div>
          <h1>
            Queer and new to Lisbon? <em>Welcome.</em>
          </h1>
          <p>
            This city has a lot for us — a real, rooted queer community, welcoming
            neighbourhoods, organisations doing serious work, and people who will
            genuinely help you settle in. Here's what to know first.
          </p>
        </div>
      </div>

      <section className={`${styles.section} ${styles.alt}`}>
        <div className="wrap">
          <div className={styles.eye}>Lisbon's neighbourhoods</div>
          <h2 className={styles.h}>
            Where queer life <em>happens.</em>
          </h2>
          <p className={styles.intro}>
            Lisbon doesn't have one queer neighbourhood — it has several pockets,
            each with its own character. Here's an honest guide to where the
            community is.
          </p>
          <div className={styles.hoodGrid}>
            {HOODS.map((h) => (
              <div className={styles.hoodCard} key={h.name}>
                <span
                  className={styles.hoodTag}
                  style={{ color: h.tagColor, background: h.tagBg }}
                >
                  {h.tag}
                </span>
                <div className={styles.hoodName}>{h.name}</div>
                <p className={styles.hoodDesc}>{h.desc}</p>
                <div className={styles.hoodNote}>{h.note}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.paper}`}>
        <div className="wrap">
          <div className={styles.eye}>Health</div>
          <h2 className={styles.h}>
            Healthcare in Lisbon — <em>what you need to know.</em>
          </h2>
          <p className={styles.intro}>
            Portugal has a national health service (SNS) that you can register with.
            Trans-affirming care has improved significantly — but it takes knowing
            where to go.
          </p>
          <InfoCards cards={HEALTH} />
        </div>
      </section>

      <section className={`${styles.section} ${styles.alt}`}>
        <div className="wrap">
          <div className={styles.eye}>Housing</div>
          <h2 className={styles.h}>
            Finding a place to live — <em>honestly.</em>
          </h2>
          <p className={styles.intro}>
            Lisbon's housing market is expensive and competitive. Here's an honest
            picture of what to expect, and where to get help.
          </p>
          <InfoCards cards={HOUSING} />
        </div>
      </section>

      <section className={`${styles.section} ${styles.paper}`}>
        <div className="wrap">
          <div className={styles.eye}>Organisations</div>
          <h2 className={styles.h}>
            Know these <em>three first.</em>
          </h2>
          <p className={styles.intro}>
            These are the organisations most likely to be useful within your first
            weeks in Lisbon — for legal support, mental health, or simply connecting
            to the community.
          </p>
          <div className={styles.orgList}>
            {ORGS.map((o) => (
              <Link to={PLATFORMS} className={styles.org} key={o.name}>
                <div
                  className={styles.orgAv}
                  style={{ background: o.bg, color: o.color }}
                >
                  {o.initials}
                </div>
                <div className={styles.orgBody}>
                  <div className={styles.orgName}>{o.name}</div>
                  <p className={styles.orgDesc}>{o.desc}</p>
                  <div className={styles.orgUrl}>{o.url}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.dark}`}>
        <div className="wrap">
          <div className={styles.eye}>Your first step</div>
          <h2 className={styles.h}>
            Come to something <em>in person.</em>
          </h2>
          <p className={styles.intro}>
            Everything on this page is useful. But the best thing you can do is show
            up to a gathering. Next one coming up:
          </p>
          <div className={styles.firstGather}>
            <div className={styles.fgDate}>
              <span className={styles.d}>14</span>
              <span className={styles.m}>Jun</span>
            </div>
            <div className={styles.fgBody}>
              <div className={styles.fgBadge}>Portfolio Night</div>
              <h3>Designers &amp; Photographers</h3>
              <p>
                Príncipe Real · From 7pm · Casual, warm, no agenda. Bring your work
                or just yourself.
              </p>
            </div>
            <Button to={linkToPath("QueerPulse Gathering.html")} variant="ghost-dark">
              I'll be there →
            </Button>
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.alt}`}>
        <div className="wrap">
          <div className={styles.eye}>Where to start</div>
          <h2 className={styles.h}>
            Three communities for <em>new arrivals.</em>
          </h2>
          <p className={styles.intro}>
            Not sure where to begin? These three communities are particularly
            welcoming to people who are new to Lisbon.
          </p>
          <div className={styles.commQuick}>
            {COMM_QUICK.map((c) => (
              <Link to={COMMUNITIES} className={styles.cqCard} key={c.name}>
                <span
                  className={styles.cqType}
                  style={{ color: c.typeColor, background: c.typeBg }}
                >
                  {c.type}
                </span>
                <div className={styles.cqName}>{c.name}</div>
                <p className={styles.cqReason}>{c.reason}</p>
              </Link>
            ))}
          </div>
          <div className={styles.commCta}>
            <Button to={COMMUNITIES} variant="ghost">
              Browse all communities →
            </Button>
          </div>
        </div>
      </section>

      <section className={styles.outro}>
        <div className="wrap">
          <h2>
            Ready to meet <em>the community?</em>
          </h2>
          <p className={styles.outroSub}>
            Request an invite to QueerPulse and get access to the full network —
            members, gatherings, board, and everything else on this page.
          </p>
          <Button to={linkToPath("QueerPulse Invite.html")} variant="primary" size="lg">
            Request an invite →
          </Button>
        </div>
      </section>
    </PageShell>
  );
}
