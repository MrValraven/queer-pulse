/** Static config + mock content for the Studio sign-in / join screen. */

/** Which auth flow a shared {@link StudioAuthPane} renders. */
export type StudioAuthMode = "in" | "join";

/** Which paid tier the join flow's tier picker has selected. */
export type StudioTier = "studio" | "coop";

/** Loose email shape check — gates the "Join" submit until the field looks valid. */
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const STUDIO_TIER_PRICE = 7;
export const COOP_TIER_PRICE = 11;
export const STUDIO_SHARE_PERCENT = 0.8;

/**
 * Per-mode i18n keys for the two auth flows that share {@link StudioAuthPane}.
 * Everything that differs between "Sign in" and "Join" as a plain string lives
 * here so the pane component stays flow-agnostic.
 */
export interface StudioAuthCopy {
  titleKey: string;
  ledeKey: string;
  emailInputId: string;
  submitCtaKey: string;
  footPromptKey: string;
  footSwitchCtaKey: string;
  footFreePromptKey: string;
  footFreeCtaKey: string;
}

export const STUDIO_AUTH_COPY: Record<StudioAuthMode, StudioAuthCopy> = {
  in: {
    titleKey: "studio:signin.in.title",
    ledeKey: "studio:signin.in.lede",
    emailInputId: "si-email",
    submitCtaKey: "studio:signin.in.submitCta",
    footPromptKey: "studio:signin.in.newHere",
    footSwitchCtaKey: "studio:signin.in.joinCta",
    footFreePromptKey: "studio:signin.in.freePrompt",
    footFreeCtaKey: "studio:signin.in.freeCta",
  },
  join: {
    titleKey: "studio:signin.join.title",
    ledeKey: "studio:signin.join.lede",
    emailInputId: "j-email",
    submitCtaKey: "studio:signin.join.submitCta",
    footPromptKey: "studio:signin.join.alreadyMember",
    footSwitchCtaKey: "studio:signin.tabs.signIn",
    footFreePromptKey: "studio:signin.join.notReady",
    footFreeCtaKey: "studio:signin.join.freeCta",
  },
};

/** Mock "now playing" moment shown in the sign-in aside — content, not chrome. */
export const ASIDE_NOW_PLAYING = {
  listening: 312,
  titlePre: "Carta para a ",
  titleEm: "santa",
  artist: "Mariana Sol",
  album: "Cidade dos santos",
  paidThisMonth: 11940,
};
export const ASIDE_TIP_PERCENT = 1;
