import { type ReactNode } from "react";

export interface Article {
  id: string;
  roman: string;
  toc: string;
  title: ReactNode;
  clauses: { n: string; body: ReactNode }[];
  quote?: ReactNode;
}

export const ARTICLES: Article[] = [
  {
    id: "art1",
    roman: "I",
    toc: "I · Purpose",
    title: "Purpose",
    clauses: [
      {
        n: "§1·1",
        body: (
          <>
            QueerPulse exists to provide{" "}
            <strong>professional, social, cultural and material support</strong>{" "}
            to LGBTQ+ people in the city of Lisbon, and (per Article X) in other
            cities once specific conditions are met.
          </>
        ),
      },
      {
        n: "§1·2",
        body: (
          <>
            The organisation is a <strong>não-lucrativa associação</strong> — a
            not-for-profit association. It owns no equity, distributes no
            profits, and may only be dissolved per Article XI.
          </>
        ),
      },
      {
        n: "§1·3",
        body: (
          <>
            Where this Constitution conflicts with the Manifesto, this document
            prevails. The Manifesto sets values; this sets operations.
          </>
        ),
      },
    ],
  },
  {
    id: "art2",
    roman: "II",
    toc: "II · Members",
    title: "Members",
    clauses: [
      {
        n: "§2·1",
        body: (
          <>
            A <strong>member</strong> is any individual who has been vouched for
            by an existing member, completed a brief check-in with the
            moderation team, and accepted the Code of Conduct.
          </>
        ),
      },
      {
        n: "§2·2",
        body: (
          <>
            Members may be on any of three tiers: <em>Solidarity</em> (free),{" "}
            <em>Member</em> (€36/year), or <em>Sustainer</em> (€96/year). All
            tiers carry equal voting rights.
          </>
        ),
      },
      {
        n: "§2·3",
        body: (
          <>
            No member's status — including age, nationality, language, identity,
            occupation, or visibility — affects their voting rights or treatment
            in moderation.
          </>
        ),
      },
    ],
  },
  {
    id: "art3",
    roman: "III",
    toc: "III · Vouching",
    title: "Vouching",
    clauses: [
      {
        n: "§3·1",
        body: (
          <>
            Each existing member may vouch for up to <strong>two</strong> new
            members per calendar year. Vouches attach the voucher's name to the
            new member's record, permanently.
          </>
        ),
      },
      {
        n: "§3·2",
        body: (
          <>
            The invite cap may be temporarily raised by Assembly vote to a
            maximum of four per member, for one calendar year, in cases of
            identified network gaps.
          </>
        ),
      },
      {
        n: "§3·3",
        body: (
          <>
            A member whose three most recent vouches have all been removed under
            Article VIII forfeits the right to vouch for twelve months.
          </>
        ),
      },
    ],
  },
  {
    id: "art4",
    roman: "IV",
    toc: "IV · Assembly",
    title: (
      <>
        The Annual <em>Assembly</em>
      </>
    ),
    clauses: [
      {
        n: "§4·1",
        body: (
          <>
            The Assembly convenes once per year, in November, for at least one
            full day. It is the highest decision-making body of the association.
          </>
        ),
      },
      {
        n: "§4·2",
        body: (
          <>
            Every member is entitled to one vote per resolution, cast in person,
            online, or asynchronously up to the close of voting.
          </>
        ),
      },
      {
        n: "§4·3",
        body: (
          <>
            Quorum is <strong>10% of active members</strong>, or 100 members,
            whichever is greater. Resolutions pass by simple majority unless
            this document or the Code of Conduct specifies otherwise.
          </>
        ),
      },
      {
        n: "§4·4",
        body: (
          <>
            The agenda is published 30 days in advance and is open to written
            amendment by any 10 members until 7 days before convening.
          </>
        ),
      },
    ],
    quote: (
      <>
        "This Assembly is the floor on which everything else stands.{" "}
        <em>Lose it, and you have only an app.</em>"
      </>
    ),
  },
  {
    id: "art5",
    roman: "V",
    toc: "V · Circles",
    title: (
      <>
        Rotating <em>circles</em>
      </>
    ),
    clauses: [
      {
        n: "§5·1",
        body: (
          <>
            Operational decisions are made by <strong>rotating circles</strong>:
            small standing committees of 3–7 members each, with 12-month maximum
            terms.
          </>
        ),
      },
      {
        n: "§5·2",
        body: (
          <>
            Active circles as of v1.4:{" "}
            <em>moderation, grants, finance, hosting, editorial, technical.</em>{" "}
            The Assembly may add or dissolve circles by simple majority.
          </>
        ),
      },
      {
        n: "§5·3",
        body: (
          <>
            No member may serve on more than two circles simultaneously, and no
            circle may have more than half its members from any single
            calendar-year cohort.
          </>
        ),
      },
    ],
  },
  {
    id: "art6",
    roman: "VI",
    toc: "VI · Money",
    title: "Money",
    clauses: [
      {
        n: "§6·1",
        body: (
          <>
            <strong>At least 90% of every euro received</strong> must be spent
            on community programmes, staff, and infrastructure — not on
            overheads. The target is 96% and has been met every year since 2024.
          </>
        ),
      },
      {
        n: "§6·2",
        body: (
          <>
            The annual budget is approved by the Assembly. The finance circle
            may rebalance within categories during the year without re-approval,
            up to 10% per category.
          </>
        ),
      },
      {
        n: "§6·3",
        body: (
          <>
            Annual accounts are{" "}
            <strong>audited by an independent third party</strong> with no
            financial relationship to the association, and published in full as
            part of the Transparency Report.
          </>
        ),
      },
      {
        n: "§6·4",
        body: (
          <>
            The association may not enter into debt arrangements above €10,000
            without explicit Assembly approval.
          </>
        ),
      },
    ],
  },
  {
    id: "art7",
    roman: "VII",
    toc: "VII · Speech",
    title: (
      <>
        Speech &amp; <em>moderation</em>
      </>
    ),
    clauses: [
      {
        n: "§7·1",
        body: (
          <>
            The community is moderated according to the Code of Conduct,
            ratified separately and amendable by Assembly supermajority (60%).
          </>
        ),
      },
      {
        n: "§7·2",
        body: (
          <>
            <strong>
              The association does not moderate criticism of itself.
            </strong>{" "}
            Posts critical of the association, its decisions, or its officers
            may not be removed under any clause of the Code of Conduct.
          </>
        ),
      },
      {
        n: "§7·3",
        body: (
          <>
            Moderation decisions are appealable to a standing appeals panel
            composed of three members not from the deciding circle. Appeals
            overturn decisions in approximately 11% of cases (2025 figure).
          </>
        ),
      },
    ],
  },
  {
    id: "art8",
    roman: "VIII",
    toc: "VIII · Removal",
    title: "Removal",
    clauses: [
      {
        n: "§8·1",
        body: (
          <>
            Members may be removed only through the moderation ladder specified
            in §04 of the Code of Conduct, and only by decision of the
            moderation circle, ratified by one additional independent moderator.
          </>
        ),
      },
      {
        n: "§8·2",
        body: (
          <>
            Removal is appealable <strong>once</strong>, to the appeals panel,
            within 14 days of effective date.
          </>
        ),
      },
      {
        n: "§8·3",
        body: (
          <>
            A removed member's data is deleted or anonymised per the Privacy
            Policy within 30 days. Case records are kept for 36 months in case
            of legal need.
          </>
        ),
      },
    ],
  },
  {
    id: "art9",
    roman: "IX",
    toc: "IX · Partners",
    title: "Partners",
    clauses: [
      {
        n: "§9·1",
        body: (
          <>
            The association may enter into{" "}
            <strong>operational partnerships</strong> with other organisations
            under terms approved by the Assembly. New operational partnerships
            are capped at two per year.
          </>
        ),
      },
      {
        n: "§9·2",
        body: (
          <>
            No partnership may grant a partner organisation access to member
            data beyond what is operationally necessary, and only with the
            affected member's explicit consent.
          </>
        ),
      },
      {
        n: "§9·3",
        body: (
          <>
            Either side of any partnership may publicly dissent from the other's
            positions. <em>Coalition is not consensus.</em>
          </>
        ),
      },
    ],
  },
  {
    id: "art10",
    roman: "X",
    toc: "X · Expansion",
    title: "Expansion",
    clauses: [
      {
        n: "§10·1",
        body: (
          <>
            The association may open in cities other than Lisbon only when all
            of these are true: (a) at least one moderator is in-country; (b) an
            operational local partner is signed; (c) a local legal review is
            complete; (d) eight to twelve founding members have committed to the
            soft-launch.
          </>
        ),
      },
      {
        n: "§10·2",
        body: (
          <>
            Each new city ratifies its own local circle and operates under this
            Constitution, with city-specific bylaws as needed.
          </>
        ),
      },
    ],
  },
  {
    id: "art11",
    roman: "XI",
    toc: "XI · Dissolution",
    title: "Dissolution",
    clauses: [
      {
        n: "§11·1",
        body: (
          <>
            The association may be dissolved only by Assembly resolution
            requiring a <strong>75% supermajority</strong> of all active
            members, not merely of those voting.
          </>
        ),
      },
      {
        n: "§11·2",
        body: (
          <>
            On dissolution, all remaining assets must be transferred to ILGA
            Portugal, or to a successor LGBTQ+ organisation chosen by the
            dissolving Assembly. No assets may be distributed to individuals.
          </>
        ),
      },
    ],
  },
  {
    id: "art12",
    roman: "XII",
    toc: "XII · Amendments",
    title: "Amendments",
    clauses: [
      {
        n: "§12·1",
        body: (
          <>
            This Constitution may be amended only by Assembly resolution
            requiring a 60% supermajority of votes cast.
          </>
        ),
      },
      {
        n: "§12·2",
        body: (
          <>
            Amendments must be circulated for written comment to all members at
            least 30 days before the vote.
          </>
        ),
      },
      {
        n: "§12·3",
        body: (
          <>
            Versioning is sequential (v1.0, v1.1…). The current version's full
            text is published at all times.
          </>
        ),
      },
    ],
  },
];
