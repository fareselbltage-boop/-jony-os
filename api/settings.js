
import getDatabase from "./db.js";

const guildAuthorizationCache = new Map();
const GUILD_AUTH_CACHE_TTL = 5 * 60 * 1000;

function getRetryAfter(response, data) {
  const headerValue = Number(response.headers.get("retry-after"));
  const bodyValue = Number(data?.retry_after);

  const seconds =
    Number.isFinite(bodyValue) && bodyValue > 0
      ? bodyValue
      : Number.isFinite(headerValue) && headerValue > 0
        ? headerValue
        : 1;

  return Math.ceil(seconds);
}

function getCachedGuilds(userToken) {
  const cached = guildAuthorizationCache.get(userToken);

  if (!cached) return null;

  if (Date.now() - cached.time >= GUILD_AUTH_CACHE_TTL) {
    guildAuthorizationCache.delete(userToken);
    return null;
  }

  return cached.guilds;
}

function setCachedGuilds(userToken, guilds) {
  if (guildAuthorizationCache.size >= 100) {
    const oldestKey = guildAuthorizationCache.keys().next().value;
    if (oldestKey) guildAuthorizationCache.delete(oldestKey);
  }

  guildAuthorizationCache.set(userToken, {
    time: Date.now(),
    guilds
  });
}

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
    return {
      ok: false,
      status: 0,
      error: "Missing OAuth configuration or refresh token"
    };
  }

  try {
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

    const data = await response.json().catch(() => null);

    if (!response.ok || !data?.access_token) {
      console.error("Discord refresh error:", {
        status: response.status,
        error: data?.error,
        description: data?.error_description
      });

      return {
        ok: false,
        status: response.status,
        error: data?.error_description || data?.error || "Token refresh failed"
      };
    }

    return {
      ok: true,
      tokens: data
    };
  } catch (error) {
    console.error("Discord refresh request failed:", error.message);

    return {
      ok: false,
      status: 0,
      error: "Network request failed"
    };
  }
}

async function fetchDiscord(url, headers) {
  try {
    const response = await fetch(url, { headers });

    const data = await response.json().catch(() => null);

    return {
      ok: response.ok,
      status: response.status,
      data
    };
  } catch (error) {
    console.error("Discord request failed:", error.message);

    return {
      ok: false,
      status: 0,
      data: {
        message: "Network request failed"
      }
    };
  }
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
  let cachedGuilds = userToken ? getCachedGuilds(userToken) : null;

  if (cachedGuilds) {
    result = {
      ok: true,
      status: 200,
      data: cachedGuilds
    };
  } else if (userToken) {
    result = await fetchDiscord(guildsUrl, {
      Authorization: `Bearer ${userToken}`
    });
  }

  if (!result || result.status === 401) {
    if (!refreshToken) {
      clearSessionCookies(res);

      return {
        error: "Discord session expired. Please login again.",
        status: 401
      };
    }

    const refreshed = await refreshDiscordToken(refreshToken);

    if (!refreshed.ok) {
      clearSessionCookies(res);

      return {
        error: "Discord session expired. Please login again.",
        status: 401,
        discordStatus: refreshed.status,
        discordError: refreshed.error
      };
    }

    userToken = refreshed.tokens.access_token;

    saveSessionCookies(res, refreshed.tokens, refreshToken);

    result = await fetchDiscord(guildsUrl, {
      Authorization: `Bearer ${userToken}`
    });
  }

  if (!result.ok) {
    if (result.status === 429) {
      return {
        error: "Discord is rate limiting requests. Please wait and try again.",
        status: 429,
        retryAfter: result.retryAfter || 1
      };
    }

    console.error("Discord guild verification failed:", {
      status: result.status,
      message: result.data?.message,
      code: result.data?.code
    });

    if (result.status === 401) {
      clearSessionCookies(res);

      return {
        error: "Discord session expired. Please login again.",
        status: 401
      };
    }

    return {
      error: "Could not verify Discord permissions",
      status: 502,
      discordStatus: result.status,
      discordError: result.data?.message || "Unknown Discord error",
      discordCode: result.data?.code || null
    };
  }

  if (!Array.isArray(result.data)) {
    return {
      error: "Invalid Discord response",
      status: 502
    };
  }

  if (!cachedGuilds) {
    setCachedGuilds(userToken, result.data);
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
            !Array.isArray(element) &&
            !isSafeObject(element, depth + 1)
          ) {
            return false;
          }

          if (Array.isArray(element)) {
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
  moderation: {
    enabled: true,
    prefix: "-",
    staffRoleId: "",
    logChannelId: "",
    defaultTimeout: 10,
    successMessage: "Moderation action completed.",
    permissionMessage: "You do not have permission to use this command.",
    commands: {
      ban: { enabled: true },
      kick: { enabled: true },
      timeout: { enabled: true },
      untimeout: { enabled: true },
      warn: { enabled: true },
      clear: { enabled: true },
      lock: { enabled: true },
      unlock: { enabled: true }
    }
  },
  tickets: {},
  welcome: {},
  economy: {},
logs: {
    enabled: true,
    embedColor: "#8b5cf6",
    channels: {
      messages: "",
      members: "",
      moderation: "",
      roles: "",
      channels: "",
      voice: "",
      tickets: "",
      server: ""
    },
    events: {
      messageDelete: true,
      messageEdit: true,
      memberJoin: true,
      memberLeave: true,
      memberUpdate: true,
      ban: true,
      unban: true,
      timeout: true,
      roleCreate: true,
      roleUpdate: true,
      roleDelete: true,
      channelCreate: true,
      channelUpdate: true,
      channelDelete: true,
      voiceJoin: true,
      voiceLeave: true,
      voiceMove: true,
      ticketCreate: true,
      ticketClose: true,
      inviteCreate: true,
      inviteDelete: true
    }
  }
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
        error: authorization.error,
        ...(authorization.discordStatus !== undefined && {
          discordStatus: authorization.discordStatus
        }),
        ...(authorization.discordError && {
          discordError: authorization.discordError
        }),
        ...(authorization.discordCode !== undefined && {
          discordCode: authorization.discordCode
        })
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
      {
        upsert: true
      }
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

export { authorizeGuild };
