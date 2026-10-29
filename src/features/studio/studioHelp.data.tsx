import type { ReactElement } from "react";
import { Link } from "react-router-dom";
import { routes } from "../../app/routeMap";
import {
  studioLibraryPath,
  studioPaymentsPath,
  studioUploadPath,
} from "./studioPaths";

/**
 * Content for Studio Help. Platform chrome: every string is a catalog key,
 * and `answerComponents` fills the tags an answer carries. The live sections
 * say only what Studio does today (spec section 3.2); the showcase money
 * section stays demo-only.
 */

export type HelpSectionId =
  "listening" | "sharing" | "safety" | "buying" | "money";

export interface HelpFaqEntry {
  /** Stable: the accordion's open id and the React key. */
  id: string;
  questionKey: string;
  answerKey: string;
  answerComponents?: Record<string, ReactElement>;
}

export interface HelpSectionData {
  id: HelpSectionId;
  headingKey: string;
  items: HelpFaqEntry[];
}

export interface HelpCategoryCard {
  target: Exclude<HelpSectionId, "money">;
  headingKey: string;
  blurbKey: string;
}

export interface HelpContactCard {
  id: "team" | "email" | "platform";
  titleKey: string;
  bodyKey: string;
  actionKey: string;
  /** An in-app route, or `href` for the inbox. */
  to?: string;
  href?: string;
  isJade?: boolean;
}

/** The DOM id a section carries, for the category cards to jump to. */
export const helpSectionAnchor = (id: HelpSectionId) => `help-${id}`;

const faq = (
  id: string,
  keyBase: string,
  answerComponents?: Record<string, ReactElement>,
): HelpFaqEntry => ({
  id,
  questionKey: `${keyBase}.q`,
  answerKey: `${keyBase}.a`,
  answerComponents,
});

export const LIVE_HELP_SECTIONS: HelpSectionData[] = [
  {
    id: "listening",
    headingKey: "studio:helpLive.cat.listening.heading",
    items: [
      faq("what-is-studio", "studio:helpLive.faq.whatIsStudio"),
      faq("tracking", "studio:helpLive.faq.tracking", {
        a: <Link to={routes.studioListening} />,
      }),
      faq("saving", "studio:helpLive.faq.saving", {
        a: <Link to={routes.studioLibrary} />,
      }),
      faq("player-settings", "studio:helpLive.faq.playerSettings", {
        a: <Link to={routes.studioSettings} />,
      }),
    ],
  },
  {
    id: "sharing",
    headingKey: "studio:helpLive.cat.sharing.heading",
    items: [
      faq("uploading", "studio:helpLive.faq.uploading", {
        a: <Link to={studioUploadPath()} />,
      }),
      faq("rights-checkbox", "studio:helpLive.faq.rightsCheckbox"),
      faq("stats", "studio:helpLive.faq.stats", {
        a: <Link to={routes.studioDashboard} />,
      }),
    ],
  },
  {
    id: "safety",
    headingKey: "studio:helpLive.cat.safety.heading",
    items: [
      faq("reporting", "studio:helpLive.faq.reporting"),
      faq("takedown", "studio:helpLive.faq.takedown"),
      faq("dispute", "studio:helpLive.faq.dispute", {
        a: <Link to={routes.studioRights} />,
      }),
    ],
  },
  {
    id: "buying",
    headingKey: "studio:helpLive.cat.buying.heading",
    items: [
      faq("buying", "studio:helpLive.faq.buying", {
        a: <Link to={studioLibraryPath("purchases")} />,
      }),
      faq("selling", "studio:helpLive.faq.selling", {
        a: <Link to={routes.studioSettings} />,
      }),
    ],
  },
];

/** Demo only: the co-op's money answers, under their original keys. */
export const SHOWCASE_HELP_SECTION: HelpSectionData = {
  id: "money",
  headingKey: "studio:helpLive.cat.money.heading",
  items: [
    faq("money-go", "studio:help.faq.moneyGo", {
      strong: <strong />,
      em: <em />,
      a: <Link to={routes.governance} />,
    }),
    faq("tip-no-account", "studio:help.faq.tipNoAccount", { em: <em /> }),
    faq("tip-notes-private", "studio:help.faq.tipNotesPrivate", {
      strong: <strong />,
      a: <Link to={routes.studioSettings} />,
    }),
    faq("price-diff", "studio:help.faq.priceDiff", { strong: <strong /> }),
    faq("cancel", "studio:help.faq.cancel", {
      a: <Link to={routes.studioSettings} />,
    }),
    faq("get-paid", "studio:help.faq.getPaid", {
      em: <em />,
      a: <Link to={studioPaymentsPath()} />,
    }),
    faq("realistic-earn", "studio:help.faq.realisticEarn", {
      a: <Link to={routes.studioAbout} />,
    }),
  ],
};

export const HELP_CATEGORY_CARDS: HelpCategoryCard[] = [
  {
    target: "listening",
    headingKey: "studio:helpLive.cat.listening.heading",
    blurbKey: "studio:helpLive.cat.listening.blurb",
  },
  {
    target: "sharing",
    headingKey: "studio:helpLive.cat.sharing.heading",
    blurbKey: "studio:helpLive.cat.sharing.blurb",
  },
  {
    target: "safety",
    headingKey: "studio:helpLive.cat.safety.heading",
    blurbKey: "studio:helpLive.cat.safety.blurb",
  },
  {
    target: "buying",
    headingKey: "studio:helpLive.cat.buying.heading",
    blurbKey: "studio:helpLive.cat.buying.blurb",
  },
];

export const HELP_CONTACT_CARDS: HelpContactCard[] = [
  {
    id: "team",
    titleKey: "studio:helpLive.contact.team.title",
    bodyKey: "studio:helpLive.contact.team.body",
    actionKey: "studio:helpLive.contact.team.action",
    to: routes.contact,
  },
  {
    id: "email",
    titleKey: "studio:helpLive.contact.email.title",
    bodyKey: "studio:helpLive.contact.email.body",
    actionKey: "studio:helpLive.contact.email.action",
    href: "mailto:hello@queerpulse.com",
  },
  {
    id: "platform",
    titleKey: "studio:helpLive.contact.platform.title",
    bodyKey: "studio:helpLive.contact.platform.body",
    actionKey: "studio:helpLive.contact.platform.action",
    to: routes.help,
    isJade: true,
  },
];
