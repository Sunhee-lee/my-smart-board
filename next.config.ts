import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/kma/:path*',
        destination: 'https://apihub.kma.go.kr/api/typ02/openApi/:path*',
      },
      {
        source: '/api/airkorea/:path*',
        destination: 'https://apis.data.go.kr/B552584/ArpltnInforInqireSvc/:path*',
      },
    ];
  },
};

export default nextConfig;
