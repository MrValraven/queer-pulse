/** In-app document content for the six housing co-op "formation templates"
 *  shown as cards on the housing co-op page (see `COOP_TEMPLATES` in
 *  `housingCoop.data.ts`). Each template card's `slug` looks up its full
 *  document here. `CoopTemplateSlug` is the single source of truth for the
 *  slug union — `housingCoop.data.ts` imports it rather than redeclaring it.
 *
 *  These are QueerPulse-authored starting drafts, not legal or financial
 *  advice. Every document says so explicitly, and any money or legal detail
 *  that reads as a specific figure or clause is a fill-in-the-bracket
 *  example, not a real number to sign against. */

export type CoopTemplateSlug =
  | "founding-values"
  | "financial-honesty"
  | "crl-statutes"
  | "share-agreement"
  | "finance-model"
  | "conflict-resolution";

export interface CoopTemplateSection {
  heading: string;
  /** Paragraphs and/or bullet lists in document order. */
  blocks: Array<
    { kind: "p"; text: string } | { kind: "list"; items: string[] }
  >;
}

export interface CoopTemplateDoc {
  slug: CoopTemplateSlug;
  /** Short chip label, e.g. "Phase 1 · template" — mirrors the card's tag. */
  tag: string;
  /** Plain half of the document title. */
  title: string;
  /** Coral-italic half of the document title (single emphasis word/phrase). */
  titleEm: string;
  intro: string;
  sections: CoopTemplateSection[];
}

