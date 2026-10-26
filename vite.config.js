import { defineConfig } from 'vite';
import { reactRouter } from '@react-router/dev/vite';
import tailwindcss from '@tailwindcss/vite';
import vitePluginBundleObfuscator from 'vite-plugin-bundle-obfuscator';
import htmlMinifier from 'vite-plugin-html-minifier';

const allObfuscatorConfig = {
  excludes: [],
  enable: true,
  log: true,
  autoExcludeNodeModules: true,
  threadPool: true,
  pro: false,
  options: {
    compact: true,
    controlFlowFlattening: true,
    controlFlowFlatteningThreshold: 1,
    deadCodeInjection: false,
    debugProtection: false,
    debugProtectionInterval: 0,
    disableConsoleOutput: false,
    identifierNamesGenerator: 'hexadecimal',
    log: false,
    numbersToExpressions: false,
    renameGlobals: false,
    selfDefending: true,
    simplify: true,
    splitStrings: false,
    ignoreImports: true,
    stringArray: true,
    stringArrayCallsTransform: true,
    stringArrayCallsTransformThreshold: 0.5,
    stringArrayEncoding: [],
    stringArrayIndexShift: true,
    stringArrayRotate: true,
    stringArrayShuffle: true,
    stringArrayWrappersCount: 1,
    stringArrayWrappersChainedCalls: true,
    stringArrayWrappersParametersMaxCount: 2,
    stringArrayWrappersType: 'variable',
    stringArrayThreshold: 0.75,
    unicodeEscapeSequence: false,
  },
};

export default defineConfig({
  plugins: [
    tailwindcss(),
    reactRouter(),
    vitePluginBundleObfuscator(allObfuscatorConfig),
    htmlMinifier({
      minify: true,
      collapseWhitespace: true,
      removeComments: true,
      removeRedundantAttributes: true,
      removeScriptTypeAttributes: true,
      removeStyleLinkTypeAttributes: true,
      useShortDoctype: true,
    }),
  ],
  build: {
    target: 'esnext',
    chunkSizeWarningLimit: 800,
    sourcemap: false,
  },
  rollupOptions: {
    output: {
      manualChunks(id) {
        if (id.includes('node_modules')) {
          if (id.includes('react') || id.includes('react-dom')) {
            return 'react-vendor';
          }
          if (id.includes('lodash') || id.includes('axios')) {
            return 'utils-vendor';
          }
          if (id.includes('three') || id.includes('gsap')) {
            return 'graphics-vendor';
          }
          if (id.includes('lottie')) {
            return 'lottie-vendor';
          }
          return 'vendor';
        }
      },
      chunkFileNames: 'assets/js/[name]-[hash].js',
      entryFileNames: 'assets/js/[name]-[hash].js',
      assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
    },
  },
});
