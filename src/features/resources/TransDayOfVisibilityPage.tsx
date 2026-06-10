import { Link } from "react-router-dom";
import { PageShell } from "../../shared/components/layout";
import { linkToPath } from "../../app/routeMap";
import styles from "./TransDayOfVisibilityPage.module.css";

const PROFILE = linkToPath("QueerPulse Profile.html");
const TRANS_HUB = linkToPath("QueerPulse Trans Hub.html");
const TRANS_HEALTH = linkToPath("QueerPulse Trans Healthcare.html");
const NEWSLETTER = linkToPath("QueerPulse Newsletter.html");
const INVITE = linkToPath("QueerPulse Invite.html");

interface Profile {
  tint: "a" | "b" | "c";
  pron: string;
  nameMain: string;
  nameEm: string;
  role: string;
  quote: React.ReactNode;
  read: string;
}
const PROFILES: Profile[] = [
  { tint: "a", pron: "she/her · 5 years on QP", nameMain: "Anika ", nameEm: "Kovač", role: "Healthcare designer · open-clinic host · Trans & Non-Binary Network", quote: <>"I host clinic nights because I needed one when I moved here and there <em>wasn't</em> one. That's the entire reason."</>, read: "5 min read" },
  { tint: "b", pron: "he/him · co-founder", nameMain: "Nuno ", nameEm: "Alves", role: "Trans Hub coordinator · maintainer of the vetted-provider list", quote: <>"I keep one phone number on me at all times. It is the one printed on a sticker on Mercearia Rosa's door."</>, read: "7 min read" },
  { tint: "c", pron: "she/her · clinician · cis ally", nameMain: "Dr. Inês ", nameEm: "Pereira", role: "Psychologist · changed the protocol at Clínica do Largo · WPATH-certified", quote: <>"I do not <em>treat</em> being trans. I treat what the world does to you for being trans."</>, read: "9 min interview" },
  { tint: "a", pron: "they/them · 3 years on QP", nameMain: "Rita ", nameEm: "Vasquez", role: "Therapist · co-host of the post-march decompression event", quote: <>"My waiting room has soft lighting on purpose. Half of my job is undoing the last clinic."</>, read: "4 min read" },
  { tint: "b", pron: "they/them · joined 2026", nameMain: "Mira ", nameEm: "Martín", role: "Helpline volunteer · arrived from Madrid in 2025", quote: <>"I take the 06:00–10:00 shift. Most people who call us at that hour <em>haven't slept.</em>"</>, read: "6 min read" },
  { tint: "c", pron: "he/him · contributor", nameMain: "Tó ", nameEm: "Costa", role: "Writer · the magazine's translation editor · author of Issue 04 cover", quote: <>"I translate everything we publish into the Portuguese my grandmother spoke. She doesn't read me; that's not the point."</>, read: "8 min read" },
  { tint: "a", pron: "she/her · 22 years SNS", nameMain: "Helena ", nameEm: "Costa", role: "Nurse · public hospital · podcast guest", quote: <>"I came out at work in 2018. They started using my name in 2019. <em>That gap is the story.</em>"</>, read: "Podcast episode" },
];