export const COOP_TEMPLATE_CONTENT: Record<CoopTemplateSlug, CoopTemplateDoc> = {
  "founding-values": {
    slug: "founding-values",
    tag: "Phase 1 · template",
    title: "Founding Values",
    titleEm: "Charter",
    intro:
      "Your founding values charter is the first thing your group writes together — before a mortgage application, before a lease, before anyone signs anything with a bank or a notary. It puts into words what you're building and for whom, so that six months from now, when money is tight or a decision is hard, you have something to return to together. Treat everything below as a first draft: read it out loud as a group, cross out what doesn't fit, and rewrite it in your own words until it sounds like you.",
    sections: [
      {
        heading: "Why we're forming this co-op",
        blocks: [
          {
            kind: "p",
            text: "Start with one or two sentences that say, plainly, what this co-op is for. Not a mission statement for outsiders — a private answer for the people signing the shares. What are you protecting each other from, and what are you building toward?",
          },
          {
            kind: "list",
            items: [
              "We are forming this co-op so that none of us has to choose between staying closeted and staying housed.",
              "We want a home where ageing, disability, and care needs are planned for, not discovered too late.",
              "We're pooling what we have so that people who'd be priced out alone can stay in the city they call home.",
            ],
          },
        ],
      },
      {
        heading: "Who we are, and who this home is for",
        blocks: [
          {
            kind: "p",
            text: "Name explicitly who belongs here and on what terms. Silence on this point tends to default to whoever already holds power in the room — so write it down.",
          },
          {
            kind: "list",
            items: [
              "This is a queer- and trans-affirming home. We use the names and pronouns people ask us to use, without debate, from day one.",
              "We commit to actively working against racism, transphobia, ableism, and classism in who we admit, how we speak to each other, and whose needs get prioritised in repairs and budgeting.",
              "We will make our physical spaces and our decision-making processes as accessible as we're able to, and we'll keep improving them as our members' needs change.",
              "New members join through [describe your process here — a trial period, a vouching system, a vote of the full group].",
            ],
          },
        ],
      },
      {
        heading: "How we make decisions together",
        blocks: [
          {
            kind: "p",
            text: "Pick a method before you need one under pressure. Many co-ops start with consensus and add a fallback for when consensus stalls.",
          },
          {
            kind: "list",
            items: [
              "Day-to-day decisions (small repairs, guest policy, the shared calendar) are made by whoever's affected, informing the group afterwards.",
              "Household-level decisions (budget changes, new members, house rules) go to the full assembly, with a stated quorum.",
              "When consensus can't be reached after genuine effort, we fall back to [a supermajority vote, a cooling-off period and re-vote, an outside facilitator] — decide this now, while it's still hypothetical.",
            ],
          },
        ],
      },
      {
        heading: "How we take care of each other",
        blocks: [
          {
            kind: "p",
            text: "Safety and care commitments belong here, not only in a separate policy nobody reads.",
          },
          {
            kind: "list",
            items: [
              "We check in with each other, especially members going through a hard time, without making it any one person's job alone.",
              "We have a plan for what happens if a member is unsafe at home — from a partner, a family member, or anyone else — and it doesn't depend on that member asking perfectly for help.",
              "We don't out each other, to family, landlords, employers, or each other's contacts, ever, for any reason.",
            ],
          },
        ],
      },
      {
        heading: "Money & fairness",
        blocks: [
          {
            kind: "p",
            text: "Say plainly what fairness means to your group before the finance model (see the Finance Model Explainer) turns it into numbers.",
          },
          {
            kind: "list",
            items: [
              "Contributions are scaled to what people can actually pay, not split identically by default.",
              "No one loses their home over money without the group first trying every alternative together (see the Financial Honesty Agreement and the Conflict Resolution Process).",
              "Financial information about the co-op is available to every member, always. There are no closed books here.",
            ],
          },
        ],
      },
      {
        heading: "Revisiting these values",
        blocks: [
          {
            kind: "p",
            text: "Values drift if nobody re-reads them. Set a date, not just a good intention.",
          },
          {
            kind: "list",
            items: [
              "We re-read this charter together at least once a year, and after any major event that tested it.",
              "Changes need [a supermajority / full consensus — decide which] and take effect only after every member has seen the proposed wording.",
            ],
          },
          {
            kind: "p",
            text: "This charter is a starting template, not a finished document — the version that matters is the one your group argues its way into, and revisits every year after.",
          },
        ],
      },
    ],
  },

  "financial-honesty": {
    slug: "financial-honesty",
    tag: "Phase 1 · template",
    title: "Financial Honesty",
    titleEm: "Agreement",
    intro:
      "Housing co-ops fail more often over unspoken money trouble than over any legal problem. This agreement exists so that a member who's struggling says so in week two, not month eight — and so nobody has to guess what anyone else earns, owes, or is worried about. Adapt the specifics to your group; keep the principle that everyone sees the same numbers.",
    sections: [
      {
        heading: "What full transparency means here",
        blocks: [
          {
            kind: "p",
            text: "Financial transparency doesn't mean everyone reveals their entire personal finances. It means everyone sees the same numbers about the co-op, and the group agrees in advance what individual information is shared, and why.",
          },
          {
            kind: "list",
            items: [
              "Every member can see the co-op's shared ledger at any time, not only at the annual meeting.",
              "Individual contribution amounts (if scaled to income) are visible to the group, though the underlying payslips or tax returns are not, unless a member chooses to share them.",
              "No side agreements about money exist outside this document and the shared ledger.",
            ],
          },
        ],
      },
      {
        heading: "What each member discloses, and when",
        blocks: [
          {
            kind: "p",
            text: "Be specific about what's asked for at joining versus what's ongoing.",
          },
          {
            kind: "list",
            items: [
              "At joining: whether you can meet the full share amount, on what schedule, and any support you're bringing to or need from the group's solidarity fund.",
              "Ongoing: any change that affects your ability to pay — job loss, illness, a change in hours — disclosed to [a finance steward / the full group] as soon as you know, not after you've missed a payment.",
              "Annually: a joint review of whether contributions still reflect people's actual circumstances.",
            ],
          },
        ],
      },
      {
        heading: "The shared ledger",
        blocks: [
          {
            kind: "p",
            text: "Name the tool and the access rule, not only the intention.",
          },
          {
            kind: "list",
            items: [
              "The ledger lives in [a shared spreadsheet, accounting software] that every member can open, read, and export at any time.",
              "One or two members act as finance stewards, rotating every [year], responsible for entries — not for gatekeeping who gets to see them.",
              "Every payment in and out is logged within [one week], with a plain-language note. No line item nobody can explain.",
            ],
          },
        ],
      },
      {
        heading: "Handling arrears with dignity",
        blocks: [
          {
            kind: "p",
            text: "Write this process before anyone's actually behind — it's much harder to agree on once it's personal.",
          },
          {
            kind: "list",
            items: [
              "A missed payment triggers a private, non-punitive conversation within two weeks, not a group announcement.",
              "The member and a finance steward agree a repayment plan together; the group is told a plan exists, not the personal details behind it, unless the member wants to share them.",
              "The solidarity fund (below) is offered before any conversation about a member leaving.",
            ],
          },
        ],
      },
      {
        heading: "Solidarity & hardship fund",
        blocks: [
          {
            kind: "p",
            text: "A concrete fund, not just a kind sentiment, is what makes 'we take care of each other' survive a real emergency.",
          },
          {
            kind: "list",
            items: [
              "Every member contributes an illustrative example of €10–€20 a month into a shared hardship fund, separate from operating costs.",
              "The fund can cover a member's shortfall for an illustrative example of up to three months while a longer-term plan is worked out.",
              "Requests are approved by [the finance stewards / a simple majority] within one week, with no requirement to justify the hardship in detail.",
            ],
          },
        ],
      },
      {
        heading: "Annual review",
        blocks: [
          {
            kind: "p",
            text: "Set a fixed date so this is revisited on schedule, not only during a crisis.",
          },
          {
            kind: "list",
            items: [
              "Once a year, the group reviews: whether contributions still match circumstances, whether the hardship fund is adequately funded, and whether anyone has unspoken money worries.",
            ],
          },
          {
            kind: "p",
            text: "This agreement is a starting point — adapt the amounts, timelines, and roles to your group's real numbers, and revisit it every year.",
          },
        ],
      },
    ],
  },

  "crl-statutes": {
    slug: "crl-statutes",
    tag: "Phase 2 · legal",
    title: "Model CRL",
    titleEm: "Statutes",
    intro:
      "A Cooperativa de Responsabilidade Limitada (CRL) is the legal form most QueerPulse housing co-ops register under in Portugal. What follows is a plain-English model of the sections your statutes need — it is not the legal text itself, and it is not legal advice. Bring this outline, and your founding values charter, to a lawyer or notary experienced in cooperative law before you draft or register anything.",
    sections: [
      {
        heading: "Name & registered seat (sede)",
        blocks: [
          {
            kind: "p",
            text: "Your statutes open by naming the cooperative and its registered address (sede social), usually the property itself or a member's address until the property closes.",
          },
          {
            kind: "list",
            items: [
              "Legal name, including the required \"Cooperativa de Responsabilidade Limitada\" or \"CRL\" designation.",
              "Registered seat: município and full address.",
              "Duration: most co-ops register for an indefinite period.",
            ],
          },
        ],
      },
      {
        heading: "Object & scope (objeto)",
        blocks: [
          {
            kind: "p",
            text: "This clause defines what the cooperative actually does — keep it specific to housing, but broad enough to cover related activity.",
          },
          {
            kind: "list",
            items: [
              "Primary object: acquiring, developing, and managing housing for its members on a non-speculative, cost-covering basis.",
              "Secondary activities you may want covered: shared common spaces, tool libraries, small-scale community programming.",
              "A clause ruling out the resale of units for profit, keeping the co-op's housing outside the speculative market.",
            ],
          },
        ],
      },
      {
        heading: "Membership: admission & exit",
        blocks: [
          {
            kind: "p",
            text: "Cooperative law requires open, non-discriminatory membership in principle, while still letting you set fair, values-aligned admission criteria.",
          },
          {
            kind: "list",
            items: [
              "Admission criteria and process — for example, a trial period, an interview, a vote by the assembly.",
              "Conditions for voluntary exit, and the notice period required (commonly three to six months).",
              "Grounds and process for involuntary exit — cross-reference your Conflict Resolution Process so this isn't decided ad hoc.",
            ],
          },
        ],
      },
      {
        heading: "Member rights & duties",
        blocks: [
          {
            kind: "list",
            items: [
              "Right to participate and vote in the general assembly — one member, one vote, regardless of share size. This is a core cooperative principle, not optional.",
              "Right to full financial information about the cooperative (cross-reference your Financial Honesty Agreement).",
              "Duty to pay share capital and ongoing contributions as agreed.",
              "Duty to participate in governance to an agreed minimum — attending assemblies, serving on rotation.",
            ],
          },
        ],
      },
      {
        heading: "Capital & shares (capital social)",
        blocks: [
          {
            kind: "p",
            text: "Portuguese cooperative law sets minimum share values and rules for admitting and repaying members — a lawyer confirms current figures. The statutes need to state:",
          },
          {
            kind: "list",
            items: [
              "The nominal value of one share, and how many a member must hold.",
              "How shares are paid: in full at admission, or by instalment (see your Member Share Agreement).",
              "How shares are valued and repaid on exit, and over what period, so the cooperative isn't required to repay in a lump sum that endangers its finances.",
            ],
          },
        ],
      },
      {
        heading: "Governance bodies",
        blocks: [
          {
            kind: "p",
            text: "Portuguese CRLs are typically structured around three bodies. Your statutes assign specific powers to each:",
          },
          {
            kind: "list",
            items: [
              "Assembleia geral (general assembly): the full membership, and the highest authority. Approves the budget, admits and expels members, amends the statutes.",
              "Direção (board): a small elected group handling day-to-day administration between assemblies.",
              "Conselho fiscal (supervisory board): an independent body reviewing accounts and reporting to the assembly — kept separate from the direção, so one small group doesn't control both spending and oversight.",
            ],
          },
        ],
      },
      {
        heading: "Surplus, reserves & dissolution",
        blocks: [
          {
            kind: "list",
            items: [
              "Any operating surplus is allocated to reserves or reinvested in the property, not distributed as profit — this is what keeps the co-op non-speculative.",
              "A minimum legal reserve fund, built up over time, for unexpected repairs or shortfalls.",
              "On dissolution, remaining assets after debts are settled are transferred to another cooperative or social-purpose entity, never distributed to members as a windfall — this is both a legal requirement and a values commitment.",
            ],
          },
          {
            kind: "p",
            text: "This is a plain-language outline, not registrable statutes. Take it, together with your founding values charter, to a lawyer or notary who works with cooperative law before drafting the document you'll actually file.",
          },
        ],
      },
    ],
  },

  "share-agreement": {
    slug: "share-agreement",
    tag: "Phase 2 · legal",
    title: "Member Share",
    titleEm: "Agreement",
    intro:
      "A member share agreement is the individual contract between the cooperative and one member — it turns the group-level statutes into a document a specific person signs, with specific numbers next to their name. Read it as a template to fill in together and check with a lawyer, not as a form to sign as-is.",
    sections: [
      {
        heading: "What the share buys",
        blocks: [
          {
            kind: "p",
            text: "State plainly what membership entitles someone to, and what it doesn't.",
          },
          {
            kind: "list",
            items: [
              "One membership share equal to an illustrative example of €5,000, entitling the member to occupy [a described unit] and to one vote in the general assembly.",
              "A share is not ownership of a specific unit or square metre — it's membership in the cooperative, which holds the property collectively.",
              "The share does not appreciate with the property's market value; on exit it is repaid at its adjusted nominal value (see below), not at a market price.",
            ],
          },
        ],
      },
      {
        heading: "Payment schedule",
        blocks: [
          {
            kind: "p",
            text: "Set out how the share gets paid, since few members can pay the full amount up front.",
          },
          {
            kind: "list",
            items: [
              "Full payment at admission, or an instalment plan — for example, 24 monthly payments — agreed individually and logged in the shared ledger.",
              "What happens if an instalment is missed: cross-reference your Financial Honesty Agreement's arrears process rather than repeating it here.",
            ],
          },
        ],
      },
      {
        heading: "Leaving: buy-back terms",
        blocks: [
          {
            kind: "p",
            text: "This is the clause members read most carefully, and the one that most needs to be fair rather than punitive.",
          },
          {
            kind: "list",
            items: [
              "On voluntary exit with the agreed notice period, the cooperative repays the share's nominal value, adjusted for [inflation / an agreed index], within an illustrative example of 12 months of departure.",
              "The cooperative is not required to repay in a lump sum if that would endanger its finances — state the maximum repayment period up front so it isn't negotiated under stress.",
              "No exit penalty applies to members leaving in good standing; hardship-driven exits go through the solidarity fund first.",
            ],
          },
        ],
      },
      {
        heading: "Who can hold a share",
        blocks: [
          {
            kind: "list",
            items: [
              "Shares are held by individual adult members, not transferred by inheritance, sale, or gift without the assembly's approval — this keeps membership tied to actual participation, not investment.",
              "A member's household — partners, kids, chosen family living with them — doesn't each need a separate share, but state clearly who counts as living under one membership.",
            ],
          },
        ],
      },
      {
        heading: "Deposit protection",
        blocks: [
          {
            kind: "p",
            text: "Because a share isn't a rental deposit, it usually isn't covered by Portugal's tenant deposit-protection scheme — say so explicitly, and say what protects it instead.",
          },
          {
            kind: "list",
            items: [
              "The share amount is held in the cooperative's account, logged individually in the ledger, and confirmed to the member in writing every year.",
              "An independent conselho fiscal (supervisory board, see your CRL statutes) reviews that share accounts match what's owed to each member.",
            ],
          },
        ],
      },
      {
        heading: "Signatures",
        blocks: [
          {
            kind: "p",
            text: "A simple signature block, dated, with both the member and a representative of the cooperative's board — plus a line making the template nature explicit:",
          },
          {
            kind: "list",
            items: [
              "Member name, date, signature.",
              "Cooperative representative name, role, date, signature.",
              "Note: this agreement was adapted from a QueerPulse template on [date] and reviewed by [lawyer/notary name] before signing.",
            ],
          },
          {
            kind: "p",
            text: "Fill in every bracket above with your group's real numbers, and have a lawyer check the final version before anyone signs.",
          },
        ],
      },
    ],
  },

  "finance-model": {
    slug: "finance-model",
    tag: "Phase 3 · finance",
    title: "Finance Model",
    titleEm: "Explainer",
    intro:
      "This explainer walks through how the money in a housing co-op actually adds up — what you're paying for, where a mortgage and municipal support might fit, and how to set a monthly contribution that's sustainable rather than optimistic. The worked example at the end uses illustrative numbers only; your real figures depend entirely on your property, your city, and your group.",
    sections: [
      {
        heading: "The cost stack",
        blocks: [
          {
            kind: "p",
            text: "A co-op's costs come in three layers, and it helps to keep them visually separate rather than lumped into one scary number.",
          },
          {
            kind: "list",
            items: [
              "Acquisition: the purchase price of the property, plus notary, registration, and transfer taxes (IMT).",
              "Works: renovation, code compliance, accessibility retrofits — often underestimated on older Lisbon and Porto buildings.",
              "Running costs: mortgage or loan repayment, insurance, maintenance reserve, utilities for shared spaces, and the co-op's own admin (accounting, notary check-ins).",
            ],
          },
        ],
      },
      {
        heading: "Member shares, mortgage, and municipal support",
        blocks: [
          {
            kind: "p",
            text: "Most QueerPulse co-ops blend three funding sources rather than relying on one.",
          },
          {
            kind: "list",
            items: [
              "Member shares (see your Member Share Agreement) cover a portion of acquisition — typically enough to make the loan-to-value ratio workable for a lender.",
              "A cooperative mortgage or loan, often through Caixa Crédito Agrícola Mútuo (CCAM) or another lender used to cooperative borrowers, covers the remainder of acquisition and sometimes works.",
              "Municipal support — a long lease on city-owned property, a renovation grant, or a housing fund co-investment — can reduce or replace the acquisition cost entirely in some cases. Ask QueerPulse's housing fund liaison what's currently available in your city.",
            ],
          },
        ],
      },
      {
        heading: "Setting monthly contributions",
        blocks: [
          {
            kind: "p",
            text: "Work backwards from what people can actually pay, then check the number covers real costs — not the other way round.",
          },
          {
            kind: "list",
            items: [
              "Add up total monthly running costs: loan repayment plus reserve plus insurance plus admin.",
              "Decide how contributions are split: equally, or scaled to income and household size (cross-reference your founding values and financial honesty agreement).",
              "Build in a margin — most co-ops budget 5–10% above known costs for the surprises that always show up in year one.",
            ],
          },
        ],
      },
      {
        heading: "Building reserves",
        blocks: [
          {
            kind: "list",
            items: [
              "A maintenance reserve, funded from month one, even before anything's broken — retrofitting this later, after a roof leak, is much harder.",
              "A target reserve size, commonly discussed as several months of running costs, agreed by the group rather than assumed.",
              "The reserve is separate from the hardship/solidarity fund — one protects the building, the other protects members.",
            ],
          },
        ],
      },
      {
        heading: "Where QueerPulse partners fit",
        blocks: [
          {
            kind: "list",
            items: [
              "CCAM and similar cooperative-friendly lenders: financing structured for collective borrowers rather than individual mortgages.",
              "The city housing fund: co-investment, long leases on municipal buildings, or grants tied to affordable-housing targets. Terms vary by city and change over time, so check current terms with QueerPulse's housing fund liaison rather than relying on this document.",
              "QueerPulse's legal team: a first read of financing terms before you sign, not a substitute for independent legal and financial advice.",
            ],
          },
        ],
      },
      {
        heading: "A worked example (illustrative numbers only)",
        blocks: [
          {
            kind: "p",
            text: "None of the figures below are a real quote — they exist to show how the pieces fit together for a hypothetical 6-household co-op.",
          },
          {
            kind: "list",
            items: [
              "Property + works: €900,000 (illustrative)",
              "Member shares, 6 households × €8,000: €48,000 (illustrative)",
              "Municipal co-investment: €150,000 (illustrative)",
              "Remaining amount financed through a cooperative mortgage: €702,000 (illustrative)",
              "Estimated monthly running cost per household, including reserve: €420–€480 (illustrative)",
            ],
          },
          {
            kind: "p",
            text: "Treat this model as a starting structure, not a forecast — build your real numbers with your lender, your municipality, and, for anything binding, an accountant or lawyer.",
          },
        ],
      },
    ],
  },

  "conflict-resolution": {
    slug: "conflict-resolution",
    tag: "Phase 5 · governance",
    title: "Conflict Resolution",
    titleEm: "Process",
    intro:
      "Every co-op has conflict — the difference between the ones that last and the ones that don't is usually whether they built a process before they needed it. This one is adapted from what Casa Sambizanga uses day to day; treat it as a starting structure to walk through and adjust with your own group, especially the steps that involve someone possibly leaving.",
    sections: [
      {
        heading: "Principles: repair over punishment",
        blocks: [
          {
            kind: "p",
            text: "Set the tone before the steps. A process that only exists to punish tends to make people hide problems instead of raising them.",
          },
          {
            kind: "list",
            items: [
              "The goal of any step below is to repair the relationship or the situation enough that the co-op keeps working, not to establish who was right.",
              "Anyone can raise a concern without it being treated as an accusation against them for raising it.",
              "Safety concerns (see below) are the one category where repair takes a back seat to immediate protection.",
            ],
          },
        ],
      },
      {
        heading: "Everyday disagreements",
        blocks: [
          {
            kind: "p",
            text: "Most friction never needs a formal process — name that explicitly so people don't escalate small things out of anxiety.",
          },
          {
            kind: "list",
            items: [
              "Noise, chores, guests, shared-space use: raised directly, one to one, as close to when it happens as possible.",
              "If a direct conversation feels too hard to start alone, ask a third member to sit in — not to take sides, just so it isn't two people alone in a hard moment.",
            ],
          },
        ],
      },
      {
        heading: "The stepped process",
        blocks: [
          {
            kind: "p",
            text: "When a direct conversation doesn't resolve something, or feels unsafe to attempt alone, the process escalates in stages — each one lower-stakes than the next, so most things resolve before reaching the assembly.",
          },
          {
            kind: "list",
            items: [
              "Step 1, direct: the people involved talk it through, one to one, ideally within a week of the issue coming up.",
              "Step 2, facilitated: if step 1 doesn't land, a third member, chosen by agreement rather than assigned, facilitates a conversation between those involved.",
              "Step 3, assembly: if it's still unresolved, or affects the whole household, it's brought to the full group with a clear, agreed agenda item, not an ambush.",
              "Step 4, external mediation: for anything the group can't resolve internally, an outside mediator is brought in, at the co-op's cost, before any decision about someone leaving is considered.",
            ],
          },
        ],
      },
      {
        heading: "Harm & safety issues",
        blocks: [
          {
            kind: "p",
            text: "Some situations skip straight to protective action, and shouldn't wait for step 1.",
          },
          {
            kind: "list",
            items: [
              "Anything involving violence, harassment, or a member's immediate safety goes directly to whichever members hold a safety-response role, bypassing the stepped process entirely.",
              "The person who experienced harm decides, as much as possible, what happens next — whether that's space, a facilitated conversation, or someone leaving the home temporarily.",
              "The co-op does not investigate or adjudicate criminal matters itself; it supports the person affected in accessing outside help if they want it, and makes decisions about shared housing safety in parallel.",
            ],
          },
        ],
      },
      {
        heading: "Boundaries & accountability",
        blocks: [
          {
            kind: "list",
            items: [
              "Accountability here means someone actually changing the behaviour that caused harm, with support, not just an apology with no follow-up.",
              "Agreements made at any step — a changed behaviour, a boundary, a repair action — are written down and given a review date, so they're checked rather than assumed to have worked.",
            ],
          },
        ],
      },
      {
        heading: "When someone must leave",
        blocks: [
          {
            kind: "p",
            text: "This is the hardest step, and the one most worth deciding calmly, in advance, rather than in the middle of a crisis.",
          },
          {
            kind: "list",
            items: [
              "Involuntary exit is only considered after step 4, except in safety situations where immediate, temporary separation is needed.",
              "The decision requires [an agreed threshold — for example, a supermajority of the assembly, excluding those directly involved] and follows the exit terms in your CRL statutes and Member Share Agreement.",
              "Wherever possible, the co-op supports the departing member in finding alternative housing — this is a housing safety net, not an eviction machine.",
            ],
          },
        ],
      },
      {
        heading: "Reviewing the process",
        blocks: [
          {
            kind: "p",
            text: "Revisit this after it's actually used, not just on a calendar.",
          },
          {
            kind: "list",
            items: [
              "After any use of step 3 or beyond, the group reviews whether the process itself worked, separate from the outcome of that specific conflict.",
              "Annually, alongside the founding values charter review, check whether the stepped process, the facilitator role, and the safety-response role still fit the group as it's grown or changed.",
            ],
          },
          {
            kind: "p",
            text: "This process is a starting template adapted from another QueerPulse co-op's practice — walk through every step as a group before you need it, and adjust the roles and thresholds to fit yours.",
          },
        ],
      },
    ],
  },
};
