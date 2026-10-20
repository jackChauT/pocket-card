import type { NextConfig } from 'next';

// GitHub Pages preview: static files only, served under /<repo>. See scripts/build-preview.sh.
const preview = process.env.NEXT_PUBLIC_PREVIEW === '1';

const nextConfig: NextConfig = preview
  ? {
      output: 'export',
      basePath: process.env.NEXT_PUBLIC_BASE_PATH,
      trailingSlash: true, // /en/shop/ → en/shop/index.html, which Pages serves
      images: { unoptimized: true }, // no image server on Pages
    }
  : {
      // Sketch uploads from /admin go through a Server Action (limit 10 MB + form overhead).
      experimental: { serverActions: { bodySizeLimit: '11mb' }, proxyClientMaxBodySize: '11mb' },
    };

export default nextConfig;
