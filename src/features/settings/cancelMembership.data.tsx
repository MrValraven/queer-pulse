import { type ReactNode } from "react";
import { FiHeart, FiPause, FiArrowDown } from "react-icons/fi";
import type { TFunction } from "../../shared/i18n/types";
import type { Formatters } from "../../shared/i18n/format";
import { Translation } from "../../shared/i18n/Translation";

export type Step = 1 | 2 | 3 | "done" | "paused" | "downshifted" | "solidarity";
export type Alt = "pause" | "downshift" | "solidarity";

/** Shared mock dates/amounts for the cancellation funnel — every "renewed",
 * "next charge" and "access ends" surface reads from these so they can't
 * drift against each other. Real values would come from the billing API. */
export const RENEWED_DATE = new Date(2026, 5, 6); // 6 Jun 2026
export const NEXT_CHARGE_DATE = new Date(2027, 5, 6); // 6 Jun 2027
export const PAUSED_RENEWAL_DATE = new Date(2027, 8, 6); // 6 Sep 2027
export const SUSTAINER_ANNUAL = 96;
export const MEMBER_ANNUAL = 36;
export const SOLIDARITY_ANNUAL = 12;

export function buildAltConfirm(t: TFunction, fmt: Formatters) {
  const memberAmount = fmt.currency(MEMBER_ANNUAL);
  const solidarityAmount = fmt.currency(SOLIDARITY_ANNUAL);
  return {
    pause: {
      eyebrow: t("settings:cancelMembership.alt.pause.eyebrow"),
      title: (
        <Translation
          i18nKey="settings:cancelMembership.alt.pause.title"
          components={{ em: <em /> }}
        />
      ),
      body: (
        <Translation
          i18nKey="settings:cancelMembership.alt.pause.body"
          components={{ b: <b /> }}
        />
      ),
      confirmLabel: t("settings:cancelMembership.alt.pause.confirmLabel"),
      icon: <FiPause />,
      tone: "jade" as const,
      next: "paused" as const,
    },
    downshift: {
      eyebrow: t("settings:cancelMembership.alt.downshift.eyebrow"),
      title: (
        <Translation
          i18nKey="settings:cancelMembership.alt.downshift.title"
          components={{ em: <em /> }}
        />
      ),
      body: (
        <Translation
          i18nKey="settings:cancelMembership.alt.downshift.body"
          values={{ amount: memberAmount }}
          components={{ b: <b /> }}
        />
      ),
      confirmLabel: t("settings:cancelMembership.alt.downshift.confirmLabel"),
      icon: <FiArrowDown />,
      tone: "accent" as const,
      next: "downshifted" as const,
    },
    solidarity: {
      eyebrow: t("settings:cancelMembership.alt.solidarity.eyebrow"),
      title: (
        <Translation
          i18nKey="settings:cancelMembership.alt.solidarity.title"
          components={{ em: <em /> }}
        />
      ),
      body: (
        <Translation
          i18nKey="settings:cancelMembership.alt.solidarity.body"
          values={{ amount: solidarityAmount }}
          components={{ b: <b /> }}
        />
      ),
      confirmLabel: t("settings:cancelMembership.alt.solidarity.confirmLabel", {
        amount: solidarityAmount,
      }),
      icon: <FiHeart />,
      tone: "plum" as const,
      next: "solidarity" as const,
    },
  };
}

export function buildReasons() {
  return ["r1", "r2", "r3", "r4", "r5", "r6"].map((id) => ({
    id,
    label: (
      <Translation
        i18nKey={`settings:cancelMembership.reason.${id}`}
        components={{ b: <b /> }}
      />
    ),
  }));
}

export function buildEnds(t: TFunction): { t: string; d: ReactNode }[] {
  return [
    {
      t: t("settings:cancelMembership.ends.openStudio.title"),
      d: t("settings:cancelMembership.ends.openStudio.desc"),
    },
    {
      t: t("settings:cancelMembership.ends.magazine.title"),
      d: t("settings:cancelMembership.ends.magazine.desc"),
    },
    {
      t: t("settings:cancelMembership.ends.legalConsult.title"),
      d: t("settings:cancelMembership.ends.legalConsult.desc"),
    },
    {
      t: t("settings:cancelMembership.ends.badge.title"),
      d: (
        <>
          {t("settings:cancelMembership.ends.badge.desc")} <FiHeart />
        </>
      ),
    },
  ];
}

export function buildStays(t: TFunction) {
  return [
    {
      t: t("settings:cancelMembership.stays.account.title"),
      d: t("settings:cancelMembership.stays.account.desc"),
    },
    {
      t: t("settings:cancelMembership.stays.gatherings.title"),
      d: t("settings:cancelMembership.stays.gatherings.desc"),
    },
    {
      t: t("settings:cancelMembership.stays.wellbeing.title"),
      d: t("settings:cancelMembership.stays.wellbeing.desc"),
    },
    {
      t: t("settings:cancelMembership.stays.safeSpaces.title"),
      d: t("settings:cancelMembership.stays.safeSpaces.desc"),
    },
  ];
}
