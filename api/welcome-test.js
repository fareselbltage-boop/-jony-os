import { ObjectId } from "mongodb";
import getDatabase from "./db.js";
import { authorizeGuild } from "./settings.js";

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (!["POST", "GET"].includes(req.method)) {
    res.setHeader("Allow", "POST, GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const guildId = String(req.query.id || "").trim();

  try {
    const authorization = await authorizeGuild(req, res, guildId);
    if (authorization.error) {
      return res.status(authorization.status).json({ error: authorization.error });
    }

    const db = await getDatabase();
    const collection = db.collection("welcome_test_requests");

    if (req.method === "POST") {
      const now = new Date();
      const request = {
        guildId,
        requestedBy: authorization.guild.id,
        status: "pending",
        createdAt: now,
        expiresAt: new Date(now.getTime() + 90000),
        result: null
      };

      const inserted = await collection.insertOne(request);
      return res.status(202).json({
        success: true,
        requestId: inserted.insertedId.toString()
      });
    }

    const requestId = String(req.query.requestId || "");
    if (!ObjectId.isValid(requestId)) {
      return res.status(400).json({ error: "Invalid request ID" });
    }

    const request = await collection.findOne({
      _id: new ObjectId(requestId),
      guildId
    });

    if (!request) {
      return res.status(404).json({ error: "Test request not found" });
    }

    return res.status(200).json({
      status: request.status,
      result: request.result || null
    });
  } catch (error) {
    console.error("Welcome test API error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
