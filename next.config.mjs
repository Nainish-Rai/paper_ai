import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: rootDir,
  images: {
    domains: ["res.cloudinary.com", "lh3.googleusercontent.com"],
  },
  webpack: (config) => {
    config.watchOptions = {
      ...config.watchOptions,
      followSymlinks: false,
    };

    config.resolve = {
      ...config.resolve,
      symlinks: false,
    };

    return config;
  },
};

export default nextConfig;
