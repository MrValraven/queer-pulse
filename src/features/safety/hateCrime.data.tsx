import { type ReactNode } from "react";
import { Translation } from "../../shared/i18n/Translation";
import type { TFunction } from "../../shared/i18n/types";

export type TabId = "immediate" | "document" | "report" | "support" | "law";
export type TagKind = "immediate" | "optional" | "recommended";

export type Block =
  | { kind: "preamble"; text: ReactNode }
  | { kind: "sectionHead"; node: ReactNode }
  | { kind: "note"; text: string }
  | {
      kind: "step";
      num: number;
      title: string;
      desc: string;
      tag?: { label: string; kind: TagKind };
      link?: { label: string; href: string };
    }
  | { kind: "def"; h4: string; paras: string[] };

/** i18n Pattern A — chrome list, sole consumer is `HateCrimeTabBar`. */
export const TAB_KEYS: { id: TabId; labelKey: string }[] = [
  { id: "immediate", labelKey: "safety:hateCrime.tab.immediate" },
  { id: "document", labelKey: "safety:hateCrime.tab.document" },
  { id: "report", labelKey: "safety:hateCrime.tab.report" },
  { id: "support", labelKey: "safety:hateCrime.tab.support" },
  { id: "law", labelKey: "safety:hateCrime.tab.law" },
];

/**
 * i18n Pattern B. Every field is platform-authored guidance chrome, so
 * `buildPanels` takes `t` and is memoized in `HateCrimeTabs.tsx` via
 * `useMemo(() => buildPanels(t, links), [t])`. `sectionHead` nodes carry the
 * coral `<em>` idiom and so are built with `<Translation>` rather than `t()`.
 */
