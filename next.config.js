/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: process.env.R2_PUBLIC_HOSTNAME || 'pub-d94179fb37354f7894cc771aed26649a.r2.dev',
      },
    ],
  },
}

module.exports = nextConfig
