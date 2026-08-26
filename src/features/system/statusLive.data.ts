import {
  FiAlertOctagon,
  FiAlertTriangle,
  FiCheckCircle,
  FiEye,
  FiRadio,
} from "react-icons/fi";
import type { IconType } from "react-icons";
import type {
  PlatformIncidentSeverity,
  PlatformIncidentState,
  PlatformStatusComponentId,
  PlatformStatusState,
} from "./api/platformStatus.api";

/**
 * i18n Pattern A for the LIVE status page. Every map is keyed by the backend's
 * stable ids, and every value is a catalog key rather than display text, so a
 * language switch can never corrupt what the backend said.
 *
 * Colour never carries meaning on its own here: each of these icons ships
 * alongside its `*_LABEL_KEY` text in the markup, so the state is readable in
 * greyscale, by a screen reader, and by anyone who does not know the
 * green/amber/red convention.
 */

export const STATUS_STATE_ICON: Record<PlatformStatusState, IconType> = {
  operational: FiCheckCircle,
  degraded: FiAlertTriangle,
  down: FiAlertOctagon,
};

export const STATUS_STATE_LABEL_KEY: Record<PlatformStatusState, string> = {
  operational: "system:status.live.state.operational",
  degraded: "system:status.live.state.degraded",
  down: "system:status.live.state.down",
};

export const STATUS_OVERALL_TITLE_KEY: Record<PlatformStatusState, string> = {
  operational: "system:status.live.overall.operational.title",
  degraded: "system:status.live.overall.degraded.title",
  down: "system:status.live.overall.down.title",
};

export const STATUS_OVERALL_BODY_KEY: Record<PlatformStatusState, string> = {
  operational: "system:status.live.overall.operational.body",
  degraded: "system:status.live.overall.degraded.body",
  down: "system:status.live.overall.down.body",
};

/** Display order of the component list, independent of the response order. */
export const STATUS_COMPONENT_ORDER: PlatformStatusComponentId[] = [
  "accounts",
  "messaging",
  "communities",
  "directory",
  "magazine",
  "media",
];

export const STATUS_COMPONENT_NAME_KEY: Record<
  PlatformStatusComponentId,
  string
> = {
  accounts: "system:status.live.component.accounts.name",
  messaging: "system:status.live.component.messaging.name",
  communities: "system:status.live.component.communities.name",
  directory: "system:status.live.component.directory.name",
  magazine: "system:status.live.component.magazine.name",
  media: "system:status.live.component.media.name",
};

export const STATUS_COMPONENT_DESC_KEY: Record<
  PlatformStatusComponentId,
  string
> = {
  accounts: "system:status.live.component.accounts.desc",
  messaging: "system:status.live.component.messaging.desc",
  communities: "system:status.live.component.communities.desc",
  directory: "system:status.live.component.directory.desc",
  magazine: "system:status.live.component.magazine.desc",
  media: "system:status.live.component.media.desc",
};

export const INCIDENT_STATE_ICON: Record<PlatformIncidentState, IconType> = {
  open: FiRadio,
  monitoring: FiEye,
  resolved: FiCheckCircle,
};

export const INCIDENT_STATE_LABEL_KEY: Record<PlatformIncidentState, string> = {
  open: "system:status.live.incidentState.open",
  monitoring: "system:status.live.incidentState.monitoring",
  resolved: "system:status.live.incidentState.resolved",
};

export const INCIDENT_SEVERITY_LABEL_KEY: Record<
  PlatformIncidentSeverity,
  string
> = {
  minor: "system:status.live.severity.minor",
  major: "system:status.live.severity.major",
  critical: "system:status.live.severity.critical",
};
