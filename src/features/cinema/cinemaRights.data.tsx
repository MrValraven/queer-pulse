import type { ReactNode } from "react";

/**
 * i18n note: the short-version table, side-nav/section labels, and contract
 * card below are platform-authored chrome and are translated via Pattern B
 * builders (`buildShortVersion`/`buildSectionMeta`/`buildContractPoints`).
 * The FAQ question/answer pairs and the contact block's own title/body in
 * `sections`/`contact` below quote precise contract clauses — per the i18n
 * sweep brief's "stop and flag" rule for legal copy, they are deliberately
 * left in English rather than risk a mistranslated contractual term.
 */
export interface ShortRow {
  labelKey: string;
  valueKey: string;
}

/** Pattern A — labels/values are catalog keys; component resolves via <Translation>. */
export const shortVersionRows: ShortRow[] = [
  {
    labelKey: "cinema:rights.shortVersion.revenueSplit.label",
    valueKey: "cinema:rights.shortVersion.revenueSplit.value",
  },
  {
    labelKey: "cinema:rights.shortVersion.tips.label",
    valueKey: "cinema:rights.shortVersion.tips.value",
  },
  {
    labelKey: "cinema:rights.shortVersion.contractType.label",
    valueKey: "cinema:rights.shortVersion.contractType.value",
  },
  {
    labelKey: "cinema:rights.shortVersion.territory.label",
    valueKey: "cinema:rights.shortVersion.territory.value",
  },
  {
    labelKey: "cinema:rights.shortVersion.exitNotice.label",
    valueKey: "cinema:rights.shortVersion.exitNotice.value",
  },
  {
    labelKey: "cinema:rights.shortVersion.rightsRetained.label",
    valueKey: "cinema:rights.shortVersion.rightsRetained.value",
  },
];

/** Pattern A — sole consumer resolves each key via `t()`. */
export const contractPointKeys: string[] = [
  "cinema:rights.contractCard.point.pay",
  "cinema:rights.contractCard.point.tips",
  "cinema:rights.contractCard.point.nonExclusive",
  "cinema:rights.contractCard.point.territory",
  "cinema:rights.contractCard.point.consent",
  "cinema:rights.contractCard.point.withdraw",
];

export interface FaqItem {
  q: string;
  a: ReactNode;
}

export interface RightsSection {
  id: string;
  /** Catalog key for the short side-nav label (e.g. "The contract"). */
  labelKey: string;
  /** Catalog key for the section's <em>-emphasis heading, via <Translation>. */
  titleKey: string;
  items: FaqItem[];
}

