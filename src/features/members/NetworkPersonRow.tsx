import { MemberIdentity } from "../../shared/components/ui/MemberIdentity";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { formatRelative } from "../../shared/lib/date";
import type {
  NetworkGroupKey,
  NetworkPerson,
} from "./api/profileNetwork.types";
import { NETWORK_GROUP_META } from "./profileNetwork.data";
import styles from "./NetworkPersonRow.module.css";

/**
 * One person in a network group: the shared `MemberIdentity` primitive (avatar +
 * name, linking to `/members/:slug`) with a warm relative-time line as its
 * secondary label — "connected 3 days ago", "you vouched last week", etc. When
 * the action timestamp is unknown (`at` is null, or `formatRelative` can't parse
 * it) the phrase drops the time rather than showing an empty "connected ".
 * Rendered by the full-list `NetworkListModal`.
 */
export function NetworkPersonRow({
  person,
  groupKey,
}: {
  person: NetworkPerson;
  groupKey: NetworkGroupKey;
}) {
  const { t } = useTranslation();
  const formatters = useFormat();
  const meta = NETWORK_GROUP_META[groupKey];
  const relative = person.at ? formatRelative(person.at, formatters) : "";
  const label = relative
    ? t(meta.labelKey, { time: relative })
    : t(meta.labelNoTimeKey);

  return (
    <li className={styles.row}>
      <MemberIdentity
        person={{
          slug: person.slug,
          name: person.name,
          avatarUrl: person.avatarUrl,
        }}
        secondary={label}
        to={`/members/${person.slug}`}
        size={38}
      />
    </li>
  );
}
