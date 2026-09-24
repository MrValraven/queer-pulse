import { useId } from "react";
import { Link } from "react-router-dom";
import { FiCalendar, FiLink, FiMail, FiMessageCircle } from "react-icons/fi";
import { Button } from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { Translation } from "../../../../shared/i18n/Translation";
import { safeHref } from "../../../../shared/lib/safeHref";
import { routes } from "../../../../app/routeMap";
import { IdentityContactButton } from "../../../messages/identityContact/IdentityContactButton";
import type { PublicSubprofileView } from "../../api/subprofiles.adapters";
import type { PersonaAction, PersonaViewMode } from "../../personaSkinRender";
import type { TherapistView } from "./therapistView";
import { emailHref, websiteHref, websiteLabel } from "./therapistContactLinks";
import { SideButton } from "./TherapistSideButton";
import { TherapistEditLink } from "./TherapistEditLink";
import type {
  TherapistEditChapter,
  TherapistEditTarget,
} from "./therapistEditLinks.data";
import styles from "./TherapistSidebar.module.css";

interface TherapistContactCardProps {
  data: PublicSubprofileView;
  view: TherapistView;
  mode: PersonaViewMode;
  onAction: (action: PersonaAction) => void;
}

/** The sidebar contact card's anchor. The skip links target the hero's
 *  action row and the phone bar instead (ids in TherapistBody). */
const CONTACT_ID = "therapist-contact";

function pageBlock(
  chapter: TherapistEditChapter,
  field: string,
): TherapistEditTarget {
  return { pane: "skinBlocks", chapter, field };
}

/** Where the owner edits each value this card shows. */
const EDIT = {
  firstContact: pageBlock("fees", "therapyFees.firstContact"),
  waitNote: pageBlock("basics", "therapist.waitNote"),
  status: pageBlock("basics", "therapist.status"),
  email: pageBlock("contact", "therapist.email"),
  website: pageBlock("contact", "therapist.website"),
  ctaLabel: { pane: "presence", field: "ctaLabel" },
  ctaUrl: { pane: "presence", field: "ctaUrl" },
} satisfies Record<string, TherapistEditTarget>;

/** The card's title and body, and where the owner edits the title. */
function useContactCopy(view: TherapistView, name: string, hasCall: boolean) {
  const { t } = useTranslation();
  if (view.status === "wait") {
    return {
      title: view.waitNote
        ? t("subprofiles:therapist.side.contact.title.wait", {
            waitNote: view.waitNote,
          })
        : t("subprofiles:therapist.side.contact.title.waitBare"),
      body: t("subprofiles:therapist.side.contact.body.wait", { name }),
      titleEdit: EDIT.waitNote,
      titleEditAria: t("subprofiles:therapist.side.edit.waitNote"),
    };
  }
  if (view.status === "closed") {
    return {
      title: t("subprofiles:therapist.side.contact.title.closed"),
      body: t(
        view.referrals.length > 0
          ? "subprofiles:therapist.side.contact.body.closed"
          : "subprofiles:therapist.side.contact.body.closedBare",
        { name },
      ),
      titleEdit: EDIT.status,
      titleEditAria: undefined,
    };
  }
  return {
    titleEdit: EDIT.firstContact,
    titleEditAria: undefined,
    title:
      view.fees?.firstContact ||
      t("subprofiles:therapist.side.contact.title.open"),
    body: t(
      hasCall
        ? "subprofiles:therapist.side.contact.body.open"
        : "subprofiles:therapist.side.contact.body.openNoCall",
      { name },
    ),
  };
}

interface MissingContactLinksProps {
  hasCall: boolean;
  hasEmail: boolean;
  hasWebsite: boolean;
}

/** The owner's quiet "Add …" links for the contact buttons the page hides
 *  because their value is empty or unreadable. */
function MissingContactLinks({
  hasCall,
  hasEmail,
  hasWebsite,
}: MissingContactLinksProps) {
  const { t } = useTranslation();
  if (hasCall && hasEmail && hasWebsite) return null;
  return (
    <div className={styles.addLinks}>
      {!hasCall && (
        <TherapistEditLink
          target={EDIT.ctaUrl}
          label={t("subprofiles:therapist.side.add.booking")}
        />
      )}
      {!hasEmail && (
        <TherapistEditLink
          target={EDIT.email}
          label={t("subprofiles:therapist.side.add.email")}
        />
      )}
      {!hasWebsite && (
        <TherapistEditLink
          target={EDIT.website}
          label={t("subprofiles:therapist.side.add.website")}
        />
      )}
    </div>
  );
}

