import { GraphState } from "./types";

export function encodeState(state: GraphState): string {
  const json = JSON.stringify(state);
  // URL-safe base64 (RFC 4648)
  return btoa(unescape(encodeURIComponent(json)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

export function decodeState(encoded: string): GraphState | null {
  try {
    const padded = encoded.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(escape(atob(padded)));
    const parsed = JSON.parse(json);
    if (parsed.nodes && parsed.edges && parsed.viewport) return parsed as GraphState;
  } catch {
    // malformed param — ignore
  }
  return null;
}

export function buildShareUrl(state: GraphState): string {
  const url = new URL(window.location.href);
  url.searchParams.set("map", encodeState(state));
  return url.toString();
}
