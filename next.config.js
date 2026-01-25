/** @type {import('next').NextConfig} */
const nextConfig = {
  // Suppress NextAuth client fetch errors in development
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  // Logging configuration
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
};

module.exports = nextConfig;
