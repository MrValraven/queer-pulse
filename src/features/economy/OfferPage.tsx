import { Link } from "react-router-dom";
import { FiClipboard } from "react-icons/fi";
import { PageShell } from "../../shared/components/layout";
import { routes } from "../../app/routeMap";
import { useMemberContact } from "../connect/useMemberContact";
import styles from "./OfferPage.module.css";
import { Button, EmptyState } from "../../shared/components/ui";
import { MEMBERS, memberName } from "../members/data/members";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useDemoMode } from "../../app/providers/DemoModeProvider";

type Kind = "looking" | "offering";
type Tint = "coral" | "jade" | "plum";

interface Offer {
  slug: string;
  kind: Kind;
  title: string;
  body: string;
  owner: {
    first: string;
    last: string;
    initials: string;
    tint: Tint;
    role: string;
    hood: string;
    verified?: boolean;
  };
}

const TINT_BG: Record<Tint, string> = {
  coral: "rgba(var(--accent-rgb),.15)",
  jade: "rgba(var(--jade-rgb),.15)",
  plum: "rgba(var(--plum-rgb),.1)",
};
const TINT_FG: Record<Tint, string> = {
  coral: "var(--accent-ink)",
  jade: "var(--jade)",
  plum: "var(--plum)",
};

const MAIN: Offer = {
  slug: "zine-collab",
  kind: "looking",
  title: "A collaborator for a queer zine launching in September",
  body: "I'm putting together a risograph zine about queer life across Lisbon's bairros and I'm looking for one more person to make it with — ideally someone who writes or illustrates and wants a real say in the editorial direction, not just a commission. It's unpaid for now but everything we make is split evenly, and I have studio access and print connections. Come with opinions.",
  owner: {
    first: "Inês",
    last: "Tavares",
    initials: "IT",
    tint: "coral",
    role: "Graphic Designer · Atelier Pulso",
    hood: "Príncipe Real",
    verified: true,
  },
};

const OTHERS: { slug: string; kind: Kind; title: string; by: string }[] = [
  {
    slug: "free-portraits",
    kind: "offering",
    title: "Free portrait sessions for trans & nonbinary members",
    by: `${memberName("andre")} · ${MEMBERS.andre!.hood}`,
  },
  {
    slug: "mentoring-engineers",
    kind: "offering",
    title: "Monthly mentoring for junior engineers",
    by: `${memberName("rui")} · ${MEMBERS.rui!.hood}`,
  },
  {
    slug: "sublet-arroios",
    kind: "looking",
    title: "A sublet in Arroios, June through August",
    by: `${memberName("carla")} · ${MEMBERS.carla!.hood}`,
  },
];

export function OfferPage() {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const o = MAIN;
  const owner = o.owner;
  const { connected, contact } = useMemberContact("ines");
  const profile = routes.members;
  const offer = routes.offer;

  // There is no economy/offers backend yet, so the offer content below is
  // entirely mock personas. Never render fabricated members in live — show a
  // "coming soon" state until the board is wired to the API.
  if (!demoMode) {
    return (
      <PageShell>
        <div className={styles.page}>
          <div className="wrap">
            <EmptyState
              icon={<FiClipboard />}
              title={t("economy:offerBoard.comingSoon.title")}
              description={t("economy:offerBoard.comingSoon.body")}
              action={{
                label: t("economy:offerBoard.backLink"),
                to: routes.economy,
              }}
            />
          </div>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className={styles.page}>
        <div className="wrap">
          <div className={styles.backLink}>
            <a href="/#board">{t("economy:offerBoard.backLink")}</a>
          </div>
          <div className={styles.grid}>
            <div>
              <span
                className={[
                  styles.kindPill,
                  o.kind === "looking" ? styles.looking : styles.offering,
                ].join(" ")}
              >
                {o.kind === "looking"
                  ? t("economy:offerBoard.pill.looking")
                  : t("economy:offerBoard.pill.offering")}
              </span>
              <h1 className={styles.title}>{o.title}</h1>
              <p className={styles.body}>{o.body}</p>
              <div className={styles.cta}>
                <Button
                  onClick={() => contact({ slug: "ines", name: owner.first })}
                  variant="primary"
                  size="lg"
                >
                  {connected
                    ? t("connect:contact.message")
                    : t("economy:offerBoard.respondCta", { name: owner.first })}
                </Button>
                <Button to={profile} variant="ghost" size="lg">
                  {t("economy:offerBoard.seeProfileCta")}
                </Button>
              </div>
            </div>
            <aside className={styles.sidebar}>
              <div className={styles.sh}>
                {t("economy:offerBoard.postedBy")}
              </div>
              <div className={styles.posterRow}>
                <div
                  className={styles.posterAv}
                  style={{
                    background: TINT_BG[owner.tint],
                    color: TINT_FG[owner.tint],
                  }}
                >
                  {owner.initials}
                </div>
                <div>
                  <div className={styles.posterName}>
                    {owner.first} {owner.last}
                  </div>
                  <div className={styles.posterMeta}>
                    {owner.role.split("·")[0]!.trim()}
                    <br />
                    {owner.hood}
                  </div>
                </div>
              </div>
              <div className={styles.sidebarNote}>
                {t(
                  owner.verified
                    ? "economy:offerBoard.sidebarNoteVerified"
                    : "economy:offerBoard.sidebarNote",
                  { name: owner.first },
                )}
              </div>
              <Button
                onClick={() => contact({ slug: "ines", name: owner.first })}
                variant="primary"
                className={styles.sidebarBtn}
              >
                {connected
                  ? t("connect:contact.message")
                  : t("economy:offerBoard.sayHelloCta", { name: owner.first })}
              </Button>
            </aside>
          </div>

          <div className={styles.other}>
            <h2>
              <Translation
                i18nKey="economy:offerBoard.moreFromBoard"
                components={{ em: <em /> }}
              />
            </h2>
            <div className={styles.offerList}>
              {OTHERS.map((other) => (
                <Link to={offer} className={styles.offerItem} key={other.slug}>
                  <span
                    className={[
                      styles.ok,
                      other.kind === "looking"
                        ? styles.okLooking
                        : styles.okOffering,
                    ].join(" ")}
                  >
                    {other.kind === "looking"
                      ? t("economy:offerBoard.pill.looking")
                      : t("economy:offerBoard.pill.offering")}
                  </span>
                  <h3>{other.title}</h3>
                  <div className={styles.by}>{other.by}</div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
