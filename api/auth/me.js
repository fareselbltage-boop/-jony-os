
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
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  res.setHeader("Cache-Control", "no-store");

  const cookies = getCookies(req.headers.cookie || "");
  const token = cookies.jony_discord_token;

  if (!token) {
    return res.status(200).json({
      authenticated: false
    });
  }

  try {
    const response = await fetch(
      "https://discord.com/api/v10/users/@me",
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    if (!response.ok) {
      res.setHeader("Set-Cookie", [
        "jony_discord_token=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0"
      ]);

      return res.status(200).json({
        authenticated: false
      });
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
    return res.status(500).json({
      error: "Internal server error"
    });
  }
}
