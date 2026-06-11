import { ObjectId } from "mongodb";
import { getMongoDatabase } from "@/lib/mongodb";

type AnyRecord = Record<string, any>;

type UserRecord = {
  _id?: ObjectId;
  id: string;
  email: string;
  name?: string | null;
  username?: string | null;
  image?: string | null;
  password?: string | null;
  emailVerified?: boolean;
  createdAt: Date;
  updatedAt: Date;
};

type DocumentPermissionRecord = {
  id: string;
  documentId: string;
  userId: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
};

type DocumentRecord = {
  _id?: ObjectId;
  id: string;
  title: string;
  content?: string | null;
  shared: boolean;
  favorite: boolean;
  roomId?: string | null;
  authorId: string;
  permissions: DocumentPermissionRecord[];
  createdAt: Date;
  updatedAt: Date;
};

type TemplateRecord = {
  _id?: ObjectId;
  id: string;
  name: string;
  description?: string | null;
  content: string;
  version: number;
  authorId: string;
  categories: string[];
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
};

let indexesReady: Promise<void> | null = null;

async function getCollections() {
  const db = await getMongoDatabase();
  return {
    users: db.collection<UserRecord>("users"),
    documents: db.collection<DocumentRecord>("documents"),
    templates: db.collection<TemplateRecord>("templates"),
  };
}

async function ensureIndexes() {
  if (!indexesReady) {
    indexesReady = getCollections().then(async ({ users, documents, templates }) => {
      await Promise.all([
        users.createIndex({ email: 1 }, { unique: true }),
        users.createIndex({ id: 1 }, { unique: true }),
        users.createIndex({ username: 1 }, { unique: true, sparse: true }),
        documents.createIndex({ id: 1 }, { unique: true }),
        documents.createIndex({ authorId: 1, updatedAt: -1 }),
        documents.createIndex({ shared: 1, updatedAt: -1 }),
        documents.createIndex({ "permissions.userId": 1, updatedAt: -1 }),
        templates.createIndex({ id: 1 }, { unique: true }),
        templates.createIndex({ authorId: 1 }),
        templates.createIndex({ published: 1 }),
      ]);
    });
  }

  return indexesReady;
}

function makeId() {
  return new ObjectId().toString();
}

function toDate(value: unknown) {
  return value instanceof Date ? value : new Date(String(value));
}

function normalizeUser(user: UserRecord | null) {
  if (!user) return null;

  return {
    id: user.id,
    email: user.email,
    name: user.name ?? null,
    username: user.username ?? null,
    image: user.image ?? null,
    password: user.password ?? null,
    emailVerified: user.emailVerified ?? false,
    createdAt: toDate(user.createdAt),
    updatedAt: toDate(user.updatedAt),
  };
}

async function hydrateDocument(document: DocumentRecord | null) {
  if (!document) return null;

  const { users } = await getCollections();
  const author = normalizeUser(await users.findOne({ id: document.authorId }));
  const permissions = await Promise.all(
    (document.permissions ?? []).map(async (permission) => ({
      ...permission,
      user: normalizeUser(await users.findOne({ id: permission.userId })),
    }))
  );

  return {
    id: document.id,
    title: document.title,
    content: document.content ?? null,
    shared: document.shared ?? false,
    favorite: document.favorite ?? false,
    roomId: document.roomId ?? null,
    authorId: document.authorId,
    createdAt: toDate(document.createdAt),
    updatedAt: toDate(document.updatedAt),
    author: author
      ? {
          id: author.id,
          name: author.name,
          email: author.email,
          image: author.image,
        }
      : null,
    permissions,
  };
}

async function hydrateTemplate(template: TemplateRecord | null) {
  if (!template) return null;

  const { users } = await getCollections();
  const author = normalizeUser(await users.findOne({ id: template.authorId }));

  return {
    id: template.id,
    name: template.name,
    description: template.description ?? null,
    content: template.content,
    version: template.version ?? 1,
    authorId: template.authorId,
    categories: template.categories ?? [],
    published: template.published ?? false,
    createdAt: toDate(template.createdAt),
    updatedAt: toDate(template.updatedAt),
    author: author
      ? {
          id: author.id,
          name: author.name,
          image: author.image,
        }
      : null,
  };
}

