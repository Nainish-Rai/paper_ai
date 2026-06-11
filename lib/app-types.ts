export type AppUser = {
  id: string;
  email: string;
  name: string | null;
  username?: string | null;
  image?: string | null;
  emailVerified?: boolean;
  createdAt?: Date | string;
  updatedAt?: Date | string;
};

export type Document = {
  id: string;
  title: string;
  content?: string | null;
  shared: boolean;
  favorite: boolean;
  roomId?: string | null;
  authorId: string;
  createdAt: Date | string;
  updatedAt: Date | string;
};

export type Template = {
  id: string;
  name: string;
  description?: string | null;
  content: string;
  version?: number;
  authorId: string;
  categories: string[];
  published: boolean;
  createdAt?: Date | string;
  updatedAt?: Date | string;
};
