import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

function getPreferredLanIp() {
  const interfaces = os.networkInterfaces();

  for (const entries of Object.values(interfaces)) {
    for (const entry of entries || []) {
      if (entry.internal || entry.family !== 'IPv4') {
        continue;
      }

      if (
        entry.address.startsWith('192.168.')
        || entry.address.startsWith('10.')
        || /^172\.(1[6-9]|2\d|3[0-1])\./.test(entry.address)
      ) {
        return entry.address;
      }
    }
  }

  return '127.0.0.1';
}

export function createLynxAppOptions(configUrl) {
  const appDir = path.dirname(fileURLToPath(configUrl));
  const publicHost = process.env.LYNX_DEV_HOST || getPreferredLanIp();
  const port = Number(process.env.LYNX_DEV_PORT || 3000);
  const assetPrefix = process.env.LYNX_ASSET_PREFIX || `http://${publicHost}:<port>/`;

  return {
    source: {
      entry: './src/main.ts',
    },
    server: {
      host: '0.0.0.0',
      port,
      strictPort: false,
    },
    dev: {
      assetPrefix,
    },
    resolve: {
      aliasStrategy: 'prefer-alias',
      alias: {
        '@pgg/vue-lynx': path.resolve(appDir, '../../packages/vue-lynx/src/index.ts'),
        '@pgg/vue-lynx/native-vue': path.resolve(appDir, '../../packages/vue-lynx/src/native-vue.ts'),
      },
    },
  };
}
