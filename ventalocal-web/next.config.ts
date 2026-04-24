import stylexPlugin from '@stylexjs/nextjs-plugin';
import type { NextConfig } from "next";
import path from 'path';

const nextConfig: NextConfig = {
  // Configuración estándar de Next.js
};

export default stylexPlugin({
  rootDir: __dirname,
  filename: 'stylex-bundle.css',
  useSWC: true,
})(nextConfig);
