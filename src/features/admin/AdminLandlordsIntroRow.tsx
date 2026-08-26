import { Link } from "react-router-dom";
import { FiCheck, FiClock, FiMail, FiSlash } from "react-icons/fi";
import { Badge, Button } from "../../shared/components/ui";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { formatDate, formatRelative } from "../../shared/lib/date";
import { initialsOf, tintForSlug } from "../../shared/api/refs";
import { routes } from "../../app/routeMap";
import type { LandlordIntroRequestDTO } from "./api/adminLandlords.api";
import {
  daysWaiting,
  LANDLORD_DETAIL_PATH,
  LANDLORD_STALE_DAYS,
} from "./adminLandlords.data";
import { AdminAvatar } from "./ui";
import styles from "./AdminLandlordsPage.module.css";

const STATUS_TONE = {
  pending: "amber",
  accepted: "jade",
  declined: "danger",
} as const;

/**
 * One introduction request: who asked, for which landlord, in their own words,
 * how long they have been waiting, and whatever was already answered.
 */
export function AdminLandlordIntroRow({
  request,
  isPending,
  onAccept,
  onDecline,
}: {
  request: LandlordIntroRequestDTO;
  isPending: boolean;
  onAccept: () => void;
  onDecline: () => void;
}) {
  const { t, language } = useTranslation();
  const fmt = useFormat();
  const requester = request.requester;
  const waitingDays = daysWaiting(request.createdAt);
  const isStale =
    request.status === "pending" && waitingDays >= LANDLORD_STALE_DAYS;

  return (
    <li className={styles.row}>
      <div className={styles.rowMain}>
        <div className={styles.rowTop}>
          <h3 className={styles.rowName}>
            <Link to={`${LANDLORD_DETAIL_PATH}/${request.landlordSlug}`}>
              {request.landlordName}
            </Link>
          </h3>
          <Badge tone={STATUS_TONE[request.status]} dot>
            {t(`admin:landlords.intro.status.${request.status}`)}
          </Badge>
        </div>

        {request.note && <p className={styles.rowNote}>“{request.note}”</p>}

        <div className={styles.rowSubmitter}>
          {requester ? (
            <>
              <AdminAvatar
                initials={initialsOf(requester.firstName, requester.lastName)}
                tone={tintForSlug(requester.slug)}
                size="sm"
                src={requester.avatarUrl ?? undefined}
                alt=""
              />
              <Link to={`${routes.members}/${requester.slug}`}>
                {t("admin:landlords.intro.askedBy", {
                  name: `${requester.firstName} ${requester.lastName}`.trim(),
                })}
              </Link>
            </>
          ) : (
            <span>
              {t("admin:landlords.intro.askedByName", { name: request.name })}
            </span>
          )}
          {request.contactEmail && (
            <span>
              <FiMail aria-hidden /> {request.contactEmail}
            </span>
          )}
          <span className={isStale ? styles.rowAgeStale : undefined}>
            <FiClock aria-hidden />{" "}
            {isStale
              ? t("admin:landlords.intro.waitingDays", { count: waitingDays })
              : t("admin:landlords.intro.asked", {
                  age: formatRelative(request.createdAt, fmt),
                })}
          </span>
        </div>

        {request.decidedAt && (
          <div className={styles.rowPrior}>
            <h4 className={styles.rowPriorHead}>
              {t("admin:landlords.prior.heading")}
            </h4>
            {request.decisionReason && (
              <p className={styles.rowPriorBody}>“{request.decisionReason}”</p>
            )}
            <p className={styles.rowPriorMeta} title={request.decidedBy ?? ""}>
              {t("admin:landlords.prior.meta", {
                date: formatDate(request.decidedAt, language),
                moderator: request.decidedBy
                  ? request.decidedBy.slice(0, 8)
                  : t("admin:landlords.prior.unknownStaff"),
              })}
            </p>
          </div>
        )}
      </div>

      <div className={styles.rowActions}>
        {request.status === "pending" ? (
          <>
            <Button
              variant="ghost"
              size="md"
              disabled={isPending}
              onClick={onDecline}
            >
              <FiSlash aria-hidden />
              {t("admin:landlords.intro.declineCta")}
            </Button>
            <Button
              variant="jade"
              size="md"
              disabled={isPending}
              onClick={onAccept}
            >
              <FiCheck aria-hidden />
              {t("admin:landlords.intro.acceptCta")}
            </Button>
          </>
        ) : (
          <p className={styles.rowActionsNote}>
            {t("admin:landlords.intro.answered")}
          </p>
        )}
      </div>
    </li>
  );
}
