import { FiArrowRight } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { routes } from "../../app/routeMap";
import type { Partner } from "./partnerDetails";
import { useTranslation } from "../../shared/i18n/useTranslation";
import s from "./PartnerDetailPage.module.css";

export function PartnerDetailSidebar({ p }: { p: Partner }) {
  const { t } = useTranslation();
  return (
    <aside className={s.side}>
      <div className={s.sideCard}>
        <h4>{t("marketing:partnerDetail.sidebar.atGlance")}</h4>
        {p.atGlance.map((row) => (
          <div className={s.infoRow} key={row.label}>
            <span>{row.label}</span>
            <b
              className={
                row.accent === "coral"
                  ? s.accentCoral
                  : row.accent === "jade"
                    ? s.accentJade
                    : undefined
              }
            >
              {row.value}
            </b>
          </div>
        ))}
      </div>

      <div className={s.sideCard}>
        <h4>
          {t("marketing:partnerDetail.sidebar.contactDirectly", {
            name: p.name,
          })}
        </h4>
        {p.contact.phone && (
          <div className={s.contactRow}>
            <svg viewBox="0 0 24 24">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 5.15 8.81 19.79 19.79 0 0 1 2.08 4.18 2 2 0 0 1 4.07 2h3a2 2 0 0 1 2 1.72" />
            </svg>
            <span>
              <a href={`tel:${p.contact.phone.replace(/\s/g, "")}`}>
                {p.contact.phone}
              </a>
              {p.contact.phoneNote ? ` · ${p.contact.phoneNote}` : null}
            </span>
          </div>
        )}
        {p.contact.email && (
          <div className={s.contactRow}>
            <svg viewBox="0 0 24 24">
              <rect x={2} y={4} width={20} height={16} rx={2} />
              <polyline points="22,6 12,13 2,6" />
            </svg>
            <a href={`mailto:${p.contact.email}`}>{p.contact.email}</a>
          </div>
        )}
        {p.contact.website && (
          <div className={s.contactRow}>
            <svg viewBox="0 0 24 24">
              <path d="M21 13.32V20a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h6.68" />
            </svg>
            <a
              href={`https://${p.contact.website}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {p.contact.website}
            </a>
          </div>
        )}
        {p.contact.address && (
          <div className={s.contactRow}>
            <svg viewBox="0 0 24 24">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx={12} cy={10} r={3} />
            </svg>
            {p.contact.address}
          </div>
        )}
      </div>

      <div className={[s.sideCard, s.becomeCard].join(" ")}>
        <h4>{t("marketing:partnerDetail.sidebar.becomeTitle")}</h4>
        <p>{t("marketing:partnerDetail.sidebar.becomeBody")}</p>
        {/* PRD-272. Was a `mailto:hello@queerpulse.com`. "Become a partner" has
            a real intake — the application form, with a queue, a due clock, a
            triage assignment and an in-app decision — so the card that invites
            it now points there instead of at a shared mailbox. */}
        <Button
          variant="primary"
          className={s.becomeBtn}
          to={routes.partnerApply}
        >
          {t("marketing:partnerDetail.sidebar.becomeCta")}{" "}
          <FiArrowRight aria-hidden />
        </Button>
      </div>
    </aside>
  );
}
