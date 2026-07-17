import { useMemo, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { FiCheckCircle, FiDollarSign, FiLock } from "react-icons/fi";
import { ImageSlot } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Translation } from "../../shared/i18n/Translation";
import { StudioShell } from "./StudioShell";
import { StudioTakedownModal } from "./StudioTakedownModal";
import { PROMISES, RELEASES, type Release } from "./studioRights.data";
import s from "./StudioRightsPage.module.css";

const PROMISE_ICONS: Record<string, ReactNode> = {
  window: <FiCheckCircle aria-hidden />,
  paid: <FiDollarSign aria-hidden />,
  banking: <FiLock aria-hidden />,
};

export function StudioRightsPage() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [releases, setReleases] = useState<Release[]>(RELEASES);
  const [pending, setPending] = useState<Release | null>(null);

  const { liveCount, removingCount } = useMemo(
    () => ({
      liveCount: releases.filter((r) => r.state === "live").length,
      removingCount: releases.filter((r) => r.state === "removing").length,
    }),
    [releases],
  );

  function confirmTakedown() {
    if (!pending) return;
    const { id, title } = pending;
    setReleases((rs) =>
      rs.map((r) =>
        r.id === id ? { ...r, state: "removing", daysLeft: 14 } : r,
      ),
    );
    setPending(null);
    showToast(t("studio:rights.takedownStartedToast", { title }), "info");
  }

  function cancelRemoval(rel: Release) {
    setReleases((rs) =>
      rs.map((r) =>
        r.id === rel.id ? { ...r, state: "live", daysLeft: undefined } : r,
      ),
    );
    showToast(t("studio:rights.removalCancelledToast"), "success");
  }

  return (
    <StudioShell>
      <div className={s.wrap}>
        <div className={s.pageH}>
          <div className={s.eb}>{t("studio:rights.hero.eyebrow")}</div>
          <h1>
            <Translation
              i18nKey="studio:rights.hero.title"
              components={{ em: <em /> }}
            />
          </h1>
          <div className={s.dek}>{t("studio:rights.hero.dek")}</div>
        </div>

        <div className={s.promise}>
          {PROMISES.map((p) => (
            <div key={p.key} className={s.p}>
              <span className={s.pIcon}>{PROMISE_ICONS[p.key]}</span>
              <h4>{t(p.titleKey)}</h4>
              <p>{t(p.bodyKey)}</p>
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

        {releases.map((rel) => {
          const removing = rel.state === "removing";
          return (
            <div
              key={rel.id}
              className={[s.relRow, removing && s.removing]
                .filter(Boolean)
                .join(" ")}
            >
              <div className={s.cover}>
                <ImageSlot
                  src={rel.cover}
                  tint={rel.tint}
                  width={56}
                  height={56}
                  radius={9}
                  placeholder=""
                />
              </div>
              <div className={s.ri}>
                <h5>
                  {rel.titlePre}
                  {rel.titleEm && <em>{rel.titleEm}</em>}
                  {rel.titlePost}
                </h5>
                <div className={s.rm}>{rel.meta}</div>
              </div>

              {removing ? (
                <>
                  <div className={s.rtStatus}>
                    <span className={s.d} aria-hidden />
                    {t("studio:rights.removingStatus", {
                      count: rel.daysLeft ?? 0,
                    })}
                  </div>
                  <button
                    type="button"
                    className={s.btUndo}
                    onClick={() => cancelRemoval(rel)}
                  >
                    {t("studio:rights.cancelRemovalCta")}
                  </button>
                </>
              ) : (
                <>
                  {rel.licence && (
                    <div className={s.lic}>
                      {rel.licence.top}
                      <span>{rel.licence.sub}</span>
                    </div>
                  )}
                  <button
                    type="button"
                    className={s.btTake}
                    onClick={() => setPending(rel)}
                  >
                    {t("studio:rights.takeDownCta")}
                  </button>
                </>
              )}
            </div>
          );
        })}

        <div className={s.foot}>
          <h4>
            <Translation
              i18nKey="studio:rights.leavingCoop.title"
              components={{ em: <em /> }}
            />
          </h4>
          <p>
            <Translation
              i18nKey="studio:rights.leavingCoop.body"
              components={{ em: <em />, a: <Link to="/studio/settings" /> }}
            />
          </p>
        </div>
      </div>

      {pending && (
        <StudioTakedownModal
          title={pending.title}
          meta={pending.meta}
          onConfirm={confirmTakedown}
          onClose={() => setPending(null)}
        />
      )}
    </StudioShell>
  );
}
