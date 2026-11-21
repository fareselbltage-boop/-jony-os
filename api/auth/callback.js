
function getCookies(header = "") {
  const cookies = {};

  for (const part of header.split(";")) {
    const index = part.indexOf("=");
    if (index === -1) continue;

    const name = part.slice(0, index).trim();
    const value = part.slice(index + 1).trim();

    try {
      cookies[name] = decodeURIComponent(value);
    } catch {
      cookies[name] = value;
    }
  }

  return cookies;
}

function clearCookies(res) {
  res.setHeader("Set-Cookie", [
    "jony_oauth_state=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0",
    "jony_discord_token=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0",
    "jony_discord_refresh_token=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0"
  ]);
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).send("Method not allowed");
  }

  res.setHeader("Cache-Control", "no-store");

  const cookies = getCookies(req.headers.cookie || "");
  const { code, state } = req.query;
  const savedState = cookies.jony_oauth_state;

  if (
    typeof code !== "string" ||
    typeof state !== "string" ||
    typeof savedState !== "string" ||
    !savedState ||
    state !== savedState
  ) {
    clearCookies(res);
    return res.status(400).send(
      "Invalid OAuth state. Please open the production website and try again."
    );
  }

  const clientId = process.env.DISCORD_CLIENT_ID;
  const clientSecret = process.env.DISCORD_CLIENT_SECRET;
  const redirectUri = process.env.DISCORD_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    return res.status(500).send("Discord OAuth is not configured.");
  }

  try {
    const params = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri
    });

    const tokenResponse = await fetch(
      "https://discord.com/api/oauth2/token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: params
      }
    );

    const tokens = await tokenResponse.json();

    if (
      !tokenResponse.ok ||
      !tokens.access_token ||
      !tokens.refresh_token
    ) {
      throw new Error("Token exchange failed");
    }

    const userResponse = await fetch(
      "https://discord.com/api/v10/users/@me",
      {
        headers: {
          Authorization: `Bearer ${tokens.access_token}`
        }
      }
    );

    if (!userResponse.ok) {
      throw new Error("Could not fetch Discord user");
    }

    const expiresIn = Number(tokens.expires_in) || 604800;

    res.setHeader("Set-Cookie", [
      "jony_oauth_state=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0",
      `jony_discord_token=${encodeURIComponent(tokens.access_token)}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${expiresIn}`,
      `jony_discord_refresh_token=${encodeURIComponent(tokens.refresh_token)}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=2592000`
    ]);

    return res.redirect("/");
  } catch {
    clearCookies(res);
    return res.status(500).send("Discord login failed. Please try again.");
  }
}
