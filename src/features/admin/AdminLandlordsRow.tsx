import { Link } from "react-router-dom";
import {
  FiClock,
  FiMapPin,
  FiTrash2,
  FiCheck,
  FiCornerUpLeft,
} from "react-icons/fi";
import { Badge, Button } from "../../shared/components/ui";
import { initialsOf, tintForSlug } from "../../shared/api/refs";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { formatDate, formatRelative } from "../../shared/lib/date";
import { routes } from "../../app/routeMap";
import type { AdminLandlordDTO } from "./api/adminLandlords.api";
import {
  daysWaiting,
  LANDLORD_DETAIL_PATH,
  LANDLORD_STALE_DAYS,
} from "./adminLandlords.data";
import { AdminAvatar } from "./ui";
import styles from "./AdminLandlordsPage.module.css";

/** The audit trail, when there is one: who decided, when, and what they said. */
function PriorDecision({ landlord }: { landlord: AdminLandlordDTO }) {
  const { t, language } = useTranslation();
  if (!landlord.decidedAt) return null;
  return (
    <div className={styles.rowPrior}>
      <h4 className={styles.rowPriorHead}>
        {t("admin:landlords.prior.heading")}
      </h4>
      {landlord.decisionReason && (
        <p className={styles.rowPriorBody}>“{landlord.decisionReason}”</p>
      )}
      <p className={styles.rowPriorMeta} title={landlord.decidedBy ?? ""}>
        {t("admin:landlords.prior.meta", {
          date: formatDate(landlord.decidedAt, language),
          moderator: landlord.decidedBy
            ? landlord.decidedBy.slice(0, 8)
            : t("admin:landlords.prior.unknownStaff"),
        })}
      </p>
    </div>
  );
}

/**
 * One directory entry: who suggested it, how long it has been waiting, what has
 * already been decided about it, and the two decisions left to make.
 *
 * Publishing is one click. Holding an entry back or removing it opens the
 * reason dialog first, because both are answers a member reads.
 */
export function AdminLandlordRow({
  landlord,
  isPending,
  onPublish,
  onHoldBack,
  onRemove,
}: {
  landlord: AdminLandlordDTO;
  isPending: boolean;
  onPublish: () => void;
  onHoldBack: () => void;
  onRemove: () => void;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const submitter = landlord.submittedBy;
  const waitingDays = daysWaiting(landlord.createdAt);
  const isStale =
    landlord.status === "review" && waitingDays >= LANDLORD_STALE_DAYS;

  return (
    <li className={styles.row}>
      <div className={styles.rowMain}>
        <div className={styles.rowTop}>
          <h3 className={styles.rowName}>
            <Link to={`${LANDLORD_DETAIL_PATH}/${landlord.slug}`}>
              {landlord.name}
            </Link>
          </h3>
          <Badge tone={landlord.status === "live" ? "jade" : "amber"} dot>
            {t(`admin:landlords.status.${landlord.status}`)}
          </Badge>
        </div>

        <p className={styles.rowMeta}>
          <FiMapPin aria-hidden />{" "}
          {landlord.hood || t("admin:landlords.row.noHood")}
          {" · "}
          {t("admin:landlords.row.recommendations", {
            count: landlord.rating.count,
          })}
        </p>

        {landlord.note && <p className={styles.rowNote}>{landlord.note}</p>}

        <div className={styles.rowSubmitter}>
          {submitter ? (
            <>
              <AdminAvatar
                initials={initialsOf(submitter.firstName, submitter.lastName)}
                tone={tintForSlug(submitter.slug)}
                size="sm"
                src={submitter.avatarUrl ?? undefined}
                alt=""
              />
              <Link to={`${routes.members}/${submitter.slug}`}>
                {t("admin:landlords.row.suggestedBy", {
                  name: `${submitter.firstName} ${submitter.lastName}`.trim(),
                })}
              </Link>
            </>
          ) : (
            <span>{t("admin:landlords.row.staffAdded")}</span>
          )}
          <span className={isStale ? styles.rowAgeStale : undefined}>
            <FiClock aria-hidden />{" "}
            {isStale
              ? t("admin:landlords.row.waitingDays", { count: waitingDays })
              : t("admin:landlords.row.added", {
                  age: formatRelative(landlord.createdAt, fmt),
                })}
          </span>
        </div>

        <PriorDecision landlord={landlord} />
      </div>

      <div className={styles.rowActions}>
        {landlord.status === "review" ? (
          <Button
            variant="jade"
            size="md"
            disabled={isPending}
            onClick={onPublish}
          >
            <FiCheck aria-hidden />
            {t("admin:landlords.action.publish")}
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="md"
            disabled={isPending}
            onClick={onHoldBack}
          >
            <FiCornerUpLeft aria-hidden />
            {t("admin:landlords.action.holdBack")}
          </Button>
        )}
        <Button
          variant="danger"
          size="md"
          disabled={isPending}
          onClick={onRemove}
        >
          <FiTrash2 aria-hidden />
          {t("admin:landlords.action.remove")}
        </Button>
      </div>
    </li>
  );
}
