import { MongoClient } from "mongodb";

const localMongoUri =
  process.env.LOCAL_MONGODB_URI || "mongodb://127.0.0.1:27017";
const configuredMongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
const uri =
  process.env.NODE_ENV === "development"
    ? localMongoUri
    : configuredMongoUri || localMongoUri;
const databaseName = process.env.MONGODB_DB || "paper_ai";

type MongoGlobal = typeof globalThis & {
  _paperAiMongoClient?: MongoClient;
  _paperAiMongoClientPromise?: Promise<MongoClient>;
};

const mongoGlobal = globalThis as MongoGlobal;

function createMongoClient() {
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
