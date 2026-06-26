import { routes } from "../../app/routeMap";

export const MASTHEAD_META = {
  issue: "Issue 18",
  date: "June 2026",
  tagline: "Published the first of every month",
};

export interface MastheadNavItem {
  key: string;
  label: string;
  href: string;
}

export const MASTHEAD_NAV: MastheadNavItem[] = [
  { key: "current", label: "Current issue", href: routes.magazine },
  { key: "issues", label: "Issues", href: routes.issues },
  { key: "covers", label: "Covers", href: routes.coverGallery },
  { key: "longreads", label: "Long reads", href: routes.tag },
  { key: "stories", label: "Stories", href: routes.story },
  { key: "newsletter", label: "Newsletter", href: routes.newsletterArchive },
  { key: "write", label: "Write for us", href: routes.submitStory },
];
