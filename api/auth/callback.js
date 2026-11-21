
export default async function handler(req, res) {
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

  if (
    !code ||
    !state ||
    !cookies.jony_oauth_state ||
    state !== cookies.jony_oauth_state
  ) {
    res.setHeader("Set-Cookie",
      "jony_oauth_state=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0"
    );

    return res.status(400).send("Invalid OAuth state.");
  }

  const clientId = process.env.DISCORD_CLIENT_ID;
  const clientSecret = process.env.DISCORD_CLIENT_SECRET;
  const redirectUri = process.env.DISCORD_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    return res.status(500).send("Discord OAuth is not configured.");
  }

  try {
    const params = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri
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

    res.setHeader("Set-Cookie", [
      "jony_oauth_state=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0",
      `jony_discord_token=${encodeURIComponent(tokens.access_token)}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${tokens.expires_in || 604800}`
    ]);

    return res.redirect("/");
  } catch (error) {
    res.setHeader("Set-Cookie",
      "jony_oauth_state=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0"
    );

    return res.status(500).send("Discord login failed. Please try again.");
  }
}
