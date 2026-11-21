
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

async function checkBotInGuild(guildId, botToken) {
  try {
    const response = await fetch(
      `https://discord.com/api/v10/guilds/${guildId}?with_counts=true`,
      {
        headers: {
          Authorization: `Bot ${botToken}`
        }
      }
    );

    if (!response.ok) {
      return {
        isBotAdded: false,
        memberCount: null
      };
    }

    const guild = await response.json();

    return {
      isBotAdded: true,
      memberCount: guild.approximate_member_count ?? null
    };
  } catch {
    return {
      isBotAdded: false,
      memberCount: null
    };
  }
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
  const clientId = process.env.DISCORD_CLIENT_ID;

  if (!userToken) {
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
    const discordResponse = await fetch(
      "https://discord.com/api/v10/users/@me/guilds?with_counts=true",
      {
        headers: {
          Authorization: `Bearer ${userToken}`
        }
      }
    );

    if (discordResponse.status === 401) {
      return res.status(401).json({
        error: "Discord session expired. Please login again."
      });
    }

    if (!discordResponse.ok) {
      return res.status(502).json({
        error: "Could not retrieve Discord servers"
      });
    }

    const userGuilds = await discordResponse.json();

    const adminGuilds = userGuilds.filter(guild => {
      try {
        const permissions = BigInt(guild.permissions || "0");
        const isAdmin = (permissions & 8n) === 8n;

        return guild.owner || isAdmin;
      } catch {
        return false;
      }
    });

    const servers = [];
    const concurrency = 5;

    for (let i = 0; i < adminGuilds.length; i += concurrency) {
      const batch = adminGuilds.slice(i, i + concurrency);

      const results = await Promise.all(
        batch.map(async guild => {
          const botStatus = await checkBotInGuild(
            guild.id,
            botToken
          );

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

      servers.push(...results);
    }

    return res.status(200).json({
      servers,
      total: servers.length
    });
  } catch (error) {
    return res.status(500).json({
      error: "Internal server error"
    });
  }
}
