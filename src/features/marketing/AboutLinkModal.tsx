import { ReferenceDigestModal } from "../../shared/components/ui";
import { ABOUT_LINK_TOPICS, type AboutLinkTopicId } from "./aboutLinks.data";

interface AboutLinkModalProps {
  topic: AboutLinkTopicId;
  onClose: () => void;
}

/**
 * The dialog behind every reference link on the About page: a digest of the
 * page that link points at, written for the claim that raised it, closing on a
 * button to the full page. Resolves the topic id and hands it to the shared
 * `ReferenceDigestModal`, which the moderation stance note uses too.
 */
export function AboutLinkModal({ topic, onClose }: AboutLinkModalProps) {
  return (
    <ReferenceDigestModal topic={ABOUT_LINK_TOPICS[topic]} onClose={onClose} />
  );
}
