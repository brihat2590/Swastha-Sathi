import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint:{
    ignoreDuringBuilds:true
  },
  images:{
    domains:["*"] // allow all domains
  }
};

export default nextConfig;
