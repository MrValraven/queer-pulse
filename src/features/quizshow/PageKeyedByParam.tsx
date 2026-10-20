import type { ComponentType } from "react";
import { useParams } from "react-router-dom";

/**
 * Renders the page keyed by one route param, so moving from one event (or one
 * join code) to another remounts it and no game state carries over.
 */
export function PageKeyedByParam({
  paramName,
  page: Page,
}: {
  paramName: "slug" | "code";
  page: ComponentType;
}) {
  const params = useParams();
  return <Page key={params[paramName] ?? ""} />;
}
