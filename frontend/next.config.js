/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  env: {
    NEXT_PUBLIC_API_URL:
      process.env.NEXT_PUBLIC_API_URL ||
      (process.env.NODE_ENV === 'production'
        ? 'https://studyos-5r51.onrender.com/api/v1'
        : 'http://localhost:5000/api/v1'),
  },
};

module.exports = nextConfig;
