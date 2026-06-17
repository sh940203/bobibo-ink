/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        // 換成你的 R2 Public URL hostname，例如 pub-xxxxxx.r2.dev
        hostname: process.env.R2_PUBLIC_HOSTNAME || 'pub-xxxxxx.r2.dev',
      },
    ],
  },
}

module.exports = nextConfig
