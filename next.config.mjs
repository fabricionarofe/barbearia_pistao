/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ['washroom-trade-dodge.ngrok-free.dev', 'localhost:3000', 'localhost:3001'],
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'ngrok-skip-browser-warning',
            value: 'true',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
