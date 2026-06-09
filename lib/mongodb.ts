import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
const databaseName = process.env.MONGODB_DB || "paper_ai";

type MongoGlobal = typeof globalThis & {
  _paperAiMongoClient?: MongoClient;
  _paperAiMongoClientPromise?: Promise<MongoClient>;
};

const mongoGlobal = globalThis as MongoGlobal;

function createMongoClient() {
  if (!uri) {
    throw new Error("Missing MONGODB_URI or MONGO_URI");
  }

  return new MongoClient(uri, {
    appName: "paper-ai",
  });
}

export function getMongoClient() {
  if (process.env.NODE_ENV === "production") {
    return createMongoClient().connect();
  }

  if (!mongoGlobal._paperAiMongoClientPromise) {
    mongoGlobal._paperAiMongoClient = createMongoClient();
    mongoGlobal._paperAiMongoClientPromise =
      mongoGlobal._paperAiMongoClient.connect();
  }

  return mongoGlobal._paperAiMongoClientPromise;
}

export async function getMongoDatabase() {
  const client = await getMongoClient();
  return client.db(databaseName);
}
