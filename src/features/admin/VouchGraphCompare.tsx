import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { compareMembers } from "./trustGraph/compareMembers";
import type { TrustPath } from "./trustGraph/trustPath";
import { describeTrustPath } from "./trustGraph/trustPathSentence";
import { useTrustGraph } from "./trustGraph/useTrustGraph";
import inspectorStyles from "./vouchGraphInspector.module.css";
import styles from "./vouchGraphTriage.module.css";

interface VouchGraphCompareProps {
  firstId: string;
  secondId: string;
  path: TrustPath | null;
  onGo: (id: string) => void;
  onClear: () => void;
}

/** B6: what the two picked members have in common. Shows the trust path
 *  sentence, the vouchers they share (each one selects that member), how
 *  far apart they joined, and the scenes they share. */
export function VouchGraphCompare({
  firstId,
  secondId,
  path,
  onGo,
  onClear,
}: VouchGraphCompareProps) {
  const { t } = useTranslation();
  const graph = useTrustGraph();
  const nameOf = (personId: string): string =>
    graph.peopleById[personId]?.name ?? personId;
  const { sharedVoucherIds, joinGapDays, sharedSceneIds } = compareMembers(
    graph,
    firstId,
    secondId,
  );
  const sharedSceneLabels = sharedSceneIds.flatMap((sceneId) => {
    const scene = graph.scenes.find((candidate) => candidate.id === sceneId);
    return scene ? [{ id: scene.id, label: scene.label }] : [];
  });
  const pathSentence = path
    ? describeTrustPath(path, graph, t)
    : t("admin:vouchGraph.pathbar.noPath", {
        a: nameOf(firstId),
        b: nameOf(secondId),
      });
  const joinGapLine =
    joinGapDays === 0
      ? t("admin:vouchGraph.compare.joinGapSameDay")
      : t("admin:vouchGraph.compare.joinGap", { count: joinGapDays });

  return (
    <section className={styles.compare} aria-labelledby="vouch-compare-title">
      <h3 id="vouch-compare-title" className={styles.compareTitle}>
        {t("admin:vouchGraph.compare.title", {
          a: nameOf(firstId),
          b: nameOf(secondId),
        })}
      </h3>

      <div className={styles.compareBlock}>
        <h4 className={inspectorStyles.insT}>
          {t("admin:vouchGraph.compare.pathTitle")}
        </h4>
        <p className={styles.compareSentence}>{pathSentence}</p>
      </div>

      <div className={styles.compareBlock}>
        <h4 className={inspectorStyles.insT}>
          {t("admin:vouchGraph.compare.sharedVouchers")}
        </h4>
        {sharedVoucherIds.length > 0 ? (
          <ul className={inspectorStyles.nameList}>
            {sharedVoucherIds.map((voucherId) => (
              <li key={voucherId}>
                <button
                  type="button"
                  className={inspectorStyles.nameButton}
                  onClick={() => onGo(voucherId)}
                >
                  {nameOf(voucherId)}
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.compareNote}>
            {t("admin:vouchGraph.compare.noSharedVouchers")}
          </p>
        )}
      </div>

      <p className={styles.compareGap}>{joinGapLine}</p>

      <div className={styles.compareBlock}>
        <h4 className={inspectorStyles.insT}>
          {t("admin:vouchGraph.compare.sharedScenes")}
        </h4>
        {sharedSceneLabels.length > 0 ? (
          <ul className={styles.sceneList}>
            {sharedSceneLabels.map((scene) => (
              <li key={scene.id} className={styles.sceneLabel}>
                {scene.label}
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.compareNote}>
            {t("admin:vouchGraph.compare.noSharedScenes")}
          </p>
        )}
      </div>

      <Button variant="ghost" size="sm" onClick={onClear}>
        {t("admin:vouchGraph.compare.clearCta")}
      </Button>
    </section>
  );
}
