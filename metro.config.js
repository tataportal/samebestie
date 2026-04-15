const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Force Metro to use CJS versions of packages that ship ESM with import.meta.env
// (Zustand's ESM build uses import.meta.env which crashes Metro's web bundler)
config.resolver = {
  ...config.resolver,
  resolveRequest: (context, moduleName, platform) => {
    // Force CJS zustand on web to avoid import.meta.env crash
    if (platform === 'web' && moduleName === 'zustand/middleware') {
      return {
        filePath: path.resolve(__dirname, 'node_modules/zustand/middleware.js'),
        type: 'sourceFile',
      };
    }
    // Fall through to default resolver
    return context.resolveRequest(context, moduleName, platform);
  },
};

module.exports = config;
