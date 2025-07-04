import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@mdx-js/react'],
  env: {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api',
  },
};

export default nextConfig;
