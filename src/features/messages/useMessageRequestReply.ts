import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { routes } from "../../app/routeMap";
import { useConnectionActions } from "../connect/api/useConnectionActions";
import type { ConnectionView } from "../connect/connections.data";

/**
 * PRD-340: state for the Requests tab's inline reply composer
 * (`MessagesInboundRequestCard`, door="reply"). Reply no longer pre-accepts
 * before the member has written anything: they write their OWN reply first,
 * and SENDING it is what accepts the request (reply-implies-accept, the way
 * WhatsApp/Instagram treat a typed reply as consent). Only one card's
 * composer is ever open at a time, keyed by slug like the panel's own
 * `busySlug`, since a slug can only appear once in the inbound list.
 */
export function useMessageRequestReply() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { acceptRequestWithReply } = useConnectionActions();
  const [replyingSlug, setReplyingSlug] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function startReply(slug: string) {
    setReplyingSlug(slug);
    setDraft("");
  }

  function cancelReply() {
    setReplyingSlug(null);
    setDraft("");
  }

  /**
   * Accept-by-reply, then open the materialized thread, matching what plain
   * Accept does (see `MessagesRequestsPanel.handleAccept`). A failed send
   * (its own toast already fired from `useConnectionActions`) leaves the
   * composer open with the draft intact, so the member can just retry.
   */
  async function submitReply(view: ConnectionView) {
    const body = draft.trim();
    if (!body || isSubmitting) return;
    setIsSubmitting(true);
    const didAccept = await acceptRequestWithReply(
      { slug: view.slug, id: view.meta.id },
      body,
    );
    setIsSubmitting(false);
    if (!didAccept) return;
    void queryClient.invalidateQueries({ queryKey: ["conversations"] });
    setReplyingSlug(null);
    setDraft("");
    void navigate(routes.messages, {
      state: { to: { slug: view.slug, name: view.name } },
    });
  }

  return {
    replyingSlug,
    draft,
    setDraft,
    isSubmitting,
    startReply,
    cancelReply,
    submitReply,
  };
}
