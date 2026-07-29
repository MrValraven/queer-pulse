import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { routes } from "../../app/routeMap";
import { Translation } from "../../shared/i18n/Translation";
import type { TFunction } from "../../shared/i18n/types";

/**
 * Content for the Studio Help page. Platform-authored chrome (never fetched —
 * see `docs/i18n/extraction-brief.md` §1). Pattern B: `buildHelpCats(t)` /
 * `buildHelpSections(t)` / `buildContactCards(t)` are memoized in the
 * consumer.
 */

/** A single FAQ entry. `id` is used both as React key and accordion open-id. */
export interface FaqItem {
  id: string;
  q: string;
  a: ReactNode;
}

/** A top-of-page category card that jumps to a section. */
export interface HelpCat {
  target: string;
  heading: ReactNode;
  blurb: string;
  icon: "note" | "user" | "coin";
}

/** A FAQ section: heading (carries the coral <em>) + its items. */
export interface HelpSection {
  id: string;
  heading: ReactNode;
  items: FaqItem[];
}

export function buildHelpCats(t: TFunction): HelpCat[] {
  return [
    {
      target: "listening",
      heading: (
        <Translation
          i18nKey="studio:help.cat.listening.heading"
          components={{ em: <em /> }}
        />
      ),
      blurb: t("studio:help.cat.listening.blurb"),
      icon: "note",
    },
    {
      target: "account",
      heading: (
        <Translation
          i18nKey="studio:help.cat.account.heading"
          components={{ em: <em /> }}
        />
      ),
      blurb: t("studio:help.cat.account.blurb"),
      icon: "user",
    },
    {
      target: "artists",
      heading: (
        <Translation
          i18nKey="studio:help.cat.artists.heading"
          components={{ em: <em /> }}
        />
      ),
      blurb: t("studio:help.cat.artists.blurb"),
      icon: "coin",
    },
  ];
}

export function buildHelpSections(t: TFunction): HelpSection[] {
  return [
    {
      id: "listening",
      heading: (
        <Translation
          i18nKey="studio:help.cat.listening.heading"
          components={{ em: <em /> }}
        />
      ),
      items: [
        {
          id: "money-go",
          q: t("studio:help.faq.moneyGo.q"),
          a: (
            <Translation
              i18nKey="studio:help.faq.moneyGo.a"
              components={{
                strong: <strong />,
                em: <em />,
                a: <Link to={routes.governance} />,
              }}
            />
          ),
        },
        {
          id: "tip-no-account",
          q: t("studio:help.faq.tipNoAccount.q"),
          a: (
            <Translation
              i18nKey="studio:help.faq.tipNoAccount.a"
              components={{ em: <em /> }}
            />
          ),
        },
        {
          id: "tip-notes-private",
          q: t("studio:help.faq.tipNotesPrivate.q"),
          a: (
            <Translation
              i18nKey="studio:help.faq.tipNotesPrivate.a"
              components={{
                strong: <strong />,
                a: <Link to={routes.studioSettings} />,
              }}
            />
          ),
        },
        {
          id: "listening-history",
          q: t("studio:help.faq.listeningHistory.q"),
          a: (
            <Translation
              i18nKey="studio:help.faq.listeningHistory.a"
              components={{ em: <em /> }}
            />
          ),
        },
      ],
    },
    {
      id: "account",
      heading: (
        <Translation
          i18nKey="studio:help.cat.account.heading"
          components={{ em: <em /> }}
        />
      ),
      items: [
        {
          id: "7-vs-11",
          q: t("studio:help.faq.priceDiff.q"),
          a: (
            <Translation
              i18nKey="studio:help.faq.priceDiff.a"
              components={{ strong: <strong /> }}
            />
          ),
        },
        {
          id: "cancel",
          q: t("studio:help.faq.cancel.q"),
          a: (
            <Translation
              i18nKey="studio:help.faq.cancel.a"
              components={{ a: <Link to={routes.studioSettings} /> }}
            />
          ),
        },
        {
          id: "data-sold",
          q: t("studio:help.faq.dataSold.q"),
          a: (
            <Translation
              i18nKey="studio:help.faq.dataSold.a"
              components={{
                strong: <strong />,
                a: <Link to={routes.studioTerms} />,
              }}
            />
          ),
        },
      ],
    },
    {
      id: "artists",
      heading: (
        <Translation
          i18nKey="studio:help.cat.artists.heading"
          components={{ em: <em /> }}
        />
      ),
      items: [
        {
          id: "get-paid",
          q: t("studio:help.faq.getPaid.q"),
          a: (
            <Translation
              i18nKey="studio:help.faq.getPaid.a"
              components={{ em: <em />, a: <Link to={routes.studioPayouts} /> }}
            />
          ),
        },
        {
          id: "keep-masters",
          q: t("studio:help.faq.keepMasters.q"),
          a: (
            <Translation
              i18nKey="studio:help.faq.keepMasters.a"
              components={{
                strong: <strong />,
                a: <Link to={routes.studioRights} />,
              }}
            />
          ),
        },
        {
          id: "realistic-earn",
          q: t("studio:help.faq.realisticEarn.q"),
          a: (
            <Translation
              i18nKey="studio:help.faq.realisticEarn.a"
              components={{ a: <Link to={routes.studioAbout} /> }}
            />
          ),
        },
      ],
    },
  ];
}

/** A "still stuck?" contact card. */
export interface ContactCard {
  icon: "mail" | "chat" | "check";
  jade?: boolean;
  title: ReactNode;
  body: ReactNode;
  action: string;
  to?: string;
  toast?: string;
}

export function buildContactCards(t: TFunction): ContactCard[] {
  return [
    {
      icon: "mail",
      title: (
        <Translation
          i18nKey="studio:help.contact.email.title"
          components={{ em: <em /> }}
        />
      ),
      body: (
        <>
          <em>help@queerpulse.org</em>
          <br />
          {t("studio:help.contact.email.replyLine")}
        </>
      ),
      action: t("studio:help.contact.email.action"),
      toast: t("studio:help.contact.email.toast"),
    },
    {
      icon: "chat",
      title: (
        <Translation
          i18nKey="studio:help.contact.forum.title"
          components={{ em: <em /> }}
        />
      ),
      body: (
        <Translation
          i18nKey="studio:help.contact.forum.body"
          components={{ em: <em /> }}
        />
      ),
      action: t("studio:help.contact.forum.action"),
      toast: t("studio:help.contact.forum.toast"),
    },
    {
      icon: "check",
      jade: true,
      title: (
        <Translation
          i18nKey="studio:help.contact.access.title"
          components={{ em: <em /> }}
        />
      ),
      body: (
        <Translation
          i18nKey="studio:help.contact.access.body"
          components={{ em: <em /> }}
        />
      ),
      action: t("studio:help.contact.access.action"),
      to: routes.studioAccessibility,
    },
  ];
}