export function buildPanels(
  t: TFunction,
  links: { MENTAL: string; FORUM: string; LEGAL: string },
): Record<TabId, Block[]> {
  const { MENTAL, FORUM } = links;
  const tag = (labelKey: string, kind: TagKind) => ({
    label: t(labelKey),
    kind,
  });

  return {
    immediate: [
      { kind: "preamble", text: t("safety:hateCrime.immediate.preamble") },
      {
        kind: "step",
        num: 1,
        title: t("safety:hateCrime.immediate.step1.title"),
        desc: t("safety:hateCrime.immediate.step1.desc"),
        tag: tag("safety:hateCrime.tag.immediate", "immediate"),
      },
      {
        kind: "step",
        num: 2,
        title: t("safety:hateCrime.immediate.step2.title"),
        desc: t("safety:hateCrime.immediate.step2.desc"),
        tag: tag("safety:hateCrime.tag.immediate", "immediate"),
      },
      {
        kind: "step",
        num: 3,
        title: t("safety:hateCrime.immediate.step3.title"),
        desc: t("safety:hateCrime.immediate.step3.desc"),
        tag: tag("safety:hateCrime.tag.ifHurt", "immediate"),
      },
      {
        kind: "step",
        num: 4,
        title: t("safety:hateCrime.immediate.step4.title"),
        desc: t("safety:hateCrime.immediate.step4.desc"),
        tag: tag("safety:hateCrime.tag.recommended", "recommended"),
      },
      {
        kind: "step",
        num: 5,
        title: t("safety:hateCrime.immediate.step5.title"),
        desc: t("safety:hateCrime.immediate.step5.desc"),
        tag: tag("safety:hateCrime.tag.recommended", "recommended"),
      },
    ],
    document: [
      { kind: "preamble", text: t("safety:hateCrime.document.preamble") },
      {
        kind: "sectionHead",
        node: (
          <Translation
            i18nKey="safety:hateCrime.document.collectHeading"
            components={{ em: <em /> }}
          />
        ),
      },
      {
        kind: "step",
        num: 1,
        title: t("safety:hateCrime.document.step1.title"),
        desc: t("safety:hateCrime.document.step1.desc"),
      },
      {
        kind: "step",
        num: 2,
        title: t("safety:hateCrime.document.step2.title"),
        desc: t("safety:hateCrime.document.step2.desc"),
      },
      {
        kind: "step",
        num: 3,
        title: t("safety:hateCrime.document.step3.title"),
        desc: t("safety:hateCrime.document.step3.desc"),
      },
      {
        kind: "step",
        num: 4,
        title: t("safety:hateCrime.document.step4.title"),
        desc: t("safety:hateCrime.document.step4.desc"),
      },
      {
        kind: "step",
        num: 5,
        title: t("safety:hateCrime.document.step5.title"),
        desc: t("safety:hateCrime.document.step5.desc"),
        tag: tag("safety:hateCrime.tag.ifApplicable", "optional"),
      },
      {
        kind: "sectionHead",
        node: (
          <Translation
            i18nKey="safety:hateCrime.document.keepHeading"
            components={{ em: <em /> }}
          />
        ),
      },
      { kind: "note", text: t("safety:hateCrime.document.note") },
    ],
    report: [
      { kind: "preamble", text: t("safety:hateCrime.report.preamble") },
      {
        kind: "sectionHead",
        node: (
          <Translation
            i18nKey="safety:hateCrime.report.policeHeading"
            components={{ em: <em /> }}
          />
        ),
      },
      {
        kind: "step",
        num: 1,
        title: t("safety:hateCrime.report.police.step1.title"),
        desc: t("safety:hateCrime.report.police.step1.desc"),
      },
      {
        kind: "step",
        num: 2,
        title: t("safety:hateCrime.report.police.step2.title"),
        desc: t("safety:hateCrime.report.police.step2.desc"),
        tag: tag("safety:hateCrime.tag.important", "immediate"),
      },
      {
        kind: "step",
        num: 3,
        title: t("safety:hateCrime.report.police.step3.title"),
        desc: t("safety:hateCrime.report.police.step3.desc"),
        tag: tag("safety:hateCrime.tag.stronglyRecommended", "recommended"),
      },
      {
        kind: "sectionHead",
        node: (
          <Translation
            i18nKey="safety:hateCrime.report.ilgaHeading"
            components={{ em: <em /> }}
          />
        ),
      },
      {
        kind: "step",
        num: 1,
        title: t("safety:hateCrime.report.ilga.step1.title"),
        desc: t("safety:hateCrime.report.ilga.step1.desc"),
        tag: tag("safety:hateCrime.tag.anonOptionAvailable", "recommended"),
      },
      {
        kind: "step",
        num: 2,
        title: t("safety:hateCrime.report.ilga.step2.title"),
        desc: t("safety:hateCrime.report.ilga.step2.desc"),
      },
      {
        kind: "sectionHead",
        node: (
          <Translation
            i18nKey="safety:hateCrime.report.euHeading"
            components={{ em: <em /> }}
          />
        ),
      },
      {
        kind: "step",
        num: 1,
        title: t("safety:hateCrime.report.eu.step1.title"),
        desc: t("safety:hateCrime.report.eu.step1.desc"),
      },
      {
        kind: "step",
        num: 2,
        title: t("safety:hateCrime.report.eu.step2.title"),
        desc: t("safety:hateCrime.report.eu.step2.desc"),
        tag: tag("safety:hateCrime.tag.afterDomesticProcess", "optional"),
      },
    ],
    support: [
      { kind: "preamble", text: t("safety:hateCrime.support.preamble") },
      {
        kind: "sectionHead",
        node: (
          <Translation
            i18nKey="safety:hateCrime.support.immediateHeading"
            components={{ em: <em /> }}
          />
        ),
      },
      {
        kind: "step",
        num: 1,
        title: t("safety:hateCrime.support.step1.title"),
        desc: t("safety:hateCrime.support.step1.desc"),
      },
      {
        kind: "step",
        num: 2,
        title: t("safety:hateCrime.support.step2.title"),
        desc: t("safety:hateCrime.support.step2.desc"),
      },
      {
        kind: "step",
        num: 3,
        title: t("safety:hateCrime.support.step3.title"),
        desc: t("safety:hateCrime.support.step3.desc"),
        link: {
          label: t("safety:hateCrime.support.directoryCta"),
          href: MENTAL,
        },
      },
      {
        kind: "sectionHead",
        node: (
          <Translation
            i18nKey="safety:hateCrime.support.longerTermHeading"
            components={{ em: <em /> }}
          />
        ),
      },
      {
        kind: "step",
        num: 4,
        title: t("safety:hateCrime.support.step4.title"),
        desc: t("safety:hateCrime.support.step4.desc"),
      },
      {
        kind: "step",
        num: 5,
        title: t("safety:hateCrime.support.step5.title"),
        desc: t("safety:hateCrime.support.step5.desc"),
        link: { label: t("safety:hateCrime.support.forumCta"), href: FORUM },
      },
    ],
    law: [
      { kind: "preamble", text: t("safety:hateCrime.law.preamble") },
      {
        kind: "def",
        h4: t("safety:hateCrime.law.def1.h4"),
        paras: [
          t("safety:hateCrime.law.def1.para1"),
          t("safety:hateCrime.law.def1.para2"),
        ],
      },
      {
        kind: "def",
        h4: t("safety:hateCrime.law.def2.h4"),
        paras: [t("safety:hateCrime.law.def2.para1")],
      },
      {
        kind: "def",
        h4: t("safety:hateCrime.law.def3.h4"),
        paras: [t("safety:hateCrime.law.def3.para1")],
      },
      {
        kind: "def",
        h4: t("safety:hateCrime.law.def4.h4"),
        paras: [t("safety:hateCrime.law.def4.para1")],
      },
    ],
  };
}
