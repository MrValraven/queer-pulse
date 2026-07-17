import { FiCalendar, FiCheck, FiCopy, FiMapPin, FiUser } from "react-icons/fi";
import { useToast } from "../../../shared/components/feedback/useToast";
import { Translation } from "../../../shared/i18n/Translation";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useFormat } from "../../../shared/i18n/format";
import { EVENT, EVENT_ARRIVAL_DATE } from "./checkout.data";
import { useCheckout } from "./checkoutContext";
import { ConfirmationNext } from "./ConfirmationNext";
import { cx } from "./cx";
import s from "./checkout.module.css";

export function ConfirmationStep() {
  const { ref, qty, email, dietary, access } = useCheckout();
  const { showToast } = useToast();
  const { t } = useTranslation();
  const fmt = useFormat();
  const seats = t("gatherings:checkout.confirm.seatsCount", { count: qty });
  const hasNotes = !!(dietary.trim() || access.trim());

  function copyRef() {
    if (ref) navigator.clipboard?.writeText(ref);
    showToast(t("gatherings:checkout.confirm.refCopiedToast"), "success");
  }

  return (
    <>
      <div className={s["co-conf"]}>
        <div className={s["co-check-wrap"]}>
          <svg className={s["co-check-svg"]} viewBox="0 0 72 72" aria-hidden>
            <circle className={s["co-check-circle"]} cx="36" cy="36" r="32" />
            <polyline
              className={s["co-check-mark"]}
              points="20,36 30,47 52,24"
            />
          </svg>
        </div>
        <h1 className={s["co-conf-h"]}>
          <Translation
            i18nKey="gatherings:checkout.confirm.title"
            components={{ em: <em /> }}
          />
        </h1>
        <p className={s["co-conf-sub"]}>
          {t("gatherings:checkout.confirm.subtitle", {
            count: qty,
            email: email || t("gatherings:checkout.confirm.inboxFallback"),
            date: fmt.date(EVENT_ARRIVAL_DATE, {
              day: "numeric",
              month: "long",
            }),
          })}
        </p>
        <div className={s["co-ref"]}>
          {t("gatherings:checkout.confirm.bookingRefLabel")}{" "}
          <strong>{ref ?? "QP-000000"}</strong>
          <button
            className={s["co-ref-copy"]}
            type="button"
            onClick={copyRef}
            aria-label={t("gatherings:checkout.confirm.copyRefAria")}
          >
            <FiCopy />
          </button>
        </div>
      </div>

      <div className={s["co-conf-detail"]}>
        <DetailRow
          icon={<FiCalendar />}
          bg="rgba(var(--accent-rgb),.1)"
          label={t("gatherings:checkout.confirm.dateLabel")}
          value={EVENT.dateLong}
        />
        <DetailRow
          icon={<FiMapPin />}
          bg="rgba(var(--jade-rgb),.1)"
          label={t("gatherings:checkout.confirm.locationLabel")}
          value={t("gatherings:checkout.confirm.locationValue", {
            neighbourhood: "Mouraria",
          })}
        />
        <DetailRow
          icon={<FiUser />}
          bg="rgba(45,27,61,.07)"
          label={t("gatherings:checkout.confirm.hostGuestsLabel")}
          value={`${EVENT.hostName} · ${seats}`}
        />
      </div>

      <div className={cx(s["co-echo"], hasNotes && s.show)}>
        <div className={s["co-echo-h"]}>
          <FiCheck />
          {t("gatherings:checkout.confirm.hostNotesHeading")}
        </div>
        {dietary.trim() && (
          <div className={s["co-echo-row"]}>
            <b>{t("gatherings:checkout.confirm.dietaryLabel")}</b>{" "}
            {dietary.trim()}
          </div>
        )}
        {access.trim() && (
          <div className={s["co-echo-row"]}>
            <b>{t("gatherings:checkout.confirm.accessLabel")}</b>{" "}
            {access.trim()}
          </div>
        )}
      </div>

      <ConfirmationNext />
    </>
  );
}

function DetailRow({
  icon,
  bg,
  label,
  value,
}: {
  icon: React.ReactNode;
  bg: string;
  label: string;
  value: string;
}) {
  return (
    <div className={s["co-cd-row"]}>
      <div className={s["co-cd-ic"]} style={{ background: bg }}>
        {icon}
      </div>
      <div>
        <div className={s["co-cd-lbl"]}>{label}</div>
        <div className={s["co-cd-val"]}>{value}</div>
      </div>
    </div>
  );
}
