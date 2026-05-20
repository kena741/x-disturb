/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  /* config options here */
  images: {
    domains: ['i.pravatar.cc'],
  },
  async rewrites() {
    return [
      {
        source: '/api/getentriesovertime',
        destination: 'https://getentriesovertime-jqk4tvz4xa-uc.a.run.app/',
      },
      {
        source: '/api/getentriesbylocation',
        destination: 'https://getentriesbylocation-jqk4tvz4xa-uc.a.run.app/',
      },
    ]
  },
}
 
module.exports = nextConfig
