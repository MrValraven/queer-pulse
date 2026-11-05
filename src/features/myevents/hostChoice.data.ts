import type { IconType } from "react-icons";
import { FiBookOpen, FiPlusCircle } from "react-icons/fi";
import { routes } from "../../app/routeMap";

/** One card in the "Host an event" choice dialog on `/events`. */
export interface HostChoiceOption {
  key: "learn" | "host";
  icon: IconType;
  to: string;
  titleKey: string;
  bodyKey: string;
}

/**
 * The two ways to start from the Events header: read the how-to-host guide
 * (`/host`) or go straight to the event form (`/create-gathering`). Guide
 * first, so a member who has never hosted meets it before the form.
 */
export const HOST_CHOICE_OPTIONS: readonly HostChoiceOption[] = [
  {
    key: "learn",
    icon: FiBookOpen,
    to: routes.host,
    titleKey: "myevents:eventsHeader.hostChoice.learn.title",
    bodyKey: "myevents:eventsHeader.hostChoice.learn.body",
  },
  {
    key: "host",
    icon: FiPlusCircle,
    to: routes.createGathering,
    titleKey: "myevents:eventsHeader.hostChoice.host.title",
    bodyKey: "myevents:eventsHeader.hostChoice.host.body",
  },
];
