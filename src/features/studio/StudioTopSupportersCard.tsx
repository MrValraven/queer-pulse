import { AnimatePresence, m, useIsPresent } from "motion/react";
import { useId } from "react";
import { useMotionPrefs } from "../../app/providers/motionPrefs";
import { Collapse, LoadErrorState } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioSupporterIdentityView } from "./api/studioListening.adapters";
import { useStudioTopSupporters } from "./api/useStudioTopSupporters";
import { StudioLoadError } from "./StudioLoadStates";
import { StudioLine } from "./StudioSkeletons";
import { StudioSupporterIdentity } from "./StudioSupporterIdentity";
import { formatStudioCount } from "./studioCount";
import {
  STUDIO_DISCLOSURE,
  STUDIO_DISCLOSURE_EXIT,
  studioStaggerDelay,
} from "./studioMotion";
import { studioReasonCopyKey } from "./studioReason";
import styles from "./StudioTopSupporters.module.css";
import kit from "./studioKit.module.css";

const SKELETON_ROW_COUNT = 3;
const IDENTITY_AVATAR_SIZE = 36;
const TOP_SUPPORTERS_WHAT_KEY = "studio:errors.what.topSupporters";

/** Every account identity shares the key "account", so an account row keys
 *  on its profile link (or its name when it has none). */
function supporterRowKeyOf(identity: StudioSupporterIdentityView): string {
  return identity.kind === "account"
    ? `account:${identity.href ?? identity.name}`
    : identity.key;
}

/** Unique, render-stable keys: a repeated base key gets its occurrence index. */
function rowKeysOf(identities: StudioSupporterIdentityView[]): string[] {
  const seenCounts = new Map<string, number>();
  return identities.map((identity) => {
    const baseKey = supporterRowKeyOf(identity);
    const occurrence = seenCounts.get(baseKey) ?? 0;
    seenCounts.set(baseKey, occurrence + 1);
    return occurrence === 0 ? baseKey : `${baseKey}#${occurrence}`;
  });
}

function StudioTopSupportersSkeleton() {
  return (
    <div className={styles.skeleton} aria-hidden="true">
      {Array.from({ length: SKELETON_ROW_COUNT }, (_, index) => (
        <div key={index} className={styles.skeletonRow}>
          <StudioLine
            width={IDENTITY_AVATAR_SIZE}
            height={IDENTITY_AVATAR_SIZE}
          />
          <StudioLine width="45%" height={14} />
        </div>
      ))}
    </div>
  );
}

/** A persona the member no longer owns reads as not found. A Retry cannot
 *  change that answer, so this panel offers none. */
function StudioTopSupportersNotFound() {
  const { t } = useTranslation();
  return (
    <LoadErrorState
      title={
        <Translation
          i18nKey="studio:errors.load.title"
          components={{ em: <em /> }}
          values={{ what: t(TOP_SUPPORTERS_WHAT_KEY) }}
        />
      }
      description={t(studioReasonCopyKey("notFound", "load"))}
      compact
      className={kit.loadError}
    />
  );
}

/** One ranked supporter, shown as the identity they chose. The ordered list
 *  carries the rank, so the visible number stays out of the reading. */
function StudioTopSupporterRow({
  identity,
  index,
}: {
  identity: StudioSupporterIdentityView;
  index: number;
}) {
  const { reducedMotion } = useMotionPrefs();
  const isPresent = useIsPresent();
  const collapsed = { opacity: 0, height: 0, overflow: "hidden" } as const;
  return (
    <m.li
      className={styles.row}
      inert={!isPresent}
      initial={collapsed}
      animate={{
        opacity: 1,
        height: "auto",
        transition: {
          ...STUDIO_DISCLOSURE,
          duration: reducedMotion ? 0 : STUDIO_DISCLOSURE.duration,
          delay: reducedMotion ? 0 : studioStaggerDelay(index),
        },
        transitionEnd: { overflow: "visible" },
      }}
      exit={{
        ...collapsed,
        transition: {
          ...STUDIO_DISCLOSURE_EXIT,
          duration: reducedMotion ? 0 : STUDIO_DISCLOSURE_EXIT.duration,
        },
      }}
    >
      <div className={styles.rowInner}>
        <span className={styles.rank} aria-hidden="true">
          {index + 1}
        </span>
        <StudioSupporterIdentity
          identity={identity}
          size={IDENTITY_AVATAR_SIZE}
        />
      </div>
    </m.li>
  );
}

/** "Top supporters": the listeners who chose to show themselves on this
 *  persona, ranked by the server on their last 28 days of plays. Each shows
 *  only the identity they chose, linked when it can be; no row carries a
 *  count. The opted-in total reads "Fewer than 5" under the floor. */
export function StudioTopSupportersCard({
  subprofileId,
  personaName,
}: {
  subprofileId: string;
  personaName: string;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { supporters, loadState } = useStudioTopSupporters(subprofileId, true);
  const headingId = useId();
  const identities = supporters?.identities ?? [];
  const rowKeys = rowKeysOf(identities);
  const hasIdentities = identities.length > 0;
  return (
    <section className={styles.card} aria-labelledby={headingId}>
      <h2 id={headingId} className={styles.heading}>
        {t("studio:numbers.supporters.heading")}
      </h2>
      <p className={styles.dek}>{t("studio:numbers.supporters.dek")}</p>
      <Collapse isOpen={loadState.isLoading}>
        <StudioTopSupportersSkeleton />
      </Collapse>
      <Collapse isOpen={loadState.isNotFound}>
        <StudioTopSupportersNotFound />
      </Collapse>
      <Collapse isOpen={loadState.isError}>
        <StudioLoadError loadState={loadState} what={TOP_SUPPORTERS_WHAT_KEY} />
      </Collapse>
      <Collapse isOpen={supporters !== null && !hasIdentities}>
        <p className={styles.empty}>{t("studio:numbers.supporters.empty")}</p>
      </Collapse>
      <Collapse isOpen={hasIdentities}>
        <ol
          className={styles.list}
          aria-label={t("studio:numbers.supporters.listLabel", {
            name: personaName,
          })}
        >
          <AnimatePresence>
            {identities.map((identity, index) => (
              <StudioTopSupporterRow
                key={rowKeys[index]}
                identity={identity}
                index={index}
              />
            ))}
          </AnimatePresence>
        </ol>
      </Collapse>
      <Collapse isOpen={supporters !== null}>
        {supporters && (
          <p className={styles.optedIn}>
            {t("studio:numbers.supporters.optedIn", {
              value: formatStudioCount(supporters.optedInCount, t, fmt),
            })}
          </p>
        )}
      </Collapse>
    </section>
  );
}
