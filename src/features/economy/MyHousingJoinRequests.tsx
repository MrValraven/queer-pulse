import { Badge, type BadgeTone } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { formatDate } from "../../shared/lib/date";
import type {
  HousingJoinRequestStatus,
  MyHousingJoinRequest,
} from "./housingJoinRequests.data";
import styles from "./MyHousingJoinRequests.module.css";

/** The pill each state renders as, and the sentence under it. One map for both
 *  housing surfaces: the adapters normalise the group enum's `approved` onto
 *  `accepted` before anything reaches here. */
const STATUS_PILLS: Record<
  HousingJoinRequestStatus,
  { labelKey: string; outcomeKey: string; tone: BadgeTone }
> = {
  pending: {
    labelKey: "economy:housingJoinRequests.status.pending",
    outcomeKey: "economy:housingJoinRequests.outcome.pending",
    tone: "amber",
  },
  accepted: {
    labelKey: "economy:housingJoinRequests.status.accepted",
    outcomeKey: "economy:housingJoinRequests.outcome.accepted",
    tone: "jade",
  },
  declined: {
    labelKey: "economy:housingJoinRequests.status.declined",
    outcomeKey: "economy:housingJoinRequests.outcome.declined",
    tone: "danger",
  },
};

function JoinRequestRow({ request }: { request: MyHousingJoinRequest }) {
  const { t, language } = useTranslation();
  const pill = STATUS_PILLS[request.status];
  return (
    <li className={styles.row}>
      <div className={styles.rowHead}>
        <span className={styles.name}>{request.name}</span>
        <Badge tone={pill.tone}>{t(pill.labelKey)}</Badge>
      </div>
      <p className={styles.meta}>
        {t("economy:housingJoinRequests.askedOn", {
          date: formatDate(request.createdAt, language),
        })}
      </p>
      <p className={styles.outcome}>{t(pill.outcomeKey)}</p>
    </li>
  );
}

/**
 * PRD-242. The applications this member filed on a housing surface, and where
 * each one stands.
 *
 * Why it exists: triage told nobody. Someone asked to join a co-op or a vetted
 * group, the form thanked them, and the decision then lived only in the review
 * console. The bell now carries the outcome, and this is what the page it opens
 * shows, so the row it names has somewhere to land.
 *
 * Serves both surfaces from one component because the applicant asks one
 * question of both. The co-op page passes every co-op application it has; the
 * group detail page passes only the rows for the group being read.
 *
 * Renders nothing when there is nothing to show, which is the common case: a
 * reader who never applied should not meet a section explaining an absence, and
 * a signed-out reader never has one at all.
 */
export function MyHousingJoinRequests({
  requests,
  titleKey,
  titleEmKey,
  subKey,
}: {
  requests: MyHousingJoinRequest[];
  titleKey: string;
  titleEmKey: string;
  subKey: string;
}) {
  const { t } = useTranslation();
  if (requests.length === 0) return null;

  return (
    <section className={styles.section}>
      <div className="wrap">
        <h2 className={styles.title}>
          {t(titleKey)} <em>{t(titleEmKey)}</em>
        </h2>
        <p className={styles.sub}>{t(subKey)}</p>
        <ul className={styles.list}>
          {requests.map((request) => (
            <JoinRequestRow key={request.id} request={request} />
          ))}
        </ul>
      </div>
    </section>
  );
}
