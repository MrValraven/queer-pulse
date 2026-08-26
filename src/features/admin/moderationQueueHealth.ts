import { FiAlertOctagon, FiAlertTriangle, FiCheckCircle } from "react-icons/fi";
import type { IconType } from "react-icons";
import { routes } from "../../app/routeMap";
import type { AdminTone } from "./ui";
import type {
  ModerationQueueBreachAxis,
  ModerationQueueKey,
  ModerationQueueSeverity,
} from "./api/moderationHealth.api";

/**
 * How the queue-health panel reads a severity, a queue key and a breach axis
 * (TS-04). Pure lookups, kept out of the components so the panel and the
 * compact indicator cannot drift apart on what "critical" looks like.
 *
 * SEVERITY IS NEVER COLOUR ALONE. Each level carries its own word and its own
 * react-icons glyph as well as its tone, because this is read under pressure
 * and by people who do not all see the tone.
 */
export interface SeverityPresentation {
  tone: AdminTone;
  Glyph: IconType;
  /** `admin:` key for the level's own word. */
  labelKey: string;
}

const SEVERITY_PRESENTATION: Record<
  ModerationQueueSeverity,
  SeverityPresentation
> = {
  ok: {
    tone: "jade",
    Glyph: FiCheckCircle,
    labelKey: "admin:moderationHealth.severity.ok",
  },
  warning: {
    tone: "amber",
    Glyph: FiAlertTriangle,
    labelKey: "admin:moderationHealth.severity.warning",
  },
  critical: {
    tone: "danger",
    Glyph: FiAlertOctagon,
    labelKey: "admin:moderationHealth.severity.critical",
  },
};

export function severityPresentation(
  severity: ModerationQueueSeverity,
): SeverityPresentation {
  return SEVERITY_PRESENTATION[severity];
}

/** The `admin:` key naming one queue. The wire carries no label field: the
 *  client owns this copy, keyed off the stable `queue` value. */
export function queueLabelKey(queue: ModerationQueueKey): string {
  return `admin:moderationHealth.queue.${queue}`;
}

/** The `admin:` key naming one breach axis in a sentence a moderator can act
 *  on ("too much waiting", "waiting too long", "promises already broken"). */
export function breachLabelKey(axis: ModerationQueueBreachAxis): string {
  return `admin:moderationHealth.breach.${axis}`;
}

/**
 * Where a queue row links to.
 *
 * Every destination is moderator-reachable, matching the endpoint's own
 * audience: `authGate.ts` opens the moderation console, the join-request queue
 * and the verification queue to the moderator tier. A row that linked somewhere
 * only an admin could open would be a dead end for exactly the people this
 * panel is for.
 */
export function queueHref(queue: ModerationQueueKey): string {
  switch (queue) {
    case "invite_requests":
      return routes.adminJoinRequests;
    case "reports":
      return routes.adminModeration;
    case "appeals":
      return `${routes.adminModeration}?tab=appeals`;
    case "verification":
      return routes.adminVerifications;
    case "ban_ratifications":
      return `${routes.adminModeration}?tab=ratification`;
  }
}

/** The moderation console's own queue-health tab, for a deep link into it. */
export const MODERATION_HEALTH_HREF = `${routes.adminModeration}?tab=health`;
