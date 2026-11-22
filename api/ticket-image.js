import getDatabase from "./db.js";
import { authorizeGuild } from "./settings.js";

const MAX_DATA_URL_LENGTH = 3 * 1024 * 1024;
const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (!["GET", "POST", "DELETE"].includes(req.method)) {
    res.setHeader("Allow", "GET, POST, DELETE");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const guildId = String(req.query.id || "").trim();

  try {
    const authorization = await authorizeGuild(req, res, guildId);
    if (authorization.error) {
      return res.status(authorization.status).json({
        error: authorization.error
      });
    }

    const db = await getDatabase();
    const collection = db.collection("ticket_images");

    if (req.method === "GET") {
      const document = await collection.findOne(
        { guildId },
        { projection: { dataUrl: 1, fileName: 1, mimeType: 1, updatedAt: 1 } }
      );

      return res.status(200).json({
        image: document
          ? {
              dataUrl: document.dataUrl,
              fileName: document.fileName,
              mimeType: document.mimeType,
              updatedAt: document.updatedAt
            }
          : null
      });
    }

    if (req.method === "DELETE") {
      await collection.deleteOne({ guildId });
      return res.status(200).json({ success: true });
    }

    const dataUrl = req.body?.dataUrl;
    const fileName = String(req.body?.fileName || "ticket-image").slice(0, 120);

    if (typeof dataUrl !== "string" || dataUrl.length > MAX_DATA_URL_LENGTH) {
      return res.status(413).json({ error: "Image is too large. Maximum size is 2 MB." });
    }

    const match = dataUrl.match(/^data:(image\/(?:png|jpeg|webp));base64,([A-Za-z0-9+/=]+)$/);
    if (!match || !ALLOWED_TYPES.has(match[1])) {
      return res.status(400).json({ error: "Upload a valid PNG, JPG, or WebP image." });
    }

    const imageBuffer = Buffer.from(match[2], "base64");
    if (!imageBuffer.length || imageBuffer.length > MAX_IMAGE_BYTES) {
      return res.status(413).json({ error: "Image is too large. Maximum size is 2 MB." });
    }

    const image = {
      guildId,
      dataUrl,
      fileName,
      mimeType: match[1],
      updatedAt: new Date()
    };

    await collection.updateOne(
      { guildId },
      {
        $set: image,
        $setOnInsert: { createdAt: new Date() }
      },
      { upsert: true }
    );

    return res.status(200).json({
      success: true,
      image: {
        dataUrl,
        fileName,
        mimeType: match[1],
        updatedAt: image.updatedAt
      }
    });
  } catch (error) {
    console.error("Ticket image API error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
