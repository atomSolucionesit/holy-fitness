import type { NextConfig } from "next";
const config: NextConfig = {
  output: "standalone",
  reactStrictMode: true,
  images: { formats: ["image/avif", "image/webp"] },
};
export default config;
