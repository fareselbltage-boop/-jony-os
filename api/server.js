
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

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  const cookies = getCookies(req.headers.cookie || "");
  const userToken = cookies.jony_discord_token;
  const botToken = process.env.DISCORD_BOT_TOKEN;
  const guildId = String(req.query.id || "").trim();

  if (!userToken) {
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
    const userGuildsResult = await fetchDiscord(
      "https://discord.com/api/v10/users/@me/guilds",
      {
        Authorization: `Bearer ${userToken}`
      }
    );

    if (!userGuildsResult.ok || !Array.isArray(userGuildsResult.data)) {
      return res.status(401).json({
        error: "Discord session expired"
      });
    }

    const allowedGuild = userGuildsResult.data.find(guild => {
      if (guild.id !== guildId) return false;

      try {
        const permissions = BigInt(guild.permissions || "0");

        return (
          guild.owner === true ||
          (permissions & 8n) === 8n
        );
      } catch {
        return false;
      }
    });

    if (!allowedGuild) {
      return res.status(403).json({
        error: "You cannot manage this server"
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
      return res.status(
        guildResult.status === 404 ? 404 : 502
      ).json({
        error: "Bot is not in this server or server data is unavailable",
        botAdded: false
      });
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

    if (!channelsResult.ok || !rolesResult.ok) {
      return res.status(502).json({
        error: "Could not retrieve server channels or roles"
      });
    }

    const channels = Array.isArray(channelsResult.data)
      ? channelsResult.data
      : [];

    const roles = Array.isArray(rolesResult.data)
      ? rolesResult.data
      : [];

    return res.status(200).json({
      server: {
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
      }
    });
  } catch (error) {
    console.error("Server API error:", error);

    return res.status(500).json({
      error: "Internal server error"
    });
  }
}
