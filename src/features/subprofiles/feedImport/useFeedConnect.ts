import { useMemo, useState } from "react";
import type { SubprofileView } from "../api/subprofiles.adapters";
import { feedErrorMessageKey } from "../api/feedImportErrors";
import type { SubprofileFeedDTO } from "../api/subprofileFeeds.api";
import { useSubprofileFeedMutations } from "../api/useSubprofileFeedMutations";
import type { FeedConnectChoices } from "./FeedConnectOptions";
import { defaultFeedSection, feedImportSections } from "./feedImportKinds";

/** Whether a string is an http(s) web address a feed could live at. */
export function isWebAddress(value: string): boolean {
  try {
    const { protocol } = new URL(value);
    return protocol === "http:" || protocol === "https:";
  } catch {
    return false;
  }
}

/** What the success panel needs to say once a feed is connected. */
export interface ConnectedFeed {
  feed: SubprofileFeedDTO;
  choices: FeedConnectChoices;
  episodeCount: number;
}

/**
 * The connect flow's state, kept out of its JSX: the address being typed, the
 * lookup (a POST that reads the feed server-side), the choices to make, and
 * the connect itself. The lookup result lives in the preview mutation, so
 * "use a different feed" is just resetting it.
 */
export function useFeedConnect(subprofile: SubprofileView) {
  const { preview, connect } = useSubprofileFeedMutations();
  const sections = useMemo(
    () => feedImportSections(subprofile.kind),
    [subprofile.kind],
  );
  const initialChoices = (): FeedConnectChoices => ({
    section: defaultFeedSection(subprofile.kind),
    backfill: "all",
    autoPublish: false,
  });

  const [url, setUrlState] = useState("");
  const [isUrlInvalid, setIsUrlInvalid] = useState(false);
  const [choices, setChoices] = useState(initialChoices);
  const [connected, setConnected] = useState<ConnectedFeed | null>(null);

  const previewed = preview.data;

  /** Editing the address drops a lookup that no longer matches it. */
  function setUrl(next: string) {
    setUrlState(next);
    setIsUrlInvalid(false);
    // Also while a lookup is still in flight: its answer is for the old
    // address, and must not arrive as a preview Connect would act on.
    if (preview.data || preview.error || preview.isPending) preview.reset();
    if (connect.error) connect.reset();
  }

  function lookUp() {
    const trimmed = url.trim();
    if (!isWebAddress(trimmed)) {
      setIsUrlInvalid(true);
      return;
    }
    connect.reset();
    preview.mutate({ url: trimmed, subprofileId: subprofile.id });
  }

  function connectFeed() {
    if (!previewed) return;
    const chosen = choices;
    connect.mutate(
      {
        subprofileId: subprofile.id,
        input: {
          url: previewed.feedUrl,
          section: chosen.section,
          autoPublish: chosen.autoPublish,
          backfill: chosen.backfill,
        },
      },
      {
        onSuccess: (feed) =>
          setConnected({
            feed,
            choices: chosen,
            episodeCount: previewed.episodeCount,
          }),
      },
    );
  }

  function changeFeed() {
    preview.reset();
    connect.reset();
  }

  function finish() {
    setConnected(null);
    setUrlState("");
    setChoices(initialChoices());
    preview.reset();
    connect.reset();
  }

  return {
    sections,
    url,
    setUrl,
    isUrlInvalid,
    choices,
    setChoices,
    previewed,
    isLookingUp: preview.isPending,
    isConnecting: connect.isPending,
    errorKey: preview.error
      ? feedErrorMessageKey(preview.error, "preview")
      : connect.error
        ? feedErrorMessageKey(connect.error, "connect")
        : null,
    connected,
    lookUp,
    connectFeed,
    changeFeed,
    finish,
  };
}
