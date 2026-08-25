import { useMemo } from "react";
import { resolveAvatarSrc } from "../../shared/lib/avatarUrl";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { CardVerdictBanner } from "./CardVerdictBanner";
import { STATUS_ICON } from "./cardVerify.data";
import type { CardVerificationDTO } from "./api/cards.api";
import styles from "./CardVerifyPage.module.css";

/**
 * A code that resolved to a card, whatever that card's standing.
 *
 * Reads top to bottom the way the check itself runs: the verdict, then who the
 * card belongs to, then the card's own details, then the face to compare
 * against the person holding it.
 */
export function CardVerifyResult({
  verification,
}: {
  verification: CardVerificationDTO;
}) {
  const { t } = useTranslation();
  const format = useFormat();
  const isGood = verification.status === "active";

  // The wall-clock moment of THIS check, stamped once per mount. A screenshot
  // of this page carries the time it was taken, which is the whole point.
  const checkedAt = useMemo(() => format.time(new Date()), [format]);

  const photoSrc = resolveAvatarSrc(
    verification.holderPhotoUrl ?? undefined,
    480,
  );

  return (
    <>
      <CardVerdictBanner
        icon={STATUS_ICON[verification.status]}
        title={t(`cards:verify.status.${verification.status}`)}
        lead={t(`cards:verify.lead.${verification.status}`)}
      />
      <div className={styles.body}>
        {/* The name owns its line. Pronouns follow on their own, below: they
            qualify the name rather than continuing it, and a verifier reading
            aloud needs to find them without picking them out of a bracket. */}
        <p className={styles.holder}>{verification.holderName}</p>
        {verification.holderPronouns ? (
          <p className={styles.holderPronouns}>{verification.holderPronouns}</p>
        ) : null}
        <p className={styles.issuer}>
          <span>{verification.issuerName}</span>
        </p>

        <dl className={styles.meta}>
          <div>
            <dt>{t("cards:verify.role")}</dt>
            <dd>{t(`cards:role.${verification.role}`)}</dd>
          </div>
          <div>
            <dt>{t("cards:verify.serial")}</dt>
            <dd>{verification.serial}</dd>
          </div>
          <div>
            <dt>{t("cards:verify.memberSince")}</dt>
            <dd>{new Date(verification.memberSince).getFullYear()}</dd>
          </div>
        </dl>

        {/* Only for a card that is currently good. Handing a door the face off
            a revoked card is an instruction with no decision behind it, and the
            backend withholds the URL for exactly that reason. */}
        {isGood && photoSrc ? (
          <figure className={styles.face}>
            <span className={styles.faceLabel}>
              {t("cards:verify.face.label")}
            </span>
            <img
              className={[
                styles.facePhoto,
                verification.photoStyle === "mono" ? styles.facePhotoMono : "",
              ]
                .filter(Boolean)
                .join(" ")}
              src={photoSrc}
              /* Empty on purpose: the holder's name is printed directly above,
                 so announcing the photo would repeat what the page already
                 says. `referrerPolicy` for the Google-hosted case, which 403s
                 the image when a referrer is sent. */
              alt=""
              referrerPolicy="no-referrer"
              width={172}
              height={229}
            />
            <figcaption className={styles.faceCaption}>
              {t("cards:verify.face.caption")}
            </figcaption>
          </figure>
        ) : isGood ? (
          /* Either the card carries no face at all, or it carries one this page
             could not resolve to a fetchable URL. Both leave the verifier in
             the same position, so both get the instruction rather than an
             empty slot where a portrait should be. */
          <p className={styles.check}>
            {verification.hasPhoto
              ? t("cards:verify.checkPhoto")
              : t("cards:verify.checkNoPhoto")}
          </p>
        ) : null}

        <p className={styles.stamp}>
          {t("cards:verify.stamp", { time: checkedAt })}
          <span className={styles.stampNote}>
            {t("cards:verify.stampNote")}
          </span>
        </p>
      </div>
    </>
  );
}
