import type { ReactNode } from "react";
import { FiCalendar, FiCamera, FiCheckCircle } from "react-icons/fi";
import { PageShell } from "../../shared/components/layout";
import { EmptyState } from "../../shared/components/ui";
import { routes } from "../../app/routeMap";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./GatheringManageComingSoon.module.css";

/** Which prototype surface is resolving to this placeholder. */
export type GatheringComingSoonVariant = "event" | "rsvp" | "recap";

const VARIANTS: Record<
  GatheringComingSoonVariant,
  { icon: ReactNode; titleKey: string; descriptionKey: string }
> = {
  event: {
    icon: <FiCalendar aria-hidden />,
    titleKey: "gatherings:eventComingSoon.title",
    descriptionKey: "gatherings:eventComingSoon.description",
  },
  rsvp: {
    icon: <FiCheckCircle aria-hidden />,
    titleKey: "gatherings:rsvpComingSoon.title",
    descriptionKey: "gatherings:rsvpComingSoon.description",
  },
  recap: {
    icon: <FiCamera aria-hidden />,
    titleKey: "gatherings:recapComingSoon.title",
    descriptionKey: "gatherings:recapComingSoon.description",
  },
};

/**
 * Shared live-mode placeholder for the gatherings **prototype** pages that are
 * each fixed to a single mock gathering: the standalone event detail
 * (`/event`), the RSVP confirmation (`/rsvp`), and the recap. In demo mode
 * those pages render fully, but in LIVE mode they fired real RSVP / un-RSVP /
 * attach-photo mutations at a hardcoded slug/id that ignored the route
 * entirely. There is no live gathering behind them, so in LIVE mode
 * (`demoMode === false`) the route resolves here instead and no mutation can
 * target that hardcoded id. The full mock page still renders in demo mode.
 */
export function GatheringComingSoon({
  variant,
}: {
  variant: GatheringComingSoonVariant;
}) {
  const { t } = useTranslation();
  const { icon, titleKey, descriptionKey } = VARIANTS[variant];
  return (
    <PageShell>
      <div className={styles.wrap}>
        <EmptyState
          icon={icon}
          title={<Translation i18nKey={titleKey} components={{ em: <em /> }} />}
          description={t(descriptionKey)}
          action={{
            label: t("gatherings:prototypeComingSoon.browseCta"),
            to: routes.events,
          }}
          secondaryAction={{
            label: t("gatherings:prototypeComingSoon.backHome"),
            to: routes.homepage,
          }}
        />
      </div>
    </PageShell>
  );
}
