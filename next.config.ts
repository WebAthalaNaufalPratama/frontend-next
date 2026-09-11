import type { NextConfig } from "next";

const wordpressUrl = process.env.NEXT_PUBLIC_WORDPRESS_URL;
const { protocol, hostname } = wordpressUrl
  ? new URL(wordpressUrl)
  : { protocol: "https:", hostname: "localhost" };

const nextConfig: NextConfig = {
  images: {
    // Gambar produk disajikan oleh WordPress, jadi host-nya harus diizinkan.
    remotePatterns: [
      {
        protocol: protocol.replace(":", "") as "http" | "https",
        hostname,
        pathname: "/wp-content/uploads/**",
      },
    ],
  },
};

export default nextConfig;
