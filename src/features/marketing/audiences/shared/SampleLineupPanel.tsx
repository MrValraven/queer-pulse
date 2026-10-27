import { MemberIdentity } from "../../../../shared/components/ui/MemberIdentity";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import type { SubprofileKind } from "../../../subprofiles/api/subprofiles.api";
import { KIND_LABEL_KEYS } from "../../../subprofiles/subprofile-kinds";
import styles from "../../../gatherings/GatheringLineup.module.css";

/** One sample person on a lineup, with the craft shown beside their name. */
export interface SampleLineupEntry {
  entryId: string;
  name: string;
  avatarUrl?: string;
  kind: SubprofileKind;
}

/**
 * The event lineup as `GatheringLineup` draws it, from sample entries. The
 * product component reads its lineup from the server, so this renders the
 * same markup on the product's own stylesheet with the real `MemberIdentity`
 * and kind labels. Rows carry no link (sample people have no profile) and no
 * staff badge lookup.
 */
export function SampleLineupPanel({
  title,
  entries,
}: {
  title: string;
  entries: readonly SampleLineupEntry[];
}) {
  const { t } = useTranslation();
  return (
    <section className={styles.panel}>
      <h2 className={styles.heading}>{title}</h2>
      <ul className={styles.list}>
        {entries.map((entry) => (
          <li key={entry.entryId} className={styles.row}>
            <MemberIdentity
              person={{ name: entry.name, avatarUrl: entry.avatarUrl }}
              secondary={t(KIND_LABEL_KEYS[entry.kind])}
              size={38}
              showStaffBadge={false}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
