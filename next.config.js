/** @type {import('next').NextConfig} */
const nextConfig = {
    env: {
        API: 'http://localhost:3001/'
    },
    output: 'export',
    images: {
        unoptimized: true
    }
}

const withPWA = require("next-pwa")({
    dest: "public",
    disable: process.env.NODE_ENV === "development",
    register: true,
    skipWaiting: true,
  });
  
module.exports = withPWA({
reactStrictMode: true,
swcMinify: true,
compiler: {
    removeConsole: process.env.NODE_ENV !== "development",
},
});

module.exports = nextConfig
