/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["res.cloudinary.com", "lh3.googleusercontent.com"],
  },
  webpack: (config) => {
    // Normalize Windows paths to prevent escape character issues
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
