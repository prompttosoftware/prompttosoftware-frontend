import type { NextConfig } from 'next';
import withBundleAnalyzer from '@next/bundle-analyzer';

const bundleAnalyzerConfig = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig: NextConfig = {
  transpilePackages: ['@mdx-js/react'],
  
  // Add these for Kubernetes deployment
  output: 'standalone',
  trailingSlash: false,
  

  async generateBuildId() {
    return 'build-' + Date.now();
  },
  
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });
    return config;
  },
};

export default bundleAnalyzerConfig(nextConfig);
