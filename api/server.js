
import getDatabase from "./db.js";
import { createHash } from "node:crypto";

const userGuildCache = new Map();
const USER_GUILD_CACHE_TTL = 15 * 60 * 1000;
const USER_GUILD_STALE_TTL = 60 * 60 * 1000;

const serverDataCache = new Map();
const SERVER_DATA_CACHE_TTL = 15 * 60 * 1000;
const SERVER_DATA_STALE_TTL = 60 * 60 * 1000;

function getCachedUserGuilds(userToken) {
  const cached = userGuildCache.get(userToken);

  if (!cached) return null;

  if (Date.now() - cached.time >= USER_GUILD_CACHE_TTL) {
    userGuildCache.delete(userToken);
    return null;
  }

  return cached.guilds;
}

function setCachedUserGuilds(userToken, guilds) {
  if (userGuildCache.size >= 100) {
    const oldestKey = userGuildCache.keys().next().value;
    if (oldestKey) userGuildCache.delete(oldestKey);
  }

  userGuildCache.set(userToken, {
    time: Date.now(),
    guilds
  });
}

function getCachedServerData(guildId) {
  const cached = serverDataCache.get(guildId);

  if (!cached) return null;

  if (Date.now() - cached.time >= SERVER_DATA_CACHE_TTL) {
    serverDataCache.delete(guildId);
    return null;
  }

  return cached.data;
}

