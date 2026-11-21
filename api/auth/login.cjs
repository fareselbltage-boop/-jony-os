const crypto = require("crypto");

module.exports = (req, res) => {
  const clientId = process.env.DISCORD_CLIENT_ID;
  const redirectUri = process.env.DISCORD_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    return res.status(500).send("Discord OAuth is not configured.");
  }

  const state = crypto.randomBytes(24).toString("hex");

  res.setHeader("Set-Cookie", [
    `jony_oauth_state=${state}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=600`
  ]);

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "identify guilds",
    state
  });

  res.redirect(`https://discord.com/oauth2/authorize?${params}`);
};
