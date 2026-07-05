import { useMemo, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { FiCheckCircle, FiDollarSign, FiLock } from "react-icons/fi";
import { ImageSlot } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
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
    showToast(`"${title}" enters its 14-day removal window`, "info");
  }

  function cancelRemoval(rel: Release) {
    setReleases((rs) =>
      rs.map((r) =>
        r.id === rel.id ? { ...r, state: "live", daysLeft: undefined } : r,
      ),
    );
    showToast("Removal cancelled — release stays up", "success");
  }

  return (
    <StudioShell>
      <div className={s.wrap}>
        <div className={s.pageH}>
          <div className={s.eb}>Your work · your call</div>
          <h1>
            Rights &amp; <em>takedown</em>.
          </h1>
          <div className={s.dek}>
            One page. Your masters are yours — you can take any release off
            Studio at any time, for any reason or none. No retention team, no
            exit survey, no "are you sure" loop designed to wear you down.
          </div>
        </div>

        <div className={s.promise}>
          {PROMISES.map((p) => (
            <div key={p.key} className={s.p}>
              <span className={s.pIcon}>{PROMISE_ICONS[p.key]}</span>
              <h4>{p.title}</h4>
              <p>{p.body}</p>
            </div>
          ))}
        </div>

        <div className={s.secH}>
          <h2>
            Your <em>releases</em>
          </h2>
          <div className={s.sub}>
            {liveCount} live
            {removingCount > 0 && ` · ${removingCount} in a removal window`}
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
                    Removing · {rel.daysLeft} days left
                  </div>
                  <button
                    type="button"
                    className={s.btUndo}
                    onClick={() => cancelRemoval(rel)}
                  >
                    Cancel removal
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
                    Take down
                  </button>
                </>
              )}
            </div>
          );
        })}

        <div className={s.foot}>
          <h4>
            Leaving the co-op <em>entirely</em>?
          </h4>
          <p>
            This page only removes individual releases. To close your artist
            account, end your sustainer membership, and request a full data
            export, that lives in{" "}
            <Link to="/studio/settings">Settings → Erase &amp; exit</Link>.{" "}
            <em>Even then, past payouts are yours to keep</em> and we'll keep
            paying out any plays that already happened.
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
