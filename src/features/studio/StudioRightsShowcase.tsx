import { useMemo, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { FiCheckCircle, FiDollarSign, FiLock } from "react-icons/fi";
import { routes } from "../../app/routeMap";
import { ImageSlot } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useFormat } from "../../shared/i18n/format";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { StudioTakedownModal } from "./StudioTakedownModal";
import {
  PROMISES,
  RELEASES,
  formatReleaseMeta,
  type Release,
} from "./studioRights.data";
import s from "./StudioRightsPage.module.css";

const PROMISE_ICONS: Record<string, ReactNode> = {
  window: <FiCheckCircle aria-hidden />,
  paid: <FiDollarSign aria-hidden />,
  banking: <FiLock aria-hidden />,
};

/** Demo only: the co-op's promises, the mock release table with its
 *  14-day takedown flow, and the note about leaving the co-op. */
export function StudioRightsShowcase() {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { showToast } = useToast();
  const [releases, setReleases] = useState<Release[]>(RELEASES);
  const [pending, setPending] = useState<Release | null>(null);

  const { liveCount, removingCount } = useMemo(
    () => ({
      liveCount: releases.filter((release) => release.state === "live").length,
      removingCount: releases.filter((release) => release.state === "removing")
        .length,
    }),
    [releases],
  );

  function confirmTakedown() {
    if (!pending) return;
    const { id, title } = pending;
    setReleases((current) =>
      current.map((release) =>
        release.id === id
          ? { ...release, state: "removing", daysLeft: 14 }
          : release,
      ),
    );
    setPending(null);
    showToast(t("studio:rights.takedownStartedToast", { title }), "info");
  }

  function cancelRemoval(cancelled: Release) {
    setReleases((current) =>
      current.map((release) =>
        release.id === cancelled.id
          ? { ...release, state: "live", daysLeft: undefined }
          : release,
      ),
    );
    showToast(t("studio:rights.removalCancelledToast"), "success");
  }

  return (
    <>
      <div className={s.promise}>
        {PROMISES.map((promise) => (
          <div key={promise.key} className={s.p}>
            <span className={s.pIcon}>{PROMISE_ICONS[promise.key]}</span>
            <h3>{t(promise.titleKey)}</h3>
            <p>{t(promise.bodyKey)}</p>
          </div>
        ))}
      </div>

      <div className={s.secH}>
        <h2>
          <Translation
            i18nKey="studio:rights.releases.heading"
            components={{ em: <em /> }}
          />
        </h2>
        <div className={s.sub}>
          {t("studio:rights.releases.liveCount", { count: liveCount })}
          {removingCount > 0 &&
            ` · ${t("studio:rights.releases.removingCount", { count: removingCount })}`}
        </div>
      </div>

      {releases.map((release) => {
        const isRemoving = release.state === "removing";
        return (
          <div
            key={release.id}
            className={[s.relRow, isRemoving && s.removing]
              .filter(Boolean)
              .join(" ")}
          >
            <div className={s.cover}>
              <ImageSlot
                src={release.cover}
                tint={release.tint}
                width={56}
                height={56}
                radius={9}
                placeholder=""
              />
            </div>
            <div className={s.ri}>
              <h3>
                {release.titlePre}
                {release.titleEm && <em>{release.titleEm}</em>}
                {release.titlePost}
              </h3>
              <div className={s.rm}>
                {formatReleaseMeta(release.meta, t, fmt)}
              </div>
            </div>

            {isRemoving ? (
              <>
                <div className={s.rtStatus}>
                  <span className={s.d} aria-hidden />
                  {t("studio:rights.removingStatus", {
                    count: release.daysLeft ?? 0,
                  })}
                </div>
                <button
                  type="button"
                  className={s.btUndo}
                  onClick={() => cancelRemoval(release)}
                >
                  {t("studio:rights.cancelRemovalCta")}
                </button>
              </>
            ) : (
              <>
                {release.licence && (
                  <div className={s.lic}>
                    {release.licence.topKey
                      ? t(release.licence.topKey)
                      : release.licence.top}
                    <span>{t(release.licence.subKey)}</span>
                  </div>
                )}
                <button
                  type="button"
                  className={s.btTake}
                  onClick={() => setPending(release)}
                >
                  {t("studio:rights.takeDownCta")}
                </button>
              </>
            )}
          </div>
        );
      })}

      <div className={s.foot}>
        <h3>
          <Translation
            i18nKey="studio:rights.leavingCoop.title"
            components={{ em: <em /> }}
          />
        </h3>
        <p>
          <Translation
            i18nKey="studio:rights.leavingCoop.body"
            components={{
              em: <em />,
              a: <Link to={routes.studioSettings} />,
            }}
          />
        </p>
      </div>

      {pending && (
        <StudioTakedownModal
          title={pending.title}
          meta={formatReleaseMeta(pending.meta, t, fmt)}
          onConfirm={confirmTakedown}
          onClose={() => setPending(null)}
        />
      )}
    </>
  );
}
