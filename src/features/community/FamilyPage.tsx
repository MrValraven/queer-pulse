import { useRef, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { PageShell } from "../../shared/components/layout";
import { linkToPath } from "../../app/routeMap";
import styles from "./FamilyPage.module.css";
import { Button } from '../../shared/components/ui'

type TabId = "adoption" | "ivf" | "coparenting" | "donors" | "legal";

const LEGAL = linkToPath("QueerPulse Legal.html");
const TRANS_HUB = linkToPath("QueerPulse Trans Hub.html");
const FORUM = linkToPath("QueerPulse Forum.html");
const MENTORSHIP = linkToPath("QueerPulse Mentorship.html");
const INVITE = linkToPath("QueerPulse Invite.html");

interface InfoCard {
  eyebrow: string;
  title: string;
  body: string;
  note?: string;
  link?: { label: string; href: string };
}
interface Review {
  initials: string;
  bg: string;
  color: string;
  name: string;
  context: string;
  stars: string;
  quote: string;
}
interface Step {
  title: string;
  text: string;
  time?: string;
}
interface Tab {
  id: TabId;
  label: string;
  headTitle: ReactNode;
  headText: string;
  cards: InfoCard[];
  note: ReactNode;
  reviewHead?: ReactNode;
  reviews?: Review[];
  steps?: Step[];
}

const SITUATIONS: { name: string; desc: string; to: string; tab: TabId }[] = [
  { name: "Two women", desc: "IVF or IUI with donor sperm, joint legal parenthood from birth.", to: "See: IVF & Assisted Reproduction →", tab: "ivf" },
  { name: "Two men", desc: "Joint adoption, co-parenting arrangements, or surrogacy options.", to: "See: Adoption & Co-parenting →", tab: "adoption" },
  { name: "Single woman", desc: "Solo IVF or IUI available through SNS and private clinics.", to: "See: IVF & Assisted Reproduction →", tab: "ivf" },
  { name: "Single man", desc: "Solo adoption or co-parenting. Surrogacy legally complex.", to: "See: Adoption →", tab: "adoption" },
  { name: "Trans parent", desc: "Legal parenthood, birth registration, and assisted reproduction for trans people.", to: "See: Legal Parenthood →", tab: "legal" },
  { name: "Looking for a co-parent", desc: "Community-matched co-parenting, legal frameworks, shared custody.", to: "See: Co-parenting →", tab: "coparenting" },
];

const TABS: Tab[] = [
  {
    id: "adoption",
    label: "Adoption",
    headTitle: (
      <>
        Adoption in <em>Portugal</em>
      </>
    ),
    headText:
      "Same-sex couples have had full adoption rights in Portugal since October 2016, including joint adoption and stepchild adoption. The process is long but navigable — here's what the community has learned.",
    cards: [
      { eyebrow: "The law", title: "Who can adopt", body: "Married couples and civil partners of any gender can adopt jointly. Single people can also adopt. Same-sex couples have been eligible since the 2016 amendment. Portuguese residency is required; citizenship is not." },
      { eyebrow: "The process", title: "How it works", body: "Applications go through SCML (Santa Casa da Misericórdia de Lisboa) or your local Social Security office. You'll have interviews, a home study, and background checks. The process is the same for same-sex couples — though experiences vary.", note: "Typical timeline: 12–36 months" },
      { eyebrow: "International adoption", title: "Adopting from abroad", body: "International adoption is significantly more complex and most countries that permit it do not extend eligibility to same-sex couples. A handful of exceptions exist. Get specialist legal advice before starting this route.", link: { label: "Speak to a legal specialist →", href: LEGAL } },
      { eyebrow: "Stepchild adoption", title: "Adopting your partner's child", body: "If your partner already has a child, you can adopt as a second parent. This is often faster than joint adoption of an unrelated child. Legal parenthood is also now possible at birth without adoption (see Legal Parenthood tab)." },
    ],
    note: (
      <>
        <strong>From the community:</strong> "The social worker we worked with was completely unfazed by us being a same-sex couple. The process was slow but fair. Having a lawyer from the start made everything less stressful — worth every euro." — <strong>Member, Arroios</strong>
      </>
    ),
    reviewHead: (
      <>
        Community-reviewed <em>social workers &amp; agencies</em>
      </>
    ),
    reviews: [
      { initials: "CM", bg: "rgba(74,140,111,.15)", color: "var(--jade)", name: "Carla Matos", context: "Social worker · SCML Lisboa", stars: "★★★★★", quote: '"Dealt with our case without a single awkward moment. Prepared, respectful, made the home study feel like a conversation. Recommended by four members of this community."' },
      { initials: "FA", bg: "rgba(232,119,90,.15)", color: "var(--accent-ink)", name: "Fundação Ajuda", context: "Adoption agency · Lisbon", stars: "★★★★☆", quote: '"Good organisation, thorough process. One social worker was clearly less experienced with LGBTQ+ families but the lead was excellent. Overall positive."' },
      { initials: "RN", bg: "rgba(45,27,61,.1)", color: "var(--plum)", name: "Rita Nunes", context: "Independent social worker", stars: "★★★★★", quote: '"Specifically experienced with LGBTQ+ families. Worth contacting directly before you start the official process — she helped us understand what to expect."' },
    ],
  },
  {
    id: "ivf",
    label: "IVF & Assisted Reproduction",
    headTitle: (
      <>
        IVF &amp; <em>Assisted Reproduction</em>
      </>
    ),
    headText:
      "Portugal has some of the most progressive assisted reproduction laws in Europe. Since 2016, IVF and IUI are available to all women — including single women and female same-sex couples — through both the public SNS and private clinics.",
    cards: [
      { eyebrow: "Public (SNS)", title: "What the state covers", body: "SNS covers assisted reproduction (IVF, IUI) for women up to age 40, including female same-sex couples. Treatment is heavily subsidised. Waitlists can be long — 12–24 months in Lisbon. Hospital de Santa Maria and Maternidade Alfredo da Costa are the main centres.", note: "Average co-pay: €200–600 per cycle" },
      { eyebrow: "Private clinics", title: "Going private", body: "Private clinics are significantly faster and offer more treatment flexibility. Costs range from €3,000–7,000 per IVF cycle, less for IUI. Several Lisbon clinics are known for experience with LGBTQ+ patients — community recommendations below.", note: "IUI: €800–1,500 · IVF: €3,000–7,000" },
      { eyebrow: "Trans men", title: "If you haven't had reproductive surgery", body: "Trans men who haven't had reproductive surgeries can access egg freezing or IVF. Portuguese clinics vary in experience — ask specifically. Legal gender recognition does not affect access to fertility treatment. Community members have documented their experiences in the forum.", link: { label: "Trans Hub resources →", href: TRANS_HUB } },
      { eyebrow: "Surrogacy", title: "A complex landscape", body: "Surrogacy has been legally contentious in Portugal. A 2016 law permitted it in limited circumstances; parts were later struck down. The legal situation remains unsettled. If this is your route, specialist legal advice is essential before you proceed.", link: { label: "Get legal advice →", href: LEGAL } },
    ],
    note: (
      <>
        <strong>From the community:</strong> "We went private after a 14-month SNS wait. The clinic was completely straightforward with us — no awkward questions, no assumptions. We have a daughter now. The process was hard but the people were good." — <strong>Member, Mouraria</strong>
      </>
    ),
    reviewHead: (
      <>
        Community-recommended <em>clinics</em>
      </>
    ),
    reviews: [
      { initials: "CF", bg: "rgba(74,140,111,.15)", color: "var(--jade)", name: "Clínica Ferticare", context: "Private · Marquês de Pombal", stars: "★★★★★", quote: '"Genuinely affirming from the first call. The team treated us as a couple — not a \'special case\'. Two members of our community are now parents thanks to them."' },
      { initials: "IM", bg: "rgba(232,119,90,.15)", color: "var(--accent-ink)", name: "Instituto Marquesa", context: "Private · Cascais", stars: "★★★★☆", quote: '"Slightly further out but shorter waitlists and very professional. Had no issues being a single woman. Would recommend for people who\'ve had bad experiences elsewhere."' },
    ],
  },
  {
    id: "coparenting",
    label: "Co-parenting",
    headTitle: (
      <>
        Co-parenting — <em>together, differently</em>
      </>
    ),
    headText:
      "Co-parenting means raising a child with someone you're not in a romantic relationship with. It can work beautifully with clear agreements, honest communication, and legal frameworks that protect everyone — including the child.",
    cards: [
      { eyebrow: "What it means", title: "How co-parenting works", body: "Two or more people agree to parent a child together without being a couple. Arrangements vary enormously — from a single primary home with regular visits, to fully shared 50/50 custody. What matters is that agreements are clear, documented, and legally robust before the child is born." },
      { eyebrow: "Finding a co-parent", title: "Within the community", body: "QueerPulse runs a Co-parent Connections board for members who want to find a co-parent within the community. It's not a matching algorithm — it's a notice board. Post your intentions, meet people over time, have honest conversations before anything is decided.", link: { label: "Co-parent Connections board →", href: FORUM } },
      { eyebrow: "Legal frameworks", title: "Protecting everyone involved", body: "In Portugal, both parents can be legally registered at birth if they are known donors or co-parents and have a prior legal agreement. A parenting agreement (acordo de co-parentalidade) is strongly recommended. Get a family law solicitor involved early.", note: "Do this before conception, not after" },
      { eyebrow: "International situations", title: "Cross-border families", body: "If co-parents live in different countries, legal parenthood can become complicated. EU recognition of parenthood is improving but not yet uniform. This requires specialist cross-border family law advice.", link: { label: "International family law help →", href: LEGAL } },
    ],
    note: (
      <>
        <strong>From the community:</strong> "We met through this community, spent six months getting to know each other as people first, and then started the process. Our daughter is two now. It's unconventional but it's working — the key was having the hard conversations early." — <strong>Co-parent pair, Graça + Marvila</strong>
      </>
    ),
  },
  {
    id: "donors",
    label: "Donor Questions",
    headTitle: (
      <>
        Donor <em>questions</em>
      </>
    ),
    headText:
      "Whether you're thinking about a known or unknown donor, sperm or egg donation — the legal implications vary significantly depending on your situation. Here's a clear-eyed overview.",
    cards: [
      { eyebrow: "Known vs. unknown", title: "A fundamental choice", body: "An unknown donor means the clinic handles everything; legal parenthood does not attach to the donor. A known donor is more complex legally — they may or may not have parental rights, depending on what agreements are in place before donation. This is where legal advice is most important." },
      { eyebrow: "Sperm donation", title: "Options in Portugal", body: "Sperm donation is available through licensed fertility clinics (anonymous bank donors) or via known donors with legal documentation. Home insemination using a known donor sits in a legal grey area — parenthood claims are uncertain without clinic involvement and prior legal agreements." },
      { eyebrow: "Egg donation", title: "For same-sex couples and single men", body: "Egg donation is available through licensed private clinics in Portugal. Donors are anonymous under Portuguese law. Wait times for matched donors vary — 3–12 months is typical. The birth mother (or gestational carrier) is the legal mother unless an alternative legal route is established." },
      { eyebrow: "Legal parenthood", title: "Who is the legal parent?", body: "For donors used through licensed clinics, the donor has no parental rights. For known donors, this depends entirely on prior written agreements and whether the donation was through a clinic. A family law specialist should review your situation before you proceed.", link: { label: "Get legal advice →", href: LEGAL } },
    ],
    note: (
      <>
        <strong>From the community:</strong> "We used an anonymous clinic donor and never had any ambiguity about parenthood. Both of us are on the birth certificate. For people considering a known donor — please get a lawyer before you start, not after." — <strong>Member, Príncipe Real</strong>
      </>
    ),
  },
  {
    id: "legal",
    label: "Legal Parenthood",
    headTitle: (
      <>
        Legal <em>parenthood</em>
      </>
    ),
    headText:
      "Portuguese law has advanced significantly in recent years. Since 2022, both same-sex parents can be registered at birth without adoption in most cases. Here's what that means in practice — and where gaps remain.",
    cards: [
      { eyebrow: "Birth registration", title: "Both parents on the certificate", body: "Since a 2022 legislative update, a child born to a same-sex couple (married or in a civil partnership) can have both parents registered on the birth certificate without requiring second-parent adoption. This applies to children born via assisted reproduction within licensed clinics.", note: "Only for married couples or civil partners" },
      { eyebrow: "If you're not married", title: "Unmarried couples", body: "If you're not married or in a civil partnership, the non-birth parent does not automatically have legal parenthood. You will need second-parent adoption or a legal agreement established before birth. This is also relevant for co-parents and known donor situations.", link: { label: "Marriage & civil partnership info →", href: LEGAL } },
      { eyebrow: "Trans parents", title: "Gender recognition and parenthood", body: "A trans man who gives birth is legally the father if his legal gender has been changed to male. A trans woman whose partner carries the child can be registered as the mother. Portuguese law has accommodated these situations, though administrative practice varies — document everything.", link: { label: "Trans Hub legal resources →", href: TRANS_HUB } },
      { eyebrow: "Second-parent adoption", title: "Still a valid route", body: "Second-parent adoption remains available and is sometimes the clearer option — especially for children born before the 2022 updates, or in complex international situations. It also applies to children born in other countries whose parentage Portugal may not automatically recognise." },
    ],
    note: null,
    steps: [
      { title: "Establish your legal status as a couple", text: "Marriage or civil partnership is the clearest route to automatic joint parenthood at birth. This can be done quickly at the conservatória." },
      { title: "Notify the clinic before conception", text: "Ensure the clinic is using the correct legal framework. Get written confirmation of how parenthood will be recorded.", time: "At the start of treatment" },
      { title: "Register the birth with both parents", text: "At the hospital or conservatória within 20 days. Bring your marriage/civil partnership documentation. If there are complications, a lawyer can accompany you.", time: "Within 20 days of birth" },
      { title: "Consider a will and guardianship document", text: "Even with full legal parenthood, it's worth having a will specifying guardianship in case of death. A family lawyer can draft this in a few hours." },
    ],
  },
];

const TALK_CARDS: { initials: string; bg: string; color: string; name: string; detail: string; note: string }[] = [
  { initials: "MR", bg: "rgba(232,119,90,.25)", color: "var(--accent)", name: "Marta & Raquel", detail: "IVF via SNS · Two children · Arroios", note: '"Happy to walk anyone through the SNS process and what we wish we\'d known before we started."' },
  { initials: "JP", bg: "rgba(74,140,111,.25)", color: "var(--jade)", name: "João & Pedro", detail: "Adoption · Domestic · Mouraria", note: '"We adopted in 2021. The process was long but we\'re on the other side now. Ask us anything."' },
  { initials: "TS", bg: "rgba(122,82,184,.2)", color: "#7A52B8", name: "Tomás", detail: "Trans dad · IVF · Solo parent · Graça", note: '"Specifically experienced in navigating the IVF system as a trans man. DMs open."' },
];

export function FamilyPage() {
  const [active, setActive] = useState<TabId>("adoption");
  const [selectedSit, setSelectedSit] = useState<number | null>(null);
  const tabNavRef = useRef<HTMLDivElement>(null);

  const selectSituation = (index: number, tab: TabId) => {
    setSelectedSit(index);
    setActive(tab);
    const el = tabNavRef.current;
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  const tab = TABS.find((t) => t.id === active) ?? TABS[0];

  return (
    <PageShell>
      <div className={styles.hero}>
        <div className="wrap">
          <div className={styles.cat}>Family Building · Portugal</div>
          <h1>
            Building your family, <em>your way.</em>
          </h1>
          <p className={styles.heroSub}>
            Practical, honest information about adoption, assisted reproduction,
            co-parenting, and legal parenthood in Portugal — from the community,
            for the community.
          </p>
          <div className={styles.legalNote}>
            <span className={styles.legalDot} />
            Community information, not legal advice. Laws change — always verify
            with a specialist.
          </div>
        </div>
      </div>

      <section className={styles.sitSection}>
        <div className="wrap">
          <div className={styles.sitLabelRow}>
            <h2>
              Where are you <em>starting from?</em>
            </h2>
            <p>Pick your situation to highlight what's most relevant to you.</p>
          </div>
          <div className={styles.sitGrid}>
            {SITUATIONS.map((s, i) => (
              <button
                key={s.name}
                type="button"
                className={[styles.sitCard, selectedSit === i && styles.sitSel]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => selectSituation(i, s.tab)}
              >
                <div className={styles.sitName}>{s.name}</div>
                <div className={styles.sitDesc}>{s.desc}</div>
                <div className={styles.sitTo}>{s.to}</div>
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className={styles.tabNav} ref={tabNavRef}>
        <div className={styles.tabNavInner}>
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              className={[styles.tabBtn, active === t.id && styles.tabBtnActive]
                .filter(Boolean)
                .join(" ")}
              onClick={() => setActive(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.tabContent}>
        <div className="wrap">
          <div className={styles.tabHead}>
            <h2>{tab.headTitle}</h2>
            <p>{tab.headText}</p>
          </div>

          <div className={styles.infoGrid}>
            {tab.cards.map((card) => (
              <div className={styles.infoCard} key={card.title}>
                <div className={styles.icEyebrow}>{card.eyebrow}</div>
                <div className={styles.icTitle}>{card.title}</div>
                <div className={styles.icBody}>{card.body}</div>
                {card.note && <div className={styles.icNote}>{card.note}</div>}
                {card.link && (
                  <div className={styles.icLink}>
                    <Link to={card.link.href}>{card.link.label}</Link>
                  </div>
                )}
              </div>
            ))}
          </div>

          {tab.note && (
            <div className={styles.communityNote}>
              <div className={styles.cnBar} />
              <div className={styles.cnBody}>{tab.note}</div>
            </div>
          )}

          {tab.reviewHead && (
            <h2 className={styles.reviewHead}>{tab.reviewHead}</h2>
          )}
          {tab.reviews && (
            <div className={styles.reviewGrid}>
              {tab.reviews.map((r) => (
                <div className={styles.reviewCard} key={r.name}>
                  <div className={styles.rvTop}>
                    <div
                      className={styles.rvAv}
                      style={{ background: r.bg, color: r.color }}
                    >
                      {r.initials}
                    </div>
                    <div>
                      <div className={styles.rvName}>{r.name}</div>
                      <div className={styles.rvContext}>{r.context}</div>
                    </div>
                  </div>
                  <div className={styles.rvStars}>{r.stars}</div>
                  <div className={styles.rvQuote}>{r.quote}</div>
                </div>
              ))}
            </div>
          )}

          {tab.steps && (
            <div className={styles.processSteps}>
              {tab.steps.map((step, i) => (
                <div className={styles.psStep} key={step.title}>
                  <div className={styles.psNum}>{i + 1}</div>
                  <div className={styles.psInfo}>
                    <div className={styles.psTitle}>{step.title}</div>
                    <div className={styles.psText}>{step.text}</div>
                    {step.time && <div className={styles.psTime}>{step.time}</div>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <section className={styles.talk}>
        <div className="wrap">
          <div className={styles.talkInner}>
            <div className={styles.talkLeft}>
              <h2>
                Talk to someone who's <em>been there.</em>
              </h2>
              <p>
                The Queer Parent Network connects people who are building families
                with members who've already been through it — same routes, similar
                situations. Not professionals. Just people who've done it and want
                to help.
              </p>
              <div className={styles.talkBtns}>
                <Button to={MENTORSHIP} variant="primary" size="lg">
                  Find a peer mentor
                </Button>
                <Button to={FORUM} variant="ghost-dark" size="lg">
                  Queer Parent Network →
                </Button>
              </div>
            </div>
            <div className={styles.talkCards}>
              {TALK_CARDS.map((c) => (
                <div className={styles.talkCard} key={c.name}>
                  <div
                    className={styles.tcAv}
                    style={{ background: c.bg, color: c.color }}
                  >
                    {c.initials}
                  </div>
                  <div>
                    <div className={styles.tcName}>{c.name}</div>
                    <div className={styles.tcDetail}>{c.detail}</div>
                    <div className={styles.tcNote}>{c.note}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className={styles.forumCta}>
        <div className="wrap">
          <div className={styles.forumCtaInner}>
            <div className={styles.forumCtaText}>
              <h3>
                Questions the page <em>doesn't answer?</em>
              </h3>
              <p>
                The Family Building forum thread is where members share current
                experience, ask questions, and support each other through a
                process that no guide can fully capture.
              </p>
            </div>
            <div className={styles.forumCtaBtns}>
              <Button to={FORUM} variant="primary">
                Open the forum thread
              </Button>
              <Button to={LEGAL} variant="ghost">
                Legal resources →
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.outro}>
        <div className="wrap">
          <h2>
            Your family is <em>real.</em>
          </h2>
          <p className={styles.outroSub}>
            Whatever route you take, whatever shape it takes. The community is
            here.
          </p>
          <Button to={INVITE} variant="primary" size="lg">
            Join QueerPulse
          </Button>
        </div>
      </section>
    </PageShell>
  );
}
