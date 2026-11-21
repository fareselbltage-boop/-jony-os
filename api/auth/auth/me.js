

module.exports = async (req, res) => {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const cookies = Object.fromEntries(
    (req.headers.cookie || "")
      .split(";")
      .map(item => item.trim().split(/=(.*)/s))
      .filter(item => item.length === 2)
      .map(([key, value]) => [key, decodeURIComponent(value)])
  );

  const token = cookies.jony_discord_token;

  if (!token) {
    return res.status(401).json({ authenticated: false });
  }

  try {
    const response = await fetch("https://discord.com/api/users/@me", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      res.setHeader("Set-Cookie",
        "jony_discord_token=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0"
      );
      return res.status(401).json({ authenticated: false });
    }

    const user = await response.json();

    return res.status(200).json({
      authenticated: true,
      user: {
        id: user.id,
        username: user.username,
        global_name: user.global_name,
        avatar: user.avatar
      }
    });
  } catch {
    return res.status(500).json({ error: "Internal server error" });
  }
};
