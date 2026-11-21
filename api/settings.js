
import getDatabase from "./db.js";

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

function clearSessionCookies(res) {
  res.setHeader("Set-Cookie", [
    "jony_discord_token=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0",
    "jony_discord_refresh_token=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0"
  ]);
}

function saveSessionCookies(res, tokens, oldRefreshToken) {
  const refreshToken = tokens.refresh_token || oldRefreshToken;
  const expiresIn = Number(tokens.expires_in) || 604800;

  res.setHeader("Set-Cookie", [
    `jony_discord_token=${encodeURIComponent(tokens.access_token)}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${expiresIn}`,
    `jony_discord_refresh_token=${encodeURIComponent(refreshToken)}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=2592000`
  ]);
}

async function refreshDiscordToken(refreshToken) {
  const clientId = process.env.DISCORD_CLIENT_ID;
  const clientSecret = process.env.DISCORD_CLIENT_SECRET;

  if (!clientId || !clientSecret || !refreshToken) {
    return null;
  }

  const params = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: "refresh_token",
    refresh_token: refreshToken
  });

  const response = await fetch(
    "https://discord.com/api/oauth2/token",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: params
    }
  );

  const tokens = await response.json();

  if (!response.ok || !tokens.access_token) {
    return null;
  }

  return tokens;
}

async function fetchDiscord(url, headers) {
  const response = await fetch(url, { headers });

  let data = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  return {
    ok: response.ok,
    status: response.status,
    data
  };
}

async function authorizeGuild(req, res, guildId) {
  if (!/^\d{17,20}$/.test(guildId)) {
    return {
      error: "Invalid server ID",
      status: 400
    };
  }

  const cookies = getCookies(req.headers.cookie || "");

  let userToken = cookies.jony_discord_token;
  const refreshToken = cookies.jony_discord_refresh_token;

  if (!userToken && !refreshToken) {
    return {
      error: "Not authenticated",
      status: 401
    };
  }

  const guildsUrl = "https://discord.com/api/v10/users/@me/guilds";

  let result = null;

  if (userToken) {
    result = await fetchDiscord(guildsUrl, {
      Authorization: `Bearer ${userToken}`
    });
  }

  if (!result || result.status === 401) {
    if (!refreshToken) {
      clearSessionCookies(res);

      return {
        error: "Discord session expired",
        status: 401
      };
    }

    const newTokens = await refreshDiscordToken(refreshToken);

    if (!newTokens) {
      clearSessionCookies(res);

      return {
        error: "Discord session expired",
        status: 401
      };
    }

    userToken = newTokens.access_token;

    saveSessionCookies(res, newTokens, refreshToken);

    result = await fetchDiscord(guildsUrl, {
      Authorization: `Bearer ${userToken}`
    });
  }

  if (!result.ok) {
    if (result.status === 401) {
      clearSessionCookies(res);

      return {
        error: "Discord session expired",
        status: 401
      };
    }

    return {
      error: "Could not verify Discord permissions",
      status: 502
    };
  }

  if (!Array.isArray(result.data)) {
    return {
      error: "Invalid Discord response",
      status: 502
    };
  }

  const guild = result.data.find(item => item.id === guildId);

  if (!guild) {
    return {
      error: "You cannot manage this server",
      status: 403
    };
  }

  let allowed = guild.owner === true;

  try {
    const permissions = BigInt(guild.permissions || "0");
    allowed ||= (permissions & 8n) === 8n;
  } catch {
    allowed = false;
  }

  if (!allowed) {
    return {
      error: "You cannot manage this server",
      status: 403
    };
  }

  return { guild };
}

function isSafeObject(value, depth = 0) {
  if (
    value === null ||
    typeof value !== "object" ||
    Array.isArray(value)
  ) {
    return false;
  }

  if (depth > 10) return false;

  for (const [key, item] of Object.entries(value)) {
    if (
      key.startsWith("$") ||
      key.includes(".") ||
      key === "__proto__" ||
      key === "constructor" ||
      key === "prototype"
    ) {
      return false;
    }

    if (item && typeof item === "object") {
      if (Array.isArray(item)) {
        for (const element of item) {
          if (
            element &&
            typeof element === "object" &&
            !isSafeObject(element, depth + 1)
          ) {
            return false;
          }
        }
      } else if (!isSafeObject(item, depth + 1)) {
        return false;
      }
    }
  }

  return true;
}

const defaultSettings = {
  prefix: "-",
  systems: {},
  moderation: {},
  tickets: {},
  welcome: {},
  economy: {},
  logs: {}
};

export default async function handler(req, res) {
  if (!["GET", "PUT"].includes(req.method)) {
    res.setHeader("Allow", "GET, PUT");

    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  res.setHeader("Cache-Control", "no-store");

  const guildId = String(req.query.id || "").trim();

  try {
    const authorization = await authorizeGuild(req, res, guildId);

    if (authorization.error) {
      return res.status(authorization.status).json({
        error: authorization.error
      });
    }

    const db = await getDatabase();
    const collection = db.collection("guild_settings");

    if (req.method === "GET") {
      const document = await collection.findOne({ guildId });

      return res.status(200).json({
        guildId,
        settings: document?.settings || defaultSettings,
        updatedAt: document?.updatedAt || null
      });
    }

    const settings = req.body?.settings;

    if (!isSafeObject(settings)) {
      return res.status(400).json({
        error: "Settings must be a valid object"
      });
    }

    const serialized = JSON.stringify(settings);

    if (serialized.length > 50000) {
      return res.status(413).json({
        error: "Settings are too large"
      });
    }

    const updatedAt = new Date();

    await collection.updateOne(
      { guildId },
      {
        $set: {
          settings,
          updatedAt
        },
        $setOnInsert: {
          guildId,
          createdAt: updatedAt
        }
      },
      { upsert: true }
    );

    return res.status(200).json({
      success: true,
      guildId,
      settings,
      updatedAt
    });
  } catch (error) {
    console.error("Settings API error:", error);

    return res.status(500).json({
      error: "Internal server error"
    });
  }
}
