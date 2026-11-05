/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  env: {
    KOTAK_ACCOUNT_OPENING_URL: process.env.KOTAK_ACCOUNT_OPENING_URL || 'https://www.kotak811.bank.in/open-zero-balance-savings-account',
    ADMIN_SECRET_KEY: process.env.ADMIN_SECRET_KEY || 'dropyhub_admin_secure_key_2026',
  },
};

export default nextConfig;
