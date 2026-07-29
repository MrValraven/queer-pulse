import { Link } from "react-router-dom";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { type DirectoryPlace, type Tint } from "./directoryPlaces";
import { routes } from "../../app/routeMap";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { MEMBERS_HERE } from "./directorySpace.data";
import s from "./DirectorySpacePage.module.css";

const TINT: Record<Tint, string> = {
  coral: s.tCoral!,
  jade: s.tJade!,
  plum: s.tPlum!,
};

interface Props {
  place: DirectoryPlace;
  /** Moderation preview: render contact/nav CTAs as inert (read-only view). */
  preview?: boolean;
}

export function DirectorySpaceAside({ place, preview = false }: Props) {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const igUrl = place.social.instagram
    ? `https://instagram.com/${place.social.instagram.replace(/^@/, "")}`
    : undefined;

  return (
    <aside className={s.side}>
      <div className={s.sideCard}>
        <div className={s.map}>
          <svg
            viewBox="0 0 300 300"
            preserveAspectRatio="xMidYMid slice"
            aria-hidden="true"
          >
            <rect width="300" height="300" fill="#e9e5db" />
            <path d="M0 80 L300 100 L300 110 L0 90 Z" fill="#d9d3c5" />
            <path d="M0 180 L300 200 L300 210 L0 190 Z" fill="#d9d3c5" />
            <path d="M80 0 L100 300 L110 300 L90 0 Z" fill="#d9d3c5" />
            <path d="M200 0 L220 300 L230 300 L210 0 Z" fill="#d9d3c5" />
            <circle cx="160" cy="148" r="20" fill="#b8d4b1" opacity=".7" />
          </svg>
          <div className={s.pin}>
            <svg viewBox="0 0 24 24">
              <path d="M12 2C7 2 3 6 3 11c0 7 9 11 9 11s9-4 9-11c0-5-4-9-9-9z" />
            </svg>
          </div>
        </div>
        <div className={s.addr}>
          <strong
            style={{
              display: "block",
              color: "var(--plum)",
              fontFamily: "var(--serif)",
              fontSize: 17,
              marginBottom: 3,
            }}
          >
            {place.name}
          </strong>
          {place.address}
        </div>
        {place.social.phone && (
          <div className={s.contactRow}>
            <svg viewBox="0 0 24 24">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 5.15 8.81 19.79 19.79 0 0 1 2.08 4.18 2 2 0 0 1 4.07 2h3a2 2 0 0 1 2 1.72c.16.93.4 1.83.7 2.7" />
            </svg>
            <a href={`tel:${place.social.phone.replace(/\s/g, "")}`}>
              {place.social.phone}
            </a>
          </div>
        )}
        {place.social.website && (
          <div className={s.contactRow}>
            <svg viewBox="0 0 24 24">
              <circle cx={12} cy={12} r={10} />
              <path d="M2 12h20M12 2a15 15 0 0 1 0 20a15 15 0 0 1 0-20" />
            </svg>
            <a
              href={`https://${place.social.website}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {place.social.website}
            </a>
          </div>
        )}
        {igUrl && (
          <div className={s.contactRow}>
            <svg viewBox="0 0 24 24">
              <rect x={2} y={2} width={20} height={20} rx={5} />
              <circle cx={12} cy={12} r={4} />
              <line x1={17.5} y1={6.5} x2={17.5} y2={6.5} />
            </svg>
            <a href={igUrl} target="_blank" rel="noopener noreferrer">
              {place.social.instagram}
            </a>
          </div>
        )}
        {place.social.email && (
          <div className={s.contactRow}>
            <svg viewBox="0 0 24 24">
              <rect x={2} y={4} width={20} height={16} rx={2} />
              <polyline points="22,6 12,13 2,6" />
            </svg>
            <a href={`mailto:${place.social.email}`}>{place.social.email}</a>
          </div>
        )}
        <div className={s.cta}>
          {place.social.website ? (
            <Button
              variant="primary"
              className={s.ctaBtn}
              href={`https://${place.social.website}`}
            >
              {t("marketing:directory.detail.visitWebsite")}
            </Button>
          ) : place.social.email ? (
            <Button
              variant="primary"
              className={s.ctaBtn}
              href={`mailto:${place.social.email}`}
            >
              {t("marketing:directory.detail.getInTouch")}
            </Button>
          ) : null}
          {!preview && (
            <Button variant="ghost" className={s.ctaBtn} to={routes.directory}>
              {t("marketing:directory.detail.backToDirectory")}
            </Button>
          )}
        </div>
      </div>

      <div className={s.sideCard}>
        <h4>{t("marketing:directory.detail.whoRunsIt")}</h4>
        <div className={[s.ownerAv, TINT[place.owner.tint]].join(" ")}>
          {place.owner.initials}
        </div>
        <div className={s.ownerName}>{place.owner.name}</div>
        <div className={s.ownerRole}>{place.owner.role}</div>
        <span
          className={[
            s.qpChip,
            place.owner.inQueerPulse ? s.qpChipYes : s.qpChipNo,
          ].join(" ")}
        >
          {t(
            place.owner.inQueerPulse
              ? "marketing:directory.detail.onQueerPulse"
              : "marketing:directory.detail.communityVouched",
          )}
        </span>
        <p className={s.ownerBio}>{place.owner.bio}</p>
        {place.owner.inQueerPulse && (
          <Button variant="ghost" className={s.ctaBtn} to={routes.members}>
            {t("marketing:directory.detail.viewProfile", {
              name: place.owner.first,
            })}
          </Button>
        )}
      </div>

      {/* "Members here lately" is a fabricated demo roster (directorySpace.data)
          with no per-place backing from the API — show it only in demo so real
          business pages never display invented visitors. */}
      {demoMode && (
        <div className={s.sideCard}>
          <h4>{t("marketing:directory.detail.membersHereLately")}</h4>
          <div className={s.whoHere}>
            {MEMBERS_HERE.map((member) => (
              <div key={member.initials} className={s.whoRow}>
                <span className={[s.whoAv, TINT[member.tint]].join(" ")}>
                  {member.initials}
                </span>
                <Link to={routes.members}>{member.name}</Link>
                <span className={s.whoWhen}>{t(member.whenKey)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {place.upcoming && place.upcoming.length > 0 && (
        <div className={s.sideCard}>
          <h4>{t("marketing:directory.detail.upcomingHere")}</h4>
          {place.upcoming.map((upcomingEvent) => (
            <p key={upcomingEvent.title} className={s.upRow}>
              <b>{upcomingEvent.when}</b>
              <br />
              {upcomingEvent.title}
            </p>
          ))}
        </div>
      )}
    </aside>
  );
}
