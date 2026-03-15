import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "assets.classy.org" },
      { protocol: "https", hostname: "d2g8igdw686xgo.cloudfront.net" },
      { protocol: "https", hostname: "d25oniaj7o2jcw.cloudfront.net" },
      { protocol: "https", hostname: "images.pexels.com" },
      { protocol: "https", hostname: "pics.paypal.com" },
      { protocol: "https", hostname: "i.pravatar.cc" },
      { protocol: "https", hostname: "image.mux.com" },
      { protocol: "https", hostname: "gofundme.com" },
    ],
  },
};

export default nextConfig;
