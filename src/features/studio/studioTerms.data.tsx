import type { ReactElement, ReactNode } from "react";
import { Link } from "react-router-dom";
import { routes } from "../../app/routeMap";
import { Translation } from "../../shared/i18n/Translation";
import type { TFunction } from "../../shared/i18n/types";

/**
 * Content for the Studio Trust & Terms page. Platform-authored legal/chrome
 * copy (never fetched — see `docs/i18n/extraction-brief.md` §1). Pattern B:
 * `buildLicences(t)` is memoized in the consumer. Licence
 * codes (ARR, CC-BY-NC, CC-BY-SA) are standard identifiers and stay as-is.
 */

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

// ── Studio open pages: the live Studio addendum (spec section 3.4) ─────────

export interface TermsLiveSection {
  id: string;
  numKey: string;
  headingKey: string;
  paragraphs: { key: string; components?: Record<string, ReactElement> }[];
}

const termsSection = (
  id: string,
  paragraphs: TermsLiveSection["paragraphs"],
): TermsLiveSection => ({
  id,
  numKey: `studio:termsLive.sec.${id}.num`,
  headingKey: `studio:termsLive.sec.${id}.heading`,
  paragraphs,
});

export const TERMS_LIVE_SECTIONS: TermsLiveSection[] = [
  termsSection("rights", [{ key: "studio:termsLive.sec.rights.p1" }]),
  termsSection("visible", [{ key: "studio:termsLive.sec.visible.p1" }]),
  termsSection("stored", [
    { key: "studio:termsLive.sec.stored.p1" },
    {
      key: "studio:termsLive.sec.stored.p2",
      components: { a: <Link to={routes.privacy} /> },
    },
  ]),
  termsSection("takedown", [
    { key: "studio:termsLive.sec.takedown.p1" },
    // Studio safety: the copyright claim section (flagged for legal review
    // in the handover, like p1).
    { key: "studio:termsLive.sec.takedown.claims" },
  ]),
  termsSection("selling", [
    { key: "studio:termsLive.sec.selling.p1" },
    { key: "studio:termsLive.sec.selling.p2" },
  ]),
];
