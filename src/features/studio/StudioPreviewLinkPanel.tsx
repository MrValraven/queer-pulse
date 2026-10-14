import { useEffect, useId, useRef, useState, type RefObject } from "react";
import { AnimatePresence } from "motion/react";
import { FiLink2, FiLock, FiSlash } from "react-icons/fi";
import {
  Button,
  Collapse,
  ConfirmDialog,
  CopyLinkRow,
} from "../../shared/components/ui";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { formatRelative } from "../../shared/lib/date";
import type { StudioReleaseView } from "./api/studio.adapters";
import {
  useMintStudioPreviewLink,
  useRevokeStudioPreviewLink,
} from "./api/useStudioArtistToolsMutations";
import { studioErrorMessageKeyOf } from "./studioErrors.data";
import { studioPreviewUrl } from "./studioPaths";
import styles from "./StudioPreviewLink.module.css";

/** Owners of a draft or scheduled release only. */
export function canShowPreviewLink(release: StudioReleaseView): boolean {
  return (
    release.isOwner &&
    (release.status === "draft" || release.status === "scheduled")
  );
}

/** The control that takes focus once the panel has swapped states. */
type FocusTarget = "make" | "copy";

/** The link itself, its age, and the two ways to change it. */
function PreviewLinkLive({
  token,
  createdAt,
  isWorking,
  linkBlockRef,
  onMakeNew,
  onTurnOff,
}: {
  token: string | null;
  createdAt: string | null;
  isWorking: boolean;
  linkBlockRef: RefObject<HTMLDivElement | null>;
  onMakeNew: () => void;
  onTurnOff: () => void;
}) {
  const { t } = useTranslation();
  const formatters = useFormat();
  return (
    <div ref={linkBlockRef} className={styles.live}>
      <p className={styles.body}>{t("studio:previewLink.onBody")}</p>
      <CopyLinkRow
        value={token ? studioPreviewUrl(token) : ""}
        tone="paper"
        className={styles.copyRow}
        fieldLabel={t("studio:previewLink.fieldLabel")}
        copyLabel={t("studio:previewLink.copyCta")}
        copiedLabel={t("studio:previewLink.copied")}
        copiedToast={t("studio:previewLink.copiedToast")}
        errorToast={t("studio:previewLink.copyFailedToast")}
      />
      {createdAt && (
        <p className={styles.made}>
          {t("studio:previewLink.made", {
            time: formatRelative(createdAt, formatters),
          })}
        </p>
      )}
      <div className={styles.actions}>
        <Button
          variant="ghost"
          aria-disabled={isWorking || undefined}
          onClick={onMakeNew}
        >
          <FiLink2 aria-hidden /> {t("studio:previewLink.newCta")}
        </Button>
        <Button
          variant="ghost"
          aria-disabled={isWorking || undefined}
          onClick={onTurnOff}
        >
          <FiSlash aria-hidden /> {t("studio:previewLink.turnOffCta")}
        </Button>
      </div>
    </div>
  );
}

/**
 * A private link to a draft or scheduled release, modelled on the saved list
 * share controls. The off state says what a link means before one exists.
 * The on state is the link, its age, "Make new link" (asks first, since the
 * old link stops working) and "Turn off link" (one press: taking a link back
 * has to be instant, and a new one is always one press away). Nothing here
 * counts how often a link is opened.
 */
export function StudioPreviewLinkPanel({
  release,
  isHeadingHidden = false,
}: {
  release: StudioReleaseView;
  /** The dialog already titles the panel: the heading stays for screen readers. */
  isHeadingHidden?: boolean;
}) {
  const { t } = useTranslation();
  const headingId = useId();
  const mint = useMintStudioPreviewLink();
  const revoke = useRevokeStudioPreviewLink();
  const makeButtonRef = useRef<HTMLButtonElement>(null);
  const linkBlockRef = useRef<HTMLDivElement>(null);
  // Set before the request starts: the cache patch can re-render the panel
  // before the awaited call returns.
  const pendingFocusRef = useRef<FocusTarget | null>(null);
  const [isConfirmingNew, setIsConfirmingNew] = useState(false);
  const [statusKey, setStatusKey] = useState<string | null>(null);
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const token = release.previewToken;
  const hasLink = token !== null;
  const isWorking = mint.isPending || revoke.isPending;

  // Focus follows to the control that replaced the pressed one.
  useEffect(() => {
    const target = pendingFocusRef.current;
    if (target === "make" && !hasLink) {
      pendingFocusRef.current = null;
      makeButtonRef.current?.focus();
    } else if (target === "copy" && hasLink) {
      pendingFocusRef.current = null;
      linkBlockRef.current?.querySelector("button")?.focus();
    }
  }, [hasLink]);

  if (!canShowPreviewLink(release)) return null;

  async function makeLink(
    statusOnSuccess: string,
    focusTarget: FocusTarget | null,
  ) {
    if (isWorking) return;
    setErrorKey(null);
    pendingFocusRef.current = focusTarget;
    try {
      await mint.mutateAsync({ releaseId: release.id });
      setStatusKey(statusOnSuccess);
    } catch (error) {
      pendingFocusRef.current = null;
      setErrorKey(studioErrorMessageKeyOf(error));
    } finally {
      setIsConfirmingNew(false);
    }
  }

  async function turnOff() {
    if (isWorking) return;
    setErrorKey(null);
    pendingFocusRef.current = "make";
    try {
      await revoke.mutateAsync({ releaseId: release.id });
      setStatusKey("studio:previewLink.turnedOffStatus");
    } catch (error) {
      pendingFocusRef.current = null;
      setErrorKey(studioErrorMessageKeyOf(error));
    }
  }

  return (
    <section className={styles.panel} aria-labelledby={headingId}>
      <h4
        id={headingId}
        className={
          isHeadingHidden
            ? `${styles.heading} ${styles.headingHidden}`
            : styles.heading
        }
      >
        {hasLink ? <FiLink2 aria-hidden /> : <FiLock aria-hidden />}
        {t("studio:previewLink.heading")}
      </h4>
      <Collapse isOpen={!hasLink}>
        <p className={styles.body}>{t("studio:previewLink.offBody")}</p>
        <Button
          ref={makeButtonRef}
          variant="ghost"
          aria-disabled={isWorking || undefined}
          onClick={() => void makeLink("studio:previewLink.madeStatus", "copy")}
        >
          <FiLink2 aria-hidden /> {t("studio:previewLink.makeCta")}
        </Button>
      </Collapse>
      <Collapse isOpen={hasLink}>
        <PreviewLinkLive
          token={token}
          createdAt={release.previewLinkCreatedAt}
          isWorking={isWorking}
          linkBlockRef={linkBlockRef}
          onMakeNew={() => {
            if (!isWorking) setIsConfirmingNew(true);
          }}
          onTurnOff={() => void turnOff()}
        />
      </Collapse>
      <p role="status" className={styles.status}>
        {statusKey ? t(statusKey) : ""}
      </p>
      <p role="alert" className={styles.error}>
        {errorKey ? t(errorKey) : ""}
      </p>
      <AnimatePresence>
        {isConfirmingNew && (
          <ConfirmDialog
            open
            onClose={() => setIsConfirmingNew(false)}
            onConfirm={() =>
              void makeLink("studio:previewLink.replacedStatus", null)
            }
            loading={mint.isPending}
            title={t("studio:previewLink.newTitle")}
            description={t("studio:previewLink.newBody")}
            confirmLabel={t("studio:previewLink.newCta")}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
