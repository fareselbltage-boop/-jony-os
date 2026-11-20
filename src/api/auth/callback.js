
module.exports = async (req, res) => {
  if (req.method !== "GET") {
    return res.status(405).send("Method not allowed");
  }

  const cookies = Object.fromEntries(
    (req.headers.cookie || "")
      .split(";")
      .map(item => item.trim().split(/=(.*)/s))
      .filter(item => item.length === 2)
      .map(([key, value]) => [key, decodeURIComponent(value)])
  );

  const { code, state } = req.query;

  if (!code || !state || !cookies.jony_oauth_state ||
      state !== cookies.jony_oauth_state) {
    res.setHeader("Set-Cookie",
      "jony_oauth_state=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0"
    );
    return res.status(400).send("Invalid OAuth state.");
  }

  try {
    const params = new URLSearchParams({
      client_id: process.env.DISCORD_CLIENT_ID,
      client_secret: process.env.DISCORD_CLIENT_SECRET,
      grant_type: "authorization_code",
      code,
      redirect_uri: process.env.DISCORD_REDIRECT_URI
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

    if (!tokenResponse.ok || !tokens.access_token) {
      throw new Error("Token exchange failed");
    }

    const userResponse = await fetch(
      "https://discord.com/api/users/@me",
      {
        headers: {
          Authorization: `Bearer ${tokens.access_token}`
        }
      }
    );

    if (!userResponse.ok) {
      throw new Error("Could not fetch Discord user");
    }

    const user = await userResponse.json();

    res.setHeader("Set-Cookie", [
      `jony_oauth_state=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`,
      `jony_discord_token=${encodeURIComponent(tokens.access_token)}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${tokens.expires_in || 604800}`
    ]);

    return res.redirect("/");
  } catch (error) {
    res.setHeader("Set-Cookie",
      "jony_oauth_state=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0"
    );
    return res.status(500).send("Discord login failed. Please try again.");
  }
};
