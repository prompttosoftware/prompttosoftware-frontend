/** @type {import('next').NextConfig} */
const nextConfig = {
  compiler: {
    removeConsole: {
      exclude: ['error'],
    },
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        minSize: 20000,
        maxAsyncRequests: 30,
        maxInitialRequests: 30,
        enforceSizeThreshold: 50000,
        cacheGroups: {
          default: {
            minChunks: 1,
            priority: -20,
            reuseExistingChunk: true,
          },
          defaultVendors: {
            test: /[\/]node_modules[\/]/,
            priority: -10,
            reuseExistingChunk: true,
          },
          react: {
            test: /[\/]node_modules[\/](react|react-dom|react-query|next)[\/]/,
            name: 'react',
            chunks: 'all',
            priority: 10,
          },
        },
      };
    }
    return config;
  },
};

module.exports = {
  ...nextConfig,
  env: {
    NEXT_PUBLIC_API_BASE_URL: 'http://developer:8080/api',
  },
};
