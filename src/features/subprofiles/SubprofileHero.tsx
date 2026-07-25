import { useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowUpRight } from "react-icons/fi";
import { HiOutlineQrCode } from "react-icons/hi2";
import { Avatar, Button, Reveal } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { useProfile } from "../../app/providers/ProfileProvider";
import { useAuth } from "../../app/providers/authContext";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useMemberContact } from "../connect/useMemberContact";
import { KIND_LABEL_KEYS } from "./subprofile-kinds";
import { ACCENT_TOKENS, DEFAULT_ACCENT } from "./subprofilePresence.data";
import { SubprofileSocialRow } from "./SubprofileSocialRow";
import { SubprofileAvailability } from "./SubprofileAvailability";
import { SubprofileEndorse } from "./SubprofileEndorse";
import { SubprofileFollow } from "./SubprofileFollow";
import { SubprofileShare } from "./SubprofileShare";
import { SubprofileShareCard } from "./SubprofileShareCard";
import type { PublicSubprofileView } from "./api/subprofiles.adapters";
import styles from "./SubprofileHero.module.css";

/** Up to two initials from a display name, for the avatar fallback. */
function initialsFrom(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
  return (first + last).toUpperCase();
}

/**
 * Rich public persona hero: cover banner, accent-tinted identity, structured
 * social row, availability + contact CTA. The owner tie and the in-app
 * Message button are shown ONLY for linked personas (`canMessage`) — an
 * unlinked, pseudonymous persona never reveals who is behind it (spec §4).
 */
export function SubprofileHero({
  view,
  canMessage,
}: {
  view: PublicSubprofileView;
  canMessage: boolean;
}) {
  const { t } = useTranslation();
  const { contact } = useMemberContact(view.ownerSlug ?? "");
  const { profile } = useProfile();
  const { user } = useAuth();
  const { demoMode } = useDemoMode();
  const [shareCardOpen, setShareCardOpen] = useState(false);

  const accent = view.accent ?? DEFAULT_ACCENT;
  const { tint, on } = ACCENT_TOKENS[accent];
  const hasCta = Boolean(view.ctaLabel && view.ctaUrl);
  const ctaVariant = canMessage ? "ghost" : "primary";

  const linkedToOwner =
    view.linkVisibility === "linked" &&
    Boolean(view.ownerName) &&
    Boolean(view.ownerSlug);

  // Live's `useProfile()` falls back to the demo mock persona when there's no
  // authenticated user (see ProfileProvider), so `profile.slug` is only a
  // trustworthy "who's viewing" signal in demo mode or when live mode actually
  // has a signed-in user — otherwise a logged-out visitor could spuriously
  // match a real persona's owner and see the endorse control disappear.
  const viewerSlug = demoMode || user ? profile.slug : undefined;
  const isOwnerViewing = Boolean(
    linkedToOwner && viewerSlug && viewerSlug === view.ownerSlug,
  );

  const coverStyle = view.coverUrl
    ? { backgroundImage: `url(${view.coverUrl})` }
    : undefined;

  return (
    <>
      <header
        className={styles.hero}
        style={{
          ["--accent-tint" as string]: tint,
          ["--accent-on" as string]: on,
        }}
      >
        <div
          className={`${styles.cover} ${view.coverUrl ? "" : styles.coverGradient}`}
          style={coverStyle}
        />
        <div className="wrap">
          <Reveal className={styles.heroInner}>
            <div className={styles.avatarRing}>
              <Avatar
                initials={initialsFrom(view.displayName)}
                src={view.avatarUrl ?? undefined}
                tint="plum"
                size={104}
              />
            </div>

            <div className={styles.heroText}>
              <span className={styles.kindBadge}>{t(KIND_LABEL_KEYS[view.kind])}</span>
              <h1 className={styles.name}>{view.displayName}</h1>
              {view.tagline && <p className={styles.tagline}>{view.tagline}</p>}

              <SubprofileSocialRow links={view.socialLinks} accent={accent} />

              <div className={styles.actions}>
                <SubprofileAvailability value={view.availability} accent={accent} />
                {canMessage && (
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() =>
                      contact({
                        slug: view.ownerSlug ?? "",
                        name: view.ownerName ?? view.displayName,
                      })
                    }
                  >
                    {t("subprofiles:hero.message")}
                  </Button>
                )}
                {hasCta && (
                  <Button
                    variant={ctaVariant}
                    size="md"
                    href={view.ctaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {view.ctaLabel}
                  </Button>
                )}
                <SubprofileShare view={view} />
                <Button
                  variant="ghost"
                  size="md"
                  onClick={() => setShareCardOpen(true)}
                >
                  <HiOutlineQrCode aria-hidden /> {t("subprofiles:shareCard.cta")}
                </Button>
              </div>

              <div className={styles.socialProofRow}>
                <SubprofileEndorse
                  subprofileId={view.id}
                  endorsementCount={view.endorsementCount}
                  viewerEndorsed={view.viewerEndorsed}
                  isOwnerViewing={isOwnerViewing}
                />
                <SubprofileFollow
                  subprofileId={view.id}
                  followerCount={view.followerCount}
                  viewerFollowing={view.viewerFollowing}
                  isOwnerViewing={isOwnerViewing}
                />
              </div>

              {linkedToOwner && (
                <Link
                  className={styles.ownerTie}
                  to={`${routes.members}/${view.ownerSlug}`}
                >
                  <Translation
                    i18nKey="subprofiles:page.ownerTie"
                    components={{ em: <em /> }}
                    values={{ name: view.ownerName ?? "" }}
                  />
                  <FiArrowUpRight aria-hidden />
                </Link>
              )}

              {view.bio && <p className={styles.bio}>{view.bio}</p>}
            </div>
          </Reveal>
        </div>
      </header>

      {shareCardOpen && (
        <SubprofileShareCard
          view={view}
          onClose={() => setShareCardOpen(false)}
        />
      )}
    </>
  );
}
