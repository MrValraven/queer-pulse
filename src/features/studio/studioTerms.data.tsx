import type { ReactNode } from "react";

/** The four headline "deal" cards at the top of the terms page. */
export interface Deal {
  icon: ReactNode;
  title: ReactNode;
  body: ReactNode;
}

const coinIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
    <circle cx={12} cy={12} r={9} />
    <path
      d="M9.5 9.5a2.5 2.5 0 0 1 5 0c0 2-2.5 2-2.5 4"
      strokeLinecap="round"
    />
    <path d="M12 17.5h.01" strokeLinecap="round" />
  </svg>
);

const checkCircleIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
    <circle cx={12} cy={12} r={9} />
    <path
      d="m8.5 12 2.5 2.5 4.5-5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const lockIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
    <rect x={5} y={10} width={14} height={10} rx={2} />
    <path d="M8 10V7a4 4 0 0 1 8 0v3" strokeLinecap="round" />
  </svg>
);

const exitIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
    <path
      d="M10 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M15 8l-4 4 4 4M11 12h9"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const DEALS: Deal[] = [
  {
    icon: coinIcon,
    title: (
      <>
        Artists keep <em>80%</em> &amp; their masters
      </>
    ),
    body: (
      <>
        The split is in the deed, not a settings page.{" "}
        <em>The floor can rise, never fall</em> without a two-thirds vote.
      </>
    ),
  },
  {
    icon: checkCircleIcon,
    title: (
      <>
        Tips are <em>100%</em>, always
      </>
    ),
    body: (
      <>
        No platform cut on tips, ever. This one isn&rsquo;t up for a vote —
        it&rsquo;s a founding term.
      </>
    ),
  },
  {
    icon: lockIcon,
    title: (
      <>
        Your data is <em>never</em> sold
      </>
    ),
    body: (
      <>
        Not sold, not shared, not used to train anything. History is off by
        default and erasable in one tap.
      </>
    ),
  },
  {
    icon: exitIcon,
    title: (
      <>
        Leaving is <em>one page</em>
      </>
    ),
    body: (
      <>
        Take down work in 14 days, close your account in one click. Past plays
        stay paid either way.
      </>
    ),
  },
];

/** A single licence card in section 02. */
export interface Licence {
  code: string;
  title: ReactNode;
  rows: { ok: boolean; label: ReactNode }[];
}

export const LICENCES: Licence[] = [
  {
    code: "ARR",
    title: (
      <>
        All rights <em>reserved</em>
      </>
    ),
    rows: [
      { ok: true, label: <>Stream &amp; save it</> },
      { ok: true, label: <>Buy a copy to keep</> },
      { ok: false, label: <>No reuse without asking</> },
    ],
  },
  {
    code: "CC-BY-NC",
    title: (
      <>
        Credit, <em>non-commercial</em>
      </>
    ),
    rows: [
      {
        ok: true,
        label: (
          <>
            Reuse in <em>non-paid</em> work
          </>
        ),
      },
      { ok: true, label: <>Remix, with credit</> },
      { ok: false, label: <>Not for commercial use</> },
    ],
  },
  {
    code: "CC-BY-SA",
    title: (
      <>
        Credit, <em>share-alike</em>
      </>
    ),
    rows: [
      { ok: true, label: <>Reuse anywhere, with credit</> },
      { ok: true, label: <>Commercial use allowed</> },
      {
        ok: true,
        label: (
          <>
            Share remixes <em>same licence</em>
          </>
        ),
      },
    ],
  },
];
