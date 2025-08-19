const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Minimal config - let Vercel handle everything
};

module.exports = nextConfig;
