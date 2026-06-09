import { Collection, ObjectId } from "mongodb";
import { getMongoDatabase } from "@/lib/mongodb";

export type ImportedChatMessage = {
  role: "user" | "assistant" | "system" | "unknown";
  content: string;
  index: number;
};

export type ImportedChat = {
  _id?: ObjectId;
  userId: string;
  documentId: string;
  source: "chatgpt";
  sourceUrl: string;
  sourceId: string;
  title: string;
  rawText: string;
  messages: ImportedChatMessage[];
  summary?: string;
  tags: string[];
  importStatus: "imported" | "partial";
  createdAt: Date;
  updatedAt: Date;
};

let indexesReady: Promise<void> | null = null;

async function getImportedChatsCollection(): Promise<Collection<ImportedChat>> {
  const db = await getMongoDatabase();
  return db.collection<ImportedChat>("imported_chats");
}

async function ensureImportedChatIndexes() {
  if (!indexesReady) {
    indexesReady = getImportedChatsCollection().then(async (collection) => {
      await Promise.all([
        collection.createIndex({ userId: 1, createdAt: -1 }),
        collection.createIndex({ documentId: 1 }, { unique: true }),
        collection.createIndex(
          { source: 1, sourceId: 1, userId: 1 },
          { unique: true }
        ),
      ]);
    });
  }

  return indexesReady;
}

export async function findImportedChatBySource(
  userId: string,
  sourceId: string
) {
  await ensureImportedChatIndexes();
  const collection = await getImportedChatsCollection();

  return collection.findOne({
    userId,
    source: "chatgpt",
    sourceId,
  });
}

export async function saveImportedChat(importedChat: ImportedChat) {
  await ensureImportedChatIndexes();
  const collection = await getImportedChatsCollection();

  const result = await collection.insertOne(importedChat);

  return {
    ...importedChat,
    _id: result.insertedId,
  };
}
