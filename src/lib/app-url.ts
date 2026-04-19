/**
 * Returns the configured public app URL. Throws if unset — every caller
 * embeds this into OAuth metadata / WWW-Authenticate headers where silently
 * emitting an empty string would produce broken (but well-formed) responses.
 */
export function appUrl(): string {
  const base = process.env.NEXT_PUBLIC_APP_URL;
  if (!base) {
    throw new Error("NEXT_PUBLIC_APP_URL is not configured");
  }
  return base.replace(/\/+$/, "");
}
