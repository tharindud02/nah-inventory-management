import "server-only";

const DEFAULT_TOKEN_URL =
  "https://authorize.coxautoinc.com/oauth2/aus132uaxy2eomhmi357/v1/token";
const DEFAULT_SCOPE =
  "wholesale-valuations.vehicle.mmr-ext.get wholesale-valuations.vehicle.mmr-forecast-ext.get";
const TOKEN_EXPIRY_BUFFER_SECONDS = 60;

interface ManheimTokenResponse {
  access_token?: string;
  expires_in?: number;
  token_type?: string;
}

interface CachedManheimToken {
  accessToken: string;
  expiresAtMs: number;
}

let cachedToken: CachedManheimToken | null = null;

function getManheimCredentials(): {
  clientId: string;
  clientSecret: string;
  tokenUrl: string;
  scope: string;
} | null {
  const clientId = process.env.MANHEIM_CLIENT_ID?.trim();
  const clientSecret = process.env.MANHEIM_CLIENT_SECRET?.trim();
  const tokenUrl = (process.env.MANHEIM_TOKEN_URL ?? DEFAULT_TOKEN_URL).trim();
  const scope = (process.env.MANHEIM_SCOPE ?? DEFAULT_SCOPE).trim();

  if (!clientId || !clientSecret || !tokenUrl || !scope) {
    return null;
  }

  return { clientId, clientSecret, tokenUrl, scope };
}

function isValidTokenResponse(
  data: unknown,
): data is Required<ManheimTokenResponse> {
  if (!data || typeof data !== "object") {
    return false;
  }
  const payload = data as ManheimTokenResponse;
  return (
    typeof payload.access_token === "string" &&
    payload.access_token.length > 0 &&
    typeof payload.expires_in === "number" &&
    Number.isFinite(payload.expires_in) &&
    payload.expires_in > 0 &&
    typeof payload.token_type === "string" &&
    payload.token_type.length > 0
  );
}

export async function getManheimAccessToken(): Promise<string | null> {
  if (cachedToken && cachedToken.expiresAtMs > Date.now()) {
    return cachedToken.accessToken;
  }

  const credentials = getManheimCredentials();
  if (!credentials) {
    return null;
  }

  const basicAuth = Buffer.from(
    `${credentials.clientId}:${credentials.clientSecret}`,
    "utf8",
  ).toString("base64");

  const response = await fetch(credentials.tokenUrl, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basicAuth}`,
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      scope: credentials.scope,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

  let tokenPayload: unknown;
  try {
    tokenPayload = (await response.json()) as unknown;
  } catch {
    return null;
  }

  if (!isValidTokenResponse(tokenPayload)) {
    return null;
  }

  const expiresAtMs =
    Date.now() +
    Math.max(1, tokenPayload.expires_in - TOKEN_EXPIRY_BUFFER_SECONDS) * 1000;

  cachedToken = {
    accessToken: tokenPayload.access_token,
    expiresAtMs,
  };

  return cachedToken.accessToken;
}
