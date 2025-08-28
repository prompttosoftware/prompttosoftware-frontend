import type { NextConfig } from 'next';
import withBundleAnalyzer from '@next/bundle-analyzer';
import path from 'path';

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
      test: /\.svg$/i,
      include: path.resolve(__dirname, 'src/lib/icons'),
      use: ['@svgr/webpack'],
    });

    return config;
  },
};

export default bundleAnalyzerConfig(nextConfig);
