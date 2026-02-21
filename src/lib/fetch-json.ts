/**
 * Safely parse JSON from a fetch Response.
 * Throws a clear error if the response is HTML (e.g. 404/500 page) instead of JSON.
 */
export async function parseJsonResponse<T = unknown>(
  response: Response,
): Promise<T> {
  const text = await response.text();
  const trimmed = text.trim().toLowerCase();
  const isHtml =
    trimmed.startsWith("<!doctype") ||
    trimmed.startsWith("<html") ||
    (trimmed.startsWith("<") && trimmed.includes("<!"));
  if (isHtml) {
    throw new Error(
      `API returned an HTML page (${response.status}) instead of JSON. ` +
        "Ensure DEMO_MODE=false and NEXT_PUBLIC_MARKETCHECK_API_KEY are set in production.",
    );
  }
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(
      `API returned invalid JSON (${response.status}). ` +
        "Check production deployment and environment variables.",
    );
  }
}
