import { Link } from "react-router-dom";
import type { IconType } from "react-icons";
import { FiActivity, FiUsers, FiHome, FiFlag, FiHeart, FiGlobe, FiZap, FiPhone } from "react-icons/fi";
import { FaScaleBalanced } from "react-icons/fa6";
import { PageShell } from "../../shared/components/layout";
import { routes } from "../../app/routeMap";
import styles from "./EmergencyPage.module.css";
import { memberName } from "../members/data/members";

const CRISIS_NUMS = [
  { label: "Emergency services", num: "112", note: "Police, ambulance, fire — 24h, free" },
  { label: "SNS 24 (Health line)", num: "808 24 24 24", note: "Medical advice & referral, 24h" },
  { label: "SOS Voz Amiga", num: "213 544 545", note: "Crisis & suicide prevention, 16:00–24:00" },
  { label: "ILGA Portugal helpline", num: "707 200 220", note: "LGBTQ+ crisis support" },
  { label: "APAV (Victim support)", num: "116 006", note: "Violence, DV, hate crimes — 24h, free" },
  { label: "Linha Amiga da Criança", num: "116 111", note: "For people under 18, 24h, free" },
];

interface Item {
  name: string;
  detail: string;
  link?: { label: string; href: string; external?: boolean };
}
interface Section {
  icon: IconType;
  iconBg: string;
  title: string;
  intro: string;
  items: Item[];
}

const SECTIONS: Section[] = [
  {
    icon: FiActivity,
    iconBg: "rgba(122,82,184,.1)",
    title: "Mental health support",
    intro: "Whether you're in acute crisis or just struggling — these organisations specifically support LGBTQ+ people in Lisbon.",
    items: [
      { name: "Opus Diversus", detail: "Peer support and mental health resources for LGBTQ+ people. Drop-in sessions and one-to-ones available.", link: { label: "↗ opusdiversus.org", href: "https://opusdiversus.org", external: true } },
      { name: `${memberName('mariana')} (QueerPulse)`, detail: "Clinical psychologist specialising in LGBTQ+ care. Runs a monthly peer support group in Lisbon for queer professionals.", link: { label: "View profile →", href: routes.members } },
      { name: "SNS mental health services", detail: "You can access mental health support via the NHS (SNS) with a referral from your GP. Call 808 24 24 24 to start." },
    ],
  },
  {
    icon: FiUsers,
    iconBg: "rgba(74,140,111,.1)",
    title: "Trans-specific support",
    intro: "Support specifically for trans, non-binary, and gender non-conforming people in Portugal and Lisbon.",
    items: [
      { name: "ILGA Portugal — Trans rights team", detail: "Legal support, healthcare referrals, documentation help, and crisis support for trans people. Call 707 200 220.", link: { label: "↗ ilga-portugal.pt", href: "https://ilga-portugal.pt", external: true } },
      { name: "Panteras Rosa", detail: "Trans rights advocacy and community organising. Can connect you to trans peer support and community in Lisbon.", link: { label: "More info →", href: routes.platforms } },
      { name: "Trans Mutual Aid Network (QueerPulse)", detail: "Peer-run mutual aid for trans people in Lisbon. Practical help, resource sharing, community connection.", link: { label: "Join the network →", href: routes.communities } },
    ],
  },
  {
    icon: FiHome,
    iconBg: "rgba(var(--danger-rgb),.08)",
    title: "Unsafe at home / housing crisis",
    intro: "If your home environment is dangerous or you have no safe place to go.",
    items: [
      { name: "APAV — Domestic violence support", detail: "Support for people experiencing domestic violence, including LGBTQ+ people. 116 006, free, 24h. Can help arrange emergency accommodation." },
      { name: "Queer Housing Justice Network", detail: "Community-run network that tracks queer-safe housing and can urgently connect people in housing crisis with community members who have space.", link: { label: "Housing resources →", href: routes.housing } },
      { name: "Santa Casa da Misericórdia", detail: "Lisbon's largest social services organisation. Can refer to emergency housing." },
    ],
  },
  {
    icon: FaScaleBalanced,
    iconBg: "rgba(45,27,61,.08)",
    title: "Legal emergency & discrimination",
    intro: "Facing discrimination, hate crime, family law crisis, or immigration emergency.",
    items: [
      { name: "ILGA Portugal — Legal team", detail: "Free legal consultations for LGBTQ+ people facing discrimination, hate crimes, family law, or immigration issues. Call 707 200 220." },
      { name: `${memberName('raquel-baptista')} (QueerPulse)`, detail: "Lawyer offering pro-bono consultations for LGBTQ+ people facing discrimination and family law challenges. Over 60 cases in three years.", link: { label: "View profile →", href: "/members/raquel-baptista" } },
      { name: "Ordem dos Advogados — Legal aid", detail: "Portugal's bar association runs a legal aid (apoio judiciário) scheme for those who can't afford a lawyer." },
    ],
  },
];

