import { useMemo, useState } from "react";
import { Button, Outro } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { routes } from "../../app/routeMap";
import { CinemaShell } from "./CinemaShell";
import { CinemaShortsHeader } from "./CinemaShortsHeader";
import { AccessNote, CuratorNote, Spotlight } from "./CinemaShortsIntro";
import {
  ContinueWatching,
  MeetTheMakers,
  Programmes,
} from "./CinemaShortsShelves";
import { CuratedShelves, CuratedTail } from "./CinemaShortsCurated";
import { CinemaShortsCatalog } from "./CinemaShortsCatalog";
import {
  CommunityVote,
  SubmitCta,
  Transparency,
  WatchParties,
} from "./CinemaShortsCommunity";
import { seededSeen, type ShortsShelf } from "./cinemaShorts.data";
import styles from "./CinemaShortsPage.module.css";

/** Made Here — the community catalogue of member-made queer short films. */
export function CinemaShortsPage() {
  const { showToast } = useToast();
  const [saved, setSaved] = useState<string[]>([]);

  const shelf = useMemo<ShortsShelf>(
    () => ({
      saved,
      seen: seededSeen,
      onToggleSave: (id) =>
        setSaved((prev) => {
          const has = prev.includes(id);
          showToast(
            has ? "Removed from your watchlist" : "Saved to your watchlist",
            "success",
          );
          return has ? prev.filter((x) => x !== id) : [...prev, id];
        }),
      onShare: (label) =>
        showToast(`Link copied — share “${label}”`, "success"),
      notify: (message) => showToast(message, "success"),
    }),
    [saved, showToast],
  );

  return (
    <CinemaShell>
      <CinemaShortsHeader />

      <section className={styles.body}>
        <div className="wrap">
          <CuratorNote />
          <AccessNote />
          <Spotlight shelf={shelf} />

          <ContinueWatching />
          <Programmes shelf={shelf} />
          <CuratedShelves shelf={shelf} />
          <MeetTheMakers />
          <CuratedTail shelf={shelf} />

          <WatchParties notify={shelf.notify} />
          <CommunityVote notify={shelf.notify} />

          <CinemaShortsCatalog shelf={shelf} />

          <Transparency />
          <SubmitCta />
        </div>
      </section>

      <Outro
        title={
          <>
            Tip a <em>filmmaker</em>.
          </>
        }
        sub="100% goes to them. No fees. No minimum. Watch first, then decide."
      >
        <Button size="lg" to={`${routes.cinemaBrowse}?f=made-here`}>
          Browse all community films
        </Button>
      </Outro>
    </CinemaShell>
  );
}
