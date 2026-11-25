
import getDatabase from "./db.js";
import { createHash } from "node:crypto";

const SERVER_LIST_TTL = 15 * 60 * 1000;
const SERVER_LIST_STALE_TTL = 60 * 60 * 1000;

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

  if (!clientId || !clientSecret || !refreshToken) {
    return null;
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

const userGuildCache = new Map();
const USER_GUILD_CACHE_TIME = 5 * 60 * 1000;

function getCachedUserGuilds(token) {
  const cached = userGuildCache.get(token);
  if (!cached) return null;
  if (Date.now() - cached.time > USER_GUILD_CACHE_TIME) {
    userGuildCache.delete(token);
    return null;
  }
  return cached.guilds;
}

function setCachedUserGuilds(token, guilds) {
  if (userGuildCache.size >= 100) {
    const oldest = userGuildCache.keys().next().value;
    if (oldest) userGuildCache.delete(oldest);
  }
  userGuildCache.set(token, { time: Date.now(), guilds });
}

const botStatusCache = new Map();
const BOT_CACHE_TIME = 10 * 60 * 1000;

async function checkBotInGuild(guildId, botToken) {
  const cached = botStatusCache.get(guildId);

  if (cached && Date.now() - cached.time < BOT_CACHE_TIME) {
    return {
      ok: true,
      ...cached.data,
      cached: true
    };
  }

  const result = await fetchDiscord(
    `https://discord.com/api/v10/guilds/${guildId}?with_counts=true`,
    {
      Authorization: `Bot ${botToken}`
    }
  );

  if (result.status === 429) {
    return {
      ok: false,
      status: 429,
      retryAfter: result.retryAfter
    };
  }

  if (result.status === 404) {
    const data = {
      isBotAdded: false,
      memberCount: null
    };

    botStatusCache.set(guildId, {
      time: Date.now(),
      data
    });

    return {
      ok: true,
      ...data
    };
  }

  if (!result.ok || !result.data) {
    return {
      ok: false,
      status: result.status || 502,
      message: result.data?.message || "Could not check bot status"
    };
  }

  const data = {
    isBotAdded: true,
    memberCount: result.data.approximate_member_count ?? null
  };

  botStatusCache.set(guildId, {
    time: Date.now(),
    data
  });

  return {
    ok: true,
    ...data
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
  const clientId = process.env.DISCORD_CLIENT_ID;

  if (!userToken && !refreshToken) {
    return res.status(401).json({
      error: "Not authenticated"
    });
  }

  if (!botToken || !clientId) {
    return res.status(500).json({
      error: "Server configuration is missing"
    });
  }

  try {
    const db = await getDatabase();
    const serverListCache = db.collection("user_server_list_cache");
    const cacheIdentity = refreshToken || userToken;
    const cacheKey = createHash("sha256").update(cacheIdentity).digest("hex");
    const cachedList = await serverListCache.findOne({ cacheKey });
    const now = Date.now();

    if (cachedList?.servers && cachedList.expiresAt && new Date(cachedList.expiresAt).getTime() > now) {
      return res.status(200).json({
        servers: cachedList.servers,
        total: cachedList.servers.length,
        cached: true
      });
    }

    const guildsUrl =
      "https://discord.com/api/v10/users/@me/guilds?with_counts=true";

    const cachedUserGuilds = userToken ? getCachedUserGuilds(userToken) : null;

    let discordResult = cachedUserGuilds
      ? { ok: true, status: 200, data: cachedUserGuilds, cached: true }
      : userToken
        ? await fetchDiscord(guildsUrl, {
            Authorization: `Bearer ${userToken}`
          })
        : null;

    if (!discordResult || discordResult.status === 401) {
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

      discordResult = await fetchDiscord(guildsUrl, {
        Authorization: `Bearer ${userToken}`
      });
    }

    if (!discordResult.ok) {
      if (discordResult.status === 429) {
        if (cachedList?.servers && cachedList.updatedAt && now - new Date(cachedList.updatedAt).getTime() <= SERVER_LIST_STALE_TTL) {
          return res.status(200).json({
            servers: cachedList.servers,
            total: cachedList.servers.length,
            cached: true,
            stale: true,
            retryAfter: discordResult.retryAfter || 5
          });
        }
        return res.status(429).json({
          error: "Discord rate limit reached. Your previous server list is not available yet; please wait and retry.",
          retryAfter: discordResult.retryAfter || 5
        });
      }
      return sendDiscordError(
        res,
        discordResult,
        "Could not retrieve Discord servers"
      );
    }

    if (!Array.isArray(discordResult.data)) {
      return res.status(502).json({
        error: "Invalid Discord server response"
      });
    }

    if (userToken && !cachedUserGuilds) {
      setCachedUserGuilds(userToken, discordResult.data);
    }

    const adminGuilds = discordResult.data.filter(guild => {
      try {
        const permissions = BigInt(guild.permissions || "0");

        return guild.owner === true || (permissions & 8n) === 8n;
      } catch {
        return false;
      }
    });

    const servers = [];
    const concurrency = 2;

    for (let i = 0; i < adminGuilds.length; i += concurrency) {
      const batch = adminGuilds.slice(i, i + concurrency);

      const results = await Promise.all(
        batch.map(async guild => {
          const botStatus = await checkBotInGuild(
            guild.id,
            botToken
          );

          if (!botStatus.ok) {
            // Skip a temporarily unavailable check instead of failing the whole server list.
            return null;
          }

          const inviteParams = new URLSearchParams({
            client_id: clientId,
            scope: "bot applications.commands",
            permissions: "0",
            guild_id: guild.id,
            disable_guild_select: "true"
          });

          return {
            id: guild.id,
            name: guild.name,
            icon: guild.icon
              ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.${guild.icon.startsWith("a_") ? "gif" : "png"}?size=128`
              : null,
            isOwner: Boolean(guild.owner),
            isBotAdded: botStatus.isBotAdded,
            memberCount:
              botStatus.memberCount ??
              guild.approximate_member_count ??
              null,
            inviteUrl: `https://discord.com/oauth2/authorize?${inviteParams.toString()}`
          };
        })
      );

      // The dashboard only lists servers where the bot is already installed.
      // A temporary 429 for one guild must not break the entire dashboard.
      servers.push(...results.filter(item => item && item.isBotAdded));
    }

    await serverListCache.updateOne(
      { cacheKey },
      { $set: {
        servers,
        updatedAt: new Date(),
        expiresAt: new Date(Date.now() + SERVER_LIST_TTL)
      } },
      { upsert: true }
    );

    return res.status(200).json({
      servers,
      total: servers.length,
      cached: false
    });
  } catch (error) {
    console.error("Servers API error:", error);

    return res.status(500).json({
      error: "Internal server error"
    });
  }
}
