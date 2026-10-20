import type { ReactNode } from "react";
import {
  FiExternalLink,
  FiInstagram,
  FiMail,
  FiMessageCircle,
} from "react-icons/fi";
import { Button } from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { IdentityContactButton } from "../../../messages/identityContact/IdentityContactButton";
import { TattooBlock } from "./TattooBlock";
import type { TattooBlockProps } from "./tattooView";
import styles from "./TattooInfo.module.css";

/** A link button that goes inert (disabled look-alike) in the editor
 *  preview, where a click must not leave the pane. */
function RouteLink({
  isLive,
  href,
  icon,
  label,
  isExternal,
}: {
  isLive: boolean;
  href: string;
  icon: ReactNode;
  label: string;
  isExternal: boolean;
}) {
  if (!isLive) {
    return (
      <Button type="button" variant="primary" size="md" disabled>
        {icon} {label}
      </Button>
    );
  }
  return (
    <Button
      variant="primary"
      size="md"
      href={href}
      {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {icon} {label}
    </Button>
  );
}

/** The booking block (`#tattoo-booking`): the usable route's action, what
 *  to send, the consultation and the reply time. With no usable route the
 *  last three still show. */
export function TattooBooking({ data, view, mode }: TattooBlockProps) {
  const { t } = useTranslation();
  const { booking } = view;
  const isLive = mode !== "preview";
  const route = booking.usableRoute;
  return (
    <TattooBlock
      blockKey="booking"
      heading={t("subprofiles:tattoo.block.booking.heading")}
      hasContent={view.hasContent.booking}
      emptyBodyKey="subprofiles:tattoo.block.booking.empty"
      emptyActionKey="subprofiles:tattoo.block.booking.action"
    >
      <div className={styles.stack}>
        {route && (
          <div className={styles.actions}>
            {route === "message" &&
              (mode === "public" ? (
                <IdentityContactButton
                  target={{ kind: "persona", subprofileId: data.id }}
                  name={data.displayName}
                  buttonVariant="primary"
                />
              ) : (
                <Button type="button" variant="primary" size="md" disabled>
                  <FiMessageCircle aria-hidden />{" "}
                  {t("subprofiles:tattoo.route.message")}
                </Button>
              ))}
            {route === "email" && (
              <RouteLink
                isLive={isLive}
                href={`mailto:${booking.email}`}
                icon={<FiMail aria-hidden />}
                label={t("subprofiles:tattoo.booking.email")}
                isExternal={false}
              />
            )}
            {route === "form_link" && (
              <RouteLink
                isLive={isLive}
                href={booking.formUrl}
                icon={<FiExternalLink aria-hidden />}
                label={t("subprofiles:tattoo.booking.form")}
                isExternal
              />
            )}
            {route === "instagram" && booking.instagramHref && (
              <RouteLink
                isLive={isLive}
                href={booking.instagramHref}
                icon={<FiInstagram aria-hidden />}
                label={t("subprofiles:tattoo.booking.instagram")}
                isExternal
              />
            )}
          </div>
        )}
        {booking.whatToSend.length > 0 && (
          <div className={styles.group}>
            <h3 className={styles.subheading}>
              {t("subprofiles:tattoo.booking.whatToSend")}
            </h3>
            <ul className={styles.chips}>
              {booking.whatToSend.map((entry) => (
                <li key={entry} className={styles.pill}>
                  {t(`subprofiles:tattoo.whatToSend.${entry}`)}
                </li>
              ))}
            </ul>
          </div>
        )}
        {booking.consultation && (
          <p className={styles.line}>
            {t(`subprofiles:tattoo.consultation.${booking.consultation}`)}
          </p>
        )}
        {booking.replyTime !== "" && (
          <p className={styles.line}>
            {t("subprofiles:tattoo.booking.replyTime", {
              time: booking.replyTime,
            })}
          </p>
        )}
      </div>
    </TattooBlock>
  );
}
