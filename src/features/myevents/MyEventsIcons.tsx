/* Inline SVG icons ported from the prototype, as reusable elements. All use
   currentColor and are sized by surrounding CSS (`.tool-btn svg`, etc.). Use
   as `{Icons.bell}` (elements, not components). */
import type { ReactNode } from "react";

const mk = (
  children: ReactNode,
  extra: Record<string, unknown> = {},
): ReactNode => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    aria-hidden
    {...extra}
  >
    {children}
  </svg>
);

export const Icons: Record<string, ReactNode> = {
  bell: mk(
    <>
      <path
        d="M4 7a4 4 0 0 1 8 0c0 2.8 1 3.8 1 3.8H3S4 9.8 4 7Z"
        strokeLinejoin="round"
      />
      <path d="M6.4 13.2a1.7 1.7 0 0 0 3.2 0" strokeLinecap="round" />
    </>,
  ),
  edit: mk(<path d="M10 2.5 13.5 6l-8 8H2v-3.5l8-8Z" strokeLinejoin="round" />),
  x: mk(<path d="M3.5 3.5l9 9M12.5 3.5l-9 9" strokeLinecap="round" />, {
    strokeWidth: 1.6,
  }),
  leave: mk(
    <path
      d="M10 11.5 13.5 8 10 4.5M13.5 8H6M6 2.5H3v11h3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />,
  ),
  heart: mk(
    <path
      d="M8 13S2.5 9.5 2.5 5.8A2.8 2.8 0 0 1 8 4.8a2.8 2.8 0 0 1 5.5 1c0 3.7-5.5 7.2-5.5 7.2Z"
      strokeLinejoin="round"
    />,
  ),
  plus: mk(<path d="M8 3.5v9M3.5 8h9" strokeLinecap="round" />, {
    strokeWidth: 1.6,
  }),
  cal: mk(
    <>
      <rect x="2.5" y="3.5" width="11" height="10" rx="2" />
      <path d="M2.5 6.5h11M6 2v3M10 2v3" />
    </>,
    { strokeLinecap: "round", strokeLinejoin: "round" },
  ),
  check: mk(<path d="M3 8.5 6.5 12 13 4.5" />, {
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  }),
  info: mk(
    <>
      <circle cx="8" cy="8" r="6.3" />
      <path d="M8 7.4v3.6M8 5v.4" strokeLinecap="round" />
    </>,
  ),
  more: (
    <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden>
      <circle cx="4" cy="8" r="1.4" />
      <circle cx="8" cy="8" r="1.4" />
      <circle cx="12" cy="8" r="1.4" />
    </svg>
  ),
  share: mk(
    <path
      d="M8 10.5V2.5M5 5l3-3 3 3M3 9v3.5a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V9"
      strokeLinecap="round"
      strokeLinejoin="round"
    />,
  ),
  invite: mk(
    <>
      <circle cx="6" cy="5.5" r="2.5" />
      <path
        d="M1.5 13c0-2.5 2-4 4.5-4s4.5 1.5 4.5 4M12.5 5v4M14.5 7h-4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </>,
  ),
  msg: mk(
    <path
      d="M2 4.5A1.5 1.5 0 0 1 3.5 3h9A1.5 1.5 0 0 1 14 4.5v5A1.5 1.5 0 0 1 12.5 11H6l-3 2.5V11H3.5A1.5 1.5 0 0 1 2 9.5Z"
      strokeLinejoin="round"
    />,
  ),
  chat: mk(
    <path
      d="M3 3h7a1.5 1.5 0 0 1 1.5 1.5V8A1.5 1.5 0 0 1 10 9.5H6L4 11V9.5h-.5A1.5 1.5 0 0 1 2 8V4.5A1.5 1.5 0 0 1 3 3Z"
      strokeLinejoin="round"
    />,
  ),
  maybe: mk(
    <>
      <circle cx="8" cy="8" r="6.3" />
      <path
        d="M6.4 6.2A1.7 1.7 0 0 1 9.7 6.6c0 1.2-1.7 1.4-1.7 2.6M8 11.2v.2"
        strokeLinecap="round"
      />
    </>,
  ),
  ticket: mk(
    <path d="M2 5.5A1.5 1.5 0 0 1 3.5 4h9A1.5 1.5 0 0 1 14 5.5v1a1.5 1.5 0 0 0 0 3v1A1.5 1.5 0 0 1 12.5 12h-9A1.5 1.5 0 0 1 2 10.5v-1a1.5 1.5 0 0 0 0-3Z" />,
    { strokeWidth: 1.4 },
  ),
  refund: mk(
    <path
      d="M6 4 3 7l3 3M3 7h7a3 3 0 0 1 0 6H6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />,
  ),
  wallet: mk(
    <>
      <rect x="2" y="4" width="12" height="9" rx="1.6" />
      <path d="M11 8.5h1.5M2 6.5h9a1 1 0 0 1 0 2" />
    </>,
    { strokeWidth: 1.4, strokeLinejoin: "round" },
  ),
  connect: mk(
    <path
      d="M6.5 9.5 9.5 6.5M6 5l1-1a2.5 2.5 0 0 1 3.5 3.5l-1 1M10 11l-1 1A2.5 2.5 0 0 1 5.5 8.5l1-1"
      strokeLinecap="round"
    />,
  ),
  report: mk(
    <path
      d="M3.5 14V2.5h8l-1.5 3 1.5 3h-8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />,
  ),
  block: mk(
    <>
      <circle cx="8" cy="8" r="6.3" />
      <path d="M3.6 3.6l8.8 8.8" strokeLinecap="round" />
    </>,
  ),
};