/**
 * "Getting in touch": the sidebar's contact card. Message goes through the
 * same `IdentityContactButton` as the persona hero. Only `public` gets live
 * buttons: `visitor` (the owner reading their own page), `owner` and
 * `preview` render inert look-alikes, like the hero does. The owner also gets
 * an Edit link beside the title and each button, plus "Add …" links for the
 * buttons still missing. The crisis link stays navigable everywhere except
 * the editor preview.
 */
export function TherapistContactCard({
  data,
  view,
  mode,
  onAction,
}: TherapistContactCardProps) {
  const { t } = useTranslation();
  const headingId = useId();
  const name = view.firstName || data.displayName;
  const ctaHref = safeHref(data.ctaUrl);
  const { title, body, titleEdit, titleEditAria } = useContactCopy(
    view,
    name,
    ctaHref !== null,
  );

  const isInteractive = mode !== "preview";
  const isLive = mode === "public";
  const isOwner = mode === "owner";
  const isMessageable = data.status === "published";
  const mailHref = emailHref(view.email);
  const siteHref = websiteHref(view.website);
  const siteLabel = websiteLabel(view.website);
  const messageLabel = t("subprofiles:therapist.side.contact.message", {
    name,
  });
  const ctaLabel =
    data.ctaLabel.trim() || t("subprofiles:therapist.side.contact.introCall");

  return (
    <section
      id={CONTACT_ID}
      className={styles.card}
      aria-labelledby={headingId}
    >
      <h2 id={headingId} className={styles.label}>
        {t("subprofiles:therapist.side.contact.label")}
      </h2>
      <div className={styles.titleRow}>
        <p className={styles.title}>{title}</p>
        <TherapistEditLink target={titleEdit} ariaLabel={titleEditAria} />
      </div>
      <p className={styles.body}>{body}</p>

      <div className={styles.buttons}>
        {isMessageable &&
          (isLive ? (
            <div className={styles.messageSlot}>
              <IdentityContactButton
                target={{ kind: "persona", subprofileId: data.id }}
                name={data.displayName}
                buttonVariant="primary"
                label={messageLabel}
                onOpen={() => onAction("message")}
              />
            </div>
          ) : (
            <Button variant="primary" className={styles.fullButton} disabled>
              <FiMessageCircle aria-hidden /> {messageLabel}
            </Button>
          ))}

        {ctaHref && (
          <SideButton
            isLive={isLive}
            href={ctaHref}
            isExternal
            icon={<FiCalendar aria-hidden />}
            label={ctaLabel}
            onClick={() => onAction("cta")}
            editTarget={isOwner ? EDIT.ctaLabel : undefined}
          />
        )}
        {mailHref && (
          <SideButton
            isLive={isLive}
            href={mailHref}
            icon={<FiMail aria-hidden />}
            label={view.email}
            ariaLabel={t("subprofiles:therapist.side.contact.emailAria", {
              name,
              email: view.email,
            })}
            editTarget={isOwner ? EDIT.email : undefined}
            editAriaLabel={t("subprofiles:therapist.side.edit.email")}
          />
        )}
        {siteHref && (
          <SideButton
            isLive={isLive}
            href={siteHref}
            isExternal
            icon={<FiLink aria-hidden />}
            label={siteLabel}
            ariaLabel={t("subprofiles:therapist.side.contact.websiteAria", {
              name,
              website: siteLabel,
            })}
            editTarget={isOwner ? EDIT.website : undefined}
            editAriaLabel={t("subprofiles:therapist.side.edit.website")}
          />
        )}
      </div>

      {isOwner && (
        <MissingContactLinks
          hasCall={ctaHref !== null}
          hasEmail={mailHref !== null}
          hasWebsite={siteHref !== null}
        />
      )}

      <p className={styles.quiet}>
        <Translation
          i18nKey="subprofiles:therapist.side.contact.crisis"
          components={{
            a: isInteractive ? (
              <Link to={routes.mentalHealth} />
            ) : (
              <span className={styles.inertLink} />
            ),
          }}
        />
      </p>
    </section>
  );
}
