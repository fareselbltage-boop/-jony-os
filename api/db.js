import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME || "jony_os";

if (!uri) {
  throw new Error("MONGODB_URI is not configured");
}

let client;
let clientPromise;

if (process.env.NODE_ENV === "development") {
  if (!globalThis.mongoClientPromise) {
    client = new MongoClient(uri);
    globalThis.mongoClientPromise = client.connect();
  }

  clientPromise = globalThis.mongoClientPromise;
} else {
  client = new MongoClient(uri);
  clientPromise = client.connect();
}

export default async function getDatabase() {
  const connectedClient = await clientPromise;
  return connectedClient.db(dbName);
}
