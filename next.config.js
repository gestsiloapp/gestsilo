/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configurações necessárias para RxDB funcionar no navegador
  webpack: (config, { isServer }) => {
    // RxDB usa módulos Node que precisam ser polifillados no cliente
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;
