import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { CalendarEvent } from "../data";

/** "With <community>", under the title: the community that leads the event.
 *  Plain text, like `RunByLine`: the whole card is one link already, and a
 *  link inside a link is invalid, so the community's own page is reached from
 *  the event page. Absent when the event has no lead community or the server
 *  withheld a private one. */
export function HostingCommunityLine({
  event,
  className,
}: {
  event: Pick<CalendarEvent, "hostingCommunity">;
  className?: string;
}) {
  const { t } = useTranslation();
  const name = event.hostingCommunity?.name.trim();
  if (!name) return null;
  return (
    <span className={className}>
      {t("gatherings:hub.card.hostedWith", { name })}
    </span>
  );
}
