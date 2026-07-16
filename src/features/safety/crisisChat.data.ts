import type { TFunction } from "../../shared/i18n/types";

/**
 * i18n Pattern B. Every field here is chrome (platform-authored crisis-line
 * copy + the prototype's canned opening messages) so each `build*` function
 * takes `t` and is memoized in `CrisisChatPage.tsx` via `useMemo(() => buildX(t), [t])`.
 * Phone numbers are never translated — they're identical in both catalogs.
 */

export interface Assurance {
  n: string;
  label: string;
}

export function buildAssurances(t: TFunction): Assurance[] {
  return [
    {
      n: t("safety:crisisChat.assurance.wait.n"),
      label: t("safety:crisisChat.assurance.wait.label"),
    },
    {
      n: t("safety:crisisChat.assurance.trained.n"),
      label: t("safety:crisisChat.assurance.trained.label"),
    },
    {
      n: t("safety:crisisChat.assurance.confidential.n"),
      label: t("safety:crisisChat.assurance.confidential.label"),
    },
  ];
}

export interface CrisisLine {
  label: string;
  num: string;
  note: string;
}

export function buildLines(t: TFunction): CrisisLine[] {
  return [
    {
      label: t("safety:crisisChat.lines.emergency.label"),
      num: "112",
      note: t("safety:crisisChat.lines.emergency.note"),
    },
    {
      label: t("safety:crisisChat.lines.sosVozAmiga.label"),
      num: "213 544 545",
      note: t("safety:crisisChat.lines.sosVozAmiga.note"),
    },
    {
      label: t("safety:crisisChat.lines.ilga.label"),
      num: "707 200 220",
      note: t("safety:crisisChat.lines.ilga.note"),
    },
    {
      label: t("safety:crisisChat.lines.sns24.label"),
      num: "808 24 24 24",
      note: t("safety:crisisChat.lines.sns24.note"),
    },
  ];
}

/** Fictional demo peer supporter. Stays English in both catalogs (content),
 * passed as the `{name}` interpolation value into the chrome around it. */
export const SUPPORTER_NAME = "Rui";

export interface Message {
  from: "them" | "me";
  name?: string;
  text: string;
}

export function buildOpening(t: TFunction): Message[] {
  const name = t("safety:crisisChat.chat.supporterLabel", {
    name: SUPPORTER_NAME,
  });
  return [
    { from: "them", name, text: t("safety:crisisChat.opening.msg1") },
    { from: "them", name, text: t("safety:crisisChat.opening.msg2") },
  ];
}