function userFilter(where: AnyRecord = {}) {
  if (where.id) return { id: where.id };
  if (where.email) return { email: where.email };
  if (where.username) return { username: where.username };
  return where;
}

function documentMatches(document: DocumentRecord, where: AnyRecord = {}): boolean {
  if (!where || Object.keys(where).length === 0) return true;

  if (where.AND) {
    return where.AND.every((item: AnyRecord) => documentMatches(document, item));
  }

  if (where.OR) {
    return where.OR.some((item: AnyRecord) => documentMatches(document, item));
  }

  if (where.NOT && documentMatches(document, where.NOT)) return false;
  if (where.id && document.id !== where.id) return false;
  if (where.authorId && document.authorId !== where.authorId) return false;
  if (typeof where.shared === "boolean" && document.shared !== where.shared) {
    return false;
  }
  if (
    typeof where.favorite === "boolean" &&
    document.favorite !== where.favorite
  ) {
    return false;
  }
  if (where.title?.contains && !contains(document.title, where.title.contains)) {
    return false;
  }
  if (
    where.content?.contains &&
    !contains(document.content ?? "", where.content.contains)
  ) {
    return false;
  }
  if (where.permissions?.some) {
    const permissionWhere = where.permissions.some;
    const hasPermission = (document.permissions ?? []).some((permission) => {
      if (permissionWhere.userId && permission.userId !== permissionWhere.userId) {
        return false;
      }
      if (permissionWhere.role && permission.role !== permissionWhere.role) {
        return false;
      }
      return true;
    });

    if (!hasPermission) return false;
  }

  return true;
}

function templateMatches(template: TemplateRecord, where: AnyRecord = {}) {
  if (!where || Object.keys(where).length === 0) return true;

  if (where.OR) {
    return where.OR.some((item: AnyRecord) => templateMatches(template, item));
  }

  if (where.id && template.id !== where.id) return false;
  if (where.authorId && template.authorId !== where.authorId) return false;
  if (
    typeof where.published === "boolean" &&
    template.published !== where.published
  ) {
    return false;
  }

  return true;
}

function contains(value: string, query: string) {
  return value.toLowerCase().includes(String(query).toLowerCase());
}

function sortItems<T extends AnyRecord>(items: T[], orderBy: AnyRecord | AnyRecord[] = {}) {
  const orders = Array.isArray(orderBy) ? orderBy : [orderBy];
  const cleanOrders = orders.filter(Boolean);

  if (cleanOrders.length === 0) return items;

  return [...items].sort((left, right) => {
    for (const order of cleanOrders) {
      const [key, direction] = Object.entries(order)[0] ?? [];
      if (!key) continue;

      const leftValue = left[key] instanceof Date ? left[key].getTime() : left[key];
      const rightValue =
        right[key] instanceof Date ? right[key].getTime() : right[key];

      if (leftValue === rightValue) continue;
      const comparison = leftValue > rightValue ? 1 : -1;
      return direction === "desc" ? comparison * -1 : comparison;
    }

    return 0;
  });
}

function applySelect(item: AnyRecord | null, select?: AnyRecord) {
  if (!item || !select) return item;

  return Object.fromEntries(
    Object.entries(select)
      .filter(([, enabled]) => enabled)
      .map(([key]) => [key, item[key]])
  );
}

function pickDocumentFields(document: AnyRecord | null, select?: AnyRecord) {
  return applySelect(document, select);
}

function permissionMatches(
  permission: DocumentPermissionRecord,
  where: AnyRecord = {}
) {
  if (where.id && permission.id !== where.id) return false;
  if (where.documentId && permission.documentId !== where.documentId) {
    return false;
  }
  if (where.userId && permission.userId !== where.userId) return false;
  if (where.documentId_userId) {
    if (permission.documentId !== where.documentId_userId.documentId) return false;
    if (permission.userId !== where.documentId_userId.userId) return false;
  }

  return true;
}

async function allPermissions() {
  const { documents } = await getCollections();
  const docs = await documents.find({}).toArray();
  return docs.flatMap((document) => document.permissions ?? []);
}

