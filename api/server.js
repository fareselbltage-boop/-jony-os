
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

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const cookies = getCookies(req.headers.cookie || "");
  const userToken = cookies.jony_discord_token;
  const botToken = process.env.DISCORD_BOT_TOKEN;
  const guildId = req.query.id;

  if (!userToken) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  if (!botToken || !guildId) {
    return res.status(400).json({ error: "Missing server ID or bot configuration" });
  }

  try {
    const userGuildsResponse = await fetch(
      "https://discord.com/api/v10/users/@me/guilds",
      {
        headers: {
          Authorization: `Bearer ${userToken}`
        }
      }
    );

    if (!userGuildsResponse.ok) {
      return res.status(401).json({ error: "Discord session expired" });
    }

    const userGuilds = await userGuildsResponse.json();

    const allowedGuild = userGuilds.find(guild => {
      if (guild.id !== guildId) return false;

      try {
        const permissions = BigInt(guild.permissions || "0");
        return guild.owner || (permissions & 8n) === 8n;
      } catch {
        return false;
      }
    });

    if (!allowedGuild) {
      return res.status(403).json({ error: "You cannot manage this server" });
    }

    const headers = {
      Authorization: `Bot ${botToken}`
    };

    const guildResponse = await fetch(
      `https://discord.com/api/v10/guilds/${guildId}?with_counts=true`,
      { headers }
    );

    if (!guildResponse.ok) {
      return res.status(404).json({
        error: "Bot is not in this server or server data is unavailable"
      });
    }

    const [channelsResponse, rolesResponse] = await Promise.all([
      fetch(`https://discord.com/api/v10/guilds/${guildId}/channels`, { headers }),
      fetch(`https://discord.com/api/v10/guilds/${guildId}/roles`, { headers })
    ]);

    const guild = await guildResponse.json();
    const channels = channelsResponse.ok ? await channelsResponse.json() : [];
    const roles = rolesResponse.ok ? await rolesResponse.json() : [];

    return res.status(200).json({
      server: {
        id: guild.id,
        name: guild.name,
        icon: guild.icon
          ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.${guild.icon.startsWith("a_") ? "gif" : "png"}?size=256`
          : null,
        memberCount: guild.approximate_member_count ?? null,
        onlineCount: guild.approximate_presence_count ?? null,
        channelCount: channels.length,
        roleCount: roles.length,
        channels,
        roles
      }
    });
  } catch {
    return res.status(500).json({ error: "Internal server error" });
  }
}
