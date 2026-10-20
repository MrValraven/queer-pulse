import { Button } from "../../shared/components/ui";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { TFunction } from "../../shared/i18n/types";
import type { VouchPerson } from "./trustGraph/trustGraphModel";
import { useTrustGraph } from "./trustGraph/useTrustGraph";
import styles from "./vouchGraphInspector.module.css";

/** The one line that says how the member got in. */
function joinLine(person: VouchPerson, t: TFunction): string {
  const { kind, byName } = person.joinPath;
  if (kind === "founder") {
    return t("admin:vouchGraph.inspector.joinPath.founder");
  }
  if (kind === "invite" && byName) {
    return t("admin:vouchGraph.inspector.joinPath.invite", { name: byName });
  }
  if (kind === "application") {
    return byName
      ? t("admin:vouchGraph.inspector.joinPath.application", { name: byName })
      : t("admin:vouchGraph.inspector.joinPath.applicationNoReviewer");
  }
  return t("admin:vouchGraph.inspector.joinPath.unknown");
}

interface VouchGraphJoinPathProps {
  person: VouchPerson;
  onRecenter: (id: string) => void;
}

/** D3: a member with no vouches at all, given or received, gets the story of
 *  how they joined, plus a way to walk to their inviter when that person is
 *  in this view. The standard actions follow below it. */
export function VouchGraphJoinPath({
  person,
  onRecenter,
}: VouchGraphJoinPathProps) {
  const { t } = useTranslation();
  const format = useFormat();
  const graph = useTrustGraph();
  const { kind, byId } = person.joinPath;
  const inviter =
    kind === "invite" && byId ? graph.peopleById[byId] : undefined;
  const joinedDate = new Date(person.joinPath.at ?? person.joinedAt);
  const hasJoinedDate = !Number.isNaN(joinedDate.getTime());

  return (
    <section className={styles.infoCard}>
      <h4 className={styles.infoCardTitle}>
        {t("admin:vouchGraph.inspector.joinPath.title", { name: person.name })}
      </h4>
      <p className={styles.infoCardBody}>{joinLine(person, t)}</p>
      {hasJoinedDate && (
        <p className={styles.infoCardMeta}>
          {t("admin:vouchGraph.inspector.joinPath.joinedOn", {
            when: format.date(joinedDate, { month: "short", year: "numeric" }),
          })}
        </p>
      )}
      <p className={styles.infoCardMeta}>
        {t("admin:vouchGraph.inspector.joinPath.noVouches")}
      </p>
      {inviter && (
        <div className={styles.flagActions}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRecenter(inviter.id)}
          >
            {t("admin:vouchGraph.inspector.joinPath.showInviterCta", {
              name: inviter.name,
            })}
          </Button>
        </div>
      )}
    </section>
  );
}
