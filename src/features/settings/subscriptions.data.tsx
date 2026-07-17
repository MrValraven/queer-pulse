import { type ReactNode } from "react";
import type { TFunction } from "../../shared/i18n/types";
import { Translation } from "../../shared/i18n/Translation";
import { EmailIcon, BookIcon, ShieldIcon } from "./subscriptionIcons";

export interface Newsletter {
  id: string;
  icon: ReactNode;
  name: ReactNode;
  freq: string;
  meta: string;
  defaultOn: boolean;
  iconVariant: "coral" | "jade" | "plum";
}

/** A saved job-search alert. `title` is the user-entered saved-search name —
 * content, not chrome, left exactly as typed (same rule as a mock bio). */
export interface JobAlert {
  id: string;
  ic: string;
  title: string;
  desc: ReactNode;
  criteria: { label: ReactNode }[];
  /** Stable frequency id — the display label resolves via `t()` at render,
   * never stored translated (§5.1: this also feeds the status line). */
  frequencyId: "instant" | "daily" | "weekly";
  matches: number | null;
  lastSent: Date | null;
}

export function buildNewsletters(t: TFunction): Newsletter[] {
  return [
    {
      id: "nl1",
      icon: <EmailIcon />,
      name: (
        <Translation
          i18nKey="settings:subscriptions.newsletter.nl1.name"
          components={{ em: <em /> }}
        />
      ),
      freq: t("settings:subscriptions.newsletter.nl1.freq"),
      meta: t("settings:subscriptions.newsletter.nl1.meta", {
        count: 2,
        email: "tomas@example.com",
      }),
      defaultOn: true,
      iconVariant: "coral",
    },
    {
      id: "nl2",
      icon: <BookIcon />,
      name: (
        <Translation
          i18nKey="settings:subscriptions.newsletter.nl2.name"
          components={{ em: <em /> }}
        />
      ),
      freq: t("settings:subscriptions.newsletter.nl2.freq"),
      meta: t("settings:subscriptions.newsletter.nl2.meta", {
        count: 18,
        percent: 72,
      }),
      defaultOn: true,
      iconVariant: "jade",
    },
    {
      id: "nl3",
      icon: <ShieldIcon />,
      name: (
        <Translation
          i18nKey="settings:subscriptions.newsletter.nl3.name"
          components={{ em: <em /> }}
        />
      ),
      freq: t("settings:subscriptions.newsletter.nl3.freq"),
      meta: t("settings:subscriptions.newsletter.nl3.meta", {
        count: 1400,
        percent: 74,
      }),
      defaultOn: false,
      iconVariant: "plum",
    },
  ];
}

export function buildJobAlerts(): JobAlert[] {
  return [
    {
      id: "alert-d",
      ic: "D",
      title: "Designer roles · Lisbon & remote-PT",
      desc: (
        <Translation
          i18nKey="settings:subscriptions.jobAlerts.seedD.desc"
          components={{ em: <em /> }}
        />
      ),
      criteria: [
        {
          label: (
            <Translation
              i18nKey="settings:subscriptions.jobAlerts.criteria.title"
              values={{ value: "Designer · senior · mid · junior" }}
              components={{ b: <b /> }}
            />
          ),
        },
        {
          label: (
            <Translation
              i18nKey="settings:subscriptions.jobAlerts.criteria.multiLocation"
              values={{ first: "Lisbon", second: "Remote (PT)" }}
              components={{ b: <b /> }}
            />
          ),
        },
        {
          label: (
            <Translation
              i18nKey="settings:subscriptions.jobAlerts.criteria.minSalary"
              values={{ value: "€32k" }}
              components={{ b: <b /> }}
            />
          ),
        },
        {
          label: (
            <Translation
              i18nKey="settings:subscriptions.jobAlerts.seedD.criteria.queerLedOnly"
              components={{ b: <b /> }}
            />
          ),
        },
      ],
      frequencyId: "weekly",
      matches: 4,
      lastSent: new Date(2026, 5, 2, 9, 0),
    },
    {
      id: "alert-e",
      ic: "E",
      title: "Editorial & communications · part-time",
      desc: (
        <Translation
          i18nKey="settings:subscriptions.jobAlerts.seedE.desc"
          components={{ em: <em /> }}
        />
      ),
      criteria: [
        {
          label: (
            <Translation
              i18nKey="settings:subscriptions.jobAlerts.criteria.title"
              values={{ value: "Editor · writer · communications" }}
              components={{ b: <b /> }}
            />
          ),
        },
        {
          label: (
            <Translation
              i18nKey="settings:subscriptions.jobAlerts.criteria.hours"
              values={{ value: "≤ 20h/week" }}
              components={{ b: <b /> }}
            />
          ),
        },
        {
          label: (
            <Translation
              i18nKey="settings:subscriptions.jobAlerts.criteria.location"
              values={{ value: "Anywhere" }}
              components={{ b: <b /> }}
            />
          ),
        },
      ],
      frequencyId: "instant",
      matches: 1,
      lastSent: new Date(2026, 5, 6, 14, 8),
    },
  ];
}

/** i18n note: pronoun tokens ("he/him", "elu/delu · PT") are left untranslated
 * — same stored-value/contested-neologism reasoning as editProfile.data.ts's
 * PRONOUN_CHIPS, out of this sweep's scope (see docs/i18n brief). */
export const PRONOUN_OPTIONS = [
  "he/him",
  "she/her",
  "they/them",
  "he/they",
  "she/they",
  "any",
  "ask me",
  "none / name only",
  "elu/delu · PT",
];

export function buildPronounVisibility(t: TFunction) {
  return [
    {
      id: "p1",
      label: t("settings:subscriptions.pronouns.vis.p1.label"),
      desc: t("settings:subscriptions.pronouns.vis.p1.desc"),
      defaultOn: true,
      disabled: true,
    },
    {
      id: "p2",
      label: t("settings:subscriptions.pronouns.vis.p2.label"),
      desc: t("settings:subscriptions.pronouns.vis.p2.desc", {
        example: "Tomás · he/him",
      }),
      defaultOn: true,
      disabled: false,
    },
    {
      id: "p3",
      label: t("settings:subscriptions.pronouns.vis.p3.label"),
      desc: t("settings:subscriptions.pronouns.vis.p3.desc"),
      defaultOn: true,
      disabled: false,
    },
    {
      id: "p4",
      label: t("settings:subscriptions.pronouns.vis.p4.label"),
      desc: t("settings:subscriptions.pronouns.vis.p4.desc"),
      defaultOn: false,
      disabled: false,
    },
    {
      id: "p5",
      label: t("settings:subscriptions.pronouns.vis.p5.label"),
      desc: t("settings:subscriptions.pronouns.vis.p5.desc"),
      defaultOn: true,
      disabled: false,
    },
  ];
}