const ONLINE: { icon: IconType; name: string; sub: string; href: string }[] = [
  { icon: FiFlag, name: "ILGA Portugal", sub: "Portuguese · LGBTQ+ rights", href: "https://ilga-portugal.pt" },
  { icon: FiHeart, name: "The Trevor Project", sub: "English · Youth crisis support", href: "https://thetrevorproject.org" },
  { icon: FiUsers, name: "Trans Lifeline", sub: "English · Trans peer support", href: "https://translifeline.org" },
  { icon: FiActivity, name: "Opus Diversus", sub: "Portuguese · LGBTQ+ mental health", href: "https://opusdiversus.org" },
  { icon: FiGlobe, name: "Rainbow Railroad", sub: "English · Escape from persecution", href: "https://rainbowrailroad.org" },
];

export function EmergencyPage() {
  const leaveSite = () => {
    window.location.replace("https://www.google.com");
  };

  return (
    <PageShell>
      <div className={styles.exitBar}>
        <p>If you need to leave this page quickly, click Exit — it goes to Google immediately.</p>
        <button type="button" className={styles.exitBtn} onClick={leaveSite}>
          <FiZap /> Leave site now
        </button>
      </div>

      <div className={styles.hero}>
        <div className="wrap">
          <div className={styles.cat}>Emergency Resources</div>
          <h1>
            Help is here. <em>You are not alone.</em>
          </h1>
          <p>
            This page exists for moments of crisis. Everything on it is available
            right now — no login, no waiting. If you're in immediate danger, call
            112.
          </p>
        </div>
      </div>

      <div className={styles.body}>
        <div className="wrap">
          <div className={styles.note}>
            <b>A note on these numbers:</b> Portugal phone lines and organisations do
            change. These contacts are correct as of 2026 to the best of our
            knowledge. If something isn't connecting, call 112 (emergency services)
            or 808 24 24 24 (SNS 24 health line). Both operate 24 hours a day.
          </div>

          <div className={styles.crisisNow}>
            <h2><FiPhone /> If you need help right now</h2>
            <div className={styles.crisisNums}>
              {CRISIS_NUMS.map((c) => (
                <div className={styles.crisisNum} key={c.label}>
                  <div className={styles.cnLabel}>{c.label}</div>
                  <div className={styles.cnNum}>{c.num}</div>
                  <div className={styles.cnNote}>{c.note}</div>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.sections}>
            {SECTIONS.map((s) => (
              <div className={styles.sec} key={s.title}>
                <div className={styles.esHead}>
                  <div className={styles.esIcon} style={{ background: s.iconBg }}>
                    <s.icon />
                  </div>
                  <div className={styles.esTitle}>{s.title}</div>
                </div>
                <p className={styles.esIntro}>{s.intro}</p>
                <div className={styles.esItems}>
                  {s.items.map((it) => (
                    <div className={styles.esItem} key={it.name}>
                      <div className={styles.esiName}>{it.name}</div>
                      <div className={styles.esiDetail}>{it.detail}</div>
                      {it.link &&
                        (it.link.external ? (
                          <a
                            href={it.link.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.esiLink}
                          >
                            {it.link.label}
                          </a>
                        ) : (
                          <Link to={it.link.href} className={styles.esiLink}>
                            {it.link.label}
                          </Link>
                        ))}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className={styles.onlineStrip}>
            <div className={styles.osTitle}>Online resources — available right now</div>
            <div className={styles.osChips}>
              {ONLINE.map((o) => (
                <a
                  key={o.name}
                  className={styles.osChip}
                  href={o.href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className={styles.osChipIcon}><o.icon /></span>
                  <div>
                    <div className={styles.osChipName}>{o.name}</div>
                    <div className={styles.osChipSub}>{o.sub}</div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
