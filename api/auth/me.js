
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

function setSessionCookies(res, tokens, oldRefreshToken) {
  const refreshToken = tokens.refresh_token || oldRefreshToken;
  const expiresIn = Number(tokens.expires_in) || 604800;

  res.setHeader("Set-Cookie", [
    `jony_discord_token=${encodeURIComponent(tokens.access_token)}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${expiresIn}`,
    `jony_discord_refresh_token=${encodeURIComponent(refreshToken)}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=2592000`
  ]);
}

async function refreshSession(refreshToken) {
  const params = new URLSearchParams({
    client_id: process.env.DISCORD_CLIENT_ID,
    client_secret: process.env.DISCORD_CLIENT_SECRET,
    grant_type: "refresh_token",
    refresh_token: refreshToken
  });

  const response = await fetch("https://discord.com/api/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: params,
    signal: AbortSignal.timeout(8000)
  });

  const tokens = await response.json();

  if (!response.ok || !tokens.access_token) {
    return null;
  }

  return tokens;
}

async function getDiscordUser(token) {
  const response = await fetch("https://discord.com/api/v10/users/@me", {
    headers: {
      Authorization: `Bearer ${token}`
    },
    signal: AbortSignal.timeout(8000)
  });

  if (!response.ok) return null;

  return response.json();
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  res.setHeader("Cache-Control", "no-store");

  const cookies = getCookies(req.headers.cookie || "");
  let accessToken = cookies.jony_discord_token;
  const refreshToken = cookies.jony_discord_refresh_token;

  if (!accessToken) {
    return res.status(200).json({ authenticated: false });
  }

  try {
    let user = await getDiscordUser(accessToken);

    if (!user && refreshToken) {
      const newTokens = await refreshSession(refreshToken);

      if (newTokens) {
        accessToken = newTokens.access_token;
        setSessionCookies(res, newTokens, refreshToken);
        user = await getDiscordUser(accessToken);
      }
    }

    if (!user) {
      res.setHeader("Set-Cookie", [
        "jony_discord_token=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0",
        "jony_discord_refresh_token=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0"
      ]);

      return res.status(200).json({ authenticated: false });
    }

    return res.status(200).json({
      authenticated: true,
      user: {
        id: user.id,
        username: user.username,
        global_name: user.global_name,
        avatar: user.avatar
      }
    });
  } catch {
    return res.status(500).json({ error: "Internal server error" });
  }
}
