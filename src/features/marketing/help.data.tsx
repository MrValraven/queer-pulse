import type { ReactElement } from "react";
import { Link } from "react-router-dom";
import { routes } from "../../app/routeMap";

export interface HelpQuestion {
  /** Stable, globally unique id: drives the open/closed accordion state. */
  id: string;
  questionKey: string;
  answerKey: string;
  /** Tag name → element for the inline markup inside the answer string. */
  answerComponents?: Record<string, ReactElement>;
}

export interface HelpCategory {
  /** Also the `#hash` a deep link may address, e.g. `/about/help#account`. */
  id: string;
  labelKey: string;
  headKey: string;
  questions: HelpQuestion[];
}

export const HELP_CATEGORIES: HelpCategory[] = [
  {
    id: "getting-started",
    labelKey: "marketing:help.category.gettingStarted.label",
    headKey: "marketing:help.category.gettingStarted.head",
    questions: [
      {
        id: "invite",
        questionKey: "marketing:help.qa.invite.q",
        answerKey: "marketing:help.qa.invite.a",
        answerComponents: { strong: <strong /> },
      },
      {
        id: "afterAccept",
        questionKey: "marketing:help.qa.afterAccept.q",
        answerKey: "marketing:help.qa.afterAccept.a",
      },
      {
        id: "lisbonOnly",
        questionKey: "marketing:help.qa.lisbonOnly.q",
        answerKey: "marketing:help.qa.lisbonOnly.a",
      },
      {
        id: "free",
        questionKey: "marketing:help.qa.free.q",
        answerKey: "marketing:help.qa.free.a",
      },
    ],
  },
  {
    id: "account",
    labelKey: "marketing:help.category.account.label",
    headKey: "marketing:help.category.account.head",
    questions: [
      {
        id: "changeName",
        questionKey: "marketing:help.qa.changeName.q",
        answerKey: "marketing:help.qa.changeName.a",
        answerComponents: { settingsLink: <Link to={routes.settings} /> },
      },
      {
        id: "privateProfile",
        questionKey: "marketing:help.qa.privateProfile.q",
        answerKey: "marketing:help.qa.privateProfile.a",
        answerComponents: {
          settingsLink: <Link to={routes.settings} />,
          strong: <strong />,
        },
      },
      {
        id: "unknownSession",
        questionKey: "marketing:help.qa.unknownSession.q",
        answerKey: "marketing:help.qa.unknownSession.a",
        answerComponents: {
          sessionsLink: <Link to={routes.sessions} />,
          contactLink: <Link to={`${routes.contact}?topic=account`} />,
        },
      },
      {
        id: "deleteAccount",
        questionKey: "marketing:help.qa.deleteAccount.q",
        answerKey: "marketing:help.qa.deleteAccount.a",
        answerComponents: { settingsLink: <Link to={routes.settings} /> },
      },
      {
        id: "levels",
        questionKey: "marketing:help.qa.levels.q",
        answerKey: "marketing:help.qa.levels.a",
      },
    ],
  },
  {
    id: "gatherings",
    labelKey: "marketing:help.category.gatherings.label",
    headKey: "marketing:help.category.gatherings.head",
    questions: [
      {
        id: "rsvp",
        questionKey: "marketing:help.qa.rsvp.q",
        answerKey: "marketing:help.qa.rsvp.a",
        answerComponents: {
          calendarLink: <Link to={routes.calendar} />,
          strong: <strong />,
        },
      },
      {
        id: "hostGathering",
        questionKey: "marketing:help.qa.hostGathering.q",
        answerKey: "marketing:help.qa.hostGathering.a",
        answerComponents: { hostLink: <Link to={routes.host} /> },
      },
      {
        id: "cantMakeIt",
        questionKey: "marketing:help.qa.cantMakeIt.q",
        answerKey: "marketing:help.qa.cantMakeIt.a",
      },
      {
        id: "waitlist",
        questionKey: "marketing:help.qa.waitlist.q",
        answerKey: "marketing:help.qa.waitlist.a",
      },
    ],
  },
  {
    id: "safety",
    labelKey: "marketing:help.category.safety.label",
    headKey: "marketing:help.category.safety.head",
    questions: [
      {
        id: "reportMember",
        questionKey: "marketing:help.qa.reportMember.q",
        answerKey: "marketing:help.qa.reportMember.a",
      },
      {
        id: "afterReport",
        questionKey: "marketing:help.qa.afterReport.q",
        answerKey: "marketing:help.qa.afterReport.a",
        answerComponents: { strong: <strong /> },
      },
      {
        id: "appeal",
        questionKey: "marketing:help.qa.appeal.q",
        answerKey: "marketing:help.qa.appeal.a",
        answerComponents: { governanceLink: <Link to={routes.governance} /> },
      },
      {
        id: "blockMute",
        questionKey: "marketing:help.qa.blockMute.q",
        answerKey: "marketing:help.qa.blockMute.a",
        answerComponents: { strong: <strong /> },
      },
    ],
  },
  {
    id: "membership",
    labelKey: "marketing:help.category.membership.label",
    headKey: "marketing:help.category.membership.head",
    questions: [
      {
        id: "invitesWork",
        questionKey: "marketing:help.qa.invitesWork.q",
        answerKey: "marketing:help.qa.invitesWork.a",
      },
      {
        id: "vouching",
        questionKey: "marketing:help.qa.vouching.q",
        answerKey: "marketing:help.qa.vouching.a",
      },
      {
        id: "perks",
        questionKey: "marketing:help.qa.perks.q",
        answerKey: "marketing:help.qa.perks.a",
      },
    ],
  },
  {
    id: "technical",
    labelKey: "marketing:help.category.technical.label",
    headKey: "marketing:help.category.technical.head",
    questions: [
      {
        id: "emailNotifications",
        questionKey: "marketing:help.qa.emailNotifications.q",
        answerKey: "marketing:help.qa.emailNotifications.a",
        answerComponents: { settingsLink: <Link to={routes.settings} /> },
      },
      {
        id: "browserSupport",
        questionKey: "marketing:help.qa.browserSupport.q",
        answerKey: "marketing:help.qa.browserSupport.a",
      },
      {
        id: "somethingBroken",
        questionKey: "marketing:help.qa.somethingBroken.q",
        answerKey: "marketing:help.qa.somethingBroken.a",
        answerComponents: { contactLink: <Link to={routes.contact} /> },
      },
    ],
  },
];