function setCachedServerData(guildId, data) {
  if (serverDataCache.size >= 100) {
    const oldestKey = serverDataCache.keys().next().value;
    if (oldestKey) serverDataCache.delete(oldestKey);
  }

  serverDataCache.set(guildId, {
    time: Date.now(),
    data
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

async function fetchDiscord(url, headers) {
  try {
    const response = await fetch(url, { headers });
    const data = await response.json().catch(() => null);

    return {
      ok: response.ok,
      status: response.status,
      data,
      retryAfter: response.status === 429
        ? getRetryAfter(response, data)
        : null
    };
  } catch (error) {
    console.error("Discord request failed:", error.message);

    return {
      ok: false,
      status: 0,
      data: null,
      retryAfter: null
    };
  }
}

async function refreshDiscordToken(refreshToken) {
  const clientId = process.env.DISCORD_CLIENT_ID;
  const clientSecret = process.env.DISCORD_CLIENT_SECRET;

  if (!clientId || !clientSecret || !refreshToken) return null;

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

    const tokens = await response.json().catch(() => null);

    if (!response.ok || !tokens?.access_token) {
      console.error("Discord token refresh failed:", {
        status: response.status,
        error: tokens?.error
      });

      return null;
    }

    return tokens;
  } catch (error) {
    console.error("Discord token refresh request failed:", error.message);
    return null;
  }
}

function saveSessionCookies(res, tokens, oldRefreshToken) {
  const refreshToken = tokens.refresh_token || oldRefreshToken;
  const expiresIn = Number(tokens.expires_in) || 604800;

  res.setHeader("Set-Cookie", [
    `jony_discord_token=${encodeURIComponent(tokens.access_token)}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${expiresIn}`,
    `jony_discord_refresh_token=${encodeURIComponent(refreshToken)}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=2592000`
  ]);
}

function clearSessionCookies(res) {
  res.setHeader("Set-Cookie", [
    "jony_discord_token=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0",
    "jony_discord_refresh_token=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0"
  ]);
}

function sendDiscordError(res, result, fallback) {
  if (result.status === 429) {
    return res.status(429).json({
      error: "Discord is rate limiting requests. Please wait and try again.",
      retryAfter: result.retryAfter || 1
    });
  }

  if (result.status === 401) {
    clearSessionCookies(res);

    return res.status(401).json({
      error: "Discord session expired. Please login again."
    });
  }

  console.error("Discord API error:", {
    status: result.status,
    message: result.data?.message,
    code: result.data?.code
  });

  return res.status(502).json({
    error: fallback,
    discordStatus: result.status,
    discordError: result.data?.message || "Unknown Discord error"
  });
}

function normalizeChannel(channel) {
  return {
    id: String(channel.id),
    name: String(channel.name || "unknown-channel"),
    type: Number(channel.type),
    parent_id: channel.parent_id || null,
    position: Number(channel.position || 0),
    topic: channel.topic || null
  };
}

function normalizeRole(role) {
  return {
    id: String(role.id),
    name: String(role.name || "Unknown Role"),
    position: Number(role.position || 0),
    color: Number(role.color || 0),
    managed: Boolean(role.managed),
    hoist: Boolean(role.hoist)
  };
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");

    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  res.setHeader("Cache-Control", "no-store");

  const cookies = getCookies(req.headers.cookie || "");

  let userToken = cookies.jony_discord_token;
  const refreshToken = cookies.jony_discord_refresh_token;

  const botToken = process.env.DISCORD_BOT_TOKEN;
  const guildId = String(req.query.id || "").trim();

  if (!userToken && !refreshToken) {
    return res.status(401).json({
      error: "Not authenticated"
    });
  }

  if (!botToken || !guildId) {
    return res.status(400).json({
      error: "Missing server ID or bot configuration"
    });
  }

  if (!/^\d{17,20}$/.test(guildId)) {
    return res.status(400).json({
      error: "Invalid server ID"
    });
  }

  try {
    const db = await getDatabase();
    const authCache = db.collection("guild_authorization_cache");
    const serverCache = db.collection("guild_server_cache");
    const guildsUrl = "https://discord.com/api/v10/users/@me/guilds";

    let cachedUserGuilds = userToken ? getCachedUserGuilds(userToken) : null;

    if (!cachedUserGuilds && userToken) {
      const tokenHash = createHash("sha256").update(userToken).digest("hex");
      const stored = await authCache.findOne({ tokenHash });
      const storedAge = stored?.updatedAt
        ? Date.now() - new Date(stored.updatedAt).getTime()
        : Infinity;
      if (Array.isArray(stored?.guilds) && storedAge <= USER_GUILD_CACHE_TTL) {
        cachedUserGuilds = stored.guilds;
        setCachedUserGuilds(userToken, cachedUserGuilds);
      }
    }

    let userGuildsResult = cachedUserGuilds
      ? {
          ok: true,
          status: 200,
          data: cachedUserGuilds
        }
      : userToken
        ? await fetchDiscord(guildsUrl, {
            Authorization: `Bearer ${userToken}`
          })
        : null;

    if (!userGuildsResult || userGuildsResult.status === 401) {
      if (!refreshToken) {
        clearSessionCookies(res);

        return res.status(401).json({
          error: "Discord session expired. Please login again."
        });
      }

      const newTokens = await refreshDiscordToken(refreshToken);

      if (!newTokens) {
        clearSessionCookies(res);

        return res.status(401).json({
          error: "Discord session expired. Please login again."
        });
      }

      userToken = newTokens.access_token;
      saveSessionCookies(res, newTokens, refreshToken);

      userGuildsResult = await fetchDiscord(guildsUrl, {
        Authorization: `Bearer ${userToken}`
      });
    }

    if (!userGuildsResult.ok && userGuildsResult.status === 429 && userToken) {
      const tokenHash = createHash("sha256").update(userToken).digest("hex");
      const staleAuth = await authCache.findOne({ tokenHash });
      const staleAge = staleAuth?.updatedAt
        ? Date.now() - new Date(staleAuth.updatedAt).getTime()
        : Infinity;

      if (Array.isArray(staleAuth?.guilds) && staleAge <= USER_GUILD_STALE_TTL) {
        userGuildsResult = { ok: true, status: 200, data: staleAuth.guilds, cached: true };
        cachedUserGuilds = staleAuth.guilds;
      }
    }

    if (!userGuildsResult.ok) {
      return sendDiscordError(
        res,
        userGuildsResult,
        "Could not verify Discord permissions"
      );
    }

    if (!Array.isArray(userGuildsResult.data)) {
      return res.status(502).json({
        error: "Invalid Discord guild response"
      });
    }

    if (!cachedUserGuilds) {
      setCachedUserGuilds(userToken, userGuildsResult.data);
      const tokenHash = createHash("sha256").update(userToken).digest("hex");
      await authCache.updateOne(
        { tokenHash },
        { $set: {
          guilds: userGuildsResult.data,
          expiresAt: new Date(Date.now() + USER_GUILD_CACHE_TTL),
          updatedAt: new Date()
        } },
        { upsert: true }
      );
    }

    const allowedGuild = userGuildsResult.data.find(guild => {
      if (guild.id !== guildId) return false;

      try {
        const permissions = BigInt(guild.permissions || "0");

        return guild.owner === true || (permissions & 8n) === 8n;
      } catch {
        return false;
      }
    });

    if (!allowedGuild) {
      return res.status(403).json({
        error: "You cannot manage this server"
      });
    }

    let cachedServerData = getCachedServerData(guildId);

    if (!cachedServerData) {
      const storedServer = await serverCache.findOne({
        guildId,
        expiresAt: { $gt: new Date() }
      });
      if (storedServer?.data) {
        cachedServerData = storedServer.data;
        setCachedServerData(guildId, cachedServerData);
      }
    }

    if (cachedServerData) {
      return res.status(200).json({
        server: cachedServerData
      });
    }

    const botHeaders = {
      Authorization: `Bot ${botToken}`
    };

    const guildResult = await fetchDiscord(
      `https://discord.com/api/v10/guilds/${guildId}?with_counts=true`,
      botHeaders
    );

    if (!guildResult.ok || !guildResult.data) {
      if (guildResult.status === 404) {
        return res.status(404).json({
          error: "Bot is not in this server or server data is unavailable",
          botAdded: false
        });
      }

      return sendDiscordError(
        res,
        guildResult,
        "Could not retrieve server information"
      );
    }

    const guild = guildResult.data;

    const [channelsResult, rolesResult] = await Promise.all([
      fetchDiscord(
        `https://discord.com/api/v10/guilds/${guildId}/channels`,
        botHeaders
      ),
      fetchDiscord(
        `https://discord.com/api/v10/guilds/${guildId}/roles`,
        botHeaders
      )
    ]);

    if (!channelsResult.ok) {
      return sendDiscordError(
        res,
        channelsResult,
        "Could not retrieve server channels"
      );
    }

    if (!rolesResult.ok) {
      return sendDiscordError(
        res,
        rolesResult,
        "Could not retrieve server roles"
      );
    }

    const channels = Array.isArray(channelsResult.data)
      ? channelsResult.data
          .filter(channel => channel && channel.id)
          .map(normalizeChannel)
          .sort((a, b) => {
            if (a.type === 4 && b.type !== 4) return -1;
            if (a.type !== 4 && b.type === 4) return 1;
            return a.position - b.position;
          })
      : [];

    const roles = Array.isArray(rolesResult.data)
      ? rolesResult.data
          .filter(role => role && role.id)
          .map(normalizeRole)
          .sort((a, b) => b.position - a.position)
      : [];

    console.log(
      `[JONY OS] Loaded ${channels.length} channels and ${roles.length} roles for ${guild.name}`
    );

    const serverData = {
      id: guild.id,
      name: guild.name,
      icon: guild.icon
        ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.${guild.icon.startsWith("a_") ? "gif" : "png"}?size=256`
        : null,
      botAdded: true,
      memberCount: guild.approximate_member_count ?? null,
      onlineCount: guild.approximate_presence_count ?? null,
      channelCount: channels.length,
      roleCount: roles.length,
      channels,
      roles
    };

    setCachedServerData(guildId, serverData);
    await serverCache.updateOne(
      { guildId },
      { $set: {
        data: serverData,
        expiresAt: new Date(Date.now() + SERVER_DATA_CACHE_TTL),
        updatedAt: new Date()
      } },
      { upsert: true }
    );

    return res.status(200).json({
      server: serverData
    });
  } catch (error) {
    console.error("Server API error:", error);

    return res.status(500).json({
      error: "Internal server error"
    });
  }
}
