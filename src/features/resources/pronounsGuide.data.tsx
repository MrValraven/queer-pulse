import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { routes } from "../../app/routeMap";

export const NAME_TABLE: {
  field: string;
  use: string;
  who: string;
  whoVariant: "jade" | "accent";
}[] = [
  {
    field: "Display name",
    use: "Your name on posts, profile, messages",
    who: "All members",
    whoVariant: "jade",
  },
  {
    field: "Chosen name",
    use: "Emails from QueerPulse, internal comms",
    who: "Only you",
    whoVariant: "jade",
  },
  {
    field: "Username",
    use: "URL handle (queerpulse.pt/@username)",
    who: "Changeable once/year",
    whoVariant: "accent",
  },
  {
    field: "Legal name",
    use: "Only if you've provided it for ticketing",
    who: "Only admins + you",
    whoVariant: "jade",
  },
];

export type WhereIcon = "profile" | "messages" | "forum" | "magazine";

export const WHERE_CARDS: {
  icon: WhereIcon;
  jade?: boolean;
  title: string;
  text: string;
  timing: string;
  delay?: boolean;
}[] = [
  {
    icon: "profile",
    jade: true,
    title: "Your profile",
    text: "Updates instantly. Your new name appears on your profile page as soon as you save.",
    timing: "Immediate",
  },
  {
    icon: "messages",
    jade: true,
    title: "Messages",
    text: "New messages use your new name. Existing message headers update within a few minutes.",
    timing: "Minutes",
  },
  {
    icon: "forum",
    title: "Forum posts",
    text: "All your past and future posts show your new display name. Search indexes update overnight.",
    timing: "Up to 24h for search",
    delay: true,
  },
  {
    icon: "magazine",
    title: "Magazine bylines",
    text: "If you've written for the magazine, email us and we'll update your byline across all published issues.",
    timing: "Manual · email us",
    delay: true,
  },
];

export const PRONOUN_FAQS: { q: string; a: ReactNode }[] = [
  {
    q: "Can I change my username?",
    a: "Yes, once per year. Username changes update your profile URL — any old links will redirect for 90 days. Go to Edit Profile → Identity to change it.",
  },
  {
    q: "What if my deadname appears somewhere?",
    a: (
      <>
        Contact us immediately at{" "}
        <a href="mailto:help@queerpulse.pt">help@queerpulse.pt</a> and we'll
        remove or update it as a priority. This includes magazine bylines, old
        forum posts attributed to your previous name, and any email archives we
        hold.
      </>
    ),
  },
  {
    q: "Does changing my name affect my invite history?",
    a: "No. Your invite relationships (who invited you, who you've invited) are maintained internally by account ID, not name, so name changes have no effect on them.",
  },
  {
    q: "Can I make my pronouns private?",
    a: "Yes — go to Edit Profile → Field Visibility and set Pronouns to 'Hidden'. They won't appear on your profile or in member search. They'll still be used by the team in any direct communications.",
  },
  {
    q: "What if I don't want to specify pronouns?",
    a: "Just leave the pronouns field blank or unselected. No field is mandatory. You won't be prompted to fill it in.",
  },
  {
    q: "How does the platform handle legal name data?",
    a: (
      <>
        Legal name data is only stored if you've explicitly provided it for a
        purpose that required it (e.g. certain grant applications run through
        the platform). It's never used as your display name and is stored
        separately with stricter access controls. You can request its deletion
        at any time via <Link to={routes.dataExport}>Data Export</Link>.
      </>
    ),
  },
];
