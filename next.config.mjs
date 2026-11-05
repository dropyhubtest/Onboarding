/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  env: {
    KOTAK_ACCOUNT_OPENING_URL: process.env.KOTAK_ACCOUNT_OPENING_URL || 'https://bit.ly/4i35J6m',
    ADMIN_SECRET_KEY: process.env.ADMIN_SECRET_KEY || 'dropyhub_admin_secure_key_2026',
  },
};

export default nextConfig;
