import { useRef } from "react";
import {
  FiAlertCircle,
  FiCheckCircle,
  FiExternalLink,
  FiSend,
} from "react-icons/fi";
import { Button, Collapse, SkeletonLine } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useStudioAccess } from "../studio/api/useStudioAccess";
import {
  useFocusOnArrival,
  useStudioLandingAccessActions,
} from "../studio/landing/useStudioLandingAccessActions";
import { studioUploadPath } from "../studio/studioPaths";
import { studioReasonCopyKey } from "../studio/studioReason";
import styles from "./StudioSectionPanel.module.css";

/**
 * Above the list of a Studio-backed music chapter (Discography, Mixes): where
 * the owner uploads releases. Releases are uploaded in Studio and then show
 * on the page by themselves, so a member with a Studio grant gets the upload
 * link, and a member without one gets "Not available yet" with the access
 * request (posted as a request to release music) and, once sent, the on-list
 * line. A failed access read names its reason. Each state folds in its own
 * Collapse; the always-mounted status region speaks a sent request, and focus
 * moves to the on-list line once it has mounted, since the button pressed
 * folded away. Hand-added items the section already holds stay in the list
 * below.
 */
export function StudioSectionPanel() {
  const { t } = useTranslation();
  const access = useStudioAccess();
  const actions = useStudioLandingAccessActions();
  const onListRef = useRef<HTMLParagraphElement>(null);
  useFocusOnArrival(actions, "onList", actions.isOnList, onListRef);

  const hasNoAccess =
    !access.isPending && !access.hasAccess && !access.isReadFailed;
  const isChecking = access.isPending || (hasNoAccess && actions.isChecking);
  const readFailureLine = access.isReadFailed
    ? `${t("studio:accessError.title")}. ${t(
        studioReasonCopyKey(access.reason ?? "unknown", "load"),
      )}`
    : "";

  return (
    <div className={styles.panel}>
      <Collapse isOpen={isChecking}>
        <div className={styles.checking}>
          <SkeletonLine width={36} height={10} />
          <span>{t("studio:landing.cta.checking")}</span>
        </div>
      </Collapse>
      <Collapse isOpen={access.isReadFailed}>
        <p role="alert" className={styles.failure}>
          <FiAlertCircle size={15} aria-hidden />
          {readFailureLine}
        </p>
      </Collapse>
      <Collapse isOpen={access.hasAccess}>
        <div className={styles.block}>
          <h5 className={styles.title}>
            {t("subprofiles:studioSection.upload.title")}
          </h5>
          <p className={styles.body}>
            {t("subprofiles:studioSection.upload.body")}
          </p>
          <Button
            variant="primary"
            to={studioUploadPath()}
            target="_blank"
            rel="noopener noreferrer"
          >
            {t("subprofiles:studioSection.upload.cta")}
            <FiExternalLink aria-hidden />
          </Button>
        </div>
      </Collapse>
      <Collapse isOpen={hasNoAccess && !actions.isChecking}>
        <div className={styles.block}>
          <h5 className={styles.title}>
            {t("subprofiles:studioSection.noAccess.title")}
          </h5>
          <p className={styles.body}>
            {t("subprofiles:studioSection.noAccess.body")}
          </p>
          <Collapse isOpen={actions.hasNoRequest}>
            <div className={styles.actions}>
              <Button
                variant="primary"
                onClick={() => actions.sendRequest(true)}
                aria-busy={actions.isRequestPending || undefined}
              >
                {t("studio:landing.cta.requestAccess")}
                <FiSend aria-hidden />
              </Button>
              <Collapse isOpen={actions.requestFailure !== null}>
                <p role="alert" className={styles.failure}>
                  <FiAlertCircle size={15} aria-hidden />
                  {actions.requestFailure}
                </p>
              </Collapse>
            </div>
          </Collapse>
          <Collapse isOpen={actions.isOnList}>
            <p ref={onListRef} tabIndex={-1} className={styles.onListLine}>
              <FiCheckCircle aria-hidden />
              {t("studio:landing.cta.onList.title")}
            </p>
          </Collapse>
        </div>
      </Collapse>
      <p role="status" className="visuallyHidden">
        {actions.announcement}
      </p>
    </div>
  );
}
