import type { ReactNode } from "react";
import { PageHero, PageShell } from "../../shared/components/layout";
import { Button, Outro } from "../../shared/components/ui";
import s from "./GuidelinesPage.module.css";

interface Clause {
  num: string;
  titlePre: string;
  titleEm: string;
  body: ReactNode;
}

const CLAUSES: Clause[] = [
  {
    num: "01",
    titlePre: "What this place ",
    titleEm: "is",
    body: (
      <>
        <p>
          QueerPulse is a professional network for LGBTQ+ people in Lisbon. It
          exists because we believe queer professionals deserve a space that
          feels like theirs — not a corporate platform that tolerates us, not a
          social app that algorithmically rewards performance.
        </p>
        <p>
          The network is built on trust between people. Vouching is how that
          trust works. If you're here, someone who knows you put their name to
          that fact. That means something.
        </p>
      </>
    ),
  },
  {
    num: "02",
    titlePre: "What we're here ",
    titleEm: "to do",
    body: (
      <>
        <p>
          QueerPulse is for finding collaborators, getting mentoring,
          discovering what's happening in the city, and meeting people you'd
          actually want to know. It is not for:
        </p>
        <ul>
          <li>Building a following or growing an audience</li>
          <li>Pitching services to people who didn't ask</li>
          <li>Scraping contacts for external use</li>
          <li>Performing queerness as a brand identity</li>
          <li>Treating other members as leads rather than people</li>
        </ul>
        <p>
          If something you're doing would feel uncomfortable at a small dinner
          among friends, it probably shouldn't happen here.
        </p>
      </>
    ),
  },
  {
    num: "03",
    titlePre: "How we treat ",
    titleEm: "each other",
    body: (
      <>
        <p>
          The basics: don't be cruel. Don't weaponise someone's identity or
          visibility. Don't out people — inside or outside the network. Don't
          use someone's private information to harm them.
        </p>
        <p>
          Beyond the basics: try to be generous. Give people the benefit of the
          doubt. When you disagree, say so directly and kindly rather than
          complaining about them to others.
        </p>
        <p>
          <b>On pronouns:</b> use the pronouns someone has shared. If you don't
          know, ask or use neutral forms until you do. Mistakes happen and are
          forgiven. Refusals are not.
        </p>
      </>
    ),
  },
  {
    num: "04",
    titlePre: "On privacy and ",
    titleEm: "visibility",
    body: (
      <>
        <p>
          What someone shares within QueerPulse stays within QueerPulse —
          whether someone is a member, their visibility setting, what they've
          posted on the board, and anything said in private messages.
        </p>
        <p>
          Outing someone — to employers, family, the press, or anyone outside
          the network — is a serious violation and will result in immediate
          removal.
        </p>
      </>
    ),
  },
  {
    num: "05",
    titlePre: "On the board and ",
    titleEm: "gatherings",
    body: (
      <>
        <p>
          Asks and Offers should be genuine. Don't post things you're not
          actually offering, or requests you're not actually making. The board
          works because people trust it.
        </p>
        <p>
          Gatherings run on the understanding that participants treat each
          other's homes, studios, and spaces with care. If you RSVP, show up or
          let the host know in advance.
        </p>
      </>
    ),
  },
  {
    num: "06",
    titlePre: "On conflict and ",
    titleEm: "disagreement",
    body: (
      <>
        <p>
          Conflict will happen. Our preference is for direct, private
          conversation first. If that fails, or if the conflict involves a
          potential safety issue, bring it to the team.
        </p>
        <p>
          The team is not a court. We make judgment calls based on the full
          picture as we understand it. We will be honest about what we don't
          know.
        </p>
      </>
    ),
  },
  {
    num: "07",
    titlePre: "The lines we ",
    titleEm: "don't cross",
    body: (
      <>
        <p>
          Most of this document is about tone and intent. But there are things
          that result in immediate removal, no discussion:
        </p>
        <div className={s.hardLines}>
          <div className={s.hlHead}>Immediate removal</div>
          <ul>
            <li>Outing a member outside the network</li>
            <li>Sharing a member's private information without consent</li>
            <li>Sexual harassment or unsolicited explicit contact</li>
            <li>
              Racism, transphobia, biphobia, or any targeted discrimination
            </li>
            <li>
              Using the network to harm someone — financially, professionally,
              or personally
            </li>
            <li>Impersonating another member</li>
          </ul>
        </div>
      </>
    ),
  },
];

export function GuidelinesPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Community guidelines"
        title={
          <>
            The Code <em>of Care.</em>
          </>
        }
        sub="This is not a terms of service. It's how we want to treat each other — written plainly, without legal language, by the people who built this room."
      />

      <div className="wrap">
        <div className={s.content}>
          <div className={s.updated}>
            <span className={s.uDot} /> Last revised June 2026 · Version 1.4
          </div>
          {CLAUSES.map((c) => (
            <div key={c.num} className={s.clause}>
              <div className={s.clauseNum}>{c.num}</div>
              <div>
                <h2>
                  {c.titlePre}
                  <em>{c.titleEm}</em>
                </h2>
                {c.body}
              </div>
            </div>
          ))}
          <hr className={s.divider} />
          <div className={s.clause}>
            <div
              className={s.clauseNum}
              style={{ color: "rgba(74,140,111,.4)" }}
            >
              →
            </div>
            <div>
              <h2>
                If something isn't <em>right</em>
              </h2>
              <p>
                Tell us. We read every message sent to <b>safe@queerpulse.pt</b>{" "}
                and respond within 24 hours. You will not be identified to the
                person you're reporting unless you choose to be.
              </p>
              <p>
                If you think this document is wrong about something, or missing
                something, write to us. It's a living document — Version 1.4 is
                not the final word.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Outro
        title={
          <>
            A room worth being <em>in.</em>
          </>
        }
        sub="The code of care only works if everyone holds it. We're grateful you're here."
      >
        <Button size="lg" to="/">
          Back to QueerPulse
        </Button>
      </Outro>
    </PageShell>
  );
}
