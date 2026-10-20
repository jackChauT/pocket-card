import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Sketch uploads from /admin go through a Server Action (limit 10 MB + form overhead).
  experimental: { serverActions: { bodySizeLimit: '11mb' }, proxyClientMaxBodySize: '11mb' },
};

export default nextConfig;
