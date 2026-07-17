import type { ReactNode } from "react";
import { Translation } from "../../shared/i18n/Translation";
import type { TFunction } from "../../shared/i18n/types";

/**
 * Content for the Studio Trust & Terms page. Platform-authored legal/chrome
 * copy (never fetched — see `docs/i18n/extraction-brief.md` §1). Pattern B:
 * `buildDeals(t)` / `buildLicences(t)` are memoized in the consumer. Licence
 * codes (ARR, CC-BY-NC, CC-BY-SA) are standard identifiers and stay as-is.
 */

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

export function buildDeals(): Deal[] {
  return [
    {
      icon: coinIcon,
      title: (
        <Translation
          i18nKey="studio:terms.deal.artists.title"
          components={{ em: <em /> }}
        />
      ),
      body: (
        <Translation
          i18nKey="studio:terms.deal.artists.body"
          components={{ em: <em /> }}
        />
      ),
    },
    {
      icon: checkCircleIcon,
      title: (
        <Translation
          i18nKey="studio:terms.deal.tips.title"
          components={{ em: <em /> }}
        />
      ),
      body: (
        <Translation
          i18nKey="studio:terms.deal.tips.body"
          components={{ em: <em /> }}
        />
      ),
    },
    {
      icon: lockIcon,
      title: (
        <Translation
          i18nKey="studio:terms.deal.data.title"
          components={{ em: <em /> }}
        />
      ),
      body: (
        <Translation
          i18nKey="studio:terms.deal.data.body"
          components={{ em: <em /> }}
        />
      ),
    },
    {
      icon: exitIcon,
      title: (
        <Translation
          i18nKey="studio:terms.deal.leaving.title"
          components={{ em: <em /> }}
        />
      ),
      body: (
        <Translation
          i18nKey="studio:terms.deal.leaving.body"
          components={{ em: <em /> }}
        />
      ),
    },
  ];
}

/** A single licence card in section 02. */
export interface Licence {
  code: string;
  title: ReactNode;
  rows: { ok: boolean; label: ReactNode }[];
}

export function buildLicences(t: TFunction): Licence[] {
  return [
    {
      code: "ARR",
      title: (
        <Translation
          i18nKey="studio:terms.licence.arr.title"
          components={{ em: <em /> }}
        />
      ),
      rows: [
        { ok: true, label: t("studio:terms.licence.arr.row1") },
        { ok: true, label: t("studio:terms.licence.arr.row2") },
        { ok: false, label: t("studio:terms.licence.arr.row3") },
      ],
    },
    {
      code: "CC-BY-NC",
      title: (
        <Translation
          i18nKey="studio:terms.licence.ccByNc.title"
          components={{ em: <em /> }}
        />
      ),
      rows: [
        {
          ok: true,
          label: (
            <Translation
              i18nKey="studio:terms.licence.ccByNc.row1"
              components={{ em: <em /> }}
            />
          ),
        },
        { ok: true, label: t("studio:terms.licence.ccByNc.row2") },
        { ok: false, label: t("studio:terms.licence.ccByNc.row3") },
      ],
    },
    {
      code: "CC-BY-SA",
      title: (
        <Translation
          i18nKey="studio:terms.licence.ccBySa.title"
          components={{ em: <em /> }}
        />
      ),
      rows: [
        { ok: true, label: t("studio:terms.licence.ccBySa.row1") },
        { ok: true, label: t("studio:terms.licence.ccBySa.row2") },
        {
          ok: true,
          label: (
            <Translation
              i18nKey="studio:terms.licence.ccBySa.row3"
              components={{ em: <em /> }}
            />
          ),
        },
      ],
    },
  ];
}
