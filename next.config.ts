import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
  remotePatterns: [
    {
      protocol: 'https',
      hostname: 'szttkfxiabqoxvrmrbxp.supabase.co',
      port: '',
      pathname: '/storage/v1/object/public/ia_bucket/**/**',
      search: '',
    },
  ],
}
};

export default nextConfig;