async function hydratePermission(permission: DocumentPermissionRecord | null) {
  if (!permission) return null;

  const { users } = await getCollections();
  return {
    ...permission,
    user: normalizeUser(await users.findOne({ id: permission.userId })),
  };
}

export const db = {
  user: {
    async findUnique(args: AnyRecord) {
      await ensureIndexes();
      const { users } = await getCollections();
      const user = normalizeUser(await users.findOne(userFilter(args.where)));
      return applySelect(user, args.select);
    },

    async findFirst(args: AnyRecord) {
      await ensureIndexes();
      const { users } = await getCollections();
      const user = normalizeUser(await users.findOne(userFilter(args.where)));
      return applySelect(user, args.select);
    },

    async create(args: AnyRecord) {
      await ensureIndexes();
      const { users } = await getCollections();
      const now = new Date();
      const id = args.data.id ?? makeId();
      const user: UserRecord = {
        id,
        email: args.data.email,
        name: args.data.name ?? null,
        username: args.data.username ?? null,
        image: args.data.image ?? null,
        password: args.data.password ?? null,
        emailVerified: args.data.emailVerified ?? false,
        createdAt: args.data.createdAt ?? now,
        updatedAt: args.data.updatedAt ?? now,
      };

      await users.insertOne(user);
      return normalizeUser(user);
    },

    async update(args: AnyRecord) {
      await ensureIndexes();
      const { users } = await getCollections();
      const now = new Date();
      await users.updateOne(userFilter(args.where), {
        $set: {
          ...args.data,
          updatedAt: now,
        },
      });

      const user = normalizeUser(await users.findOne(userFilter(args.where)));
      return applySelect(user, args.select);
    },
  },

  document: {
    async create(args: AnyRecord) {
      await ensureIndexes();
      const { documents } = await getCollections();
      const now = new Date();
      const id = args.data.id ?? makeId();
      const document: DocumentRecord = {
        id,
        title: args.data.title,
        content: args.data.content ?? "[]",
        shared: args.data.shared ?? false,
        favorite: args.data.favorite ?? false,
        roomId: args.data.roomId ?? null,
        authorId: args.data.authorId,
        permissions: [],
        createdAt: args.data.createdAt ?? now,
        updatedAt: args.data.updatedAt ?? now,
      };

      await documents.insertOne(document);
      return hydrateDocument(document);
    },

    async findUnique(args: AnyRecord) {
      await ensureIndexes();
      const { documents } = await getCollections();
      const document = await documents.findOne({ id: args.where.id });
      const hydrated = await hydrateDocument(document);
      return pickDocumentFields(hydrated, args.select);
    },

    async findMany(args: AnyRecord = {}) {
      await ensureIndexes();
      const { documents } = await getCollections();
      const allDocuments = await documents.find({}).toArray();
      const matchedDocuments = allDocuments.filter((document) =>
        documentMatches(document, args.where)
      );
      const sortedDocuments = sortItems(matchedDocuments, args.orderBy);
      const limitedDocuments = args.take
        ? sortedDocuments.slice(0, args.take)
        : sortedDocuments;
      const hydratedDocuments = await Promise.all(
        limitedDocuments.map((document) => hydrateDocument(document))
      );

      return hydratedDocuments.map((document) =>
        pickDocumentFields(document, args.select)
      );
    },

    async update(args: AnyRecord) {
      await ensureIndexes();
      const { documents } = await getCollections();
      const now = new Date();
      await documents.updateOne(
        { id: args.where.id },
        {
          $set: {
            ...args.data,
            updatedAt: args.data.updatedAt ?? now,
          },
        }
      );

      return hydrateDocument(await documents.findOne({ id: args.where.id }));
    },

    async delete(args: AnyRecord) {
      await ensureIndexes();
      const { documents } = await getCollections();
      const existing = await documents.findOne({ id: args.where.id });
      await documents.deleteOne({ id: args.where.id });
      return hydrateDocument(existing);
    },
  },

  documentPermission: {
    async findUnique(args: AnyRecord) {
      await ensureIndexes();
      const permissions = await allPermissions();
      return hydratePermission(
        permissions.find((permission) =>
          permissionMatches(permission, args.where)
        ) ?? null
      );
    },

    async findMany(args: AnyRecord = {}) {
      await ensureIndexes();
      const permissions = await allPermissions();
      const matchedPermissions = permissions.filter((permission) =>
        permissionMatches(permission, args.where)
      );
      return Promise.all(
        matchedPermissions.map((permission) => hydratePermission(permission))
      );
    },

    async create(args: AnyRecord) {
      await ensureIndexes();
      const { documents } = await getCollections();
      const now = new Date();
      const permission: DocumentPermissionRecord = {
        id: makeId(),
        documentId: args.data.documentId,
        userId: args.data.userId,
        role: args.data.role,
        createdAt: now,
        updatedAt: now,
      };

      await documents.updateOne(
        { id: permission.documentId },
        {
          $push: {
            permissions: permission,
          },
          $set: {
            updatedAt: now,
          },
        }
      );

      return hydratePermission(permission);
    },

    async update(args: AnyRecord) {
      await ensureIndexes();
      const { documents } = await getCollections();
      const permissions = await allPermissions();
      const existing = permissions.find((permission) =>
        permissionMatches(permission, args.where)
      );

      if (!existing) return null;

      const now = new Date();
      await documents.updateOne(
        { id: existing.documentId, "permissions.id": existing.id },
        {
          $set: {
            "permissions.$.role": args.data.role ?? existing.role,
            "permissions.$.updatedAt": now,
            updatedAt: now,
          },
        }
      );

      return hydratePermission({
        ...existing,
        ...args.data,
        updatedAt: now,
      });
    },

    async upsert(args: AnyRecord) {
      await ensureIndexes();
      const existing = await db.documentPermission.findUnique({
        where: args.where,
      });

      if (existing) {
        return db.documentPermission.update({
          where: { id: existing.id },
          data: args.update,
        });
      }

      return db.documentPermission.create({
        data: args.create,
      });
    },

    async deleteMany(args: AnyRecord = {}) {
      await ensureIndexes();
      const { documents } = await getCollections();
      const permissions = await allPermissions();
      const matchedPermissions = permissions.filter((permission) =>
        permissionMatches(permission, args.where)
      );

      await Promise.all(
        matchedPermissions.map((permission) =>
          documents.updateOne(
            { id: permission.documentId },
            {
              $pull: {
                permissions: { id: permission.id },
              },
            }
          )
        )
      );

      return { count: matchedPermissions.length };
    },
  },

  template: {
    async findUnique(args: AnyRecord) {
      await ensureIndexes();
      const { templates } = await getCollections();
      return hydrateTemplate(await templates.findOne({ id: args.where.id }));
    },

    async findMany(args: AnyRecord = {}) {
      await ensureIndexes();
      const { templates } = await getCollections();
      const allTemplates = await templates.find({}).toArray();
      const matchedTemplates = allTemplates.filter((template) =>
        templateMatches(template, args.where)
      );
      return Promise.all(matchedTemplates.map((template) => hydrateTemplate(template)));
    },

    async create(args: AnyRecord) {
      await ensureIndexes();
      const { templates } = await getCollections();
      const now = new Date();
      const template: TemplateRecord = {
        id: args.data.id ?? makeId(),
        name: args.data.name,
        description: args.data.description ?? null,
        content: args.data.content,
        version: args.data.version ?? 1,
        authorId: args.data.authorId,
        categories: args.data.categories ?? [],
        published: args.data.published ?? false,
        createdAt: now,
        updatedAt: now,
      };

      await templates.insertOne(template);
      return hydrateTemplate(template);
    },

    async update(args: AnyRecord) {
      await ensureIndexes();
      const { templates } = await getCollections();
      const now = new Date();
      await templates.updateOne(
        { id: args.where.id },
        {
          $set: {
            ...args.data,
            updatedAt: now,
          },
        }
      );

      return hydrateTemplate(await templates.findOne({ id: args.where.id }));
    },

    async delete(args: AnyRecord) {
      await ensureIndexes();
      const { templates } = await getCollections();
      const existing = await templates.findOne({ id: args.where.id });
      await templates.deleteOne({ id: args.where.id });
      return hydrateTemplate(existing);
    },
  },
} as any;

export default db;
