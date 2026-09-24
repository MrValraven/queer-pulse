import {
  FiCalendar,
  FiLink,
  FiMail,
  FiMessageCircle,
  FiUserCheck,
  FiUserPlus,
} from "react-icons/fi";
import { Button } from "../../../../shared/components/ui";
import { safeHref } from "../../../../shared/lib/safeHref";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { IdentityContactButton } from "../../../messages/identityContact/IdentityContactButton";
import { SubprofileFollow } from "../../SubprofileFollow";
import { SubprofileMoreMenu } from "../../SubprofileMoreMenu";
import type { PublicSubprofileView } from "../../api/subprofiles.adapters";
import type { PersonaAction, PersonaViewMode } from "../../personaSkinRender";
import type { TherapistView } from "./therapistView";
import { emailHref, websiteHref, websiteLabel } from "./therapistContactLinks";
import { TherapistInertButton as InertButton } from "./TherapistInertButton";
import { TherapistEditLink } from "./TherapistEditLink";
import { THERAPIST_EDIT_TARGETS } from "./therapistEditLinks.data";
import styles from "./TherapistHero.module.css";

interface TherapistHeroActionsProps {
  data: PublicSubprofileView;
  view: TherapistView;
  /** "public" is live; "visitor", "owner" and "preview" render inert
   *  look-alikes. */
  mode: PersonaViewMode;
  onAction: (action: PersonaAction) => void;
  contactId: string;
  /** The phone action bar carries the message button below 860px. */
  hasMobileBar: boolean;
}

/**
 * The hero's contact row and the privacy hint under it. Only "public" is
 * live. "visitor", "owner" and "preview" render every control as a
 * look-alike (the sidebar contact card follows the same rule); the owner's
 * visitor preview still mounts the more menu, with Report inert. The owner
 * gets edit links in place of the hint, with an "Add" link while no booking
 * button shows. An email or website that does not read as one renders none.
 */
export function TherapistHeroActions({
  data,
  view,
  mode,
  onAction,
  contactId,
  hasMobileBar,
}: TherapistHeroActionsProps) {
  const { t } = useTranslation();
  const name = view.firstName || data.displayName;
  const isLive = mode === "public";
  const isOwner = mode === "owner";
  const isMessageable = data.status === "published";
  const messageLabel = t("subprofiles:therapist.hero.message", { name });
  const bookHref = safeHref(data.ctaUrl);
  const bookLabel =
    data.ctaLabel.trim() || t("subprofiles:therapist.hero.bookCall");
  const bookEditKey = bookHref ? "bookButton" : "bookLink";
  const mailHref = emailHref(view.email);
  const siteHref = websiteHref(view.website);
  const primaryClassName = hasMobileBar
    ? `${styles.primary} ${styles.primaryDesktopOnly}`
    : styles.primary;

  return (
    <>
      <div className={styles.actions} id={contactId}>
        {isMessageable && (
          <div className={primaryClassName}>
            {isLive ? (
              <IdentityContactButton
                target={{ kind: "persona", subprofileId: data.id }}
                name={data.displayName}
                buttonVariant="primary"
                label={messageLabel}
                onOpen={() => onAction("message")}
              />
            ) : (
              <InertButton
                variant="primary"
                icon={<FiMessageCircle aria-hidden />}
                label={messageLabel}
              />
            )}
          </div>
        )}

        {bookHref &&
          (isLive ? (
            <Button
              variant="ghost"
              size="md"
              href={bookHref}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => onAction("cta")}
            >
              <FiCalendar aria-hidden /> {bookLabel}
            </Button>
          ) : (
            <InertButton icon={<FiCalendar aria-hidden />} label={bookLabel} />
          ))}

        {mailHref &&
          (isLive ? (
            <Button variant="ghost" size="md" href={mailHref}>
              <FiMail aria-hidden /> {t("subprofiles:therapist.hero.email")}
            </Button>
          ) : (
            <InertButton
              icon={<FiMail aria-hidden />}
              label={t("subprofiles:therapist.hero.email")}
            />
          ))}

        {siteHref &&
          (isLive ? (
            <Button
              variant="ghost"
              size="md"
              href={siteHref}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.website}
            >
              <FiLink aria-hidden /> {websiteLabel(view.website)}
            </Button>
          ) : (
            <InertButton
              icon={<FiLink aria-hidden />}
              label={websiteLabel(view.website)}
              className={styles.website}
            />
          ))}

        {isLive ? (
          <SubprofileFollow
            subprofileId={data.id}
            followerCount={data.followerCount}
            viewerFollowing={data.viewerFollowing}
            isOwnerViewing={false}
          />
        ) : (
          <InertButton
            icon={
              data.viewerFollowing ? (
                <FiUserCheck aria-hidden />
              ) : (
                <FiUserPlus aria-hidden />
              )
            }
            label={t(
              data.viewerFollowing
                ? "subprofiles:hero.follow.following"
                : "subprofiles:hero.follow.cta",
            )}
          />
        )}

        {/* The editor's docked preview and the owner's own view mount no
            menu, as the persona hero does; the owner's visitor preview gets
            it with Report inert. */}
        {(isLive || mode === "visitor") && (
          <SubprofileMoreMenu
            view={data}
            onAction={onAction}
            inertReport={!isLive}
          />
        )}
      </div>

      {isOwner && (
        <p className={styles.ownerEdits}>
          <TherapistEditLink
            target={THERAPIST_EDIT_TARGETS[bookEditKey]}
            label={t(
              bookHref
                ? "subprofiles:therapist.edit.bookButton"
                : "subprofiles:therapist.side.add.booking",
            )}
          />
          <TherapistEditLink
            target={THERAPIST_EDIT_TARGETS.contactLinks}
            label={t("subprofiles:therapist.edit.contactLinks")}
          />
        </p>
      )}

      {isMessageable && !isOwner && (
        <p className={styles.hint}>
          {t("subprofiles:therapist.hero.hint", { name })}
        </p>
      )}
    </>
  );
}