interface ResCard {
  cls: "" | "coral" | "plum";
  icon: string;
  title: React.ReactNode;
  body: React.ReactNode;
  href: string;
}
const RES_CARDS: ResCard[] = [
  { cls: "", icon: "🕐", title: <>The vetted provider <em>list</em></>, body: <>47 names · all re-verified in the last 90 days. GPs, mental health, endocrinology, gynaecology (trans-inclusive), dental. <em>Updated monthly by Nuno.</em></>, href: TRANS_HUB },
  { cls: "coral", icon: "💬", title: <>Open clinic night · <em>every Thursday</em></>, body: <>Café Beirão back room · GP, pharmacist, peer support. Free, no booking, no records. <em>Bring questions.</em></>, href: TRANS_HEALTH },
  { cls: "plum", icon: "🛡", title: <>Lei n.º 38/2018 <em>plain-language guide</em></>, body: <>What the law actually says, what it doesn't, and what to bring to a doctor or a Câmara Municipal. EN &amp; PT.</>, href: TRANS_HEALTH },
  { cls: "", icon: "✉", title: <>The Trans Hub <em>bulletin</em></>, body: <>Monthly. New provider names, hormone supply news, anonymised case notes. <em>1.4k subscribers · 74% open rate.</em></>, href: NEWSLETTER },
];

const ACTIONS: { n: React.ReactNode; title: React.ReactNode; body: React.ReactNode }[] = [
  { n: <>0<em>1</em></>, title: <>Set your pronouns visibly · everywhere</>, body: <>Not just on QueerPulse — at work, in email, on Slack, on the door of your office. <em>Cis people normalising the practice is what makes trans pronouns less visible as a mark.</em> Takes 4 minutes. <Link to={PROFILE}>Edit your QP profile →</Link></> },
  { n: <>0<em>2</em></>, title: <>Fund the Trans Hub <em>directly</em></>, body: <>The provider list, the bulletin, the open clinic night. €10 once · €5/month · whatever's honest. <em>Goes to a specific pool, not "general support."</em> 96% of every euro reaches the work. <Link to={INVITE}>Donate to Trans Hub →</Link></> },
  { n: <>0<em>3</em></>, title: <>Print a guide. Bring it somewhere.</>, body: <>The Lei n.º 38/2018 plain-language PDF. Bring three copies to your office HR, your GP, your favourite café. <em>Hand them over without a speech.</em> Print run is on us — link below. <Link to={TRANS_HEALTH}>Download the print PDF →</Link></> },
];

function ActionLink({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function TransDayOfVisibilityPage() {
  return (
    <PageShell>
      <div className={styles.page}>
        <section className={styles.hero}>
          <div className={styles.heroInner}>
            <div className={styles.eyebrow}>
              31 March · International Day of Visibility for Trans People
            </div>
            <h1 className={styles.h1}>
              Visible <em>and</em> safe. <em>Both.</em>
            </h1>
            <p className={styles.dek}>
              Today we lift the work of seven trans members shaping Lisbon —
              clinicians, organisers, writers, and the people who answer the helpline
              at 03:00. <em>Visibility is not a strategy unless it comes with safety</em>.
              So we pair these stories with the practical infrastructure that makes
              them livable: vetted clinicians, the open clinic, the legal observers,
              the Trans Hub.
            </p>
            <div className={styles.meta}>
              <span>
                <b>
                  <em>22</em>%
                </b>
                Of QP members are trans / NB
              </span>
              <span>
                <b>47</b>Vetted trans-affirming providers
              </span>
              <span>
                <b>
                  <em>1.4</em>k
                </b>
                Trans Hub bulletin subscribers
              </span>
              <span>
                <b>8</b>Years since Lei n.º 38/2018
              </span>
            </div>
          </div>
        </section>

        <section className={styles.statement}>
          <div className={styles.statementInner}>
            <div className={styles.kicker}>
              A note from Nuno Alves · Trans Hub coordinator
            </div>
            <h2>
              Today is the easy day. <em>Tomorrow is the work.</em>
            </h2>
            <p>
              Trans Day of Visibility falls on 31 March, four months before TDOR. The
              two are calendared like that on purpose. We are seen in the spring; we
              are mourned in the autumn. What happens between is, mostly, work —
              clinic appointments, prescription renewals, legal-name updates,
              conversations at HR, and the long quiet evenings that don't make the
              front pages.
            </p>
            <p>
              So this page is <strong>not</strong> a graphic to share. It is a list of
              the people doing that work, a list of the rooms where you can find them,
              and three small things a cis member of QueerPulse can do today that{" "}
              <em>actually help</em> — without making the day about themselves.
            </p>
            <p>
              If you are a trans member reading this: thank you for being here. The
              clinic on Thursday has a slot for you if you need one.{" "}
              <em>Don't hesitate to use it.</em>
            </p>
            <div className={styles.statementSign}>
              <div className={styles.ssAv}>NA</div>
              <div>
                — <b>Nuno Alves</b> · Trans Hub coordinator · 31 March
              </div>
            </div>
          </div>
        </section>

        <section className={styles.profiles}>
          <div className={styles.profilesInner}>
            <div className={styles.profilesH}>
              <h2>
                Seven members · <em>at work</em>
              </h2>
              <span className={styles.metaNote}>
                Members chose to be featured. None are obligated.
              </span>
            </div>
            <div className={styles.profileGrid}>
              {PROFILES.map((p) => (
                <Link to={PROFILE} className={styles.profileCard} key={p.nameMain + p.nameEm}>
                  <div
                    className={[
                      styles.profileImg,
                      p.tint === "b" && styles.tintB,
                      p.tint === "c" && styles.tintC,
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    Portrait · {p.nameMain}
                    {p.nameEm}
                  </div>
                  <div className={styles.profileBody}>
                    <div className={styles.profilePron}>{p.pron}</div>
                    <div className={styles.profileName}>
                      {p.nameMain}
                      <em>{p.nameEm}</em>
                    </div>
                    <div className={styles.profileRole}>{p.role}</div>
                    <p className={styles.profileQuote}>{p.quote}</p>
                    <div className={styles.profileRead}>
                      <span>{p.read}</span>
                      <span>Read profile →</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.resources}>
          <div className={styles.resourcesInner}>
            <h2>
              The infrastructure <em>behind the visibility.</em>
            </h2>
            <p className={styles.sub}>
              Four practical things that exist all year, not just today. Take a
              screenshot. Show a friend. Save what's useful.
            </p>
            <div className={styles.rGrid}>
              {RES_CARDS.map((c, i) => (
                <Link
                  to={c.href}
                  key={i}
                  className={[
                    styles.rCard,
                    c.cls === "coral" && styles.rCardCoral,
                    c.cls === "plum" && styles.rCardPlum,
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  <div className={styles.rIc}>{c.icon}</div>
                  <h3>{c.title}</h3>
                  <p>{c.body}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.allies}>
          <div className={styles.alliesInner}>
            <div className={styles.alliesKicker}>If you are a cis member · today</div>
            <h2>
              Three things that <em>actually help.</em>
            </h2>
            <p className={styles.alliesSub}>
              Not <em>celebrate</em>, not <em>amplify</em>. Concrete. Tangible. Done by
              tomorrow.
            </p>
            <div className={styles.actionList}>
              {ACTIONS.map((a, i) => (
                <div className={styles.actionRow} key={i}>
                  <div className={styles.actionN}>{a.n}</div>
                  <div>
                    <b>{a.title}</b>
                    <p>
                      <ActionLink>{a.body}</ActionLink>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.notDoing}>
          <div className={styles.notDoingInner}>
            <h3>
              What this page <em>is not.</em>
            </h3>
            <p>
              It is not a marketing moment. It is not a list of brands flying a flag.
              It is not a hashtag we want trending. <b>It is not an obligation</b> for
              any trans member to perform visibility today, or any other day — we did
              not feature anyone who didn't opt in, and we will take any profile down
              on request, no questions.
            </p>
            <p>
              If today is a hard day for you,{" "}
              <em>that is not a failure of visibility.</em> Some days the most political
              thing a trans person can do is rest. The Hub is still open. Crisis chat
              is still staffed. The Thursday clinic is still happening.
            </p>
          </div>
        </section>
      </div>
    </PageShell>
  );
}
