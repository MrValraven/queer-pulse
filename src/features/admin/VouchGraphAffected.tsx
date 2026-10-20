import { useTranslation } from "../../shared/i18n/useTranslation";
import { soleVoucheesOf } from "./trustGraph/suspensionImpact";
import type { VouchPerson } from "./trustGraph/trustGraphModel";
import { inboundTrustLinks, outboundTrustLinks } from "./trustGraph/trustPath";
import { useTrustGraph } from "./trustGraph/useTrustGraph";
import styles from "./vouchGraphInspector.module.css";

/** B5: at most this many names show before "and N more". */
const SOLE_NAME_LIMIT = 8;

interface VouchGraphAffectedProps {
  person: VouchPerson;
  onGo: (id: string) => void;
}

/** "If you removed {name}": how many members hold a vouch from this person,
 *  how many of those are pending, the vouches they received, and (B5) who
 *  would lose their only vouch. Every count here reads the same active
 *  links, invites included, so the sole-vouch list is always part of the
 *  first count. */
export function VouchGraphAffected({ person, onGo }: VouchGraphAffectedProps) {
  const { t } = useTranslation();
  const graph = useTrustGraph();
  const firstName = person.name.split(" ")[0] ?? person.name;

  // An invite is a vouch row too (kind "invite" only marks that the
  // vouchee joined through this voucher), so both kinds count here, the
  // same links soleVoucheesOf walks.
  const voucheeIds = new Set(
    outboundTrustLinks(graph, person.id).map((link) => link.voucheeId),
  );
  const voucherIds = new Set(
    inboundTrustLinks(graph, person.id).map((link) => link.voucherId),
  );
  const pendingVoucheeCount = [...voucheeIds].filter(
    (voucheeId) => graph.peopleById[voucheeId]?.standing === "new",
  ).length;
  const soleIds = soleVoucheesOf(graph, person.id);
  const shownSoleIds = soleIds.slice(0, SOLE_NAME_LIMIT);
  const hiddenSoleCount = soleIds.length - shownSoleIds.length;
  const summary = [
    t("admin:vouchGraph.inspector.affectedCount", { count: voucheeIds.size }),
    pendingVoucheeCount > 0 &&
      t("admin:vouchGraph.inspector.affected.pendingNote", {
        count: pendingVoucheeCount,
      }),
    voucherIds.size > 0 &&
      t("admin:vouchGraph.inspector.affected.receivedStay", {
        count: voucherIds.size,
      }),
    t("admin:vouchGraph.inspector.affected.weighCost"),
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={styles.affected}>
      <h4 className={styles.insT}>
        {t("admin:vouchGraph.inspector.affectedTitle", { name: firstName })}
      </h4>
      <p>{summary}</p>
      {soleIds.length > 0 && (
        <div className={styles.soleBlock}>
          <p className={styles.soleTitle}>
            {t("admin:vouchGraph.inspector.affected.soleTitle", {
              count: soleIds.length,
            })}
          </p>
          <ul className={styles.nameList}>
            {shownSoleIds.map((soleId) => (
              <li key={soleId}>
                <button
                  type="button"
                  className={styles.nameButton}
                  onClick={() => onGo(soleId)}
                >
                  {graph.peopleById[soleId]?.name ?? soleId}
                </button>
              </li>
            ))}
            {hiddenSoleCount > 0 && (
              <li className={styles.nameText}>
                {t("admin:vouchGraph.inspector.affected.more", {
                  count: hiddenSoleCount,
                })}
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