export const sections: RightsSection[] = [
  {
    id: "contract",
    labelKey: "cinema:rights.section.contract.label",
    titleKey: "cinema:rights.section.contract.title",
    items: [
      {
        q: "Is the contract really non-exclusive?",
        a: (
          <>
            Yes. Unambiguously. You can show your film on Mubi, your own
            website, at festivals, for free on YouTube, or anywhere else you
            choose. We hold no exclusivity over any territory, format, or
            distribution channel. The contract uses the term “non-exclusive
            licence” precisely. You are granting us the right to show your film
            on our platform — you are not transferring or limiting your
            ownership or right to show it elsewhere.
            <span className="highlight">
              <strong>In the contract:</strong> “The Filmmaker grants QueerPulse
              Cinema Co-op CRL a non-exclusive, revocable, worldwide (subject to
              territorial restrictions elected by the Filmmaker) licence to
              stream the Film on the Cinema platform.”
            </span>
          </>
        ),
      },
      {
        q: "Who owns the film after I submit it?",
        a: (
          <>
            You do. Completely. The contract does not transfer any intellectual
            property rights. We are granted a licence to show your film, not
            ownership of it. When the contract ends, the licence expires and we
            remove the film from the catalogue.
          </>
        ),
      },
      {
        q: "How long does the contract run?",
        a: (
          <>
            12 months, renewable automatically unless either party gives 30
            days' written notice. You can also terminate at any time with 30
            days' notice, with no penalty. We can only terminate for material
            breach (e.g. the film contains content you misrepresented on
            submission).
          </>
        ),
      },
      {
        q: "Can I change my pricing model after submitting?",
        a: (
          <>
            Yes, once per year. You can move between free-to-watch, sustainer
            library, rent, and buy models with 30 days' notice. If you move a
            film from paid to free, pending rentals are honoured. If you move
            from free to paid, we give viewers 14 days' notice before access
            becomes restricted.
          </>
        ),
      },
    ],
  },
  {
    id: "revenue",
    labelKey: "cinema:rights.section.revenue.label",
    titleKey: "cinema:rights.section.revenue.title",
    items: [
      {
        q: "When do I get paid?",
        a: (
          <>
            <strong>Every Monday</strong>, for all transactions in the previous
            7-day period. There is no minimum threshold — if you earned €0.80
            this week, we send €0.80. Payment is by IBAN transfer or Stripe,
            your choice. Statements are available in your Studio dashboard in
            real time.
          </>
        ),
      },
      {
        q: "How is the 80% calculated?",
        a: (
          <>
            Gross transaction value × 80%. So a €3.00 rental = €2.40 to you. A
            €8.00 purchase = €6.40 to you. Payment processing fees (Stripe/SEPA)
            are covered by the remaining 20% —{" "}
            <em>they are not deducted from your 80%.</em> Tips are 100% — no
            processing fees are deducted from tips.
          </>
        ),
      },
      {
        q: "What about the sustainer library pool?",
        a: (
          <>
            If your film is in the sustainer library, you receive a
            per-minute-watched share of the monthly pool. The pool is 80% of
            sustainer subscription revenue after platform operating costs. The
            calculation is: (your film's minutes watched / total platform
            minutes watched) × pool total. The breakdown is published monthly in
            the public ledger.
          </>
        ),
      },
      {
        q: "Are tips really 100%?",
        a: (
          <>
            Yes. Tips are processed separately from film transactions. Payment
            processing fees on tips are absorbed by the co-op from operating
            reserves, not deducted from your tip. If someone sends you €7, you
            receive €7.
          </>
        ),
      },
    ],
  },
  {
    id: "territory",
    labelKey: "cinema:rights.section.territory.label",
    titleKey: "cinema:rights.section.territory.title",
    items: [
      {
        q: "Can I restrict which countries my film is available in?",
        a: (
          <>
            Yes. During submission, you select the territories where the film
            can be shown. We enforce these with geo-restriction. If you have a
            festival deal that restricts a specific country for a specific
            period, tell us and we implement it. Territory restrictions can be
            updated at any time via your Studio dashboard.
          </>
        ),
      },
      {
        q: "What if I sell distribution rights to another platform?",
        a: (
          <>
            Because the contract is non-exclusive, selling distribution rights
            to another platform doesn't affect your agreement with us — unless
            the new deal requires exclusivity in a territory, in which case
            contact us and we'll geo-restrict accordingly. We never require
            first-refusal or matching rights.
          </>
        ),
      },
    ],
  },
  {
    id: "content",
    labelKey: "cinema:rights.section.content.label",
    titleKey: "cinema:rights.section.content.title",
    items: [
      {
        q: "Can the co-op edit or re-cut my film?",
        a: (
          <>
            No. We never alter your film — no re-cuts, no colour changes, no
            trims — without your <strong>written consent</strong>. The only
            processing we do is technical: transcoding for streaming and
            generating captions, and even those we run past you before they go
            live.
            <span className="highlight">
              <strong>In the contract:</strong> “QueerPulse shall not modify,
              edit, or create derivative works of the Film without the prior
              written consent of the Filmmaker.”
            </span>
          </>
        ),
      },
      {
        q: "Who controls the title, synopsis, poster, and metadata?",
        a: (
          <>
            You do. The film page shows the title, synopsis, credits, poster,
            and content tags exactly as you submit them. Our curators may{" "}
            <em>suggest</em> a collection blurb or a programming note, but they
            never overwrite your own copy, and anything they add is clearly
            attributed to the co-op, not to you.
          </>
        ),
      },
      {
        q: "Are content warnings and tags mine to set?",
        a: (
          <>
            Yes — and we honour them as submitted. You decide the content
            warnings and identity tags that appear on your film. We won't add or
            remove a warning without asking you first, and we never re-tag a
            film to change how it's marketed.
          </>
        ),
      },
      {
        q: "Can I ask for my film to be taken down temporarily?",
        a: (
          <>
            Yes. If you need the film pulled — for a festival window, a re-edit,
            or any personal reason — tell us and we remove it from the catalogue
            within <strong>48 hours</strong>, no questions asked. It stays down
            until you ask us to restore it. Taking a film down doesn't end your
            contract.
          </>
        ),
      },
    ],
  },
  {
    id: "exit",
    labelKey: "cinema:rights.section.exit.label",
    titleKey: "cinema:rights.section.exit.title",
    items: [
      {
        q: "How do I withdraw my film?",
        a: (
          <>
            One click in your Studio dashboard, or an email to the rights team.
            We remove the film at the end of a{" "}
            <strong>30-day notice period</strong> — there is no penalty and no
            exit fee. If you need it gone sooner for an urgent reason, ask;
            we'll do our best.
          </>
        ),
      },
      {
        q: "What happens to money already earned when I leave?",
        a: (
          <>
            You keep all of it. Any transactions up to the day the film comes
            down are paid on the normal <strong>Monday cycle</strong>, and we
            issue a final statement once the last payment clears. Leaving never
            forfeits earnings you've already made.
          </>
        ),
      },
      {
        q: "Can I export my data and statements?",
        a: (
          <>
            Yes. You can export your full earnings history, viewing statistics,
            and statements from your Studio dashboard at any time — as CSV or
            PDF — whether or not you're leaving. Your data is yours.
          </>
        ),
      },
      {
        q: "When can the co-op terminate my agreement?",
        a: (
          <>
            Only for <strong>material breach</strong> — for example, if the film
            contains content you misrepresented on submission, or you don't
            actually hold the rights you told us you held. Even then, we give
            you written notice and a chance to put it right before anything
            comes down. We can't terminate simply because a film isn't popular.
          </>
        ),
      },
    ],
  },
  {
    id: "access",
    labelKey: "cinema:rights.section.access.label",
    titleKey: "cinema:rights.section.access.title",
    items: [
      {
        q: "Do I have to pay for captions?",
        a: (
          <>
            No. Captioning is funded by the co-op out of the 20% — it is{" "}
            <em>never</em> skimmed from your 80%. Every film gets captions
            before it goes live, and we run them past you first so names and
            spellings are right.
            <span className="highlight">
              <strong>Always free to you:</strong> captions, transcoding, and
              hosting are co-op costs, not filmmaker costs.
            </span>
          </>
        ),
      },
      {
        q: "Is audio description available?",
        a: (
          <>
            Where it's feasible, yes, and we fund it the same way we fund
            captions. It's opt-in — tell us at submission or later, and we'll
            arrange described audio for your film.
          </>
        ),
      },
      {
        q: "Is the Studio dashboard accessible?",
        a: (
          <>
            We build to WCAG 2.1 AA: full keyboard navigation, screen-reader
            labelling, and visible focus states throughout Studio. If you hit
            something that doesn't work with your assistive tech, tell the
            rights team and we treat it as a bug, not a feature request.
          </>
        ),
      },
      {
        q: "How do I request a specific accessible format?",
        a: (
          <>
            Email <strong>rights@queerpulse.pt</strong> or raise it from your
            Studio dashboard. Whether it's described audio, a specific caption
            format, or an alternative statement layout, a human will sort it out
            with you.
          </>
        ),
      },
    ],
  },
];

export const contact = {
  id: "contact",
  /** Reuses the already-translated "Contact" heading from the curator aside. */
  labelKey: "cinema:curator.aside.contactHeading",
  title: (
    <>
      Have a question <em>not answered here</em>?
    </>
  ),
  body: (
    <>
      Write to <strong>rights@queerpulse.pt</strong> — a human will reply
      within 48 hours, in English or Portuguese. We don't use template responses
      for legal questions.
    </>
  ),
};

export const navItems: { id: string; labelKey: string }[] = [
  ...sections.map((s) => ({ id: s.id, labelKey: s.labelKey })),
  { id: contact.id, labelKey: contact.labelKey },
];
