import { useRef, type Ref } from "react";
import { FiRss } from "react-icons/fi";
import {
  Button,
  FormField,
  Sending,
  SuccessPanel,
} from "../../../shared/components/ui";
import type { TFunction } from "../../../shared/i18n/types";
import { useFocusOnMount } from "../../../shared/hooks/useFocusOnMount";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { SubprofileView } from "../api/subprofiles.adapters";
import { FEED_ERROR_TOKENS } from "../api/feedImportErrors";
import { MAX_FEEDS_PER_PERSONA } from "../api/subprofileFeeds.api";
import { FeedConnectOptions } from "./FeedConnectOptions";
import { FeedPreviewCard } from "./FeedPreviewCard";
import { useFeedConnect, type ConnectedFeed } from "./useFeedConnect";
import styles from "./FeedConnect.module.css";

/** The success panel's body: what happens next, given the choices made. */
function connectedBody(connected: ConnectedFeed, t: TFunction): string {
  const { autoPublish, backfill } = connected.choices;
  if (backfill === "all") {
    // Existing episodes always wait for review, auto-publish or not.
    return t(
      autoPublish
        ? "subprofiles:feedImport.success.bodyAllAuto"
        : "subprofiles:feedImport.success.bodyAll",
      { count: connected.episodeCount },
    );
  }
  return t(
    autoPublish
      ? "subprofiles:feedImport.success.bodyAutoPublish"
      : "subprofiles:feedImport.success.bodyNone",
  );
}

/** The plum success panel, with focus moved onto it: the Connect button that
 *  had focus is gone, and the result is what the member needs to hear next. */
function ConnectedPanel({
  connected,
  onClose,
}: {
  connected: ConnectedFeed;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const groupRef = useFocusOnMount<HTMLDivElement>();
  return (
    <div
      ref={groupRef}
      tabIndex={-1}
      role="group"
      aria-label={`${t("subprofiles:feedImport.success.title")} ${t("subprofiles:feedImport.success.em")}`}
      className={styles.connected}
    >
      <SuccessPanel
        title={t("subprofiles:feedImport.success.title")}
        em={t("subprofiles:feedImport.success.em")}
        closeLabel={t("subprofiles:feedImport.success.done")}
        onClose={onClose}
      >
        {connectedBody(connected, t)}
      </SuccessPanel>
    </div>
  );
}

/**
 * Connect a podcast feed: paste its address, look it up, see what it holds,
 * choose where the episodes go and what comes in, then connect. Success is the
 * plum panel; "Review episodes" hands focus on to the new feed's card (the
 * pane's `onDone`), so a keyboard user is not left at the top of the page.
 */
export function FeedConnectFlow({
  subprofile,
  hasFeeds,
  feedCount,
  headingRef,
  onDone,
}: {
  subprofile: SubprofileView;
  hasFeeds: boolean;
  feedCount: number;
  /** The section heading, so the pane can hand focus to it (after a disconnect). */
  headingRef?: Ref<HTMLHeadingElement>;
  onDone: (feedId: string) => void;
}) {
  const { t } = useTranslation();
  const flow = useFeedConnect(subprofile);
  const urlRef = useRef<HTMLInputElement>(null);

  if (flow.connected) {
    const { connected } = flow;
    return (
      <ConnectedPanel
        connected={connected}
        onClose={() => {
          flow.finish();
          onDone(connected.feed.id);
        }}
      />
    );
  }

  if (feedCount >= MAX_FEEDS_PER_PERSONA) {
    return (
      <p className={styles.limitNote}>
        {t("subprofiles:feedImport.connect.atLimit", {
          max: MAX_FEEDS_PER_PERSONA,
        })}
      </p>
    );
  }

  const { previewed } = flow;
  const urlError = flow.isUrlInvalid
    ? t("subprofiles:feedImport.connect.urlInvalid")
    : undefined;

  return (
    <section
      className={styles.flow}
      aria-labelledby="feed-connect-heading"
      aria-busy={flow.isLookingUp || flow.isConnecting}
    >
      <h3
        id="feed-connect-heading"
        ref={headingRef}
        tabIndex={-1}
        className={styles.heading}
      >
        <FiRss aria-hidden />{" "}
        {hasFeeds
          ? t("subprofiles:feedImport.connect.headingAnother")
          : t("subprofiles:feedImport.connect.heading")}
      </h3>
      {!hasFeeds && (
        <p className={styles.intro}>
          {t("subprofiles:feedImport.connect.intro")}
        </p>
      )}

      <form
        className={styles.lookup}
        onSubmit={(event) => {
          event.preventDefault();
          flow.lookUp();
        }}
        noValidate
      >
        <FormField
          label={t("subprofiles:feedImport.connect.urlLabel")}
          helper={t("subprofiles:feedImport.connect.urlHelper")}
          error={urlError}
        >
          <input
            ref={urlRef}
            type="url"
            inputMode="url"
            autoComplete="off"
            spellCheck={false}
            value={flow.url}
            placeholder={t("subprofiles:feedImport.connect.urlPlaceholder")}
            onChange={(event) => flow.setUrl(event.target.value)}
          />
        </FormField>
        {!previewed && (
          <Button
            type="submit"
            variant="primary"
            disabled={flow.isLookingUp || flow.url.trim() === ""}
          >
            {flow.isLookingUp ? (
              <Sending label={t("subprofiles:feedImport.connect.lookingUp")} />
            ) : (
              t("subprofiles:feedImport.connect.lookUp")
            )}
          </Button>
        )}
      </form>

      {flow.errorKey && (
        <p className={styles.error} role="alert">
          {t(flow.errorKey, FEED_ERROR_TOKENS)}
        </p>
      )}

      {previewed && (
        <>
          <FeedPreviewCard preview={previewed} />
          <FeedConnectOptions
            sections={flow.sections}
            episodeCount={previewed.episodeCount}
            choices={flow.choices}
            onChange={flow.setChoices}
          />
          <div className={styles.actions}>
            <Button
              variant="primary"
              onClick={flow.connectFeed}
              disabled={flow.isConnecting || previewed.alreadyConnected}
            >
              {flow.isConnecting ? (
                <Sending
                  label={t("subprofiles:feedImport.connect.connecting")}
                />
              ) : (
                t("subprofiles:feedImport.connect.submit")
              )}
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                flow.changeFeed();
                // The lookup goes away with this button; the address is what
                // the member wants next.
                urlRef.current?.focus();
              }}
            >
              {t("subprofiles:feedImport.connect.changeFeed")}
            </Button>
          </div>
        </>
      )}
    </section>
  );
}
